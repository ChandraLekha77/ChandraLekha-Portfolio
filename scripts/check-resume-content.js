const assert = require("node:assert/strict");
const { readFileSync, readdirSync } = require("node:fs");
const { resolve, extname } = require("node:path");

async function data(name) {
  return import(`data:text/javascript;base64,${readFileSync(resolve(__dirname, `../data/${name}.js`)).toString("base64")}`);
}
async function check() {
  const { profile, CONTENT_TO_REPLACE } = await data("profile");
  const { projects } = await data("projects");
  const { experience, education, professionalDevelopment } = await data("experience");
  const { skillCategories } = await data("skills");
  const { workflow } = await data("workflow");
  assert.equal(profile.github, "https://github.com/ChandraLekha77", "Verified GitHub URL");
  assert.equal(projects.length, 2);
  assert.deepEqual(projects[0].results.map((item) => item.value), ["4", "Millions", "3"]);
  assert.deepEqual(projects[1].results.map((item) => item.value), ["50", "30%"]);
  assert.equal(experience.length, 3);
  assert.equal(experience[0].tenure.value, "2026");
  assert.equal(experience[0].tenure.label, "Since May 2026");
  assert.equal(experience[2].tenure.value, "3½");
  assert.equal(experience[1].tenure, undefined, "Employment tenure is not attributed to the internship");
  assert.equal(experience[1].role, "Research & Data Analyst Intern");
  assert.equal(experience[1].period, "Jun 2025 – May 2026");
  assert.equal(experience[2].role, "Operations Reporting Analyst");
  assert.equal(education.length, 1);
  assert.equal(education[0].gpa, "4.0");
  assert.equal(professionalDevelopment.length, 3);
  assert.equal(skillCategories.length, 8);
  assert.equal(workflow.length, 5);
  const content = JSON.stringify({ profile, projects, experience, education, professionalDevelopment, workflow });
  for (const stale of ["11M", "$150M", "32%", "5+", "Andhra", "Lead Data Analyst", "petabyte"]) assert.ok(!content.includes(stale), `Unsupported older content removed: ${stale}`);
  assert.equal(CONTENT_TO_REPLACE.length, 4);
  const root = resolve(__dirname, "..");
  function audit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) audit(path);
      else assert.ok(![".jsx", ".ts", ".tsx"].includes(extname(path)), `JS-only source: ${path}`);
    }
  }
  for (const folder of ["app", "components", "data", "lib", "scripts"]) audit(resolve(root, folder));
  const { dependencies } = JSON.parse(readFileSync(resolve(root, "package.json")));
  for (const version of Object.values(dependencies)) assert.match(version, /^\d+\.\d+\.\d+$/, "Exact dependency versions");
  console.log("Resume data checks passed: source-backed metrics, roles, dates, education, skills, missing-link handling, JS-only sources, exact versions.");
}
check().catch((error) => { console.error(error); process.exitCode = 1; });
