import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Upload Resume',
  description: 'Upload your resume to Hunt-X and let AI analyze it against job descriptions. Generate ATS-optimized CVs and cover letters in seconds.',
  robots: { index: false, follow: false },
}

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
