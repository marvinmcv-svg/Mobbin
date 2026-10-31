/**
 * Encodes the looping sample clips referenced by db/sample-data.json (`video_path`):
 * renders the brand's full-page SVG to PNG, then pans down it and back with ffmpeg.
 * Requires the pre-installed Playwright Chromium and ffmpeg. Output is our own artwork.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

interface Screen {
  video_path?: string | null;
  full_image_path: string | null;
}

const ROOT = path.join(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "db", "sample-data.json"), "utf8")) as {
  screens: Screen[];
}[];
const jobs = data
  .flatMap((p) => p.screens)
  .filter(
    (s): s is Screen & { video_path: string; full_image_path: string } =>
      !!s.video_path && !!s.full_image_path,
  );

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "clips-"));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const job of jobs) {
    const svgFile = path.join(ROOT, "public", job.full_image_path);
    const png = path.join(tmp, `${path.basename(path.dirname(svgFile))}.png`);
    // Raw SVG documents hang full-page screenshots, so frame the SVG in a tiny HTML page.
    const html = path.join(tmp, "frame.html");
    fs.writeFileSync(
      html,
      `<body style="margin:0"><img src="file://${svgFile}" width="1440" style="display:block"></body>`,
    );
    await page.goto(`file://${html}`);
    await page.locator("img").screenshot({ path: png });
    const out = path.join(ROOT, "public", job.video_path);
    // 6 s loop at 720×450: ease down the page for 3 s, back up for 3 s.
    const y = "(ih-oh)*(1-cos(PI*t/3))/2";
    execFileSync("ffmpeg", [
      "-y",
      "-loglevel",
      "error",
      "-loop",
      "1",
      "-i",
      png,
      "-t",
      "6",
      "-r",
      "30",
      "-vf",
      `crop=1440:900:0:'${y}',scale=720:450,format=yuv420p`,
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "28",
      "-movflags",
      "+faststart",
      "-an",
      out,
    ]);
    console.log(`${job.video_path} ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
  }
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}

main();
