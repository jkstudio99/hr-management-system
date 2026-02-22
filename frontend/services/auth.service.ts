// ─────────────────────────────────────────────────────────────────────────────
// services/auth.service.ts
// ─────────────────────────────────────────────────────────────────────────────
import type { ApiFetch } from "./http";
import type { LoginResponse } from "~/types/auth";

export const createAuthService = (fetch: ApiFetch) => ({
  login: (body: { username: string; password: string }) =>
    fetch<LoginResponse>("/auth/login", { method: "POST", body }),

  register: (body: { username: string; email: string; password: string }) =>
    fetch<LoginResponse>("/auth/register", { method: "POST", body }),

  profile: () => fetch<LoginResponse["user"]>("/auth/profile"),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    fetch<void>("/auth/change-password", { method: "POST", body }),

  // ── 2FA (TOTP) ────────────────────────────────────────────────────────────
  twoFactor: {
    status: () => fetch<{ isTwoFactorEnabled: boolean }>("/2fa/status"),
    setup: () =>
      fetch<{ secret: string; qrCodeUrl: string }>("/2fa/setup", {
        method: "POST",
        body: {},
      }),
    verify: (code: string) =>
      fetch<{ message: string }>("/2fa/verify", {
        method: "POST",
        body: { code },
      }),
    disable: (code: string) =>
      fetch<{ message: string }>("/2fa/disable", {
        method: "POST",
        body: { code },
      }),
  },
});

export type AuthService = ReturnType<typeof createAuthService>;
