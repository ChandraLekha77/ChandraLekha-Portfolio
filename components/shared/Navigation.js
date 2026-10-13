"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { profile } from "@/data/profile";

const chapters = [
  { index: "01", label: "Identity", href: "/#identity" },
  { index: "02", label: "Experience", href: "/#technologies" },
  { index: "03", label: "Thinking", href: "/#thinking-transition" },
  { index: "04", label: "Projects", href: "/#evidence" },
  { index: "05", label: "About", href: "/#about" },
  { index: "06", label: "Contact", href: "/#contact" }
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menu = useRef(null);
  const toggle = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const main = document.getElementById("main-content");
    const previousOverflow = document.body.style.overflow;
    main.inert = true;
    document.body.style.overflow = "hidden";
    menu.current.querySelector("a").focus({ preventScroll: true });
    const trapFocus = (event) => {
      if (event.key !== "Tab") return;
      const elements = [toggle.current, ...menu.current.querySelectorAll("a")];
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", trapFocus);
    return () => {
      main.inert = false;
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", trapFocus);
      toggle.current?.focus({ preventScroll: true });
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === "Escape") setMobileMenuOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <header className={`nav-system ${isScrolled ? "is-scrolled" : ""}`}>
      <div className="identity-anchor">
        <Link href="/" className="identity-mark" aria-label={`${profile.name}, home`}>
          <span className="identity-monogram">CLG</span>
          <span className="identity-detail">
            <strong>{profile.name}</strong>
            <small>Data Analyst</small>
          </span>
        </Link>
      </div>

      <nav className="chapter-rail" aria-label="Portfolio chapters">
        {chapters.map((chapter) => (
          <a key={chapter.index} href={chapter.href} className="chapter-link">
            <span>{chapter.index}</span>
            <strong>{chapter.label}</strong>
          </a>
        ))}
      </nav>

      <a href="/resume/Chandra-Lekha-Ganta-Resume.pdf" download="Chandra-Lekha-Ganta-Resume.pdf" className="resume-download" hidden={mobileMenuOpen}>Resume <span aria-hidden="true">↓</span></a>

      <a href={`mailto:${profile.email}`} className="contact-corner" data-cursor="OPEN">
        <span>AVAILABLE FOR ANALYTICS WORK</span>
        <strong>START A CONVERSATION ↗</strong>
      </a>

      <button
        type="button"
        className="mobile-index-toggle"
        ref={toggle}
        aria-controls="mobile-chapter-index"
        aria-label={mobileMenuOpen ? "Close chapter index" : "Open chapter index"}
        aria-expanded={mobileMenuOpen}
        onClick={() => setMobileMenuOpen((open) => !open)}
      >
        <span>{mobileMenuOpen ? "CLOSE" : "INDEX"}</span>
        <strong>{mobileMenuOpen ? "×" : "06"}</strong>
      </button>

      {mobileMenuOpen && (
        <nav className="mobile-index" id="mobile-chapter-index" ref={menu} aria-label="Mobile portfolio chapters">
          <p>PORTFOLIO CHAPTERS</p>
          {chapters.map((chapter) => (
            <a key={chapter.index} href={chapter.href} onClick={() => setMobileMenuOpen(false)}>
              <span>{chapter.index}</span>
              <strong>{chapter.label}</strong>
            </a>
          ))}
        </nav>
      )}

      <style jsx>{`
        .nav-system {
          position: fixed;
          inset: 0;
          z-index: 50;
          pointer-events: none;
        }

        .identity-anchor,
        .resume-download,
        .chapter-rail,
        .contact-corner,
        .mobile-index-toggle,
        .mobile-index {
          pointer-events: auto;
        }

        .identity-anchor {
          position: absolute;
          top: 1.7rem;
          left: clamp(1.25rem, 4.6vw, 4.25rem);
        }

        :global(.identity-mark) {
          display: flex;
          align-items: stretch;
          width: max-content;
          color: var(--text);
          transition: background-color 220ms ease, box-shadow 220ms ease;
        }

        .is-scrolled .identity-anchor {
          background: rgba(241, 240, 236, 0.9);
          box-shadow: none;
          backdrop-filter: blur(12px);
        }

        .identity-monogram {
          display: flex;
          align-items: center;
          width: auto;
          padding-right: 0.8rem;
          border-right: 1px solid var(--line);
          background: transparent;
          color: var(--text);
          font-family: var(--font-clash-display), sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .identity-detail {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.12rem;
          padding: 0 0.82rem;
          background: transparent;
        }

        .identity-detail strong {
          font-family: var(--font-clash-display), sans-serif;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .identity-detail small,
        .contact-corner span {
          font-family: ui-monospace, monospace;
          font-size: 0.72rem;
          color: #383d38;
          letter-spacing: 0.09em;
        }

        .identity-detail small { font-family: var(--font-general-sans), sans-serif; font-size: .88rem; font-weight: 500; letter-spacing: .01em; }
        .resume-download { position: absolute; top: 1.3rem; right: clamp(1rem, 2.25vw, 2.5rem); display: inline-flex; align-items: center; justify-content: space-between; gap: 1.4rem; min-height: 44px; padding: .6rem .85rem; border: 1px solid #737870; background: rgba(241, 240, 236, .94); color: #242824; font-size: .85rem; font-weight: 500; }
        .resume-download:hover { background: #e5e5dd; }
        .resume-download[hidden] { display: none; }

        .chapter-rail {
          position: absolute;
          top: 50%;
          right: clamp(1rem, 2.25vw, 2.5rem);
          display: grid;
          gap: 0;
          transform: translateY(-50%);
          background: transparent;
        }

        .chapter-link {
          display: grid;
          grid-template-columns: 1.8rem 5.3rem;
          align-items: center;
          min-height: 2.9rem;
          color: #454a44;
          border-top: 1px solid var(--line);
          transition: color 180ms ease;
        }

        .chapter-link:last-child { border-bottom: 1px solid var(--line); }
        .chapter-link:hover,
        .chapter-link:focus-visible {
          color: var(--text);
        }

        .chapter-link span {
          text-align: center;
          font-family: ui-monospace, monospace;
          font-size: 0.7rem;
          color: var(--accent);
        }

        .chapter-link strong {
          font-family: var(--font-general-sans), sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.11em;
        }

        .contact-corner {
          position: absolute;
          right: clamp(12rem, 18vw, 18rem);
          top: 1.7rem;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.18rem;
          color: var(--text);
        }

        .contact-corner strong {
          font-family: ui-monospace, monospace;
          font-size: 0.64rem;
          letter-spacing: 0.06em;
          border-bottom: 1px solid var(--accent);
        }

        .is-scrolled .contact-corner {
          padding: .35rem .6rem;
          background: rgba(241, 240, 236, 0.94);
        }

        .mobile-index-toggle,
        .mobile-index { display: none; }

        @media (max-width: 860px) {
          .resume-download { top: 1rem; right: 7.3rem; z-index: 1; gap: .8rem; }
          .chapter-rail,
          .contact-corner,
          .identity-detail { display: none; }

          .identity-anchor { top: 1rem; left: 1rem; }
          .identity-anchor, .mobile-index-toggle { z-index: 1; }
          .identity-monogram { width: 2.75rem; height: 2.75rem; justify-content: center; padding-right: 0; border: 1px solid var(--line); }

          .mobile-index-toggle {
            position: absolute;
            top: 1rem;
            right: 1rem;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            height: 2.75rem;
            padding: 0 0.75rem 0 0.9rem;
            border: 1px solid var(--line);
            background: rgba(241, 240, 236, 0.9);
            color: var(--text);
          }

          .mobile-index-toggle span {
            font-family: ui-monospace, monospace;
            font-size: 0.58rem;
            letter-spacing: 0.11em;
          }

          .mobile-index-toggle strong {
            color: var(--accent);
            font-size: 0.8rem;
          }

          .mobile-index {
            position: fixed;
            inset: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 5.5rem 1.25rem 2rem;
            background: rgba(241, 240, 236, 0.98);
            backdrop-filter: blur(18px);
          }

          .mobile-index p {
            margin-bottom: 1.3rem;
            font-family: ui-monospace, monospace;
            font-size: 0.62rem;
            color: var(--muted);
            letter-spacing: 0.14em;
          }

          .mobile-index a {
            display: grid;
            grid-template-columns: 3rem 1fr;
            align-items: baseline;
            padding: 1rem 0;
            border-top: 1px solid var(--line);
          }

          .mobile-index a span {
            font-family: ui-monospace, monospace;
            font-size: 0.7rem;
            color: var(--accent);
          }

          .mobile-index a strong {
            font-family: var(--font-clash-display), sans-serif;
            font-size: clamp(1.8rem, 10vw, 3.3rem);
            text-transform: uppercase;
          }

          .mobile-index .mobile-contact { border-bottom: 1px solid var(--line); }
        }
      `}</style>
    </header>
  );
}
