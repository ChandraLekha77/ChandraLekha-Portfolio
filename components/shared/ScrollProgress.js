"use client";

import { useState, useEffect } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) {
        setProgress(0);
        return;
      }
      const currentScroll = window.scrollY;
      const pct = Math.min(100, Math.max(0, Math.round((currentScroll / totalScroll) * 100)));
      setProgress(pct);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Hairline Edge Indicator */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: `${progress}%`,
          height: "1px",
          backgroundColor: "var(--accent)",
          zIndex: 100,
          transition: "width 0.1s linear"
        }}
      />

      {/* Discrete Corner Telemetry Percentage */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 40,
          padding: "0.25rem 0.5rem",
          backgroundColor: "rgba(244, 241, 234, 0.88)",
          border: "1px solid var(--line)",
          backdropFilter: "blur(6px)",
          color: "var(--muted)",
          fontSize: "0.65rem",
          pointerEvents: "none"
        }}
        className="font-mono"
      >
        <span>SYS_SCROLL: {String(progress).padStart(3, "0")}%</span>
      </div>
    </>
  );
}
