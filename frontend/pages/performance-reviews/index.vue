<template>
  <div>
    <PageHeader :title="t('performance.title')" :description="t('common.total') + ': ' + meta.total">
      <UButton icon="i-heroicons-plus" :label="t('performance.add')" @click="showForm = true" />
    </PageHeader>
    <UCard>
      <UTable :rows="items" :columns="columns" :loading="loading">
        <template #employee-data="{ row }">{{ row.employee?.firstName }} {{ row.employee?.lastName }}</template>
        <template #overallScore-data="{ row }"><UBadge variant="subtle" :color="row.overallScore >= 4 ? 'green' : row.overallScore >= 3 ? 'amber' : 'red'">{{ row.overallScore }}/5</UBadge></template>
        <template #reviewDate-data="{ row }">{{ new Date(row.reviewDate).toLocaleDateString() }}</template>
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
        <template #header><h3 class="text-headline">{{ editId ? t('common.edit') : t('performance.add') }}</h3></template>
        <form @submit.prevent="save" class="space-y-4">
          <UFormGroup label="Employee ID"><UInput v-model="form.employeeId" type="number" required /></UFormGroup>
          <UFormGroup :label="t('performance.reviewer')"><UInput v-model="form.reviewerName" required /></UFormGroup>
          <UFormGroup :label="t('performance.period')"><UInput v-model="form.reviewPeriod" placeholder="2026-Q1" required /></UFormGroup>
          <UFormGroup :label="t('performance.score') + ' (1-5)'"><UInput v-model="form.overallScore" type="number" min="1" max="5" required /></UFormGroup>
          <UFormGroup :label="t('performance.comments')"><UTextarea v-model="form.comments" /></UFormGroup>
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
useHead({ title: 'Performance Reviews' })
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
const form = reactive({ employeeId: '', reviewerName: '', reviewPeriod: '', overallScore: '3', comments: '' })
const columns = computed(() => [
  { key: 'id', label: 'ID' },
  { key: 'employee', label: t('employees.title') },
  { key: 'reviewerName', label: t('performance.reviewer') },
  { key: 'reviewPeriod', label: t('performance.period') },
  { key: 'overallScore', label: t('performance.score') },
  { key: 'reviewDate', label: t('common.date') },
  { key: 'actions', label: '' },
])
const fetchData = async () => {
  loading.value = true
  try {
    const r = await api.performanceReviews.list({ page: String(page.value), limit: '20' })
    items.value = r.data; meta.value = r.meta
  } catch {} finally { loading.value = false }
}
const openEdit = (row: any) => {
  editId.value = row.id
  Object.assign(form, { employeeId: row.employeeId, reviewerName: row.reviewerName, reviewPeriod: row.reviewPeriod, overallScore: row.overallScore, comments: row.comments || '' })
  showForm.value = true
}
const save = async () => {
  saving.value = true
  try {
    const body = { ...form, employeeId: Number(form.employeeId), overallScore: Number(form.overallScore) }
    if (editId.value) await api.performanceReviews.update(editId.value, body)
    else await api.performanceReviews.create(body)
    toast.add({ title: t('common.save'), color: 'green' })
    showForm.value = false; editId.value = null; fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { saving.value = false }
}
const remove = async (id: number) => {
  try { await api.performanceReviews.remove(id); toast.add({ title: t('common.delete'), color: 'green' }); fetchData() } catch {}
}
watch(page, fetchData); onMounted(fetchData)
</script>
