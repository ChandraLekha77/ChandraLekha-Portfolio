export const experience = [
  {
    role: "Data Analyst", company: "Holiday Channel", location: "Chicago, IL",
    period: "May 2026 – Present", current: true,
    tenure: { value: "2026", label: "Since May 2026", detail: "Power BI reporting, consistent KPIs, and S3 / Athena reconciliation." },
    summary: "Audience-performance reporting, consistent KPI definitions, and cloud data reconciliation.",
    points: [
      "Built audience-performance reporting using Amazon Redshift, optimizing SQL joins, CTEs, and window functions to support programming and advertising inventory reviews.",
      "Validated reporting data across Amazon S3 and Amazon Athena using Python, Pandas, and NumPy to reconcile source-to-target results and improve data accuracy.",
      "Developed Power BI dashboards and DAX measures to resolve KPI discrepancies, standardize reporting logic, and provide consistent performance metrics.",
      "Integrated REST API data using AWS Lambda, AWS Glue, and Amazon S3, transforming JSON and CSV inputs into analysis-ready datasets for reporting.",
      "Conducted QA, UAT, data reconciliation, and root-cause analysis, using AI-assisted analysis and documentation to investigate reporting issues and data-quality gaps.",
      "Gathered business requirements and created BRDs and FRDs, collaborating with Agile teams while using SQL, Python, Excel, and Git to support reporting validation, ETL workflows, and issue resolution."
    ]
  },
  {
    role: "Research & Data Analyst Intern", company: "Cook County Sheriff’s Office", location: "Chicago, IL",
    period: "Jun 2025 – May 2026", current: false,
    summary: "From unstructured incident notes to validated public-safety reporting.",
    points: [
      "Used SQL and Azure Synapse Analytics to clean, validate, and normalize 2,500+ incident records across multiple law enforcement sources, improving data consistency for analysis and reporting.",
      "Built Azure Data Factory and SSIS workflows to integrate, transform, validate, and prepare investigative data from multiple source systems for analytical reporting.",
      "Developed Tableau dashboards and Excel reports covering 500+ weekly organized retail crime data points, highlighting crime trends, case activity, hotspots, and key operational indicators.",
      "Conducted UAT, data validation, reconciliation, and quality checks, verifying data accuracy, completeness, functionality, and alignment with business requirements.",
      "Converted unstructured case notes and incident logs into structured datasets, created BRDs/FRDs, and used SQL to analyze incident patterns, dispositions, and conviction trends.",
      "Managed 200+ State ID applications and 300 active cases, performing data cleaning, validation, reconciliation, weekly performance reporting, KPI tracking, and trend analysis to identify missing information and program process gaps."
    ]
  },
  {
    role: "Operations Reporting Analyst", company: "ViHawk Tech Solutions", location: "Hyderabad, India",
    period: "May 2020 – Nov 2023", current: false,
    tenure: { value: "3½", label: "Years at ViHawk · May 2020–Nov 2023", detail: "Recurring revenue reporting, SQL optimization, and stakeholder-defined KPIs." },
    summary: "Repeatable revenue and operational reporting, without changing upstream systems.",
    points: [
      "Built recurring revenue, operational, and KPI reports using SQL, Python, Pandas, and Excel, combining source data and curated datasets into reliable reporting outputs.",
      "Optimized complex SQL reporting queries using CTEs, window functions, joins, aggregations, and validation checks, improving reporting performance and reliability.",
      "Created controlled PostgreSQL staging views and transformation logic within read-only source environments to support new reporting requirements without modifying upstream systems.",
      "Performed data profiling, validation, reconciliation, and root-cause analysis to identify duplicates, inconsistencies, and source-to-target discrepancies across reporting datasets.",
      "Developed and maintained reporting datasets and transformation workflows, applying data-cleansing and validation rules to improve data accuracy, consistency, and integrity.",
      "Collaborated with business stakeholders to define KPIs, metric definitions, reporting requirements, and validation rules, documenting requirements and supporting consistent reporting across teams."
    ]
  }
];

export const education = [{
  institution: "DePaul University", school: "Kellstadt Graduate School of Business",
  location: "Chicago, IL", degree: "Master of Science in Business Analytics",
  gpa: "4.0", period: "Jan 2024 – Nov 2025"
}];

export const professionalDevelopment = [
  { name: "SQL Analytics on Databricks", provider: "Databricks Academy" },
  { name: "Generative AI Explained", provider: "NVIDIA" },
  { name: "Scrum Fundamentals", provider: "SCRUMstudy" }
];
