import { Inter } from 'next/font/google'
import "./globals.css";
import dynamic from 'next/dynamic'

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

const SaveAnonymousResults = dynamic(() => import('@/components/SaveAnonymousResults'), {
  ssr: false,
})

export const metadata = {
  title: 'FriendLens',
  description: 'FriendLens — intake survey and friendship type result.',
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
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Toaster position="top-center" richColors />
        <SaveAnonymousResults />
      </body>
    </html>
  );
}
