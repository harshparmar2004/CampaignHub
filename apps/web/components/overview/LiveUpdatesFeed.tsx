'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  WhatsAppLogo,
  GmailLogo,
  TelegramLogo,
  InstagramLogo,
} from '@/components/ui/BrandIcons';
import {
  Activity,
  ArrowRight,
  CheckCheck,
  CheckCircle2,
  Headphones,
  Pin,
  Newspaper,
  ShieldCheck,
  Radio,
} from 'lucide-react';

export interface UpdateEvent {
  id: string;
  channel: 'whatsapp' | 'email' | 'telegram' | 'instagram' | 'news';
  title: string;
  subtitle: string;
  snippet: string;
  time: string;
  status: string;
  tag: string;
  link: string;
}

const EVENTS: UpdateEvent[] = [
  {
    id: 'ev-1',
    channel: 'whatsapp',
    title: 'Arjun Mehta',
    subtitle: '+91 98765 43210 • VIP Cohort',
    snippet: '“Confirming +2 for tonight’s Diwali Gala. Do we have table 4 reserved?”',
    time: '2m ago',
    status: 'Inbound Reply',
    tag: 'Live Webhook',
    link: '/social?tab=whatsapp',
  },
  {
    id: 'ev-2',
    channel: 'email',
    title: 'VIP Gala Pass Dispatches',
    subtitle: '16 Inboxed • 87.5% Open Rate',
    snippet: 'All passes delivered directly to priority guest inboxes with SPF/DKIM verification.',
    time: '18m ago',
    status: 'Delivered',
    tag: 'Resend SMTP',
    link: '/social?tab=mail',
  },
  {
    id: 'ev-3',
    channel: 'telegram',
    title: '@campaignhub_vip Community',
    subtitle: '480 Member Subscribers',
    snippet: '🚀 Pinned announcement: Early Bird VIP table allocations officially opened.',
    time: '1h ago',
    status: 'Pinned',
    tag: 'Bot Broadcast',
    link: '/social?tab=telegram',
  },
  {
    id: 'ev-4',
    channel: 'instagram',
    title: 'VIP Lounge Podcast Drop (Ep #4)',
    subtitle: 'Audio Release • 890 Listeners',
    snippet: '🎧 Soundscape preview audio note dropped into VIP Broadcast Channel.',
    time: '3h ago',
    status: 'Audio Drop',
    tag: 'Broadcast Channel',
    link: '/social?tab=instagram',
  },
  {
    id: 'ev-5',
    channel: 'whatsapp',
    title: 'Priya Sharma',
    subtitle: '+91 91234 56789 • Regular Guest',
    snippet: '“Thank you for the early access pass! Looking forward to the gala.”',
    time: '5h ago',
    status: 'Inbound Reply',
    tag: 'Live Webhook',
    link: '/social?tab=whatsapp',
  },
  {
    id: 'ev-6',
    channel: 'news',
    title: 'Diwali Executive Press Release',
    subtitle: 'Newswire Syndicate • 3 Drops',
    snippet: '🗞 Official syndication published to regional event media portals and PR wires.',
    time: '7h ago',
    status: 'Syndicated',
    tag: 'RSS Press Wire',
    link: '/social?tab=news',
  },
];

export function LiveUpdatesFeed() {
  const [filter, setFilter] = useState<'all' | 'whatsapp' | 'email' | 'telegram' | 'social'>('all');

  const filteredEvents = EVENTS.filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'whatsapp') return e.channel === 'whatsapp';
    if (filter === 'email') return e.channel === 'email';
    if (filter === 'telegram') return e.channel === 'telegram';
    if (filter === 'social') return e.channel === 'instagram' || e.channel === 'news';
    return true;
  });

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'whatsapp':
        return <WhatsAppLogo className="w-3.5 h-3.5" />;
      case 'email':
        return <GmailLogo className="w-3.5 h-3.5" />;
      case 'telegram':
        return <TelegramLogo className="w-3.5 h-3.5" />;
      case 'instagram':
        return <InstagramLogo className="w-3.5 h-3.5" />;
      case 'news':
        return <Newspaper className="w-3.5 h-3.5 text-slate-700" />;
      default:
        return <Activity className="w-3.5 h-3.5" />;
    }
  };

  const getChannelLabel = (ch: string) => {
    switch (ch) {
      case 'whatsapp':
        return 'WhatsApp';
      case 'email':
        return 'Email';
      case 'telegram':
        return 'Telegram';
      case 'instagram':
        return 'Instagram';
      case 'news':
        return 'News Wire';
      default:
        return ch;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Inbound Reply') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          Inbound Reply
        </span>
      );
    }
    if (status === 'Delivered') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
          <CheckCheck className="w-3 h-3 text-emerald-600" />
          <span>Inboxed</span>
        </span>
      );
    }
    if (status === 'Pinned') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1">
          <Pin className="w-3 h-3 text-sky-600" />
          <span>Pinned</span>
        </span>
      );
    }
    if (status === 'Syndicated') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1">
          <Radio className="w-3 h-3 text-slate-600" />
          <span>Syndicated</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 flex items-center gap-1">
        <Headphones className="w-3 h-3 text-pink-600" />
        <span>Audio Drop</span>
      </span>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-border/80 shadow-2xs p-4 sm:p-5 space-y-4">
      {/* Feed Header with Live Beacon & Channel Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-txt-primary">
                Real-Time Omnichannel Activities
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Live Feed
              </span>
            </div>
            <p className="text-xs text-txt-muted mt-0.5">
              Live 2-way replies, verified campaign deliveries, and community broadcast callbacks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none bg-bg-app p-1 rounded-xl border border-border/70">
            {[
              { id: 'all', label: 'All Activity' },
              { id: 'whatsapp', label: 'WhatsApp' },
              { id: 'email', label: 'Email' },
              { id: 'telegram', label: 'Telegram' },
              { id: 'social', label: 'IG & News' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as any)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filter === tab.id
                    ? 'bg-brand text-white shadow-2xs'
                    : 'text-txt-muted hover:text-txt-primary hover:bg-border/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link
            href="/social"
            className="text-xs text-brand hover:underline font-bold flex items-center gap-1 cursor-pointer shrink-0 pl-1"
          >
            <span>Open Social</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Symmetrical Responsive Grid of Compact, Proper Activity Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredEvents.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className="p-3.5 rounded-xl bg-bg-app hover:bg-white border border-border/70 hover:border-brand/40 transition-all flex flex-col justify-between space-y-2.5 group shadow-2xs"
          >
            {/* Top row: Channel + Status + Time */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-md bg-white flex items-center justify-center shrink-0 border border-border/60 shadow-2xs">
                  {getChannelIcon(item.channel)}
                </div>
                <span className="text-xs font-bold text-txt-primary truncate">
                  {getChannelLabel(item.channel)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {getStatusBadge(item.status)}
                <span className="text-[10px] text-txt-muted">{item.time}</span>
              </div>
            </div>

            {/* Recipient / Title & Subtitle */}
            <div>
              <strong className="text-xs font-bold text-txt-primary block truncate group-hover:text-brand transition-colors">
                {item.title}
              </strong>
              <span className="text-[11px] text-txt-muted block truncate">
                {item.subtitle}
              </span>
            </div>

            {/* Snippet Quote Bubble */}
            <p className="text-xs text-txt-primary leading-relaxed bg-white p-2 rounded-lg border border-border/50 line-clamp-2">
              {item.snippet}
            </p>

            {/* Bottom Meta & Inspect link */}
            <div className="flex items-center justify-between text-[10px] text-txt-muted pt-1 border-t border-border/40">
              <span className="font-medium text-txt-muted flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{item.tag}</span>
              </span>
              <span className="text-brand font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                <span>Inspect</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Symmetrical Bottom Status Strip */}
      <div className="p-2.5 sm:p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            Meta Cloud API v20.0 &bull; Resend SMTP &bull; Telegram Bot API &bull; Instagram Graph API
          </span>
        </div>
        <div className="flex items-center gap-3 font-bold text-emerald-800 text-[11px]">
          <span>0 Failed Callbacks</span>
          <span>&bull;</span>
          <span className="flex items-center gap-1 text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Real-Time Synced</span>
          </span>
        </div>
      </div>
    </div>
  );
}
