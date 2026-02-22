<template>
  <div>
    <PageHeader :title="t('settings.title')" :description="t('settings.profile')" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">

      <!-- Profile Card -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-user-circle" class="w-5 h-5 text-orange-500" />
            <h3 class="text-headline">{{ t('settings.profile') }}</h3>
          </div>
        </template>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-orange-600 text-2xl font-bold">
              {{ auth.user?.username?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="text-title-3 font-semibold truncate">{{ auth.user?.username }}</p>
              <UBadge
                :color="auth.isAdmin ? 'red' : auth.isHR ? 'blue' : 'gray'"
                size="sm"
                class="mt-1"
              >{{ auth.user?.role }}</UBadge>
            </div>
          </div>
          <UDivider />
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p class="text-caption-size text-gray-500 dark:text-gray-400">{{ t('auth.role') }}</p>
              <p class="font-medium mt-0.5">{{ auth.user?.role }}</p>
            </div>
            <div>
              <p class="text-caption-size text-gray-500 dark:text-gray-400">{{ t('auth.username') }}</p>
              <p class="font-medium mt-0.5">{{ auth.user?.username }}</p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Appearance Card -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-paint-brush" class="w-5 h-5 text-orange-500" />
            <h3 class="text-headline">{{ t('settings.appearance') }}</h3>
          </div>
        </template>
        <div class="space-y-5">
          <!-- Theme selector -->
          <div>
            <p class="text-subhead font-medium mb-3">{{ t('settings.darkMode') }}</p>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="opt in themeOptions"
                :key="opt.value"
                class="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                :class="colorMode.preference === opt.value
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                  : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'"
                @click="colorMode.preference = opt.value"
              >
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center"
                  :class="colorMode.preference === opt.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400'"
                >
                  <UIcon :name="opt.icon" class="w-5 h-5" />
                </div>
                <span
                  class="text-xs font-medium"
                  :class="colorMode.preference === opt.value ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'"
                >{{ opt.label }}</span>
              </button>
            </div>
          </div>

          <UDivider />

          <!-- Language selector -->
          <div>
            <p class="text-subhead font-medium mb-3">{{ t('settings.language') }}</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="lang in languages"
                :key="lang.code"
                class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all"
                :class="locale === lang.code
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                  : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'"
                @click="switchLocale(lang.code)"
              >
                <span class="text-2xl">{{ lang.flag }}</span>
                <div class="text-left min-w-0">
                  <p
                    class="text-sm font-medium truncate"
                    :class="locale === lang.code ? 'text-orange-600 dark:text-orange-400' : ''"
                  >{{ lang.label }}</p>
                  <p class="text-caption-size text-gray-500">{{ lang.native }}</p>
                </div>
                <UIcon
                  v-if="locale === lang.code"
                  name="i-heroicons-check-circle-solid"
                  class="w-4 h-4 text-orange-500 ml-auto shrink-0"
                />
              </button>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Security Card -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-orange-500" />
            <h3 class="text-headline">{{ t('settings.security') }}</h3>
          </div>
        </template>
        <div class="space-y-3">
          <UButton
            variant="soft"
            color="gray"
            block
            class="justify-start"
            icon="i-heroicons-key"
            @click="showPasswordModal = true"
          >{{ t('settings.changePassword') }}</UButton>
          <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-800">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-gray-500" />
              <span class="text-subhead">{{ t('settings.twoFactor') }}</span>
            </div>
            <UBadge :color="twoFactorEnabled ? 'green' : 'gray'" size="xs">{{ twoFactorEnabled ? t('common.active') : t('common.inactive') }}</UBadge>
          </div>
          <UButton
            v-if="!twoFactorEnabled"
            variant="soft"
            color="orange"
            block
            class="justify-start"
            icon="i-heroicons-shield-check"
            @click="setup2FA"
            :loading="setting2FA"
          >{{ t('settings.twoFactor') }} — Enable</UButton>
          <div v-if="qrCodeUrl" class="text-center space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800">
            <img :src="qrCodeUrl" alt="2FA QR Code" class="mx-auto w-48 h-48" />
            <p class="text-caption-size text-gray-500">Scan with Authenticator app, then enter code:</p>
            <div class="flex gap-2 justify-center">
              <UInput v-model="totpCode" placeholder="000000" class="w-32 text-center" maxlength="6" />
              <UButton :loading="verifying2FA" @click="verify2FA">Verify</UButton>
            </div>
          </div>
          <UButton
            v-if="twoFactorEnabled"
            variant="soft"
            color="red"
            block
            class="justify-start"
            icon="i-heroicons-shield-exclamation"
            @click="showDisable2FA = !showDisable2FA"
          >Disable 2FA</UButton>
          <div v-if="showDisable2FA" class="flex gap-2 justify-center">
            <UInput v-model="disableCode" placeholder="Enter code" class="w-32" maxlength="6" />
            <UButton color="red" :loading="disabling2FA" @click="disable2FA">Confirm</UButton>
          </div>
        </div>
      </UCard>

      <!-- Session Card -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5 text-red-500" />
            <h3 class="text-headline">Session</h3>
          </div>
        </template>
        <div class="space-y-3">
          <p class="text-subhead text-gray-500 dark:text-gray-400">
            {{ locale === 'th' ? 'ออกจากระบบและล้างข้อมูลเซสชัน' : 'Sign out and clear session data' }}
          </p>
          <UButton
            color="red"
            variant="soft"
            block
            icon="i-heroicons-arrow-right-on-rectangle"
            @click="auth.logout()"
          >{{ t('settings.logout') }}</UButton>
        </div>
      </UCard>

    </div>

    <!-- Change Password Modal -->
    <UModal v-model="showPasswordModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-headline">{{ t('settings.changePassword') }}</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" size="xs" @click="showPasswordModal = false" />
          </div>
        </template>
        <form @submit.prevent="changePassword" class="space-y-4">
          <UFormGroup :label="locale === 'th' ? 'รหัสผ่านปัจจุบัน' : 'Current Password'" required>
            <UInput v-model="pwForm.currentPassword" type="password" />
          </UFormGroup>
          <UFormGroup :label="locale === 'th' ? 'รหัสผ่านใหม่' : 'New Password'" required>
            <UInput v-model="pwForm.newPassword" type="password" />
          </UFormGroup>
          <UFormGroup :label="locale === 'th' ? 'ยืนยันรหัสผ่านใหม่' : 'Confirm New Password'" required>
            <UInput v-model="pwForm.confirmPassword" type="password" />
          </UFormGroup>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="gray" @click="showPasswordModal = false">{{ t('common.cancel') }}</UButton>
            <UButton type="submit" :loading="changingPassword">{{ t('common.save') }}</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Settings' })

const auth = useAuthStore()
const api = useApiService()
const toast = useToast()
const colorMode = useColorMode()
const { locale, t, setLocale } = useI18n()

// ── Change Password ────────────────────────────────────────────────────────
const showPasswordModal = ref(false)
const changingPassword = ref(false)
const pwForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const changePassword = async () => {
  if (pwForm.newPassword !== pwForm.confirmPassword) {
    toast.add({ title: locale.value === 'th' ? 'รหัสผ่านไม่ตรงกัน' : 'Passwords do not match', color: 'red' })
    return
  }
  changingPassword.value = true
  try {
    await api.auth.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
    toast.add({ title: locale.value === 'th' ? 'เปลี่ยนรหัสผ่านสำเร็จ' : 'Password changed', color: 'green', icon: 'i-heroicons-check-circle' })
    showPasswordModal.value = false
    Object.assign(pwForm, { currentPassword: '', newPassword: '', confirmPassword: '' })
  } catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) }
  finally { changingPassword.value = false }
}

// ── 2FA ────────────────────────────────────────────────────────────────────
const twoFactorEnabled = ref(false)
const setting2FA = ref(false)
const verifying2FA = ref(false)
const disabling2FA = ref(false)
const showDisable2FA = ref(false)
const qrCodeUrl = ref('')
const totpCode = ref('')
const disableCode = ref('')

const fetch2FAStatus = async () => {
  try { const r = await api.auth.twoFactor.status(); twoFactorEnabled.value = r.isTwoFactorEnabled } catch {}
}
const setup2FA = async () => {
  setting2FA.value = true
  try { const r = await api.auth.twoFactor.setup(); qrCodeUrl.value = r.qrCodeUrl }
  catch (e: any) { toast.add({ title: 'Error', description: e?.data?.message, color: 'red' }) }
  finally { setting2FA.value = false }
}
const verify2FA = async () => {
  verifying2FA.value = true
  try {
    await api.auth.twoFactor.verify(totpCode.value)
    toast.add({ title: '2FA enabled!', color: 'green', icon: 'i-heroicons-shield-check' })
    twoFactorEnabled.value = true; qrCodeUrl.value = ''; totpCode.value = ''
  } catch (e: any) { toast.add({ title: 'Invalid code', description: e?.data?.message, color: 'red' }) }
  finally { verifying2FA.value = false }
}
const disable2FA = async () => {
  disabling2FA.value = true
  try {
    await api.auth.twoFactor.disable(disableCode.value)
    toast.add({ title: '2FA disabled', color: 'orange' })
    twoFactorEnabled.value = false; showDisable2FA.value = false; disableCode.value = ''
  } catch (e: any) { toast.add({ title: 'Invalid code', description: e?.data?.message, color: 'red' }) }
  finally { disabling2FA.value = false }
}

onMounted(fetch2FAStatus)

const themeOptions = [
  { value: 'light',  label: 'Light',  icon: 'i-heroicons-sun' },
  { value: 'dark',   label: 'Dark',   icon: 'i-heroicons-moon' },
  { value: 'system', label: 'System', icon: 'i-heroicons-computer-desktop' },
]

const languages = [
  { code: 'th', label: 'ภาษาไทย', native: 'Thai',    flag: '🇹🇭' },
  { code: 'en', label: 'English',  native: 'English', flag: '🇬🇧' },
]

const switchLocale = (code: string) => setLocale(code as 'th' | 'en')
</script>
