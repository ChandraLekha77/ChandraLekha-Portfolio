const assert = require("node:assert/strict");
const { readFileSync, mkdirSync } = require("node:fs");
const { createHash } = require("node:crypto");
const { resolve } = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");

(async () => {
  const root = resolve(__dirname, "..");
  const output = resolve(root, "screenshots/resume-updates");
  mkdirSync(output, { recursive: true });
  const { planets } = await import(`data:text/javascript;base64,${readFileSync(resolve(root, "lib/solarSystem.js")).toString("base64")}`);
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    const url = process.argv[3] || "http://localhost:3000";
    assert.equal((await page.goto(url, { timeout: 60000 })).status(), 200);
    await page.locator(".portfolio-loader").waitFor({ state: "detached" });
    await page.locator(".journey-fallback").waitFor({ state: "detached" });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator(".identity-detail small").innerText(), "Data Analyst");
    assert.match(await page.locator(".hero-copy .role").innerText(), /^Data Analyst/);
    assert.equal(await page.locator(".planet-card").count(), 8);
    assert.deepEqual(await page.locator("#solar-planet option").allTextContents(), planets.map((planet) => planet.step));
    for (const planet of planets) assert.ok(!(await page.locator(".solar-interaction").innerText()).includes(planet.name), "No visible planet names");

    const response = await page.request.get(`${url}/resume/Chandra-Lekha-Ganta-Resume.pdf`);
    assert.equal(response.status(), 200);
    assert.match(response.headers()["content-type"], /application\/pdf/);
    const downloaded = await response.body();
    assert.equal(downloaded.subarray(0, 5).toString(), "%PDF-");
    const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
    assert.equal(hash(downloaded), hash(readFileSync("C:/Users/VSC/Downloads/CHANDRA_LEKHA_GANTA.pdf")), "Download preserves the supplied original PDF");
    const downloadEvent = page.waitForEvent("download");
    await page.getByRole("link", { name: "Resume", exact: true }).click();
    assert.equal((await downloadEvent).suggestedFilename(), "Chandra-Lekha-Ganta-Resume.pdf");
    await page.getByRole("button", { name: "Explore Ask", exact: true }).hover();
    await page.locator("#workflow-card-0").waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Close Ask card" }).click();

    for (const [width, height] of [[1440, 900], [1068, 839], [651, 851], [390, 844], [360, 640], [320, 844]]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
      const download = await page.locator(".resume-download").boundingBox();
      assert.ok(download.width >= 44 && download.height >= 44 && download.x >= 0 && download.x + download.width <= width, "Resume button has a visible touch target");
      const index = await page.locator(".mobile-index-toggle").boundingBox();
      if (index) assert.ok(download.x + download.width + 5 < index.x, "Header buttons remain separate");
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal overflow at ${width}`);
      assert.ok(await page.locator(".journey-caption").evaluate((element) => parseFloat(getComputedStyle(element).fontSize) >= 10.4));
      for (let i = 0; i < planets.length; i++) {
        await page.locator(".hero-primary").focus();
        await page.getByRole("button", { name: `Explore ${planets[i].step}`, exact: true }).focus();
        const card = page.locator(`#workflow-card-${i}`);
        await card.waitFor({ state: "visible" });
        assert.equal(await page.locator(".planet-card:not([hidden])").count(), 1);
        assert.equal(await card.locator("h3").innerText(), planets[i].step);
        assert.equal(await card.locator("p").first().innerText(), planets[i].detail);
        assert.equal(await card.locator(".work-example").innerText(), planets[i].example);
        const box = await card.boundingBox();
        const hero = await page.locator(".hero-copy").boundingBox();
        assert.ok(box.x >= 0 && box.x + box.width <= width && box.y >= 65 && box.y + box.height < height - 35,
          `Complete ${planets[i].step} card stays on screen at ${width}: ${JSON.stringify(box)}`);
        if (width < 760) assert.ok(box.y > hero.y + hero.height + 6, `Card does not cover hero text at ${width}`);
        else assert.ok(box.x > hero.x + hero.width, "Card stays out of desktop text column");
        if (i === 6) await page.screenshot({ path: resolve(output, `${width}-validate.png`) });
        await card.getByRole("button", { name: `Close ${planets[i].step} card` }).click();
        await card.waitFor({ state: "hidden" });
      }
      await page.getByRole("button", { name: "Explore Connect", exact: true }).focus();
      await page.keyboard.press("Escape");
      assert.equal(await page.locator(".planet-card:not([hidden])").count(), 0, "Escape closes the card");
      await page.locator("#solar-planet").selectOption("6");
      await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "Close Validate card");
      await page.keyboard.press("Escape");
      assert.equal(await page.getByRole("button", { name: "Explore Validate", exact: true }).evaluate((element) => element === document.activeElement), true);
      if (width < 760) {
        await page.getByRole("button", { name: "Explore Communicate", exact: true }).click();
        await page.locator("#workflow-card-7").waitFor({ state: "visible" });
        await page.getByRole("button", { name: "Close Communicate card" }).click();
        await page.getByRole("button", { name: "Open chapter index", exact: true }).click();
        assert.equal(await page.locator(".resume-download").isVisible(), false, "Download stays outside the mobile modal focus trap");
        await page.keyboard.press("Escape");
        assert.equal(await page.locator(".resume-download").isVisible(), true);
      }
    }
    await page.locator("#about").scrollIntoViewIfNeeded();
    assert.equal(await page.locator(".job-tenure").count(), 2);
    assert.match(await page.locator(".job-tenure").first().innerText(), /2026/);
    assert.match(await page.locator(".job-tenure").last().innerText(), /3½/);
    for (const [path, heading] of [["privacy", "Privacy Policy"], ["terms", "Terms of Use"]]) {
      const legal = await page.request.get(`${url}/${path}`);
      assert.equal(legal.status(), 200);
      assert.ok((await legal.text()).includes(heading), "Retained footer link resolves to a substantive legal page");
    }
    assert.deepEqual(errors, []);
    console.log("Resume updates passed: original PDF download, visible role, 8 exact workflow cards, focus/close/Escape, 6 responsive sizes, employment tenure, working legal pages, no runtime errors.");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
