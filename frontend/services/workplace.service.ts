// ─────────────────────────────────────────────────────────────────────────────
// services/workplace.service.ts — Documents, Benefits, Shifts, Announcements
// ─────────────────────────────────────────────────────────────────────────────
import type { ApiFetch, buildQuery } from './http'
import type { PaginatedResponse } from '~/types/common'
import type {
  Document, BenefitPlan, BenefitEnrollment,
  Shift, ShiftAssignment, Announcement,
} from '~/types/workplace'

export const createWorkplaceService = (fetch: ApiFetch, query: typeof buildQuery) => ({
  // ── Documents ──────────────────────────────────────────────────────────────
  documents: {
    list: (params?: Record<string, any>) =>
      fetch<PaginatedResponse<Document>>(`/documents${query(params)}`),
    create: (body: Partial<Document>) =>
      fetch<Document>('/documents', { method: 'POST', body }),
    update: (id: number, body: Partial<Document>) =>
      fetch<Document>(`/documents/${id}`, { method: 'PATCH', body }),
    remove: (id: number) =>
      fetch<void>(`/documents/${id}`, { method: 'DELETE' }),
  },

  // ── Benefits ───────────────────────────────────────────────────────────────
  benefits: {
    listPlans: (params?: Record<string, any>) =>
      fetch<PaginatedResponse<BenefitPlan>>(`/benefits/plans${query(params)}`),
    createPlan: (body: Partial<BenefitPlan>) =>
      fetch<BenefitPlan>('/benefits/plans', { method: 'POST', body }),
    updatePlan: (id: number, body: Partial<BenefitPlan>) =>
      fetch<BenefitPlan>(`/benefits/plans/${id}`, { method: 'PATCH', body }),
    removePlan: (id: number) =>
      fetch<void>(`/benefits/plans/${id}`, { method: 'DELETE' }),
    enroll: (planId: number, employeeId: number, startDate: string) =>
      fetch<BenefitEnrollment>(`/benefits/plans/${planId}/enroll`, { method: 'POST', body: { employeeId, startDate } }),
    unenroll: (enrollmentId: number) =>
      fetch<BenefitEnrollment>(`/benefits/enrollments/${enrollmentId}/unenroll`, { method: 'PATCH', body: {} }),
  },

  // ── Shifts ─────────────────────────────────────────────────────────────────
  shifts: {
    list: () => fetch<Shift[]>('/shifts'),
    create: (body: Partial<Shift>) =>
      fetch<Shift>('/shifts', { method: 'POST', body }),
    update: (id: number, body: Partial<Shift>) =>
      fetch<Shift>(`/shifts/${id}`, { method: 'PATCH', body }),
    remove: (id: number) =>
      fetch<void>(`/shifts/${id}`, { method: 'DELETE' }),
    schedule: (params?: Record<string, any>) =>
      fetch<ShiftAssignment[]>(`/shifts/schedule${query(params)}`),
    assign: (body: { shiftId: number; employeeId: number; date: string; note?: string }) =>
      fetch<ShiftAssignment>('/shifts/assign', { method: 'POST', body }),
  },

  // ── Announcements ──────────────────────────────────────────────────────────
  announcements: {
    list: (params?: Record<string, any>) =>
      fetch<PaginatedResponse<Announcement>>(`/announcements${query(params)}`),
    create: (body: Partial<Announcement>) =>
      fetch<Announcement>('/announcements', { method: 'POST', body }),
    update: (id: number, body: Partial<Announcement>) =>
      fetch<Announcement>(`/announcements/${id}`, { method: 'PATCH', body }),
    archive: (id: number) =>
      fetch<Announcement>(`/announcements/${id}/archive`, { method: 'PATCH', body: {} }),
    remove: (id: number) =>
      fetch<void>(`/announcements/${id}`, { method: 'DELETE' }),
  },
})

export type WorkplaceService = ReturnType<typeof createWorkplaceService>
