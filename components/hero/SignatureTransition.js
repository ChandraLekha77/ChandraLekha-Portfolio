"use client";

import { useEffect, useRef, useState } from "react";
import { workflow } from "@/data/workflow";

export default function SignatureTransition() {
  const [active, setActive] = useState(2);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const buttons = useRef([]);
  const section = useRef(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setReduced(media.matches); if (media.matches) setPlaying(false); };
    update();
    media.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) setPlaying(false); });
    observer.observe(section.current);
    const pauseHidden = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener("visibilitychange", pauseHidden);
    return () => { media.removeEventListener("change", update); observer.disconnect(); document.removeEventListener("visibilitychange", pauseHidden); };
  }, []);

  useEffect(() => {
    if (!playing || reduced) return;
    const timer = setTimeout(() => {
      if (active === workflow.length - 1) setPlaying(false);
      else setActive(active + 1);
    }, 2200);
    return () => clearTimeout(timer);
  }, [active, playing, reduced]);

  function select(index) { setPlaying(false); setActive(index); }
  function navigate(event, index) {
    const target = event.key === "Home" ? 0 : event.key === "End" ? workflow.length - 1 :
      ["ArrowRight", "ArrowDown"].includes(event.key) ? (index + 1) % workflow.length :
      ["ArrowLeft", "ArrowUp"].includes(event.key) ? (index + workflow.length - 1) % workflow.length : null;
    if (target === null) return;
    event.preventDefault();
    select(target);
    buttons.current[target].focus();
  }

  return (
    <section id="thinking-transition" ref={section} className="thinking-section portfolio-section">
      <div className="editorial-container">
        <header className="section-heading">
          <span className="eyebrow-label">03 / HOW I THINK</span>
          <div><h2>Clarity is earned.<br />Not assumed.</h2>
            <p>Follow the question, not just the data. Inspect each step to see how I turn sources into reporting people can use.</p></div>
        </header>
        <div className="thinking-map" aria-label="Five connected steps in my analytical process">
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
            <defs><marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 1 L 8 5 L 0 9" fill="none" stroke="context-stroke" strokeWidth="1.5" /></marker></defs>
            {[0, 1, 2, 3].map((index) => {
              const x = 100 + index * 200;
              const y = index % 2 ? 75 : 150;
              const nextY = index % 2 ? 150 : 75;
              return <path key={index} data-connected={active === index || active === index + 1}
                d={`M${x + 40} ${y} C${x + 100} ${y}, ${x + 100} ${nextY}, ${x + 156} ${nextY}`}
                markerEnd="url(#flow-arrow)" className="thinking-edge" />;
            })}
          </svg>
          {workflow.map((step, index) => (
            <button key={step.title} type="button" className="thinking-node"
              style={{ "--node-x": `${10 + index * 20}%`, "--node-y": index % 2 ? "25%" : "50%" }}
              ref={(element) => { buttons.current[index] = element; }}
              aria-pressed={active === index} aria-controls="thinking-inspector"
              onClick={() => select(index)} onFocus={() => select(index)}
              onMouseEnter={() => select(index)} onKeyDown={(event) => navigate(event, index)}>
              <span className="node-orbit"><span>0{index + 1}</span></span>
              <strong>{step.title}</strong><small>{step.subtitle}</small>
            </button>
          ))}
        </div>
        <div className="flow-toolbar">
          <span className="eyebrow-label">CONCEPTUAL ARCHITECTURE / ANALYTICAL PROCESS</span>
          <div className="flow-controls">
            <button type="button" onClick={() => select(Math.max(0, active - 1))} disabled={active === 0} aria-label="Previous process step">←</button>
            <button type="button" className="play-flow" disabled={reduced}
              onClick={() => { if (playing) setPlaying(false); else { setActive(0); setPlaying(true); } }}>
              {reduced ? "MANUAL EXPLORATION" : playing ? "PAUSE FLOW" : "PLAY THE PROCESS"}
            </button>
            <button type="button" onClick={() => select(Math.min(workflow.length - 1, active + 1))} disabled={active === workflow.length - 1} aria-label="Next process step">→</button>
          </div>
        </div>
        <div id="thinking-inspector" className="thinking-inspector" aria-live="polite" aria-atomic="true">
          <div className="inspector-index" aria-hidden="true">0{active + 1}<span>/ 05</span></div>
          <div className="inspector-copy"><h3>{workflow[active].subtitle}.</h3><p>{workflow[active].detail}</p>
            <span className="inspector-tools">{workflow[active].tools}</span></div>
          <div className="inspector-evidence"><span className="eyebrow-label">IN PRACTICE</span><p>{workflow[active].evidence}</p></div>
        </div>
      </div>
    </section>
  );
}
