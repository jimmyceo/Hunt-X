import './globals.css'
import Script from 'next/script'
import { jsonLdScript } from './schema'

export const metadata = {
  title: 'Hunt-X - AI-Powered Job Search',
  description: 'Upload your resume. Generate tailored CVs for every job. Land interviews faster.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          id="software-app-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript }}
        />
      </head>
      <body className="bg-slate-900 text-white">{children}</body>
    </html>
  )
}
