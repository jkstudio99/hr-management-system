import { test, expect } from "@playwright/test";
import { loginAs, navigateVia, waitForModal } from "./helpers";

test.describe("Payroll Module", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await navigateVia(page, "/payroll");
  });

  test("shows payroll with Thai title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("เงินเดือน");
    await expect(page.locator('table, [role="table"]')).toBeVisible({
      timeout: 8000,
    });
  });

  test("opens new payroll run modal", async ({ page }) => {
    // Thai: สร้างรอบเงินเดือน
    await page.click('button:has-text("สร้างรอบเงินเดือน")');
    await waitForModal(page);
  });
});
