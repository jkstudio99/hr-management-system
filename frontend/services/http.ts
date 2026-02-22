// ─────────────────────────────────────────────────────────────────────────────
// services/http.ts — Base HTTP client factory
// Used by all service modules. Injected via useApi composable.
// ─────────────────────────────────────────────────────────────────────────────

export type ApiFetch = <T>(url: string, opts?: Record<string, any>) => Promise<T>

export const buildQuery = (params?: Record<string, any>): string => {
  if (!params) return ''
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  )
  const qs = new URLSearchParams(filtered as Record<string, string>).toString()
  return qs ? `?${qs}` : ''
}
