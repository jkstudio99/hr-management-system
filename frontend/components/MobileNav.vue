<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 flex justify-around py-2 px-1">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px]"
      :class="isActive(item.to) ? 'text-orange-500' : 'text-gray-500'"
    >
      <UIcon :name="item.icon" class="w-5 h-5" />
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const isActive = (path: string) => route.path === path || route.path.startsWith(path + '/')

const items = [
  { label: 'Home', icon: 'i-heroicons-home', to: '/' },
  { label: 'Staff', icon: 'i-heroicons-user-group', to: '/employees' },
  { label: 'Leave', icon: 'i-heroicons-calendar-days', to: '/leave-requests' },
  { label: 'Assets', icon: 'i-heroicons-computer-desktop', to: '/assets' },
  { label: 'More', icon: 'i-heroicons-ellipsis-horizontal-circle', to: '/settings' },
]
</script>
