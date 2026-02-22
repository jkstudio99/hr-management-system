<template>
  <div>
    <PageHeader :title="t('assets.title')" :description="t('common.total') + ': ' + meta.total">
      <UButton icon="i-heroicons-plus" :label="t('assets.add')" @click="showForm = true" />
    </PageHeader>
    <UCard>
      <UTable :rows="items" :columns="columns" :loading="loading">
        <template #status-data="{ row }"><StatusBadge :status="row.status" /></template>
        <template #employee-data="{ row }">{{ row.employee ? `${row.employee.firstName} ${row.employee.lastName}` : '-' }}</template>
        <template #actions-data="{ row }">
          <div class="flex gap-1">
            <UButton icon="i-heroicons-pencil-square" variant="ghost" size="xs" @click="openEdit(row)" />
            <UButton icon="i-heroicons-trash" variant="ghost" size="xs" color="red" @click="remove(row.id)" />
          </div>
        </template>
      </UTable>
      <div class="flex justify-between items-center mt-4 px-2">
        <span class="text-sm text-gray-500">{{ meta.total }} total</span>
        <UPagination v-model="page" :page-count="meta.limit" :total="meta.total" size="sm" />
      </div>
    </UCard>
    <UModal v-model="showForm">
      <UCard>
        <template #header><h3 class="text-headline">{{ editId ? 'Edit' : 'Add' }} Asset</h3></template>
        <form @submit.prevent="save" class="space-y-4">
          <UFormGroup label="Asset Name"><UInput v-model="form.assetName" required /></UFormGroup>
          <UFormGroup label="Asset Type"><UInput v-model="form.assetType" required /></UFormGroup>
          <UFormGroup label="Serial Number"><UInput v-model="form.serialNumber" /></UFormGroup>
          <UFormGroup label="Status"><USelect v-model="form.status" :options="['AVAILABLE','ASSIGNED','RETIRED']" /></UFormGroup>
          <UFormGroup label="Assign to Employee ID"><UInput v-model="form.employeeId" type="number" /></UFormGroup>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="showForm = false">Cancel</UButton>
            <UButton type="submit" :loading="saving">Save</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
<script setup lang="ts">
useHead({ title: 'Assets' })
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
const form = reactive({ assetName: '', assetType: '', serialNumber: '', status: 'AVAILABLE', employeeId: '' })
const columns = computed(() => [
  { key: 'id', label: 'ID' },
  { key: 'assetName', label: t('assets.assetName') },
  { key: 'assetType', label: t('assets.assetType') },
  { key: 'serialNumber', label: t('assets.serialNumber') },
  { key: 'status', label: t('common.status') },
  { key: 'employee', label: t('assets.assignedTo') },
  { key: 'actions', label: '' },
])
const fetchData = async () => {
  loading.value = true
  try {
    const r = await api.assets.list({ page: String(page.value), limit: '20' })
    items.value = r.data; meta.value = r.meta
  } catch {} finally { loading.value = false }
}
const openEdit = (row: any) => {
  editId.value = row.id
  Object.assign(form, { assetName: row.assetName, assetType: row.assetType, serialNumber: row.serialNumber || '', status: row.status, employeeId: row.employeeId || '' })
  showForm.value = true
}
const save = async () => {
  saving.value = true
  try {
    const body: any = { ...form }
    if (body.employeeId) body.employeeId = Number(body.employeeId); else delete body.employeeId
    if (editId.value) await api.assets.update(editId.value, body)
    else await api.assets.create(body)
    toast.add({ title: t('common.save'), color: 'green' })
    showForm.value = false; editId.value = null; fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { saving.value = false }
}
const remove = async (id: number) => {
  try { await api.assets.remove(id); toast.add({ title: t('common.delete'), color: 'green' }); fetchData() } catch {}
}
watch(page, fetchData)
onMounted(fetchData)
</script>
