// Renders tools/og-image.html to assets/og-image.png (1200x630).
// Needs Playwright, which is NOT a dependency of the site. Run with any existing install, e.g.:
//   NODE_PATH=../evans-photography/node_modules node tools/make-og.js
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto("file://" + path.resolve(__dirname, "og-image.html"));
  await page.screenshot({ path: path.resolve(__dirname, "..", "assets", "og-image.png") });
  await browser.close();
  console.log("Wrote assets/og-image.png");
})();
