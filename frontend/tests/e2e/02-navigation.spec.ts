import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("Navigation & Layout", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test("dashboard loads with Thai h1", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("แดชบอร์ด", {
      timeout: 10000,
    });
  });

  test("sidebar is visible on desktop", async ({ page }) => {
    await expect(page.locator("aside")).toBeVisible();
    await expect(page.locator('aside img[alt="Hallman HR"]')).toBeVisible();
  });

  test("topbar shows username", async ({ page }) => {
    await expect(page.locator("body")).toContainText("admin", {
      timeout: 5000,
    });
  });

  // Navigate via sidebar Thai link text → verify h1
  const pages = [
    { link: "พนักงาน", title: "พนักงาน" },
    { link: "แผนก", title: "แผนก" },
    { link: "ตำแหน่งงาน", title: "ตำแหน่งงาน" },
    { link: "จัดการวันลา", title: "จัดการวันลา" },
    { link: "ทรัพย์สิน", title: "ทรัพย์สิน" },
    { link: "ประเมินผลงาน", title: "ประเมินผลงาน" },
    { link: "เบิกค่าใช้จ่าย", title: "เบิกค่าใช้จ่าย" },
    { link: "เงินเดือน", title: "เงินเดือน" },
    { link: "การแจ้งเตือน", title: "การแจ้งเตือน" },
    { link: "แบบสำรวจ", title: "แบบสำรวจ" },
    { link: "รายการออกจากงาน", title: "รายการออกจากงาน" },
    { link: "ประวัติการทำงาน", title: "ประวัติการทำงาน" },
    { link: "บันทึกกิจกรรม", title: "บันทึกกิจกรรม" },
    { link: "ล่วงเวลา", title: "ล่วงเวลา" },
    { link: "สรรหาบุคลากร", title: "สรรหาบุคลากร" },
    { link: "ผังองค์กร", title: "ผังองค์กร" },
    { link: "ฝึกอบรม", title: "ฝึกอบรม" },
    { link: "เอกสาร", title: "เอกสาร" },
    { link: "สวัสดิการ", title: "สวัสดิการ" },
    { link: "กะการทำงาน", title: "กะการทำงาน" },
    { link: "เป้าหมาย OKR", title: "เป้าหมาย OKR" },
    { link: "ประกาศ", title: "ประกาศ" },
    { link: "ตั้งค่า", title: "ตั้งค่า" },
  ];

  for (const { link, title } of pages) {
    test(`navigates to "${link}" page`, async ({ page }) => {
      // Click sidebar link by Thai text
      const sidebarLink = page
        .locator("aside a", { hasText: new RegExp(`^\\s*${link}\\s*$`) })
        .first();
      await sidebarLink.scrollIntoViewIfNeeded();
      await sidebarLink.click();
      await expect(page.locator("h1")).toContainText(title, { timeout: 10000 });
    });
  }
});
