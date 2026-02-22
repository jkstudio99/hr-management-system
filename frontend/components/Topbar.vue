<template>
  <header class="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
    <!-- Left: Mobile menu + Search -->
    <div class="flex items-center gap-3">
      <button class="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" @click="$emit('toggleMobile')">
        <UIcon name="i-heroicons-bars-3" class="w-6 h-6 text-gray-600 dark:text-gray-300" />
      </button>
      <UInput
        icon="i-heroicons-magnifying-glass"
        :placeholder="t('common.search')"
        size="sm"
        class="w-40 sm:w-56 lg:w-72"
        :ui="{ rounded: 'rounded-xl' }"
      />
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-1 sm:gap-2">

      <!-- Language Switcher -->
      <UDropdown :items="langItems" :popper="{ placement: 'bottom-end' }">
        <UButton color="gray" variant="ghost" size="sm" :ui="{ rounded: 'rounded-xl' }">
          <UIcon name="i-heroicons-language" class="w-4 h-4" />
          <span class="hidden sm:inline text-xs font-medium ml-1">{{ currentLangLabel }}</span>
          <UIcon name="i-heroicons-chevron-down" class="w-3 h-3 ml-0.5 opacity-60" />
        </UButton>
      </UDropdown>

      <!-- Dark / Light / System Mode -->
      <UDropdown :items="themeItems" :popper="{ placement: 'bottom-end' }">
        <UButton color="gray" variant="ghost" size="sm" :ui="{ rounded: 'rounded-xl' }">
          <UIcon :name="themeIcon" class="w-4 h-4" />
        </UButton>
      </UDropdown>

      <!-- Notifications bell -->
      <UButton
        color="gray" variant="ghost" size="sm"
        :ui="{ rounded: 'rounded-xl' }"
        @click="navigateTo('/notifications')"
      >
        <div class="relative">
          <UIcon name="i-heroicons-bell" class="w-4 h-4" />
          <span
            v-if="notifStore.hasUnread"
            class="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"
          />
        </div>
      </UButton>

      <!-- User menu -->
      <UDropdown :items="userMenu" :popper="{ placement: 'bottom-end' }">
        <UButton color="gray" variant="ghost" size="sm" class="gap-2" :ui="{ rounded: 'rounded-xl' }">
          <UAvatar
            :text="auth.user?.username?.charAt(0)?.toUpperCase()"
            size="xs"
            class="bg-orange-100 text-orange-600"
          />
          <span class="hidden lg:inline text-sm font-medium">{{ auth.user?.username }}</span>
          <UBadge :color="roleColor" size="xs" class="hidden sm:inline-flex">{{ auth.user?.role }}</UBadge>
        </UButton>
      </UDropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits(['toggleMobile'])

const auth = useAuthStore()
const notifStore = useNotificationsStore()
const colorMode = useColorMode()
const { locale, t, setLocale } = useI18n()

// ── Role badge color ──────────────────────────────────────────────────────────
const roleColor = computed(() => {
  switch (auth.user?.role) {
    case 'ADMIN': return 'red'
    case 'HR':    return 'blue'
    default:      return 'gray'
  }
})

// ── Language switcher ─────────────────────────────────────────────────────────
const languages = [
  { code: 'th', label: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
]
const currentLangLabel = computed(() =>
  languages.find(l => l.code === locale.value)?.label ?? 'ภาษาไทย'
)
const langItems = computed(() => [
  languages.map(lang => ({
    label: `${lang.flag}  ${lang.label}`,
    icon: locale.value === lang.code ? 'i-heroicons-check' : undefined,
    click: () => setLocale(lang.code as 'th' | 'en'),
  })),
])

// ── Theme switcher (Dark / Light / System) ────────────────────────────────────
const themeOptions = [
  { value: 'light',  label: 'Light',  icon: 'i-heroicons-sun' },
  { value: 'dark',   label: 'Dark',   icon: 'i-heroicons-moon' },
  { value: 'system', label: 'System', icon: 'i-heroicons-computer-desktop' },
]
const themeIcon = computed(() => {
  const opt = themeOptions.find(o => o.value === colorMode.preference)
  return opt?.icon ?? 'i-heroicons-computer-desktop'
})
const themeItems = computed(() => [
  themeOptions.map(opt => ({
    label: opt.label,
    icon: opt.icon,
    click: () => { colorMode.preference = opt.value },
  })),
])

// ── User menu ─────────────────────────────────────────────────────────────────
const userMenu = computed(() => [
  [{
    label: auth.user?.username || 'User',
    slot: 'account',
    disabled: true,
  }],
  [{
    label: t('settings.profile'),
    icon: 'i-heroicons-user-circle',
    click: () => navigateTo('/settings'),
  }],
  [{
    label: t('auth.logout'),
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: () => auth.logout(),
  }],
])

// Fetch notifications on mount
onMounted(() => notifStore.fetch())
</script>
