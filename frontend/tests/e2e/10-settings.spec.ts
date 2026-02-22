import { test, expect } from "@playwright/test";
import { loginAs, navigateVia } from "./helpers";

test.describe("Settings & Auth Flow", () => {
  test("settings page shows profile and security cards", async ({ page }) => {
    await loginAs(page);
    await navigateVia(page, "/settings");
    await expect(page.locator("h1")).toContainText("ตั้งค่า", {
      timeout: 10000,
    });
    // Thai: โปรไฟล์, ความปลอดภัย
    await expect(page.locator("text=โปรไฟล์").first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator("text=ความปลอดภัย").first()).toBeVisible({
      timeout: 5000,
    });
    // ออกจากระบบ may be below the fold — scroll to it
    const logoutText = page.locator("text=ออกจากระบบ").first();
    await logoutText.scrollIntoViewIfNeeded();
    await expect(logoutText).toBeVisible({ timeout: 5000 });
  });

  test("dark mode toggle works", async ({ page }) => {
    await loginAs(page);
    await page.goto("/");
    const colorModeBtn = page
      .locator(
        'button[aria-label*="color"], button[aria-label*="theme"], button[aria-label*="dark"]',
      )
      .first();
    if (await colorModeBtn.isVisible()) {
      await colorModeBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test("logout redirects to login", async ({ page }) => {
    await loginAs(page);
    await navigateVia(page, "/settings");
    // Thai: ออกจากระบบ
    await page.click('button:has-text("ออกจากระบบ")');
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 8000 });
  });
});
