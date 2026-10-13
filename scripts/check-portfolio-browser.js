const assert = require("node:assert/strict");
const { mkdirSync } = require("node:fs");
const { resolve } = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");
const url = process.argv[3] || "http://localhost:3001";
const output = resolve(__dirname, "../screenshots/portfolio");
mkdirSync(output, { recursive: true });

async function check() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultNavigationTimeout(60000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && /hydration|didn't match|THREE|shader|WebGL/i.test(message.text())) errors.push(message.text()); });
  try {
    assert.equal((await page.goto(url)).status(), 200);
    await page.locator(".portfolio-loader").waitFor({ state: "detached" });
    await page.locator(".thinking-node").first().waitFor();
    assert.equal(await page.locator(".skip-link").evaluate((link) => getComputedStyle(link).clipPath), "inset(50%)", "Skip link is visually hidden until focused");
    const text = await page.locator("main").textContent();
    for (const stale of ["11M", "$150M", "32%", "100% UAT", "Andhra University", "Lead Data Analyst", "Records / Day"]) assert.ok(!text.includes(stale), `Removed unsupported claim: ${stale}`);
    assert.equal(await page.locator(".project-chapter").count(), 2);
    assert.equal(await page.locator(".experience-entry").count(), 3);
    assert.equal(await page.locator(".skill-row").count(), 2);
    assert.ok((await page.locator("#technology-details").innerText()).includes("Pandas"));
    assert.ok((await page.locator("#technology-details").innerText()).includes("VLOOKUP"));
    for (const fact of ["Millions", "50", "30%", "Jun 2025 – May 2026", "Operations Reporting Analyst", "4.0", "Open to relocation", "VLOOKUP"]) assert.ok(text.includes(fact), `Resume fact displayed: ${fact}`);
    assert.equal(await page.locator('a[href*="github.com"]').count(), 1, "Verified GitHub link present");
    assert.equal(await page.locator('a[href*="github.com"]').getAttribute("href"), "https://github.com/ChandraLekha77");
    for (const href of await page.locator('a[href^="#"], a[href^="/#"]').evaluateAll((links) => links.map((link) => link.getAttribute("href").split("#")[1]))) assert.equal(await page.locator(`[id="${href}"]`).count(), 1, `Anchor resolves: ${href}`);

    const nodes = page.locator(".thinking-node");
    await nodes.nth(2).scrollIntoViewIfNeeded();
    await nodes.first().focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await nodes.nth(1).getAttribute("aria-pressed"), "true");
    assert.equal(await page.locator('.thinking-edge[data-connected="true"]').count(), 2);
    await page.keyboard.press("End");
    assert.equal(await nodes.last().getAttribute("aria-pressed"), "true");
    assert.equal(await page.getByRole("button", { name: "Next process step" }).isDisabled(), true);
    await page.keyboard.press("Home");
    assert.equal(await nodes.first().getAttribute("aria-pressed"), "true");
    await nodes.nth(3).hover();
    assert.equal(await nodes.nth(3).getAttribute("aria-pressed"), "true");
    await page.getByRole("button", { name: "PLAY THE PROCESS" }).click();
    await page.waitForFunction(() => document.querySelectorAll(".thinking-node")[1].getAttribute("aria-pressed") === "true", null, { timeout: 10000 });
    assert.equal(await nodes.nth(1).getAttribute("aria-pressed"), "true", "Playback advances");
    await page.getByRole("button", { name: "PAUSE FLOW" }).click();
    await page.waitForTimeout(2400);
    assert.equal(await nodes.nth(1).getAttribute("aria-pressed"), "true", "Pause holds the selected step");
    await nodes.nth(2).click();
    const sectionCapture = (id, name) => page.locator(`#${id}`).screenshot({ path: resolve(output, name), style: ".nav-system, .skip-link, nextjs-portal { visibility: hidden !important; }" });
    await sectionCapture("thinking-transition", "desktop-thinking.png");
    await page.getByRole("button", { name: "02 Sales performance" }).click();
    assert.ok((await page.locator("#report-description").innerText()).includes("sales performance"));
    assert.equal(await page.locator(".report-path.is-active").count(), 1);
    await sectionCapture("labelmaster", "desktop-labelmaster.png");
    await page.getByRole("button", { name: "Text input", exact: true }).click();
    assert.ok((await page.locator(".voice-route").innerText()).includes("Text interaction"));
    assert.ok(!(await page.locator(".voice-route").innerText()).includes("Whisper"));
    await page.getByRole("button", { name: "Voice input", exact: true }).click();
    assert.ok((await page.locator(".voice-route").innerText()).includes("OpenAI Whisper"));
    await sectionCapture("calmpanion", "desktop-calmpanion.png");
    await page.locator(".experience-entry details").nth(1).locator("summary").click();
    assert.ok((await page.locator(".experience-entry details").nth(1).innerText()).includes("200+ State ID"));
    await page.locator(".experience-entry details").nth(1).locator("summary").click();
    await sectionCapture("about", "desktop-about.png");
    await sectionCapture("contact", "desktop-contact.png");
    assert.equal(await page.locator(".contact-email").getAttribute("href"), "mailto:chandralekhaganta7@gmail.com");
    assert.equal(await page.locator('a[href^="tel:"]').getAttribute("href"), "tel:+19362061480");

    for (const width of [768, 390, 360]) {
      await page.setViewportSize({ width, height: 844 });
      for (const section of ["technology-details", "thinking-transition", "labelmaster", "calmpanion", "about", "contact"]) {
        await page.locator(`#${section}`).scrollIntoViewIfNeeded();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No overflow at ${width}: ${section}`);
        if (width === 390) await sectionCapture(section, `mobile-${section}.png`);
      }
    }
    await page.getByRole("button", { name: "Open chapter index" }).click();
    assert.equal(await page.locator("#main-content").evaluate((main) => main.inert), true);
    await page.keyboard.press("Shift+Tab");
    assert.equal(await page.getByRole("button", { name: "Close chapter index" }).evaluate((button) => button === document.activeElement), true);
    await page.keyboard.press("Shift+Tab");
    assert.equal(await page.locator(".mobile-index a").last().evaluate((link) => link === document.activeElement), true, "Mobile focus wraps within the chapter index");
    await page.locator(".mobile-index").getByRole("link", { name: "06 Contact" }).click();
    await page.waitForTimeout(800);
    assert.equal(await page.locator(".mobile-index").count(), 0);
    assert.equal(await page.locator("#main-content").evaluate((main) => main.inert), false);
    assert.ok(await page.locator("#contact").evaluate((section) => Math.abs(section.getBoundingClientRect().top) < 140));
    await page.getByRole("button", { name: "Open chapter index" }).click();
    await page.keyboard.press("Escape");
    assert.equal(await page.locator(".mobile-index").count(), 0, "Escape closes the chapter index");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator("#thinking-transition").scrollIntoViewIfNeeded();
    assert.equal(await page.getByRole("button", { name: "MANUAL EXPLORATION" }).isDisabled(), true);
    await nodes.nth(1).click();
    assert.equal(await nodes.nth(1).getAttribute("aria-pressed"), "true", "Manual process exploration remains available");
    await page.getByRole("button", { name: "Next process step" }).click();
    assert.equal(await nodes.nth(2).getAttribute("aria-pressed"), "true");
    await page.evaluate(() => window.scrollTo({ top: document.querySelector("#thinking-transition").offsetTop - 80, behavior: "instant" }));
    await page.screenshot({ path: resolve(output, "mobile-thinking-viewport.png") });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.waitForTimeout(350);
    await page.evaluate(() => window.scrollTo({ top: document.querySelector("#thinking-transition").offsetTop - 80, behavior: "instant" }));
    await page.waitForTimeout(150);
    await page.screenshot({ path: resolve(output, "desktop-thinking-viewport.png") });
    await page.locator("#technology-details").scrollIntoViewIfNeeded();
    assert.ok(await page.locator("#technology-details .details-heading").evaluate((header) => header.getBoundingClientRect().right < document.querySelector(".chapter-rail").getBoundingClientRect().left), "The toolkit heading stays clear of the fixed chapter rail");
    for (const [path, heading] of [["privacy", "Privacy Policy"], ["terms", "Terms of Use"]]) {
      assert.equal((await page.goto(`${url}/${path}`)).status(), 200);
      assert.equal(await page.getByRole("heading", { name: heading, exact: true }).count(), 1);
    }
    assert.deepEqual(errors, [], "No browser runtime errors");
    console.log("Portfolio checks passed: resume facts, 2 projects, 3 roles, anchors, keyboard/hover flow, playback/pause, project controls, mobile, reduced motion, contact links.");
    console.log(`Screenshots: ${output}`);
  } finally { await browser.close(); }
}
check().catch((error) => { console.error(error); process.exitCode = 1; });
