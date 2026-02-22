<template>
  <div>
    <PageHeader :title="t('surveys.title')" :description="t('common.total') + ': ' + items.length">
      <UButton v-if="auth.isAdminOrHR" icon="i-heroicons-plus" :label="t('surveys.add')" @click="showForm = true" />
    </PageHeader>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="s in items" :key="s.id" class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateTo(`/surveys/${s.id}`)">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-headline">{{ s.title }}</h3>
            <p class="text-caption-size text-gray-500 mt-1">{{ s.description }}</p>
          </div>
          <StatusBadge :status="s.isActive ? 'ACTIVE' : 'INACTIVE'" />
        </div>
        <div class="flex items-center gap-4 mt-4 text-caption-size text-gray-500">
          <span>{{ s._count?.questions || 0 }} {{ t('surveys.questions') }}</span>
          <span>{{ s._count?.responses || 0 }} {{ t('surveys.responses') }}</span>
        </div>
      </UCard>
    </div>
    <UModal v-model="showForm">
      <UCard>
        <template #header><h3 class="text-headline">{{ t('surveys.add') }}</h3></template>
        <form @submit.prevent="save" class="space-y-4">
          <UFormGroup :label="t('common.name')"><UInput v-model="form.title" required /></UFormGroup>
          <UFormGroup :label="t('common.description')"><UTextarea v-model="form.description" /></UFormGroup>
          <div class="flex justify-end gap-2"><UButton variant="ghost" @click="showForm = false">{{ t('common.cancel') }}</UButton><UButton type="submit" :loading="saving">{{ t('common.save') }}</UButton></div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
<script setup lang="ts">
useHead({ title: 'Surveys' })
const api = useApiService()
const toast = useToast()
const auth = useAuthStore()
const { t } = useI18n()
const items = ref<any[]>([])
const showForm = ref(false)
const saving = ref(false)
const form = reactive({ title: '', description: '' })
const fetchData = async () => {
  try {
    const r = await api.surveys.list({ limit: '50' })
    items.value = (r as any).data || r
  } catch {}
}
const save = async () => {
  saving.value = true
  try {
    await api.surveys.create(form)
    toast.add({ title: t('common.save'), color: 'green' })
    showForm.value = false; fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { saving.value = false }
}
onMounted(fetchData)
</script>
