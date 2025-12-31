import { Inter } from 'next/font/google'
import "./globals.css";
import Header from '@/components/Header'
import PasswordResetHandler from '@/components/PasswordResetHandler'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'FriendLens',
  description: 'FriendLens — intake survey and friendship type result.',
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PasswordResetHandler />
        <Header />
        <main>{children}</main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
