const assert = require("node:assert/strict");
const { mkdirSync } = require("node:fs");
const { resolve } = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");
const url = process.argv[3] || "http://localhost:3001";
const output = resolve(__dirname, "../screenshots/skill-marquee");
mkdirSync(output, { recursive: true });

async function check() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1068, height: 839 } });
  page.setDefaultNavigationTimeout(60000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && /hydration|didn't match|THREE|shader/i.test(message.text())) errors.push(message.text()); });
  const capture = (name) => page.locator("#technology-details").screenshot({ path: resolve(output, name), style: ".nav-system, nextjs-portal { visibility: hidden !important; }" });
  try {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    assert.equal((await page.goto(url)).status(), 200);
    await page.locator(".portfolio-loader").waitFor({ state: "detached" });
    await page.bringToFront();
    const section = page.locator("#technology-details");
    const rows = section.locator(".skill-row");
    const tracks = section.locator(".skill-track");
    await section.scrollIntoViewIfNeeded();
    await rows.first().evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
    await page.mouse.move(5, 5);
    await page.waitForFunction(() => document.querySelector("#technology-details").dataset.paused === "false");
    assert.equal(await rows.count(), 2);
    assert.ok(await section.evaluate((element) => { const bounds = element.getBoundingClientRect(); return Math.abs(bounds.left) < 1 && Math.abs(bounds.right - document.documentElement.clientWidth) < 1; }), "Skill lines span corner to corner");
    assert.ok(await section.evaluate((element) => element.getBoundingClientRect().height < 400), "The toolkit has a compact height");
    assert.equal(await section.locator("details").count(), 0, "The old accordion design is removed");
    assert.deepEqual(await tracks.evaluateAll((elements) => elements.map((element) => getComputedStyle(element).animationDirection)), ["normal", "reverse"]);
    assert.equal(await section.locator('.skill-group[aria-hidden="true"]').count(), 2, "Seamless duplicate copies are hidden from assistive technology");
    const transform = () => tracks.first().evaluate((element) => getComputedStyle(element).transform);
    const moving = await transform();
    await page.waitForFunction((value) => getComputedStyle(document.querySelector(".skill-track")).transform !== value, moving, { timeout: 10000 });
    assert.notEqual(await transform(), moving, "The skills move without scrolling the page");

    await page.getByRole("button", { name: "Pause skill motion" }).click();
    await page.mouse.move(5, 5);
    const paused = await transform();
    await page.waitForTimeout(300);
    assert.equal(await transform(), paused, "The global pause control freezes the text");
    await capture("desktop-filled.png");
    await page.bringToFront();
    await page.getByRole("button", { name: "Resume skill motion" }).click();
    await rows.first().evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
    await page.waitForFunction(() => document.querySelector("#technology-details").dataset.paused === "false");
    await rows.first().hover({ position: { x: 10, y: 2 } });
    const wordIndex = await rows.first().locator(".skill-word").evaluateAll((words) => words.findIndex((word) => { const bounds = word.getBoundingClientRect(); return bounds.left > 20 && bounds.right < innerWidth * .75; }));
    assert.ok(wordIndex >= 0, "A complete skill is visible to hover");
    const hoveredWord = rows.first().locator(".skill-word").nth(wordIndex);
    await hoveredWord.hover();
    await page.waitForTimeout(300);
    const hovered = await transform();
    await page.waitForTimeout(300);
    assert.equal(await transform(), hovered, "Hover freezes the line at its current position");
    assert.equal(await tracks.first().evaluate((element) => getComputedStyle(element).animationPlayState), "paused");
    assert.deepEqual(await hoveredWord.evaluate((element) => ({ color: getComputedStyle(element).color, width: getComputedStyle(element).webkitTextStrokeWidth, stroke: getComputedStyle(element).webkitTextStrokeColor })), { color: "rgba(0, 0, 0, 0)", width: "1px", stroke: "rgb(23, 24, 23)" }, "The hovered skill becomes outlined letters");
    assert.equal(await section.locator(".skill-word").evaluateAll((words) => words.filter((word) => getComputedStyle(word).color === "rgba(0, 0, 0, 0)").length), 1, "Only one skill is outlined; all other skills remain filled");
    assert.equal(await tracks.nth(1).evaluate((element) => getComputedStyle(element).animationPlayState), "running", `Other lines continue moving: ${JSON.stringify(await section.evaluate((element) => ({ paused: element.dataset.paused, hovered: [...element.querySelectorAll('.skill-row:hover')].map((row) => row.getAttribute('aria-label')), focused: document.activeElement.outerHTML.slice(0, 160) })))}`);
    await page.screenshot({ path: resolve(output, "desktop-outlined.png"), style: ".nav-system, nextjs-portal { visibility: hidden !important; }" });
    await page.mouse.move(0, 0);
    assert.equal(await tracks.first().evaluate((element) => getComputedStyle(element).animationPlayState), "running", "Leaving the line resumes its motion");
    await rows.nth(1).focus();
    assert.equal(await tracks.nth(1).evaluate((element) => getComputedStyle(element).animationPlayState), "paused", "Keyboard focus pauses a line");
    assert.equal(await rows.nth(1).locator(".skill-word").evaluateAll((words) => words.filter((word) => getComputedStyle(word).color === "rgba(0, 0, 0, 0)").length), 0, "Focusing the row does not outline the whole set");
    const focusedWord = rows.nth(1).locator('.skill-group:not([aria-hidden="true"]) .skill-word').first();
    await page.keyboard.press("Tab");
    assert.equal(await focusedWord.evaluate((element) => element === document.activeElement), true, "Tab focuses an individual skill");
    await page.waitForTimeout(250);
    assert.equal(await focusedWord.evaluate((element) => getComputedStyle(element).color), "rgba(0, 0, 0, 0)", "Keyboard focus outlines only the focused skill");
    assert.equal(await section.locator(".skill-word").evaluateAll((words) => words.filter((word) => getComputedStyle(word).color === "rgba(0, 0, 0, 0)").length), 1);
    await focusedWord.evaluate((element) => element.blur());
    assert.equal(await rows.nth(1).evaluate((element) => element.scrollLeft), 0, "Leaving keyboard focus restores the seamless loop position");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector("#technology-details").dataset.paused === "true");
    assert.equal(await tracks.first().evaluate((element) => getComputedStyle(element).animationPlayState), "paused", "Offscreen skills do not keep animating");

    for (const width of [390, 360]) {
      await page.setViewportSize({ width, height: 844 });
      await section.scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No page overflow at ${width}px`);
      assert.ok(await section.evaluate((element) => { const bounds = element.getBoundingClientRect(); return Math.abs(bounds.left) < 1 && Math.abs(bounds.right - document.documentElement.clientWidth) < 1 && bounds.height < 400; }), "Mobile skill lines remain compact and edge-to-edge");
      await page.getByRole("button", { name: "Pause skill motion" }).click();
      await capture(`mobile-${width}.png`);
      await page.getByRole("button", { name: "Resume skill motion" }).click();
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(await tracks.first().evaluate((element) => getComputedStyle(element).animationName), "none");
    assert.equal(await tracks.first().evaluate((element) => getComputedStyle(element).transform), "none");
    assert.equal(await section.locator('.skill-group[aria-hidden="true"]').first().isVisible(), false);
    assert.equal(await page.getByRole("button", { name: "Pause skill motion" }).isVisible(), false);
    for (const group of await section.locator('.skill-group:not([aria-hidden="true"])').all()) assert.equal(await group.evaluate((element) => getComputedStyle(element).flexWrap), "wrap", "Reduced-motion skills wrap into readable static lines");
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Static skill lists fit mobile");
    await capture("mobile-reduced-motion.png");
    assert.deepEqual(errors, [], "No browser runtime or hydration errors");
    console.log("Skill marquee checks passed: two compact edge-to-edge lines, opposite directions, individual hover outlines, keyboard focus, global pause, offscreen pause, mobile, and reduced motion.");
    console.log(`Screenshots: ${output}`);
  } catch (error) {
    console.error("Marquee state:", await page.evaluate(() => ({
      paused: document.querySelector("#technology-details")?.dataset.paused,
      hidden: document.hidden,
      rect: document.querySelector("#technology-details")?.getBoundingClientRect().toJSON(),
      focused: document.activeElement.outerHTML.slice(0, 160),
      hovered: [...document.querySelectorAll(".skill-row:hover")].map((row) => row.getAttribute("aria-label")),
      animations: [...document.querySelectorAll(".skill-track")].map((element) => ({ play: getComputedStyle(element).animationPlayState, name: getComputedStyle(element).animationName, transform: getComputedStyle(element).transform }))
    })));
    throw error;
  } finally { await browser.close(); }
}
check().catch((error) => { console.error(error); process.exitCode = 1; });
