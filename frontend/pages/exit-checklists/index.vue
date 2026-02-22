<template>
  <div>
    <PageHeader :title="t('exitChecklists.title')" :description="t('common.total') + ': ' + meta.total">
      <UButton v-if="auth.isAdminOrHR" icon="i-heroicons-plus" :label="t('exitChecklists.generate')" @click="showForm = true" />
    </PageHeader>
    <UCard>
      <UTable :rows="items" :columns="columns" :loading="loading">
        <template #employee-data="{ row }">{{ row.employee?.firstName }} {{ row.employee?.lastName }}</template>
        <template #isCompleted-data="{ row }"><StatusBadge :status="row.isCompleted ? 'COMPLETED' : 'PENDING'" /></template>
        <template #actions-data="{ row }">
          <UButton v-if="!row.isCompleted && auth.isAdminOrHR" icon="i-heroicons-check-circle" size="xs" color="green" variant="ghost" :loading="completingId === row.id" @click="complete(row.id)" />
        </template>
      </UTable>
      <div class="flex items-center justify-between mt-4 px-1">
        <p class="text-caption-size text-gray-500">{{ meta.total }} {{ t('common.rows') }}</p>
        <UPagination v-model="page" :page-count="meta.limit" :total="meta.total" size="sm" />
      </div>
    </UCard>
    <UModal v-model="showForm">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ t('exitChecklists.generate') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showForm = false" />
          </div>
        </template>
        <form @submit.prevent="generate" class="space-y-4">
          <UFormGroup label="Employee ID" required>
            <UInput v-model="employeeId" type="number" placeholder="Enter employee ID" />
          </UFormGroup>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" @click="showForm = false">{{ t('common.cancel') }}</UButton>
            <UButton type="submit" :loading="saving">{{ t('exitChecklists.generate') }}</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
<script setup lang="ts">
import type { ExitChecklist } from '~/types'
useHead({ title: 'Exit Checklists' })
const api = useApiService()
const auth = useAuthStore()
const toast = useToast()
const items = ref<ExitChecklist[]>([])
const meta = ref({ total: 0, page: 1, limit: 20, totalPages: 0 })
const loading = ref(false)
const saving = ref(false)
const completingId = ref<number | null>(null)
const page = ref(1)
const showForm = ref(false)
const employeeId = ref('')
const { t } = useI18n()
const columns = computed(() => [
  { key: 'id', label: 'ID' },
  { key: 'employee', label: t('employees.title') },
  { key: 'taskName', label: t('exitChecklists.task') },
  { key: 'isCompleted', label: t('common.status') },
  { key: 'actions', label: '' },
])
const fetchData = async () => {
  loading.value = true
  try { const res = await api.exitChecklists.list({ page: String(page.value), limit: '20' }); items.value = res.data; meta.value = res.meta }
  catch { } finally { loading.value = false }
}
const generate = async () => {
  saving.value = true
  try {
    await api.exitChecklists.generate(Number(employeeId.value))
    toast.add({ title: 'Checklist generated!', color: 'green', icon: 'i-heroicons-check-circle' })
    showForm.value = false; employeeId.value = ''; fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { saving.value = false }
}
const complete = async (id: number) => {
  completingId.value = id
  try { await api.exitChecklists.update(id, { isCompleted: true }); toast.add({ title: 'Task completed!', color: 'green' }); fetchData() }
  catch { } finally { completingId.value = null }
}
watch(page, fetchData); onMounted(fetchData)
</script>
