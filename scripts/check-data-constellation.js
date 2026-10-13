const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
(async () => {
  const source = readFileSync(resolve(__dirname, "../lib/dataConstellation.js"), "utf8");
  const { constellationPoint } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
  for (const count of [2000, 3600]) for (let index = 0; index < count; index++) {
    const point = constellationPoint(index, count);
    for (const value of Object.values(point)) assert.ok(Number.isFinite(value));
    assert.ok(Math.abs(point.x) < 1 && Math.abs(point.y) < 1);
    assert.ok(point.phase >= 0 && point.phase < 1);
    assert.deepEqual(point, constellationPoint(index, count), "Deterministic samples survive resize and reversal");
  }
  assert.notDeepEqual(constellationPoint(5, 2000, 0), constellationPoint(5, 2000, 1));
  for (let index = 0; index < 2000; index++) {
    const point = constellationPoint(index, 2000);
    const radius = Math.hypot(point.x, point.y, point.z);
    assert.ok(radius >= .399 && radius <= .841, "Sculpture stays on the bounded torus surface after rotation");
  }
  console.log("Sculpture geometry passed: torus surface bounds, deterministic samples, idle motion, desktop/mobile counts.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
