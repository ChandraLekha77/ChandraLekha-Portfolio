// A tilted toroidal sculpture, sharing its particles with the scroll-formed globe.
export function constellationPoint(index, count, time = 0) {
  const rows = 40;
  const columns = Math.ceil(count / rows);
  const u = (index % columns) / columns * Math.PI * 2 + time * .09;
  const v = Math.floor(index / columns) / rows * Math.PI * 2;
  const radius = .62 + .22 * Math.cos(v);
  const x = radius * Math.cos(u);
  const y = radius * Math.sin(u);
  const z = .22 * Math.sin(v);
  const tilt = .78 + Math.sin(time * .12) * .12;
  const tiltedY = y * Math.cos(tilt) - z * Math.sin(tilt);
  const tiltedZ = y * Math.sin(tilt) + z * Math.cos(tilt);
  const turn = -.45 + Math.sin(time * .08) * .16;
  return {
    x: x * Math.cos(turn) - tiltedY * Math.sin(turn),
    y: x * Math.sin(turn) + tiltedY * Math.cos(turn),
    z: tiltedZ,
    phase: index / count
  };
}
