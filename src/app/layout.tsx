import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HouseOS — Student House Community Platform',
  description:
    'Centralized event discovery, community announcements, and house activity standings for student houses.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-[#101116] text-[#F3F0E8] antialiased selection:bg-[#43E5D2] selection:text-[#101116]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
