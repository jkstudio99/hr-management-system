<template>
  <div>
    <PageHeader :title="t('announcements.title')" :description="t('common.total') + ': ' + items.length">
      <UButton v-if="auth.isAdminOrHR" icon="i-heroicons-plus" :label="t('announcements.add')" @click="showForm = true" />
    </PageHeader>

    <div class="space-y-4">
      <UCard
        v-for="a in items"
        :key="a.id"
        class="card-hover"
        :class="a.isPinned ? 'ring-2 ring-orange-200 dark:ring-orange-800' : ''"
      >
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="a.isPinned ? 'bg-orange-50 dark:bg-orange-950' : 'bg-gray-50 dark:bg-zinc-800'">
            <UIcon :name="a.isPinned ? 'i-heroicons-bookmark-solid' : 'i-heroicons-speaker-wave'" class="w-5 h-5" :class="a.isPinned ? 'text-orange-500' : 'text-gray-400'" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <h3 class="text-headline truncate">{{ a.title }}</h3>
              <div class="flex items-center gap-2 shrink-0">
                <StatusBadge :status="a.priority" />
                <UButton v-if="auth.isAdminOrHR && !a.isArchived" icon="i-heroicons-archive-box" size="xs" variant="ghost" color="gray" :loading="archivingId === a.id" @click="archive(a.id)" />
              </div>
            </div>
            <p class="text-body text-gray-600 dark:text-gray-400 mt-1">{{ a.content }}</p>
            <p class="text-caption-size text-gray-400 mt-2">{{ new Date(a.publishedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
          </div>
        </div>
      </UCard>
      <div v-if="!loading && !items.length" class="text-center py-16 text-gray-400">
        <UIcon name="i-heroicons-speaker-wave" class="w-12 h-12 mx-auto mb-3" />
        <p class="text-subhead">{{ t('common.noData') }}</p>
      </div>
    </div>

    <UModal v-model="showForm" :ui="{ width: 'sm:max-w-xl' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ t('announcements.add') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showForm = false" />
          </div>
        </template>
        <form @submit.prevent="save" class="space-y-4">
          <UFormGroup :label="t('common.name')" required><UInput v-model="form.title" /></UFormGroup>
          <UFormGroup :label="t('announcements.content')" required><UTextarea v-model="form.content" rows="4" /></UFormGroup>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup :label="t('announcements.priority')">
              <USelect v-model="form.priority" :options="['LOW','NORMAL','HIGH','URGENT']" />
            </UFormGroup>
            <UFormGroup :label="t('common.actions')">
              <UCheckbox v-model="form.isPinned" :label="t('announcements.pin')" class="mt-2" />
            </UFormGroup>
          </div>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" @click="showForm = false">{{ t('common.cancel') }}</UButton>
            <UButton type="submit" :loading="saving">{{ t('common.save') }}</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Announcement } from '~/types'
useHead({ title: 'Announcements' })
const { t } = useI18n()
const api = useApiService()
const auth = useAuthStore()
const toast = useToast()
const items = ref<Announcement[]>([])
const loading = ref(false)
const saving = ref(false)
const archivingId = ref<number | null>(null)
const showForm = ref(false)
const form = reactive({ title: '', content: '', priority: 'NORMAL', isPinned: false })

const fetchData = async () => {
  loading.value = true
  try { const res = await api.announcements.list({ limit: '50' }); items.value = res.data }
  catch { } finally { loading.value = false }
}
const save = async () => {
  saving.value = true
  try {
    await api.announcements.create(form)
    toast.add({ title: 'Announcement published', color: 'green', icon: 'i-heroicons-check-circle' })
    showForm.value = false; fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { saving.value = false }
}
const archive = async (id: number) => {
  archivingId.value = id
  try { await api.announcements.archive(id); toast.add({ title: 'Archived', color: 'green' }); fetchData() }
  catch { } finally { archivingId.value = null }
}
onMounted(fetchData)
</script>
