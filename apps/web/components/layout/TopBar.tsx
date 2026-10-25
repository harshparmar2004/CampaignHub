'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import { CampaignHubLogo } from '@/components/ui/CampaignHubLogo';

const TABS = [
  { label: 'Overview', href: '/overview' },
  { label: 'WhatsApp', href: '/whatsapp' },
  { label: 'Telegram', href: '/telegram' },
  { label: 'Mails', href: '/mail' },
  { label: 'Contacts', href: '/contacts' },
  { label: 'Settings', href: '/settings' },
];

export default function TopBar() {
  const pathname = usePathname();

  // If path is root '/', overview is active
  const isActive = (href: string) => {
    if (href === '/overview' && pathname === '/') return true;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Wordmark */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/overview" className="flex items-center hover:opacity-95 transition-opacity">
              <CampaignHubLogo size={34} showWordmark={true} />
            </Link>
          </div>

          {/* Center: Horizontal Tab Bar (Horizontally scrollable on mobile) */}
          <nav className="flex-1 flex justify-center px-4 overflow-x-auto scrollbar-none">
            <div className="flex space-x-1 sm:space-x-4">
              {TABS.map((tab) => {
                const active = isActive(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
                      active
                        ? 'border-brand text-brand font-bold'
                        : 'border-transparent text-txt-muted hover:text-txt-primary hover:border-border-strong'
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Right: Primary Green Button "New campaign" */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/campaigns/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-element min-h-[44px] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New campaign</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
