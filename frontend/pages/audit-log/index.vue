<template>
  <div>
    <PageHeader :title="t('auditLog.title')" :description="t('common.total') + ': ' + meta.total">
      <USelect v-model="filterEntity" :options="entityOptions" placeholder="All Entities" size="sm" class="w-40" @change="fetchData" />
      <USelect v-model="filterAction" :options="actionOptions" placeholder="All Actions" size="sm" class="w-36" @change="fetchData" />
    </PageHeader>
    <UCard>
      <UTable :rows="items" :columns="columns" :loading="loading">
        <template #action-data="{ row }">
          <UBadge :color="row.action === 'DELETE' ? 'red' : row.action === 'CREATE' ? 'green' : 'blue'" variant="subtle" size="xs">{{ row.action }}</UBadge>
        </template>
        <template #entity-data="{ row }">
          <UBadge variant="subtle" color="gray" size="xs">{{ row.entity }}</UBadge>
        </template>
        <template #createdAt-data="{ row }">
          <span class="text-caption-size text-gray-500">{{ new Date(row.createdAt).toLocaleString('th-TH') }}</span>
        </template>
      </UTable>
      <div class="flex items-center justify-between mt-4 px-1">
        <p class="text-caption-size text-gray-500">{{ meta.total }} records</p>
        <UPagination v-model="page" :page-count="meta.limit" :total="meta.total" size="sm" />
      </div>
    </UCard>
  </div>
</template>
<script setup lang="ts">
import type { AuditLog } from '~/types'
useHead({ title: 'Audit Log' })
const api = useApiService()
const items = ref<AuditLog[]>([])
const meta = ref({ total: 0, page: 1, limit: 50, totalPages: 0 })
const loading = ref(false)
const page = ref(1)
const filterEntity = ref('')
const filterAction = ref('')
const entityOptions = [{ label: 'All Entities', value: '' }, 'Employee', 'Department', 'LeaveRequest', 'Asset', 'ExpenseClaim', 'PayrollRun'].map(v => typeof v === 'string' ? { label: v, value: v } : v)
const actionOptions = [{ label: 'All Actions', value: '' }, { label: 'CREATE', value: 'CREATE' }, { label: 'UPDATE', value: 'UPDATE' }, { label: 'DELETE', value: 'DELETE' }]
const { t } = useI18n()
const columns = computed(() => [
  { key: 'id', label: 'ID' },
  { key: 'username', label: t('auditLog.user') },
  { key: 'action', label: t('auditLog.action') },
  { key: 'entity', label: t('auditLog.entity') },
  { key: 'entityId', label: t('auditLog.entity') + ' ID' },
  { key: 'createdAt', label: t('auditLog.timestamp') },
])
const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = { page: String(page.value), limit: '50' }
    if (filterEntity.value) params.entity = filterEntity.value
    if (filterAction.value) params.action = filterAction.value
    const res = await api.auditLogs.list(params)
    items.value = res.data; meta.value = res.meta
  } catch { } finally { loading.value = false }
}
watch([page, filterEntity, filterAction], fetchData); onMounted(fetchData)
</script>
