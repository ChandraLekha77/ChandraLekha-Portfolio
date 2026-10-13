"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const shapeRef = useRef(null);
  const seamRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const root = document.documentElement;
    const preferences = [window.matchMedia("(hover: hover) and (pointer: fine)"), window.matchMedia("(prefers-reduced-motion: reduce)"), window.matchMedia("(forced-colors: active)")];
    const nativeTargets = "input, textarea, select, [contenteditable]:not([contenteditable='false']), [data-native-cursor], [disabled], [aria-disabled='true']";
    const target = { x: 0, y: 0 };
    const tail = { x: 0, y: 0 };
    let frame = 0, lastTime = 0, visible = false, pressed = false, interactive = false, width = 7;

    function enabled() { return preferences[0].matches && !preferences[1].matches && !preferences[2].matches; }
    function hide() {
      visible = false;
      pressed = false;
      cursor.dataset.visible = "false";
      cursor.dataset.pressed = "false";
      delete root.dataset.fluidCursor;
      cancelAnimationFrame(frame);
      frame = 0;
    }
    function paint(now) {
      const dt = Math.min(Math.max((now - lastTime) / 1000, .001), .05);
      lastTime = now;
      const ease = 1 - Math.exp(-dt * 15);
      tail.x += (target.x - tail.x) * ease;
      tail.y += (target.y - tail.y) * ease;
      const desiredWidth = (interactive ? 10 : 7) * (pressed ? .72 : 1);
      width += (desiredWidth - width) * ease;
      const distance = Math.hypot(tail.x - target.x, tail.y - target.y);
      const limit = Math.min(1, 24 / Math.max(1, distance));
      const x = (tail.x - target.x) * limit;
      const y = Math.max(-12, (tail.y - target.y) * limit);
      // The tip stays exact; only the soft body trails, so clicking never lags.
      cursor.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      shapeRef.current.setAttribute("d", `M0 0 C-1 9 ${x * .6 - width} ${y * .6 + 16} ${x - width} ${y + 24} C${x - 2} ${y + 31} ${x + width + 1} ${y + 20} ${x + width + 2} ${y + 14} C${x * .5 + width} ${y * .5 + 7} 4 3 0 0Z`);
      seamRef.current.setAttribute("d", `M1 5 Q${x * .65 + 3} ${y * .65 + 15} ${x - 2} ${y + 24}`);
      return distance > .04 || Math.abs(width - desiredWidth) > .01;
    }
    function tick(now) {
      frame = 0;
      if (visible && paint(now)) frame = requestAnimationFrame(tick);
    }
    function start() {
      if (!frame && visible) { lastTime = performance.now(); frame = requestAnimationFrame(tick); }
    }
    function inspect(element) {
      if (!(element instanceof Element) || element.closest(nativeTargets)) { hide(); return false; }
      interactive = Boolean(element.closest("a, button, summary, [role='button'], [data-cursor]"));
      cursor.dataset.mode = interactive ? "link" : "default";
      return true;
    }
    function move(event) {
      if (event.pointerType !== "mouse" || !enabled() || document.hidden) { hide(); return; }
      if (!inspect(event.target)) return;
      target.x = event.clientX;
      target.y = event.clientY;
      cursor.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      if (!visible) {
        tail.x = target.x; tail.y = target.y;
        visible = true;
        paint(performance.now());
        cursor.dataset.visible = "true";
        root.dataset.fluidCursor = "true";
      }
      start();
    }
    function press(event) {
      if (event.pointerType !== "mouse" || !visible) return;
      pressed = event.type === "pointerdown";
      cursor.dataset.pressed = String(pressed);
      start();
    }
    function scroll() {
      if (visible && inspect(document.elementFromPoint(target.x, target.y))) start();
    }
    function keyboard(event) { if (event.key === "Tab" || event.key === "Escape") hide(); }
    function preferenceChanged() { if (!enabled()) hide(); }
    function visibilityChanged() { if (document.hidden) hide(); }

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", move, { passive: true });
    window.addEventListener("pointerdown", press, { passive: true });
    window.addEventListener("pointerup", press, { passive: true });
    window.addEventListener("pointercancel", hide);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("pointerleave", hide);
    document.addEventListener("keydown", keyboard);
    document.addEventListener("visibilitychange", visibilityChanged);
    preferences.forEach((query) => query.addEventListener("change", preferenceChanged));
    return () => {
      hide();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", move);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", press);
      window.removeEventListener("pointercancel", hide);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("pointerleave", hide);
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("visibilitychange", visibilityChanged);
      preferences.forEach((query) => query.removeEventListener("change", preferenceChanged));
    };
  }, []);

  return <div ref={cursorRef} className="fluid-cursor" data-visible="false" aria-hidden="true">
    <svg width="120" height="120" viewBox="-60 -60 120 120" focusable="false">
      <path ref={shapeRef} className="cursor-ink" d="M0 0C-1 9-7 16-7 24C-2 31 8 20 9 14C7 7 4 3 0 0Z" />
      <path ref={seamRef} className="cursor-seam" d="M1 5Q3 15-2 24" />
    </svg>
    <style jsx global>{`
      .fluid-cursor { position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 11000; pointer-events: none; visibility: hidden; will-change: transform; }
      .fluid-cursor[data-visible="true"] { visibility: visible; }
      .fluid-cursor svg { position: absolute; left: -60px; top: -60px; overflow: visible; pointer-events: none; filter: drop-shadow(0 2px 2px rgba(25, 30, 26, .15)); }
      .cursor-ink { fill: var(--text); stroke: var(--bg); stroke-width: 1; stroke-linejoin: round; }
      .cursor-seam { fill: none; stroke: var(--accent); stroke-width: 1; stroke-linecap: round; }
      @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none) {
        html[data-fluid-cursor="true"], html[data-fluid-cursor="true"] * { cursor: none !important; }
      }
      @media (prefers-reduced-motion: reduce), (forced-colors: active), (pointer: coarse), (hover: none) {
        .fluid-cursor { display: none; }
      }
    `}</style>
  </div>;
}
