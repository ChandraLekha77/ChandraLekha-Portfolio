const assert = require("node:assert/strict");
const { mkdirSync } = require("node:fs");
const { resolve } = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");
const output = resolve(__dirname, "../screenshots/contact");
mkdirSync(output, { recursive: true });

async function check() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1068, height: 839 }, reducedMotion: "no-preference" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const contact = page.locator("#contact");
  const show = () => contact.evaluate((element) => window.scrollTo({ top: element.offsetTop - 80, behavior: "instant" }));
  const capture = (name) => contact.screenshot({ path: resolve(output, name), style: ".nav-system, .skip-link, nextjs-portal { visibility: hidden !important; }" });
  try {
    assert.equal((await page.goto(process.argv[3] || "http://localhost:3001", { timeout: 60000 })).status(), 200);
    await page.locator(".portfolio-loader").waitFor({ state: "detached" });
    await page.waitForFunction(() => getComputedStyle(document.querySelector(".skill-row")).overflowX === "hidden");
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await contact.getAttribute("data-arrived"), null, "Entry animation waits for contact to enter view");
    assert.equal(await contact.locator(".contact-copy").evaluate((element) => getComputedStyle(element).opacity), "1", "Content is visible by default before the enhancement runs");
    await show();
    await page.waitForFunction(() => document.querySelector("#contact").dataset.arrived === "true");
    assert.ok(await contact.locator(".contact-copy").evaluate((element) => {
      const styles = getComputedStyle(element);
      return styles.animationName === "contact-arrive" && styles.animationIterationCount === "1" && parseFloat(styles.animationDuration) < 1;
    }), "Scroll popup is a short, one-time entrance");
    assert.equal(await contact.locator(".closing-signal i").count(), 3, "Original corner arcs are restored");
    assert.equal(await contact.locator(".contact-layout, .contact-hub").count(), 0, "New layout and diagram removed");
    await page.waitForFunction(() => getComputedStyle(document.querySelector(".contact-copy")).opacity === "1");
    await capture("desktop.png");
    const lines = contact.locator(".contact-title-line");
    await lines.first().hover();
    await page.waitForFunction(() => getComputedStyle(document.querySelector(".contact-title-line")).color === "rgba(0, 0, 0, 0)"
      && getComputedStyle(document.querySelector(".contact-title-line .contact-hover-curve path")).strokeDashoffset === "0px");
    assert.notEqual(await lines.nth(1).evaluate((element) => getComputedStyle(element).color), "rgba(0, 0, 0, 0)", "Only the hovered line gets outlined");
    await page.screenshot({ path: resolve(output, "desktop-hover.png") });
    await page.mouse.move(0, 0);
    await lines.first().focus();
    await page.keyboard.press("Tab");
    assert.equal(await lines.nth(1).evaluate((element) => element === document.activeElement), true);
    await page.waitForFunction(() => getComputedStyle(document.querySelectorAll(".contact-title-line")[1]).color === "rgba(0, 0, 0, 0)");
    const email = contact.locator(".contact-email");
    assert.equal(await email.getAttribute("href"), "mailto:chandralekhaganta7@gmail.com");
    assert.equal(await contact.locator('a[href^="tel:"]').getAttribute("href"), "tel:+19362061480");
    await email.hover();
    await page.waitForFunction(() => getComputedStyle(document.querySelector(".contact-email-label")).color === "rgba(0, 0, 0, 0)"
      && getComputedStyle(document.querySelector(".contact-email .contact-hover-curve path")).strokeDashoffset === "0px");
    await page.mouse.move(0, 0);
    await page.keyboard.press("Tab");
    await page.waitForTimeout(350);
    assert.equal(await email.evaluate((element) => element === document.activeElement), true);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await show();
    assert.equal(await contact.getAttribute("data-arrived"), "true", "One-time entry state persists across scroll reversal");

    for (const [width, height] of [[1440, 1000], [768, 844], [390, 844], [360, 640], [320, 640]]) {
      await page.setViewportSize({ width, height });
      await show();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No overflow at ${width}`);
      assert.ok(await contact.locator("h2").evaluate((element) => element.scrollWidth <= element.clientWidth), "Headline fits the restored layout");
      await capture(`${width}.png`);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const selector of [".contact-copy"]) {
      assert.equal(await contact.locator(selector).first().evaluate((element) => getComputedStyle(element).animationName), "none");
    }
    assert.equal(await contact.locator(".contact-copy").evaluate((element) => getComputedStyle(element).opacity), "1", "Reduced motion preserves readable content");
    await capture("reduced-motion.png");
    assert.deepEqual(errors, []);
    console.log("Contact checks passed: original layout/arcs restored, short scroll entrance, individual text outlines and curved underlines on hover/keyboard focus, real contact links, mobile, reduced motion, no runtime errors.");
    console.log(`Screenshots: ${output}`);
  } finally { await browser.close(); }
}
check().catch((error) => { console.error(error); process.exitCode = 1; });
