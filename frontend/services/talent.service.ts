// ─────────────────────────────────────────────────────────────────────────────
// services/talent.service.ts — Overtime, Recruitment, Training, Goals
// ─────────────────────────────────────────────────────────────────────────────
import type { ApiFetch, buildQuery } from './http'
import type { PaginatedResponse } from '~/types/common'
import type {
  OvertimeRequest, TimesheetEntry,
  JobPosting, Applicant,
  TrainingCourse, TrainingEnrollment,
  Goal, KeyResult,
} from '~/types/talent'

export const createTalentService = (fetch: ApiFetch, query: typeof buildQuery) => ({
  // ── Overtime ───────────────────────────────────────────────────────────────
  overtime: {
    listRequests: (params?: Record<string, any>) =>
      fetch<PaginatedResponse<OvertimeRequest>>(`/overtime/requests${query(params)}`),
    createRequest: (body: { employeeId: number; date: string; hours: number; reason?: string }) =>
      fetch<OvertimeRequest>('/overtime/requests', { method: 'POST', body }),
    approve: (id: number) =>
      fetch<OvertimeRequest>(`/overtime/requests/${id}/approve`, { method: 'PATCH', body: {} }),
    reject: (id: number) =>
      fetch<OvertimeRequest>(`/overtime/requests/${id}/reject`, { method: 'PATCH', body: {} }),
    clockIn: () =>
      fetch<TimesheetEntry>('/overtime/clock-in', { method: 'POST', body: {} }),
    clockOut: () =>
      fetch<TimesheetEntry>('/overtime/clock-out', { method: 'POST', body: {} }),
    timesheet: (params?: Record<string, any>) =>
      fetch<TimesheetEntry[]>(`/overtime/timesheet${query(params)}`),
  },

  // ── Recruitment ────────────────────────────────────────────────────────────
  recruitment: {
    listPostings: (params?: Record<string, any>) =>
      fetch<PaginatedResponse<JobPosting>>(`/recruitment/postings${query(params)}`),
    getPosting: (id: number) =>
      fetch<JobPosting>(`/recruitment/postings/${id}`),
    createPosting: (body: Partial<JobPosting>) =>
      fetch<JobPosting>('/recruitment/postings', { method: 'POST', body }),
    updatePosting: (id: number, body: Partial<JobPosting>) =>
      fetch<JobPosting>(`/recruitment/postings/${id}`, { method: 'PATCH', body }),
    removePosting: (id: number) =>
      fetch<void>(`/recruitment/postings/${id}`, { method: 'DELETE' }),
    createApplicant: (postingId: number, body: Partial<Applicant>) =>
      fetch<Applicant>(`/recruitment/postings/${postingId}/applicants`, { method: 'POST', body }),
    updateStage: (applicantId: number, stage: string) =>
      fetch<Applicant>(`/recruitment/applicants/${applicantId}/stage`, { method: 'PATCH', body: { stage } }),
  },

  // ── Training ───────────────────────────────────────────────────────────────
  training: {
    listCourses: (params?: Record<string, any>) =>
      fetch<PaginatedResponse<TrainingCourse>>(`/training/courses${query(params)}`),
    createCourse: (body: Partial<TrainingCourse>) =>
      fetch<TrainingCourse>('/training/courses', { method: 'POST', body }),
    updateCourse: (id: number, body: Partial<TrainingCourse>) =>
      fetch<TrainingCourse>(`/training/courses/${id}`, { method: 'PATCH', body }),
    removeCourse: (id: number) =>
      fetch<void>(`/training/courses/${id}`, { method: 'DELETE' }),
    enroll: (courseId: number, employeeId: number) =>
      fetch<TrainingEnrollment>(`/training/courses/${courseId}/enroll`, { method: 'POST', body: { employeeId } }),
    updateEnrollment: (enrollmentId: number, body: Partial<TrainingEnrollment>) =>
      fetch<TrainingEnrollment>(`/training/enrollments/${enrollmentId}`, { method: 'PATCH', body }),
  },

  // ── Goals (OKR) ────────────────────────────────────────────────────────────
  goals: {
    list: (params?: Record<string, any>) =>
      fetch<PaginatedResponse<Goal>>(`/goals${query(params)}`),
    get: (id: number) => fetch<Goal>(`/goals/${id}`),
    create: (body: Partial<Goal>) =>
      fetch<Goal>('/goals', { method: 'POST', body }),
    update: (id: number, body: Partial<Goal>) =>
      fetch<Goal>(`/goals/${id}`, { method: 'PATCH', body }),
    updateKeyResult: (krId: number, body: Partial<KeyResult>) =>
      fetch<KeyResult>(`/goals/key-results/${krId}`, { method: 'PATCH', body }),
    remove: (id: number) =>
      fetch<void>(`/goals/${id}`, { method: 'DELETE' }),
  },
})

export type TalentService = ReturnType<typeof createTalentService>
