import React from 'react'
import './globals.css'
import '@/blocks/registry-setup'

export const metadata = {
  title: 'Dynamic Block Site',
  description: 'Payload CMS dynamic block system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
