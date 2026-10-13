"use client";

import { useEffect, useRef, useState } from "react";
import { projects } from "@/data/projects";

function useDemoMotion() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const measure = () => {
      frame = 0;
      const bounds = ref.current?.getBoundingClientRect();
      setVisible(Boolean(bounds && bounds.bottom > 0 && bounds.top < window.innerHeight && !document.hidden));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const preference = () => setReduced(media.matches);
    measure();
    preference();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    media.addEventListener("change", preference);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      media.removeEventListener("change", preference);
    };
  }, []);
  return { ref, running: visible && !paused && !reduced, paused, reduced, toggle: () => setPaused((value) => !value) };
}

function MotionControl({ motion, name }) {
  return <button className="demo-motion-control" type="button" disabled={motion.reduced} aria-pressed={motion.paused}
    aria-label={`${motion.paused ? "Resume" : "Pause"} ${name} animation`} onClick={motion.toggle}>
    <span aria-hidden="true">{motion.paused ? "▷" : "Ⅱ"}</span>{motion.reduced ? "Motion reduced" : motion.paused ? "Resume motion" : "Pause motion"}
  </button>;
}

function FlowLine({ path, delay = 0, active = true }) {
  return <g className={active ? "flow-line is-active" : "flow-line"}>
    <path d={path} className="schematic-thread" />
    {active && <path d={path} pathLength="100" className="flow-packet demo-animated" style={{ animationDelay: `${delay}s` }} />}
  </g>;
}

function EmailDiagram({ view, mobile = false }) {
  const center = mobile ? [160, 136] : [330, 140];
  const radius = mobile ? 38 : 44;
  const titles = ["ENGAGEMENT", "SALES", "YTD REVENUE"];
  return <svg className={mobile ? "email-diagram-mobile" : "email-diagram-desktop"} viewBox={mobile ? "0 0 320 310" : "0 0 760 280"}>
    <text className="diagram-label" x={mobile ? 160 : 48} y={mobile ? 14 : 252} textAnchor="middle">CAMPAIGN DATA</text>
    {[0, 1, 2, 3].map((row) => {
      const x = mobile ? 14 + row * 78 : 20;
      const y = mobile ? 30 : 40 + row * 52;
      const path = mobile ? `M${x + 26} 62 C${x + 26} 87 160 75 160 98` : `M76 ${y + 16} C170 ${y + 16} 205 140 286 140`;
      return <g key={row}><FlowLine path={path} delay={-row * .65} />
        <g className="email-source" transform={`translate(${x} ${y})`}><rect width="52" height="32" rx="2" />
          <path d="M1 2 L26 19 L51 2" /></g></g>;
    })}
    <g transform={`translate(${center[0]} ${center[1]})`}>
      <circle r={radius + 8} className="warehouse-halo demo-animated" />
      <circle r={radius} className="warehouse-node" />
      <path d="M-17 0 H17 M0 -17 V17 M-12 -12 L12 12 M-12 12 L12 -12" className="warehouse-icon" />
    </g>
    <text x={center[0]} y={center[1] + radius + 26} textAnchor="middle" className="diagram-label">SQL / SNOWFLAKE</text>
    {[0, 1, 2].filter((index) => !mobile || index === view).map((index) => {
      const x = mobile ? 28 : 530;
      const y = mobile ? 236 : 28 + index * 76;
      const path = mobile ? "M160 200 L160 236" : `M374 140 C450 140 445 ${y + 30} 530 ${y + 30}`;
      return <g key={index} className={`${mobile ? "mobile-report-path" : "report-path"}${view === index ? " is-active" : ""}`}>
        <FlowLine path={path} active={view === index} delay={-.4} />
        <rect x={x} y={y} width={mobile ? 264 : 202} height="60" rx="3" className="report-node" />
        <text x={x + 15} y={y + 22}>0{index + 1} / {titles[index]}</text>
        {[46, 79, 108].map((width, bar) => <rect key={bar} x={x + 15} y={y + 33 + bar * 6} width={width} height="2"
          className={`report-bar${view === index ? " demo-animated" : ""}`} style={{ animationDelay: `${-bar * .3}s` }} />)}
        <path d={`M${x + (mobile ? 194 : 150)} ${y + 45} l10 -8 9 3 12 -15`} className="report-chart" />
      </g>;
    })}
  </svg>;
}

function ProjectFacts({ project }) {
  return <>
    <dl className="project-facts">{project.results.map((result) => <div key={result.label}><dt>{result.label}</dt><dd>{result.value}</dd></div>)}</dl>
    <div className="project-notes"><div><span className="eyebrow-label">MY CONTRIBUTION</span><p>{project.contribution}</p></div>
      <div><span className="eyebrow-label">OUTCOME</span><p>{project.outcome}</p></div></div>
    <ul className="project-tools" aria-label="Project technologies">{project.technologies.map((tool) => <li key={tool}>{tool}</li>)}</ul>
  </>;
}

function EmailDemo({ project }) {
  const [view, setView] = useState(0);
  const motion = useDemoMotion();
  return <div className="email-demo project-demo" ref={motion.ref} data-running={motion.running}>
    <div className="demo-caption"><span>CONCEPTUAL ARCHITECTURE<br /><strong>01 / EMAIL → INSIGHT</strong></span><MotionControl motion={motion} name="email" /></div>
    <div className="email-schematic" aria-hidden="true">
      <EmailDiagram view={view} /><EmailDiagram view={view} mobile />
    </div>
    <div className="report-controls" role="group" aria-label="Explore the three dashboard topics">
      {project.views.map((item, index) => <button key={item.title} type="button" aria-pressed={view === index} aria-controls="report-description" onClick={() => setView(index)}><span>0{index + 1}</span>{item.title}<span>↗</span></button>)}
    </div>
    <p id="report-description" className="report-description" aria-live="polite">{project.views[view].detail}</p>
    <p className="demo-disclosure">Illustrative SQL / Snowflake → Tableau flow, not the actual dashboards or campaign data.</p>
  </div>;
}

function VoiceDemo() {
  const [mode, setMode] = useState("voice");
  const motion = useDemoMotion();
  return <div className="voice-demo project-demo" ref={motion.ref} data-running={motion.running}>
    <div className="demo-caption"><span>CONCEPTUAL ARCHITECTURE<br /><strong>02 / INPUT → RESPONSE</strong></span><MotionControl motion={motion} name="Calmpanion" /></div>
    <div className="input-switch" role="group" aria-label="Explore chatbot input modes">
      <button type="button" aria-pressed={mode === "voice"} onClick={() => setMode("voice")}>Voice input</button>
      <button type="button" aria-pressed={mode === "text"} onClick={() => setMode("text")}>Text input</button>
    </div>
    <div className={`voice-signal signal-${mode}`} aria-hidden="true">
      {mode === "voice" ? <svg viewBox="0 0 650 180" key="voice">
        <path d="M0 90 H650" stroke="currentColor" opacity=".12" />
        {Array.from({ length: 57 }, (_, index) => {
          const height = 12 + Math.pow(Math.sin(index * 1.7), 2) * Math.sin(Math.PI * index / 56) * 126;
          return <line key={index} x1={17 + index * 11} x2={17 + index * 11} y1={(90 - height / 2).toFixed(3)}
            y2={(90 + height / 2).toFixed(3)} className="signal-bar demo-animated"
            style={{ animationDelay: `${-(index % 9) * .17}s`, animationDuration: `${1.1 + (index % 7) * .13}s` }} />;
        })}
      </svg> : <svg viewBox="0 0 650 180" key="text" className="text-signal">
        <rect x="60" y="25" width="530" height="125" rx="8" className="text-input-frame" />
        {[290, 410, 210].map((width, index) => <path key={index} d={`M88 ${55 + index * 28} h${width}`} pathLength="100"
          className="text-token-line demo-animated" style={{ animationDelay: `${index * .4}s` }} />)}
        <path d="M520 108 V128" className="text-caret demo-animated" />
        <path d="M546 112 l8 7 -8 7" className="text-send" />
      </svg>}
      <span>{mode === "voice" ? "VOICE / SPEECH TO TEXT" : "TEXT / DIRECT INPUT"}</span>
    </div>
    <ol className="voice-route" key={mode} aria-live="polite" aria-label={`${mode} input concept`}>
      {mode === "voice" ? <li><span>01 / TRANSCRIBE</span><strong>OpenAI Whisper</strong></li> : <li><span>01 / INPUT</span><strong>Text interaction</strong></li>}
      <li><span>02 / MODEL</span><strong>Fine-tuned LLaMA</strong><small>Hugging Face Transformers</small></li>
      <li><span>03 / EVALUATE</span><strong>Response testing</strong><small>Team user study</small></li>
    </ol>
    <p className="demo-disclosure">Illustrative input flow, not a live chatbot. User testing does not establish clinical effectiveness.</p>
  </div>;
}

export default function ProjectsSection() {
  return <section id="evidence" className="projects-section portfolio-section">
    <div className="editorial-container">
      <header className="section-heading"><span className="eyebrow-label">04 / SELECTED PROJECTS</span><div><h2>The work behind<br />the way I think.</h2><p>Two projects. Different questions. The same focus on making the output useful.</p></div></header>
      {projects.map((project, index) => <article key={project.id} id={project.id} className={`project-chapter project-${project.id}`}>
        <div className="project-heading"><span className="project-number">0{index + 1}</span><div><span className="eyebrow-label">{project.client || project.category}{project.timeline && ` / ${project.timeline}`}</span><h3>{project.headline}</h3><p className="project-full-title">{project.title}</p></div></div>
        {index === 0 ? <EmailDemo project={project} /> : <VoiceDemo />}
        <ProjectFacts project={project} />
      </article>)}
    </div>
  </section>;
}
