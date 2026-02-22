<template>
  <div>
    <PageHeader :title="t('leaveRequests.title')" :description="t('common.total') + ': ' + meta.total">
      <USelect v-model="filterStatus" :options="statusOptions" :placeholder="t('common.all')" size="sm" class="w-36" @change="fetchData" />
      <UButton icon="i-heroicons-plus" :label="t('leaveRequests.add')" @click="showForm = true" />
    </PageHeader>

    <UCard>
      <UTable :rows="items" :columns="columns" :loading="loading">
        <template #employee-data="{ row }">
          <span class="text-subhead">{{ row.employee?.firstName }} {{ row.employee?.lastName }}</span>
        </template>
        <template #leaveType-data="{ row }">
          <UBadge variant="subtle" color="blue" size="xs">{{ row.leaveType }}</UBadge>
        </template>
        <template #startDate-data="{ row }">{{ new Date(row.startDate).toLocaleDateString('th-TH') }}</template>
        <template #endDate-data="{ row }">{{ new Date(row.endDate).toLocaleDateString('th-TH') }}</template>
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

    <UModal v-model="showForm">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ t('leaveRequests.add') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showForm = false" />
          </div>
        </template>
        <form @submit.prevent="save" class="space-y-4">
          <UFormGroup label="Employee ID" required><UInput v-model="form.employeeId" type="number" placeholder="1" /></UFormGroup>
          <UFormGroup label="Leave Type" required>
            <USelect v-model="form.leaveType" :options="['ANNUAL','SICK','PERSONAL','MATERNITY','OTHER']" />
          </UFormGroup>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Start Date" required><UInput v-model="form.startDate" type="date" /></UFormGroup>
            <UFormGroup label="End Date" required><UInput v-model="form.endDate" type="date" /></UFormGroup>
          </div>
          <UFormGroup label="Reason"><UTextarea v-model="form.reason" rows="3" /></UFormGroup>
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
import type { LeaveRequest } from '~/types'

useHead({ title: 'Leave Requests' })
const { t } = useI18n()
const api = useApiService()
const auth = useAuthStore()
const toast = useToast()

const items = ref<LeaveRequest[]>([])
const meta = ref({ total: 0, page: 1, limit: 20, totalPages: 0 })
const loading = ref(false)
const saving = ref(false)
const decidingId = ref<number | null>(null)
const page = ref(1)
const showForm = ref(false)
const filterStatus = ref('')
const form = reactive({ employeeId: '', leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' })

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
]

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'employee', label: 'Employee' },
  { key: 'leaveType', label: 'Type' },
  { key: 'startDate', label: 'Start' },
  { key: 'endDate', label: 'End' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' },
]

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = { page: String(page.value), limit: '20' }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await api.leaveRequests.list(params)
    items.value = res.data
    meta.value = res.meta
  } catch { } finally { loading.value = false }
}

const save = async () => {
  saving.value = true
  try {
    await api.leaveRequests.create({
      employeeId: Number(form.employeeId),
      leaveType: form.leaveType as any,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason || undefined,
    })
    toast.add({ title: 'Leave request submitted', color: 'green', icon: 'i-heroicons-check-circle' })
    showForm.value = false
    fetchData()
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message || 'Failed', color: 'red' })
  } finally { saving.value = false }
}

const decide = async (id: number, action: 'approve' | 'reject') => {
  decidingId.value = id
  try {
    if (action === 'approve') await api.leaveRequests.approve(id)
    else await api.leaveRequests.reject(id)
    toast.add({ title: action === 'approve' ? 'Approved!' : 'Rejected', color: action === 'approve' ? 'green' : 'orange' })
    fetchData()
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message, color: 'red' })
  } finally { decidingId.value = null }
}

watch(page, fetchData)
onMounted(fetchData)
</script>
