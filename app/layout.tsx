import { Inter } from 'next/font/google'
import "./globals.css";
import Header from '@/components/Header'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

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
      </body>
    </html>
  );
}
