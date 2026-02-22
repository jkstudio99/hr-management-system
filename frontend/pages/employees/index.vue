<template>
  <div>
    <PageHeader :title="t('employees.title')" :description="t('common.total') + ': ' + meta.total">
      <UInput v-model="search" :placeholder="t('common.search')" icon="i-heroicons-magnifying-glass" size="sm" class="w-56" @input="debouncedFetch" />
      <UButton v-if="auth.isAdminOrHR" icon="i-heroicons-plus" :label="t('employees.add')" @click="openCreate" />
    </PageHeader>

    <!-- Desktop Table -->
    <UCard class="hidden md:block">
      <UTable :rows="employees" :columns="columns" :loading="loading">
        <template #name-data="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :text="`${row.firstName?.charAt(0)}${row.lastName?.charAt(0)}`" size="sm" />
            <div>
              <p class="text-subhead font-medium">{{ row.firstName }} {{ row.lastName }}</p>
              <p class="text-caption-size text-gray-500">{{ row.email }}</p>
            </div>
          </div>
        </template>
        <template #department-data="{ row }">
          <span class="text-subhead">{{ row.department?.departmentName || '—' }}</span>
        </template>
        <template #jobTitle-data="{ row }">
          <span class="text-subhead">{{ row.jobTitle?.titleName || '—' }}</span>
        </template>
        <template #isActive-data="{ row }">
          <StatusBadge :status="row.isActive ? 'ACTIVE' : 'INACTIVE'" />
        </template>
        <template #actions-data="{ row }">
          <UDropdown :items="getActions(row)" :popper="{ placement: 'bottom-end' }">
            <UButton icon="i-heroicons-ellipsis-vertical" variant="ghost" size="xs" color="gray" />
          </UDropdown>
        </template>
      </UTable>
      <div class="flex items-center justify-between mt-4 px-1">
        <p class="text-caption-size text-gray-500">{{ meta.total }} {{ t('common.rows') }}</p>
        <UPagination v-model="page" :page-count="meta.limit" :total="meta.total" size="sm" />
      </div>
    </UCard>

    <!-- Mobile Card List -->
    <div class="md:hidden space-y-3">
      <UCard v-for="row in employees" :key="row.id" class="card-hover">
        <div class="flex items-center gap-3">
          <UAvatar :text="`${row.firstName?.charAt(0)}${row.lastName?.charAt(0)}`" size="md" />
          <div class="flex-1 min-w-0">
            <p class="text-subhead font-medium truncate">{{ row.firstName }} {{ row.lastName }}</p>
            <p class="text-caption-size text-gray-500 truncate">{{ row.email }}</p>
            <p class="text-caption-size text-gray-400">{{ row.department?.departmentName || '—' }}</p>
          </div>
          <div class="flex flex-col items-end gap-1">
            <StatusBadge :status="row.isActive ? 'ACTIVE' : 'INACTIVE'" />
            <UButton v-if="auth.isAdminOrHR" icon="i-heroicons-pencil-square" variant="ghost" size="xs" @click="openEdit(row)" />
          </div>
        </div>
      </UCard>
      <div v-if="!loading && !employees.length" class="text-center py-12 text-gray-400">
        <UIcon name="i-heroicons-user-group" class="w-12 h-12 mx-auto mb-2" />
        <p class="text-subhead">{{ t('common.noData') }}</p>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <UModal v-model="showForm" :ui="{ width: 'sm:max-w-2xl' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ editId ? t('employees.edit') : t('employees.add') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showForm = false" />
          </div>
        </template>
        <form @submit.prevent="saveEmployee" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="First Name" required><UInput v-model="form.firstName" placeholder="John" /></UFormGroup>
            <UFormGroup label="Last Name" required><UInput v-model="form.lastName" placeholder="Doe" /></UFormGroup>
            <UFormGroup label="Email" required><UInput v-model="form.email" type="email" placeholder="john@company.com" /></UFormGroup>
            <UFormGroup label="Phone"><UInput v-model="form.phone" placeholder="+66 81 234 5678" /></UFormGroup>
            <UFormGroup label="ID Card"><UInput v-model="form.idCard" placeholder="1234567890123" /></UFormGroup>
            <UFormGroup label="Base Salary (฿)"><UInput v-model="form.baseSalary" type="number" placeholder="30000" /></UFormGroup>
            <UFormGroup label="Department">
              <USelect v-model="form.departmentId" :options="deptOptions" placeholder="Select department" />
            </UFormGroup>
            <UFormGroup label="Job Title">
              <USelect v-model="form.jobTitleId" :options="titleOptions" placeholder="Select title" />
            </UFormGroup>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="ghost" color="gray" @click="showForm = false">{{ t('common.cancel') }}</UButton>
            <UButton type="submit" :loading="saving">{{ t('common.save') }}</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Employee } from '~/types'

useHead({ title: 'Employees' })
const { t } = useI18n()

const api = useApiService()
const auth = useAuthStore()
const toast = useToast()

const employees = ref<Employee[]>([])
const meta = ref({ total: 0, page: 1, limit: 20, totalPages: 0 })
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const page = ref(1)
const showForm = ref(false)
const editId = ref<number | null>(null)
const deptOptions = ref<{ label: string; value: number }[]>([])
const titleOptions = ref<{ label: string; value: number }[]>([])

const form = reactive({
  firstName: '', lastName: '', email: '', phone: '',
  idCard: '', baseSalary: '', departmentId: '' as any, jobTitleId: '' as any,
})

const columns = [
  { key: 'name', label: 'Employee' },
  { key: 'department', label: 'Department' },
  { key: 'jobTitle', label: 'Job Title' },
  { key: 'isActive', label: 'Status' },
  { key: 'actions', label: '' },
]

let debounceTimer: ReturnType<typeof setTimeout>
const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; fetchData() }, 400)
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = { page: String(page.value), limit: '20' }
    if (search.value) params.search = search.value
    const res = await api.employees.list(params)
    employees.value = res.data
    meta.value = res.meta
  } catch { } finally { loading.value = false }
}

const fetchOptions = async () => {
  try {
    const [d, t] = await Promise.all([api.departments.list(), api.jobTitles.list()])
    deptOptions.value = d.map(x => ({ label: x.departmentName, value: x.id }))
    titleOptions.value = t.map(x => ({ label: x.titleName, value: x.id }))
  } catch { }
}

const getActions = (row: Employee) => [[
  { label: 'Edit', icon: 'i-heroicons-pencil-square', click: () => openEdit(row) },
  { label: row.isActive ? 'Deactivate' : 'Activate', icon: 'i-heroicons-archive-box', click: () => toggleActive(row) },
]]

const openCreate = () => {
  editId.value = null
  Object.assign(form, { firstName: '', lastName: '', email: '', phone: '', idCard: '', baseSalary: '', departmentId: '', jobTitleId: '' })
  showForm.value = true
}

const openEdit = (row: Employee) => {
  editId.value = row.id
  Object.assign(form, {
    firstName: row.firstName, lastName: row.lastName, email: row.email,
    phone: row.phone || '', idCard: row.idCard || '',
    baseSalary: row.baseSalary ? String(row.baseSalary) : '',
    departmentId: row.departmentId || '', jobTitleId: row.jobTitleId || '',
  })
  showForm.value = true
}

const saveEmployee = async () => {
  saving.value = true
  try {
    const body: any = { firstName: form.firstName, lastName: form.lastName, email: form.email }
    if (form.phone) body.phone = form.phone
    if (form.idCard) body.idCard = form.idCard
    if (form.baseSalary) body.baseSalary = Number(form.baseSalary)
    if (form.departmentId) body.departmentId = Number(form.departmentId)
    if (form.jobTitleId) body.jobTitleId = Number(form.jobTitleId)

    if (editId.value) {
      await api.employees.update(editId.value, body)
      toast.add({ title: 'Employee updated', color: 'green', icon: 'i-heroicons-check-circle' })
    } else {
      await api.employees.create(body)
      toast.add({ title: 'Employee created', color: 'green', icon: 'i-heroicons-check-circle' })
    }
    showForm.value = false
    fetchData()
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message || 'Failed to save', color: 'red' })
  } finally { saving.value = false }
}

const toggleActive = async (row: Employee) => {
  try {
    await api.employees.remove(row.id)
    toast.add({ title: 'Status updated', color: 'green' })
    fetchData()
  } catch { }
}

watch(page, fetchData)
onMounted(() => { fetchData(); fetchOptions() })
</script>
