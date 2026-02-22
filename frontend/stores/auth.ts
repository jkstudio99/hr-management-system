import { defineStore } from "pinia";

interface User {
  sub: number;
  username: string;
  role: string;
}

// Backend response: { user: {...}, accessToken: "..." }
interface LoginResponse {
  user: {
    id: number;
    username: string;
    role: { roleName: string };
  };
  accessToken: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: "" as string,
    user: null as User | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === "ADMIN",
    isHR: (state) => state.user?.role === "HR",
    isAdminOrHR: (state) => ["ADMIN", "HR"].includes(state.user?.role || ""),
  },
  actions: {
    async login(username: string, password: string) {
      const config = useRuntimeConfig();
      const base = config.public.apiBase || "http://127.0.0.1:3000/api";
      const res = await $fetch<LoginResponse>(`${base}/auth/login`, {
        method: "POST",
        body: { username, password },
      });
      this.token = res.accessToken;
      // Decode JWT payload for sub/username/role
      const payload = JSON.parse(atob(res.accessToken.split(".")[1]));
      this.user = {
        sub: payload.sub,
        username: payload.username,
        role: payload.role,
      };
      if (import.meta.client) {
        localStorage.setItem("hr_token", this.token);
        localStorage.setItem("hr_user", JSON.stringify(this.user));
      }
    },
    logout() {
      this.token = "";
      this.user = null;
      if (import.meta.client) {
        localStorage.removeItem("hr_token");
        localStorage.removeItem("hr_user");
      }
      navigateTo("/auth/login");
    },
    restore() {
      if (import.meta.client) {
        const t = localStorage.getItem("hr_token");
        const u = localStorage.getItem("hr_user");
        if (t && u) {
          this.token = t;
          this.user = JSON.parse(u);
        }
      }
    },
  },
});
