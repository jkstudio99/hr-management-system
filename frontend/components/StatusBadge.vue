<template>
  <UBadge :color="badgeColor" variant="subtle" size="xs">{{ label }}</UBadge>
</template>

<script setup lang="ts">
type BadgeColor = 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose' | 'gray' | 'white' | 'black' | 'primary'

const props = defineProps<{ status: string }>()
const { t } = useI18n()

const COLOR_MAP: Record<string, BadgeColor> = {
  PENDING: 'amber', APPROVED: 'emerald', REJECTED: 'red',
  AVAILABLE: 'blue', ASSIGNED: 'purple', RETIRED: 'gray',
  ACTIVE: 'emerald', INACTIVE: 'red',
  OPEN: 'blue', CLOSED: 'gray', ON_HOLD: 'amber',
  DRAFT: 'gray', PROCESSING: 'amber', COMPLETED: 'emerald',
  ENROLLED: 'blue', HIRED: 'green',
  INTERVIEW: 'purple', SCREENING: 'cyan', OFFER: 'orange', APPLIED: 'blue',
  HIGH: 'red', URGENT: 'red', NORMAL: 'blue', LOW: 'gray', MEDIUM: 'blue',
}

const badgeColor = computed<BadgeColor>(() => COLOR_MAP[props.status?.toUpperCase()] ?? 'gray')

const label = computed(() => {
  const key = `status.${props.status?.toUpperCase()}`
  const translated = t(key)
  return translated !== key ? translated : props.status
})
</script>
