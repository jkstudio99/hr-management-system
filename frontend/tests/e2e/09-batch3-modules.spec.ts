import { test, expect } from "@playwright/test";
import { loginAs, navigateVia, waitForModal } from "./helpers";

test.describe("Batch 3 Modules", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test("Audit Log — shows table", async ({ page }) => {
    await navigateVia(page, "/audit-log");
    await expect(page.locator("h1")).toContainText("บันทึกกิจกรรม", {
      timeout: 10000,
    });
    await expect(page.locator('table, [role="table"]')).toBeVisible({
      timeout: 8000,
    });
  });

  test("Overtime — shows clock buttons", async ({ page }) => {
    await navigateVia(page, "/overtime");
    await expect(page.locator("h1")).toContainText("ล่วงเวลา", {
      timeout: 10000,
    });
    // Thai: บันทึกเวลาเข้า / บันทึกเวลาออก
    await expect(page.locator("text=บันทึกเวลาเข้า")).toBeVisible({
      timeout: 8000,
    });
    await expect(page.locator("text=บันทึกเวลาออก")).toBeVisible();
  });

  test("Overtime — opens new OT request modal", async ({ page }) => {
    await navigateVia(page, "/overtime");
    const btn = page.locator('button:has-text("ขอทำงานล่วงเวลา")');
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await waitForModal(page);
  });

  test("Recruitment — shows page", async ({ page }) => {
    await navigateVia(page, "/recruitment");
    await expect(page.locator("h1")).toContainText("สรรหาบุคลากร", {
      timeout: 10000,
    });
    // Thai: เพิ่มประกาศรับสมัคร
    await expect(
      page.locator('button:has-text("เพิ่มประกาศรับสมัคร")'),
    ).toBeVisible();
  });

  test("Recruitment — opens new posting modal", async ({ page }) => {
    await navigateVia(page, "/recruitment");
    const btn = page.locator('button:has-text("เพิ่มประกาศรับสมัคร")');
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await waitForModal(page);
  });

  test("Org Chart — shows page", async ({ page }) => {
    await navigateVia(page, "/org-chart");
    await expect(page.locator("h1")).toContainText("ผังองค์กร", {
      timeout: 10000,
    });
  });

  test("Training — shows courses", async ({ page }) => {
    await navigateVia(page, "/training");
    await expect(page.locator("h1")).toContainText("ฝึกอบรม", {
      timeout: 10000,
    });
    // Thai: เพิ่มหลักสูตร
    await expect(
      page.locator('button:has-text("เพิ่มหลักสูตร")'),
    ).toBeVisible();
  });

  test("Training — opens new course modal", async ({ page }) => {
    await navigateVia(page, "/training");
    const btn = page.locator('button:has-text("เพิ่มหลักสูตร")');
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await waitForModal(page);
  });

  test("Documents — shows table", async ({ page }) => {
    await navigateVia(page, "/documents");
    await expect(page.locator("h1")).toContainText("เอกสาร", {
      timeout: 10000,
    });
    await expect(page.locator('table, [role="table"]')).toBeVisible({
      timeout: 8000,
    });
  });

  test("Documents — opens upload modal", async ({ page }) => {
    await navigateVia(page, "/documents");
    const btn = page.locator('button:has-text("เพิ่มเอกสาร")');
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await waitForModal(page);
  });

  test("Benefits — shows page", async ({ page }) => {
    await navigateVia(page, "/benefits");
    await expect(page.locator("h1")).toContainText("สวัสดิการ", {
      timeout: 10000,
    });
    // Thai: เพิ่มแผนสวัสดิการ
    await expect(
      page.locator('button:has-text("เพิ่มแผนสวัสดิการ")'),
    ).toBeVisible();
  });

  test("Shifts — shows page with schedule", async ({ page }) => {
    await navigateVia(page, "/shifts");
    await expect(page.locator("h1")).toContainText("กะการทำงาน", {
      timeout: 10000,
    });
    await expect(
      page.locator("h3", { hasText: "ตารางกะ" }).first(),
    ).toBeVisible({ timeout: 8000 });
  });

  test("Shifts — opens new shift modal", async ({ page }) => {
    await navigateVia(page, "/shifts");
    const btn = page.locator('button:has-text("เพิ่มกะ")');
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await waitForModal(page);
  });

  test("Goals — shows page", async ({ page }) => {
    await navigateVia(page, "/goals");
    await expect(page.locator("h1")).toContainText("เป้าหมาย OKR", {
      timeout: 10000,
    });
    // Thai: เพิ่มเป้าหมาย
    await expect(
      page.locator('button:has-text("เพิ่มเป้าหมาย")'),
    ).toBeVisible();
  });

  test("Goals — opens new goal modal", async ({ page }) => {
    await navigateVia(page, "/goals");
    const btn = page.locator('button:has-text("เพิ่มเป้าหมาย")');
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await waitForModal(page);
  });

  test("Announcements — shows page", async ({ page }) => {
    await navigateVia(page, "/announcements");
    await expect(page.locator("h1")).toContainText("ประกาศ", {
      timeout: 10000,
    });
    // Thai: เพิ่มประกาศ
    await expect(page.locator('button:has-text("เพิ่มประกาศ")')).toBeVisible();
  });

  test("Announcements — opens new announcement modal", async ({ page }) => {
    await navigateVia(page, "/announcements");
    const btn = page.locator('button:has-text("เพิ่มประกาศ")');
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await waitForModal(page);
  });
});
