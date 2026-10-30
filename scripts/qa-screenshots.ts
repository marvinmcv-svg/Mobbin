/** Captures each page at 390, 768 and 1440 px into docs/qa/. Requires the app running on :3000. */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

async function main() {
  const browser = await chromium.launch();
  const probe = await browser.newPage();
  await probe.goto(`${BASE}/browse?platform=site`);
  const screenHref = await probe.locator("a[data-card]").first().getAttribute("href");
  await probe.goto(`${BASE}/apps/brightloop`);
  const flowHref = await probe.locator('a[href^="/flow/"]').first().getAttribute("href");
  await probe.close();

  const pages: [string, string][] = [
    ["home", "/"],
    ["browse-sites", "/browse?platform=site"],
    ["browse-ios", "/browse?platform=ios"],
    ["screen", screenHref!],
    ["flow", flowHref!],
    ["app", "/apps/kitebase"],
  ];
  for (const width of [390, 768, 1440]) {
    for (const theme of width === 1440 ? ["light", "dark"] : ["light"]) {
      const ctx = await browser.newContext({
        viewport: { width, height: 900 },
        colorScheme: theme as "light" | "dark",
      });
      const page = await ctx.newPage();
      for (const [name, path] of pages) {
        await page.goto(BASE + path, { waitUntil: "networkidle" });
        await page.waitForTimeout(400);
        await page.screenshot({
          path: `docs/qa/${name}-${width}${theme === "dark" ? "-dark" : ""}.png`,
        });
      }
      await ctx.close();
    }
  }
  await browser.close();
}

main();
