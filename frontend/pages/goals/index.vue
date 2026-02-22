<template>
  <div>
    <PageHeader :title="t('goals.title')" :description="t('common.total') + ': ' + items.length">
      <UInput v-model="filterPeriod" :placeholder="t('goals.period')" size="sm" class="w-48" @input="fetchData" />
      <UButton icon="i-heroicons-plus" :label="t('goals.add')" @click="showForm = true" />
    </PageHeader>

    <div class="space-y-4">
      <UCard v-for="g in items" :key="g.id" class="card-hover">
        <div class="flex items-start justify-between mb-3">
          <div class="min-w-0 flex-1">
            <h3 class="text-headline truncate">{{ g.title }}</h3>
            <p class="text-caption-size text-gray-500 mt-0.5">
              {{ g.employee?.firstName }} {{ g.employee?.lastName }} · {{ g.period }}
            </p>
          </div>
          <div class="flex items-center gap-2 shrink-0 ml-3">
            <StatusBadge :status="g.status" />
            <UBadge variant="subtle" color="orange" size="xs">{{ g.progress || 0 }}%</UBadge>
          </div>
        </div>
        <p v-if="g.description" class="text-subhead text-gray-500 mb-3 line-clamp-2">{{ g.description }}</p>

        <!-- Key Results -->
        <div v-if="g.keyResults?.length" class="space-y-2 mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
          <p class="text-caption-size text-gray-400 font-medium uppercase tracking-wider">{{ t('goals.keyResults') }}</p>
          <div v-for="kr in g.keyResults" :key="kr.id" class="space-y-1">
            <div class="flex items-center justify-between text-subhead">
              <span class="truncate flex-1">{{ kr.title }}</span>
              <span class="text-caption-size text-gray-500 ml-2 shrink-0">{{ kr.currentValue }}/{{ kr.targetValue }} {{ kr.unit }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill" :style="{ width: `${Math.min(((kr.currentValue || 0) / kr.targetValue) * 100, 100)}%` }" />
            </div>
          </div>
        </div>
      </UCard>
      <div v-if="!loading && !items.length" class="text-center py-16 text-gray-400">
        <UIcon name="i-heroicons-flag" class="w-12 h-12 mx-auto mb-3" />
        <p class="text-subhead">{{ t('common.noData') }}</p>
      </div>
    </div>

    <UModal v-model="showForm" :ui="{ width: 'sm:max-w-xl' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ t('goals.add') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showForm = false" />
          </div>
        </template>
        <form @submit.prevent="save" class="space-y-4">
          <UFormGroup label="Employee ID" required><UInput v-model="form.employeeId" type="number" /></UFormGroup>
          <UFormGroup :label="t('common.name')" required><UInput v-model="form.title" /></UFormGroup>
          <UFormGroup :label="t('goals.period')" required><UInput v-model="form.period" placeholder="2026-Q1" /></UFormGroup>
          <UFormGroup :label="t('common.description')"><UTextarea v-model="form.description" rows="3" /></UFormGroup>
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
import type { Goal } from '~/types'
useHead({ title: 'Goals & OKR' })
const { t } = useI18n()
const api = useApiService()
const toast = useToast()
const items = ref<Goal[]>([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const filterPeriod = ref('')
const form = reactive({ employeeId: '', title: '', period: '', description: '' })

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = { limit: '50' }
    if (filterPeriod.value) params.period = filterPeriod.value
    const res = await api.goals.list(params)
    items.value = res.data
  } catch { } finally { loading.value = false }
}
const save = async () => {
  saving.value = true
  try {
    await api.goals.create({ employeeId: Number(form.employeeId), title: form.title, period: form.period, description: form.description || undefined })
    toast.add({ title: 'Goal created', color: 'green', icon: 'i-heroicons-check-circle' })
    showForm.value = false; fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { saving.value = false }
}
onMounted(fetchData)
</script>
