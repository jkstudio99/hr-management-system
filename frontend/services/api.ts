// ─────────────────────────────────────────────────────────────────────────────
// services/api.ts — Unified API service composer
// Composes all domain services into a single typed object.
// Pages use: const api = useApiService()
// ─────────────────────────────────────────────────────────────────────────────
import { buildQuery } from "./http";
import type { ApiFetch } from "./http";
import { createAuthService } from "./auth.service";
import { createDashboardService } from "./dashboard.service";
import { createEmployeeService } from "./employee.service";
import { createHrService } from "./hr.service";
import { createTalentService } from "./talent.service";
import { createWorkplaceService } from "./workplace.service";

export const createApiService = (apiFetch: ApiFetch) => ({
  auth: createAuthService(apiFetch),
  dashboard: createDashboardService(apiFetch),
  ...createEmployeeService(apiFetch, buildQuery),
  ...createHrService(apiFetch, buildQuery),
  ...createTalentService(apiFetch, buildQuery),
  ...createWorkplaceService(apiFetch, buildQuery),
});

export type ApiService = ReturnType<typeof createApiService>;
