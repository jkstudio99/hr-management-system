<template>
  <div>
    <PageHeader :title="t('overtime.title')" :description="t('overtime.timesheet')">
      <UButton icon="i-heroicons-plus" :label="t('overtime.request')" @click="showForm = true" />
    </PageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <!-- Clock In/Out Card -->
      <UCard>
        <template #header><h3 class="text-headline">{{ t('overtime.timesheet') }}</h3></template>
        <div class="space-y-3">
          <UButton block icon="i-heroicons-play-circle" color="green" :loading="clocking" @click="clockIn">
            {{ t('overtime.clockIn') }}
          </UButton>
          <UButton block icon="i-heroicons-stop-circle" color="red" variant="soft" :loading="clocking" @click="clockOut">
            {{ t('overtime.clockOut') }}
          </UButton>
          <p class="text-caption-size text-gray-400 text-center">Uses your logged-in account</p>
        </div>
      </UCard>

      <!-- OT Requests Table -->
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">OT Requests</h3>
            <USelect v-model="filterStatus" :options="statusOptions" size="xs" class="w-32" @change="fetchData" />
          </div>
        </template>
        <UTable :rows="otItems" :columns="otColumns" :loading="loading">
          <template #employee-data="{ row }">{{ row.employee?.firstName }} {{ row.employee?.lastName }}</template>
          <template #date-data="{ row }">{{ new Date(row.date).toLocaleDateString('th-TH') }}</template>
          <template #hours-data="{ row }">{{ row.hours }} hrs</template>
          <template #status-data="{ row }"><StatusBadge :status="row.status" /></template>
          <template #actions-data="{ row }">
            <div v-if="row.status === 'PENDING' && auth.isAdminOrHR" class="flex gap-1">
              <UButton icon="i-heroicons-check-circle" size="xs" color="green" variant="ghost" :loading="decidingId === row.id" @click="decide(row.id, 'approve')" />
              <UButton icon="i-heroicons-x-circle" size="xs" color="red" variant="ghost" :loading="decidingId === row.id" @click="decide(row.id, 'reject')" />
            </div>
          </template>
        </UTable>
        <div class="flex items-center justify-between mt-4 px-1">
          <p class="text-caption-size text-gray-500">{{ meta.total }} requests</p>
          <UPagination v-model="page" :page-count="meta.limit" :total="meta.total" size="sm" />
        </div>
      </UCard>
    </div>

    <UModal v-model="showForm">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">New OT Request</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showForm = false" />
          </div>
        </template>
        <form @submit.prevent="save" class="space-y-4">
          <UFormGroup label="Employee ID" required><UInput v-model="form.employeeId" type="number" /></UFormGroup>
          <UFormGroup label="Date" required><UInput v-model="form.date" type="date" /></UFormGroup>
          <UFormGroup label="Hours" required><UInput v-model="form.hours" type="number" step="0.5" min="0.5" max="12" /></UFormGroup>
          <UFormGroup label="Reason"><UTextarea v-model="form.reason" rows="3" /></UFormGroup>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" @click="showForm = false">Cancel</UButton>
            <UButton type="submit" :loading="saving">Submit</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { OvertimeRequest } from '~/types'
useHead({ title: 'Overtime' })
const { t } = useI18n()
const api = useApiService()
const auth = useAuthStore()
const toast = useToast()
const otItems = ref<OvertimeRequest[]>([])
const meta = ref({ total: 0, page: 1, limit: 20, totalPages: 0 })
const loading = ref(false)
const saving = ref(false)
const clocking = ref(false)
const decidingId = ref<number | null>(null)
const page = ref(1)
const showForm = ref(false)
const filterStatus = ref('')
const form = reactive({ employeeId: '', date: new Date().toISOString().split('T')[0], hours: '2', reason: '' })
const statusOptions = [{ label: 'All', value: '' }, { label: 'Pending', value: 'PENDING' }, { label: 'Approved', value: 'APPROVED' }, { label: 'Rejected', value: 'REJECTED' }]
const otColumns = [{ key: 'id', label: 'ID' }, { key: 'employee', label: 'Employee' }, { key: 'date', label: 'Date' }, { key: 'hours', label: 'Hours' }, { key: 'status', label: 'Status' }, { key: 'actions', label: '' }]
const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = { page: String(page.value), limit: '20' }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await api.overtime.listRequests(params)
    otItems.value = res.data; meta.value = res.meta
  } catch { } finally { loading.value = false }
}
const save = async () => {
  saving.value = true
  try {
    await api.overtime.createRequest({ employeeId: Number(form.employeeId), date: form.date, hours: Number(form.hours), reason: form.reason || undefined })
    toast.add({ title: 'OT request submitted', color: 'green', icon: 'i-heroicons-check-circle' })
    showForm.value = false; fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { saving.value = false }
}
const decide = async (id: number, action: 'approve' | 'reject') => {
  decidingId.value = id
  try {
    if (action === 'approve') await api.overtime.approve(id)
    else await api.overtime.reject(id)
    toast.add({ title: action === 'approve' ? 'Approved!' : 'Rejected', color: action === 'approve' ? 'green' : 'orange' })
    fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { decidingId.value = null }
}
const clockIn = async () => {
  clocking.value = true
  try { await api.overtime.clockIn(); toast.add({ title: 'Clocked in!', color: 'green', icon: 'i-heroicons-play-circle' }) }
  catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { clocking.value = false }
}
const clockOut = async () => {
  clocking.value = true
  try { await api.overtime.clockOut(); toast.add({ title: 'Clocked out!', color: 'orange', icon: 'i-heroicons-stop-circle' }) }
  catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { clocking.value = false }
}
watch(page, fetchData); onMounted(fetchData)
</script>
