<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <UButton icon="i-heroicons-arrow-left" variant="ghost" size="sm" to="/recruitment">Back</UButton>
      <div class="min-w-0 flex-1">
        <h1 class="text-title-2 truncate">{{ posting?.title }}</h1>
        <p class="text-subhead text-gray-500">{{ posting?.location || 'Remote' }}</p>
      </div>
      <StatusBadge v-if="posting" :status="posting.status" class="shrink-0" />
      <div v-if="posting" class="flex gap-2 shrink-0">
        <USelect :model-value="posting.status" :options="['OPEN','ON_HOLD','CLOSED']" size="xs" class="w-28" @update:model-value="(v) => updateStatus(v)" />
        <UButton icon="i-heroicons-trash" variant="ghost" size="xs" color="red" @click="removePosting" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <UCard>
          <template #header><h3 class="text-headline">Description</h3></template>
          <p class="text-body text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ posting?.description }}</p>
        </UCard>
        <UCard v-if="posting?.requirements">
          <template #header><h3 class="text-headline">Requirements</h3></template>
          <p class="text-body text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ posting?.requirements }}</p>
        </UCard>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-headline">Applicants ({{ applicants.length }})</h3>
              <UButton size="xs" icon="i-heroicons-plus" @click="showApplicantForm = true">Add Applicant</UButton>
            </div>
          </template>
          <div v-if="applicants.length" class="space-y-2">
            <div v-for="a in applicants" :key="a.id" class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-800">
              <div>
                <p class="text-subhead font-medium">{{ a.name }}</p>
                <p class="text-caption-size text-gray-500">{{ a.email }}</p>
              </div>
              <div class="flex items-center gap-2">
                <StatusBadge :status="a.stage" />
                <USelect
                  :model-value="a.stage"
                  :options="stages"
                  size="xs"
                  class="w-32"
                  @update:model-value="(v) => updateStage(a.id, v)"
                />
              </div>
            </div>
          </div>
          <p v-else class="text-subhead text-gray-400 text-center py-6">No applicants yet</p>
        </UCard>
      </div>

      <div class="space-y-4">
        <UCard>
          <template #header><h3 class="text-headline">Details</h3></template>
          <dl class="space-y-3">
            <div v-if="posting?.salaryMin || posting?.salaryMax">
              <dt class="text-caption-size text-gray-500">Salary Range</dt>
              <dd class="text-subhead font-medium">
                ฿{{ posting?.salaryMin?.toLocaleString('th-TH') || '?' }} – {{ posting?.salaryMax?.toLocaleString('th-TH') || '?' }}
              </dd>
            </div>
            <div>
              <dt class="text-caption-size text-gray-500">Posted</dt>
              <dd class="text-subhead">{{ posting ? new Date(posting.createdAt).toLocaleDateString('th-TH') : '—' }}</dd>
            </div>
          </dl>
        </UCard>
      </div>
    </div>

    <UModal v-model="showApplicantForm">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">Add Applicant</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showApplicantForm = false" />
          </div>
        </template>
        <form @submit.prevent="addApplicant" class="space-y-4">
          <UFormGroup label="Full Name" required><UInput v-model="appForm.name" /></UFormGroup>
          <UFormGroup label="Email" required><UInput v-model="appForm.email" type="email" /></UFormGroup>
          <UFormGroup label="Phone"><UInput v-model="appForm.phone" /></UFormGroup>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" @click="showApplicantForm = false">Cancel</UButton>
            <UButton type="submit" :loading="savingApp">Add</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { JobPosting, Applicant } from '~/types'

const route = useRoute()
const api = useApiService()
const toast = useToast()
const id = Number(route.params.id)

const posting = ref<JobPosting | null>(null)
const applicants = ref<Applicant[]>([])
const showApplicantForm = ref(false)
const savingApp = ref(false)
const appForm = reactive({ name: '', email: '', phone: '' })
const stages = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED']

useHead({ title: computed(() => posting.value?.title || 'Job Posting') })

const fetchPosting = async () => {
  try {
    const p = await api.recruitment.getPosting(id)
    posting.value = p
    applicants.value = (p as any).applicants || []
  } catch { }
}

const addApplicant = async () => {
  savingApp.value = true
  try {
    const a = await api.recruitment.createApplicant(id, appForm)
    applicants.value.push(a)
    toast.add({ title: 'Applicant added', color: 'green', icon: 'i-heroicons-check-circle' })
    showApplicantForm.value = false
    Object.assign(appForm, { name: '', email: '', phone: '' })
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message, color: 'red' })
  } finally { savingApp.value = false }
}

const updateStage = async (applicantId: number, stage: string) => {
  try {
    await api.recruitment.updateStage(applicantId, stage)
    toast.add({ title: 'Stage updated', color: 'green' })
  } catch { }
}

const updateStatus = async (status: string) => {
  try {
    await api.recruitment.updatePosting(id, { status } as any)
    toast.add({ title: 'Status updated', color: 'green' })
    fetchPosting()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) }
}

const removePosting = async () => {
  try {
    await api.recruitment.removePosting(id)
    toast.add({ title: 'Posting deleted', color: 'green' })
    navigateTo('/recruitment')
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) }
}

onMounted(fetchPosting)
</script>
