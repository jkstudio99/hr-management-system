// ─────────────────────────────────────────────────────────────────────────────
// composables/useApiService.ts
// Provides the fully-typed, domain-split API service.
// Usage in pages: const api = useApiService()
//   api.employees.list()
//   api.leaveRequests.approve(id)
//   api.dashboard.stats()
// ─────────────────────────────────────────────────────────────────────────────
import { createApiService } from "~/services/api";
import type { ApiService } from "~/services/api";

export const useApiService = (): ApiService => {
  const { apiFetch } = useApi();
  return createApiService(apiFetch);
};
