import { test, expect } from "@playwright/test";
import { loginAs, navigateVia, waitForModal } from "./helpers";

test.describe("Assets Module", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await navigateVia(page, "/assets");
  });

  test("shows assets table with Thai title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("ทรัพย์สิน");
    await expect(page.locator('table, [role="table"]')).toBeVisible({
      timeout: 8000,
    });
  });

  test("opens add asset modal", async ({ page }) => {
    // Thai: เพิ่มทรัพย์สิน
    await page.click('button:has-text("เพิ่มทรัพย์สิน")');
    await waitForModal(page);
  });
});
