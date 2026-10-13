"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { profile } from "@/data/profile";

const letters = [
  ["01111", "11000", "10000", "10000", "10000", "11000", "01111"],
  ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  ["01110", "11001", "10000", "10111", "10001", "11001", "01111"]
];
const dots = letters.flatMap((letter, letterIndex) => letter.flatMap((row, y) => [...row].flatMap((cell, x) => cell === "1" ? [{ x: 34 + (letterIndex * 6 + x) * 17, y: 26 + y * 17 }] : [])));

export default function Loader() {
  const pathname = usePathname();
  const [phase, setPhase] = useState("preparing");
  const skipAction = useRef(null);
  const overlayRef = useRef(null);
  const skipRef = useRef(null);
  const completed = useRef(false);

  useEffect(() => {
    if (pathname !== "/" || completed.current) return;
    const overlay = overlayRef.current;
    if (getComputedStyle(overlay).visibility === "hidden") {
      completed.current = true;
      setPhase("gone");
      return;
    }
    const shell = document.getElementById("portfolio-content");
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const previous = { inert: shell.inert, aria: shell.getAttribute("aria-hidden"), body: document.body.style.overflow, html: root.style.overflow };
    shell.inert = true;
    shell.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "hidden";
    root.style.overflow = "hidden";
    overlayRef.current?.focus({ preventScroll: true });
    const started = performance.now();
    let fontsReady = false, ending = false, disposed = false, scheduled = false;
    let minimumTimer, exitTimer, removeTimer, safetyTimer;

    function restore() {
      shell.inert = previous.inert;
      if (previous.aria === null) shell.removeAttribute("aria-hidden");
      else shell.setAttribute("aria-hidden", previous.aria);
      document.body.style.overflow = previous.body;
      root.style.overflow = previous.html;
      window.dispatchEvent(new Event("portfolio:opening-complete"));
    }
    function cleanup() {
      disposed = true;
      [minimumTimer, exitTimer, removeTimer, safetyTimer].forEach(clearTimeout);
      window.removeEventListener("portfolio:hero-ready", attempt);
      overlay.removeEventListener("animationend", safetyExit);
      reduced.removeEventListener("change", preferenceChanged);
      skipAction.current = null;
      restore();
    }
    function complete() {
      if (disposed) return;
      const transferFocus = overlay.contains(document.activeElement);
      completed.current = true;
      cleanup();
      if (transferFocus) document.getElementById("main-content")?.focus({ preventScroll: true });
      setPhase("gone");
    }
    function safetyExit(event) { if (event.animationName === "opening-fail-open") complete(); }
    function finish(skip = false) {
      if (ending || disposed) return;
      ending = true;
      clearTimeout(minimumTimer);
      clearTimeout(safetyTimer);
      setPhase("ready");
      exitTimer = setTimeout(() => {
        if (disposed) return;
        setPhase("leaving");
        removeTimer = setTimeout(complete, reduced.matches ? 0 : 700);
      }, skip || reduced.matches ? 0 : 120);
    }
    function attempt() {
      if (!fontsReady || !document.querySelector('[data-hero-ready="true"]') || scheduled || disposed) return;
      scheduled = true;
      minimumTimer = setTimeout(() => finish(), reduced.matches ? 0 : Math.max(0, 900 - (performance.now() - started)));
    }
    function preferenceChanged() {
      if (!reduced.matches) return;
      if (ending) complete();
      else { clearTimeout(minimumTimer); scheduled = false; attempt(); }
    }
    skipAction.current = () => finish(true);
    window.addEventListener("portfolio:hero-ready", attempt);
    overlay.addEventListener("animationend", safetyExit);
    reduced.addEventListener("change", preferenceChanged);
    // A slow or unavailable renderer must never trap visitors behind the intro.
    safetyTimer = setTimeout(() => finish(true), 5000);
    Promise.resolve(document.fonts?.ready).then(() => { if (!disposed) { fontsReady = true; attempt(); } });
    return cleanup;
  }, [pathname]);

  if (pathname !== "/" || phase === "gone") return null;
  return <>
    {/* The dev CSS bundle may also depend on JavaScript; keep this escape in server HTML. */}
    <style>{`@keyframes opening-fail-open { from, to { visibility: hidden; pointer-events: none; } }`}</style>
    <aside ref={overlayRef} className="portfolio-loader" data-phase={phase} data-native-cursor role="dialog" tabIndex={-1} aria-modal="true" aria-label="Portfolio introduction"
      style={{ position: "fixed", inset: 0, background: "#f1f0ec", zIndex: 12000, animation: "opening-fail-open 1ms 8s forwards" }}
      onKeyDown={(event) => {
        if (event.key === "Escape") skipAction.current?.();
        if (event.key === "Tab") { event.preventDefault(); skipRef.current?.focus(); }
      }}>
      <header className="loader-header"><span>CLG <i>/</i> DATA ANALYST</span><span>AN INDEPENDENT PERSPECTIVE</span></header>
      <div className="loader-center">
        <svg className="loader-signature" viewBox="0 0 340 156" aria-hidden="true" focusable="false">
          {dots.map((dot, index) => <circle key={index} cx={dot.x} cy={dot.y} r="2.6" className={index % 17 === 0 ? "signature-accent" : ""}
            style={{ "--from-x": `${(index % 7 - 3) * 22}px`, "--from-y": `${(index * 3 % 11 - 5) * 15}px`, "--delay": `${index % 12 * 25}ms` }} />)}
        </svg>
        <span className="loader-eyebrow">A PORTFOLIO BY {profile.name.toUpperCase()}</span>
        <h2>Connecting<br />the dots<span>.</span></h2>
        <div className="loader-signal" aria-hidden="true"><span /></div>
        <p role="status" aria-live="polite">{phase === "preparing" ? "Preparing your view" : phase === "ready" ? "Ready to explore" : "Welcome to my portfolio"}</p>
      </div>
      <footer className="loader-footer"><span>FROM DATA TO CLARITY</span><button ref={skipRef} type="button" onClick={() => skipAction.current?.()}>Skip intro <span aria-hidden="true">↗</span></button></footer>
    </aside>
    <noscript><style>{`.portfolio-loader { display: none !important; }`}</style></noscript>
  </>;
}
