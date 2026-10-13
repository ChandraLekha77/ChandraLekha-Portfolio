const assert = require("node:assert/strict");
const { mkdirSync } = require("node:fs");
const { resolve } = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");
const output = resolve(__dirname, "../screenshots/project-demos");
mkdirSync(output, { recursive: true });

async function check() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1068, height: 839 }, reducedMotion: "no-preference" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && /hydration|didn't match/i.test(message.text())) errors.push(message.text()); });
  const email = page.locator(".email-demo");
  const voice = page.locator(".voice-demo");
  const capture = (demo, name) => demo.screenshot({ path: resolve(output, name), style: ".nav-system, .skip-link, nextjs-portal { visibility: hidden !important; }" });
  const sample = (locator, property) => locator.evaluate((element, key) => getComputedStyle(element)[key], property);
  const changed = async (locator, property, value) => page.waitForFunction(({ element, key, before }) => getComputedStyle(element)[key] !== before,
    { element: await locator.elementHandle(), key: property, before: value }, { timeout: 10000 });
  const show = async (demo) => {
    await page.evaluate(() => document.fonts.ready);
    await demo.evaluate((element) => window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 85, behavior: "instant" }));
  };
  const expectRunning = (demo, running) => page.waitForFunction(({ selector, value }) => document.querySelector(selector).dataset.running === value,
    { selector: demo === email ? ".email-demo" : ".voice-demo", value: String(running) });
  try {
    assert.equal((await page.goto(process.argv[3] || "http://localhost:3001", { timeout: 60000 })).status(), 200);
    await page.locator(".portfolio-loader").waitFor({ state: "detached" });
    await page.bringToFront();
    // Development hydration applies the existing hero/marquee styles after navigation.
    // Wait for those layouts before positioning a downstream demo.
    await page.waitForFunction(() => getComputedStyle(document.querySelector(".skill-row")).overflowX === "hidden"
      && document.querySelector("#identity").getBoundingClientRect().height > innerHeight * 3.19);
    const palette = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const rgb = (token) => `rgb(${root.getPropertyValue(token).trim().slice(1).match(/../g).map((pair) => parseInt(pair, 16)).join(", ")})`;
      return { background: rgb("--bg"), text: rgb("--text"), accent: rgb("--accent"), line: rgb("--line") };
    });
    for (const demo of [email, voice]) {
      assert.equal(await sample(demo, "backgroundColor"), palette.background, "Both demos use the shared portfolio background");
      assert.equal(await sample(demo, "color"), palette.text, "Both demos use the shared portfolio text color");
      assert.equal(await sample(demo, "borderTopColor"), palette.line, "Panel borders use the shared palette");
    }
    assert.equal(await sample(email.locator(".flow-packet").first(), "stroke"), palette.accent);
    assert.equal(await sample(voice.locator(".signal-bar").first(), "stroke"), palette.accent, "Voice signal matches the shared portfolio accent");
    await show(email);
    await expectRunning(email, true);
    const packet = email.locator(".email-diagram-desktop .flow-packet").first();
    const first = await sample(packet, "strokeDashoffset");
    await changed(packet, "strokeDashoffset", first);
    assert.notEqual(await sample(packet, "strokeDashoffset"), first, "Email packets visibly advance along the paths");
    await email.getByRole("button", { name: "Pause email animation" }).focus();
    await page.keyboard.press("Space");
    await expectRunning(email, false);
    const paused = await sample(packet, "strokeDashoffset");
    await page.waitForTimeout(350);
    assert.equal(await sample(packet, "strokeDashoffset"), paused, "Keyboard pause freezes the packet");
    await email.getByRole("button", { name: "Resume email animation" }).click();
    await email.getByRole("button", { name: "02 Sales performance" }).click();
    assert.equal(await email.locator(".report-path.is-active").count(), 1);
    assert.ok((await email.locator(".report-path.is-active").textContent()).includes("SALES"));
    assert.ok((await page.locator("#report-description").innerText()).includes("sales performance"));
    assert.ok(await email.evaluate((element) => element.getBoundingClientRect().right < document.querySelector(".chapter-rail").getBoundingClientRect().left), "Demo clears the chapter rail at the user's viewport");
    await capture(email, "desktop-email.png");

    await show(voice);
    await expectRunning(voice, true);
    const bar = voice.locator(".signal-bar").nth(25);
    const wave = await sample(bar, "transform");
    await changed(bar, "transform", wave);
    assert.notEqual(await sample(bar, "transform"), wave, "Voice waveform actually animates");
    await voice.getByRole("button", { name: "Pause Calmpanion animation" }).click();
    const held = await sample(bar, "transform");
    assert.equal(await voice.locator(".voice-route li").first().evaluate((element) => getComputedStyle(element, "::before").animationPlayState), "paused", "Pause includes the process indicators");
    await page.waitForTimeout(350);
    assert.equal(await sample(bar, "transform"), held, "Pause freezes the waveform");
    await voice.getByRole("button", { name: "Resume Calmpanion animation" }).click();
    await capture(voice, "desktop-voice.png");
    await voice.getByRole("button", { name: "Text input", exact: true }).click();
    assert.equal(await voice.locator(".signal-bar").count(), 0, "Text mode is distinct from the voice waveform");
    assert.equal(await voice.locator(".text-token-line").count(), 3);
    assert.ok((await voice.locator(".voice-route").innerText()).includes("Text interaction"));
    const token = voice.locator(".text-token-line").first();
    const tokenOffset = await sample(token, "strokeDashoffset");
    await changed(token, "strokeDashoffset", tokenOffset);
    assert.notEqual(await sample(token, "strokeDashoffset"), tokenOffset, "Text tokens animate");
    await capture(voice, "desktop-text.png");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expectRunning(email, false);
    await expectRunning(voice, false);

    for (const width of [768, 720, 600, 390, 360, 320]) {
      await page.setViewportSize({ width, height: 844 });
      for (const demo of [email, voice]) {
        await show(demo);
        await expectRunning(demo, true);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No page overflow at ${width}`);
        assert.ok(await demo.evaluate((element) => element.scrollWidth <= element.clientWidth), `No demo content clipped at ${width}`);
      }
      if (width <= 760) {
        assert.equal(await email.locator(".email-diagram-desktop").isVisible(), false);
        assert.equal(await email.locator(".email-diagram-mobile").isVisible(), true);
        assert.equal(await email.locator(".mobile-report-path").count(), 1);
        await email.getByRole("button", { name: "03 YTD campaign revenue" }).click();
        assert.ok((await email.locator(".mobile-report-path").textContent()).includes("YTD REVENUE"));
        assert.ok(await email.locator(".email-diagram-mobile text").first().evaluate((element) => parseFloat(getComputedStyle(element).fontSize) * element.getScreenCTM().a >= 9), "Mobile SVG labels stay readable");
      }
      if ([390, 320].includes(width)) {
        await capture(email, `mobile-${width}-email.png`);
        await voice.getByRole("button", { name: "Voice input", exact: true }).click();
        await capture(voice, `mobile-${width}-voice.png`);
        await voice.getByRole("button", { name: "Text input", exact: true }).click();
        await capture(voice, `mobile-${width}-text.png`);
      }
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const demo of [email, voice]) {
      await show(demo);
      await expectRunning(demo, false);
      assert.equal(await demo.locator(".demo-motion-control").isDisabled(), true);
      assert.equal(await sample(demo.locator(".demo-animated").first(), "animationName"), "none", "Reduced motion removes decorative animation");
    }
    await email.getByRole("button", { name: "01 Email engagement" }).click();
    assert.ok((await page.locator("#report-description").innerText()).includes("engagement"));
    await voice.getByRole("button", { name: "Voice input", exact: true }).click();
    assert.ok((await voice.locator(".voice-route").innerText()).includes("OpenAI Whisper"));
    await capture(voice, "mobile-reduced-motion.png");
    assert.deepEqual(errors, [], "No runtime or hydration errors");
    console.log("Project demos passed: shared theme palette, packet/wave/text motion, keyboard pause/resume, topic/mode switching, offscreen pause, rail clearance, 768/720/600/390/360/320px layouts, reduced motion.");
    console.log(`Screenshots: ${output}`);
  } finally { await browser.close(); }
}
check().catch((error) => { console.error(error); process.exitCode = 1; });
