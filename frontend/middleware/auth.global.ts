export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  auth.restore()

  const publicPages = ['/auth/login', '/auth/register']
  if (publicPages.includes(to.path)) {
    if (auth.isAuthenticated) return navigateTo('/')
    return
  }

  if (!auth.isAuthenticated) {
    return navigateTo('/auth/login')
  }
})
