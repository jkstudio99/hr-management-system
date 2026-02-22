import { test, expect } from "@playwright/test";
import { loginAs, navigateVia, waitForModal } from "./helpers";

test.describe("Departments Module", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await navigateVia(page, "/departments");
  });

  test("shows departments list with Thai title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("แผนก");
    await expect(page.locator('table, [role="table"]')).toBeVisible({
      timeout: 8000,
    });
  });

  test("creates a department", async ({ page }) => {
    // Thai: เพิ่มแผนก
    await page.click('button:has-text("เพิ่มแผนก")');
    await waitForModal(page);
    const input = page.getByRole("dialog").locator("input").first();
    await input.fill(`E2E Dept ${Date.now()}`);
    // Thai: บันทึก
    await page.click('button:has-text("บันทึก")');
    await page.waitForTimeout(2000);
  });
});
