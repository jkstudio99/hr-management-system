<template>
  <div>
    <PageHeader :title="t('documents.title')" :description="t('common.total') + ': ' + meta.total">
      <USelect v-model="filterCategory" :options="categoryOptions" :placeholder="t('common.all')" size="sm" class="w-40" @change="fetchData" />
      <UButton v-if="auth.isAdminOrHR" icon="i-heroicons-plus" :label="t('documents.add')" @click="showForm = true" />
    </PageHeader>
    <UCard>
      <UTable :rows="items" :columns="columns" :loading="loading">
        <template #title-data="{ row }">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-gray-400 shrink-0" />
            <span class="text-subhead font-medium truncate">{{ row.title }}</span>
          </div>
        </template>
        <template #category-data="{ row }"><UBadge variant="subtle" color="blue" size="xs">{{ row.category }}</UBadge></template>
        <template #employee-data="{ row }">{{ row.employee ? `${row.employee.firstName} ${row.employee.lastName}` : 'Company' }}</template>
        <template #createdAt-data="{ row }">{{ new Date(row.createdAt).toLocaleDateString('th-TH') }}</template>
        <template #actions-data="{ row }">
          <div class="flex gap-1">
            <UButton icon="i-heroicons-arrow-down-tray" variant="ghost" size="xs" color="blue" :href="row.fileUrl" target="_blank" as="a" />
            <UButton v-if="auth.isAdminOrHR" icon="i-heroicons-trash" variant="ghost" size="xs" color="red" :loading="deletingId === row.id" @click="remove(row.id)" />
          </div>
        </template>
      </UTable>
      <div class="flex items-center justify-between mt-4 px-1">
        <p class="text-caption-size text-gray-500">{{ meta.total }} {{ t('documents.title').toLowerCase() }}</p>
        <UPagination v-model="page" :page-count="meta.limit" :total="meta.total" size="sm" />
      </div>
    </UCard>
    <UModal v-model="showForm">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ t('documents.add') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showForm = false" />
          </div>
        </template>
        <form @submit.prevent="save" class="space-y-4">
          <UFormGroup :label="t('common.name')" required><UInput v-model="form.title" /></UFormGroup>
          <UFormGroup :label="t('documents.category')" required>
            <USelect v-model="form.category" :options="['CONTRACT','CERTIFICATE','POLICY','FORM','OTHER']" />
          </UFormGroup>
          <UFormGroup :label="t('documents.fileUrl')" required><UInput v-model="form.fileUrl" placeholder="https://..." /></UFormGroup>
          <UFormGroup label="Employee ID (optional)"><UInput v-model="form.employeeId" type="number" /></UFormGroup>
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
import type { Document } from '~/types'
useHead({ title: 'Documents' })
const { t } = useI18n()
const api = useApiService()
const auth = useAuthStore()
const toast = useToast()
const items = ref<Document[]>([])
const meta = ref({ total: 0, page: 1, limit: 20, totalPages: 0 })
const loading = ref(false)
const saving = ref(false)
const deletingId = ref<number | null>(null)
const page = ref(1)
const filterCategory = ref('')
const showForm = ref(false)
const form = reactive({ title: '', category: 'OTHER', fileUrl: '', employeeId: '' })
const categoryOptions = [{ label: 'All', value: '' }, 'CONTRACT', 'CERTIFICATE', 'POLICY', 'FORM', 'OTHER'].map(v => typeof v === 'string' ? { label: v, value: v } : v)
const columns = [{ key: 'title', label: 'Title' }, { key: 'category', label: 'Category' }, { key: 'employee', label: 'Employee' }, { key: 'createdAt', label: 'Date' }, { key: 'actions', label: '' }]
const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = { page: String(page.value), limit: '20' }
    if (filterCategory.value) params.category = filterCategory.value
    const res = await api.documents.list(params)
    items.value = res.data; meta.value = res.meta
  } catch { } finally { loading.value = false }
}
const save = async () => {
  saving.value = true
  try {
    const body: any = { title: form.title, category: form.category, fileUrl: form.fileUrl }
    if (form.employeeId) body.employeeId = Number(form.employeeId)
    await api.documents.create(body)
    toast.add({ title: 'Document saved', color: 'green', icon: 'i-heroicons-check-circle' })
    showForm.value = false; fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { saving.value = false }
}
const remove = async (id: number) => {
  deletingId.value = id
  try { await api.documents.remove(id); toast.add({ title: 'Deleted', color: 'green' }); fetchData() }
  catch { } finally { deletingId.value = null }
}
watch([page, filterCategory], fetchData); onMounted(fetchData)
</script>
