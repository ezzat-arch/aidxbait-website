import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AidXBait',
  description: 'AidXBait is a platform that connects patients with healthcare providers. We offer a wide range of services including physical therapy, orthopedics, general medicine, home visits, and online consultations.',
  generator: 'aidxbait',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
