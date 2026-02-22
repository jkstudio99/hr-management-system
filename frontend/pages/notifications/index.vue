<template>
  <div>
    <PageHeader :title="t('notifications.title')" :description="t('notifications.unread') + ': ' + items.filter(n => !n.isRead).length">
      <UButton icon="i-heroicons-check-circle" :label="t('notifications.markAllRead')" variant="soft" color="gray" :loading="markingAll" @click="markAllRead" />
    </PageHeader>
    <UCard>
      <div v-if="items.length" class="divide-y divide-gray-100 dark:divide-zinc-800">
        <div
          v-for="n in items"
          :key="n.id"
          class="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors"
          :class="{ 'opacity-60': n.isRead }"
          @click="markRead(n.id)"
        >
          <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" :class="n.isRead ? 'bg-gray-100 dark:bg-zinc-800' : 'bg-orange-50 dark:bg-orange-950'">
            <UIcon :name="n.isRead ? 'i-heroicons-bell' : 'i-heroicons-bell-alert'" class="w-4 h-4" :class="n.isRead ? 'text-gray-400' : 'text-orange-500'" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-subhead font-medium" :class="{ 'text-gray-500': n.isRead }">{{ n.title }}</p>
            <p class="text-caption-size text-gray-500 mt-0.5">{{ n.message }}</p>
            <p class="text-caption-size text-gray-400 mt-1">{{ new Date(n.createdAt).toLocaleString('th-TH') }}</p>
          </div>
          <div v-if="!n.isRead" class="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
        </div>
      </div>
      <div v-else-if="loading" class="space-y-4 p-4">
        <div v-for="i in 5" :key="i" class="skeleton h-16 w-full" />
      </div>
      <div v-else class="text-center py-16 text-gray-400">
        <UIcon name="i-heroicons-bell-slash" class="w-12 h-12 mx-auto mb-3" />
        <p class="text-subhead">{{ t('notifications.noNotifications') }}</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { Notification } from '~/types'
useHead({ title: 'Notifications' })
const api = useApiService()
const toast = useToast()
const { t } = useI18n()
const items = ref<Notification[]>([])
const loading = ref(false)
const markingAll = ref(false)
const fetchData = async () => {
  loading.value = true
  try {
    const res = await api.notifications.list()
    items.value = res.data ?? (res as any)
  } catch { } finally { loading.value = false }
}
const markRead = async (id: number) => {
  try { await api.notifications.markRead(id); fetchData() } catch { }
}
const markAllRead = async () => {
  markingAll.value = true
  try {
    await api.notifications.markAllRead()
    toast.add({ title: t('notifications.markAllRead'), color: 'green' }); fetchData()
  } catch { } finally { markingAll.value = false }
}
onMounted(fetchData)
</script>
