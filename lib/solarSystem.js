// Artistic proportions and orbital speeds, not an astronomical simulation.
export const planets = [
  { name: "Mercury", step: "Ask", detail: "Start with the business question.", example: "At ViHawk: defined KPIs and validation rules with stakeholders.", orbit: .22, size: .021, angle: -.8, speed: .1, color: [133, 128, 116] },
  { name: "Venus", step: "Collect", detail: "Gather data from every source.", example: "At Holiday Channel: pulled REST API data into S3 with Lambda and Glue.", orbit: .31, size: .032, angle: 2.3, speed: .075, color: [190, 151, 91] },
  { name: "Earth", step: "Connect", detail: "Bring the data sources together.", example: "At Cook County: combined data from multiple systems with Azure Data Factory and SSIS.", orbit: .41, size: .037, angle: .35, speed: .055, color: [58, 117, 153] },
  { name: "Mars", step: "Clean", detail: "Fix messy and missing data.", example: "At Cook County: cleaned and normalized 2,500+ incident records.", orbit: .5, size: .028, angle: 3.8, speed: .043, color: [176, 94, 67] },
  { name: "Jupiter", step: "Analyze", detail: "Find what the data is saying.", example: "At Cook County: found crime trends and hotspots from 500+ weekly data points.", orbit: .6, size: .07, angle: 1.3, speed: .031, color: [181, 139, 108] },
  { name: "Saturn", step: "Visualize", detail: "Turn findings into clear dashboards.", example: "At Holiday Channel: built Power BI dashboards with consistent KPI logic.", orbit: .71, size: .055, angle: 5.4, speed: .023, color: [178, 156, 105] },
  { name: "Uranus", step: "Validate", detail: "Make sure the numbers match before anyone uses them.", example: "At Holiday Channel: reconciled S3 and Athena data to fix reporting gaps.", orbit: .81, size: .045, angle: 2.6, speed: .018, color: [97, 162, 169] },
  { name: "Neptune", step: "Communicate", detail: "Make it easy to use.", example: "At Cook County: shared weekly KPI reports for 300 active cases.", orbit: .93, size: .043, angle: 6, speed: .014, color: [66, 103, 160] }
];

export const orbitTilt = -.48;

export function solarLayout(width, height) {
  const mobile = width < 760;
  const x = mobile ? width * .5 : width * .5 + 180;
  return {
    x, y: height * (mobile ? (height <= 700 ? .68 : width >= 500 ? .675 : .64) : .46),
    radius: mobile ? Math.min(width * .46, height * (height <= 700 ? .19 : .23)) : Math.min(width * .255, height * .42, (width * .87 - x) / .91)
  };
}

export function planetPosition(index, time = 0) {
  const planet = planets[index];
  const angle = planet.angle + time * planet.speed;
  const x = Math.cos(angle) * planet.orbit;
  const y = Math.sin(angle) * planet.orbit * .6;
  return {
    x: x * Math.cos(orbitTilt) - y * Math.sin(orbitTilt),
    y: x * Math.sin(orbitTilt) + y * Math.cos(orbitTilt), z: Math.sin(angle) * .15
  };
}

// Keep workflow labels clear of one another and of the dotted planet surfaces.
export function solarLabels(width, height, time = 0) {
  const layout = solarLayout(width, height);
  const bodies = planets.map((planet, index) => {
    const position = planetPosition(index, time);
    return { x: layout.x + position.x * layout.radius, y: layout.y + position.y * layout.radius, radius: planet.size * layout.radius };
  });
  const occupied = [...bodies, { x: layout.x, y: layout.y, radius: .105 * layout.radius }].map((body) => ({
    left: body.x - body.radius - 3, right: body.x + body.radius + 3, top: body.y - body.radius - 3, bottom: body.y + body.radius + 3
  }));
  return bodies.map((body, index) => {
    const labelWidth = planets[index].step.length * (width < 760 ? 6.3 : 7) + 10;
    const candidates = [];
    const preferred = index % 2 ? -1 : 1;
    const directions = [[0, preferred], [0, -preferred], [1, 0], [-1, 0], [1, -1], [-1, -1], [1, 1], [-1, 1]];
    for (const gap of [10, 22, 34, 46, 58, 70, 82, 94, 106]) for (const [horizontal, vertical] of directions) {
      const x = Math.max(12 + labelWidth / 2, Math.min(width * (width < 760 ? 1 : .865) - 12 - labelWidth / 2,
        body.x + horizontal * (body.radius + labelWidth / 2 + gap)));
      const labelBottom = width < 760 ? height - (height <= 700 ? 75.2 : 88) - 44 - 14 : layout.y + layout.radius * .7 + 14;
      const y = Math.max(layout.y - layout.radius * .7 + 10, Math.min(labelBottom,
        body.y + vertical * (body.radius + gap + 10)));
      const box = { left: x - labelWidth / 2, right: x + labelWidth / 2, top: y - 10, bottom: y + 10 };
      const overlap = occupied.reduce((sum, other) => sum + Math.max(0, Math.min(box.right + 3, other.right) - Math.max(box.left - 3, other.left)) *
        Math.max(0, Math.min(box.bottom + 3, other.bottom) - Math.max(box.top - 3, other.top)) * (other.label ? 10000 : 1), 0);
      candidates.push({ ...box, x, y, overlap });
    }
    const best = candidates.reduce((best, candidate) => candidate.overlap < best.overlap ? candidate : best);
    occupied.push({ ...best, label: true });
    return { x: best.x - body.x, y: best.y - body.y };
  });
}

export function solarPoint(index, count, time = 0) {
  const body = index % 9;
  const local = Math.floor(index / 9);
  const samples = Math.ceil(count / 9);
  const y = 1 - (local + .5) / samples * 2;
  const radius = Math.sqrt(Math.max(0, 1 - y * y));
  const angle = local * 2.399963229728653 + time * .07;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const planet = body ? planets[body - 1] : null;
  const center = body ? planetPosition(body - 1, time) : { x: 0, y: 0, z: 0 };
  const size = planet ? planet.size : .105;
  let color = planet ? planet.color : [237, 164, 58];
  if (body === 3 && Math.sin(x * 8 + y * 11) > .3) color = [92, 131, 95];
  if (body === 5) color = Math.sin(y * 32 + x * 3) > .15 ? [205, 173, 139] : [149, 106, 78];
  if (body === 6) color = Math.sin(y * 28) > 0 ? [194, 172, 115] : [154, 136, 91];
  const lightLength = Math.hypot(center.x, center.y, .45);
  const diffuse = Math.max(0, (-x * center.x - y * center.y + z * .45) / lightLength);
  const shade = body ? .23 + diffuse * .77 : .83 + Math.sin(local * 1.2) * .13;
  return {
    x: center.x + x * size, y: center.y + y * size, z: center.z + z * size,
    color: color.map((channel) => Math.round(channel * shade)), alpha: z >= 0 ? .98 : .025, sun: !body, phase: index / count
  };
}
