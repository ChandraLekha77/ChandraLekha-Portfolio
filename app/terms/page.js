import Link from "next/link";
import { profile } from "@/data/profile";

export const metadata = {
  title: "Terms of Use — Chandra Lekha Ganta",
  description: "Terms and intellectual property notices for Chandra Lekha Ganta's portfolio."
};

export default function TermsPage() {
  return (
    <article className="max-w-content py-28" style={{ minHeight: "80vh" }}>
      <header className="mb-12 border-b border-[var(--line)] pb-6">
        <span className="font-mono text-xs text-[var(--accent)] tracking-widest block mb-2">
          LEGAL // TERMS
        </span>
        <h1 className="font-display text-4xl text-[var(--text)]">Terms of Use</h1>
        <p className="font-mono text-xs text-[var(--muted)] mt-2">
          LAST UPDATED: OCTOBER 2026 // PROFESSIONAL PORTFOLIO
        </p>
      </header>

      <div className="space-y-8 text-[var(--muted)] text-sm leading-relaxed" style={{ maxWidth: "720px" }}>
        <section>
          <h2 className="font-display text-lg text-[var(--text)] mb-2">1. Authentic Portfolio Presentation</h2>
          <p>
            Professional experience, education, development, and project contributions are presented from
            the resume supplied by {profile.name}. Diagrams labeled conceptual architecture are illustrative:
            they are not verified production architectures, actual dashboards, or live project applications.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-[var(--text)] mb-2">2. Intellectual Property</h2>
          <p>
            The custom design systems, visualizations, code demonstrations, and curated presentation elements
            are the intellectual property of {profile.name}. Third-party trademarks, company names, and logos
            referenced belong to their respective copyright holders and are cited strictly for factual employment
            and historical case-study attribution.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-[var(--text)] mb-2">3. Disclaimers</h2>
          <p>
            This website is provided on an &quot;as-is&quot; basis for informational, professional recruitment, and portfolio
            demonstration purposes without warranties of any kind.
          </p>
        </section>

        <div className="pt-8 border-t border-[var(--line)]">
          <Link
            href="/"
            className="font-mono text-xs text-[var(--accent)] hover:text-[var(--text)] inline-flex items-center gap-2"
          >
            ← RETURN TO PORTFOLIO
          </Link>
        </div>
      </div>
    </article>
  );
}
