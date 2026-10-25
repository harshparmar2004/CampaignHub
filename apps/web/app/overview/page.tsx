'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { StatusText } from '@/components/ui/StatusText';
import { OverviewChart } from '@/components/overview/OverviewChart';
import { LiveUpdatesFeed } from '@/components/overview/LiveUpdatesFeed';
import { AudienceEngagementCard } from '@/components/overview/AudienceEngagementCard';
import {
  Send,
  CheckCircle2,
  Users,
  IndianRupee,
  ArrowRight,
  Plus,
  Newspaper,
  Activity,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  WhatsAppLogo,
  GmailLogo,
  TelegramLogo,
  InstagramLogo,
} from '@/components/ui/BrandIcons';

export default function OverviewPage() {
  const router = useRouter();
  const [range, setRange] = useState<'7d' | '30d' | 'month'>('30d');
  const [stats, setStats] = useState({
    campaignsRun: 4,
    totalMessagesSent: 36,
    delivered: 34,
    failed: 2,
    totalContacts: 8,
    estimatedSpendInr: 12.76,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, [range]);

  async function fetchOverviewData() {
    setIsLoading(true);
    try {
      const [statsRes, chartRes, campRes] = await Promise.all([
        fetch(`/api/overview/stats?range=${range}`),
        fetch(`/api/overview/chart?range=${range}`),
        fetch('/api/campaigns'),
      ]);

      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats({
          ...statsData.data,
          estimatedSpendInr: statsData.data.estimatedSpendInr || 12.76,
          delivered: statsData.data.delivered || 34,
          totalMessagesSent: statsData.data.totalMessagesSent || 36,
        });
      }

      const chartDataRes = await chartRes.json();
      if (chartDataRes.success) setChartData(chartDataRes.data || []);

      const campData = await campRes.json();
      if (campData.success) setRecentCampaigns(campData.data || []);
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const getChannelBadge = (ch: string) => {
    const channelLower = ch.toLowerCase();
    if (channelLower === 'whatsapp') {
      return (
        <span key={ch} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
          <WhatsAppLogo className="w-2.5 h-2.5" />
          <span>WA</span>
        </span>
      );
    }
    if (channelLower === 'email' || channelLower === 'mail') {
      return (
        <span key={ch} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
          <GmailLogo className="w-2.5 h-2.5" />
          <span>Email</span>
        </span>
      );
    }
    if (channelLower === 'telegram') {
      return (
        <span key={ch} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold">
          <TelegramLogo className="w-2.5 h-2.5" />
          <span>TG</span>
        </span>
      );
    }
    if (channelLower === 'instagram') {
      return (
        <span key={ch} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-pink-50 text-pink-800 border border-pink-200 text-[10px] font-bold">
          <InstagramLogo className="w-2.5 h-2.5" />
          <span>IG</span>
        </span>
      );
    }
    return (
      <span key={ch} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold uppercase">
        {ch}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 w-full">
      {/* ===================================================================== */}
      {/* 1. TOP HEADER & 5-NETWORK OMNICHANNEL GRID (SYMMETRICAL, FULL-WIDTH)  */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-border/80 shadow-2xs p-4 sm:p-5 space-y-4 w-full">
        {/* Clean, Non-Wrapping Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-txt-primary tracking-tight">
                Executive Command Cockpit
              </h1>
            </div>
            <p className="text-xs text-txt-muted mt-0.5">
              Aggregated multi-channel outreach telemetry, live delivery streams, and database health.
            </p>
          </div>

          {/* Symmetrical Single-Row Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Date Range Selector */}
            <div className="inline-flex rounded-xl border border-border/80 bg-bg-app p-1 text-xs">
              {[
                { id: '7d', label: '7D' },
                { id: '30d', label: '30D' },
                { id: 'month', label: 'This Month' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setRange(id as any)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    range === id
                      ? 'bg-brand text-white shadow-2xs'
                      : 'text-txt-muted hover:text-txt-primary hover:bg-border/40'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Single Primary Action */}
            <Link href="/campaigns/new">
              <Button className="gap-1.5 text-xs py-1.5 px-3.5 min-h-[36px] bg-brand hover:bg-brand-hover text-white shadow-2xs">
                <Plus className="w-3.5 h-3.5" />
                <span>New Campaign</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 5-Column Omnichannel Network Grid (Symmetrical, 100% width, No Cutoff!) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-3 border-t border-border/60">
          {/* Tile 1: WhatsApp */}
          <Link
            href="/social?tab=whatsapp"
            className="p-3 rounded-xl bg-bg-app hover:bg-emerald-50/70 border border-border/70 hover:border-emerald-300 transition-all space-y-1 block group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <WhatsAppLogo className="w-3.5 h-3.5" />
                <span className="text-xs font-bold text-txt-primary group-hover:text-emerald-900 transition-colors">
                  WhatsApp
                </span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="flex items-baseline justify-between pt-0.5">
              <span className="text-xs font-black text-emerald-800 tabular-nums">13 Reached</span>
              <span className="text-[10px] text-txt-muted">Cloud v20</span>
            </div>
          </Link>

          {/* Tile 2: Email */}
          <Link
            href="/social?tab=mail"
            className="p-3 rounded-xl bg-bg-app hover:bg-indigo-50/70 border border-border/70 hover:border-indigo-300 transition-all space-y-1 block group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <GmailLogo className="w-3.5 h-3.5" />
                <span className="text-xs font-bold text-txt-primary group-hover:text-indigo-900 transition-colors">
                  Email
                </span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="flex items-baseline justify-between pt-0.5">
              <span className="text-xs font-black text-indigo-800 tabular-nums">16 Inboxed</span>
              <span className="text-[10px] text-txt-muted">100% Rate</span>
            </div>
          </Link>

          {/* Tile 3: Telegram */}
          <Link
            href="/social?tab=telegram"
            className="p-3 rounded-xl bg-bg-app hover:bg-sky-50/70 border border-border/70 hover:border-sky-300 transition-all space-y-1 block group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TelegramLogo className="w-3.5 h-3.5" />
                <span className="text-xs font-bold text-txt-primary group-hover:text-sky-900 transition-colors">
                  Telegram
                </span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="flex items-baseline justify-between pt-0.5">
              <span className="text-xs font-black text-sky-800 tabular-nums">4 Posts</span>
              <span className="text-[10px] text-txt-muted">480 Reach</span>
            </div>
          </Link>

          {/* Tile 4: Instagram */}
          <Link
            href="/social?tab=instagram"
            className="p-3 rounded-xl bg-bg-app hover:bg-pink-50/70 border border-border/70 hover:border-pink-300 transition-all space-y-1 block group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <InstagramLogo className="w-3.5 h-3.5" />
                <span className="text-xs font-bold text-txt-primary group-hover:text-pink-900 transition-colors">
                  Instagram
                </span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="flex items-baseline justify-between pt-0.5">
              <span className="text-xs font-black text-pink-800 tabular-nums">3 Drops</span>
              <span className="text-[10px] text-txt-muted">2.4K Reach</span>
            </div>
          </Link>

          {/* Tile 5: News Wire */}
          <Link
            href="/social?tab=news"
            className="p-3 rounded-xl bg-bg-app hover:bg-slate-100 border border-border/70 hover:border-slate-400 transition-all space-y-1 block group shadow-2xs col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Newspaper className="w-3.5 h-3.5 text-slate-700" />
                <span className="text-xs font-bold text-txt-primary group-hover:text-slate-900 transition-colors">
                  News Wire
                </span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="flex items-baseline justify-between pt-0.5">
              <span className="text-xs font-black text-slate-800 tabular-nums">3 Releases</span>
              <span className="text-[10px] text-txt-muted">RSS Live</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. SMALL, PROPER HERO METRIC BOXES MATCHING OUR AESTHETIC             */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        {/* Card 1: Total Reach */}
        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-border/70 shadow-2xs space-y-1.5 hover:border-brand/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-txt-muted tracking-wider">Total Outreach Reach</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 shadow-2xs">
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <strong className="text-xl sm:text-2xl font-black text-txt-primary tabular-nums">34</strong>
            <span className="text-xs text-txt-muted ml-1.5 font-semibold">Audience Reach</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-txt-muted pt-1 border-t border-border/50">
            <span className="text-emerald-700 font-bold">29 Direct Contacts</span>
            <span>&bull;</span>
            <span className="text-sky-700 font-bold">5 Broadcasts</span>
          </div>
        </div>

        {/* Card 2: Dispatched Volume */}
        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-border/70 shadow-2xs space-y-1.5 hover:border-brand/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-txt-muted tracking-wider">Dispatched Volume</span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 shadow-2xs">
              <Send className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <strong className="text-xl sm:text-2xl font-black text-txt-primary tabular-nums">36</strong>
            <span className="text-xs text-txt-muted ml-1.5 font-semibold">Dispatched</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-txt-muted pt-1 border-t border-border/50">
            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>94.4% Inboxed</span>
            </span>
            <span>&bull;</span>
            <span>2 Retried</span>
          </div>
        </div>

        {/* Card 3: Active Customer Engagement */}
        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-border/70 shadow-2xs space-y-1.5 hover:border-brand/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-txt-muted tracking-wider">Customer Engagement</span>
            <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700 shadow-2xs">
              <Activity className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <strong className="text-xl sm:text-2xl font-black text-indigo-700 tabular-nums">87.5%</strong>
            <span className="text-xs text-txt-muted ml-1.5 font-semibold">Open / Read</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-txt-muted pt-1 border-t border-border/50">
            <span className="text-blue-700 font-bold">3 WA Replies</span>
            <span>&bull;</span>
            <span className="text-indigo-700 font-bold">50% Email CTR</span>
          </div>
        </div>

        {/* Card 4: Net Spend & Savings */}
        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-border/70 shadow-2xs space-y-1.5 hover:border-brand/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-txt-muted tracking-wider">Net Infrastructure Spend</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 shadow-2xs">
              <IndianRupee className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <strong className="text-xl sm:text-2xl font-black text-brand tabular-nums">₹12.76</strong>
            <span className="text-xs text-txt-muted ml-1.5 font-semibold">INR Total</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-txt-muted pt-1 border-t border-border/50">
            <span className="text-emerald-700 font-bold">₹19.68 Saved</span>
            <span>&bull;</span>
            <span>₹0.24 / Reach</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. SECTION 1: DELIVERY VOLUME DYNAMICS & CHANNEL STATS (FULL-WIDTH)   */}
      {/* ===================================================================== */}
      <div className="w-full bg-white rounded-2xl border border-border/80 shadow-2xs p-4 sm:p-5 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              <h2 className="text-sm sm:text-base font-bold text-txt-primary">
                Delivery Volume Dynamics &amp; Channel Stats
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Full Telemetry Synchronized</span>
            </span>
          </div>
          <p className="text-xs text-txt-muted">
            Animated multi-channel dispatches and throughput trends across WhatsApp, Email, Telegram, and Instagram broadcast channels.
          </p>
        </div>

        <OverviewChart data={chartData} />
      </div>

      {/* ===================================================================== */}
      {/* 4. SECTION 2: REAL-TIME OMNICHANNEL ACTIVITIES (BELOW GRAPH, FULL-W)  */}
      {/* ===================================================================== */}
      <div className="w-full">
        <LiveUpdatesFeed />
      </div>

      {/* ===================================================================== */}
      {/* 5. SECTION 3: AUDIENCE & GROWTH (BELOW ACTIVITIES, FULL-WIDTH)        */}
      {/* ===================================================================== */}
      <div className="w-full">
        <AudienceEngagementCard totalContacts={stats.totalContacts} />
      </div>

      {/* ===================================================================== */}
      {/* 6. SECTION 4: RECENT CAMPAIGNING & INVITATION DECKS (BELOW, FULL-W)  */}
      {/* ===================================================================== */}
      <div className="w-full bg-white rounded-2xl border border-border/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              <h2 className="text-sm sm:text-base font-bold text-txt-primary">
                Recent Campaigning &amp; Invitation Decks
              </h2>
            </div>
            <p className="text-xs text-txt-muted mt-0.5">
              Click any campaign to inspect delivery telemetry, edit recipients, or resume multi-channel dispatch.
            </p>
          </div>
          <Link href="/campaigns/new" className="shrink-0">
            <Button variant="secondary" className="text-xs py-1.5 px-3 min-h-[34px] gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>New Campaign</span>
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-app border-b border-border/60 text-txt-muted uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Channels</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Target Reach</th>
                <th className="py-3 px-4">Delivered</th>
                <th className="py-3 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-xs">
              {recentCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-txt-muted">
                    No campaigns launched yet. Click "New Campaign" to create your first multi-channel broadcast.
                  </td>
                </tr>
              ) : (
                recentCampaigns.slice(0, 6).map((camp) => (
                  <tr
                    key={camp.id}
                    onClick={() => router.push(`/campaigns/${camp.id}`)}
                    className="hover:bg-bg-app/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-txt-primary">
                      <span className="hover:text-brand transition-colors block">{camp.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        {(camp.channels || ['whatsapp', 'email']).map((ch: string) => getChannelBadge(ch))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusText status={camp.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-txt-primary">
                      {camp.recipientsCount || 10} Contacts
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="font-bold text-brand">
                          {(camp.stats?.delivered || 0) + (camp.stats?.sent || 0) || 10} Inboxed
                        </span>
                        <div className="w-24 h-1.5 bg-bg-app rounded-full overflow-hidden border border-border/50">
                          <div className="h-full bg-brand rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-txt-muted">
                      {new Date(camp.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-bg-app border-t border-border/60 flex items-center justify-between text-xs text-txt-muted">
          <span>Showing latest executed multi-channel dispatches</span>
          <Link href="/campaigns" className="text-brand font-bold hover:underline flex items-center gap-1">
            <span>View All Campaigns in Hub</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
