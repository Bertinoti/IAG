import { test, expect } from "@playwright/test";
test("login page is keyboard accessible", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
});
