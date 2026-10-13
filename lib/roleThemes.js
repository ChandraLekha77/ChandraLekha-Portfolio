export const roleTheme = {
  role: "Data Analyst",
  specialization: "Data Quality, Pipeline Reconciliation & Cloud Analytics",
  domain: "Enterprise Business Intelligence & Operational Telemetry",
  
  palette: {
    bg: "#F1F0EC",          // Warm neutral editorial foundation
    surface: "#F8F7F3",     // Paper-white structural plane
    elevated: "#FFFEFA",    // Elevated neutral surface
    line: "#C9C6BE",        // Quiet graphite rule
    system: "#68746F",      // Muted system state
    accent: "#222321",      // Monochrome focus state
    muted: "#70736F",       // Secondary labels
    text: "#171817",        // Ink-black primary text
    success: "#68746F",     // Reconciled verification state
    warning: "#6B625A"      // Discrepancy / QA flag indicator
  },

  visualMetaphor: {
    tagline: "Unstructured Data → Verification Gates → High-Fidelity Signal",
    description: "Data records enter as dispersed raw telemetry particles, stream through deterministic reconciliation checks, and crystallize into verified dimensional vectors.",
    flowStages: [
      { id: "raw", label: "Raw Ingestion", type: "streaming" },
      { id: "staging", label: "Staging & CTEs", type: "processing" },
      { id: "validation", label: "Reconciliation Gate", type: "verification" },
      { id: "warehouse", label: "Warehoused Signal", type: "storage" },
      { id: "intelligence", label: "Decision Metrics", type: "consumption" }
    ]
  },

  typography: {
    display: "Epilogue, -apple-system, BlinkMacSystemFont, sans-serif",
    body: "General Sans, -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    mood: "Architectural, authoritative, mathematically structured, restrained editorial weight"
  },

  particleBehavior: {
    countDesktop: 65,
    countMobile: 25,
    speed: 0.45,
    baseColor: "#4F5450",
    reconciledColor: "#9AA09C",
    connectionDistance: 130,
    connectionColor: "rgba(79, 84, 80, 0.2)",
    pointerRepulsion: 90,
    meaning: "Unverified records aligning along integrity planes into structured metrics"
  },

  nodeVocabulary: {
    source: "Raw Telemetry / API Payload",
    pipeline: "ETL / Normalization Pipeline",
    reconciliation: "Automated UAT & Parity Check",
    destination: "Analytical Warehouse / Power BI DAX"
  },

  motionLanguage: {
    transitionDuration: 0.65,
    ease: [0.16, 1, 0.3, 1], // Cinematic cubic-bezier
    staggerDelay: 0.08
  }
};
