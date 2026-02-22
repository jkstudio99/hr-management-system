// ─────────────────────────────────────────────────────────────────────────────
// useDataFetch — Reusable composable for loading + error state management
// ─────────────────────────────────────────────────────────────────────────────
export const useDataFetch = <T>(fetchFn: () => Promise<T>, initial: T) => {
  const data = ref<T>(initial) as Ref<T>
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async () => {
    loading.value = true
    error.value = null
    try {
      data.value = await fetchFn()
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || 'An error occurred'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}
