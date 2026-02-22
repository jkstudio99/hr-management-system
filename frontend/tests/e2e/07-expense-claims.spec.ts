import { test, expect } from "@playwright/test";
import { loginAs, navigateVia, waitForModal } from "./helpers";

test.describe("Expense Claims Module", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await navigateVia(page, "/expense-claims");
  });

  test("shows expense claims with Thai title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("เบิกค่าใช้จ่าย");
    await expect(page.locator('table, [role="table"]')).toBeVisible({
      timeout: 8000,
    });
  });

  test("opens new claim modal", async ({ page }) => {
    // Thai: ยื่นเรื่องเบิก
    await page.click('button:has-text("ยื่นเรื่องเบิก")');
    await waitForModal(page);
  });
});
