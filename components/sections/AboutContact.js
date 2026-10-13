import { experience, education, professionalDevelopment } from "@/data/experience";
import { profile } from "@/data/profile";
import ContactSection from "./ContactSection";

export default function AboutContact() {
  const degree = education[0];
  return <>
    <section id="about" className="about-section portfolio-section">
      <div className="editorial-container">
        <header className="about-intro"><span className="eyebrow-label">05 / THE PERSON & THE PRACTICE</span>
          <h2>A curious mind.<br />A careful practice.</h2>
          <p>I’m Chandra Lekha. I turn complex data into reporting people can trust—from audience performance and public safety to retail and operations.</p>
          <div className="about-credentials"><span>{profile.stats[0].value} years of experience</span><span>MS · Business Analytics</span><span>Woodridge, Illinois</span></div>
        </header>
        <div className="career-heading"><span className="eyebrow-label">THE EXPERIENCE</span><span>India → United States</span></div>
        <div className="experience-timeline" aria-label="Work experience">
          {experience.map((job, index) => <article className="experience-entry" key={job.company}>
            <span className="career-number" aria-hidden="true">0{index + 1}</span>
            <div className="experience-copy"><div className="career-meta"><span className="eyebrow-label">{job.company}</span><span className="experience-period">{job.period}</span></div>
              <h3>{job.role}</h3><span className="career-location">{job.location}{job.current && " / CURRENT"}</span><p>{job.summary}</p>
              {job.tenure && <div className="job-tenure"><strong>{job.tenure.value}</strong><div><span>{job.tenure.label}</span><p>{job.tenure.detail}</p></div></div>}
              <details><summary>Explore the work <span aria-hidden="true">+</span></summary><ul>{job.points.map((point) => <li key={point}>{point}</li>)}</ul></details>
            </div>
          </article>)}
        </div>
        <div className="education-line"><div><span className="eyebrow-label">EDUCATION / {degree.period}</span><h3>{degree.degree}</h3><p>{degree.institution} · {degree.school}</p></div><div className="degree-gpa"><strong>{degree.gpa}</strong><span>GPA</span></div></div>
        <div className="development-line"><span className="eyebrow-label">PROFESSIONAL DEVELOPMENT</span><ul>{professionalDevelopment.map((item) => <li key={item.name}><strong>{item.name}</strong><span>{item.provider}</span></li>)}</ul></div>
      </div>
    </section>
    <ContactSection />
  </>;
}
