<template>
  <div class="space-y-6">
    <!-- Welcome Banner -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-apple-lg">
      <div class="relative z-10">
        <p class="text-sm font-medium opacity-80">{{ t('ess.greeting') }},</p>
        <h1 class="text-title-1 mt-1">{{ auth.user?.username }}</h1>
        <p class="text-sm opacity-70 mt-1">{{ auth.user?.role }} · {{ today }}</p>
      </div>
      <div class="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
      <div class="absolute -right-4 -bottom-10 w-28 h-28 rounded-full bg-white/10" />
    </div>

    <!-- Quick Stats Row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <UCard v-for="stat in quickStats" :key="stat.key" class="text-center">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" :class="stat.bg">
          <UIcon :name="stat.icon" class="w-5 h-5" :class="stat.color" />
        </div>
        <p class="text-title-2 font-bold">{{ stat.value }}</p>
        <p class="text-caption-size text-gray-500 mt-0.5">{{ stat.label }}</p>
      </UCard>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Left: My Leave + My Expenses -->
      <div class="lg:col-span-2 space-y-6">

        <!-- My Leave Requests -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-headline">{{ t('ess.myLeave') }}</h2>
              <UButton size="xs" variant="soft" icon="i-heroicons-plus" @click="showLeaveForm = true">
                {{ t('leaveRequests.add') }}
              </UButton>
            </div>
          </template>
          <div v-if="myLeave.length" class="space-y-2">
            <div
              v-for="lr in myLeave.slice(0, 5)"
              :key="lr.id"
              class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-800"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-50 dark:bg-orange-950">
                  <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p class="text-subhead font-medium">{{ t(`leaveRequests.types.${lr.leaveType}`) }}</p>
                  <p class="text-caption-size text-gray-500">
                    {{ formatDate(lr.startDate) }} – {{ formatDate(lr.endDate) }}
                  </p>
                </div>
              </div>
              <StatusBadge :status="lr.status" />
            </div>
          </div>
          <div v-else-if="loadingLeave" class="space-y-2">
            <div v-for="i in 3" :key="i" class="skeleton h-14 w-full rounded-xl" />
          </div>
          <div v-else class="text-center py-8 text-gray-400">
            <UIcon name="i-heroicons-calendar-days" class="w-10 h-10 mx-auto mb-2" />
            <p class="text-subhead">{{ t('ess.noLeave') }}</p>
          </div>
          <div class="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
            <NuxtLink to="/leave-requests" class="text-sm text-orange-500 hover:underline flex items-center gap-1">
              {{ t('ess.viewAll') }} <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" />
            </NuxtLink>
          </div>
        </UCard>

        <!-- My Expense Claims -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-headline">{{ t('ess.myExpenses') }}</h2>
              <UButton size="xs" variant="soft" icon="i-heroicons-plus" @click="showExpenseForm = true">
                {{ t('expenseClaims.add') }}
              </UButton>
            </div>
          </template>
          <div v-if="myExpenses.length" class="space-y-2">
            <div
              v-for="ex in myExpenses.slice(0, 5)"
              :key="ex.id"
              class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-800"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-950">
                  <UIcon name="i-heroicons-receipt-percent" class="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p class="text-subhead font-medium truncate max-w-[160px]">{{ ex.title }}</p>
                  <p class="text-caption-size text-gray-500">฿{{ Number(ex.amount).toLocaleString('th-TH') }}</p>
                </div>
              </div>
              <StatusBadge :status="ex.status" />
            </div>
          </div>
          <div v-else-if="loadingExpenses" class="space-y-2">
            <div v-for="i in 3" :key="i" class="skeleton h-14 w-full rounded-xl" />
          </div>
          <div v-else class="text-center py-8 text-gray-400">
            <UIcon name="i-heroicons-receipt-percent" class="w-10 h-10 mx-auto mb-2" />
            <p class="text-subhead">{{ t('ess.noExpenses') }}</p>
          </div>
          <div class="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
            <NuxtLink to="/expense-claims" class="text-sm text-orange-500 hover:underline flex items-center gap-1">
              {{ t('ess.viewAll') }} <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" />
            </NuxtLink>
          </div>
        </UCard>
      </div>

      <!-- Right: Quick Actions + Announcements + Notifications -->
      <div class="space-y-6">

        <!-- Quick Actions -->
        <UCard>
          <template #header><h2 class="text-headline">{{ t('dashboard.quickActions') }}</h2></template>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="action in quickActions"
              :key="action.to"
              class="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors group"
              @click="navigateTo(action.to)"
            >
              <div class="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-700 shadow-sm group-hover:bg-orange-100 dark:group-hover:bg-orange-900 transition-colors">
                <UIcon :name="action.icon" class="w-5 h-5 text-gray-500 group-hover:text-orange-500 transition-colors" />
              </div>
              <span class="text-[11px] font-medium text-gray-600 dark:text-gray-400 group-hover:text-orange-600 text-center leading-tight">{{ action.label }}</span>
            </button>
          </div>
        </UCard>

        <!-- Recent Announcements -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-headline">{{ t('dashboard.recentAnnouncements') }}</h2>
              <NuxtLink to="/announcements" class="text-xs text-orange-500 hover:underline">{{ t('ess.viewAll') }}</NuxtLink>
            </div>
          </template>
          <div v-if="announcements.length" class="space-y-3">
            <div v-for="a in announcements.slice(0, 3)" :key="a.id" class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full mt-2 shrink-0" :class="a.isPinned ? 'bg-orange-500' : 'bg-gray-300'" />
              <div class="min-w-0">
                <p class="text-subhead font-medium truncate">{{ a.title }}</p>
                <p class="text-caption-size text-gray-500 line-clamp-2">{{ a.content }}</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-6 text-gray-400">
            <p class="text-caption-size">{{ t('common.noData') }}</p>
          </div>
        </UCard>

        <!-- My Notifications -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-headline">{{ t('notifications.title') }}</h2>
              <UBadge v-if="unreadCount > 0" color="red" size="xs">{{ unreadCount }}</UBadge>
            </div>
          </template>
          <div v-if="recentNotifs.length" class="space-y-2">
            <div
              v-for="n in recentNotifs.slice(0, 4)"
              :key="n.id"
              class="flex items-start gap-2 p-2 rounded-lg"
              :class="n.isRead ? 'opacity-60' : 'bg-orange-50 dark:bg-orange-950/30'"
            >
              <UIcon :name="n.isRead ? 'i-heroicons-bell' : 'i-heroicons-bell-alert'" class="w-4 h-4 mt-0.5 shrink-0" :class="n.isRead ? 'text-gray-400' : 'text-orange-500'" />
              <div class="min-w-0">
                <p class="text-subhead font-medium truncate">{{ n.title }}</p>
                <p class="text-caption-size text-gray-500 truncate">{{ n.message }}</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-6 text-gray-400">
            <p class="text-caption-size">{{ t('notifications.noNotifications') }}</p>
          </div>
          <div class="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
            <NuxtLink to="/notifications" class="text-sm text-orange-500 hover:underline flex items-center gap-1">
              {{ t('ess.viewAll') }} <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" />
            </NuxtLink>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Leave Request Modal -->
    <UModal v-model="showLeaveForm">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ t('leaveRequests.add') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showLeaveForm = false" />
          </div>
        </template>
        <form @submit.prevent="submitLeave" class="space-y-4">
          <UFormGroup :label="t('leaveRequests.leaveType')" required>
            <USelect v-model="leaveForm.leaveType" :options="leaveTypeOptions" />
          </UFormGroup>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup :label="t('leaveRequests.startDate')" required>
              <UInput v-model="leaveForm.startDate" type="date" />
            </UFormGroup>
            <UFormGroup :label="t('leaveRequests.endDate')" required>
              <UInput v-model="leaveForm.endDate" type="date" />
            </UFormGroup>
          </div>
          <UFormGroup :label="t('leaveRequests.reason')">
            <UTextarea v-model="leaveForm.reason" rows="3" />
          </UFormGroup>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" @click="showLeaveForm = false">{{ t('common.cancel') }}</UButton>
            <UButton type="submit" :loading="submittingLeave">{{ t('common.save') }}</UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Expense Claim Modal -->
    <UModal v-model="showExpenseForm">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ t('expenseClaims.add') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showExpenseForm = false" />
          </div>
        </template>
        <form @submit.prevent="submitExpense" class="space-y-4">
          <UFormGroup :label="t('expenseClaims.claimTitle')" required>
            <UInput v-model="expenseForm.title" :placeholder="t('ess.expensePlaceholder')" />
          </UFormGroup>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup :label="t('expenseClaims.amount')" required>
              <UInput v-model="expenseForm.amount" type="number" placeholder="0" />
            </UFormGroup>
            <UFormGroup :label="t('common.category')">
              <USelect v-model="expenseForm.category" :options="expenseCategoryOptions" />
            </UFormGroup>
          </div>
          <UFormGroup :label="t('common.description')">
            <UTextarea v-model="expenseForm.description" rows="3" />
          </UFormGroup>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" @click="showExpenseForm = false">{{ t('common.cancel') }}</UButton>
            <UButton type="submit" :loading="submittingExpense">{{ t('common.save') }}</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { LeaveRequest, ExpenseClaim, Announcement, Notification } from '~/types'

useHead({ title: 'My Portal' })
definePageMeta({ middleware: 'auth' })

const api = useApiService()
const auth = useAuthStore()
const toast = useToast()
const { t, locale } = useI18n()

const today = computed(() => new Date().toLocaleDateString(locale.value === 'th' ? 'th-TH' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

const myLeave = ref<LeaveRequest[]>([])
const myExpenses = ref<ExpenseClaim[]>([])
const announcements = ref<Announcement[]>([])
const recentNotifs = ref<Notification[]>([])
const loadingLeave = ref(false)
const loadingExpenses = ref(false)
const showLeaveForm = ref(false)
const showExpenseForm = ref(false)
const submittingLeave = ref(false)
const submittingExpense = ref(false)

const leaveForm = reactive({ leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' })
const expenseForm = reactive({ title: '', amount: '', category: 'OTHER', description: '' })

const leaveTypeOptions = computed(() => [
  { label: t('leaveRequests.types.ANNUAL'), value: 'ANNUAL' },
  { label: t('leaveRequests.types.SICK'), value: 'SICK' },
  { label: t('leaveRequests.types.PERSONAL'), value: 'PERSONAL' },
  { label: t('leaveRequests.types.MATERNITY'), value: 'MATERNITY' },
  { label: t('leaveRequests.types.OTHER'), value: 'OTHER' },
])

const expenseCategoryOptions = ['TRAVEL', 'MEAL', 'OFFICE', 'TRAINING', 'OTHER']

const unreadCount = computed(() => recentNotifs.value.filter(n => !n.isRead).length)

const quickStats = computed(() => [
  {
    key: 'leave',
    label: t('ess.pendingLeave'),
    value: myLeave.value.filter(l => l.status === 'PENDING').length,
    icon: 'i-heroicons-calendar-days',
    bg: 'bg-orange-50 dark:bg-orange-950',
    color: 'text-orange-500',
  },
  {
    key: 'expense',
    label: t('ess.pendingExpense'),
    value: myExpenses.value.filter(e => e.status === 'PENDING').length,
    icon: 'i-heroicons-receipt-percent',
    bg: 'bg-blue-50 dark:bg-blue-950',
    color: 'text-blue-500',
  },
  {
    key: 'notif',
    label: t('notifications.unread'),
    value: unreadCount.value,
    icon: 'i-heroicons-bell-alert',
    bg: 'bg-red-50 dark:bg-red-950',
    color: 'text-red-500',
  },
  {
    key: 'approved',
    label: t('ess.approvedLeave'),
    value: myLeave.value.filter(l => l.status === 'APPROVED').length,
    icon: 'i-heroicons-check-circle',
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    color: 'text-emerald-500',
  },
])

const quickActions = computed(() => [
  { label: t('leaveRequests.add'), icon: 'i-heroicons-calendar-days', to: '/leave-requests' },
  { label: t('expenseClaims.add'), icon: 'i-heroicons-receipt-percent', to: '/expense-claims' },
  { label: t('nav.overtime'), icon: 'i-heroicons-clock', to: '/overtime' },
  { label: t('nav.payroll'), icon: 'i-heroicons-banknotes', to: '/payroll' },
  { label: t('nav.training'), icon: 'i-heroicons-academic-cap', to: '/training' },
  { label: t('nav.goals'), icon: 'i-heroicons-flag', to: '/goals' },
  { label: t('nav.documents'), icon: 'i-heroicons-document-text', to: '/documents' },
  { label: t('nav.settings'), icon: 'i-heroicons-cog-6-tooth', to: '/settings' },
])

const formatDate = (d: string) => new Date(d).toLocaleDateString(locale.value === 'th' ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric' })

const fetchAll = async () => {
  loadingLeave.value = true
  loadingExpenses.value = true
  try {
    const [leaveRes, expenseRes, announcRes, notifRes] = await Promise.allSettled([
      api.leaveRequests.list({ limit: '10' }),
      api.expenseClaims.list({ limit: '10' }),
      api.announcements.list({ limit: '5' }),
      api.notifications.list(),
    ])
    if (leaveRes.status === 'fulfilled') myLeave.value = leaveRes.value.data
    if (expenseRes.status === 'fulfilled') myExpenses.value = expenseRes.value.data
    if (announcRes.status === 'fulfilled') announcements.value = announcRes.value.data
    if (notifRes.status === 'fulfilled') recentNotifs.value = (notifRes.value as any).data ?? notifRes.value
  } finally {
    loadingLeave.value = false
    loadingExpenses.value = false
  }
}

const submitLeave = async () => {
  submittingLeave.value = true
  try {
    await api.leaveRequests.create({
      employeeId: auth.user!.sub,
      leaveType: leaveForm.leaveType as any,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason || undefined,
    })
    toast.add({ title: t('ess.leaveSubmitted'), color: 'green', icon: 'i-heroicons-check-circle' })
    showLeaveForm.value = false
    Object.assign(leaveForm, { leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' })
    fetchAll()
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message, color: 'red' })
  } finally { submittingLeave.value = false }
}

const submitExpense = async () => {
  submittingExpense.value = true
  try {
    await api.expenseClaims.create({
      employeeId: auth.user!.sub,
      title: expenseForm.title,
      amount: Number(expenseForm.amount),
      category: expenseForm.category,
      description: expenseForm.description || undefined,
    })
    toast.add({ title: t('ess.expenseSubmitted'), color: 'green', icon: 'i-heroicons-check-circle' })
    showExpenseForm.value = false
    Object.assign(expenseForm, { title: '', amount: '', category: 'OTHER', description: '' })
    fetchAll()
  } catch (e: any) {
    toast.add({ title: 'Error', description: e?.data?.message, color: 'red' })
  } finally { submittingExpense.value = false }
}

onMounted(fetchAll)
</script>
