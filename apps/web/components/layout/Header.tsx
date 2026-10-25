'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Plus, Radio, MessageSquare, Mail, Users, Settings, LayoutDashboard, Image as ImageIcon, History, BarChart3, FileText, Share2, Bot, GitFork } from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export default function Header({ onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();

  const getPageInfo = () => {
    if (pathname.startsWith('/ai-engine') || pathname.startsWith('/chatbot')) {
      return { title: 'AI Chatbot', icon: Bot };
    }
    if (pathname.startsWith('/automations')) return { title: 'Automations & Visual Pipeline Studio', icon: GitFork };
    if (pathname.startsWith('/social')) return { title: 'Social & Multi-Channel Media Hub', icon: Share2 };
    if (pathname.startsWith('/whatsapp')) return { title: 'WhatsApp Operations', icon: MessageSquare };
    if (pathname.startsWith('/telegram')) return { title: 'Telegram Broadcasting', icon: Radio };
    if (pathname.startsWith('/mail')) return { title: 'Email Center', icon: Mail };
    if (pathname.startsWith('/media')) return { title: 'Media & Creative Assets', icon: ImageIcon };
    if (pathname.startsWith('/contacts')) return { title: 'Contacts Database', icon: Users };
    if (pathname.startsWith('/settings')) return { title: 'Settings Vault', icon: Settings };
    if (pathname.startsWith('/analytics')) return { title: 'Campaign Analytics & Financial Intelligence', icon: BarChart3 };
    if (pathname.startsWith('/reports')) return { title: 'Business Reports & Financial Statements', icon: FileText };
    if (pathname.startsWith('/campaigns/new')) return { title: 'New Multi-Channel Campaign', icon: Plus };
    if (pathname === '/campaigns') return { title: 'Campaign History', icon: History };
    if (pathname.startsWith('/campaigns/')) return { title: 'Campaign Operational Telemetry', icon: History };
    return { title: 'Dashboard Overview', icon: LayoutDashboard };
  };

  const { title, icon: Icon } = getPageInfo();
  const isReportsPage = pathname.startsWith('/reports');
  const isChatbotPage = pathname.startsWith('/ai-engine') || pathname.startsWith('/chatbot');

  return (
    <header className="sticky top-0 z-20 bg-bg-surface border-b border-border h-16 flex items-center justify-between px-3 sm:px-6 lg:px-8">
      {/* Left: Mobile Menu Trigger & Breadcrumb / Current Page Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-txt-muted hover:text-txt-primary hover:bg-bg-accentSoft rounded-element min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors shrink-0"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <Icon className="w-4 h-4 text-brand hidden sm:block shrink-0" />
          <h2 className="text-sm sm:text-base lg:text-lg font-bold text-txt-primary tracking-tight truncate">
            {title}
          </h2>
        </div>
      </div>

      {/* Right: Quick Action & System Indicator or Reports Custom Controls */}
      <div id="header-custom-actions" className="flex items-center gap-2 shrink-0">
        {!isReportsPage && !isChatbotPage && (
          <>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-bg-input border border-border rounded-element text-xs text-txt-muted">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              <span>Internal Workspace</span>
            </div>

            <Link
              href="/campaigns/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-medium rounded-element min-h-[40px] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New campaign</span>
            </Link>
          </>
        )}

        {isChatbotPage && (
          <>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-border rounded-element text-xs font-semibold text-txt-secondary transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-stone-500" />
              <span>Manage API Keys</span>
            </Link>

            <Link
              href="/campaigns/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold rounded-element min-h-[36px] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New campaign</span>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
