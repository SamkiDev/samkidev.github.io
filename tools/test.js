// Browser checks for the portfolio. Playwright (and optionally @axe-core/playwright) are NOT
// dependencies of the site; point NODE_PATH at an existing install. With the site served on BASE_URL:
//   NODE_PATH=../evans-photography/node_modules node tools/test.js
const { chromium } = require("playwright");
let AxeBuilder = null;
try { AxeBuilder = require("@axe-core/playwright").default; } catch (e) { /* optional */ }

const BASE = process.env.BASE_URL || "http://localhost:8790/";
const failures = [];
const fail = (where, msg) => { failures.push(`[${where}] ${msg}`); console.log(`  ✗ ${msg}`); };
const pass = (msg) => console.log(`  ✓ ${msg}`);

async function checkView(browser, width, height, theme) {
  const where = `${width}px ${theme}`;
  console.log(`\n${where}`);
  const ctx = await browser.newContext({ viewport: { width, height } });
  await ctx.addInitScript((t) => localStorage.setItem("theme", t), theme);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("requestfailed", (r) => errors.push("request failed: " + r.url()));
  page.on("response", (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

  await page.goto(BASE, { waitUntil: "networkidle" });

  const applied = await page.evaluate(() => document.documentElement.dataset.theme);
  applied === theme ? pass(`theme is ${theme}`) : fail(where, `theme is ${applied}, expected ${theme}`);

  // Scroll through the whole page so lazy and reveal content is triggered
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    window.scrollTo(0, 0);
  });

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  overflow <= 0 ? pass("no horizontal scroll") : fail(where, `horizontal overflow of ${overflow}px`);

  const wide = await page.evaluate(() => [...document.querySelectorAll("body *")]
    .filter((n) => { const r = n.getBoundingClientRect(); return r.width && r.right > window.innerWidth + 1 && !n.closest(".hero-visual, .hp, .skip-link, dialog, .marquee"); })
    .slice(0, 5).map((n) => n.tagName + "." + n.className));
  wide.length ? fail(where, "elements wider than the screen: " + wide.join(", ")) : pass("no element sticks out of the screen");

  // Menu
  const menuBtn = page.locator("#menu-toggle");
  if (await menuBtn.isVisible()) {
    await menuBtn.click();
    const open = (await menuBtn.getAttribute("aria-expanded")) === "true" && (await page.locator("#nav-list a").first().isVisible());
    open ? pass("mobile menu opens") : fail(where, "mobile menu did not open");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    (await menuBtn.getAttribute("aria-expanded")) === "false" ? pass("Esc closes the menu") : fail(where, "Esc did not close the menu");
    await menuBtn.click();
    await page.locator("#nav-list a[href='#projects']").click();
    await page.waitForTimeout(700);
    const closed = (await menuBtn.getAttribute("aria-expanded")) === "false";
    const top = await page.evaluate(() => document.getElementById("projects").getBoundingClientRect().top);
    closed && Math.abs(top) < 120 ? pass("menu link scrolls to Projects and closes the menu") : fail(where, `menu link: closed=${closed}, top=${top}`);
  } else {
    const navVisible = await page.locator("#nav-list a").first().isVisible();
    navVisible ? pass("desktop nav visible") : fail(where, "desktop nav hidden");
  }

  // Theme toggle round trip
  await page.locator("#theme-toggle").click();
  const flipped = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.locator("#theme-toggle").click();
  flipped !== theme ? pass("theme toggle works") : fail(where, "theme toggle did not change theme");

  // Every project modal: opens, Esc closes, focus returns
  const ids = await page.$$eval("[data-project]", (bs) => bs.map((b) => b.dataset.project));
  for (const id of ids) {
    const btn = page.locator(`[data-project="${id}"]`);
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    const isOpen = await page.evaluate(() => document.getElementById("project-modal").open);
    const title = await page.locator("#modal-title").textContent();
    const modalOverflow = await page.evaluate(() => { const m = document.querySelector(".modal-inner"); return m.scrollWidth - m.clientWidth; });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(150);
    const closed = !(await page.evaluate(() => document.getElementById("project-modal").open));
    const focusBack = await page.evaluate((i) => document.activeElement && document.activeElement.dataset.project === i, id);
    if (isOpen && closed && focusBack && modalOverflow <= 0) pass(`modal "${title}" opens, closes with Esc, returns focus`);
    else fail(where, `modal ${id}: open=${isOpen} closed=${closed} focusBack=${focusBack} overflow=${modalOverflow}`);
  }
  // Close button and backdrop click
  if (ids.length) {
    await page.locator(`[data-project="${ids[0]}"]`).click();
    await page.locator("#modal-close").click();
    const c1 = !(await page.evaluate(() => document.getElementById("project-modal").open));
    await page.locator(`[data-project="${ids[0]}"]`).click();
    await page.mouse.click(3, height - 3);
    const c2 = !(await page.evaluate(() => document.getElementById("project-modal").open));
    c1 && c2 ? pass("close button and backdrop click close the modal") : fail(where, `close button=${c1} backdrop=${c2}`);
  }

  // Filters
  const filterBtns = page.locator("[data-filter]");
  if (await filterBtns.count()) {
    await page.locator('[data-filter="concept"]').click();
    const shown = await page.$$eval("#project-grid .status", (s) => s.map((x) => x.textContent));
    await page.locator('[data-filter="all"]').click();
    shown.length && shown.every((s) => s === "Concept") ? pass("status filter works") : fail(where, "filter showed " + shown.join(","));
  }

  // Contact form validation
  await page.locator("#cf-submit").click();
  const invalid = await page.locator('[aria-invalid="true"]').count();
  invalid === 3 ? pass("empty form is rejected with 3 marked fields") : fail(where, `expected 3 invalid fields, got ${invalid}`);

  if (AxeBuilder) {
    const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    res.violations.length
      ? res.violations.forEach((v) => fail(where, `axe: ${v.id} (${v.nodes.length}) ${v.nodes[0].target}`))
      : pass("axe: no WCAG A/AA violations");
  }

  await page.screenshot({ path: `tools/shots/${width}-${theme}.png`, fullPage: true });
  errors.length ? fail(where, "console/network problems: " + errors.join(" | ")) : pass("no console errors or failed requests");
  await ctx.close();
}

async function checkLinks(browser) {
  console.log("\nLinks and files");
  const page = await browser.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  // Open every modal so links rendered inside them are collected too
  const hrefs = new Set(await page.$$eval("a[href]", (as) => as.map((a) => a.href)));
  for (const id of await page.$$eval("[data-project]", (bs) => bs.map((b) => b.dataset.project))) {
    await page.locator(`[data-project="${id}"]`).click();
    (await page.$$eval("#project-modal a[href]", (as) => as.map((a) => a.href))).forEach((h) => hrefs.add(h));
    await page.keyboard.press("Escape");
  }
  const anchors = [...hrefs].filter((h) => h.startsWith(BASE + "#"));
  for (const h of anchors) {
    const id = h.split("#")[1];
    if (id.startsWith("project-")) {
      await page.evaluate(() => { const m = document.getElementById("project-modal"); if (m.open) m.close(); });
      await page.waitForFunction(() => !location.hash);
      await page.evaluate((i) => { location.hash = i; }, id);
      const opened = await page.waitForFunction(() => document.getElementById("project-modal").open, null, { timeout: 3000 })
        .then(() => true, () => false);
      opened ? pass(`#${id} opens its project`) : fail("links", `#${id} does not open a project`);
      await page.keyboard.press("Escape");
      continue;
    }
    const ok = await page.evaluate((i) => !!document.getElementById(i), id);
    ok ? pass(`anchor #${id}`) : fail("links", `missing anchor #${id}`);
  }
  const external = [...hrefs].filter((h) => /^https?:/.test(h) && !h.startsWith(BASE));
  for (const h of external) {
    try {
      const r = await fetch(h, { method: "GET", redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 link-check" } });
      if (r.status === 999 && /linkedin\.com/.test(h)) pass(`skipped ${h} (LinkedIn blocks automated checks)`);
      else r.ok ? pass(`${r.status} ${h}`) : fail("links", `${r.status} ${h}`);
    } catch (e) { fail("links", `unreachable ${h}`); }
  }
  for (const f of ["robots.txt", "sitemap.xml", "assets/og-image.png", "assets/favicon.svg"]) {
    const r = await fetch(BASE + f);
    r.ok ? pass(`${r.status} /${f}`) : fail("files", `${r.status} /${f}`);
  }
  await page.close();
}

async function checkPhotoSpot(browser) {
  console.log("\nProfile photo spot");
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  (await page.locator("#about-photo").isHidden()) ? pass("hidden while no photo is set") : fail("photo", "visible without a photo");
  const png = await (await fetch(BASE + "assets/og-image.png")).arrayBuffer();
  await page.route("**/js/config.js", async (route) => {
    const res = await route.fetch();
    const body = (await res.text()).replace('profilePhoto: ""', 'profilePhoto: "assets/profile.jpg"');
    route.fulfill({ response: res, body });
  });
  await page.route("**/assets/profile.jpg", (route) => route.fulfill({ status: 200, contentType: "image/png", body: Buffer.from(png) }));
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("#about").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  (await page.locator("#about-photo").isVisible()) ? pass("shows once profilePhoto is set and the file loads") : fail("photo", "not shown with a photo");
  await page.screenshot({ path: "tools/shots/photo-spot.png", clip: await page.locator("#about").boundingBox() });
  await ctx.close();
}

(async () => {
  require("fs").mkdirSync("tools/shots", { recursive: true });
  const browser = await chromium.launch();
  for (const [w, h] of [[390, 844], [1440, 900]]) for (const t of ["dark", "light"]) await checkView(browser, w, h, t);
  await checkLinks(browser);
  await checkPhotoSpot(browser);
  await browser.close();
  console.log(failures.length ? `\n${failures.length} problem(s):\n` + failures.join("\n") : "\nAll checks passed.");
  process.exit(failures.length ? 1 : 0);
})();
