// ── Common / Shared Types ─────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface SelectOption {
  label: string
  value: string | number
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
}
