const assert = require("node:assert/strict");
const { mkdirSync } = require("node:fs");
const { resolve } = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");
const url = process.argv[3] || "http://localhost:3000";
const output = resolve(__dirname, "../screenshots/opening");
mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const errors = [];
  async function open(options = {}, hold = false, fallback = false) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, ...options });
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error" && /hydrated|hydration|didn't match/i.test(message.text())) errors.push(message.text()); });
    if (hold) await page.addInitScript(() => {
      window.introHold = true;
      const query = document.querySelector.bind(document);
      document.querySelector = (selector) => window.introHold && selector === '[data-hero-ready="true"]' ? null : query(selector);
    });
    if (fallback) await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
    await page.goto(url, { timeout: 60000, waitUntil: "domcontentloaded" });
    return page;
  }
  async function unlocked(page) {
    await page.locator(".portfolio-loader").waitFor({ state: "detached", timeout: 10000 });
    assert.equal(await page.locator("#portfolio-content").evaluate((element) => element.inert), false);
    assert.equal(await page.locator("#portfolio-content").getAttribute("aria-hidden"), null);
    assert.equal(await page.evaluate(() => document.body.style.overflow), "");
    assert.equal(await page.evaluate(() => document.documentElement.style.overflow), "");
    assert.ok(await page.locator(".hero-copy").isVisible());
  }
  try {
    let page = await open({}, true);
    await page.waitForFunction(() => document.getElementById("portfolio-content").inert);
    assert.equal(await page.locator("#portfolio-content").getAttribute("aria-hidden"), "true");
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute("role")), "dialog", "Focus starts inside the opening, not hidden page content");
    assert.ok(await page.locator(".loader-signature circle").count() >= 40, "Dotted CLG signature is present");
    assert.equal(await page.locator(".portfolio-loader").getAttribute("data-phase"), "preparing");
    await page.waitForTimeout(1250);
    assert.equal(await page.locator(".portfolio-loader").getAttribute("data-phase"), "preparing", "Intro waits for actual hero readiness, not just a fake timer");
    assert.equal(await page.locator(".loader-signature circle").first().evaluate((element) => getComputedStyle(element).opacity), "1");
    assert.equal(await page.getByRole("progressbar").count(), 0, "No invented percentage progress");
    await page.screenshot({ path: resolve(output, "desktop.png") });
    await page.evaluate(() => { window.introHold = false; window.dispatchEvent(new Event("portfolio:hero-ready")); });
    await unlocked(page);
    await page.screenshot({ path: resolve(output, "revealed.png") });
    await page.locator('footer a[href="/privacy"]').click();
    await page.waitForURL("**/privacy");
    assert.equal(await page.locator(".portfolio-loader").count(), 0, "Legal pages do not show the portfolio intro");
    await page.goBack();
    await page.waitForURL(url + "/");
    assert.equal(await page.locator(".portfolio-loader").count(), 0, "Returning through client navigation does not replay the opening");
    await page.close();

    for (const [width, height] of [[390, 844], [360, 640]]) {
      page = await open({ viewport: { width, height } }, true);
      await page.waitForFunction(() => document.getElementById("portfolio-content").inert);
      await page.keyboard.press("Tab");
      assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), "Skip intro ↗");
      await page.keyboard.press("Shift+Tab");
      assert.ok(await page.getByRole("button", { name: "Skip intro" }).evaluate((element) => element === document.activeElement), `Focus remains trapped while phase=${await page.locator(".portfolio-loader").getAttribute("data-phase")}`);
      await page.waitForTimeout(900);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const footer = await page.locator(".loader-footer").boundingBox();
      const center = await page.locator(".loader-center").boundingBox();
      assert.ok(center.y + center.height < footer.y, "Opening content does not collide with mobile controls");
      await page.screenshot({ path: resolve(output, `${width}.png`) });
      if (width === 390) await page.getByRole("button", { name: "Skip intro" }).click();
      else await page.keyboard.press("Escape");
      await unlocked(page);
      assert.equal(await page.evaluate(() => document.activeElement.id), "main-content", "Focus transfers to the portfolio after skipping");
      await page.close();
    }
    page = await open({ reducedMotion: "reduce" });
    await unlocked(page);
    await page.locator('[data-hero-ready="true"]').waitFor({ state: "attached" });
    assert.ok(await page.locator('[data-hero-ready="true"]').count() === 1);
    await page.close();

    page = await open({}, false, true);
    await unlocked(page);
    assert.equal(await page.locator(".journey-fallback").count(), 1, "No-WebGL fallback also releases the opening");
    await page.close();

    page = await open({}, true);
    await page.waitForFunction(() => document.getElementById("portfolio-content").inert);
    const started = Date.now();
    await unlocked(page);
    assert.ok(Date.now() - started >= 4500 && Date.now() - started < 10000, "Readiness failure is bounded by the five-second deadline and exit transition");
    await page.close();

    page = await open({ javaScriptEnabled: false });
    assert.equal(await page.locator(".portfolio-loader").isVisible(), false, "No-JavaScript visitors are not trapped behind the intro");
    assert.equal(await page.locator("#portfolio-content").evaluate((element) => element.inert), false);
    assert.ok(await page.locator(".hero-copy").isVisible());
    await page.close();
    page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route("**/_next/**/*.js*", (route) => route.abort());
    await page.goto(url, { timeout: 60000, waitUntil: "domcontentloaded" });
    await page.locator(".portfolio-loader").waitFor({ state: "hidden", timeout: 11000 });
    assert.equal(await page.locator("#portfolio-content").evaluate((element) => element.inert), false);
    assert.ok(await page.locator(".hero-copy").isVisible(), "CSS safety exit exposes the page when client JavaScript fails to boot");
    await page.close();
    page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route("**/_next/**/*.js*", async (route) => { await new Promise((done) => setTimeout(done, 9000)); await route.continue().catch(() => {}); });
    await page.goto(url, { timeout: 60000, waitUntil: "domcontentloaded" });
    await page.locator(".portfolio-loader").waitFor({ state: "detached", timeout: 15000 });
    assert.equal(await page.locator("#portfolio-content").evaluate((element) => element.inert), false, "Late hydration does not relock the page after the CSS safety exit");
    await page.close();
    assert.deepEqual(errors, []);
    console.log("Opening passed: dotted signature, real readiness gate, smooth reveal, mobile layout, skip/Escape/focus, scroll restoration, reduced motion, SVG fallback, five-second fail-open, no-JS access, no replay on client return, no runtime/hydration errors.");
    console.log(`Screenshots: ${output}`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
