import { expect, test } from "@playwright/test";

test("browse shows the sites feed, newest first, with working images", async ({ page }) => {
  await page.goto("/browse?platform=site");
  await expect(page.getByRole("heading", { name: "Latest additions" })).toBeVisible();
  const first = page.locator("a[data-card] img").first();
  await expect(first).toHaveCSS("opacity", "1");
  await expect(page.locator("a[data-card]")).toHaveCount(24);
});

test("infinite scroll loads the next page", async ({ page }) => {
  await page.goto("/browse?platform=site");
  await page.getByRole("button", { name: "Load more" }).scrollIntoViewIfNeeded();
  await expect(page.locator("a[data-card]")).toHaveCount(48);
});

test("filters and search are mirrored in the URL", async ({ page }) => {
  await page.goto("/browse?platform=site");
  await page.getByLabel("Style").selectOption("dark");
  await expect(page).toHaveURL(/style=dark/);
  await expect(page.locator("a[data-card]")).toHaveCount(10);
  await page.getByPlaceholder("Search apps, sections, styles…").fill("pricing");
  await expect(page).toHaveURL(/q=pricing/);
  await expect(page.locator("a[data-card]")).toHaveCount(2);
  await page.getByRole("button", { name: /Remove Style/ }).click();
  await expect(page).not.toHaveURL(/style=dark/);
});

test("viewer steps through the result set with the keyboard", async ({ page }) => {
  await page.goto("/browse?platform=site");
  await page.locator("a[data-card]").first().click();
  await expect(page.getByText("1 of 50")).toBeVisible();
  await page.waitForLoadState("networkidle"); // key handlers attach on hydration
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("2 of 50")).toBeVisible();
  await page.getByRole("tab", { name: "Full page" }).click();
  await expect(page.locator('main img[src$="full.svg"]')).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("s");
  await expect(page.getByText("Saved to your shelf")).toBeVisible();
  await page.goto("/collections");
  await expect(page.locator("a[data-card]")).toHaveCount(1);
});

test("flow player steps and report form submits", async ({ page }) => {
  await page.goto("/apps/brightloop");
  await page.locator('a[href^="/flow/"]').click();
  await expect(page.getByText("Step 1 of 4")).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("Step 2 of 4")).toBeVisible();
  await page.getByRole("link", { name: "Open this screen" }).click();
  await page.getByRole("link", { name: "Report or request removal" }).click();
  await page.getByLabel("What’s wrong?").fill("This is my app and I would like it removed.");
  await page.getByLabel("Your email").fill("owner@example.com");
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByText("your request is in the queue")).toBeVisible();
});

test("motion clips play only while in view and filter to motion-only", async ({ page }) => {
  await page.goto("/browse?platform=site");
  await page.getByRole("button", { name: "▶ Motion only" }).click();
  await expect(page).toHaveURL(/has=video/);
  await expect(page.locator("a[data-card]")).toHaveCount(4);
  const clip = page.locator("a[data-card] video").first();
  await expect(clip).not.toHaveAttribute("autoplay", /.*/);
  await expect.poll(() => clip.evaluate((v: HTMLVideoElement) => !v.paused && v.muted && v.loop)).toBe(true);
});
