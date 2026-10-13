"use client";

import { useEffect, useRef } from "react";
import { profile } from "@/data/profile";

function CurvedUnderline() {
  return <svg className="contact-hover-curve" viewBox="0 0 240 18" preserveAspectRatio="none" aria-hidden="true"><path d="M2 12 Q120 -3 238 10" pathLength="100" /></svg>;
}

export default function ContactSection() {
  const section = useRef(null);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const element = section.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.dataset.arrived = "true";
        observer.disconnect();
      }
    }, { threshold: .2 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <section id="contact" className="contact-section portfolio-section" ref={section}>
    <div className="editorial-container">
      <span className="eyebrow-label">06 / CONNECT THE NEXT DOT</span>
      <div className="closing-signal" aria-hidden="true"><i /><i /><i /><span /></div>
      <div className="contact-copy">
          <h2><span className="contact-title-line" tabIndex={0}>Good questions.<CurvedUnderline /></span><br /><span className="contact-title-line" tabIndex={0}>Clearer possibilities.<CurvedUnderline /></span></h2>
          <p>Let’s talk about data, reporting, and what your team needs to understand next.</p>
          <a className="contact-email" href={`mailto:${profile.email}`}><span className="contact-email-label">{profile.email}</span><span className="contact-email-arrow" aria-hidden="true">↗</span><CurvedUnderline /></a>
      </div>
      <div className="contact-bottom"><span>{profile.location} · Open to relocation</span><div><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>{profile.github && <a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>}<a href="tel:+19362061480">{profile.phone}</a></div></div>
    </div>
  </section>;
}
