const assert = require("node:assert/strict");
const { readFileSync, mkdirSync } = require("node:fs");
const { resolve } = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");
const output = resolve(__dirname, "../screenshots/solar-system");
mkdirSync(output, { recursive: true });
(async () => {
  const source = readFileSync(resolve(__dirname, "../lib/solarSystem.js"), "utf8");
  const { planets, solarPoint, planetPosition, solarLayout, solarLabels, orbitTilt } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
  assert.deepEqual(planets.map((planet) => planet.name), ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"]);
  assert.deepEqual(planets.map((planet) => planet.step), ["Ask", "Collect", "Connect", "Clean", "Analyze", "Visualize", "Validate", "Communicate"]);
  for (const count of [3600, 7200]) for (let index = 0; index < count; index++) {
    const point = solarPoint(index, count, 20);
    for (const value of [point.x, point.y, point.z, point.alpha, point.phase, ...point.color]) assert.ok(Number.isFinite(value));
    assert.ok(Math.abs(point.x) < 1 && Math.abs(point.y) < .7);
    assert.ok(point.phase >= 0 && point.phase < 1 && point.alpha > 0 && point.alpha <= 1);
    assert.deepEqual(point, solarPoint(index, count, 20));
  }
  assert.notDeepEqual(planetPosition(2, 0), planetPosition(2, 1));
  const surface = Array.from({ length: 7200 }, (_, index) => solarPoint(index, 7200));
  const jupiter = surface.filter((_, index) => index % 9 === 5);
  assert.ok(new Set(jupiter.map((point) => point.color.join(","))).size > 30, "Planet surfaces have directional shading and band detail");
  assert.ok(surface.some((point) => point.alpha < .03) && surface.some((point) => point.alpha > .97), "Far-side dots do not wash out the front hemisphere");
  assert.ok(orbitTilt < -.4, "Orbital plane has a visible diagonal tilt");
  for (const [width, height] of [[1068, 839], [651, 851]]) {
    const oldRadius = width < 760 ? Math.min(width * .32, height * .17) : Math.min(width * .16, height * .28);
    assert.ok(solarLayout(width, height).radius >= oldRadius * 1.2, "Solar system is at least twenty percent larger");
  }
  for (const [width, height] of [[1068, 839], [651, 851], [390, 844], [360, 640]]) for (const time of [0, 20, 100, 400]) {
    const offsets = solarLabels(width, height, time);
    assert.equal(offsets.length, 8);
    for (const offset of offsets) assert.ok(Number.isFinite(offset.x) && Number.isFinite(offset.y));
  }
  for (let time = 0; time < 400; time += .5) {
    const layout = solarLayout(360, 640);
    const boxes = solarLabels(360, 640, time).map((offset, index) => {
      const position = planetPosition(index, time);
      const x = layout.x + position.x * layout.radius + offset.x;
      const y = layout.y + position.y * layout.radius + offset.y;
      const halfWidth = (planets[index].step.length * 6.3 + 10) / 2;
      return { left: x - halfWidth, right: x + halfWidth, top: y - 10, bottom: y + 10 };
    });
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      assert.ok(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom, `Labels stay separate at orbital time ${time}`);
    }
  }
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1068, height: 839 }, reducedMotion: "no-preference" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && /hydrated|hydration|didn't match|THREE|shader|WebGL/i.test(message.text())) errors.push(message.text()); });
  try {
    assert.equal((await page.goto(process.argv[3] || "http://localhost:3000", { timeout: 60000 })).status(), 200);
    await page.locator(".portfolio-loader").waitFor({ state: "detached" });
    await page.locator(".journey-fallback").waitFor({ state: "detached" });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator(".planet-target").count(), 8);
    assert.deepEqual(await page.locator(".planet-target span").allTextContents(), planets.map((planet) => planet.step));
    for (const label of await page.locator(".planet-target span").all()) assert.ok(await label.isVisible(), "Every workflow label is visible without hover");
    assert.equal(await page.locator("#solar-planet option").count(), 8);
    assert.equal(await page.locator("#solar-planet").inputValue(), "2");
    const neptune = page.getByRole("button", { name: "Explore Communicate", exact: true });
    const before = await neptune.evaluate((element) => element.style.left + element.style.top);
    await page.waitForFunction(({ element, before }) => element.style.left + element.style.top !== before, { element: await neptune.elementHandle(), before });
    await page.getByRole("button", { name: "Explore Visualize", exact: true }).focus();
    assert.equal(await page.locator("#solar-planet").inputValue(), "5");
    assert.ok((await page.locator(".planet-card:not([hidden])").innerText()).includes("Power BI dashboards"));
    const held = await neptune.evaluate((element) => element.style.left + element.style.top);
    await page.waitForTimeout(250);
    assert.equal(await neptune.evaluate((element) => element.style.left + element.style.top), held, "Focus holds planets for stable exploration");
    await page.getByRole("button", { name: "Close Visualize card" }).click();
    await page.locator("#solar-planet").selectOption("7");
    assert.equal(await neptune.getAttribute("aria-pressed"), "true");
    assert.ok((await page.locator(".planet-card:not([hidden])").innerText()).includes("300 active cases"));
    await page.getByRole("button", { name: "Explore Connect", exact: true }).focus();
    assert.equal(await page.locator("#solar-planet").inputValue(), "2");
    await page.screenshot({ path: resolve(output, "desktop.png") });
    await page.mouse.move(0, 0);
    await page.locator(".hero-primary").focus();
    for (const [width, height] of [[651, 851], [390, 844], [360, 640]]) {
      if (await page.locator(".planet-card:not([hidden])").count()) await page.getByRole("button", { name: /^Close .* card$/ }).click();
      await page.setViewportSize({ width, height });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForFunction(() => getComputedStyle(document.querySelector(".hero-copy")).transform === "none");
      await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.locator("#solar-planet").selectOption("4");
      assert.ok((await page.locator("#solar-planet option:checked").innerText()).includes("Analyze"));
      assert.ok((await page.locator(".planet-card:not([hidden])").innerText()).includes("500+ weekly data points"));
      await page.getByRole("button", { name: "Close Analyze card" }).click();
      await page.locator("#solar-planet").focus();
      const bounds = await page.evaluate(() => {
        const hero = document.querySelector(".hero-copy").getBoundingClientRect();
        const panel = document.querySelector(".solar-explorer").getBoundingClientRect();
        const pause = document.querySelector(".journey-motion").getBoundingClientRect();
        return { heroBottom: hero.bottom, panelTop: panel.top, panelBottom: panel.bottom, pauseTop: pause.top, height: innerHeight };
      });
      assert.ok(bounds.heroBottom < bounds.panelTop, "Explorer does not cover hero text");
      assert.ok(bounds.panelBottom <= bounds.pauseTop + 2, `Explorer and pause stay separate at ${width}`);
      const labels = await page.locator(".planet-target span").evaluateAll((elements) => elements.map((element) => {
        const box = element.getBoundingClientRect(); return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, text: element.textContent };
      }));
      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        assert.ok(label.left >= 0 && label.right <= width, `${label.text} stays inside the screen`);
        assert.ok(label.top > bounds.heroBottom && label.bottom < bounds.panelTop, `${label.text} stays clear of text and controls at ${width}`);
        for (let j = i + 1; j < labels.length; j++) {
          const other = labels[j];
          assert.ok(label.right <= other.left || label.left >= other.right || label.bottom <= other.top || label.top >= other.bottom,
            `${label.text} does not overlap ${other.text} at ${width}: ${JSON.stringify([label, other])}`);
        }
      }
      await page.screenshot({ path: resolve(output, `${width}.png`) });
    }
    await page.evaluate(() => {
      const track = document.querySelector(".particle-track"); const stage = document.querySelector(".particle-stage");
      window.scrollTo({ top: track.offsetTop + (track.offsetHeight - stage.clientHeight) * .96, behavior: "instant" });
    });
    await page.waitForFunction(() => document.querySelector(".solar-interaction").inert && document.querySelector(".particle-stage").dataset.chapter === "technologies");
    assert.equal(await page.locator(".solar-interaction").getAttribute("aria-hidden"), "true");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForFunction(() => !document.querySelector(".solar-interaction").inert);
    const still = await neptune.evaluate((element) => element.style.left + element.style.top);
    await page.waitForTimeout(250);
    assert.equal(await neptune.evaluate((element) => element.style.left + element.style.top), still);
    await page.locator("#solar-planet").selectOption("6");
    assert.equal(await page.getByRole("button", { name: "Explore Validate", exact: true }).getAttribute("aria-pressed"), "true");
    const fallback = await browser.newPage({ viewport: { width: 651, height: 851 } });
    fallback.on("pageerror", (error) => errors.push(error.message));
    fallback.on("console", (message) => { if (message.type() === "error" && /hydrated|hydration|didn't match/i.test(message.text())) errors.push(message.text()); });
    await fallback.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
    await fallback.goto(process.argv[3] || "http://localhost:3000");
    await fallback.locator(".portfolio-loader").waitFor({ state: "detached" });
    await fallback.locator(".journey-fallback").waitFor();
    await fallback.waitForFunction(() => document.querySelector(".particle-stage").style.getPropertyValue("--identity-opacity") !== "");
    await fallback.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
    assert.equal(await fallback.locator(".fallback-constellation circle").count(), 9, "Fallback contains Sun and eight planets");
    assert.equal(await fallback.locator('.fallback-constellation ellipse[stroke-dasharray]').count(), 9, "Fallback also uses dotted tilted orbits and Saturn rings");
    await fallback.locator("#solar-planet").selectOption("1");
    assert.ok((await fallback.locator(".planet-card:not([hidden])").innerText()).includes("REST API"));
    const positions = await fallback.evaluate(() => {
      const earth = document.querySelectorAll(".fallback-constellation circle")[3].getBoundingClientRect();
      const target = document.querySelectorAll(".planet-target")[2].getBoundingClientRect();
      return { x: Math.abs(earth.left + earth.width / 2 - target.left - target.width / 2), y: Math.abs(earth.top + earth.height / 2 - target.top - target.height / 2) };
    });
    assert.ok(positions.x < 2 && positions.y < 2, "Fallback planets align with accessible hit targets");
    await fallback.screenshot({ path: resolve(output, "fallback.png") });
    assert.deepEqual(errors, []);
    console.log("Solar system passed: eight planets/workflow mappings, finite geometry, orbit motion, focus hold, hover/select, mobile controls, Earth transition, reduced motion, SVG fallback.");
    console.log(`Screenshots: ${output}`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
