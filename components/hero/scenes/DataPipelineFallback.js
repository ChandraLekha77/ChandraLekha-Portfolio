"use client";

import { useEffect, useState } from "react";

export default function DataPipelineFallback() {
  const [dots, setDots] = useState([]);

  useEffect(() => {
    // Generate static/lightweight dots for SVG fallback
    const items = [];
    for (let i = 0; i < 30; i++) {
      items.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 80 + 10,
        r: Math.random() * 2 + 1.5,
        delay: Math.random() * 4
      });
    }
    setDots(items);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#d9d5cc",
        pointerEvents: "none"
      }}
    >
      <svg
        style={{ width: "100%", height: "100%" }}
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="gateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#466A78" stopOpacity="0.42" />
            <stop offset="50%" stopColor="#718990" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#9CA5A3" stopOpacity="0.34" />
          </linearGradient>
          <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8E3B46" stopOpacity="0.12" />
            <stop offset="48%" stopColor="#8E3B46" stopOpacity="0.42" />
            <stop offset="52%" stopColor="#466A78" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#466A78" stopOpacity="0.1" />
          </linearGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <path d="M0 540 L500 330 L1000 540" fill="#CFCAC0" opacity="0.72" />
        <path d="M0 166 C205 38 350 470 500 300 S780 112 1000 196" fill="none" stroke="url(#flowGrad)" strokeWidth="2" />
        <path d="M0 244 C230 104 340 408 500 318 S770 208 1000 252" fill="none" stroke="url(#flowGrad)" strokeWidth="1" opacity="0.65" />
        <path d="M0 338 C210 216 350 380 500 336 S770 328 1000 326" fill="none" stroke="url(#flowGrad)" strokeWidth="1" opacity="0.46" />

        {/* Reconciliation Gate 1: Ingestion */}
        <rect x="250" y="80" width="12" height="440" fill="url(#gateGrad)" stroke="#718990" strokeWidth="1" />
        <text x="256" y="70" fill="#6F716F" fontSize="10" fontFamily="monospace" textAnchor="middle">
          GATE_01 // INGEST
        </text>

        {/* Reconciliation Gate 2: Parity Check */}
        <rect x="500" y="80" width="16" height="440" fill="url(#gateGrad)" stroke="#8E3B46" strokeWidth="1.5" filter="url(#softGlow)" />
        <text x="508" y="70" fill="#8E3B46" fontSize="10" fontFamily="monospace" textAnchor="middle">
          GATE_02 // RECONCILE
        </text>

        {/* Reconciliation Gate 3: Dimensional Warehouse */}
        <rect x="750" y="80" width="12" height="440" fill="url(#gateGrad)" stroke="#466A78" strokeWidth="1" />
        <text x="756" y="70" fill="#6F716F" fontSize="10" fontFamily="monospace" textAnchor="middle">
          GATE_03 // DIM_STORE
        </text>

        {/* Floating Telemetry Dots */}
        {dots.map((d) => (
          <circle
            key={d.id}
            cx={`${d.x}%`}
            cy={`${d.y}%`}
            r={d.r}
            fill={d.x < 50 ? "#8E3B46" : "#466A78"}
            opacity="0.6"
            className="fallback-pulse"
            style={{
              animationDelay: `${d.delay}s`
            }}
          />
        ))}
      </svg>

      <style jsx>{`
        .fallback-pulse {
          animation: pulseAnim 3s ease-in-out infinite alternate;
        }
        @keyframes pulseAnim {
          from {
            opacity: 0.2;
            transform: translateY(0px);
          }
          to {
            opacity: 0.8;
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
}
