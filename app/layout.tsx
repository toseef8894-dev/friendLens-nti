import { Inter } from 'next/font/google'
import "./globals.css";
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

const Header = dynamic(() => import('@/components/Header'), {
  ssr: true,
})

const Toaster = dynamic(() => import('sonner').then(mod => ({ default: mod.Toaster })), {
  ssr: false,
})

const SessionInit = dynamic(() => import('@/components/SessionInit'), {
  ssr: false,
})

const SaveAnonymousResults = dynamic(() => import('@/components/SaveAnonymousResults'), {
  ssr: false,
})

export const metadata = {
  title: 'FriendLens.ai | Make Better, More Reliable Friends',
  description: 'A friendship navigation platform that helps you make one more good friend, then another through clarity, better social decisions, stronger reciprocity, and real-world connection.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <Toaster position="top-center" richColors />
        <SessionInit />
        <SaveAnonymousResults />
      </body>
    </html>
  );
}