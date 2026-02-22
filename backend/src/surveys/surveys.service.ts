// ─────────────────────────────────────────────────────────────────────────────
// SurveysService — Anonymous employee pulse survey management
// ─────────────────────────────────────────────────────────────────────────────
// Business rules:
//   • Admin/HR create surveys with questions
//   • Any authenticated user can submit anonymous responses
//   • Responses have NO employeeId — fully anonymous
//   • Results are aggregated (avg score for RATING, counts for choices)
// ─────────────────────────────────────────────────────────────────────────────

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
import {
  CreateSurveyDto,
  UpdateSurveyDto,
  SubmitSurveyDto,
  QuerySurveyDto,
} from './dto';

@Injectable()
export class SurveysService {
  private readonly logger = new Logger(SurveysService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSurveyDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const survey = await this.prisma.survey.create({
      data: {
        title: dto.title,
        startDate,
        endDate,
        questions: {
          create: dto.questions.map((q, idx) => ({
            question: q.question,
            type: q.type ?? 'RATING',
            sortOrder: q.sortOrder ?? idx,
          })),
        },
      },
      include: { questions: { orderBy: { sortOrder: 'asc' } } },
    });

    this.logger.log(
      `Survey created: "${survey.title}" with ${dto.questions.length} questions`,
    );
    return survey;
  }

  async findAll(query: QuerySurveyDto) {
    const { page = 1, limit = 20, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SurveyWhereInput = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [data, total] = await Promise.all([
      this.prisma.survey.findMany({
        where,
        skip,
        take: limit,
        include: {
          questions: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { questions: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.survey.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const survey = await this.prisma.survey.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
          include: { _count: { select: { responses: true } } },
        },
      },
    });
    if (!survey) throw new NotFoundException(`Survey #${id} not found`);
    return survey;
  }

  async update(id: number, dto: UpdateSurveyDto) {
    await this.findOne(id);

    const data: Prisma.SurveyUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);

    return this.prisma.survey.update({
      where: { id },
      data,
      include: { questions: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.survey.delete({ where: { id } });
    this.logger.log(`Survey #${id} deleted`);
    return { message: `Survey #${id} deleted` };
  }

  /** Submit anonymous responses to a survey */
  async submitResponses(surveyId: number, dto: SubmitSurveyDto) {
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
      include: { questions: true },
    });

    if (!survey) throw new NotFoundException(`Survey #${surveyId} not found`);
    if (!survey.isActive) {
      throw new BadRequestException('This survey is no longer active');
    }

    const now = new Date();
    if (now < survey.startDate || now > survey.endDate) {
      throw new BadRequestException(
        'This survey is not currently accepting responses',
      );
    }

    // Validate all questionIds belong to this survey
    const validQuestionIds = new Set(survey.questions.map((q) => q.id));
    for (const answer of dto.answers) {
      if (!validQuestionIds.has(answer.questionId)) {
        throw new BadRequestException(
          `Question #${answer.questionId} does not belong to survey #${surveyId}`,
        );
      }
    }

    // Create all responses in a transaction — anonymous (no employeeId)
    const responses = await this.prisma.$transaction(
      dto.answers.map((a) =>
        this.prisma.surveyResponse.create({
          data: {
            questionId: a.questionId,
            answer: a.answer,
          },
        }),
      ),
    );

    this.logger.log(
      `${responses.length} anonymous responses submitted for survey #${surveyId}`,
    );
    return {
      message: `${responses.length} responses submitted`,
      count: responses.length,
    };
  }

  /** Get aggregated results for a survey */
  async getResults(surveyId: number) {
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
          include: { responses: true },
        },
      },
    });

    if (!survey) throw new NotFoundException(`Survey #${surveyId} not found`);

    const results = survey.questions.map((q) => {
      const responses = q.responses;
      const totalResponses = responses.length;

      if (q.type === 'RATING') {
        const numericAnswers = responses
          .map((r) => parseFloat(r.answer))
          .filter((n) => !isNaN(n));
        const avg =
          numericAnswers.length > 0
            ? Number(
                (
                  numericAnswers.reduce((sum, n) => sum + n, 0) /
                  numericAnswers.length
                ).toFixed(2),
              )
            : 0;

        return {
          questionId: q.id,
          question: q.question,
          type: q.type,
          totalResponses,
          averageScore: avg,
        };
      }

      // For TEXT / MULTIPLE_CHOICE — return frequency counts
      const answerCounts: Record<string, number> = {};
      for (const r of responses) {
        answerCounts[r.answer] = (answerCounts[r.answer] || 0) + 1;
      }

      return {
        questionId: q.id,
        question: q.question,
        type: q.type,
        totalResponses,
        answerDistribution: answerCounts,
      };
    });

    return { survey: { id: survey.id, title: survey.title }, results };
  }
}
