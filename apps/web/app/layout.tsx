import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import DashboardShell from '@/components/layout/DashboardShell';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CampaignHub — Multi-Channel Campaign Automation',
  description: 'Internal campaign automation platform for WhatsApp, Telegram, and Email.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="bg-bg-app text-txt-primary min-h-screen antialiased">
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
