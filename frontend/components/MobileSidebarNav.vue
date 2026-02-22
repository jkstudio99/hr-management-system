<template>
  <nav class="space-y-0.5">
    <div v-for="group in menuGroups" :key="group.label">
      <p class="px-3 pt-4 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{{ group.label }}</p>
      <NuxtLink
        v-for="item in group.items"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800"
        :class="isActive(item.to) ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 font-medium' : 'text-gray-700 dark:text-gray-300'"
        @click="$emit('navigate')"
      >
        <UIcon :name="item.icon" class="w-5 h-5 shrink-0" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineEmits(['navigate'])
const route = useRoute()
const auth = useAuthStore()
const { t } = useI18n()

const isActive = (path: string) =>
  path === '/' ? route.path === '/' : route.path === path || route.path.startsWith(path + '/')

const menuGroups = computed(() => {
  const groups = [
    { label: 'Overview', items: [
      { label: t('nav.dashboard'), icon: 'i-heroicons-chart-bar-square', to: '/' },
      { label: t('nav.ess'),       icon: 'i-heroicons-user-circle',       to: '/ess' },
    ]},
    { label: 'Organization', items: [
      { label: t('nav.employees'),   icon: 'i-heroicons-user-group',      to: '/employees' },
      { label: t('nav.departments'), icon: 'i-heroicons-building-office', to: '/departments' },
      { label: t('nav.jobTitles'),   icon: 'i-heroicons-briefcase',       to: '/job-titles' },
      { label: t('nav.orgChart'),    icon: 'i-heroicons-squares-2x2',     to: '/org-chart' },
    ]},
    { label: 'Operations', items: [
      { label: t('nav.leave'),    icon: 'i-heroicons-calendar-days',   to: '/leave-requests' },
      { label: t('nav.overtime'), icon: 'i-heroicons-clock',            to: '/overtime' },
      { label: t('nav.shifts'),   icon: 'i-heroicons-calendar',         to: '/shifts' },
      { label: t('nav.assets'),   icon: 'i-heroicons-computer-desktop', to: '/assets' },
    ]},
    { label: 'People', items: [
      { label: t('nav.performance'),    icon: 'i-heroicons-presentation-chart-line',  to: '/performance-reviews' },
      { label: t('nav.goals'),          icon: 'i-heroicons-flag',                     to: '/goals' },
      { label: t('nav.training'),       icon: 'i-heroicons-academic-cap',             to: '/training' },
      { label: t('nav.recruitment'),    icon: 'i-heroicons-megaphone',                to: '/recruitment' },
      { label: t('nav.exitChecklists'), icon: 'i-heroicons-clipboard-document-check', to: '/exit-checklists' },
      { label: t('nav.jobHistories'),   icon: 'i-heroicons-clock',                    to: '/job-histories' },
    ]},
    { label: 'Finance', items: [
      { label: t('nav.expense'),  icon: 'i-heroicons-receipt-percent', to: '/expense-claims' },
      { label: t('nav.payroll'),  icon: 'i-heroicons-banknotes',       to: '/payroll' },
      { label: t('nav.benefits'), icon: 'i-heroicons-heart',           to: '/benefits' },
    ]},
    { label: 'Workspace', items: [
      { label: t('nav.documents'),     icon: 'i-heroicons-document-text',           to: '/documents' },
      { label: t('nav.announcements'), icon: 'i-heroicons-speaker-wave',            to: '/announcements' },
      { label: t('nav.surveys'),       icon: 'i-heroicons-clipboard-document-list', to: '/surveys' },
    ]},
  ]
  if (auth.isAdminOrHR) {
    groups.push({ label: 'Admin', items: [
      { label: t('nav.auditLog'),      icon: 'i-heroicons-shield-check', to: '/audit-log' },
      { label: t('nav.notifications'), icon: 'i-heroicons-bell',         to: '/notifications' },
      { label: t('nav.settings'),      icon: 'i-heroicons-cog-6-tooth',  to: '/settings' },
    ]})
  }
  return groups
})
</script>
