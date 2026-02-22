import { test, expect } from "@playwright/test";
import { loginAs, navigateVia, waitForModal } from "./helpers";

test.describe("Leave Requests Module", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await navigateVia(page, "/leave-requests");
  });

  test("shows leave requests with Thai title", async ({ page }) => {
    // Thai: จัดการวันลา
    await expect(page.locator("h1")).toContainText("จัดการวันลา");
    await expect(page.locator('table, [role="table"]')).toBeVisible({
      timeout: 8000,
    });
  });

  test("opens new leave request modal", async ({ page }) => {
    // Thai: ขอลา
    const btn = page.locator('button:has-text("ขอลา")');
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await waitForModal(page);
  });

  test("status filter is visible", async ({ page }) => {
    // Check that a select/combobox filter exists on the page
    await expect(
      page.locator('select, [role="listbox"], [role="combobox"]').first(),
    ).toBeVisible({ timeout: 10000 });
  });
});
