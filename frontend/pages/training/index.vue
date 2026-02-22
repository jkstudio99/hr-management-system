<template>
  <div>
    <PageHeader :title="t('training.title')" :description="t('common.total') + ': ' + items.length">
      <UButton v-if="auth.isAdminOrHR" icon="i-heroicons-plus" :label="t('training.addCourse')" @click="showForm = true" />
    </PageHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="c in items" :key="c.id" class="card-hover">
        <div class="flex items-start justify-between mb-2">
          <h3 class="text-headline flex-1 truncate">{{ c.title }}</h3>
          <StatusBadge :status="c.isActive ? 'ACTIVE' : 'INACTIVE'" class="shrink-0 ml-2" />
        </div>
        <p class="text-subhead text-gray-500 line-clamp-2 mb-4">{{ c.description || t('common.noData') }}</p>
        <div class="flex items-center justify-between text-caption-size text-gray-500">
          <span v-if="c.instructor" class="flex items-center gap-1">
            <UIcon name="i-heroicons-user" class="w-3 h-3" />{{ c.instructor }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon name="i-heroicons-users" class="w-3 h-3" />
            {{ c._count?.enrollments || 0 }}{{ c.maxCapacity ? `/${c.maxCapacity}` : '' }} {{ t('training.enrollments') }}
          </span>
        </div>
        <div v-if="auth.isAdminOrHR" class="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 flex gap-2">
          <UButton size="xs" variant="soft" icon="i-heroicons-user-plus" @click="openEnroll(c.id)">{{ t('training.enroll') }}</UButton>
          <UButton size="xs" variant="ghost" color="gray" icon="i-heroicons-pencil-square" @click="openEdit(c)" />
        </div>
      </UCard>
      <div v-if="!loading && !items.length" class="col-span-full text-center py-16 text-gray-400">
        <UIcon name="i-heroicons-academic-cap" class="w-12 h-12 mx-auto mb-3" />
        <p class="text-subhead">{{ t('common.noData') }}</p>
      </div>
    </div>

    <!-- Create/Edit Course Modal -->
    <UModal v-model="showForm">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ editId ? t('common.edit') : t('training.addCourse') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showForm = false" />
          </div>
        </template>
        <form @submit.prevent="save" class="space-y-4">
          <UFormGroup :label="t('training.courseTitle')" required><UInput v-model="form.title" /></UFormGroup>
          <UFormGroup :label="t('common.description')"><UTextarea v-model="form.description" rows="3" /></UFormGroup>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup :label="t('training.instructor')"><UInput v-model="form.instructor" /></UFormGroup>
            <UFormGroup :label="t('training.capacity')"><UInput v-model="form.maxCapacity" type="number" min="1" /></UFormGroup>
          </div>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" @click="showForm = false">{{ t('common.cancel') }}</UButton>
            <UButton type="submit" :loading="saving">{{ t('common.save') }}</UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Enroll Modal -->
    <UModal v-model="showEnroll">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ t('training.enroll') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showEnroll = false" />
          </div>
        </template>
        <form @submit.prevent="enroll" class="space-y-4">
          <UFormGroup label="Employee ID" required><UInput v-model="enrollEmpId" type="number" /></UFormGroup>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" @click="showEnroll = false">{{ t('common.cancel') }}</UButton>
            <UButton type="submit" :loading="enrolling">{{ t('training.enroll') }}</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { TrainingCourse } from '~/types'
useHead({ title: 'Training' })
const { t } = useI18n()
const api = useApiService()
const auth = useAuthStore()
const toast = useToast()
const items = ref<TrainingCourse[]>([])
const loading = ref(false)
const saving = ref(false)
const enrolling = ref(false)
const showForm = ref(false)
const showEnroll = ref(false)
const editId = ref<number | null>(null)
const enrollCourseId = ref<number | null>(null)
const enrollEmpId = ref('')
const form = reactive({ title: '', description: '', instructor: '', maxCapacity: '' })

const fetchData = async () => {
  loading.value = true
  try { const res = await api.training.listCourses({ limit: '50' }); items.value = res.data }
  catch { } finally { loading.value = false }
}
const openEdit = (c: TrainingCourse) => {
  editId.value = c.id
  Object.assign(form, { title: c.title, description: c.description || '', instructor: c.instructor || '', maxCapacity: c.maxCapacity ? String(c.maxCapacity) : '' })
  showForm.value = true
}
const save = async () => {
  saving.value = true
  try {
    const body: any = { title: form.title, description: form.description, instructor: form.instructor }
    if (form.maxCapacity) body.maxCapacity = Number(form.maxCapacity)
    if (editId.value) await api.training.updateCourse(editId.value, body)
    else await api.training.createCourse(body)
    toast.add({ title: editId.value ? 'Course updated' : 'Course created', color: 'green', icon: 'i-heroicons-check-circle' })
    showForm.value = false; editId.value = null; fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { saving.value = false }
}
const openEnroll = (courseId: number) => { enrollCourseId.value = courseId; enrollEmpId.value = ''; showEnroll.value = true }
const enroll = async () => {
  enrolling.value = true
  try {
    await api.training.enroll(enrollCourseId.value!, Number(enrollEmpId.value))
    toast.add({ title: 'Enrolled successfully', color: 'green', icon: 'i-heroicons-check-circle' })
    showEnroll.value = false; fetchData()
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) } finally { enrolling.value = false }
}
onMounted(fetchData)
</script>
