import './globals.css'
import { SubscriptionProvider } from '@/lib/subscription-context'

export const metadata = {
  title: 'Hunt-X — Autonomous AI Career Agent',
  description: 'An AI agent that finds, analyzes, and applies to jobs for you. Upload your resume. Let AI do the rest.',
  keywords: ['AI job search', 'career agent', 'autonomous job hunting', 'ATS resume', 'CV generator'],
  authors: [{ name: 'Hunt-X' }],
  openGraph: {
    title: 'Hunt-X — Autonomous AI Career Agent',
    description: 'An AI agent that finds, analyzes, and applies to jobs for you.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hunt-X — Autonomous AI Career Agent',
    description: 'An AI agent that finds, analyzes, and applies to jobs for you.',
  },
  robots: { index: true, follow: true },
}

export const viewport = {
  themeColor: '#0B0B0F',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0B0F] text-[#E8E8ED] antialiased min-h-screen"
        style={{ fontFamily: 'Inter, -apple-system, system-ui, Segoe UI, Roboto, sans-serif' }}
      >
        <SubscriptionProvider>
          {children}
        </SubscriptionProvider>
      </body>
    </html>
  )
}
