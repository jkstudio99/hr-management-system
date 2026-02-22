// ─────────────────────────────────────────────────────────────────────────────
// composables/useDesignSystem.ts
// Design system tokens, helpers, and theme utilities.
// Apple HIG + PrimeNG Orange (#F97316) design language.
// ─────────────────────────────────────────────────────────────────────────────

// ── Color tokens ──────────────────────────────────────────────────────────────
export const colors = {
  primary:   '#F97316',
  secondary: '#00C781',
  danger:    '#EF4444',
  warning:   '#F59E0B',
  info:      '#3B82F6',
  success:   '#10B981',
} as const

// ── Status badge config ───────────────────────────────────────────────────────
export type BadgeColor = 'orange' | 'green' | 'red' | 'yellow' | 'blue' | 'gray'

const STATUS_MAP: Record<string, BadgeColor> = {
  PENDING:    'yellow',
  APPROVED:   'green',
  REJECTED:   'red',
  ACTIVE:     'green',
  INACTIVE:   'gray',
  DRAFT:      'gray',
  PROCESSING: 'blue',
  COMPLETED:  'green',
  AVAILABLE:  'green',
  ASSIGNED:   'blue',
  RETIRED:    'gray',
  OPEN:       'blue',
  CLOSED:     'gray',
  HIRED:      'green',
  APPLIED:    'yellow',
  SCREENING:  'blue',
  INTERVIEW:  'orange',
  OFFER:      'green',
  LOW:        'gray',
  MEDIUM:     'blue',
  HIGH:       'orange',
  URGENT:     'red',
}

// ── Priority icon map ─────────────────────────────────────────────────────────
const PRIORITY_ICON: Record<string, string> = {
  LOW:    'i-heroicons-arrow-down',
  MEDIUM: 'i-heroicons-minus',
  HIGH:   'i-heroicons-arrow-up',
  URGENT: 'i-heroicons-exclamation-triangle',
}

export const useDesignSystem = () => {
  // Status → badge color
  const statusColor = (status: string): BadgeColor =>
    STATUS_MAP[status?.toUpperCase()] ?? 'gray'

  // Priority → icon
  const priorityIcon = (priority: string): string =>
    PRIORITY_ICON[priority?.toUpperCase()] ?? 'i-heroicons-minus'

  // Format Thai date (BE year)
  const formatDate = (iso: string | undefined | null, locale = 'th-TH'): string => {
    if (!iso) return '—'
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric', month: 'short', day: 'numeric',
    }).format(new Date(iso))
  }

  // Format currency (THB)
  const formatCurrency = (amount: number | undefined | null, currency = 'THB'): string => {
    if (amount == null) return '—'
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency }).format(amount)
  }

  // Format number with commas
  const formatNumber = (n: number | undefined | null): string => {
    if (n == null) return '0'
    return new Intl.NumberFormat('th-TH').format(n)
  }

  // Truncate long text
  const truncate = (text: string, max = 60): string =>
    text?.length > max ? `${text.slice(0, max)}…` : (text ?? '')

  // Full name helper
  const fullName = (emp?: { firstName?: string; lastName?: string } | null): string =>
    emp ? `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.trim() : '—'

  // Avatar initials
  const initials = (name: string): string =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  // Toast helpers (wraps useToast for consistent styling)
  const toast = useToast()

  const notify = {
    success: (title: string, description?: string) =>
      toast.add({ title, description, color: 'green', icon: 'i-heroicons-check-circle' }),
    error: (title: string, description?: string) =>
      toast.add({ title, description, color: 'red', icon: 'i-heroicons-x-circle' }),
    info: (title: string, description?: string) =>
      toast.add({ title, description, color: 'blue', icon: 'i-heroicons-information-circle' }),
    warning: (title: string, description?: string) =>
      toast.add({ title, description, color: 'yellow', icon: 'i-heroicons-exclamation-triangle' }),
  }

  return {
    colors,
    statusColor,
    priorityIcon,
    formatDate,
    formatCurrency,
    formatNumber,
    truncate,
    fullName,
    initials,
    notify,
  }
}
