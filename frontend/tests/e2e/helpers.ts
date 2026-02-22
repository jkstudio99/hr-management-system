import { type Page } from "@playwright/test";

export const BASE_URL = "http://localhost:3001";
export const API_URL = "http://localhost:3000/api";

export const ADMIN = { username: "admin", password: "password" };

export async function loginAs(
  page: Page,
  username = ADMIN.username,
  password = ADMIN.password,
) {
  await page.goto("/auth/login");
  // Wait for form to be ready
  await page.waitForSelector("form", { timeout: 15000 });
  await page.waitForTimeout(500);

  // Target inputs by order: first = username, second = password
  const inputs = page.locator("form input");
  await inputs.nth(0).clear();
  await inputs.nth(0).fill(username);
  await inputs.nth(1).clear();
  await inputs.nth(1).fill(password);

  await page.click('button[type="submit"]');
  // Wait for redirect away from login page
  await page.waitForFunction(
    () => !window.location.pathname.includes("/auth/login"),
    { timeout: 15000 },
  );
  await page.waitForLoadState("networkidle", { timeout: 10000 });
}

// Navigate via Vue Router (client-side) to avoid SSR auth redirect
export async function navigateVia(page: Page, path: string) {
  await page.evaluate((p) => {
    const app = document.querySelector("#__nuxt") as any;
    const router =
      (window as any).__vue_app__?.config?.globalProperties?.$router ??
      app?.__vue_app__?.config?.globalProperties?.$router;
    if (router) {
      router.push(p);
    } else {
      window.location.href = p;
    }
  }, path);
  await page.waitForURL(`**${path}`, { timeout: 10000 });
  await page.waitForSelector("h1", { timeout: 10000 });
}

// Wait for UModal dialog to open (use 'attached' since HeadlessUI transitions
// may cause Playwright to consider the dialog not yet 'visible')
export async function waitForModal(page: Page, timeout = 10000) {
  await page
    .getByRole("dialog")
    .first()
    .waitFor({ state: "attached", timeout });
  await page.waitForTimeout(500);
}

export async function waitForToast(page: Page, text?: string) {
  const toast = page
    .locator("[data-headlessui-state]")
    .or(page.locator(".notifications"));
  if (text) {
    await page.waitForSelector(`text=${text}`, { timeout: 8000 });
  } else {
    await page.waitForTimeout(1000);
  }
}
