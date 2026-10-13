const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");

async function check() {
  const source = readFileSync(resolve(__dirname, "../lib/particleJourney.js"), "utf8");
  const { cableHousingPoint, fiberPoint, fiberJourneyPoint, journeyPhase, spherePoint, isLand, insidePolygon } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
  for (let strand = 0; strand < 48; strand++) {
    let previousY = -Infinity;
    for (let step = 0; step <= 100; step++) {
      const point = fiberPoint(strand, step / 100);
      assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
      assert.ok(point.depth >= 0 && point.depth <= 1, "Strands keep a valid depth for light and shade");
      assert.ok(point.y >= previousY, "Data follows each fiber downward");
      assert.ok(point.x >= 0 && point.x <= 1.05 && point.y >= 0 && point.y <= 1);
      previousY = point.y;
    }
    const before = fiberPoint(strand, 0.65 - 1e-6);
    const after = fiberPoint(strand, 0.65 + 1e-6);
    assert.ok(Math.hypot(before.x - after.x, before.y - after.y) < 1e-5, "Fibers cannot jump at the jacket opening");
  }
  assert.ok(cableHousingPoint(0, 0).x > 1 && cableHousingPoint(0, 0).y < 0, "The black cable enters from the top-right corner");
  assert.ok(fiberPoint(0, 0).x > 0.8 && fiberPoint(0, 0).y < 0.2, "The glowing fibres begin inside the cable mouth");
  assert.notEqual(fiberPoint(0, 0.4, 36, 0).x, fiberPoint(0, 0.4, 36, 1).x, "Scrolling changes the braid, not just its opacity");
  for (const mobile of [false, true]) {
    for (let step = 0; step <= 100; step++) {
      const progress = step / 100;
      for (let strand = 0; strand < 36; strand++) {
        const point = fiberJourneyPoint(strand, 0.75, 36, progress, mobile);
        assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
        assert.ok(point.merge >= 0 && point.merge <= 1);
        assert.deepEqual(point, fiberJourneyPoint(strand, 0.75, 36, progress, mobile), "The connected strand path must be reversible");
      }
    }
  }
  assert.ok(fiberJourneyPoint(0, 1, 36, 0.6).x < fiberPoint(0, 1).x, "Strands flow left toward the globe");
  assert.equal(fiberJourneyPoint(0, 0, 36, 1).merge, 1);
  assert.equal(fiberJourneyPoint(0, 1, 36, 1).merge, 1);
  assert.deepEqual(journeyPhase(0), { braid: 0, travel: 0, globe: 0 });
  assert.deepEqual(journeyPhase(1), { braid: 1, travel: 1, globe: 1 });
  let previous = journeyPhase(0);
  for (let step = 1; step <= 100; step++) {
    const current = journeyPhase(step / 100);
    assert.ok(current.braid >= previous.braid && current.travel >= previous.travel && current.globe >= previous.globe);
    assert.ok(current.braid <= 1 && current.travel <= 1 && current.globe <= 1);
    assert.deepEqual(current, journeyPhase(step / 100), "Scroll reversal must retrace the same shape");
    previous = current;
  }
  for (const longitude of [-180, -90, 0, 90, 180]) {
    for (const latitude of [-90, -45, 0, 45, 90]) {
      const { x, y, z } = spherePoint(longitude, latitude);
      assert.ok(Math.abs(x * x + y * y + z * z - 1) < 1e-12);
    }
  }
  assert.equal(isLand(20, 0), true, "Africa must appear on the globe");
  assert.equal(isLand(-140, 0), false, "Pacific ocean must be lighter");
  assert.equal(insidePolygon(1, 1, [[0, 0], [2, 0], [2, 2], [0, 2]]), true);
  assert.equal(insidePolygon(3, 1, [[0, 0], [2, 0], [2, 2], [0, 2]]), false);
  console.log("Particle journey checks passed: fiber geometry, downward paths, phases, reversal, sphere geometry, land mask.");
}

check().catch((error) => { console.error(error); process.exitCode = 1; });
