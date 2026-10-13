import Link from "next/link";
import { profile } from "@/data/profile";

export const metadata = {
  title: "Privacy Policy — Chandra Lekha Ganta",
  description: "Simple, honest privacy disclosure for Chandra Lekha Ganta's portfolio."
};

export default function PrivacyPage() {
  return (
    <article className="max-w-content py-28" style={{ minHeight: "80vh" }}>
      <header className="mb-12 border-b border-[var(--line)] pb-6">
        <span className="font-mono text-xs text-[var(--accent)] tracking-widest block mb-2">
          LEGAL // TRANSPARENCY
        </span>
        <h1 className="font-display text-4xl text-[var(--text)]">Privacy Policy</h1>
        <p className="font-mono text-xs text-[var(--muted)] mt-2">
          LAST UPDATED: OCTOBER 2026 // ZERO THIRD-PARTY TRACKING
        </p>
      </header>

      <div className="space-y-8 text-[var(--muted)] text-sm leading-relaxed" style={{ maxWidth: "720px" }}>
        <section>
          <h2 className="font-display text-lg text-[var(--text)] mb-2">1. Data Collection & Analytics</h2>
          <p>
            This portfolio website is a static digital showcase. It does not run third-party tracking scripts,
            advertising cookies, fingerprinting pixels, or behavioral analytics software. Your browsing activity
            is not sent to a third-party analytics service by this application.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-[var(--text)] mb-2">2. Direct Communication</h2>
          <p>
            If you choose to contact {profile.name} via email at{" "}
            <a href={`mailto:${profile.email}`} className="text-[var(--accent)] underline hover:text-[var(--text)]">
              {profile.email}
            </a>{" "}
            or connect via LinkedIn, your communication is handled by the email or social service you choose,
            under that service’s own privacy policy. This site has no contact form or message storage.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-[var(--text)] mb-2">3. Hosting Infrastructure</h2>
          <p>
            The site can be deployed to a hosting provider. That provider may process request information,
            such as IP addresses and user agents, for delivery, security, and logging under its own policy.
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
