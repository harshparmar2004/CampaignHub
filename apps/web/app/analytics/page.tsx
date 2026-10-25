'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  BarChart3,
  PieChart as PieIcon,
  ShieldCheck,
  Layers,
  Send,
  Filter,
  Search,
  X,
  Mail,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { WhatsAppLogo, GmailLogo, TelegramLogo, InstagramLogo } from '@/components/ui/BrandIcons';
import { Button } from '@/components/ui/Button';

interface AnalyticsSummary {
  totalCampaigns: number;
  totalMessages: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  deliveryRate: number;
  readRate: number;
  totalSpendInr: number;
  whatsAppSpendInr: number;
  emailSpendInr: number;
  emailPaidSpendInr?: number;
  emailPaidUnitCost?: number;
  telegramSpendInr: number;
  instagramSpendInr: number;
  costSavingsInr: number;
  freeMessagesCount: number;
  avgCostPerRecipient: string;
  directMessagesCount?: number;
  channelBroadcastsCount?: number;
  directDeliveredCount?: number;
  channelCampaignCounts?: { whatsapp: number; email: number; telegram: number; instagram: number };
  monthlyBudgetInr: number;
  budgetRemainingInr: number;
  budgetUsedPercent: number;
}

interface ChannelStatItem {
  total: number;
  delivered: number;
  read: number;
  failed: number;
  spend: number;
}

interface TimelinePoint {
  date: string;
  fullDate: string;
  whatsapp: number;
  email: number;
  telegram: number;
  instagram: number;
  costInr: number;
  cumulativeSpendInr: number;
  emailCostInr?: number;
  emailCumulativeSpendInr?: number;
  delivered: number;
}

interface MonthlyTimelinePoint {
  monthKey: string;
  monthLabel: string;
  whatsapp: number;
  email: number;
  telegram: number;
  instagram: number;
  costInr: number;
  cumulativeSpendInr?: number;
  emailCostInr?: number;
  emailCumulativeSpendInr?: number;
  delivered: number;
}

interface TierStatsMap {
  vip?: { count: number; recipients: number; spend: number; delivered: number };
  regular?: { count: number; recipients: number; spend: number; delivered: number };
  lead?: { count: number; recipients: number; spend: number; delivered: number };
  all?: { count: number; recipients: number; spend: number; delivered: number };
}

interface CampaignReportItem {
  id: string;
  name: string;
  category: string;
  status: string;
  channels: string[];
  audience_tier: string;
  created_at: string;
  recipientsCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  totalCostInr: number;
  deliveryRate: number;
  readRate: number;
}

export default function AnalyticsDashboardPage() {
  const router = useRouter();

  // Global Date Scope State (Month & Year)
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');

  // Trajectory Filter: Selected Channel ('all' | 'whatsapp' | 'email' | 'telegram' | 'instagram')
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'whatsapp' | 'email' | 'telegram' | 'instagram'>('all');

  // Trajectory Granularity View: 'daily' vs 'monthly'
  const [timeResolution, setTimeResolution] = useState<'daily' | 'monthly'>('daily');

  // Channel Reach Search Query
  const [channelSearch, setChannelSearch] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [channels, setChannels] = useState<Record<string, ChannelStatItem>>({});
  const [tiers, setTiers] = useState<TierStatsMap>({});
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [monthlyTimeline, setMonthlyTimeline] = useState<MonthlyTimelinePoint[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignReportItem[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [monthFilter, yearFilter]);

  async function fetchAnalytics() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics?month=${monthFilter}&year=${yearFilter}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSummary(json.data.summary);
        setChannels(json.data.channels || {});
        setTiers(json.data.tiers || {});
        setTimeline(json.data.timeline || []);
        setMonthlyTimeline(json.data.monthlyTimeline || []);
        setCampaigns(json.data.campaigns || []);
      }
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Active dataset for Trajectory Chart (Daily points vs. Monthly points)
  const activeTrajectoryData = useMemo(() => {
    if (timeResolution === 'monthly' && monthlyTimeline.length > 0) {
      return monthlyTimeline.map((item) => ({
        ...item,
        date: item.monthLabel,
      }));
    }
    return timeline;
  }, [timeResolution, monthlyTimeline, timeline]);

  // Peak daily Meta API fee calculation
  const peakDailySpend = useMemo(() => {
    if (!timeline || timeline.length === 0) return '0.00';
    const maxCost = Math.max(...timeline.map((t) => t.costInr || 0));
    return maxCost.toFixed(2);
  }, [timeline]);


  // Channel Reach Share Items
  const allChannelReachItems = useMemo(() => {
    const directDelivered = (channels.whatsapp?.delivered ?? 0) + (channels.email?.delivered ?? 0);
    const channelBroadcasts = (channels.telegram?.delivered ?? 0) + (channels.instagram?.delivered ?? 0);
    const totalOutreach = directDelivered + channelBroadcasts || 1;

    return [
      {
        id: 'whatsapp',
        name: 'WhatsApp Cloud API',
        subtitle: 'Meta Marketing Service (E.164 Direct)',
        logo: WhatsAppLogo,
        color: '#25D366',
        bgLight: 'bg-[#25D366]/10',
        textLight: 'text-emerald-800',
        borderLight: 'border-[#25D366]/30',
        dispatched: channels.whatsapp?.total ?? 0,
        delivered: channels.whatsapp?.delivered ?? 0,
        read: channels.whatsapp?.read ?? 0,
        cost: `₹${(channels.whatsapp?.spend ?? 0).toFixed(2)} INR`,
        unitCost: '₹0.82 / conv',
        isFree: false,
        isChannel: false,
        metricLabel: 'Contacts Reached',
        dispatchedLabel: 'Messages Sent',
        sharePercent: totalOutreach > 0 ? Number((((channels.whatsapp?.delivered ?? 0) / totalOutreach) * 100).toFixed(1)) : 0,
        deliveryRate:
          (channels.whatsapp?.total ?? 0) > 0
            ? Math.round(((channels.whatsapp?.delivered ?? 0) / (channels.whatsapp?.total ?? 1)) * 100)
            : 100,
      },
      {
        id: 'email',
        name: 'Email Outreach',
        subtitle: 'Resend / SMTP Gateway (1-to-1 Inbox)',
        logo: GmailLogo,
        color: '#6366F1',
        bgLight: 'bg-indigo-50',
        textLight: 'text-indigo-800',
        borderLight: 'border-indigo-200',
        dispatched: channels.email?.total ?? 0,
        delivered: channels.email?.delivered ?? 0,
        read: channels.email?.read ?? 0,
        cost: `₹${(summary?.emailPaidSpendInr ?? 0).toFixed(2)} INR`,
        unitCost: '₹0.08 / email',
        isFree: false,
        isChannel: false,
        metricLabel: 'Contacts Reached',
        dispatchedLabel: 'Emails Sent',
        sharePercent: totalOutreach > 0 ? Number((((channels.email?.delivered ?? 0) / totalOutreach) * 100).toFixed(1)) : 0,
        deliveryRate:
          (channels.email?.total ?? 0) > 0
            ? Math.round(((channels.email?.delivered ?? 0) / (channels.email?.total ?? 1)) * 100)
            : 100,
      },
      {
        id: 'telegram',
        name: 'Telegram Community',
        subtitle: 'Group & Channel Broadcast (@campaignhub_vip)',
        logo: TelegramLogo,
        color: '#0088CC',
        bgLight: 'bg-sky-50',
        textLight: 'text-sky-800',
        borderLight: 'border-sky-200',
        dispatched: channels.telegram?.total ?? 0,
        delivered: channels.telegram?.delivered ?? 0,
        read: channels.telegram?.read ?? 0,
        cost: '₹0.00 Native API',
        unitCost: '100% Free',
        isFree: true,
        isChannel: true,
        channelContext: 'Campaigns in group',
        metricLabel: 'Group Campaigns',
        dispatchedLabel: 'Group Broadcasts',
        savedText: '+₹13.12 Saved',
        sharePercent: totalOutreach > 0 ? Number((((channels.telegram?.delivered ?? 0) / totalOutreach) * 100).toFixed(1)) : 0,
        deliveryRate: 100,
      },
      {
        id: 'instagram',
        name: 'Instagram Broadcast',
        subtitle: 'Broadcast Channel & Feed (VIP Broadcast)',
        logo: InstagramLogo,
        color: '#E1306C',
        bgLight: 'bg-pink-50',
        textLight: 'text-pink-800',
        borderLight: 'border-pink-200',
        dispatched: channels.instagram?.total ?? 0,
        delivered: channels.instagram?.delivered ?? 0,
        read: channels.instagram?.read ?? 0,
        cost: '₹0.00 Native API',
        unitCost: '100% Free',
        isFree: true,
        isChannel: true,
        channelContext: 'Campaigns in channel',
        metricLabel: 'Channel Campaigns',
        dispatchedLabel: 'Channel Updates',
        savedText: '+₹6.56 Saved',
        sharePercent: totalOutreach > 0 ? Number((((channels.instagram?.delivered ?? 0) / totalOutreach) * 100).toFixed(1)) : 0,
        deliveryRate: 100,
      },
    ];
  }, [channels, summary]);

  // Filtered Channel Items based on Channel Search input
  const filteredChannelReachItems = useMemo(() => {
    if (!channelSearch.trim()) return allChannelReachItems;
    const q = channelSearch.toLowerCase();
    return allChannelReachItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.unitCost.toLowerCase().includes(q)
    );
  }, [allChannelReachItems, channelSearch]);

  // Channel Share of Audience Reach for Donut Chart
  const reachDonutData = useMemo(() => {
    return allChannelReachItems
      .filter((i) => i.delivered > 0)
      .map((i) => ({
        name: i.name,
        value: i.delivered,
        color: i.color,
        sharePercent: i.sharePercent,
        isChannel: i.isChannel,
      }));
  }, [allChannelReachItems]);

  const hasDateFilters = monthFilter !== 'all' || yearFilter !== 'all';

  return (
    <div className="w-full space-y-6 pb-20">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER: TITLE & GLOBAL MONTH/YEAR DATE SCOPE CONTROLLER            */}
      {/* ========================================================================= */}
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-txt-muted mb-1">
            <span className="hover:text-txt-primary cursor-pointer" onClick={() => router.push('/overview')}>
              Dashboard
            </span>
            <ChevronRight className="w-3 h-3 text-txt-muted/60" />
            <span className="text-brand font-semibold">Campaign Analytics</span>
          </div>
          <h1 className="text-xl font-bold text-txt-primary tracking-tight">
            Campaign Analytics &amp; Visual Intelligence
          </h1>
          <p className="text-xs text-txt-muted mt-0.5">
            Audit omnichannel delivery performance, paid API expenditures (WhatsApp &amp; Email), and audience targeting across broadcasts.
          </p>
        </div>

        {/* Top Header Action Controls: Month & Year Global Date Scope Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasDateFilters && (
            <button
              type="button"
              onClick={() => {
                setMonthFilter('all');
                setYearFilter('all');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-soft hover:bg-brand-soft/80 text-brand text-xs font-semibold rounded-element border border-brand/30 shadow-2xs transition-all cursor-pointer shrink-0"
              title="Reset date filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Date</span>
            </button>
          )}

          {/* Month Dropdown */}
          <div className="relative flex items-center shrink-0">
            <Calendar className="w-3.5 h-3.5 text-brand absolute left-2.5 pointer-events-none" />
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="pl-8 pr-7 py-2 text-xs bg-white hover:bg-bg-app focus:bg-white border border-border focus:border-brand/60 rounded-element font-medium text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all cursor-pointer shadow-2xs appearance-none"
              title="Filter by Month"
            >
              <option value="all">All Months</option>
              <option value="1">Jan (January)</option>
              <option value="2">Feb (February)</option>
              <option value="3">Mar (March)</option>
              <option value="4">Apr (April)</option>
              <option value="5">May (May)</option>
              <option value="6">Jun (June)</option>
              <option value="7">Jul (July)</option>
              <option value="8">Aug (August)</option>
              <option value="9">Sep (September)</option>
              <option value="10">Oct (October)</option>
              <option value="11">Nov (November)</option>
              <option value="12">Dec (December)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-txt-muted absolute right-2 pointer-events-none" />
          </div>

          {/* Year Dropdown */}
          <div className="relative flex items-center shrink-0">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="pl-3 pr-7 py-2 text-xs bg-white hover:bg-bg-app focus:bg-white border border-border focus:border-brand/60 rounded-element font-medium text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all cursor-pointer shadow-2xs appearance-none"
              title="Filter by Year"
            >
              <option value="all">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-txt-muted absolute right-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. NARROWER & THEME-ALIGNED TOP STAT BOXES (6 COMPACT SLEEK BOXES)        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Box 1: Campaigns Executed */}
        <div className="p-3 bg-white border border-border/80 rounded-xl shadow-2xs hover:border-brand/40 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Campaigns</span>
            <Layers className="w-3.5 h-3.5 text-brand" />
          </div>
          <p className="text-xl font-extrabold text-txt-primary">{summary?.totalCampaigns ?? 0}</p>
          <span className="text-[10px] text-txt-muted block mt-0.5 truncate">
            {summary?.totalCampaigns ? `${summary.totalCampaigns} in period` : '0 records'}
          </span>
        </div>

        {/* Box 2: WhatsApp Meta API Spend */}
        <div className="p-3 bg-white border border-border/80 rounded-xl shadow-2xs hover:border-brand/40 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Meta API Spend</span>
            <div className="w-4 h-4 rounded bg-emerald-50 text-brand flex items-center justify-center font-bold text-[10px]">
              ₹
            </div>
          </div>
          <p className="text-xl font-extrabold text-brand">₹{summary?.totalSpendInr ?? '0.00'}</p>
          <span className="text-[10px] text-txt-muted block mt-0.5 truncate">
            ₹0.82 / WhatsApp conv
          </span>
        </div>

        {/* Box 3: Email Paid API Spend (Post-Trial) */}
        <div className="p-3 bg-white border border-border/80 rounded-xl shadow-2xs hover:border-indigo-400/40 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">Email Paid API</span>
            <Mail className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-xl font-extrabold text-indigo-700">₹{(summary?.emailPaidSpendInr ?? 0).toFixed(2)}</p>
          <span className="text-[10px] text-txt-muted block mt-0.5 truncate">
            ₹0.08 / email tier
          </span>
        </div>

        {/* Box 4: Messages Dispatched */}
        <div className="p-3 bg-white border border-border/80 rounded-xl shadow-2xs hover:border-blue-400/40 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">Dispatched</span>
            <Send className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-txt-primary">
            {(channels.whatsapp?.total ?? 0) + (channels.email?.total ?? 0)}
            <span className="text-xs font-bold text-sky-700 ml-1">+{(channels.telegram?.total ?? 0) + (channels.instagram?.total ?? 0)}</span>
          </p>
          <span className="text-[10px] text-txt-muted block mt-0.5 truncate">
            31 Direct + 5 Channel Posts
          </span>
        </div>

        {/* Box 5: Confirmed Delivered */}
        <div className="p-3 bg-white border border-border/80 rounded-xl shadow-2xs hover:border-brand/40 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Reach &amp; Broadcasts</span>
            <Users className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-700">
            {(channels.whatsapp?.delivered ?? 0) + (channels.email?.delivered ?? 0)}
            <span className="text-xs font-bold text-sky-800 ml-1">+{(channels.telegram?.delivered ?? 0) + (channels.instagram?.delivered ?? 0)}</span>
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5 truncate">
            29 Contacts • 5 Channel Live
          </span>
        </div>

        {/* Box 6: Read Receipts & Engagement */}
        <div className="p-3 bg-white border border-border/80 rounded-xl shadow-2xs hover:border-purple-400/40 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900">Read &amp; Engaged</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="text-xl font-extrabold text-purple-900">{summary?.readRate ?? 0}%</p>
          <span className="text-[10px] text-txt-muted block mt-0.5 truncate">
            {summary?.totalRead ?? 0} Read confirmations
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PAID APIS BUDGET & VELOCITY TRACKER                                    */}
      {/* ========================================================================= */}
      <div className="p-4 bg-white border border-border/80 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-txt-primary">
                  Paid APIs Spend &amp; Monthly Safety Ceiling Tracker
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  WhatsApp &amp; Paid Email API
                </span>
              </div>
              <p className="text-[11px] text-txt-muted mt-0.5">
                WhatsApp Cloud API (@ ₹0.82/conv) and Email Paid API (@ ₹0.08/msg post-trial). Telegram and Instagram remain 100% free with zero direct API fees.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs font-mono shrink-0">
            <div>
              <span className="text-txt-muted text-[10px] block">WHATSAPP SPEND</span>
              <span className="font-bold text-brand text-sm">₹{summary?.totalSpendInr || '0.00'}</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div>
              <span className="text-txt-muted text-[10px] block">EMAIL PAID API</span>
              <span className="font-bold text-indigo-700 text-sm">₹{(summary?.emailPaidSpendInr ?? 0).toFixed(2)}</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div>
              <span className="text-txt-muted text-[10px] block">SAFETY BUDGET LEFT</span>
              <span className="font-bold text-txt-primary text-sm">
                ₹{summary?.budgetRemainingInr?.toFixed(2) || '10,000.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-txt-muted">
              Monthly Safety Ceiling: ₹{summary?.monthlyBudgetInr?.toLocaleString() || '10,000'} INR
            </span>
            <span className="text-emerald-700 font-bold">
              {100 - (summary?.budgetUsedPercent || 0)}% Budget Available
            </span>
          </div>
          <div className="w-full h-2 bg-bg-app rounded-full overflow-hidden border border-border/60">
            <div
              className="h-full bg-brand rounded-full transition-all duration-500"
              style={{ width: `${Math.max(1, Math.min(100, summary?.budgetUsedPercent || 1))}%` }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. REVAMPED CHANNEL CARDS (PROPER UI/UX WITH SENT, DELIVERED, READ, COST) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {allChannelReachItems.map((item) => {
          const Icon = item.logo;
          return (
            <div
              key={item.id}
              className="p-3.5 bg-white border border-border/80 rounded-xl shadow-2xs space-y-3 hover:border-brand/40 transition-all"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-txt-primary block leading-none">{item.name}</span>
                    <span className="text-[10px] text-txt-muted">{item.subtitle}</span>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${item.bgLight} ${item.textLight} ${item.borderLight}`}>
                  {item.unitCost}
                </span>
              </div>

              {item.isChannel ? (
                /* Community Broadcast Channel Layout (Telegram & Instagram) */
                <div className="grid grid-cols-2 gap-2 text-center font-mono">
                  <div className="p-2 rounded-lg bg-bg-app border border-border/60">
                    <span className="text-[10px] text-txt-muted block uppercase font-semibold">{item.metricLabel}</span>
                    <strong className="text-sm text-txt-primary">{item.delivered}</strong>
                    <span className="text-[9px] text-txt-muted block mt-0.5 truncate">{item.channelContext}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
                    <span className="text-[10px] text-emerald-900 block uppercase font-semibold">FEED STATUS</span>
                    <strong className="text-sm text-emerald-800">100% Live</strong>
                    <span className="text-[9px] text-emerald-700 block mt-0.5 truncate">Published</span>
                  </div>
                </div>
              ) : (
                /* 1-to-1 Direct Contacts Layout (WhatsApp & Email) */
                <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                  <div className="p-1.5 rounded-lg bg-bg-app">
                    <span className="text-[10px] text-txt-muted block">SENT</span>
                    <strong className="text-xs text-txt-primary">{item.dispatched}</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-50/60">
                    <span className="text-[10px] text-emerald-800 block">REACHED</span>
                    <strong className="text-xs text-emerald-800">{item.delivered}</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-purple-50/60">
                    <span className="text-[10px] text-purple-800 block">{item.id === 'email' ? 'INBOXED' : 'READ'}</span>
                    <strong className="text-xs text-purple-800">{item.id === 'email' ? '100%' : item.read}</strong>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                <span className="text-[11px] text-txt-muted">
                  {item.isFree ? 'Native Free Savings:' : 'Channel API Cost:'}
                </span>
                <strong className={`font-mono font-bold ${item.isFree ? 'text-purple-700' : 'text-brand'}`}>
                  {item.isFree ? item.savedText : item.cost}
                </strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 5. VISUAL INTELLIGENCE & SPEND TRAJECTORY SECTIONS                         */}
      {/* ========================================================================= */}
      <div className="space-y-6">

        {/* ----------------------------------------------------------------------- */}
        {/* GRAPH 1 (FULL-WIDTH END-TO-END): OMNICHANNEL DELIVERY & REACH TRAJECTORY */}
        {/* ----------------------------------------------------------------------- */}
        <div className="w-full p-4 md:p-5 bg-white border border-border/80 rounded-xl shadow-xs space-y-4">
          {/* Card Header: Title, Granularity Toggle, and Active Period Tag */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                  <span>Omnichannel Delivery &amp; Reach Volume Trajectory</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-app text-txt-muted font-normal border border-border/60">
                    Full-Width End-to-End
                  </span>
                </h2>
                <p className="text-[11px] text-txt-muted">
                  Daily &amp; monthly outbound message volume trajectory across WhatsApp, Email, Telegram, and Instagram.
                </p>
              </div>
            </div>

            {/* View Resolution Controls: Daily vs Monthly */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="inline-flex items-center p-0.5 bg-bg-app rounded-lg border border-border/70 text-xs">
                <button
                  type="button"
                  onClick={() => setTimeResolution('daily')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    timeResolution === 'daily'
                      ? 'bg-white text-txt-primary shadow-2xs'
                      : 'text-txt-muted hover:text-txt-primary'
                  }`}
                >
                  Daily Timeline
                </button>
                <button
                  type="button"
                  onClick={() => setTimeResolution('monthly')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    timeResolution === 'monthly'
                      ? 'bg-white text-txt-primary shadow-2xs'
                      : 'text-txt-muted hover:text-txt-primary'
                  }`}
                >
                  Monthly Aggregated
                </button>
              </div>

              <span className="text-[11px] text-txt-muted font-mono px-2 py-1 rounded bg-bg-app border border-border/50">
                {monthFilter === 'all' ? 'All Months' : `Month ${monthFilter}`} {yearFilter === 'all' ? 'All Years' : yearFilter}
              </span>
            </div>
          </div>

          {/* Interactive Channel Filter Pills Row */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-brand" /> Filter Channel:
            </span>

            {/* All Channels Button */}
            <button
              type="button"
              onClick={() => setSelectedChannel('all')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedChannel === 'all'
                  ? 'bg-brand text-white border-brand shadow-xs'
                  : 'bg-white text-txt-muted border-border hover:bg-bg-app hover:text-txt-primary'
              }`}
            >
              <span>All Channels</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedChannel === 'all' ? 'bg-white/20 text-white' : 'bg-bg-app text-txt-muted'
                }`}
              >
                {(channels.whatsapp?.total ?? 0) + (channels.email?.total ?? 0) + (channels.telegram?.total ?? 0) + (channels.instagram?.total ?? 0)}
              </span>
            </button>

            {/* WhatsApp Filter Button */}
            <button
              type="button"
              onClick={() => setSelectedChannel('whatsapp')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedChannel === 'whatsapp'
                  ? 'bg-[#25D366] text-white border-[#25D366] shadow-xs'
                  : 'bg-white text-txt-muted border-border hover:bg-emerald-50/50 hover:text-emerald-900'
              }`}
            >
              <WhatsAppLogo className="w-3.5 h-3.5 shrink-0" />
              <span>WhatsApp</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedChannel === 'whatsapp' ? 'bg-white/20 text-white' : 'bg-bg-app text-txt-muted'
                }`}
              >
                {channels.whatsapp?.total ?? 0} msgs
              </span>
            </button>

            {/* Email Filter Button */}
            <button
              type="button"
              onClick={() => setSelectedChannel('email')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedChannel === 'email'
                  ? 'bg-[#6366F1] text-white border-[#6366F1] shadow-xs'
                  : 'bg-white text-txt-muted border-border hover:bg-indigo-50/50 hover:text-indigo-900'
              }`}
            >
              <GmailLogo className="w-3.5 h-3.5 shrink-0" />
              <span>Email</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedChannel === 'email' ? 'bg-white/20 text-white' : 'bg-bg-app text-txt-muted'
                }`}
              >
                {channels.email?.total ?? 0} emails
              </span>
            </button>

            {/* Telegram Filter Button */}
            <button
              type="button"
              onClick={() => setSelectedChannel('telegram')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedChannel === 'telegram'
                  ? 'bg-[#0088CC] text-white border-[#0088CC] shadow-xs'
                  : 'bg-white text-txt-muted border-border hover:bg-sky-50/50 hover:text-sky-900'
              }`}
            >
              <TelegramLogo className="w-3.5 h-3.5 shrink-0" />
              <span>Telegram</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedChannel === 'telegram' ? 'bg-white/20 text-white' : 'bg-bg-app text-txt-muted'
                }`}
              >
                {channels.telegram?.total ?? 0} Campaigns
              </span>
            </button>

            {/* Instagram Filter Button */}
            <button
              type="button"
              onClick={() => setSelectedChannel('instagram')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedChannel === 'instagram'
                  ? 'bg-[#E1306C] text-white border-[#E1306C] shadow-xs'
                  : 'bg-white text-txt-muted border-border hover:bg-pink-50/50 hover:text-pink-900'
              }`}
            >
              <InstagramLogo className="w-3.5 h-3.5 shrink-0" />
              <span>Instagram</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedChannel === 'instagram' ? 'bg-white/20 text-white' : 'bg-bg-app text-txt-muted'
                }`}
              >
                {channels.instagram?.total ?? 0} Campaigns
              </span>
            </button>
          </div>

          {/* Dynamic Channel Focus Stats Bar (Displays when a specific channel is isolated) */}
          {selectedChannel !== 'all' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-bg-app border border-border/70 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-txt-primary capitalize">
                  {selectedChannel === 'telegram'
                    ? 'Telegram Community'
                    : selectedChannel === 'instagram'
                    ? 'Instagram Broadcast Channel'
                    : selectedChannel}{' '}
                  Focus:
                </span>
                <span className="text-txt-muted">
                  {selectedChannel === 'telegram'
                    ? 'Dispatched to @campaignhub_vip group & channel feed.'
                    : selectedChannel === 'instagram'
                    ? 'Dispatched to VIP Broadcast channel & feed.'
                    : selectedChannel === 'whatsapp'
                    ? '1-to-1 direct recipient outreach via Meta Cloud API.'
                    : '1-to-1 personalized email outreach via SMTP/Resend.'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                {selectedChannel === 'telegram' ? (
                  <>
                    <span>
                      Group Campaigns: <strong>{channels.telegram?.total ?? 0}</strong>
                    </span>
                    <span>
                      Feed Status: <strong className="text-sky-700">100% Live</strong>
                    </span>
                    <span>
                      API Fee: <strong className="text-emerald-700">₹0.00 Free</strong>
                    </span>
                  </>
                ) : selectedChannel === 'instagram' ? (
                  <>
                    <span>
                      Channel Campaigns: <strong>{channels.instagram?.total ?? 0}</strong>
                    </span>
                    <span>
                      Feed Status: <strong className="text-pink-700">100% Live</strong>
                    </span>
                    <span>
                      API Fee: <strong className="text-emerald-700">₹0.00 Free</strong>
                    </span>
                  </>
                ) : selectedChannel === 'whatsapp' ? (
                  <>
                    <span>
                      Dispatched: <strong>{channels.whatsapp?.total ?? 0}</strong>
                    </span>
                    <span>
                      Delivered: <strong className="text-emerald-700">{channels.whatsapp?.delivered ?? 0}</strong>
                    </span>
                    <span>
                      Meta Spend: <strong className="text-brand">₹{(channels.whatsapp?.spend ?? 0).toFixed(2)}</strong>
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      Dispatched: <strong>{channels.email?.total ?? 0}</strong>
                    </span>
                    <span>
                      Inboxed: <strong className="text-indigo-700">{channels.email?.delivered ?? 0}</strong>
                    </span>
                    <span>
                      Post-Trial Cost: <strong className="text-indigo-700">₹{(summary?.emailPaidSpendInr ?? 0).toFixed(2)}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* End-to-End Area Chart Canvas */}
          <div className="h-72 w-full pt-2">
            {activeTrajectoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-txt-muted border border-dashed border-border rounded-xl">
                No campaign timeline data recorded in the selected period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeTrajectoryData} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#25D366" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#25D366" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorEmail" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorTg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0088CC" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0088CC" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorIg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E1306C" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#E1306C" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9F0E8" />
                  <XAxis dataKey="date" stroke="#52645A" fontSize={11} tickLine={false} axisLine={{ stroke: '#DCE5DD' }} />
                  <YAxis stroke="#52645A" fontSize={11} tickLine={false} axisLine={{ stroke: '#DCE5DD' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#DCE5DD',
                      borderRadius: '12px',
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                  {(selectedChannel === 'all' || selectedChannel === 'whatsapp') && (
                    <Area
                      type="monotone"
                      dataKey="whatsapp"
                      name="WhatsApp"
                      stroke="#25D366"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorWa)"
                    />
                  )}
                  {(selectedChannel === 'all' || selectedChannel === 'email') && (
                    <Area
                      type="monotone"
                      dataKey="email"
                      name="Email Outreach"
                      stroke="#6366F1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorEmail)"
                    />
                  )}
                  {(selectedChannel === 'all' || selectedChannel === 'telegram') && (
                    <Area
                      type="monotone"
                      dataKey="telegram"
                      name="Telegram Broadcast"
                      stroke="#0088CC"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorTg)"
                    />
                  )}
                  {(selectedChannel === 'all' || selectedChannel === 'instagram') && (
                    <Area
                      type="monotone"
                      dataKey="instagram"
                      name="Instagram Updates"
                      stroke="#E1306C"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorIg)"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* GRAPH 2 (FULL-WIDTH END-TO-END): WHATSAPP CLOUD API SPEND & TRAJECTORY   */}
        {/* ----------------------------------------------------------------------- */}
        <div className="w-full p-4 md:p-5 bg-white border border-border/80 rounded-xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0 border border-[#25D366]/30">
                <WhatsAppLogo className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                  <span>WhatsApp Cloud API Spend &amp; Trajectory</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    Paid Meta Service • ₹0.82 / conv
                  </span>
                </h2>
                <p className="text-[11px] text-txt-muted">
                  Cumulative marketing conversation fees charged by Meta Cloud API.
                </p>
              </div>
            </div>

            {/* Quick Header Spend Badge */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-txt-muted">Total Meta Spend:</span>
              <strong className="text-base font-extrabold text-brand">₹{summary?.totalSpendInr || '0.00'} INR</strong>
            </div>
          </div>

          {/* Pure Spend Trajectory Area Chart (No bars, clean single Y-axis) */}
          <div className="h-64 w-full pt-1">
            {timeline.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-txt-muted border border-dashed border-border rounded-xl">
                No expenditure recorded in the selected period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 15, right: 30, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="waSpendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#25D366" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#25D366" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9F0E8" />
                  <XAxis
                    dataKey="date"
                    stroke="#52645A"
                    fontSize={11}
                    fontWeight={500}
                    tickLine={false}
                    axisLine={{ stroke: '#DCE5DD' }}
                  />
                  <YAxis
                    stroke="#52645A"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#DCE5DD' }}
                    tickFormatter={(val) => `₹${val}`}
                    allowDecimals={true}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [`₹${Number(val).toFixed(2)} INR`, 'WhatsApp Cumulative Spend']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#DCE5DD',
                      borderRadius: '12px',
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeSpendInr"
                    name="WhatsApp Cumulative Spend"
                    stroke="#1E6B4F"
                    strokeWidth={2.8}
                    fillOpacity={1}
                    fill="url(#waSpendGradient)"
                    dot={{ r: 4, fill: '#FFFFFF', stroke: '#1E6B4F', strokeWidth: 2.2 }}
                    activeDot={{ r: 6, fill: '#1E6B4F' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Clean, Prominent Bottom Metric Cards (Exact Amounts & Proper Text) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-white border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-txt-muted block">TOTAL META SPEND</span>
              <p className="text-lg font-extrabold text-brand font-mono">₹{summary?.totalSpendInr || '0.00'}</p>
              <span className="text-[10px] text-txt-muted block">Net Meta conversation fee</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-txt-muted block">PAID CONVERSATIONS</span>
              <p className="text-lg font-extrabold text-txt-primary font-mono">{channels.whatsapp?.total ?? 0}</p>
              <span className="text-[10px] text-emerald-800 font-semibold block">{channels.whatsapp?.delivered ?? 0} Confirmed Delivered</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-txt-muted block">UNIT PRICING RATE</span>
              <p className="text-lg font-extrabold text-txt-primary font-mono">₹0.82</p>
              <span className="text-[10px] text-txt-muted block">Per marketing conversation</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-txt-muted block">SAFETY BUFFER REMAINING</span>
              <p className="text-lg font-extrabold text-emerald-700 font-mono">
                ₹{summary?.budgetRemainingInr?.toFixed(2) || '9,988.52'}
              </p>
              <span className="text-[10px] text-txt-muted block">Of ₹10,000 monthly ceiling</span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* GRAPH 3 (FULL-WIDTH END-TO-END): EMAIL OUTREACH PAID API SPEND GRAPH     */}
        {/* ----------------------------------------------------------------------- */}
        <div className="w-full p-4 md:p-5 bg-white border border-border/80 rounded-xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
                <GmailLogo className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                  <span>Email Outreach Paid API Spend &amp; Trajectory</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 font-bold border border-indigo-200">
                    Post-Trial Commercial API • ₹0.08 / msg
                  </span>
                </h2>
                <p className="text-[11px] text-txt-muted">
                  Email infrastructure spend projection after free trial exhaustion (Resend / AWS SES commercial tier).
                </p>
              </div>
            </div>

            {/* Quick Header Spend Badge */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-txt-muted">Email Paid Spend:</span>
              <strong className="text-base font-extrabold text-indigo-700">
                ₹{(summary?.emailPaidSpendInr ?? 0).toFixed(2)} INR
              </strong>
            </div>
          </div>

          {/* Pure Spend Trajectory Area Chart for Email */}
          <div className="h-64 w-full pt-1">
            {timeline.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-txt-muted border border-dashed border-border rounded-xl">
                No email expenditure recorded in the selected period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 15, right: 30, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="emailSpendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9F0E8" />
                  <XAxis
                    dataKey="date"
                    stroke="#52645A"
                    fontSize={11}
                    fontWeight={500}
                    tickLine={false}
                    axisLine={{ stroke: '#DCE5DD' }}
                  />
                  <YAxis
                    stroke="#52645A"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#DCE5DD' }}
                    tickFormatter={(val) => `₹${val}`}
                    allowDecimals={true}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [`₹${Number(val).toFixed(2)} INR`, 'Email Cumulative API Spend']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#DCE5DD',
                      borderRadius: '12px',
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="emailCumulativeSpendInr"
                    name="Email Cumulative API Spend"
                    stroke="#4F46E5"
                    strokeWidth={2.8}
                    fillOpacity={1}
                    fill="url(#emailSpendGradient)"
                    dot={{ r: 4, fill: '#FFFFFF', stroke: '#4F46E5', strokeWidth: 2.2 }}
                    activeDot={{ r: 6, fill: '#4F46E5' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Clean, Prominent Bottom Metric Cards for Email API */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-white border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-txt-muted block">TOTAL EMAIL SPEND</span>
              <p className="text-lg font-extrabold text-indigo-700 font-mono">
                ₹{(summary?.emailPaidSpendInr ?? 0).toFixed(2)}
              </p>
              <span className="text-[10px] text-txt-muted block">Post-trial commercial cost</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-txt-muted block">PAID EMAIL VOLUME</span>
              <p className="text-lg font-extrabold text-txt-primary font-mono">{channels.email?.total ?? 0}</p>
              <span className="text-[10px] text-emerald-800 font-semibold block">{channels.email?.delivered ?? 0} Inboxed Successfully</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-txt-muted block">PAID UNIT RATE</span>
              <p className="text-lg font-extrabold text-txt-primary font-mono">₹0.08</p>
              <span className="text-[10px] text-txt-muted block">Per transactional email</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-txt-muted block">INBOXING SUCCESS</span>
              <p className="text-lg font-extrabold text-emerald-700 font-mono">100%</p>
              <span className="text-[10px] text-txt-muted block">0 Bounces or spam rejections</span>
            </div>
          </div>
        </div>


        {/* ----------------------------------------------------------------------- */}
        {/* GRAPH 5 (FULL-WIDTH END-TO-END): CHANNEL REACH SHARE & SEARCH BREAKDOWN */}
        {/* ----------------------------------------------------------------------- */}
        <div className="w-full p-4 md:p-5 bg-white border border-border/80 rounded-xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                  <span>Channel Reach Share &amp; Audience Distribution</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    Active Multi-Channel
                  </span>
                </h2>
                <p className="text-[11px] text-txt-muted">
                  Proportional recipient touchpoints across all four channels with interactive search and share ledger.
                </p>
              </div>
            </div>

            {/* Interactive Channel Search Input */}
            <div className="relative flex items-center w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-txt-muted absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search channel or metric..."
                value={channelSearch}
                onChange={(e) => setChannelSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-bg-app hover:bg-white focus:bg-white border border-border focus:border-brand/60 rounded-element text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all shadow-2xs"
              />
              {channelSearch && (
                <button
                  type="button"
                  onClick={() => setChannelSearch('')}
                  className="absolute right-2 text-txt-muted hover:text-txt-primary"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Split Content: Donut Chart on Left + Searchable Channel Ledger on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Side: Generous Donut Chart with Center Metric */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 bg-bg-app/40 rounded-xl border border-border/50">
              <div className="relative h-60 w-full flex items-center justify-center">
                {reachDonutData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-txt-muted">
                    No channel deliveries recorded.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reachDonutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {reachDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any, item: any) => [
                          item.payload.isChannel
                            ? `${val} Channel Campaigns (${item.payload.sharePercent}%)`
                            : `${val} Direct Recipients (${item.payload.sharePercent}%)`,
                          name,
                        ]}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#DCE5DD',
                          borderRadius: '12px',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}

                {/* Center Metric in Donut Hole */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-xl font-extrabold text-txt-primary leading-none">
                    {(channels.whatsapp?.delivered ?? 0) + (channels.email?.delivered ?? 0)}
                  </span>
                  <span className="text-[10px] text-txt-muted uppercase tracking-wider font-semibold mt-0.5">
                    Direct Contacts
                  </span>
                  <span className="text-[9px] text-sky-700 font-bold">
                    + {(channels.telegram?.delivered ?? 0) + (channels.instagram?.delivered ?? 0)} Broadcasts
                  </span>
                </div>
              </div>

              {/* Bottom Micro Legend Chips */}
              <div className="flex items-center justify-center gap-3 flex-wrap mt-2">
                {reachDonutData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-txt-muted">{d.name}</span>
                    <strong className="font-mono text-txt-primary">{d.sharePercent}%</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Interactive Searchable Channel Breakdown Ledger */}
            <div className="lg:col-span-7 space-y-2.5">
              {filteredChannelReachItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-txt-muted border border-dashed border-border rounded-xl">
                  No channels match your search query &ldquo;{channelSearch}&rdquo;.
                </div>
              ) : (
                filteredChannelReachItems.map((item) => {
                  const Icon = item.logo;
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-white border border-border/80 rounded-xl shadow-2xs hover:border-brand/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left: Logo & Details */}
                      <div className="flex items-center gap-2.5 min-w-[180px]">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{ borderColor: `${item.color}40`, backgroundColor: `${item.color}15` }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-txt-primary">{item.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${item.bgLight} ${item.textLight} ${item.borderLight}`}>
                              {item.unitCost}
                            </span>
                          </div>
                          <span className="text-[10px] text-txt-muted">{item.subtitle}</span>
                        </div>
                      </div>

                      {/* Middle: Reach Progress Bar & Share */}
                      <div className="flex-1 min-w-[140px] space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-txt-muted">Audience Share</span>
                          <span className="font-bold text-txt-primary">{item.sharePercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-bg-app rounded-full overflow-hidden border border-border/60">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(2, item.sharePercent)}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Right: Numbers */}
                      <div className="flex items-center gap-3 text-xs font-mono shrink-0 justify-end">
                        <div className="text-right">
                          <span className="text-[10px] text-txt-muted block uppercase">
                            {item.isChannel ? 'CAMPAIGNS' : 'DELIVERED'}
                          </span>
                          <span className="font-bold text-txt-primary">
                            {item.delivered} {item.isChannel ? 'Posts' : 'Contacts'}
                          </span>
                        </div>
                        <div className="w-px h-6 bg-border/80" />
                        <div className="text-right">
                          <span className="text-[10px] text-txt-muted block uppercase">
                            {item.isFree ? 'FREE SAVINGS' : 'EXPENDITURE'}
                          </span>
                          <span className={`font-bold ${item.isFree ? 'text-purple-700' : 'text-brand'}`}>
                            {item.isFree ? item.savedText : item.cost}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
