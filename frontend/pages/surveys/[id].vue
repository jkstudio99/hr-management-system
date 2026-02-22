<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <UButton icon="i-heroicons-arrow-left" variant="ghost" size="sm" to="/surveys">{{ t('common.back') }}</UButton>
      <div class="min-w-0 flex-1">
        <h1 class="text-title-2 truncate">{{ survey?.title }}</h1>
        <p class="text-subhead text-gray-500">{{ survey?.description }}</p>
      </div>
      <StatusBadge v-if="survey" :status="survey.isActive ? 'ACTIVE' : 'INACTIVE'" class="shrink-0" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Questions & Respond -->
      <div class="lg:col-span-2 space-y-4">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-headline">{{ t('surveys.questions') }} ({{ questions.length }})</h3>
            </div>
          </template>
          <div v-if="questions.length" class="space-y-4">
            <div v-for="(q, idx) in questions" :key="q.id" class="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800">
              <p class="text-subhead font-medium mb-2">{{ idx + 1 }}. {{ q.questionText }}</p>
              <UBadge variant="subtle" size="xs" color="blue">{{ q.questionType }}</UBadge>
              <!-- Response input -->
              <div class="mt-3">
                <UInput
                  v-if="q.questionType === 'TEXT'"
                  v-model="answers[q.id]"
                  :placeholder="t('surveys.answerPlaceholder')"
                />
                <USelect
                  v-else-if="q.questionType === 'RATING'"
                  v-model="answers[q.id]"
                  :options="['1','2','3','4','5']"
                  :placeholder="t('surveys.selectRating')"
                />
                <USelect
                  v-else-if="q.questionType === 'CHOICE' && q.options?.length"
                  v-model="answers[q.id]"
                  :options="q.options"
                  :placeholder="t('common.select')"
                />
                <UInput v-else v-model="answers[q.id]" :placeholder="t('surveys.answerPlaceholder')" />
              </div>
            </div>
          </div>
          <p v-else class="text-subhead text-gray-400 text-center py-6">{{ t('surveys.noQuestions') }}</p>
          <div v-if="questions.length && survey?.isActive" class="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
            <UButton :loading="submitting" icon="i-heroicons-paper-airplane" @click="submitResponses">
              {{ t('surveys.submit') }}
            </UButton>
          </div>
        </UCard>
      </div>

      <!-- Results Sidebar -->
      <div class="space-y-4">
        <UCard>
          <template #header><h3 class="text-headline">{{ t('surveys.results') }}</h3></template>
          <div v-if="results" class="space-y-4">
            <div v-for="r in results.questions" :key="r.questionId" class="space-y-1">
              <p class="text-subhead font-medium truncate">{{ r.questionText }}</p>
              <div v-if="r.averageRating != null" class="flex items-center gap-2">
                <div class="flex-1 bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                  <div class="bg-orange-500 h-2 rounded-full" :style="{ width: `${(r.averageRating / 5) * 100}%` }" />
                </div>
                <span class="text-caption-size font-semibold w-8 text-right">{{ r.averageRating?.toFixed(1) }}</span>
              </div>
              <div v-else-if="r.answers?.length" class="text-caption-size text-gray-500">
                {{ r.answers.length }} {{ t('surveys.responses') }}
              </div>
              <p v-else class="text-caption-size text-gray-400">{{ t('common.noData') }}</p>
            </div>
          </div>
          <div v-else-if="loadingResults" class="space-y-3">
            <div v-for="i in 3" :key="i" class="skeleton h-10 w-full" />
          </div>
          <p v-else class="text-subhead text-gray-400 text-center py-6">{{ t('surveys.noResults') }}</p>
        </UCard>

        <UCard>
          <template #header><h3 class="text-headline">{{ t('common.details') }}</h3></template>
          <dl class="space-y-3 text-sm">
            <div>
              <dt class="text-caption-size text-gray-500">{{ t('surveys.totalResponses') }}</dt>
              <dd class="font-medium">{{ results?.totalResponses ?? 0 }}</dd>
            </div>
            <div>
              <dt class="text-caption-size text-gray-500">{{ t('common.status') }}</dt>
              <dd><StatusBadge v-if="survey" :status="survey.isActive ? 'ACTIVE' : 'INACTIVE'" /></dd>
            </div>
            <div>
              <dt class="text-caption-size text-gray-500">{{ t('common.date') }}</dt>
              <dd>{{ survey ? new Date(survey.createdAt).toLocaleDateString('th-TH') : '—' }}</dd>
            </div>
          </dl>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const api = useApiService()
const toast = useToast()
const { t } = useI18n()
const id = Number(route.params.id)

const survey = ref<any>(null)
const questions = ref<any[]>([])
const results = ref<any>(null)
const loadingResults = ref(false)
const submitting = ref(false)
const answers = reactive<Record<number, string>>({})

useHead({ title: computed(() => survey.value?.title || 'Survey') })

const fetchSurvey = async () => {
  try {
    const s = await api.surveys.get(id)
    survey.value = s
    questions.value = (s as any).questions || []
  } catch { }
}

const fetchResults = async () => {
  loadingResults.value = true
  try {
    results.value = await api.surveys.results(id)
  } catch { }
  finally { loadingResults.value = false }
}

const submitResponses = async () => {
  submitting.value = true
  try {
    const responses = Object.entries(answers)
      .filter(([, v]) => v)
      .map(([qId, answer]) => ({ questionId: Number(qId), answer: String(answer) }))
    if (!responses.length) {
      toast.add({ title: 'Please answer at least one question', color: 'orange' })
      return
    }
    await api.surveys.respond(id, { responses })
    toast.add({ title: 'Response submitted', color: 'green', icon: 'i-heroicons-check-circle' })
    Object.keys(answers).forEach(k => delete answers[Number(k)])
    fetchResults()
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message, color: 'red' })
  } finally { submitting.value = false }
}

onMounted(() => { fetchSurvey(); fetchResults() })
</script>
