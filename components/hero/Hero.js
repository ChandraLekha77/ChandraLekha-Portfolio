"use client";

import { profile } from "@/data/profile";

export default function Hero() {
  return (
    <section className="hero-copy" aria-label="Introduction">
      <span className="eyebrow"><i aria-hidden="true" />01 / DATA ANALYST</span>
      <h1 aria-label={profile.name}><span className="given-name">Chandra Lekha</span> Ganta<span className="name-dot">.</span></h1>
      <p className="role">Data Analyst <span>— Cloud analytics / Data quality</span></p>
      <p className="intro">I connect complex data to decisions people can trust.</p>
      <div className="hero-actions">
        <a href="#evidence" className="hero-primary">Explore my work <span>↗</span></a>
        <a href={`mailto:${profile.email}`}>Let’s talk ↗</a>
      </div>
      <style jsx>{`
        .hero-copy { position: absolute; top: 50%; left: clamp(1.25rem, 6.7vw, 6rem); width: 31%; max-width: 36rem; transform: translateY(-50%); color: #171817; }
        .eyebrow { display: flex; align-items: center; gap: .7rem; font: 500 .75rem/1.6 ui-monospace, monospace; letter-spacing: .1em; color: #383d38; }
        .eyebrow i { width: 6px; height: 6px; background: #383d38; border-radius: 50%; }
        h1 { font-family: var(--font-general-sans), sans-serif; font-size: clamp(2.05rem, 4.5vw, 5rem); color: #111411; font-weight: 600; letter-spacing: -.055em; line-height: 1.04; margin: 1.5rem 0; }
        .given-name { display: block; font-size: 1em; line-height: inherit; letter-spacing: inherit; white-space: nowrap; }
        .name-dot { color: #383d38; }
        .role { font-size: 1.1rem; font-weight: 600; color: #242824; }
        .role span { margin-left: .3rem; font-size: .9rem; font-weight: 500; color: #383d38; }
        .intro { font-size: clamp(1.05rem, 1.35vw, 1.2rem); font-weight: 500; line-height: 1.55; color: #242824; max-width: 23rem; margin-top: 1.1rem; }
        .hero-actions { display: flex; align-items: center; gap: 1.8rem; margin-top: 2rem; }
        .hero-actions a { font-size: .9rem; font-weight: 500; color: #171817; padding-bottom: .4rem; border-bottom: 1px solid #383d38; }
        .hero-actions .hero-primary { display: flex; align-items: center; gap: 1.8rem; min-height: 48px; padding: .8rem 1.1rem; color: #f1f0ec; background: #222321; border: 1px solid #222321; border-radius: 2px; transition: background 220ms ease, transform 220ms ease; }
        .hero-primary:hover { background: #383d38; transform: translateY(-2px); }
        .hero-primary:focus-visible { outline-offset: 5px; }
        @media (prefers-reduced-motion: reduce) { .hero-primary:hover { transform: none; } }
        @media (max-width: 759px) {
          .hero-copy { top: 6.2rem; width: calc(100% - 2.5rem); max-width: none; transform: none; }
          .eyebrow { font-size: .72rem; }
          h1 { font-size: clamp(2.6rem, 8.8vw, 3.8rem); margin: .75rem 0 .85rem; }
          .role { font-size: 1rem; }
          .role span { font-size: .83rem; }
          .intro { font-size: 1rem; margin-top: .5rem; max-width: 22rem; }
          .hero-actions { margin-top: 1rem; gap: 1.5rem; }
          .hero-actions a { font-size: .85rem; }
        }
        @media (max-height: 700px) and (max-width: 759px) {
          .hero-copy { top: 4.7rem; }
          h1 { font-size: 2.25rem; margin: .65rem 0; }
          .intro { margin-top: 0.5rem; }
          .hero-actions { margin-top: .85rem; }
        }
      `}</style>
    </section>
  );
}
