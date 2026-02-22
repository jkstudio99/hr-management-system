<template>
  <div>
    <PageHeader :title="t('expenseClaims.title')" :description="t('common.total') + ': ' + meta.total">
      <USelect v-model="filterStatus" :options="statusOptions" :placeholder="t('common.all')" size="sm" class="w-36" @change="fetchData" />
      <UButton icon="i-heroicons-plus" :label="t('expenseClaims.add')" @click="showForm = true" />
    </PageHeader>
    <UCard>
      <UTable :rows="items" :columns="columns" :loading="loading">
        <template #employee-data="{ row }">{{ row.employee?.firstName }} {{ row.employee?.lastName }}</template>
        <template #amount-data="{ row }">฿{{ Number(row.amount).toLocaleString('th-TH') }}</template>
        <template #category-data="{ row }"><UBadge variant="subtle" size="xs">{{ row.category }}</UBadge></template>
        <template #status-data="{ row }"><StatusBadge :status="row.status" /></template>
        <template #createdAt-data="{ row }">{{ new Date(row.createdAt).toLocaleDateString('th-TH') }}</template>
        <template #actions-data="{ row }">
          <div v-if="row.status === 'PENDING' && auth.isAdminOrHR" class="flex gap-1">
            <UButton icon="i-heroicons-check-circle" size="xs" color="green" variant="ghost" :loading="decidingId === row.id" @click="decide(row.id, 'approve')" />
            <UButton icon="i-heroicons-x-circle" size="xs" color="red" variant="ghost" :loading="decidingId === row.id" @click="decide(row.id, 'reject')" />
          </div>
        </template>
      </UTable>
      <div class="flex items-center justify-between mt-4 px-1">
        <p class="text-caption-size text-gray-500">{{ meta.total }} claims</p>
        <UPagination v-model="page" :page-count="meta.limit" :total="meta.total" size="sm" />
      </div>
    </UCard>
    <UModal v-model="showForm">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ t('expenseClaims.add') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showForm = false" />
          </div>
        </template>
        <form @submit.prevent="save" class="space-y-4">
          <UFormGroup label="Employee ID" required><UInput v-model="form.employeeId" type="number" /></UFormGroup>
          <UFormGroup label="Title" required><UInput v-model="form.title" placeholder="Business trip to Bangkok" /></UFormGroup>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Amount (฿)" required><UInput v-model="form.amount" type="number" /></UFormGroup>
            <UFormGroup label="Category"><USelect v-model="form.category" :options="['TRAVEL','MEAL','OFFICE','TRAINING','OTHER']" /></UFormGroup>
          </div>
          <UFormGroup label="Description"><UTextarea v-model="form.description" rows="3" /></UFormGroup>
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
import type { ExpenseClaim } from '~/types'
useHead({ title: 'Expense Claims' })
const { t } = useI18n()
const api = useApiService()
const auth = useAuthStore()
const toast = useToast()
const items = ref<ExpenseClaim[]>([])
const meta = ref({ total: 0, page: 1, limit: 20, totalPages: 0 })
const loading = ref(false)
const saving = ref(false)
const decidingId = ref<number | null>(null)
const page = ref(1)
const showForm = ref(false)
const filterStatus = ref('')
const form = reactive({ employeeId: '', title: '', amount: '', category: 'OTHER', description: '' })
const statusOptions = [{ label: 'All', value: '' }, { label: 'Pending', value: 'PENDING' }, { label: 'Approved', value: 'APPROVED' }, { label: 'Rejected', value: 'REJECTED' }]
const columns = [{ key: 'id', label: 'ID' }, { key: 'employee', label: 'Employee' }, { key: 'title', label: 'Title' }, { key: 'amount', label: 'Amount' }, { key: 'category', label: 'Category' }, { key: 'status', label: 'Status' }, { key: 'createdAt', label: 'Date' }, { key: 'actions', label: '' }]
const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = { page: String(page.value), limit: '20' }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await api.expenseClaims.list(params)
    items.value = res.data; meta.value = res.meta
  } catch { } finally { loading.value = false }
}
const save = async () => {
  saving.value = true
  try {
    await api.expenseClaims.create({ employeeId: Number(form.employeeId), title: form.title, amount: Number(form.amount), category: form.category, description: form.description || undefined })
    toast.add({ title: 'Claim submitted', color: 'green', icon: 'i-heroicons-check-circle' })
    showForm.value = false; fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { saving.value = false }
}
const decide = async (id: number, action: 'approve' | 'reject') => {
  decidingId.value = id
  try {
    if (action === 'approve') await api.expenseClaims.approve(id)
    else await api.expenseClaims.reject(id)
    toast.add({ title: action === 'approve' ? 'Approved!' : 'Rejected', color: action === 'approve' ? 'green' : 'orange' })
    fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { decidingId.value = null }
}
watch(page, fetchData); onMounted(fetchData)
</script>
