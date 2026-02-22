<template>
  <div>
    <PageHeader :title="t('departments.title')" :description="t('common.total') + ': ' + items.length">
      <UButton icon="i-heroicons-plus" :label="t('departments.add')" @click="showForm = true" />
    </PageHeader>
    <UCard>
      <UTable :rows="items" :columns="columns" :loading="loading">
        <template #employeeCount-data="{ row }">
          <UBadge variant="subtle" color="blue" size="xs">{{ row._count?.employees || 0 }}</UBadge>
        </template>
        <template #actions-data="{ row }">
          <div class="flex gap-1">
            <UButton icon="i-heroicons-pencil-square" variant="ghost" size="xs" @click="openEdit(row)" />
            <UButton icon="i-heroicons-trash" variant="ghost" size="xs" color="red" @click="remove(row.id)" />
          </div>
        </template>
      </UTable>
    </UCard>
    <UModal v-model="showForm">
      <UCard>
        <template #header><h3 class="text-headline">{{ editId ? t('departments.edit') : t('departments.add') }}</h3></template>
        <form @submit.prevent="save" class="space-y-4">
          <UFormGroup :label="t('departments.name')"><UInput v-model="form.departmentName" required /></UFormGroup>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="showForm = false">{{ t('common.cancel') }}</UButton>
            <UButton type="submit" :loading="saving">{{ t('common.save') }}</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
<script setup lang="ts">
useHead({ title: 'Departments' })
const api = useApiService()
const toast = useToast()
const { t } = useI18n()
const items = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const editId = ref<number | null>(null)
const form = reactive({ departmentName: '' })
const columns = computed(() => [
  { key: 'id', label: 'ID' },
  { key: 'departmentName', label: t('departments.name') },
  { key: 'employeeCount', label: t('departments.employeeCount') },
  { key: 'actions', label: '' },
])
const fetchData = async () => {
  loading.value = true
  try { items.value = await api.departments.list() } catch {} finally { loading.value = false }
}
const openEdit = (row: any) => { editId.value = row.id; form.departmentName = row.departmentName; showForm.value = true }
const save = async () => {
  saving.value = true
  try {
    if (editId.value) await api.departments.update(editId.value, form)
    else await api.departments.create(form)
    toast.add({ title: t('common.save'), color: 'green' })
    showForm.value = false; editId.value = null; form.departmentName = ''; fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { saving.value = false }
}
const remove = async (id: number) => {
  try { await api.departments.remove(id); toast.add({ title: t('common.delete'), color: 'green' }); fetchData() } catch {}
}
onMounted(fetchData)
</script>
