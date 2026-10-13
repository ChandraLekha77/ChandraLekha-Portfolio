const assert = require("node:assert/strict");
const { mkdirSync } = require("node:fs");
const { resolve } = require("node:path");
const { createHash } = require("node:crypto");
const { chromium } = require(process.argv[2] || "playwright");
const url = process.argv[3] || "http://localhost:3001";
const output = resolve(__dirname, "../screenshots/particle-journey");
mkdirSync(output, { recursive: true });

async function check() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultNavigationTimeout(60000);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && /THREE|shader|WebGL/i.test(message.text())) errors.push(message.text()); });
  await page.addInitScript(() => {
    window.journeyDrawCalls = 0;
    const drawArrays = WebGL2RenderingContext.prototype.drawArrays;
    WebGL2RenderingContext.prototype.drawArrays = function (...args) {
      if (this.canvas.classList.contains("journey-canvas")) window.journeyDrawCalls++;
      return drawArrays.apply(this, args);
    };
    window.readJourneyPixels = (canvas) => {
      const gl = canvas.getContext("webgl2");
      const raw = new Uint8Array(canvas.width * canvas.height * 4);
      gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, raw);
      const pixels = new Uint8Array(raw.length);
      const rowSize = canvas.width * 4;
      for (let row = 0; row < canvas.height; row++) pixels.set(raw.subarray(row * rowSize, (row + 1) * rowSize), (canvas.height - row - 1) * rowSize);
      return pixels;
    };
  });
  async function goTo(target, progress) {
    await target.evaluate((value) => {
      const track = document.querySelector(".particle-track");
      const stage = document.querySelector(".particle-stage");
      window.scrollTo({ top: track.offsetTop + (track.offsetHeight - stage.clientHeight) * value, behavior: "instant" });
    }, progress);
    await target.waitForTimeout(1100);
    if (progress === 0) await target.waitForFunction(() => Number(document.querySelector(".particle-stage").style.getPropertyValue("--identity-opacity")) > 0.99);
  }
  async function noOverflow(target) {
    assert.equal(await target.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, "No horizontal overflow");
  }
  async function heroAlignment(target) {
    const bounds = await target.evaluate(() => {
      const hero = document.querySelector(".hero-copy").getBoundingClientRect();
      const name = document.querySelector(".hero-copy h1").getBoundingClientRect();
      const intro = document.querySelector(".hero-copy .intro").getBoundingClientRect();
      return { heroLeft: hero.left, heroRight: hero.right, nameLeft: name.left, nameRight: name.right, introLeft: intro.left };
    });
    assert.ok(Math.abs(bounds.nameLeft - bounds.introLeft) < 1, "Hero name and description must share a left edge");
    assert.ok(bounds.nameRight <= bounds.heroRight + 1, "Name must fit its text column");
  }
  try {
    const response = await page.goto(url);
    assert.equal(response.status(), 200, "Preview must respond successfully");
    await page.locator(".journey-fallback").waitFor({ state: "detached" });
    await page.locator(".portfolio-loader").waitFor({ state: "detached" });
    await page.screenshot({ path: resolve(output, "desktop-constellation.png") });
    await heroAlignment(page);
    const idleDraws = await page.evaluate(() => window.journeyDrawCalls);
    await page.waitForTimeout(200);
    assert.ok(await page.evaluate(() => window.journeyDrawCalls) > idleDraws, "The data constellation gently animates while visible");
    await page.getByRole("button", { name: "Pause visual motion", exact: true }).click();
    await page.waitForTimeout(150);
    const pausedDraws = await page.evaluate(() => window.journeyDrawCalls);
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => window.journeyDrawCalls), pausedDraws, "Pause stops idle GPU work");
    await page.getByRole("button", { name: "Resume visual motion", exact: true }).click();
    const painted = await page.locator("canvas").first().evaluate((canvas) => {
      const pixels = window.readJourneyPixels(canvas);
      return pixels.filter((_, index) => index % 4 === 3 && pixels[index] > 0).length;
    });
    assert.ok(painted > 3000, "The data constellation must be painted");
    assert.equal(await page.locator(".journey-canvas").evaluate((canvas) => Boolean(canvas.getContext("webgl2"))), true, "The dot shader must render using WebGL");
    const colourCounts = await page.locator(".journey-canvas").evaluate((canvas) => {
      const pixels = window.readJourneyPixels(canvas);
      const counts = { vivid: 0, neutral: 0 };
      for (let i = 0; i < pixels.length; i += 4) {
        const [r, g, b, alpha] = pixels.slice(i, i + 4);
        if (alpha < 70) continue;
        if (Math.max(r, g, b) - Math.min(r, g, b) > 45) counts.vivid++;
        else counts.neutral++;
      }
      return counts;
    });
    assert.ok(colourCounts.vivid > 100, "Natural solar-system body colours are visible");
    assert.equal(await page.locator("svg image").count(), 0, "No portrait images remain in the hero");
    const centerOfLight = () => page.locator("canvas").first().evaluate((canvas) => {
      const pixels = window.readJourneyPixels(canvas);
      const ratio = canvas.height / canvas.clientHeight;
      let total = 0;
      let weightedY = 0;
      for (let pixel = 3; pixel < pixels.length; pixel += 4) {
        const alpha = pixels[pixel];
        total += alpha;
        weightedY += alpha * Math.floor((pixel / 4) / canvas.width);
      }
      return weightedY / total / ratio;
    });
    const sourceCenter = await centerOfLight();
    await goTo(page, 0.22);
    assert.ok(Number.isFinite(sourceCenter) && Number.isFinite(await centerOfLight()), "Scroll transition keeps a valid point cloud");
    await page.screenshot({ path: resolve(output, "desktop-transition.png") });
    await goTo(page, 0.43);
    await page.screenshot({ path: resolve(output, "desktop-scatter.png") });
    await goTo(page, 0.7);
    await page.screenshot({ path: resolve(output, "desktop-merge.png") });
    await page.getByRole("navigation", { name: "Portfolio chapters" }).getByRole("link", { name: "02 Experience" }).click();
    await page.waitForFunction(() => Number(document.querySelector(".particle-stage").style.getPropertyValue("--technology-opacity")) > 0.99);
    assert.equal(await page.locator(".technology-content").getAttribute("aria-hidden"), "false");
    assert.equal(await page.getByRole("heading", { name: "5 years of experience. Real impact.", exact: true }).count(), 1);
    assert.ok((await page.locator(".experience-proof").innerText()).includes("Holiday Channel"));
    assert.ok((await page.locator(".experience-proof").innerText()).includes("ViHawk"));
    assert.ok((await page.locator(".experience-proof").innerText()).includes("3½"));
    assert.equal(await page.locator(".identity-content").getAttribute("inert"), "");
    await page.screenshot({ path: resolve(output, "desktop-globe.png") });
    const globeSide = await page.locator(".journey-canvas").evaluate((canvas) => {
      const pixels = window.readJourneyPixels(canvas);
      let total = 0, xSum = 0;
      for (let i = 3; i < pixels.length; i += 4) { total += pixels[i]; xSum += pixels[i] * ((i / 4 | 0) % canvas.width); }
      return xSum / total / canvas.width;
    });
    assert.ok(globeSide < 0.5, "The completed globe belongs on the left");
    assert.ok(await page.locator(".technology-copy").evaluate((copy) => copy.getBoundingClientRect().left > innerWidth * 0.5), "Technology copy belongs to the right of the globe");
    await noOverflow(page);
    await page.getByRole("link", { name: "Explore my experience" }).click();
    assert.equal(await page.getByRole("link", { name: "Explore my experience" }).getAttribute("href"), "#about");
    await page.locator("#about").waitFor();
    await page.waitForTimeout(1200);
    assert.ok(await page.locator("#technology-details").textContent().then((text) => text.includes("Python") && text.includes("Power BI")));
    await goTo(page, 0);
    await page.waitForFunction(() => Number(document.querySelector(".particle-stage").style.getPropertyValue("--identity-opacity")) > 0.99);
    assert.equal(await page.locator(".particle-stage").getAttribute("data-chapter"), "identity");
    assert.ok(Number(await page.locator(".particle-stage").evaluate((stage) => stage.style.getPropertyValue("--identity-opacity"))) > 0.99);

    await page.setViewportSize({ width: 567, height: 839 });
    await goTo(page, 0);
    await page.screenshot({ path: resolve(output, "annotated-width-constellation.png") });
    await heroAlignment(page);
    await noOverflow(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: resolve(output, "mobile-constellation.png") });
    await heroAlignment(page);
    await noOverflow(page);
    await page.getByRole("button", { name: "Open chapter index" }).click();
    await page.getByRole("button", { name: "Close chapter index" }).click();
    await page.getByRole("button", { name: "Open chapter index" }).click();
    await page.locator(".mobile-index").getByRole("link", { name: "02 Experience" }).click();
    await page.waitForFunction(() => Number(document.querySelector(".particle-stage").style.getPropertyValue("--technology-opacity")) > 0.99);
    await page.screenshot({ path: resolve(output, "mobile-globe.png") });
    await noOverflow(page);
    await page.setViewportSize({ width: 360, height: 640 });
    await goTo(page, 0);
    await page.screenshot({ path: resolve(output, "small-mobile-constellation.png") });
    await heroAlignment(page);
    await noOverflow(page);

    for (const [width, height] of [[1068, 839], [390, 844], [360, 640]]) {
      await page.setViewportSize({ width, height });
      await goTo(page, .96);
      const bounds = await page.locator(".technology-copy").evaluate((copy) => {
        const rect = copy.getBoundingClientRect();
        const radius = Math.min(innerWidth * .27, innerHeight * .2);
        const rail = document.querySelector(".chapter-rail").getBoundingClientRect();
        return { right: rect.right, bottom: rect.bottom, globeTop: innerHeight * .72 - radius, railLeft: rail.left };
      });
      if (width < 760) assert.ok(bounds.bottom < bounds.globeTop - 8, `Experience copy stays clear of the unchanged globe at ${width}x${height}`);
      else assert.ok(bounds.right < bounds.railLeft, "Experience copy stays clear of the chapter rail");
      await noOverflow(page);
      await page.screenshot({ path: resolve(output, `experience-${width}.png`) });
    }

    await page.emulateMedia({ reducedMotion: "reduce" });
    await goTo(page, 0.8);
    const hash = (buffer) => createHash("sha256").update(buffer).digest("hex");
    const before = hash(await page.locator("canvas").first().screenshot());
    await page.waitForTimeout(350);
    assert.equal(hash(await page.locator("canvas").first().screenshot()), before, "Reduced motion must stop globe rotation");
    assert.equal(await page.locator(".technology-content").getAttribute("aria-hidden"), "false");
    const fallback = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    fallback.on("pageerror", (error) => errors.push(error.message));
    await fallback.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
    await fallback.goto(url);
    await fallback.locator(".portfolio-loader").waitFor({ state: "detached" });
    await fallback.locator(".journey-fallback").waitFor();
    await fallback.waitForFunction(() => document.querySelector(".particle-stage").style.getPropertyValue("--identity-opacity") !== "");
    await goTo(fallback, 0.8);
    await fallback.waitForFunction(() => document.querySelector(".particle-stage").dataset.chapter === "technologies");
    assert.equal(await fallback.locator(".journey-fallback circle").count(), 1, "Canvas fallback must become a globe");
    assert.equal(await fallback.locator(".technology-content").getAttribute("aria-hidden"), "false");
    assert.deepEqual(errors, [], "No browser runtime errors");
    console.log("Browser checks passed: solar-system particles, idle motion/pause, scroll assembly into globe, experience overview, navigation, reversal, mobile, reduced motion, canvas fallback.");
    console.log(`Screenshots: ${output}`);
  } catch (error) {
    console.error("Browser runtime errors:", errors);
    console.error("Scroll state:", await page.evaluate(() => ({ scroll: scrollY, trackTop: document.querySelector(".particle-track")?.getBoundingClientRect().top, style: document.querySelector(".particle-stage")?.getAttribute("style") })).catch(() => null));
    throw error;
  } finally { await browser.close(); }
}

check().catch((error) => { console.error(error); process.exitCode = 1; });
