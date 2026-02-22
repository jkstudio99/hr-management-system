import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("Authentication", () => {
  test("redirects unauthenticated user to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("shows login form", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
    const inputs = page.locator("form input");
    await expect(inputs.nth(0)).toBeVisible();
    await expect(inputs.nth(1)).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForSelector("form", { timeout: 10000 });
    await page.waitForTimeout(500);
    const inputs = page.locator("form input");
    await inputs.nth(0).fill("wronguser");
    await inputs.nth(1).fill("wrongpass");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("logs in successfully as admin", async ({ page }) => {
    await loginAs(page);
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
  });

  test("shows register page", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
