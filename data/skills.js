export const skillCategories = [
  { category: "SQL & Databases", skills: ["SQL", "SQL Server", "Oracle", "PostgreSQL", "Amazon Redshift", "Amazon Athena", "Azure Synapse Analytics", "Azure SQL Database", "Snowflake", "Databricks", "CTEs", "Window Functions"] },
  { category: "Python & Data Analysis", skills: ["Python", "Pandas", "NumPy", "Jupyter Notebook", "Exploratory Data Analysis"] },
  { category: "BI & Dashboards", skills: ["Power BI Desktop", "Power BI Service", "DAX", "Tableau", "KPI Reporting", "Dashboard Development"] },
  { category: "Excel & Reporting", skills: ["Microsoft Excel", "PivotTables", "VLOOKUP", "INDEX/MATCH", "Excel Charts"] },
  { category: "Cloud & Data Platforms", skills: ["AWS", "Amazon S3", "AWS Lambda", "Microsoft Azure"] },
  { category: "ETL & Data Integration", skills: ["SSIS", "Azure Data Factory", "AWS Glue", "REST APIs", "JSON", "CSV", "Data Integration", "Data Transformation", "Source-to-Target Mapping"] },
  { category: "Data Quality & Validation", skills: ["Data Profiling", "Data Cleansing", "Data Validation", "Data Reconciliation", "Data Integrity", "Duplicate Detection", "Root-Cause Analysis"] },
  { category: "Version Control & Delivery", skills: ["Git", "UAT", "Requirements Documentation", "BRDs", "FRDs", "Agile", "Scrum"] }
].map((category) => ({ ...category, skills: category.skills.map((name) => ({ name })) }));
