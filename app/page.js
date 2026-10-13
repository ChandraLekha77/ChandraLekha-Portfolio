import ParticleJourney, { TechnologyDetails } from "@/components/hero/ParticleJourney";
import SignatureTransition from "@/components/hero/SignatureTransition";
import ProjectsSection from "@/components/sections/ProjectsSection";
import AboutContact from "@/components/sections/AboutContact";
import { profile } from "@/data/profile";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* 01 // IDENTITY / HERO */}
      <ParticleJourney />
      <TechnologyDetails />

      {/* SIGNATURE TRANSITION: HERO -> THINKING (RECONCILIATION VECTOR) */}
      <SignatureTransition />

      <ProjectsSection />
      <AboutContact />

      {/* Editorial Footer */}
      <footer className="relative z-10 py-12 bg-[var(--bg)] border-t border-[var(--line)]">
        <div className="max-w-content flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="font-mono text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} {profile.name} // DATA ANALYTICS & RECONCILIATION
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="font-mono text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              PRIVACY
            </Link>
            <Link
              href="/terms"
              className="font-mono text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              TERMS
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
