"use client";

import { profile } from "@/data/profile";

export default function KineticName() {
  const words = profile.name.toUpperCase().split(" "); // ["CHANDRA", "LEKHA", "GANTA"]

  return (
    <div className="relative select-none">
      <h1
        className="kinetic-name font-display font-extrabold tracking-tight uppercase"
        style={{
          fontSize: "clamp(3.2rem, 8.4vw, 7.8rem)",
          lineHeight: 0.86,
          letterSpacing: "-0.035em",
          color: "var(--text)",
          margin: 0,
          fontWeight: 600
        }}
      >
        <span className="name-line name-primary">
          <span
            className="kinetic-word-reveal"
            style={{
              display: "inline-block",
              animation: "nameReveal 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.08s backwards"
            }}
          >
            {words[0]}
          </span>
        </span>

        <span className="name-line name-secondary">
          <span
            className="kinetic-word-reveal secondary-word"
            style={{
              animation: "nameReveal 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.14s backwards"
            }}
          >
            {words[1]}
          </span>
          <span
            className="kinetic-word-reveal accent-word"
            style={{
              color: "var(--text-dim)",
              animation: "nameReveal 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.2s backwards"
            }}
          >
            {words[2]}
          </span>
        </span>
      </h1>

      <style jsx>{`
        .kinetic-name {
          display: grid;
          width: max-content;
          max-width: 100%;
        }

        .name-line {
          display: flex;
          overflow: hidden;
          white-space: nowrap;
        }

        .kinetic-word-reveal { display: inline-block; }

        .name-secondary {
          gap: 0.13em;
          margin-top: 0.2em;
          margin-left: 0.48em;
          font-size: 0.6em;
          line-height: 0.9;
        }

        .secondary-word {
          color: var(--text);
        }

        @keyframes nameReveal {
          from {
            transform: translateY(12px);
            opacity: 0;
          }
          to {
            transform: translateY(0%);
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .kinetic-word-reveal {
            animation: none !important;
            transform: none !important;
          }
        }

        @media (max-width: 639px) {
          .kinetic-name { font-size: clamp(3rem, 16vw, 4.8rem) !important; }
          .name-secondary {
            margin-left: 0;
            font-size: 0.54em;
            gap: 0.14em;
          }
        }
      `}</style>
    </div>
  );
}
