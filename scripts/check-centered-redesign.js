const assert = require("node:assert/strict");
const { mkdirSync } = require("node:fs");
const { resolve } = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");
const output = resolve(__dirname, "../screenshots/centered-redesign");
mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 651, height: 851 }, reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    assert.equal((await page.goto(process.argv[3] || "http://localhost:3000", { timeout: 60000 })).status(), 200);
    await page.locator(".portfolio-loader").waitFor({ state: "detached" });
    await page.waitForFunction(() => document.querySelector(".particle-stage").style.getPropertyValue("--identity-opacity") !== "");
    await page.evaluate(() => document.fonts.ready);
    for (const width of [651, 1440, 1068, 390, 320]) {
      await page.setViewportSize({ width, height: width === 651 ? 851 : 844 });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      if (width === 651) await page.screenshot({ path: resolve(output, "651-hero.png") });
      for (const id of ["thinking-transition", "evidence", "about"]) {
        const section = page.locator(`#${id}`);
        await section.evaluate((element) => window.scrollTo({ top: element.offsetTop - 80, behavior: "instant" }));
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No overflow in ${id} at ${width}`);
        const container = await section.locator(".editorial-container").evaluate((element) => {
          const rect = element.getBoundingClientRect(); return { left: rect.left, right: rect.right, width: innerWidth };
        });
        assert.ok(Math.abs(container.left - (container.width - container.right)) < 2, `${id} container is centered at ${width}`);
        assert.equal(await section.locator("h2").first().evaluate((element) => getComputedStyle(element).textAlign), "center");
        if ([651, 390].includes(width)) {
          await section.screenshot({ path: resolve(output, `${width}-${id}.png`), style: ".nav-system, .skip-link, nextjs-portal { visibility: hidden !important; }" });
        }
      }
      for (const selector of [".project-heading", ".project-facts", ".project-notes", ".thinking-inspector"]) {
        assert.equal(await page.locator(selector).first().evaluate((element) => getComputedStyle(element).textAlign), "center", `${selector} stays centered`);
      }
    }
    assert.equal(await page.locator(".career-number").count(), 3);
    assert.equal(await page.locator(".about-credentials").count(), 1);
    await page.locator(".experience-entry details").nth(1).locator("summary").click();
    assert.ok((await page.locator(".experience-entry details").nth(1).innerText()).includes("2,500+"));
    assert.equal(await page.locator(".skill-row").count(), 2, "Skills rows preserved");
    assert.deepEqual(errors, []);
    console.log("Centered redesign passed: symmetric containers, centered headings/facts/notes, 651/1440/1068/390/320px, career disclosures, skills preserved, no runtime errors.");
    console.log(`Screenshots: ${output}`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
