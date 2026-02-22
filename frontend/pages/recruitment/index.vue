<template>
  <div>
    <PageHeader :title="t('recruitment.title')" :description="t('common.total') + ': ' + items.length">
      <USelect v-model="filterStatus" :options="statusOptions" :placeholder="t('common.all')" size="sm" class="w-36" @change="fetchData" />
      <UButton v-if="auth.isAdminOrHR" icon="i-heroicons-plus" :label="t('recruitment.addPosting')" @click="showForm = true" />
    </PageHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="p in items" :key="p.id" class="card-hover cursor-pointer" @click="navigateTo(`/recruitment/${p.id}`)">
        <div class="flex items-start justify-between mb-3">
          <div class="min-w-0 flex-1">
            <h3 class="text-headline truncate">{{ p.title }}</h3>
            <p class="text-caption-size text-gray-500 mt-0.5">{{ p.location || 'Remote' }}</p>
          </div>
          <StatusBadge :status="p.status" class="shrink-0 ml-2" />
        </div>
        <p class="text-subhead text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{{ p.description }}</p>
        <div class="flex items-center justify-between">
          <UBadge variant="subtle" color="blue" size="xs">
            <UIcon name="i-heroicons-users" class="w-3 h-3 mr-1" />
            {{ p._count?.applicants || 0 }} applicants
          </UBadge>
          <span v-if="p.salaryMin || p.salaryMax" class="text-caption-size text-gray-500">
            ฿{{ p.salaryMin?.toLocaleString('th-TH') || '?' }} – {{ p.salaryMax?.toLocaleString('th-TH') || '?' }}
          </span>
        </div>
      </UCard>
      <div v-if="!loading && !items.length" class="col-span-full text-center py-16 text-gray-400">
        <UIcon name="i-heroicons-megaphone" class="w-12 h-12 mx-auto mb-3" />
        <p class="text-subhead">No job postings</p>
      </div>
    </div>

    <UModal v-model="showForm" :ui="{ width: 'sm:max-w-2xl' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ t('recruitment.addPosting') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showForm = false" />
          </div>
        </template>
        <form @submit.prevent="save" class="space-y-4">
          <UFormGroup label="Job Title" required><UInput v-model="form.title" placeholder="Senior Software Engineer" /></UFormGroup>
          <UFormGroup label="Description" required><UTextarea v-model="form.description" rows="3" /></UFormGroup>
          <UFormGroup label="Requirements"><UTextarea v-model="form.requirements" rows="3" /></UFormGroup>
          <UFormGroup label="Location"><UInput v-model="form.location" placeholder="Bangkok / Remote" /></UFormGroup>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Min Salary (฿)"><UInput v-model="form.salaryMin" type="number" /></UFormGroup>
            <UFormGroup label="Max Salary (฿)"><UInput v-model="form.salaryMax" type="number" /></UFormGroup>
          </div>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" @click="showForm = false">Cancel</UButton>
            <UButton type="submit" :loading="saving">Create Posting</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { JobPosting } from '~/types'
useHead({ title: 'Recruitment' })
const { t } = useI18n()
const api = useApiService()
const auth = useAuthStore()
const toast = useToast()
const items = ref<JobPosting[]>([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const filterStatus = ref('')
const form = reactive({ title: '', description: '', requirements: '', location: '', salaryMin: '', salaryMax: '' })
const statusOptions = [{ label: 'All', value: '' }, { label: 'Open', value: 'OPEN' }, { label: 'On Hold', value: 'ON_HOLD' }, { label: 'Closed', value: 'CLOSED' }]
const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = { limit: '50' }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await api.recruitment.listPostings(params)
    items.value = res.data
  } catch { } finally { loading.value = false }
}
const save = async () => {
  saving.value = true
  try {
    const body: any = { title: form.title, description: form.description }
    if (form.requirements) body.requirements = form.requirements
    if (form.location) body.location = form.location
    if (form.salaryMin) body.salaryMin = Number(form.salaryMin)
    if (form.salaryMax) body.salaryMax = Number(form.salaryMax)
    await api.recruitment.createPosting(body)
    toast.add({ title: 'Job posting created', color: 'green', icon: 'i-heroicons-check-circle' })
    showForm.value = false; fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { saving.value = false }
}
watch(filterStatus, fetchData); onMounted(fetchData)
</script>
