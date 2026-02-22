<template>
  <div>
    <PageHeader :title="t('payroll.title')" :description="t('common.total') + ': ' + items.length">
      <UButton v-if="auth.isAdminOrHR" icon="i-heroicons-plus" :label="t('payroll.add')" @click="showForm = true" />
    </PageHeader>
    <UCard>
      <UTable :rows="items" :columns="columns" :loading="loading">
        <template #period-data="{ row }">
          <span class="text-subhead font-medium">{{ String(row.month).padStart(2,'0') }}/{{ row.year }}</span>
        </template>
        <template #status-data="{ row }"><StatusBadge :status="row.status" /></template>
        <template #itemCount-data="{ row }">
          <UBadge variant="subtle" color="blue" size="xs">{{ row._count?.items || 0 }} items</UBadge>
        </template>
        <template #actions-data="{ row }">
          <div class="flex gap-1">
            <UButton v-if="row.status === 'DRAFT'" size="xs" variant="soft" icon="i-heroicons-play" :loading="processingId === row.id" @click="processRun(row.id)">Process</UButton>
            <UButton v-if="row.status === 'PROCESSING'" size="xs" variant="soft" color="green" icon="i-heroicons-check" :loading="processingId === row.id" @click="completeRun(row.id)">Complete</UButton>
          </div>
        </template>
      </UTable>
    </UCard>
    <UModal v-model="showForm">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ t('payroll.add') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showForm = false" />
          </div>
        </template>
        <form @submit.prevent="save" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Month" required><UInput v-model="form.month" type="number" min="1" max="12" /></UFormGroup>
            <UFormGroup label="Year" required><UInput v-model="form.year" type="number" :min="2020" /></UFormGroup>
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
import type { PayrollRun } from '~/types'
useHead({ title: 'Payroll' })
const { t } = useI18n()
const api = useApiService()
const auth = useAuthStore()
const toast = useToast()
const items = ref<PayrollRun[]>([])
const loading = ref(false)
const saving = ref(false)
const processingId = ref<number | null>(null)
const showForm = ref(false)
const form = reactive({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'period', label: 'Period' },
  { key: 'status', label: 'Status' },
  { key: 'itemCount', label: 'Items' },
  { key: 'actions', label: '' },
]
const fetchData = async () => {
  loading.value = true
  try {
    const res = await api.payroll.list({ limit: '50' })
    items.value = res.data
  } catch { } finally { loading.value = false }
}
const save = async () => {
  saving.value = true
  try {
    await api.payroll.create({ month: Number(form.month), year: Number(form.year) })
    toast.add({ title: 'Payroll run created', color: 'green', icon: 'i-heroicons-check-circle' })
    showForm.value = false; fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { saving.value = false }
}
const processRun = async (id: number) => {
  processingId.value = id
  try {
    await api.payroll.process(id)
    toast.add({ title: 'Processing payroll...', color: 'amber' }); fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { processingId.value = null }
}
const completeRun = async (id: number) => {
  processingId.value = id
  try {
    await api.payroll.complete(id)
    toast.add({ title: 'Payroll completed!', color: 'green', icon: 'i-heroicons-check-circle' }); fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { processingId.value = null }
}
onMounted(fetchData)
</script>
