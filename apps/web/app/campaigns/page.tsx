'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  History,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  Send,
  X,
  RotateCcw,
} from 'lucide-react';
import { WhatsAppLogo, GmailLogo, TelegramLogo, InstagramLogo } from '@/components/ui/BrandIcons';
import { Button } from '@/components/ui/Button';

interface CampaignStats {
  queued: number;
  sent: number;
  delivered: number;
  failed: number;
}

interface CampaignItem {
  id: string;
  name: string;
  category?: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  channels: string[];
  audience_tier?: string;
  audience_tags?: string[];
  recipientsCount: number;
  progressPercent: number;
  totalCostInr?: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  scheduled_for?: string;
  stats: CampaignStats;
}

export default function CampaignHistoryPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCampaigns(data.data);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // 1. Global Date Scope Filter (Month & Year controlling all page metrics & records)
  const dateFilteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      if (monthFilter === 'all' && yearFilter === 'all') return true;
      if (!c.created_at) return false;
      const d = new Date(c.created_at);
      if (isNaN(d.getTime())) return false;

      if (monthFilter !== 'all') {
        const monthNum = d.getMonth() + 1; // 1 to 12
        if (String(monthNum) !== monthFilter) return false;
      }

      if (yearFilter !== 'all') {
        const yearNum = d.getFullYear();
        if (String(yearNum) !== yearFilter) return false;
      }

      return true;
    });
  }, [campaigns, monthFilter, yearFilter]);

  // 2. Aggregate Metrics for Top Small Stat Boxes (Reactively updated by Month & Year)
  const metrics = useMemo(() => {
    const totalCampaigns = dateFilteredCampaigns.length;
    const completedCampaigns = dateFilteredCampaigns.filter((c) => c.status === 'completed').length;
    const runningCampaigns = dateFilteredCampaigns.filter((c) => c.status === 'running').length;

    let totalRecipients = 0;
    let totalDelivered = 0;
    let totalFailed = 0;
    let totalCostInr = 0;
    let waCount = 0;
    let emailCount = 0;
    let tgCount = 0;
    let igCount = 0;

    dateFilteredCampaigns.forEach((c) => {
      totalRecipients += c.recipientsCount || 0;
      totalDelivered += c.stats?.delivered || 0;
      totalFailed += c.stats?.failed || 0;
      totalCostInr += c.totalCostInr || 0;

      if (c.channels?.includes('whatsapp')) waCount += (c.stats?.delivered || 0) + (c.stats?.sent || 0) || c.recipientsCount || 1;
      if (c.channels?.includes('email')) emailCount += (c.stats?.delivered || 0) + (c.stats?.sent || 0) || c.recipientsCount || 1;
      if (c.channels?.includes('telegram')) tgCount += 1;
      if (c.channels?.includes('instagram')) igCount += 1;
    });

    const deliveryRate = totalRecipients > 0 ? Math.round((totalDelivered / totalRecipients) * 100) : 100;

    return {
      totalCampaigns,
      completedCampaigns,
      runningCampaigns,
      totalRecipients,
      totalDelivered,
      deliveryRate,
      totalCostInr: totalCostInr.toFixed(2),
      waCount,
      emailCount,
      tgCount,
      igCount,
    };
  }, [dateFilteredCampaigns]);

  // 3. Filtered campaigns for data table (Search, Channel, Status, Tier applied on dateFilteredCampaigns)
  const filteredCampaigns = useMemo(() => {
    return dateFilteredCampaigns.filter((c) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(q);
        const matchesCat = c.category?.toLowerCase().includes(q);
        const matchesTags = c.audience_tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesCat && !matchesTags) return false;
      }

      // Channel
      if (channelFilter !== 'all') {
        if (!c.channels?.includes(channelFilter)) return false;
      }

      // Status
      if (statusFilter !== 'all') {
        if (c.status !== statusFilter) return false;
      }

      // Tier
      if (tierFilter !== 'all') {
        if (c.audience_tier !== tierFilter) return false;
      }

      return true;
    });
  }, [dateFilteredCampaigns, searchQuery, channelFilter, statusFilter, tierFilter]);

  // 4. Pre-calculate filter counts for reactive badges (scoped to selected Month & Year)
  const channelCounts = useMemo(() => {
    return {
      all: dateFilteredCampaigns.length,
      whatsapp: dateFilteredCampaigns.filter((c) => c.channels?.includes('whatsapp')).length,
      email: dateFilteredCampaigns.filter((c) => c.channels?.includes('email')).length,
      telegram: dateFilteredCampaigns.filter((c) => c.channels?.includes('telegram')).length,
      instagram: dateFilteredCampaigns.filter((c) => c.channels?.includes('instagram')).length,
    };
  }, [dateFilteredCampaigns]);

  const statusCounts = useMemo(() => {
    return {
      all: dateFilteredCampaigns.length,
      completed: dateFilteredCampaigns.filter((c) => c.status === 'completed').length,
      running: dateFilteredCampaigns.filter((c) => c.status === 'running').length,
      scheduled: dateFilteredCampaigns.filter((c) => c.status === 'scheduled').length,
      draft: dateFilteredCampaigns.filter((c) => c.status === 'draft').length,
    };
  }, [dateFilteredCampaigns]);

  const tierCounts = useMemo(() => {
    return {
      all: dateFilteredCampaigns.length,
      vip: dateFilteredCampaigns.filter((c) => c.audience_tier === 'vip').length,
      regular: dateFilteredCampaigns.filter((c) => c.audience_tier === 'regular').length,
      lead: dateFilteredCampaigns.filter((c) => c.audience_tier === 'lead').length,
    };
  }, [dateFilteredCampaigns]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    channelFilter !== 'all' ||
    statusFilter !== 'all' ||
    tierFilter !== 'all' ||
    monthFilter !== 'all' ||
    yearFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setChannelFilter('all');
    setStatusFilter('all');
    setTierFilter('all');
    setMonthFilter('all');
    setYearFilter('all');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Completed
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Running
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-500" />
            Scheduled
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Draft
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Paused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 capitalize">
            {status}
          </span>
        );
    }
  };

  const getTierBadge = (tier?: string) => {
    if (tier === 'vip') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          👑 VIP Guests
        </span>
      );
    }
    if (tier === 'regular') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Regulars
        </span>
      );
    }
    if (tier === 'lead') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          Leads
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        All Audience
      </span>
    );
  };

  return (
    <div className="w-full space-y-5 pb-20">
      {/* Top Header: Title, Description & Action */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-txt-muted mb-1">
            <span className="hover:text-txt-primary cursor-pointer" onClick={() => router.push('/overview')}>
              Dashboard
            </span>
            <ChevronRight className="w-3 h-3 text-txt-muted/60" />
            <span className="text-brand font-semibold">Campaign History</span>
          </div>
          <h1 className="text-xl font-bold text-txt-primary tracking-tight">Campaign History</h1>
          <p className="text-xs text-txt-muted mt-0.5">
            Audit past broadcasts, inspect multi-channel content copies, and review recipient delivery telemetry.
          </p>
        </div>

        {/* Top Right Actions: New Campaign Button + Month & Year Date Scope Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-element shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </Link>

          {/* Month & Year Global Date Scope Filter (to the right of New Campaign) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Month Dropdown */}
            <div className="relative flex items-center">
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
            <div className="relative flex items-center">
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
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP SMALL METRIC STAT BOXES (ORGANIZED IN COMPACT CLEAN CARDS)        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* Box 1: Total Campaigns */}
        <div className="p-3 bg-white border border-border rounded-xl shadow-2xs hover:border-brand/40 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Campaigns</span>
            <History className="w-3.5 h-3.5 text-brand" />
          </div>
          <p className="text-xl font-extrabold text-txt-primary">{metrics.totalCampaigns}</p>
          <span className="text-[10px] text-txt-muted block mt-0.5 truncate">
            {metrics.completedCampaigns} Completed • {metrics.runningCampaigns} Active
          </span>
        </div>

        {/* Box 2: Total Audience Reached */}
        <div className="p-3 bg-white border border-border rounded-xl shadow-2xs hover:border-brand/40 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Audience</span>
            <Users className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-txt-primary">{metrics.totalRecipients}</p>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5 truncate">
            {metrics.totalDelivered} Delivered
          </span>
        </div>

        {/* Box 3: Delivery Rate */}
        <div className="p-3 bg-white border border-border rounded-xl shadow-2xs hover:border-brand/40 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Success Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-700">{metrics.deliveryRate}%</p>
          <span className="text-[10px] text-txt-muted block mt-0.5 truncate">0ms API latency</span>
        </div>

        {/* Box 4: WhatsApp Messages */}
        <div className="p-3 bg-white border border-border rounded-xl shadow-2xs hover:border-[#25D366]/40 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#075E54]">WhatsApp</span>
            <WhatsAppLogo className="w-4 h-4 flex-shrink-0" />
          </div>
          <p className="text-xl font-extrabold text-[#075E54]">{metrics.waCount}</p>
          <span className="text-[10px] text-txt-muted block mt-0.5 truncate">
            ₹{metrics.totalCostInr} INR Cost
          </span>
        </div>

        {/* Box 5: Email Center */}
        <div className="p-3 bg-white border border-border rounded-xl shadow-2xs hover:border-blue-400/40 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">Email</span>
            <GmailLogo className="w-4 h-4 flex-shrink-0" />
          </div>
          <p className="text-xl font-extrabold text-txt-primary">{metrics.emailCount}</p>
          <span className="text-[10px] text-txt-muted block mt-0.5 truncate">100% Inboxed</span>
        </div>

        {/* Box 6: Telegram Broadcasts */}
        <div className="p-3 bg-white border border-border rounded-xl shadow-2xs hover:border-sky-400/40 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0088CC]">Telegram</span>
            <TelegramLogo className="w-4 h-4 flex-shrink-0" />
          </div>
          <p className="text-xl font-extrabold text-txt-primary">{metrics.tgCount}</p>
          <span className="text-[10px] text-txt-muted block mt-0.5 truncate">Channel Posts</span>
        </div>

        {/* Box 7: Instagram Broadcasts */}
        <div className="p-3 bg-white border border-border rounded-xl shadow-2xs hover:border-pink-400/40 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-700">Instagram</span>
            <InstagramLogo className="w-4 h-4 flex-shrink-0" />
          </div>
          <p className="text-xl font-extrabold text-txt-primary">{metrics.igCount}</p>
          <span className="text-[10px] text-txt-muted block mt-0.5 truncate">Broadcast Updates</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & MULTI-FILTER ACTION BAR (PROFESSIONAL END-TO-END UI/UX)       */}
      {/* ========================================================================= */}
      <div className="p-4 bg-white border border-border/80 rounded-2xl shadow-xs space-y-4">
        {/* ROW 1: Search Bar (left) + Audience Tier (right, no "Showing 6 of 6") */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-brand/70 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search campaigns by name, category, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-bg-app/70 hover:bg-bg-app focus:bg-white border border-border focus:border-brand/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/10 font-medium placeholder:text-txt-muted/70 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary p-0.5 rounded transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Group: Audience Tier Pills + Reset Button (NO "Showing 6 of 6" text!) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Users className="w-3.5 h-3.5 text-brand" /> Audience:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'All', count: tierCounts.all },
                { id: 'vip', label: '👑 VIP', count: tierCounts.vip },
                { id: 'regular', label: 'Regulars', count: tierCounts.regular },
                { id: 'lead', label: 'Leads', count: tierCounts.lead },
              ].map((t) => {
                const isActive = tierFilter === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTierFilter(t.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border transition-all cursor-pointer shadow-2xs ${
                      isActive
                        ? 'bg-brand-soft text-brand font-bold border-brand/50 ring-1 ring-brand/20 shadow-xs'
                        : 'bg-white text-txt-muted hover:text-txt-primary hover:bg-bg-accentSoft/60 border-border/80 font-medium'
                    }`}
                  >
                    <span>{t.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono transition-colors ${
                        isActive ? 'bg-brand/15 text-brand font-bold' : 'bg-bg-app text-txt-muted'
                      }`}
                    >
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-brand hover:text-brand-hover bg-brand-soft hover:bg-brand-soft/80 border border-brand/30 rounded-xl transition-all cursor-pointer shadow-2xs ml-1"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/60" />

        {/* ROW 2: Channel Section (Full-Width End-to-End, Bigger Length-Wise) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand" /> Deployed Channels:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 w-full">
            {[
              { id: 'all', label: 'All Channels', icon: Layers, count: channelCounts.all },
              { id: 'whatsapp', label: 'WhatsApp', icon: WhatsAppLogo, count: channelCounts.whatsapp },
              { id: 'email', label: 'Email', icon: GmailLogo, count: channelCounts.email },
              { id: 'telegram', label: 'Telegram', icon: TelegramLogo, count: channelCounts.telegram },
              { id: 'instagram', label: 'Instagram', icon: InstagramLogo, count: channelCounts.instagram },
            ].map((ch) => {
              const Icon = ch.icon;
              const isActive = channelFilter === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setChannelFilter(ch.id)}
                  className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs ${
                    isActive
                      ? 'bg-brand-soft text-brand font-bold border-brand/50 ring-1 ring-brand/20 shadow-xs'
                      : 'bg-white text-txt-muted hover:text-txt-primary hover:bg-bg-accentSoft/60 border-border/80 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs truncate">{ch.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors shrink-0 ${
                      isActive ? 'bg-brand/15 text-brand font-bold' : 'bg-bg-app text-txt-muted'
                    }`}
                  >
                    {ch.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ROW 3: Status Section (Full-Width End-to-End, Symmetrical to Channels, Bigger Length-Wise) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand" /> Execution Status:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 w-full">
            {[
              { id: 'all', label: 'All Statuses', dot: null, count: statusCounts.all },
              { id: 'completed', label: 'Completed', dot: 'bg-emerald-500', count: statusCounts.completed },
              { id: 'running', label: 'Running', dot: 'bg-blue-500 animate-pulse', count: statusCounts.running },
              { id: 'scheduled', label: 'Scheduled', dot: 'bg-amber-500', count: statusCounts.scheduled },
              { id: 'draft', label: 'Draft', dot: 'bg-slate-400', count: statusCounts.draft },
            ].map((s) => {
              const isActive = statusFilter === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatusFilter(s.id)}
                  className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs ${
                    isActive
                      ? 'bg-brand-soft text-brand font-bold border-brand/50 ring-1 ring-brand/20 shadow-xs'
                      : 'bg-white text-txt-muted hover:text-txt-primary hover:bg-bg-accentSoft/60 border-border/80 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {s.dot ? (
                      <span className={`w-2.5 h-2.5 rounded-full ${s.dot} shrink-0`} />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0" />
                    )}
                    <span className="text-xs truncate">{s.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors shrink-0 ${
                      isActive ? 'bg-brand/15 text-brand font-bold' : 'bg-bg-app text-txt-muted'
                    }`}
                  >
                    {s.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CAMPAIGNS DATA TABLE                                                  */}
      {/* ========================================================================= */}
      <div className="bg-white border border-border rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-txt-muted space-y-2">
            <span className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin inline-block"></span>
            <p className="font-medium">Loading campaign records and delivery audits...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="py-16 text-center text-xs text-txt-muted space-y-3">
            <AlertCircle className="w-8 h-8 text-txt-muted mx-auto opacity-50" />
            <p className="text-sm font-semibold text-txt-primary">No campaigns found</p>
            <p className="max-w-sm mx-auto text-[11px]">
              No broadcast records match your active search or filters. Try resetting filters or compose a new campaign.
            </p>
            <Button
              variant="secondary"
              onClick={handleResetFilters}
              className="text-xs h-8 px-4"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-surface border-b border-border text-[11px] font-bold text-txt-muted uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Campaign Name &amp; Purpose</th>
                  <th className="py-3 px-3">Channels Deployed</th>
                  <th className="py-3 px-3">Audience Target</th>
                  <th className="py-3 px-3">Execution Status</th>
                  <th className="py-3 px-3">Delivery Rate</th>
                  <th className="py-3 px-3">Date Run</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCampaigns.map((camp) => {
                  return (
                    <tr
                      key={camp.id}
                      onClick={() => router.push(`/campaigns/${camp.id}`)}
                      className="hover:bg-bg-accentSoft/60 transition-colors cursor-pointer group"
                    >
                      {/* 1. Campaign Name & Purpose */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-txt-primary group-hover:text-brand transition-colors text-[13px] block">
                            {camp.name}
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10.5px] px-2 py-0.2 rounded bg-bg-app border border-border text-txt-muted font-medium">
                              {camp.category || 'Multi-Channel Outreach'}
                            </span>
                            {camp.totalCostInr ? (
                              <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                                • Cost: ₹{camp.totalCostInr}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* 2. Channels Deployed with Official Logos */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {camp.channels?.map((ch) => (
                            <span
                              key={ch}
                              className="w-7 h-7 rounded-lg bg-bg-app border border-border flex items-center justify-center p-1 shadow-2xs"
                              title={ch.toUpperCase()}
                            >
                              {ch === 'whatsapp' && <WhatsAppLogo className="w-full h-full" />}
                              {ch === 'email' && <GmailLogo className="w-full h-full" />}
                              {ch === 'telegram' && <TelegramLogo className="w-full h-full" />}
                              {ch === 'instagram' && <InstagramLogo className="w-full h-full" />}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 3. Audience Target */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <div>{getTierBadge(camp.audience_tier)}</div>
                          <span className="text-[11px] text-txt-muted font-mono block">
                            {camp.recipientsCount || 0} Recipients
                          </span>
                        </div>
                      </td>

                      {/* 4. Execution Status */}
                      <td className="py-3.5 px-3">{getStatusBadge(camp.status)}</td>

                      {/* 5. Delivery Progress Bar */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1 w-28">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="font-bold text-txt-primary">{camp.progressPercent || 0}%</span>
                            <span className="text-txt-muted text-[10px]">
                              {camp.stats?.delivered || 0}/{camp.recipientsCount || 0}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-bg-input rounded-full overflow-hidden border border-border/60">
                            <div
                              className="h-full bg-brand rounded-full transition-all"
                              style={{ width: `${camp.progressPercent || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 6. Date Run */}
                      <td className="py-3.5 px-3 text-txt-muted text-[11px] whitespace-nowrap">
                        <span className="block font-medium text-txt-primary">
                          {new Date(camp.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[10px] text-txt-muted">
                          {new Date(camp.created_at).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* 7. Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white group-hover:bg-brand group-hover:text-white border border-border group-hover:border-brand rounded-lg text-xs font-semibold text-txt-primary transition-all shadow-2xs">
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
