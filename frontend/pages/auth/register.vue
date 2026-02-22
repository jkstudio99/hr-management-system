<template>
  <div class="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <img src="~/assets/img/hr-logo.svg" alt="Hallman HR" class="h-12 sm:h-14 w-auto mx-auto mb-4 text-gray-800 dark:text-white" />
        <h1 class="text-title-1">{{ t('auth.createAccount') }}</h1>
        <p class="text-subhead text-gray-500 dark:text-gray-400 mt-1">{{ t('auth.subtitle') }}</p>
      </div>

      <UCard :ui="{ rounded: 'rounded-2xl', body: { padding: 'p-6' } }">
        <form @submit.prevent="handleRegister" class="space-y-5">
          <UFormGroup :label="t('auth.username')">
            <UInput v-model="form.username" :placeholder="t('auth.username')" icon="i-heroicons-user" size="lg" :ui="{ rounded: 'rounded-xl' }" />
          </UFormGroup>
          <UFormGroup :label="t('common.email')">
            <UInput v-model="form.email" type="email" :placeholder="t('common.email')" icon="i-heroicons-envelope" size="lg" :ui="{ rounded: 'rounded-xl' }" />
          </UFormGroup>
          <UFormGroup :label="t('auth.password')">
            <UInput v-model="form.password" type="password" :placeholder="t('auth.password')" icon="i-heroicons-lock-closed" size="lg" :ui="{ rounded: 'rounded-xl' }" />
          </UFormGroup>
          <UButton type="submit" block size="lg" :loading="loading" color="primary" :ui="{ rounded: 'rounded-xl' }">
            {{ t('auth.register') }}
          </UButton>
        </form>
        <div class="mt-5 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('auth.alreadyHaveAccount') }}
            <NuxtLink to="/auth/login" class="text-orange-500 font-medium hover:underline ml-1">{{ t('auth.signIn') }}</NuxtLink>
          </p>
        </div>
      </UCard>

      <div class="flex items-center justify-center gap-3 mt-6">
        <button v-for="lang in languages" :key="lang.code"
          class="text-sm px-3 py-1.5 rounded-lg transition-colors"
          :class="locale === lang.code ? 'bg-orange-100 dark:bg-orange-950 text-orange-600 font-medium' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
          @click="switchLocale(lang.code)">{{ lang.flag }} {{ lang.label }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const config = useRuntimeConfig()
const toast = useToast()
const { locale, t, setLocale } = useI18n()
const loading = ref(false)
const form = reactive({ username: '', email: '', password: '' })

const languages = [
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
]
const switchLocale = (code: string) => setLocale(code as 'th' | 'en')

const handleRegister = async () => {
  loading.value = true
  try {
    await $fetch(`${config.public.apiBase}/auth/register`, { method: 'POST', body: form })
    toast.add({ title: t('auth.loginSuccess'), description: locale.value === 'th' ? 'กรุณาเข้าสู่ระบบ' : 'Please sign in', color: 'green' })
    navigateTo('/auth/login')
  } catch (e: any) {
    toast.add({ title: locale.value === 'th' ? 'สมัครไม่สำเร็จ' : 'Registration failed', description: e?.data?.message || 'Error', color: 'red' })
  } finally {
    loading.value = false
  }
}
</script>
