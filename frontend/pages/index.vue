<template>
  <div>
    <PageHeader :title="t('dashboard.title')" :description="t('dashboard.subtitle')" />

    <!-- Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <UCard v-for="card in metricCards" :key="card.label" class="card-hover">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" :class="card.bg">
            <UIcon :name="card.icon" class="w-6 h-6" :class="card.iconColor" />
          </div>
          <div class="min-w-0">
            <p class="text-caption-size text-gray-500 dark:text-gray-400">{{ card.label }}</p>
            <p class="text-title-2 truncate">{{ card.value }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <UCard>
        <template #header>
          <h3 class="text-headline">Department Distribution</h3>
        </template>
        <div v-if="deptStats.length" class="space-y-3">
          <div v-for="dept in deptStats" :key="dept.id" class="flex items-center gap-3">
            <span class="text-subhead w-32 truncate shrink-0">{{ dept.name }}</span>
            <div class="flex-1 bg-gray-100 dark:bg-zinc-800 rounded-full h-2.5">
              <div
                class="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
                :style="{ width: `${Math.min((dept.headcount / maxDeptCount) * 100, 100)}%` }"
              />
            </div>
            <span class="text-subhead font-semibold w-8 text-right shrink-0">{{ dept.headcount }}</span>
          </div>
        </div>
        <div v-else-if="statsLoading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="skeleton h-4 w-full" />
        </div>
        <p v-else class="text-subhead text-gray-400 text-center py-4">No department data</p>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-headline">Leave Statistics</h3>
        </template>
        <div v-if="leaveStats.length" class="space-y-3">
          <div v-for="stat in leaveStats" :key="stat.status" class="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800">
            <div class="flex items-center gap-2">
              <StatusBadge :status="stat.status" />
            </div>
            <span class="text-headline">{{ stat.count }}</span>
          </div>
        </div>
        <p v-else class="text-subhead text-gray-400 text-center py-4">No leave data</p>
      </UCard>
    </div>

    <!-- Bottom Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">Recent Announcements</h3>
            <UButton to="/announcements" variant="ghost" size="xs" trailing-icon="i-heroicons-arrow-right">View all</UButton>
          </div>
        </template>
        <div v-if="announcements.length" class="space-y-1">
          <div
            v-for="a in announcements"
            :key="a.id"
            class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
            @click="navigateTo('/announcements')"
          >
            <UIcon
              :name="a.isPinned ? 'i-heroicons-bookmark-solid' : 'i-heroicons-speaker-wave'"
              class="w-4 h-4 mt-0.5 shrink-0"
              :class="a.isPinned ? 'text-orange-500' : 'text-gray-400'"
            />
            <div class="min-w-0 flex-1">
              <p class="text-subhead font-medium truncate">{{ a.title }}</p>
              <p class="text-caption-size text-gray-500">{{ new Date(a.publishedAt).toLocaleDateString('th-TH') }}</p>
            </div>
            <StatusBadge :status="a.priority" class="shrink-0" />
          </div>
        </div>
        <p v-else class="text-subhead text-gray-400 text-center py-4">No announcements</p>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-headline">Quick Actions</h3>
        </template>
        <div class="grid grid-cols-2 gap-2">
          <UButton
            v-for="action in quickActions"
            :key="action.to"
            :to="action.to"
            variant="soft"
            color="gray"
            block
            class="justify-start gap-2 text-subhead"
          >
            <UIcon :name="action.icon" class="w-4 h-4 shrink-0" />
            <span class="truncate">{{ action.label }}</span>
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DashboardStats, DeptStat, LeaveStat, Announcement } from '~/types'

useHead({ title: 'Dashboard' })
const { t } = useI18n()
const api = useApiService()
const statsLoading = ref(false)

const stats = ref<DashboardStats | null>(null)
const deptStats = ref<DeptStat[]>([])
const leaveStats = ref<LeaveStat[]>([])
const announcements = ref<Announcement[]>([])

// Backend shape: { headcount: { total, active, inactive, turnoverRate }, departments, pendingApprovals, assets }
const metricCards = computed(() => [
  { label: 'Total Employees',  value: stats.value?.headcount?.total ?? 0,                           icon: 'i-heroicons-user-group',          bg: 'bg-blue-50 dark:bg-blue-950',       iconColor: 'text-blue-500' },
  { label: 'Active Employees', value: stats.value?.headcount?.active ?? 0,                          icon: 'i-heroicons-check-badge',         bg: 'bg-emerald-50 dark:bg-emerald-950', iconColor: 'text-emerald-500' },
  { label: 'Departments',      value: stats.value?.departments ?? 0,                                icon: 'i-heroicons-building-office',     bg: 'bg-purple-50 dark:bg-purple-950',   iconColor: 'text-purple-500' },
  { label: 'Turnover Rate',    value: `${(stats.value?.headcount?.turnoverRate ?? 0).toFixed(1)}%`, icon: 'i-heroicons-arrow-trending-down', bg: 'bg-orange-50 dark:bg-orange-950',   iconColor: 'text-orange-500' },
])

const maxDeptCount = computed(() => Math.max(...deptStats.value.map(d => d.headcount ?? 0), 1))

const quickActions = [
  { label: 'Add Employee',    icon: 'i-heroicons-user-plus',           to: '/employees' },
  { label: 'Leave Request',   icon: 'i-heroicons-calendar-days',       to: '/leave-requests' },
  { label: 'Expense Claim',   icon: 'i-heroicons-receipt-percent',     to: '/expense-claims' },
  { label: 'Recruitment',     icon: 'i-heroicons-megaphone',           to: '/recruitment' },
  { label: 'Training',        icon: 'i-heroicons-academic-cap',        to: '/training' },
  { label: 'Announcements',   icon: 'i-heroicons-speaker-wave',        to: '/announcements' },
]

onMounted(async () => {
  statsLoading.value = true
  try {
    const [s, d, l, a] = await Promise.allSettled([
      api.dashboard.stats(),
      api.dashboard.departmentStats(),
      api.dashboard.leaveStats(),
      api.announcements.list({ limit: '5' }),
    ])
    if (s.status === 'fulfilled') stats.value = s.value
    if (d.status === 'fulfilled') deptStats.value = d.value
    if (l.status === 'fulfilled') leaveStats.value = l.value
    if (a.status === 'fulfilled') announcements.value = (a.value as any).data ?? []
  } finally {
    statsLoading.value = false
  }
})
</script>
