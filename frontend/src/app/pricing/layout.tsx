import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple pricing for Hunt-X. Start free with 5 job scans and 1 CV generation. Upgrade to Starter or Pro for unlimited AI-powered career tools.',
  alternates: { canonical: 'https://hunt-x.app/pricing' },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
