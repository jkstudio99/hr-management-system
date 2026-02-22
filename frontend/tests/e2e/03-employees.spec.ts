import { test, expect } from "@playwright/test";
import { loginAs, navigateVia } from "./helpers";

test.describe("Employees Module", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await navigateVia(page, "/employees");
  });

  test("shows employees page with Thai title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("พนักงาน");
    await expect(page.locator('table, [role="table"]').first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("opens create employee modal", async ({ page }) => {
    // Thai: เพิ่มพนักงาน
    await page.click('button:has-text("เพิ่มพนักงาน")');
    await expect(page.locator('input[placeholder="John"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test("creates a new employee", async ({ page }) => {
    await page.click('button:has-text("เพิ่มพนักงาน")');
    await page.fill('input[placeholder="John"]', "Test");
    await page.fill('input[placeholder="Doe"]', "Employee");
    await page.fill(
      'input[placeholder="john@company.com"]',
      `test.e2e.${Date.now()}@company.com`,
    );
    // Thai: บันทึก
    await page.click('button:has-text("บันทึก")');
    await page.waitForTimeout(3000);
  });

  test("search filters employees", async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill("admin");
    await page.waitForTimeout(600);
  });
});
