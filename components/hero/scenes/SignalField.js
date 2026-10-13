"use client";

const paths = [
  "M-120 210 C210 70 410 430 690 330 S1090 120 1560 260",
  "M-100 315 C250 150 390 520 720 390 S1120 220 1540 350",
  "M-80 430 C220 280 480 590 760 455 S1130 350 1520 440",
  "M-110 560 C240 410 460 650 740 535 S1110 480 1540 535",
  "M-90 680 C250 560 470 720 790 610 S1180 590 1540 630",
  "M-100 790 C270 710 470 790 800 705 S1180 710 1540 720"
];

const records = Array.from({ length: 20 }, (_, index) => ({
  path: index % paths.length,
  duration: 10 + (index % 6) * 1.35,
  delay: -(index * 1.47),
  radius: index % 5 === 0 ? 3.2 : 2
}));

export default function SignalField() {
  return (
    <div className="signal-field" aria-hidden="true">
      <svg viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="signalFade" x1="0" x2="1">
            <stop offset="0" stopColor="#68746f" stopOpacity="0" />
            <stop offset="0.34" stopColor="#68746f" stopOpacity="0.22" />
            <stop offset="0.68" stopColor="#4f5450" stopOpacity="0.34" />
            <stop offset="1" stopColor="#4f5450" stopOpacity="0" />
          </linearGradient>
          <filter id="recordSoftness" x="-200%" y="-200%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="flow-lines">
          {paths.map((path, index) => (
            <path key={path} id={`signal-path-${index}`} d={path} />
          ))}
        </g>

        <path
          className="resolved-line"
          d="M735 390 C900 330 1090 305 1540 350"
        />

        <g className="convergence-mark">
          <circle cx="744" cy="456" r="56" />
          <circle cx="744" cy="456" r="20" />
          <line x1="744" y1="374" x2="744" y2="538" />
          <line x1="662" y1="456" x2="826" y2="456" />
        </g>

        <g className="moving-records" filter="url(#recordSoftness)">
          {records.map((record, index) => (
            <circle key={index} r={record.radius}>
              <animateMotion
                dur={`${record.duration}s`}
                begin={`${record.delay}s`}
                repeatCount="indefinite"
              >
                <mpath href={`#signal-path-${record.path}`} />
              </animateMotion>
            </circle>
          ))}
        </g>
      </svg>

      <style jsx>{`
        .signal-field {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: var(--bg-deep);
        }

        svg { width: 100%; height: 100%; display: block; }

        .flow-lines path {
          fill: none;
          stroke: url(#signalFade);
          stroke-width: 1;
          stroke-dasharray: 3 15;
          animation: lineTravel 18s linear infinite;
        }

        .flow-lines path:nth-child(2n) {
          animation-duration: 24s;
          opacity: 0.74;
        }

        .resolved-line {
          fill: none;
          stroke: #4f5450;
          stroke-width: 1.2;
          stroke-dasharray: 120 620;
          opacity: 0.28;
          animation: resolvedTravel 12s linear infinite;
        }

        .moving-records circle {
          fill: #4f5450;
          opacity: 0.55;
        }

        .moving-records circle:nth-child(4n) {
          fill: #9aa09c;
          opacity: 0.8;
        }

        .convergence-mark {
          fill: none;
          stroke: #68746f;
          stroke-width: 1;
          opacity: 0.18;
          transform-origin: 744px 456px;
          animation: breathe 7s ease-in-out infinite alternate;
        }

        @keyframes lineTravel {
          to { stroke-dashoffset: -360; }
        }

        @keyframes resolvedTravel {
          to { stroke-dashoffset: -740; }
        }

        @keyframes breathe {
          from { transform: scale(0.96); opacity: 0.12; }
          to { transform: scale(1.04); opacity: 0.25; }
        }

        @media (prefers-reduced-motion: reduce) {
          .flow-lines path,
          .resolved-line,
          .convergence-mark { animation: none; }
          .moving-records { display: none; }
        }

        @media (max-width: 639px) {
          .signal-field { opacity: 0.58; }
          svg { transform: translateX(12%) scale(1.08); }
        }
      `}</style>
    </div>
  );
}
