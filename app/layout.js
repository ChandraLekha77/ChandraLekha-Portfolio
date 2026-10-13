import localFont from "next/font/local";
import "./globals.css";
import Navigation from "@/components/shared/Navigation";
import CustomCursor from "@/components/shared/CustomCursor";
import Loader from "@/components/shared/Loader";

const clashDisplay = localFont({
  src: [
    {
      path: "../public/fonts/ClashDisplay-Semibold.woff2",
      weight: "600",
      style: "normal"
    },
    {
      path: "../public/fonts/ClashDisplay-Bold.woff2",
      weight: "700",
      style: "normal"
    }
  ],
  variable: "--font-clash-display",
  display: "swap"
});

const generalSans = localFont({
  src: [
    {
      path: "../public/fonts/GeneralSans-Regular.woff2",
      weight: "400",
      style: "normal"
    },
    {
      path: "../public/fonts/GeneralSans-Medium.woff2",
      weight: "500",
      style: "normal"
    },
    {
      path: "../public/fonts/GeneralSans-Semibold.woff2",
      weight: "600",
      style: "normal"
    },
    {
      path: "../public/fonts/GeneralSans-Bold.woff2",
      weight: "700",
      style: "normal"
    }
  ],
  variable: "--font-general-sans",
  display: "swap"
});

export const metadata = {
  title: "Chandra Lekha Ganta — Data Analyst",
  description: "Data Analyst working across audience, public safety, retail, and operational datasets with SQL, Python, Power BI, Tableau, and cloud data platforms.",
  authors: [{ name: "Chandra Lekha Ganta" }],
  keywords: [
    "Data Analyst",
    "Analytics Engineering",
    "Data Quality",
    "Reconciliation",
    "SQL",
    "Python",
    "Amazon Redshift",
    "Power BI",
    "Tableau",
    "Azure Synapse"
  ],
  openGraph: {
    title: "Chandra Lekha Ganta — Data Analyst",
    description: "Five years of analysis, reporting, dashboarding, and data quality. Explore selected projects and professional experience.",
    type: "website",
    locale: "en_US"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${clashDisplay.variable} ${generalSans.variable}`}>
      <body className="bg-grid-subtle">
        <Loader />
        <div id="portfolio-content">
          <a href="#main-content" className="skip-link">Skip to content</a>
          <Navigation />
          <CustomCursor />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
