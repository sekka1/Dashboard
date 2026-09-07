import { expect, test } from "@playwright/test";

test.describe("Design demos", () => {
  test("unauthenticated user is redirected away from the demos hub", async ({ page }) => {
    await page.goto("/demos");
    await expect(page).toHaveURL(/sign-in/);
  });

  for (const path of ["/demos/analytics", "/demos/listings", "/demos/team", "/demos/pipeline"]) {
    test(`unauthenticated user is redirected away from ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/sign-in/);
    });
  }
});
