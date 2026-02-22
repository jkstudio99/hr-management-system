<template>
  <div>
    <PageHeader :title="t('benefits.title')" :description="t('common.total') + ': ' + items.length">
      <UButton v-if="auth.isAdminOrHR" icon="i-heroicons-plus" :label="t('benefits.addPlan')" @click="showForm = true" />
    </PageHeader>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="p in items" :key="p.id" class="card-hover">
        <div class="flex items-start justify-between mb-3">
          <div class="min-w-0 flex-1">
            <h3 class="text-headline truncate">{{ p.name }}</h3>
            <UBadge variant="subtle" color="blue" size="xs" class="mt-1">{{ p.type }}</UBadge>
          </div>
          <StatusBadge :status="p.isActive ? 'ACTIVE' : 'INACTIVE'" class="shrink-0 ml-2" />
        </div>
        <p class="text-subhead text-gray-500 mb-4 line-clamp-2">{{ p.description || 'No description' }}</p>
        <div class="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800">
          <span class="text-caption-size text-gray-400">{{ p._count?.employees || 0 }} {{ t('training.enrollments') }}</span>
          <UButton v-if="auth.isAdminOrHR" size="xs" variant="soft" icon="i-heroicons-user-plus" @click="openEnroll(p.id)">{{ t('benefits.enroll') }}</UButton>
        </div>
      </UCard>
      <div v-if="!loading && !items.length" class="col-span-full text-center py-16 text-gray-400">
        <UIcon name="i-heroicons-heart" class="w-12 h-12 mx-auto mb-3" />
        <p class="text-subhead">{{ t('common.noData') }}</p>
      </div>
    </div>
    <UModal v-model="showForm">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ t('benefits.addPlan') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showForm = false" />
          </div>
        </template>
        <form @submit.prevent="save" class="space-y-4">
          <UFormGroup :label="t('benefits.planName')" required><UInput v-model="form.name" /></UFormGroup>
          <UFormGroup :label="t('benefits.type')" required>
            <USelect v-model="form.type" :options="['HEALTH','DENTAL','VISION','LIFE','PROVIDENT_FUND','OTHER']" />
          </UFormGroup>
          <UFormGroup :label="t('common.description')"><UTextarea v-model="form.description" rows="3" /></UFormGroup>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" @click="showForm = false">{{ t('common.cancel') }}</UButton>
            <UButton type="submit" :loading="saving">{{ t('common.save') }}</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
    <UModal v-model="showEnroll">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ t('benefits.enroll') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showEnroll = false" />
          </div>
        </template>
        <form @submit.prevent="enroll" class="space-y-4">
          <UFormGroup label="Employee ID" required><UInput v-model="enrollForm.employeeId" type="number" /></UFormGroup>
          <UFormGroup :label="t('leaveRequests.startDate')" required><UInput v-model="enrollForm.startDate" type="date" /></UFormGroup>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" @click="showEnroll = false">{{ t('common.cancel') }}</UButton>
            <UButton type="submit" :loading="enrolling">{{ t('benefits.enroll') }}</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
<script setup lang="ts">
import type { BenefitPlan } from '~/types'
useHead({ title: 'Benefits' })
const { t } = useI18n()
const api = useApiService()
const auth = useAuthStore()
const toast = useToast()
const items = ref<BenefitPlan[]>([])
const loading = ref(false)
const saving = ref(false)
const enrolling = ref(false)
const showForm = ref(false)
const showEnroll = ref(false)
const enrollPlanId = ref<number | null>(null)
const form = reactive({ name: '', type: 'HEALTH', description: '' })
const enrollForm = reactive({ employeeId: '', startDate: new Date().toISOString().split('T')[0] })
const fetchData = async () => {
  loading.value = true
  try { const res = await api.benefits.listPlans({ limit: '50' }); items.value = res.data }
  catch { } finally { loading.value = false }
}
const save = async () => {
  saving.value = true
  try {
    await api.benefits.createPlan(form)
    toast.add({ title: 'Plan created', color: 'green', icon: 'i-heroicons-check-circle' })
    showForm.value = false; fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { saving.value = false }
}
const openEnroll = (planId: number) => { enrollPlanId.value = planId; showEnroll.value = true }
const enroll = async () => {
  enrolling.value = true
  try {
    await api.benefits.enroll(enrollPlanId.value!, Number(enrollForm.employeeId), enrollForm.startDate)
    toast.add({ title: 'Enrolled successfully', color: 'green', icon: 'i-heroicons-check-circle' })
    showEnroll.value = false; fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { enrolling.value = false }
}
onMounted(fetchData)
</script>
