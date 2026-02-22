// ─────────────────────────────────────────────────────────────────────────────
// useApi — Centralized HTTP client with JWT injection + error handling
// ─────────────────────────────────────────────────────────────────────────────
import type { FetchOptions } from "ofetch";

export const useApi = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const toast = useToast();

  const apiFetch = async <T>(
    url: string,
    options: FetchOptions = {},
  ): Promise<T> => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`;
    }
    const base = config.public.apiBase || "http://127.0.0.1:3000/api";
    try {
      return await $fetch<T>(`${base}${url}`, {
        ...options,
        headers,
      });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) {
        authStore.logout();
        throw err;
      }
      if (status === 403) {
        toast.add({
          title: "Access Denied",
          description: "You do not have permission.",
          color: "red",
          icon: "i-heroicons-shield-exclamation",
        });
        throw err;
      }
      throw err;
    }
  };

  return { apiFetch };
};
