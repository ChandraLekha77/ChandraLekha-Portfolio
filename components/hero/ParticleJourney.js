"use client";

import { useEffect, useRef, useState } from "react";
import { skillCategories } from "@/data/skills";
import { profile } from "@/data/profile";
import { experience } from "@/data/experience";
import { isLand, smoothstep, spherePoint } from "@/lib/particleJourney";
import { planets, planetPosition, solarPoint, solarLayout, solarLabels, orbitTilt } from "@/lib/solarSystem";
import Hero from "./Hero";

const globeLabels = ["Holiday Channel", "Audience analytics", "Cook County", "Public safety", "ViHawk", "Operational reporting", "Chicago", "Data quality", "Hyderabad", "Revenue analysis", "Cloud analytics", "KPI reporting"];

function positionSolarFallback(svg, width, height) {
  if (!svg || !width || !height) return;
  const { x, y, radius } = solarLayout(width, height);
  svg.setAttribute("x", String(x / width * 400 - radius / width * 440));
  svg.setAttribute("y", String(y / height * 600 - radius / height * 450));
  svg.setAttribute("width", String(radius / width * 880));
  svg.setAttribute("height", String(radius / height * 900));
}

export default function ParticleJourney() {
  const trackRef = useRef(null);
  const canvasRef = useRef(null);
  const labelsRef = useRef(null);
  const fallbackSolarRef = useRef(null);
  const stageRef = useRef(null);
  const [chapter, setChapter] = useState("identity");
  const [canvasReady, setCanvasReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const wakeRef = useRef(null);
  const [activePlanet, setActivePlanet] = useState(2);
  const [solarVisible, setSolarVisible] = useState(true);
  const activePlanetRef = useRef(2);
  const planetButtons = useRef([]);
  const planetCards = useRef([]);
  const [cardOpen, setCardOpen] = useState(false);
  const cardOpenRef = useRef(false);
  const exploringRef = useRef(false);

  function selectPlanet(index) {
    activePlanetRef.current = index;
    setActivePlanet(index);
    setCardOpen(true);
    cardOpenRef.current = true;
    exploringRef.current = true;
    wakeRef.current?.();
  }

  function releaseExploration() {
    exploringRef.current = cardOpenRef.current || Boolean(stageRef.current?.querySelector(".solar-interaction")?.contains(document.activeElement));
    wakeRef.current?.();
  }

  function closeCard(index = activePlanetRef.current) {
    planetButtons.current[index]?.focus({ preventScroll: true });
    cardOpenRef.current = false;
    setCardOpen(false);
    releaseExploration();
  }

  useEffect(() => {
    let cancelled = false;
    let cleanup;
    function initialize(createParticleRenderer) {
      const track = trackRef.current;
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      const shell = document.getElementById("portfolio-content");
      if (!track || !canvas || !stage) return;
      const labels = labelsRef.current;
      const context = labels?.getContext("2d");
      const gpu = createParticleRenderer(canvas);
      const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (!context || !gpu) {
        gpu?.dispose();
        const updateFallback = () => {
          const rect = track.getBoundingClientRect();
          const globe = -rect.top / Math.max(1, track.offsetHeight - stage.clientHeight) > 0.5;
          setChapter(globe ? "technologies" : "identity");
          setSolarVisible(!globe);
          stage.style.setProperty("--identity-opacity", globe ? 0 : 1);
          stage.style.setProperty("--technology-opacity", globe ? 1 : 0);
          const { x, y, radius } = solarLayout(stage.clientWidth, stage.clientHeight);
          positionSolarFallback(fallbackSolarRef.current, stage.clientWidth, stage.clientHeight);
          const offsets = solarLabels(stage.clientWidth, stage.clientHeight);
          planetButtons.current.forEach((button, index) => {
            if (!button) return;
            const position = planetPosition(index);
            button.style.left = `${x + position.x * radius}px`;
            button.style.top = `${y + position.y * radius}px`;
            planetCards.current[index]?.style.setProperty("--planet-x", button.style.left);
            planetCards.current[index]?.style.setProperty("--planet-y", button.style.top);
            button.style.setProperty("--label-x", `${offsets[index].x}px`);
            button.style.setProperty("--label-y", `${offsets[index].y}px`);
          });
        };
        window.addEventListener("scroll", updateFallback, { passive: true });
        window.addEventListener("resize", updateFallback);
        updateFallback();
        stage.dataset.heroReady = "true";
        window.dispatchEvent(new Event("portfolio:hero-ready"));
        return () => {
          window.removeEventListener("scroll", updateFallback);
          window.removeEventListener("resize", updateFallback);
        };
      }
      let width = 0;
      let height = 0;
      let particles = [];
      let progress = 0;
      let targetProgress = 0;
      let frame = 0;
      let lastTime = 0;
      let elapsed = 0;
      let visible = true;
      let activeChapter = "identity";
      let reducedMotion = motionPreference.matches;
      let labelFont = "sans-serif";
      let backgroundColor = "#f1f0ec";
      let textColor = "#171817";

      function measure() {
        width = stage.clientWidth;
        height = stage.clientHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        labels.width = Math.round(width * dpr);
        labels.height = Math.round(height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        const styles = getComputedStyle(stage);
        labelFont = styles.fontFamily;
        backgroundColor = styles.getPropertyValue("--bg").trim();
        textColor = styles.getPropertyValue("--text").trim();
        const count = width < 760 ? 3600 : 7200;
        particles = Array.from({ length: count }, (_, index) => {
          const y = 1 - (index + .5) / count * 2;
          const radius = Math.sqrt(1 - y * y);
          const angle = index * 2.399963229728653;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const longitude = Math.atan2(x, z) * 180 / Math.PI;
          const latitude = Math.asin(y) * 180 / Math.PI;
          return {
            index,
            sphere: { x, y: -y, z, land: isLand(longitude, latitude) },
          };
        });
        gpu.resize(width, height, dpr, particles.length);
        readScroll();
        draw(performance.now());
      }

      function readScroll() {
        const rect = track.getBoundingClientRect();
        targetProgress = Math.min(1, Math.max(0, -rect.top / Math.max(1, track.offsetHeight - height)));
        setSolarVisible(targetProgress < .3);
        if (targetProgress >= .3) {
          exploringRef.current = false;
          if (cardOpenRef.current) { cardOpenRef.current = false; setCardOpen(false); }
        }
        const nextChapter = targetProgress < (reducedMotion ? 0.5 : 0.74) ? "identity" : "technologies";
        if (nextChapter !== activeChapter) {
          activeChapter = nextChapter;
          setChapter(nextChapter);
        }
        if (reducedMotion) { progress = targetProgress; draw(performance.now()); }
        start();
      }

      function draw(now) {
        const dt = Math.min((now - lastTime) / 1000 || 0, 0.05);
        lastTime = now;
        if (!reducedMotion && !pausedRef.current && !exploringRef.current) elapsed += dt;
        progress += (targetProgress - progress) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 12));
        const sceneProgress = reducedMotion ? (progress > 0.5 ? 1 : 0) : progress;
        const identityOpacity = 1 - smoothstep(0.3, 0.5, sceneProgress);
        const techOpacity = smoothstep(0.74, 0.92, sceneProgress);
        stage.style.setProperty("--identity-opacity", identityOpacity);
        stage.style.setProperty("--technology-opacity", techOpacity);
        stage.style.setProperty("--identity-shift", `${-smoothstep(0.16, 0.38, sceneProgress) * 45}px`);
        context.clearRect(0, 0, width, height);
        const mobile = width < 760;
        const centerX = width * (mobile ? 0.36 : 0.28);
        const centerY = height * (mobile ? 0.72 : 0.55);
        const globeRadius = mobile ? Math.min(width * 0.27, height * 0.2) : Math.min(width * 0.16, height * 0.3);
        const rotation = reducedMotion ? -0.32 : -0.32 + elapsed * 0.075;
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const assembly = smoothstep(.22, .94, sceneProgress);
        const { x: sourceX, y: sourceY, radius: sourceRadius } = solarLayout(width, height);
        const earth = planetPosition(2, elapsed);
        const approach = smoothstep(.15, .55, sceneProgress);
        let pointIndex = 0;
        for (const particle of particles) {
          const source = solarPoint(particle.index, particles.length, elapsed);
          const sphere = particle.sphere;
          const sx = sphere.x * cos + sphere.z * sin;
          const sz = sphere.z * cos - sphere.x * sin;
          const perspective = 1 + sz * 0.08;
          const globeX = centerX + sx * globeRadius * perspective;
          const globeY = centerY + sphere.y * globeRadius * perspective;
          const startX = sourceX + (source.x - earth.x * approach) * sourceRadius * (1 + approach * .65);
          const startY = sourceY + (source.y - earth.y * approach) * sourceRadius * (1 + approach * .65);
          const merge = smoothstep(.2 + source.phase * .12, .82 + source.phase * .12, sceneProgress);
          const sweep = Math.sin(merge * Math.PI) * sourceRadius * .3;
          const x = startX + (globeX - startX) * merge + sweep * Math.sin(source.phase * Math.PI * 2);
          const y = startY + (globeY - startY) * merge + sweep * Math.cos(source.phase * Math.PI * 2);
          const sourceAlpha = source.alpha;
          const globeAlpha = sphere.land ? (sz > 0 ? 0.95 : 0.07) : (sz > 0 ? 0.08 : 0.02);
          const alpha = sourceAlpha + (globeAlpha - sourceAlpha) * merge;
          const sourceSize = mobile ? .9 : 1.1;
          const radius = sourceSize + ((mobile ? .7 : .9) - sourceSize) * merge;
          const color = source.color.map((channel, index) => Math.round(channel + ([40, 49, 46][index] - channel) * merge));
          gpu.point(pointIndex++, x, y, source.z * 16 * (1 - merge) + sz * 20 * merge,
            color, alpha, radius, source.sun ? (1 - merge) * .45 : 0);
        }
        gpu.render();

        if (assembly < 1) {
          context.globalAlpha = (1 - assembly) * .8;
          context.lineWidth = 1.15;
          context.lineCap = "round";
          const offsets = solarLabels(width, height, elapsed);
          const sunRadius = sourceRadius * .105;
          const halo = context.createRadialGradient(sourceX, sourceY, sunRadius * .5, sourceX, sourceY, sunRadius * 2.5);
          halo.addColorStop(0, "rgba(240,167,56,.18)");
          halo.addColorStop(.4, "rgba(240,167,56,.1)");
          halo.addColorStop(1, "rgba(240,167,56,0)");
          context.fillStyle = halo;
          context.beginPath(); context.arc(sourceX, sourceY, sunRadius * 2.5, 0, Math.PI * 2); context.fill();
          planets.forEach((planet, index) => {
            context.setLineDash([.1, 5]);
            context.lineDashOffset = -elapsed * (3 + index * .35);
            for (let half = 0; half < 2; half++) {
              context.strokeStyle = index === activePlanetRef.current ? (half ? "rgba(62,74,65,.34)" : "#525b53") : (half ? "rgba(104,116,111,.22)" : "rgba(104,116,111,.5)");
              context.beginPath(); context.ellipse(sourceX, sourceY, planet.orbit * sourceRadius, planet.orbit * sourceRadius * .6, orbitTilt, half * Math.PI, (half + 1) * Math.PI); context.stroke();
            }
            context.setLineDash([]);
            context.lineDashOffset = 0;
            const position = planetPosition(index, elapsed);
            const x = sourceX + position.x * sourceRadius;
            const y = sourceY + position.y * sourceRadius;
            const size = Math.max(2.5, planet.size * sourceRadius);
            if (index === 5) {
              context.strokeStyle = "#ac956a";
              context.lineWidth = 2;
              context.setLineDash([.1, 3]);
              context.beginPath(); context.ellipse(x, y, size * 1.9, size * .5, orbitTilt, 0, Math.PI * 2); context.stroke();
              context.setLineDash([]);
              context.lineWidth = 1.15;
            }
            if (index === activePlanetRef.current) {
              context.strokeStyle = "#383d38";
              context.beginPath(); context.arc(x, y, size + 5, 0, Math.PI * 2); context.stroke();
            }
            const button = planetButtons.current[index];
            if (button) {
              button.style.left = `${x}px`; button.style.top = `${y}px`;
              planetCards.current[index]?.style.setProperty("--planet-x", `${x}px`);
              planetCards.current[index]?.style.setProperty("--planet-y", `${y}px`);
              button.style.setProperty("--label-x", `${offsets[index].x}px`);
              button.style.setProperty("--label-y", `${offsets[index].y}px`);
            }
          });
          context.lineCap = "butt";
          context.globalAlpha = 1;
        }

        if (techOpacity > 0.01) {
          context.globalAlpha = techOpacity;
          context.strokeStyle = "rgba(104, 116, 111, 0.22)";
          context.lineWidth = 0.7;
          context.beginPath();
          context.ellipse(centerX, centerY, globeRadius * 1.13, globeRadius * 0.34, -0.22, 0, Math.PI * 2);
          context.stroke();
          context.font = `${mobile ? 10 : 12}px ${labelFont}`;
          context.textAlign = "center";
          context.textBaseline = "middle";
          globeLabels.forEach((name, index) => {
            if (mobile && index % 2) return;
            const location = spherePoint(index * 360 / globeLabels.length + elapsed * (reducedMotion ? 0 : 3.2), index % 2 ? 30 : -27);
            const orbitX = centerX + location.x * globeRadius * 1.13;
            const orbitY = centerY + location.y * globeRadius - location.z * globeRadius * 0.25;
            const label = mobile ? name.replace(" Desktop & Service", "").replace("Microsoft ", "").replace("Amazon ", "") : name;
            context.globalAlpha = techOpacity * (location.z > -0.1 ? 0.98 : 0.45);
            const textWidth = context.measureText(label).width;
            context.fillStyle = backgroundColor;
            context.fillRect(orbitX - textWidth / 2 - 6, orbitY - 10, textWidth + 12, 20);
            context.fillStyle = textColor;
            context.fillText(label, orbitX, orbitY);
          });
          context.globalAlpha = 1;
        }
      }

      function tick(now) {
        frame = 0;
        if (document.hidden || !visible || shell?.inert) return;
        draw(now);
        if (!reducedMotion && ((!pausedRef.current && !exploringRef.current) || Math.abs(targetProgress - progress) > 0.0001)) frame = requestAnimationFrame(tick);
      }
      function start() {
        if (!frame && visible && !document.hidden && !reducedMotion && !shell?.inert) {
          lastTime = performance.now();
          frame = requestAnimationFrame(tick);
        }
      }
      function visibilityChanged() {
        if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
        else start();
      }
      function preferenceChanged(event) {
        reducedMotion = event.matches;
        cancelAnimationFrame(frame);
        frame = 0;
        readScroll();
      }
      const resize = new ResizeObserver(measure);
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) { cancelAnimationFrame(frame); frame = 0; }
        else { readScroll(); start(); }
      });
      resize.observe(stage);
      intersection.observe(track);
      wakeRef.current = () => { if (reducedMotion) draw(performance.now()); else start(); };
      window.addEventListener("scroll", readScroll, { passive: true });
      window.addEventListener("portfolio:opening-complete", readScroll);
      document.addEventListener("visibilitychange", visibilityChanged);
      motionPreference.addEventListener("change", preferenceChanged);
      measure();
      setCanvasReady(true);
      stage.dataset.heroReady = "true";
      window.dispatchEvent(new Event("portfolio:hero-ready"));
      start();
      return () => {
        cancelAnimationFrame(frame);
        gpu.dispose();
        resize.disconnect();
        intersection.disconnect();
        window.removeEventListener("scroll", readScroll);
        window.removeEventListener("portfolio:opening-complete", readScroll);
        document.removeEventListener("visibilitychange", visibilityChanged);
        motionPreference.removeEventListener("change", preferenceChanged);
        wakeRef.current = null;
      };
    }
    import("@/lib/particleRenderer").then(({ createParticleRenderer }) => {
      if (!cancelled) cleanup = initialize(createParticleRenderer);
    }).catch(() => {
      if (!cancelled) cleanup = initialize(() => null);
    });
    return () => { cancelled = true; cleanup?.(); };
  }, []);

  return (
    <div ref={trackRef} className="particle-track" id="identity">
      <div id="technologies" className="technology-anchor" aria-hidden="true" />
      <div ref={stageRef} className="particle-stage" data-chapter={chapter}>
        <canvas ref={canvasRef} className="journey-canvas" aria-hidden="true" />
        <canvas ref={labelsRef} className="journey-labels" aria-hidden="true" />
        {!canvasReady && (
          <svg className="journey-fallback" viewBox="0 0 400 600" preserveAspectRatio="none" aria-hidden="true">
            {chapter === "identity" ? <svg ref={(element) => { fallbackSolarRef.current = element; positionSolarFallback(element, stageRef.current?.clientWidth, stageRef.current?.clientHeight); }} className="fallback-constellation" x="52%" y="23%" width="43%" height="54%" viewBox="-1.1 -.75 2.2 1.5" preserveAspectRatio="none">
              <circle r=".105" fill="#eda43a" />
              {planets.map((planet, index) => {
                const position = planetPosition(index); return <g key={planet.name}>
                  <ellipse rx={planet.orbit} ry={planet.orbit * .6} transform={`rotate(${(orbitTilt * 180 / Math.PI).toFixed(5)})`} fill="none" stroke="var(--line-strong)" strokeWidth=".006" strokeDasharray=".001 .028" strokeLinecap="round" />
                  <circle cx={position.x.toFixed(5)} cy={position.y.toFixed(5)} r={planet.size} fill={`rgb(${planet.color.join(",")})`} stroke={activePlanet === index ? "#222321" : "none"} strokeWidth=".008" />
                  {index === 5 && <ellipse cx={position.x.toFixed(5)} cy={position.y.toFixed(5)} transform={`rotate(${(orbitTilt * 180 / Math.PI).toFixed(5)} ${position.x.toFixed(5)} ${position.y.toFixed(5)})`} rx={planet.size * 1.9} ry={planet.size * .5} fill="none" stroke="#ac956a" strokeWidth=".008" strokeDasharray=".001 .018" strokeLinecap="round" />}
                </g>;
              })}
            </svg> : <svg className="fallback-world" x="4%" y="25%" width="48%" height="55%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
              <g fill="none" stroke="var(--system)" strokeWidth="1.5" strokeDasharray="1 4">
                <circle cx="200" cy="200" r="175" />
                <ellipse cx="200" cy="200" rx="90" ry="175" />
                <ellipse cx="200" cy="200" rx="175" ry="55" />
                <ellipse cx="200" cy="200" rx="175" ry="125" />
              </g>
            </svg>}
          </svg>
        )}
        <div className="identity-content" aria-hidden={chapter !== "identity"} inert={chapter !== "identity"}>
          <Hero />
        </div>
        <div className={`solar-interaction ${cardOpen ? "card-open" : ""}`} aria-hidden={!solarVisible} inert={!solarVisible}
          onKeyDown={(event) => { if (event.key === "Escape") { closeCard(); event.stopPropagation(); } }}>
          <div className="planet-targets">
            {planets.map((planet, index) => <button key={planet.name} className="planet-target" type="button" ref={(element) => { planetButtons.current[index] = element; }}
              aria-label={`Explore ${planet.step}`} aria-describedby={`workflow-meaning-${index} workflow-example-${index}`} aria-pressed={activePlanet === index} aria-expanded={cardOpen && activePlanet === index} aria-controls={`workflow-card-${index}`}
              onMouseEnter={() => { exploringRef.current = true; selectPlanet(index); }} onFocus={() => { exploringRef.current = true; selectPlanet(index); }}
              onMouseLeave={releaseExploration} onBlur={() => releaseExploration()} onClick={() => selectPlanet(index)}><span>{planet.step}</span></button>)}
          </div>
          {planets.map((planet, index) => <article id={`workflow-card-${index}`} key={planet.step} className="planet-card" hidden={!cardOpen || activePlanet !== index}
            ref={(element) => { planetCards.current[index] = element; }} aria-label={`${planet.step}: meaning and work example`}
            onMouseEnter={() => { exploringRef.current = true; }} onMouseLeave={releaseExploration}>
            <div className="card-heading"><span>0{index + 1} / MY PROCESS</span><button type="button" aria-label={`Close ${planet.step} card`} onClick={() => closeCard(index)}>×</button></div>
            <h3>{planet.step}</h3><p id={`workflow-meaning-${index}`}>{planet.detail}</p><p id={`workflow-example-${index}`} className="work-example">{planet.example}</p>
          </article>)}
          <div className="solar-explorer" onMouseEnter={() => { exploringRef.current = true; }} onMouseLeave={releaseExploration}>
            <label htmlFor="solar-planet">DATA → DECISIONS</label>
            <select id="solar-planet" value={activePlanet} onFocus={() => { exploringRef.current = true; }} onBlur={releaseExploration} onChange={(event) => {
              const index = Number(event.target.value); selectPlanet(index);
              requestAnimationFrame(() => planetCards.current[index]?.querySelector("button")?.focus({ preventScroll: true }));
            }}>
              {planets.map((planet, index) => <option key={planet.name} value={index}>{planet.step}</option>)}
            </select>
            <small>Hover, focus or tap a step · Illustrative orbits</small>
          </div>
        </div>
        <section className="technology-content" aria-label="Experience overview" aria-hidden={chapter !== "technologies"} inert={chapter !== "technologies"}>
          <div className="technology-copy">
            <span className="chapter-eyebrow">02 / EXPERIENCE ACROSS BORDERS</span>
            <h2 aria-label={`${profile.stats[0].value} years of experience. Real impact.`}>{profile.stats[0].value} years.<br /> Real impact.</h2>
            <p>Audience, public-safety, retail and operational analytics — turning complex data into reporting people can trust.</p>
            <dl className="experience-proof">{experience.filter((job) => job.tenure).map((job) => <div key={job.company}><dt>{job.company}<br />{job.tenure.label}</dt><dd>{job.tenure.value}</dd></div>)}</dl>
            <a href="#about" className="technology-link">Explore my experience <span>↗</span></a>
          </div>
        </section>
        <div className="journey-caption" aria-hidden="true">
          <span>{chapter === "identity" ? "01 / IDENTITY" : "02 / EXPERIENCE"}</span>
          <span>{chapter === "identity" ? "SCROLL TO FOLLOW THE SIGNAL" : "INDIA → UNITED STATES"}</span>
        </div>
        <button type="button" className="journey-motion" aria-pressed={paused} aria-label={paused ? "Resume visual motion" : "Pause visual motion"}
          onClick={() => { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current); wakeRef.current?.(); }}>{paused ? "RESUME MOTION ▷" : "PAUSE MOTION Ⅱ"}</button>
      </div>
      <style jsx>{`
        .particle-track { position: relative; height: 320vh; }
        .technology-anchor { position: absolute; top: 210vh; left: 0; width: 1px; height: 1px; }
        .particle-stage { --identity-opacity: 1; --technology-opacity: 0; --identity-shift: 0px; position: sticky; top: 0; height: 100svh; overflow: hidden; background: var(--bg); }
        .journey-canvas, .journey-labels { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
        .journey-fallback { position: absolute; inset: 0; height: 100%; width: 100%; }
        .identity-content { position: absolute; inset: 0; opacity: var(--identity-opacity); transform: translateY(var(--identity-shift)); }
        .identity-content[aria-hidden="true"] { pointer-events: none; }
        .solar-interaction { position: absolute; inset: 0; opacity: var(--identity-opacity); pointer-events: none; }
        .planet-targets { position: absolute; inset: 0; pointer-events: none; }
        .planet-target { position: absolute; width: 44px; height: 44px; transform: translate(-50%, -50%); border: 0; background: transparent; cursor: pointer; pointer-events: auto; border-radius: 50%; }
        .planet-target span { position: absolute; top: calc(50% + var(--label-y, 14px)); left: calc(50% + var(--label-x, 0px)); transform: translate(-50%, -50%); background: var(--bg); color: #242824; padding: .2rem .3rem; font: 500 .72rem ui-monospace, monospace; white-space: nowrap; }
        .planet-target:hover span, .planet-target:focus-visible span { text-decoration: underline; text-underline-offset: 4px; }
        .planet-card { position: absolute; z-index: 2; left: clamp(43%, calc(var(--planet-x, 65vw) + 28px), calc(86% - 15rem)); top: clamp(5.5rem, calc(var(--planet-y, 40vh) + 20px), calc(100% - 20rem)); width: 15rem; padding: .85rem 1rem 1rem; border: 1px solid #899085; border-radius: 3px; background: rgba(247, 246, 241, .98); box-shadow: 0 8px 28px rgba(34, 40, 33, .09); pointer-events: auto; color: #242824; }
        .planet-card[hidden] { display: none; }
        .card-open .solar-explorer { visibility: hidden; }
        .card-heading { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
        .card-heading span { font: .65rem ui-monospace, monospace; letter-spacing: .04em; color: #454a44; }
        .card-heading button { display: grid; place-items: center; width: 44px; height: 44px; margin: -.6rem -.65rem -.35rem 0; border: 0; background: transparent; color: #242824; font-size: 1.3rem; }
        .planet-card h3 { font-size: 1.2rem; font-weight: 600; margin: .45rem 0 .4rem; }
        .planet-card p { font-size: .85rem; line-height: 1.5; color: #383d38; }
        .planet-card .work-example { border-top: 1px solid #cccec4; padding-top: .65rem; margin-top: .65rem; }
        .solar-explorer { position: absolute; left: calc(50% + 180px - 9rem); width: 18rem; top: calc(46% + min(25.5vw, 42svh, (37vw - 180px) / .91) * .72 + 24px); pointer-events: auto; }
        .solar-explorer label { display: block; font: .7rem/1.5 ui-monospace, monospace; letter-spacing: .06em; color: #454a44; }
        .solar-explorer select { display: block; width: 100%; min-height: 44px; border: 0; border-bottom: 1px solid var(--line-strong); background: transparent; color: var(--text); font-size: .8rem; cursor: pointer; }
        .solar-explorer p { margin-top: .45rem; font-size: .72rem; line-height: 1.5; }
        .solar-explorer small { display: block; margin-top: .35rem; color: #454a44; font: .65rem/1.4 ui-monospace, monospace; }
        .technology-content { position: absolute; inset: 0; display: flex; align-items: center; padding: 0 clamp(1.25rem, 6.7vw, 6rem); opacity: var(--technology-opacity); pointer-events: none; }
        .technology-content[aria-hidden="false"] { pointer-events: auto; }
        .technology-copy { margin-left: 52%; max-width: 38%; }
        .chapter-eyebrow { font-size: .75rem; letter-spacing: .1em; color: #454a44; }
        h2 { font-family: var(--font-general-sans), sans-serif; font-size: clamp(3rem, 6.2vw, 6rem); font-weight: 500; letter-spacing: -0.055em; line-height: 0.98; margin: 1.4rem 0; }
        p { font-size: clamp(1rem, 1.35vw, 1.2rem); line-height: 1.6; max-width: 26rem; color: var(--text-dim); }
        .experience-proof { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; border-top: 1px solid var(--line); margin-top: 1.35rem; padding-top: 1rem; }
        .experience-proof div { display: flex; flex-direction: column-reverse; gap: .35rem; }
        .experience-proof dd { font-size: clamp(1.6rem, 2.7vw, 2.5rem); line-height: 1; letter-spacing: -.04em; font-weight: 500; }
        .experience-proof dt { font-size: .75rem; line-height: 1.5; color: #454a44; }
        .technology-link { display: inline-flex; gap: 2rem; align-items: center; font-size: 0.85rem; margin-top: 1.8rem; padding-bottom: 0.4rem; border-bottom: 1px solid var(--line-strong); }
        .journey-caption { position: absolute; bottom: 2rem; left: clamp(1.25rem, 6.7vw, 6rem); right: 13%; display: flex; justify-content: space-between; font-size: .72rem; letter-spacing: .07em; color: #454a44; pointer-events: none; }
        .journey-motion { position: absolute; right: 16%; bottom: 4rem; color: var(--text-dim); background: var(--bg); border: 0; border-bottom: 1px solid var(--line); padding: .5rem 0; min-height: 44px; font: .55rem ui-monospace, monospace; cursor: pointer; }
        @media (prefers-reduced-motion: reduce) { .journey-motion { display: none; } }
        @media (max-width: 759px) {
          .particle-track { height: 290vh; }
          .technology-anchor { top: 183vh; }
          .technology-content { align-items: flex-start; padding-top: 6.2rem; }
          .technology-copy { margin-left: 0; max-width: 100%; }
          h2 { font-size: clamp(2.6rem, 10vw, 4rem); margin: 0.8rem 0; }
          p { font-size: 0.92rem; max-width: 24rem; }
          .experience-proof { max-width: 24rem; margin-top: 1rem; padding-top: .8rem; }
          .experience-proof dd { font-size: 1.6rem; }
          .technology-link { margin-top: 0.8rem; }
          .journey-fallback { inset: 0; height: 100%; width: 100%; }
          .fallback-world { x: 3%; y: 49%; width: 68%; height: 43%; }
          .planet-target span { font-size: .65rem; }
          .planet-card { left: 1.25rem; top: auto; bottom: 5rem; width: calc(100% - 2.5rem); }
          .planet-card h3 { margin: .15rem 0 .3rem; }
          .solar-explorer { left: 1.25rem; right: 1.25rem; width: auto; top: auto; bottom: 5.5rem; display: grid; grid-template-columns: 1fr 1.5fr; gap: .25rem 1rem; }
          .solar-explorer label { align-self: center; }
          .solar-explorer p, .solar-explorer small { display: none; }
          .journey-motion { right: 1.25rem; bottom: 2rem; }
          .journey-caption { bottom: 1.2rem; right: 1.25rem; font-size: .65rem; letter-spacing: .02em; }
        }
        @media (max-height: 700px) and (max-width: 759px) {
          .solar-explorer { bottom: 4.7rem; }
          .solar-explorer p, .solar-explorer small { display: none; }
          .technology-content { padding-top: 4.9rem; }
          h2 { font-size: 2.25rem; margin: .6rem 0; }
          h2 br { display: none; }
          p { font-size: .85rem; }
          .experience-proof { margin-top: .7rem; padding-top: .6rem; }
          .experience-proof dd { font-size: 1.35rem; }
          .experience-proof dt { font-size: .6rem; }
          .technology-link { margin-top: .7rem; font-size: .8rem; }
        }
      `}</style>
    </div>
  );
}

export function TechnologyDetails() {
  const sectionRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const rows = [
    { label: "01 / ANALYZE & REPORT", categories: [0, 1, 2, 3], color: "#a44336" },
    { label: "02 / CONNECT & DELIVER", categories: [4, 5, 6, 7], color: "#355b75" }
  ];

  useEffect(() => {
    const update = () => {
      const bounds = sectionRef.current?.getBoundingClientRect();
      if (!bounds) return;
      setVisible(!document.hidden && bounds.bottom > 0 && bounds.top < window.innerHeight);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <section id="technology-details" ref={sectionRef} className="technology-details" aria-labelledby="toolkit-title" data-paused={paused || !visible}>
      <header className="details-heading">
        <div><span className="toolkit-eyebrow">THE TOOLKIT</span><h2 id="toolkit-title">Skills in motion.</h2></div>
        <div className="motion-controls">
          <span className="motion-hint">HOVER A SKILL TO OUTLINE</span>
          <button type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>{paused ? "Resume skill motion" : "Pause skill motion"}<span aria-hidden="true">{paused ? "↗" : "Ⅱ"}</span></button>
        </div>
      </header>
      <div className="skill-lines">
        {rows.map((row, index) => {
          const skills = row.categories.flatMap((category) => skillCategories[category].skills.map((skill) => skill.name));
          return <div key={row.label} className="skill-band" style={{ "--skill-accent": row.color, "--drift-time": `${Math.max(60, skills.join("").length * 0.55)}s` }}>
            <div className="skill-row" tabIndex={0} role="group" aria-label={`${row.label.slice(5)} skills; focus to pause this line`}
              onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.scrollLeft = 0; }}>
              <div className={`skill-track ${index % 2 ? "moves-right" : "moves-left"}`}>
                {[0, 1].map((copy) => <ul key={copy} className="skill-group" aria-hidden={copy === 1 ? true : undefined}>
                  {skills.map((skill) => <li key={skill} className="skill-item"><span className="skill-word" tabIndex={copy === 0 ? 0 : -1}>{skill}</span><span className="skill-dot" aria-hidden="true" /></li>)}
                </ul>)}
              </div>
            </div>
          </div>;
        })}
      </div>
      <p className="toolkit-caption">Different tools. One connected practice.<span>Hover a skill to outline it · Its line pauses</span></p>
      <style jsx>{`
        .technology-details { width: 100%; margin: 0; padding: 2rem 0; scroll-margin-top: 5rem; }
        .details-heading { display: flex; align-items: center; justify-content: space-between; gap: 2rem; margin: 0 max(160px, 6.7%) 1.3rem 6.7%; }
        .toolkit-eyebrow, .motion-hint, .band-label { font-family: ui-monospace, monospace; font-size: .58rem; line-height: 1.6; letter-spacing: .1em; color: var(--text-dim); }
        h2 { font-family: var(--font-general-sans), sans-serif; font-size: clamp(1.5rem, 2.5vw, 2.4rem); font-weight: 500; line-height: 1.1; letter-spacing: -.045em; margin-top: .4rem; }
        .motion-controls { display: grid; gap: .8rem; justify-items: end; padding-bottom: .3rem; }
        .motion-controls button { display: flex; align-items: center; gap: 1.5rem; background: transparent; color: var(--text-dim); border: 0; border-bottom: 1px solid var(--line-strong); padding: .5rem 0; min-height: 44px; font-size: .78rem; cursor: pointer; }
        .motion-controls button span { font-size: .9rem; }
        .skill-band { padding: .4rem 0; border-top: 1px solid var(--line); }
        .band-label { display: flex; align-items: center; justify-content: space-between; color: var(--skill-accent); }
        .band-label span { font-size: .85rem; }
        .skill-row { overflow: hidden; padding: .45rem 0; }
        .skill-row:focus-visible { outline-offset: 2px; }
        .skill-track { display: flex; width: max-content; animation: skill-drift var(--drift-time) linear infinite; }
        .skill-track.moves-right { animation-direction: reverse; }
        .skill-group { display: flex; align-items: center; list-style: none; gap: 2rem; padding-right: 2rem; flex-shrink: 0; }
        .skill-item { display: flex; align-items: center; gap: 2rem; white-space: nowrap; font-family: var(--font-general-sans), sans-serif; font-size: clamp(1.8rem, 3.2vw, 3.1rem); font-weight: 500; line-height: 1.3; letter-spacing: -.035em; }
        .skill-word { color: var(--text); -webkit-text-stroke: 1px transparent; transition: color 200ms ease, -webkit-text-stroke-color 200ms ease; }
        .skill-dot { display: block; width: 7px; height: 7px; background: var(--skill-accent); border-radius: 50%; flex-shrink: 0; }
        .technology-details[data-paused="true"] .skill-track, .skill-row:hover .skill-track, .skill-row:focus-within .skill-track { animation-play-state: paused; }
        .skill-word:hover, .skill-word:focus-visible { color: transparent; -webkit-text-stroke-color: var(--text); }
        .toolkit-caption { display: flex; justify-content: space-between; gap: 2rem; border-top: 1px solid var(--line); padding: .8rem 6.7% 0; margin-top: .1rem; font-size: .7rem; color: var(--text-dim); }
        .toolkit-caption span { font-size: .66rem; }
        @keyframes skill-drift { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (max-width: 860px) {
          .details-heading { margin-left: 1.25rem; margin-right: 1.25rem; gap: 1rem; }
          .motion-controls { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0; }
          .motion-hint { font-size: .5rem; max-width: 10rem; }
        }
        @media (max-width: 600px) {
          .technology-details { padding: 1.5rem 0; }
          h2 { font-size: 1.65rem; }
          .details-heading { flex-direction: column; align-items: flex-start; margin-bottom: 1rem; }
          .band-label { font-size: .5rem; }
          .skill-group, .skill-item { gap: 1.3rem; }
          .skill-group { padding-right: 1.3rem; }
          .skill-dot { width: 5px; height: 5px; }
          .motion-controls button { font-size: .68rem; gap: .6rem; }
          .toolkit-caption { flex-direction: column; gap: .4rem; padding-left: 1.25rem; padding-right: 1.25rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .skill-row { overflow: visible; padding-left: 1.25rem; padding-right: 1.25rem; }
          .skill-track { animation: none; transform: none; width: auto; display: block; }
          .skill-group { flex-wrap: wrap; gap: .7rem 1.2rem; padding-right: 0; }
          .skill-group[aria-hidden="true"] { display: none; }
          .skill-item { font-size: clamp(1.2rem, 2.2vw, 1.8rem); white-space: normal; gap: 1.2rem; }
          .skill-dot { width: 4px; height: 4px; }
          .motion-controls { display: none; }
          .toolkit-caption span { display: none; }
        }
      `}</style>
    </section>
  );
}
