import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth-context'
import { AuthModalProvider } from '@/lib/auth-modal-context'
import { AuthModal } from '@/components/shared/auth-modal'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'PryroReview — Verified Business Reviews',
  description:
    "PryroReview's verified business accountability platform. Every review is backed by a real 20 RWF payment — no fake reviews, no spam.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white font-sans">
        <AuthProvider>
          <AuthModalProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <AuthModal />
            <Toaster position="bottom-right" />
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
