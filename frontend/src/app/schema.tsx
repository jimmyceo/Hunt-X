export const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Hunt-X",
  "description": "AI-powered job application platform that transforms the chaotic job search process into a strategic, AI-assisted workflow. Features 6-block AI evaluation, ATS-optimized CV generation, interview preparation, cover letter generation, real-time chat assistance, and automated job scraping.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://hunt-x-frontend.vercel.app",
  "offers": [
    {
      "@type": "Offer",
      "name": "Try",
      "description": "Free tier with 5 jobs one-time",
      "price": "0",
      "priceCurrency": "EUR"
    },
    {
      "@type": "Offer",
      "name": "Active",
      "description": "40 jobs/month with full AI features",
      "price": "12",
      "priceCurrency": "EUR",
      "billingIncrement": "monthly"
    },
    {
      "@type": "Offer",
      "name": "Aggressive",
      "description": "100 jobs/month for serious job seekers",
      "price": "29",
      "priceCurrency": "EUR",
      "billingIncrement": "monthly"
    },
    {
      "@type": "Offer",
      "name": "Unlimited",
      "description": "Unlimited job applications with all premium features",
      "price": "49",
      "priceCurrency": "EUR",
      "billingIncrement": "monthly"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "ratingCount": "1"
  },
  "featureList": [
    "6-Block AI Evaluation",
    "ATS-Optimized CV Generation",
    "Interview Preparation with STAR Stories",
    "Cover Letter Generation",
    "Real-time Chat Assistance",
    "Automated Job Scraping",
    "Resume Upload & Management",
    "Dark Mode Interface",
    "Credit-based Usage System"
  ],
  "softwareRequirements": "Modern web browser with JavaScript enabled",
  "programmingLanguage": "TypeScript, Python",
  "author": {
    "@type": "Organization",
    "name": "Hunt-X"
  }
}

export const jsonLdScript = JSON.stringify(softwareAppSchema)
