export const projects = [
  {
    id: "labelmaster",
    title: "Improving Engagement and Revenue Through Email Analytics",
    client: "Labelmaster · DePaul MS Capstone",
    timeline: "Fall 2025",
    category: "Email analytics",
    headline: "Four years of email. A clearer picture of engagement.",
    contribution: "Analyzed 4 years of email campaign data, covering millions of engagement events, using SQL and Snowflake to identify gaps in open rates and recommend targeting and timing changes to improve engagement.",
    outcome: "Built 3 interactive Tableau dashboards connected to Snowflake for email engagement, sales performance, and YTD campaign revenue analysis.",
    technologies: ["SQL", "Snowflake", "Tableau"],
    results: [
      { value: "4", label: "years of campaign data" },
      { value: "Millions", label: "of engagement events" },
      { value: "3", label: "interactive dashboards" }
    ],
    views: [
      { title: "Email engagement", detail: "Examined campaign engagement and gaps in open rates to inform targeting and timing recommendations." },
      { title: "Sales performance", detail: "Created a Tableau dashboard connected to Snowflake for sales performance analysis." },
      { title: "YTD campaign revenue", detail: "Created a Tableau dashboard connected to Snowflake for year-to-date campaign revenue analysis." }
    ]
  },
  {
    id: "calmpanion",
    title: "Calmpanion — AI-Powered Stress Management Chatbot",
    category: "Applied AI · team project",
    headline: "Two ways to interact. One more responsive experience.",
    contribution: "Fine-tuned LLaMA using Hugging Face Transformers on a mental health dataset and integrated OpenAI Whisper for speech-to-text input, supporting both voice and text interactions.",
    outcome: "Collaborated with a team to conduct user testing with 50 participants, evaluated chatbot responses, and optimized the application workflow to reduce response time by 30%.",
    technologies: ["LLaMA", "Hugging Face Transformers", "OpenAI Whisper"],
    results: [
      { value: "50", label: "user-testing participants" },
      { value: "30%", label: "reduction in response time" }
    ]
  }
];
