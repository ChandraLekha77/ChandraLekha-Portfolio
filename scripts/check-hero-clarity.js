const assert = require("node:assert/strict");
const { mkdirSync, readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");
const output = resolve(__dirname, "../screenshots/hero-clarity");
mkdirSync(output, { recursive: true });
function luminance(rgb) {
  const channels = rgb.match(/[\d.]+/g).slice(0, 3).map(Number).map((value) => {
    value /= 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  });
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
(async () => {
  const source = readFileSync(resolve(__dirname, "../lib/solarSystem.js"), "utf8");
  const { solarLayout } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    assert.equal((await page.goto(process.argv[3] || "http://localhost:3000", { timeout: 60000 })).status(), 200);
    await page.locator(".portfolio-loader").waitFor({ state: "detached" });
    await page.locator(".journey-fallback").waitFor({ state: "detached" });
    await page.evaluate(() => document.fonts.ready);
    for (const [width, height] of [[1920, 910], [1440, 900], [1068, 839], [768, 844], [651, 851], [390, 844], [360, 640]]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForFunction(() => {
        const styles = getComputedStyle(document.querySelector(".hero-copy"));
        return innerWidth < 760 ? styles.transform === "none" && parseFloat(styles.top) < 130 : styles.transform !== "none";
      });
      await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
      await page.waitForFunction(() => Number(document.querySelector(".particle-stage").style.getPropertyValue("--identity-opacity")) === 1);
      const data = await page.evaluate((layout) => {
        const hero = document.querySelector(".hero-copy");
        const stage = document.querySelector(".particle-stage");
        const bounds = hero.getBoundingClientRect();
        return {
          background: getComputedStyle(stage).backgroundColor,
          texts: ["h1", ".eyebrow", ".role", ".intro", ".hero-actions a"].map((selector) => {
            const styles = getComputedStyle(hero.querySelector(selector));
            return { selector, color: styles.color, background: styles.backgroundColor === "rgba(0, 0, 0, 0)" ? getComputedStyle(stage).backgroundColor : styles.backgroundColor, weight: Number(styles.fontWeight) };
          }),
          bottom: bounds.bottom, right: bounds.right,
          visualTop: layout.y - layout.radius * .7,
          visualLeft: layout.x - layout.radius * .93,
          nameSize: parseFloat(getComputedStyle(hero.querySelector("h1")).fontSize),
          givenSize: parseFloat(getComputedStyle(hero.querySelector(".given-name")).fontSize)
        };
      }, solarLayout(width, height));
      for (const text of data.texts) {
        const foreground = luminance(text.color);
        const background = luminance(text.background);
        const contrast = (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
        assert.ok(contrast >= 7, `${text.selector} has strong contrast (${contrast.toFixed(1)}:1) at ${width}`);
        assert.ok(text.weight >= 500, `${text.selector} avoids thin styling`);
      }
      if (width < 760) assert.ok(data.bottom + 12 < data.visualTop, `Text stays clear of animation at ${width}x${height}: ${data.bottom} vs ${data.visualTop}`);
      else assert.ok(data.right + 15 < data.visualLeft, "Desktop text/visual have separate zones");
      if (width >= 1068) assert.ok(data.visualLeft - data.right < width * .1, "Wide-screen composition avoids the previous oversized central gap");
      assert.equal(data.nameSize, data.givenSize, "Full name uses consistent sizing, not an oversized surname");
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.equal(await page.locator(".hero-primary").getAttribute("href"), "#evidence");
      assert.ok(await page.locator(".hero-copy h1").evaluate((element) => element.scrollWidth <= element.clientWidth), "Name fits its editorial text column");
      await page.screenshot({ path: resolve(output, `${width}.png`) });
    }
    assert.deepEqual(errors, []);
    console.log("Hero clarity passed: computed text contrast >=7:1, weight >=500, text/visual separation, desktop/mobile, no overflow or runtime errors.");
    console.log(`Screenshots: ${output}`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
