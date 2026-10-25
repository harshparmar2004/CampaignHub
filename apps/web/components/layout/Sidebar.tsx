'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Radio,
  Mail,
  Users,
  Settings,
  Plus,
  ShieldCheck,
  X,
  Share2,
  History,
  BarChart3,
  FileText,
  Bot,
  GitFork,
} from 'lucide-react';
import { CampaignHubLogo } from '@/components/ui/CampaignHubLogo';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const NAV_ITEMS = [
  { label: 'Overview', href: '/overview', icon: LayoutDashboard },
  { label: 'Campaigns', href: '/campaigns', icon: History },
  { label: 'AI Chatbot', href: '/ai-engine', icon: Bot, badge: 'PRO' },
  { label: 'Automations', href: '/automations', icon: GitFork, badge: 'LIVE' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'Social', href: '/social', icon: Share2 },
  { label: 'Contacts', href: '/contacts', icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/overview' && pathname === '/') return true;
    if (href === '/automations') {
      return pathname === '/automations' || pathname.startsWith('/automations/');
    }
    if (href === '/campaigns') {
      return pathname === '/campaigns' || (pathname.startsWith('/campaigns/') && !pathname.startsWith('/campaigns/new'));
    }
    if (href === '/ai-engine') {
      return (
        pathname === '/ai-engine' ||
        pathname.startsWith('/ai-engine/') ||
        pathname === '/chatbot' ||
        pathname.startsWith('/chatbot/')
      );
    }
    if (href === '/social') {
      return (
        pathname === '/social' ||
        pathname.startsWith('/social/') ||
        pathname.startsWith('/whatsapp') ||
        pathname.startsWith('/telegram') ||
        pathname.startsWith('/mail') ||
        pathname.startsWith('/media')
      );
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If mobile menu is open, dismiss drawer
    if (isOpen && onClose) {
      onClose();
    }
  };

  const navContent = (
    <div className="flex flex-col h-full bg-bg-surface border-r border-border select-none">
      {/* Brand Wordmark & Mobile Close */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-border flex-shrink-0">
        <Link
          href="/overview"
          onClick={(e) => handleLinkClick(e, '/overview')}
          className="flex items-center hover:opacity-95 transition-opacity"
        >
          <CampaignHubLogo size={34} showWordmark={true} />
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 text-txt-muted hover:text-txt-primary rounded-element"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* New Campaign Action Button */}
      <div className="p-4 pb-2 flex-shrink-0">
        <Link
          href="/campaigns/new"
          onClick={(e) => handleLinkClick(e, '/campaigns/new')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover active:bg-brand-hover text-white text-sm font-medium rounded-element min-h-[44px] transition-colors shadow-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New campaign</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-txt-muted block mb-2">
          Dashboard Menu
        </span>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleLinkClick(e, item.href)}
              prefetch={false}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-element text-sm font-medium transition-all duration-150 min-h-[44px] relative cursor-pointer ${
                active
                  ? 'bg-brand-soft text-brand font-bold'
                  : 'text-txt-muted hover:text-txt-primary hover:bg-bg-accentSoft/60 active:bg-bg-accentSoft'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-brand rounded-r"></span>
              )}
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-brand' : 'text-txt-muted'}`} />
              <span className="flex-1">{item.label}</span>
              {'badge' in item && item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] shrink-0">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-border flex-shrink-0 bg-bg-input">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-txt-muted flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand" />
            24/7 Worker
          </span>
          <span className="text-brand font-bold">Active</span>
        </div>
        <p className="text-[11px] text-txt-muted">Upstash Redis + BullMQ</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Left Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 h-screen sticky top-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sliding Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-txt-primary/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}

