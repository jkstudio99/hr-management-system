<template>
  <div>
    <PageHeader :title="t('jobHistories.title')" :description="t('common.total') + ': ' + meta.total">
      <UButton icon="i-heroicons-plus" :label="t('jobHistories.add')" @click="showForm = true" />
    </PageHeader>
    <UCard>
      <UTable :rows="items" :columns="columns" :loading="loading">
        <template #employee-data="{ row }">{{ row.employee?.firstName }} {{ row.employee?.lastName }}</template>
        <template #effectiveDate-data="{ row }">{{ new Date(row.effectiveDate).toLocaleDateString() }}</template>
        <template #actions-data="{ row }">
          <UButton icon="i-heroicons-pencil-square" variant="ghost" size="xs" @click="openEdit(row)" />
        </template>
      </UTable>
      <div class="flex justify-between items-center mt-4 px-2"><span class="text-sm text-gray-500">{{ meta.total }} total</span><UPagination v-model="page" :page-count="meta.limit" :total="meta.total" size="sm" /></div>
    </UCard>
    <UModal v-model="showForm">
      <UCard>
        <template #header><h3 class="text-headline">{{ editId ? t('common.edit') : t('jobHistories.add') }}</h3></template>
        <form @submit.prevent="save" class="space-y-4">
          <UFormGroup label="Employee ID"><UInput v-model="form.employeeId" type="number" required /></UFormGroup>
          <UFormGroup :label="t('jobHistories.changeType')"><USelect v-model="form.changeType" :options="['PROMOTION','TRANSFER','TITLE_CHANGE','SALARY_CHANGE','OTHER']" required /></UFormGroup>
          <UFormGroup :label="t('common.description')"><UInput v-model="form.description" required /></UFormGroup>
          <UFormGroup :label="t('jobHistories.effectiveDate')"><UInput v-model="form.effectiveDate" type="date" required /></UFormGroup>
          <div class="flex justify-end gap-2"><UButton variant="ghost" @click="showForm = false">{{ t('common.cancel') }}</UButton><UButton type="submit" :loading="saving">{{ t('common.save') }}</UButton></div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
<script setup lang="ts">
useHead({ title: 'Job Histories' })
const api = useApiService()
const toast = useToast()
const { t } = useI18n()
const items = ref<any[]>([])
const meta = ref({ total: 0, limit: 20, page: 1, totalPages: 0 })
const loading = ref(false)
const saving = ref(false)
const page = ref(1)
const showForm = ref(false)
const editId = ref<number | null>(null)
const form = reactive({ employeeId: '', changeType: 'PROMOTION', description: '', effectiveDate: '' })
const columns = computed(() => [
  { key: 'id', label: 'ID' },
  { key: 'employee', label: t('employees.title') },
  { key: 'changeType', label: t('jobHistories.changeType') },
  { key: 'description', label: t('common.description') },
  { key: 'effectiveDate', label: t('jobHistories.effectiveDate') },
  { key: 'actions', label: '' },
])
const fetchData = async () => {
  loading.value = true
  try {
    const r = await api.jobHistories.list({ page: String(page.value), limit: '20' })
    items.value = r.data; meta.value = r.meta
  } catch {} finally { loading.value = false }
}
const openEdit = (row: any) => {
  editId.value = row.id
  Object.assign(form, { employeeId: row.employeeId, changeType: row.changeType, description: row.description, effectiveDate: row.effectiveDate?.split('T')[0] })
  showForm.value = true
}
const save = async () => {
  saving.value = true
  try {
    const body = { ...form, employeeId: Number(form.employeeId) }
    if (editId.value) await api.jobHistories.update(editId.value, body)
    else await api.jobHistories.create(body)
    toast.add({ title: t('common.save'), color: 'green' })
    showForm.value = false; editId.value = null; fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { saving.value = false }
}
watch(page, fetchData); onMounted(fetchData)
</script>
