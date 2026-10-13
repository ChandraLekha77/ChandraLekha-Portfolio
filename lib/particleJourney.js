function cubic(a, b, c, d, t) {
  const v = 1 - t;
  return v * v * v * a + 3 * v * v * t * b + 3 * v * t * t * c + t * t * t * d;
}

export function cableHousingPoint(t, lane, mobile = false) {
  const highlight = Math.sqrt(Math.max(0, 1 - lane * lane));
  return {
    x: cubic(1.045, 0.98, mobile ? 0.99 : 0.91, mobile ? 0.965 : 0.84, t) + lane * (mobile ? 0.018 : 0.015),
    y: cubic(-0.045, 0.005, 0.075, 0.14, t) + lane * (mobile ? 0.005 : 0.024),
    depth: highlight
  };
}

export function fiberPoint(strand, t, strandCount = 36, braid = 0, mobile = false) {
  t = Math.min(1, Math.max(0, t));
  const groupSize = strandCount / 3;
  const group = Math.floor(strand / groupSize);
  const lane = (strand % groupSize) / Math.max(1, groupSize - 1) - 0.5;
  const angle = group * Math.PI * 2 / 3 + t * Math.PI * (0.7 + braid * 5.5) + braid * Math.PI * 1.5;
  const spread = 0.007 + smoothstep(0, 0.18, t) * (0.012 + braid * 0.018);
  const envelope = Math.sin(t * Math.PI) * 0.009;
  const x = mobile
    ? 0.965 - smoothstep(0.35, 1, t) * 0.46
    : cubic(0.84, 0.49, 1.02, 0.65, t);
  return {
    x: x + Math.sin(angle) * (spread + envelope) * (mobile ? 0.55 : 1) + lane * 0.025,
    y: cubic(0.14, 0.31, 0.58, 0.86, t) + Math.cos(angle) * spread * 0.3 + lane * 0.006,
    depth: (Math.cos(angle) + 1) / 2
  };
}

export function fiberJourneyPoint(strand, t, strandCount, progress, mobile = false) {
  const phase = journeyPhase(progress);
  const source = fiberPoint(strand, t, strandCount, phase.braid, mobile);
  const angle = Math.floor(strand / (strandCount / 3)) * Math.PI * 2 / 3 + t * Math.PI * 6 + phase.braid * Math.PI * 1.5;
  const lane = (strand % (strandCount / 3)) / Math.max(1, strandCount / 3 - 1) - 0.5;
  const bridgeX = cubic(mobile ? 0.965 : 0.84, 0.78, 0.4, mobile ? 0.36 : 0.28, t) + Math.sin(angle) * 0.045 + lane * 0.014;
  const bridgeY = cubic(0.18, 0.65, 0.82, mobile ? 0.72 : 0.55, t) + Math.cos(angle) * 0.014;
  return {
    x: source.x + (bridgeX - source.x) * phase.travel,
    y: source.y + (bridgeY - source.y) * phase.travel,
    depth: source.depth,
    merge: smoothstep(0.5 + (1 - t) * 0.14, 0.84 + (1 - t) * 0.1, progress)
  };
}

// Deliberately simplified continental outlines for a decorative Earth globe.
export const CONTINENTS = [
  [[-168,70],[-140,71],[-122,58],[-110,54],[-96,51],[-80,55],[-61,48],[-76,30],[-83,25],[-88,16],[-98,18],[-115,30],[-128,49],[-149,58]],
  [[-74,12],[-50,2],[-35,-8],[-43,-24],[-53,-35],[-68,-55],[-76,-38],[-81,-5]],
  [[-17,36],[10,37],[34,30],[44,12],[51,10],[41,-14],[31,-34],[18,-35],[10,-17],[0,2],[-16,15]],
  [[-10,36],[-10,58],[8,71],[32,69],[48,55],[31,42],[14,37]],
  [[30,70],[72,76],[130,69],[179,65],[156,48],[137,37],[122,23],[106,9],[100,0],[87,21],[77,8],[67,24],[44,30],[32,42]],
  [[112,-11],[132,-12],[153,-23],[150,-38],[132,-36],[115,-23]],
  [[-53,60],[-20,70],[-26,83],[-56,82]],
  [[45,-13],[50,-16],[47,-25],[43,-23]],
  [[130,31],[143,44],[146,43],[140,34]],
  [[95,5],[119,-5],[131,-8],[117,-10],[101,-5]]
];

export function insidePolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function isLand(longitude, latitude) {
  return CONTINENTS.some((polygon) => insidePolygon(longitude, latitude, polygon));
}

export function smoothstep(start, end, value) {
  const t = Math.min(1, Math.max(0, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

export function journeyPhase(progress) {
  return { braid: smoothstep(0.05, 0.36, progress), travel: smoothstep(0.25, 0.68, progress), globe: smoothstep(0.5, 0.94, progress) };
}

export function spherePoint(longitude, latitude) {
  const lon = longitude * Math.PI / 180;
  const lat = latitude * Math.PI / 180;
  return { x: Math.cos(lat) * Math.sin(lon), y: -Math.sin(lat), z: Math.cos(lat) * Math.cos(lon) };
}
