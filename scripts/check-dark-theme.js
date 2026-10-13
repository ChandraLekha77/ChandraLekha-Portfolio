const assert = require("node:assert/strict");
const { mkdirSync } = require("node:fs");
const { resolve } = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");
const output = resolve(__dirname, "../screenshots/dark-theme");
mkdirSync(output, { recursive: true });
function luminance(color) {
  const values = color.match(/[\d.]+/g).slice(0, 3).map(Number).map((value) => {
    value /= 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  });
  return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
}
function readable(foreground, background, label) {
  const a = luminance(foreground), b = luminance(background);
  assert.ok((Math.max(a, b) + .05) / (Math.min(a, b) + .05) >= 4.5, `${label} has readable dark-theme contrast`);
}
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto(process.argv[3] || "http://localhost:3000", { timeout: 60000, waitUntil: "domcontentloaded" });
    await page.locator(".portfolio-loader").waitFor({ state: "detached" });
    const palette = await page.evaluate(() => {
      const css = getComputedStyle(document.documentElement);
      return { bg: css.getPropertyValue("--bg").trim(), scheme: css.colorScheme, body: getComputedStyle(document.body).backgroundColor };
    });
    assert.equal(palette.bg, "#0b1220");
    assert.equal(palette.scheme, "dark", "Native select controls use the dark color scheme");
    assert.ok(luminance(palette.body) < .025);
    for (const selector of [".hero-copy h1", ".hero-copy .role", ".hero-copy .intro", ".contact-corner span", ".journey-caption", ".eyebrow-label", ".project-demo", ".about-intro p", ".career-location", ".contact-section p", "footer"]) {
      const color = await page.locator(selector).first().evaluate((element) => getComputedStyle(element).color);
      readable(color, palette.body, selector);
    }
    await page.getByRole("button", { name: "Explore Validate", exact: true }).focus();
    const card = page.locator(".planet-card:not([hidden])");
    const cardStyle = await card.evaluate((element) => ({ bg: getComputedStyle(element).backgroundColor, text: getComputedStyle(element.querySelector("p")).color }));
    assert.ok(luminance(cardStyle.bg) < .04, "Workflow cards are dark, not leftover ivory panels");
    readable(cardStyle.text, cardStyle.bg, "Workflow card");
    await page.screenshot({ path: resolve(output, "desktop-card.png") });
    await card.getByRole("button", { name: "Close Validate card" }).click();
    await page.screenshot({ path: resolve(output, "desktop-hero.png") });
    for (const selector of ["#thinking-transition", ".email-demo", ".voice-demo", "#about", "#contact"]) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      const background = await page.locator(selector).evaluate((element) => getComputedStyle(element).backgroundColor);
      if (background !== "rgba(0, 0, 0, 0)") assert.ok(luminance(background) < .04, `${selector} retains a dark surface`);
      await page.locator(selector).screenshot({ path: resolve(output, `${selector.replace(/^[#.]/, "")}.png`), style: ".nav-system, nextjs-portal { visibility: hidden !important; }" });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForFunction(() => Number(document.querySelector(".particle-stage").style.getPropertyValue("--identity-opacity")) === 1);
    await page.getByRole("button", { name: "Open chapter index", exact: true }).click();
    const menu = await page.locator(".mobile-index").evaluate((element) => ({ bg: getComputedStyle(element).backgroundColor, text: getComputedStyle(element).color }));
    assert.ok(luminance(menu.bg) < .025);
    readable(menu.text, palette.body, "Mobile menu");
    await page.keyboard.press("Escape");
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: resolve(output, "mobile-hero.png") });
    assert.deepEqual(errors, []);
    console.log("Dark theme passed: deep space navy tokens, native dark controls, readable text/cards/menu, dark section surfaces, desktop/mobile screenshots, no runtime errors.");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
