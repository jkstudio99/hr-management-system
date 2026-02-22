<template>
  <div>
    <PageHeader :title="t('shifts.title')" :description="t('shifts.schedule')">
      <UButton v-if="auth.isAdminOrHR" icon="i-heroicons-plus" :label="t('shifts.add')" @click="showShiftForm = true" />
    </PageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <!-- Shift Definitions -->
      <UCard>
        <template #header><h3 class="text-headline">{{ t('shifts.title') }}</h3></template>
        <div class="space-y-2">
          <div v-for="s in shifts" :key="s.id" class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-800">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: s.color || '#F97316' }" />
              <div>
                <p class="text-subhead font-medium">{{ s.name }}</p>
                <p class="text-caption-size text-gray-500">{{ s.startTime }} – {{ s.endTime }}</p>
              </div>
            </div>
            <UButton v-if="auth.isAdminOrHR" icon="i-heroicons-user-plus" size="xs" variant="ghost" @click="openAssign(s.id)" />
          </div>
          <p v-if="!shifts.length" class="text-subhead text-gray-400 text-center py-6">{{ t('common.noData') }}</p>
        </div>
      </UCard>

      <!-- Schedule -->
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ t('shifts.schedule') }}</h3>
            <UInput v-model="scheduleDate" type="date" size="xs" class="w-36" @change="fetchSchedule" />
          </div>
        </template>
        <UTable :rows="schedule" :columns="schedColumns" :loading="loading">
          <template #employee-data="{ row }">{{ row.employee?.firstName }} {{ row.employee?.lastName }}</template>
          <template #shift-data="{ row }">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: row.shift?.color || '#F97316' }" />
              <span class="text-subhead">{{ row.shift?.name }}</span>
            </div>
          </template>
          <template #date-data="{ row }">{{ new Date(row.date).toLocaleDateString('th-TH') }}</template>
        </UTable>
      </UCard>
    </div>

    <!-- New Shift Modal -->
    <UModal v-model="showShiftForm">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ t('shifts.add') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showShiftForm = false" />
          </div>
        </template>
        <form @submit.prevent="saveShift" class="space-y-4">
          <UFormGroup :label="t('shifts.shiftName')" required><UInput v-model="shiftForm.name" /></UFormGroup>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup :label="t('shifts.startTime')" required><UInput v-model="shiftForm.startTime" placeholder="08:00" /></UFormGroup>
            <UFormGroup :label="t('shifts.endTime')" required><UInput v-model="shiftForm.endTime" placeholder="17:00" /></UFormGroup>
          </div>
          <UFormGroup :label="t('common.type')">
            <div class="flex items-center gap-3">
              <input v-model="shiftForm.color" type="color" class="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer" />
              <span class="text-subhead text-gray-500">{{ shiftForm.color }}</span>
            </div>
          </UFormGroup>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" @click="showShiftForm = false">{{ t('common.cancel') }}</UButton>
            <UButton type="submit" :loading="saving">{{ t('common.save') }}</UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Assign Shift Modal -->
    <UModal v-model="showAssignForm">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ t('shifts.assign') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showAssignForm = false" />
          </div>
        </template>
        <form @submit.prevent="assignShift" class="space-y-4">
          <UFormGroup label="Employee ID" required><UInput v-model="assignForm.employeeId" type="number" /></UFormGroup>
          <UFormGroup :label="t('common.date')" required><UInput v-model="assignForm.date" type="date" /></UFormGroup>
          <UFormGroup :label="t('common.description')"><UInput v-model="assignForm.note" /></UFormGroup>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" @click="showAssignForm = false">{{ t('common.cancel') }}</UButton>
            <UButton type="submit" :loading="assigning">{{ t('shifts.assign') }}</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Shift, ShiftAssignment } from '~/types'
useHead({ title: 'Shifts & Roster' })
const { t } = useI18n()
const api = useApiService()
const auth = useAuthStore()
const toast = useToast()
const shifts = ref<Shift[]>([])
const schedule = ref<ShiftAssignment[]>([])
const loading = ref(false)
const saving = ref(false)
const assigning = ref(false)
const showShiftForm = ref(false)
const showAssignForm = ref(false)
const scheduleDate = ref(new Date().toISOString().split('T')[0])
const selectedShiftId = ref<number | null>(null)
const shiftForm = reactive({ name: '', startTime: '', endTime: '', color: '#F97316' })
const assignForm = reactive({ employeeId: '', date: new Date().toISOString().split('T')[0], note: '' })
const schedColumns = [{ key: 'employee', label: 'Employee' }, { key: 'shift', label: 'Shift' }, { key: 'date', label: 'Date' }, { key: 'note', label: 'Note' }]

const fetchShifts = async () => { try { shifts.value = await api.shifts.list() } catch { } }
const fetchSchedule = async () => {
  loading.value = true
  try { schedule.value = await api.shifts.schedule({ date: scheduleDate.value }) }
  catch { } finally { loading.value = false }
}
const saveShift = async () => {
  saving.value = true
  try {
    await api.shifts.create(shiftForm)
    toast.add({ title: 'Shift created', color: 'green', icon: 'i-heroicons-check-circle' })
    showShiftForm.value = false; fetchShifts()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { saving.value = false }
}
const openAssign = (shiftId: number) => { selectedShiftId.value = shiftId; assignForm.date = scheduleDate.value; showAssignForm.value = true }
const assignShift = async () => {
  assigning.value = true
  try {
    await api.shifts.assign({ shiftId: selectedShiftId.value!, employeeId: Number(assignForm.employeeId), date: assignForm.date, note: assignForm.note || undefined })
    toast.add({ title: 'Shift assigned', color: 'green', icon: 'i-heroicons-check-circle' })
    showAssignForm.value = false; fetchSchedule()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { assigning.value = false }
}
onMounted(() => { fetchShifts(); fetchSchedule() })
</script>
