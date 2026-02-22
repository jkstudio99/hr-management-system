<template>
  <div class="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <img src="~/assets/img/hr-logo.svg" alt="Hallman HR" class="h-12 sm:h-14 w-auto mx-auto mb-4 text-gray-800 dark:text-white" />
        <h1 class="text-title-1">{{ t('auth.welcome') }}</h1>
        <p class="text-subhead text-gray-500 dark:text-gray-400 mt-1">{{ t('auth.subtitle') }}</p>
      </div>

      <UCard :ui="{ rounded: 'rounded-2xl', shadow: 'shadow-apple-lg', body: { padding: 'p-6' } }">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <UFormGroup :label="t('auth.username')">
            <UInput
              v-model="form.username"
              :placeholder="t('auth.username')"
              icon="i-heroicons-user"
              size="lg"
              autofocus
              :ui="{ rounded: 'rounded-xl' }"
            />
          </UFormGroup>
          <UFormGroup :label="t('auth.password')">
            <UInput
              v-model="form.password"
              type="password"
              :placeholder="t('auth.password')"
              icon="i-heroicons-lock-closed"
              size="lg"
              :ui="{ rounded: 'rounded-xl' }"
            />
          </UFormGroup>
          <UButton type="submit" block size="lg" :loading="loading" color="primary" :ui="{ rounded: 'rounded-xl' }">
            {{ t('auth.signIn') }}
          </UButton>
        </form>

        <div class="mt-5 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('auth.dontHaveAccount') }}
            <NuxtLink to="/auth/register" class="text-orange-500 font-medium hover:underline ml-1">{{ t('auth.register') }}</NuxtLink>
          </p>
        </div>
      </UCard>

      <!-- Language + Theme switcher -->
      <div class="flex items-center justify-center gap-3 mt-6">
        <button
          v-for="lang in languages"
          :key="lang.code"
          class="text-sm px-3 py-1.5 rounded-lg transition-colors"
          :class="locale === lang.code
            ? 'bg-orange-100 dark:bg-orange-950 text-orange-600 font-medium'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
          @click="switchLocale(lang.code)"
        >{{ lang.flag }} {{ lang.label }}</button>
        <span class="text-gray-300 dark:text-gray-700">|</span>
        <button
          v-for="opt in themeOptions"
          :key="opt.value"
          class="p-1.5 rounded-lg transition-colors"
          :class="colorMode.preference === opt.value
            ? 'bg-orange-100 dark:bg-orange-950 text-orange-600'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'"
          :title="opt.label"
          @click="colorMode.preference = opt.value"
        ><UIcon :name="opt.icon" class="w-4 h-4" /></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const auth = useAuthStore()
const toast = useToast()
const colorMode = useColorMode()
const { locale, t, setLocale } = useI18n()
const loading = ref(false)
const form = reactive({ username: '', password: '' })

const languages = [
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'en', label: 'EN',  flag: '🇬🇧' },
]
const themeOptions = [
  { value: 'light',  label: 'Light',  icon: 'i-heroicons-sun' },
  { value: 'dark',   label: 'Dark',   icon: 'i-heroicons-moon' },
  { value: 'system', label: 'System', icon: 'i-heroicons-computer-desktop' },
]
const switchLocale = (code: string) => setLocale(code as 'th' | 'en')

const handleLogin = async () => {
  loading.value = true
  try {
    await auth.login(form.username, form.password)
    toast.add({ title: t('auth.loginSuccess'), color: 'green', icon: 'i-heroicons-check-circle' })
    navigateTo('/')
  } catch (e: any) {
    toast.add({ title: t('auth.loginFailed'), description: e?.data?.message || t('auth.invalidCredentials'), color: 'red', icon: 'i-heroicons-x-circle' })
  } finally {
    loading.value = false
  }
}
</script>
