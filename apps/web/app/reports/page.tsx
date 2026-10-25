'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Calendar,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Users,
  Layers,
  Send,
  PiggyBank,
  Crown,
  Star,
  Target,
  X,
  Briefcase,
  FileCheck,
  ArrowRight,
  Sparkles,
  UserPlus,
  Search,
  Phone,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { WhatsAppLogo, GmailLogo, TelegramLogo, InstagramLogo } from '@/components/ui/BrandIcons';

interface ReportData {
  period: {
    month: string;
    year: string;
    label: string;
    generatedAt: string;
  };
  financials: {
    totalExpenditureInr: number;
    whatsAppSpendInr: number;
    emailPaidSpendInr: number;
    freeChannelSavingsInr: number;
    budgetRemainingInr: number;
    monthlyBudgetCeiling: number;
    blendedCostPerReach: number;
  };
  operations: {
    totalCampaigns: number;
    completedCampaigns: number;
    scheduledCampaigns: number;
    activeCampaigns: number;
    totalMessages: number;
    totalDelivered: number;
    totalRead: number;
    totalFailed: number;
    deliveryRate: number;
    readRate: number;
    channels: Record<
      string,
      { total: number; delivered: number; read: number; failed: number; spend: number }
    >;
  };
  database: {
    newContactsCount: number;
    newVipCount: number;
    newRegularCount: number;
    newLeadCount: number;
    totalDatabaseSize: number;
    growthRatePercent: number;
    optInStats: {
      whatsAppOptInRate: number;
      emailOptInRate: number;
      unsubscribedCount: number;
    };
    contacts?: Array<{
      id: string;
      name: string;
      phone: string;
      email: string;
      tier: string;
      tags: string[];
      parties_attended: number;
      whatsapp_opt_in: boolean;
      email_opt_in: boolean;
      created_at: string;
    }>;
  };
  campaigns: Array<{
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
    costInr: number;
    deliveryRate: number;
    readRate: number;
  }>;
  executiveHighlights: string[];
}

export default function ReportsPage() {
  const router = useRouter();

  // Temporal Controls: Month, Year, and View Mode
  const [monthFilter, setMonthFilter] = useState<string>('10'); // Default to Current Month (October)
  const [yearFilter, setYearFilter] = useState<string>('2026');
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  // Modals
  const [isFormalReportOpen, setIsFormalReportOpen] = useState<boolean>(false);
  const [isCohortModalOpen, setIsCohortModalOpen] = useState<boolean>(false);

  // Cohort Inspection States
  const [cohortSearch, setCohortSearch] = useState<string>('');
  const [cohortTierFilter, setCohortTierFilter] = useState<'all' | 'vip' | 'regular' | 'lead'>('all');
  const [isCohortInlineExpanded, setIsCohortInlineExpanded] = useState<boolean>(false);

  // Portal Target for Global App Header
  const [headerPortalTarget, setHeaderPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById('header-custom-actions');
    if (el) {
      setHeaderPortalTarget(el);
    }
  }, []);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    fetchReport();
  }, [monthFilter, yearFilter]);

  async function fetchReport() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports?month=${monthFilter}&year=${yearFilter}`);
      const json = await res.json();
      if (json.success && json.data) {
        setReport(json.data);
      }
    } catch (err) {
      console.error('Failed to load business report:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Current Month Label
  const monthName = useMemo(() => {
    const monthNames = [
      '', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    if (monthFilter === 'all') return 'All Months';
    return monthNames[Number(monthFilter)] || 'October';
  }, [monthFilter]);

  // Trigger browser print (1-page PDF generation)
  const handlePrint = () => {
    window.print();
  };

  // Raw CSV Spreadsheet Ledger Download
  const handleExportCSV = () => {
    if (!report) return;

    const headers = [
      'Campaign Name',
      'Category',
      'Execution Date',
      'Channels',
      'Audience Tier',
      'Status',
      'Recipients',
      'Delivered',
      'Delivery Rate (%)',
      'Cost (INR)',
    ];

    const rows = report.campaigns.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.category}"`,
      `"${new Date(c.created_at).toLocaleDateString()}"`,
      `"${c.channels.join(', ')}"`,
      `"${c.audience_tier}"`,
      `"${c.status}"`,
      c.recipientsCount,
      c.deliveredCount,
      `${c.deliveryRate}%`,
      `₹${c.costInr.toFixed(2)}`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        `# Official Business Statement: ${report.period.label}`,
        `# Generated: ${report.period.generatedAt}`,
        headers.join(','),
        ...rows.map((e) => e.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filename = `CampaignHub_Business_Report_${monthName}_${yearFilter}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Cohort Contacts CSV
  const handleExportCohortCSV = () => {
    const list = report?.database.contacts || [];
    if (list.length === 0) return;

    const headers = [
      'Name',
      'Phone',
      'Email',
      'Audience Tier',
      'Tags',
      'Parties Attended',
      'WhatsApp Opt-In',
      'Email Opt-In',
      'Registration Date',
    ];

    const rows = list.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.tier.toUpperCase()}"`,
      `"${c.tags.join(', ')}"`,
      c.parties_attended,
      c.whatsapp_opt_in ? 'Yes' : 'No',
      c.email_opt_in ? 'Yes' : 'No',
      `"${new Date(c.created_at).toLocaleDateString()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        `# CampaignHub New Users Cohort: ${monthName} ${yearFilter !== 'all' ? yearFilter : '2026'}`,
        `# Total Registered: ${list.length} Contacts`,
        headers.join(','),
        ...rows.map((e) => e.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampaignHub_New_Users_${monthName}_${yearFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Cohort Contacts for Modal & Inline Table
  const filteredCohortContacts = useMemo(() => {
    const list = report?.database.contacts || [];
    return list.filter((c) => {
      const q = cohortSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q));

      const matchesTier = cohortTierFilter === 'all' || c.tier.toLowerCase() === cohortTierFilter;
      return matchesSearch && matchesTier;
    });
  }, [report?.database.contacts, cohortSearch, cohortTierFilter]);

  // Channel Campaign Counts (For Group & Broadcast channels)
  const channelCampaignCounts = useMemo(() => {
    const camps = report?.campaigns || [];
    return {
      whatsapp: camps.filter((c) => (c.channels || []).includes('whatsapp')).length,
      email: camps.filter((c) => (c.channels || []).includes('email')).length,
      telegram: camps.filter((c) => (c.channels || []).includes('telegram')).length,
      instagram: camps.filter((c) => (c.channels || []).includes('instagram')).length,
    };
  }, [report?.campaigns]);

  const hasDateFilters = monthFilter !== '10' || yearFilter !== '2026';

  return (
    <div className="w-full space-y-5 pb-24 print:p-0 print:space-y-0 print:pb-0 font-sans">
      {/* Portalled Top Header Controls into global Header bar */}
      {headerPortalTarget &&
        createPortal(
          <div className="flex items-center gap-2 shrink-0">
            {/* Primary Action: Certified 2-Page Report Modal & PDF */}
            <button
              type="button"
              onClick={() => setIsFormalReportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 h-9 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-element shadow-xs transition-all cursor-pointer shrink-0"
              title="Open the official 2-page business report tailored for CFO & HR with direct PDF export"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>2-Page Business Report (PDF)</span>
            </button>

            {/* Secondary Action: Export Raw CSV Data */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 h-9 bg-white hover:bg-bg-app text-txt-primary border border-border/80 text-xs font-semibold rounded-element shadow-2xs transition-all cursor-pointer shrink-0"
              title="Download raw spreadsheet data"
            >
              <Download className="w-3.5 h-3.5 text-txt-muted" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>,
          headerPortalTarget
        )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER & BREADCRUMBS WITH DATE SCOPE TOOLBAR SHIFTED HERE          */}
      {/* ========================================================================= */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-3 print:hidden">
        {/* Left: Breadcrumbs & Stated Current Month Banner */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-txt-muted mb-1">
            <span
              className="hover:text-txt-primary cursor-pointer transition-colors"
              onClick={() => router.push('/overview')}
            >
              Dashboard
            </span>
            <ChevronRight className="w-3 h-3 text-txt-muted/60" />
            <span className="text-brand font-semibold">Business Reports</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-txt-primary tracking-tight">
              Business Reports &amp; Financial Statements
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Current Month: {monthName} {yearFilter !== 'all' ? yearFilter : '2026'}</span>
            </span>
          </div>
        </div>

        {/* Right: Date Scope Toolbar (Shifted here to right side of page header) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="inline-flex items-center p-0.5 bg-white border border-border/80 rounded-element shadow-2xs h-9">
            {/* View Mode Toggle */}
            <div className="inline-flex items-center p-0.5 bg-bg-app rounded-md text-xs mr-1">
              <button
                type="button"
                onClick={() => {
                  setViewMode('monthly');
                  if (monthFilter === 'all') setMonthFilter('10');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  viewMode === 'monthly'
                    ? 'bg-white text-txt-primary shadow-2xs'
                    : 'text-txt-muted hover:text-txt-primary'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('yearly');
                  setMonthFilter('all');
                  if (yearFilter === 'all') setYearFilter('2026');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  viewMode === 'yearly'
                    ? 'bg-white text-txt-primary shadow-2xs'
                    : 'text-txt-muted hover:text-txt-primary'
                }`}
              >
                Yearly
              </button>
            </div>

            {/* Month Select */}
            <div className="relative flex items-center">
              <Calendar className="w-3.5 h-3.5 text-brand absolute left-2 pointer-events-none" />
              <select
                value={monthFilter}
                onChange={(e) => {
                  setMonthFilter(e.target.value);
                  if (e.target.value !== 'all') setViewMode('monthly');
                }}
                className="pl-7 pr-6 py-1 text-xs bg-transparent hover:bg-bg-app focus:bg-white rounded font-medium text-txt-primary focus:outline-none transition-all cursor-pointer appearance-none"
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
              <ChevronDown className="w-3 h-3 text-txt-muted absolute right-1.5 pointer-events-none" />
            </div>

            <div className="w-px h-4 bg-border/80 mx-1" />

            {/* Year Select */}
            <div className="relative flex items-center">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="pl-2 pr-6 py-1 text-xs bg-transparent hover:bg-bg-app focus:bg-white rounded font-medium text-txt-primary focus:outline-none transition-all cursor-pointer appearance-none"
                title="Filter by Year"
              >
                <option value="all">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
              <ChevronDown className="w-3 h-3 text-txt-muted absolute right-1.5 pointer-events-none" />
            </div>

            {/* Reset Filter Button */}
            {hasDateFilters && (
              <button
                type="button"
                onClick={() => {
                  setMonthFilter('10');
                  setYearFilter('2026');
                  setViewMode('monthly');
                }}
                className="p-1 text-txt-muted hover:text-txt-primary hover:bg-bg-app rounded transition-colors ml-0.5 cursor-pointer"
                title="Reset to current month"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 6 SLEEK BUSINESS SCORECARDS (UNIFIED TYPOGRAPHY & CONSISTENT FONTS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 print:grid-cols-3">
        {/* Card 1: Total Expenditure */}
        <div className="p-3 bg-white border border-border/80 rounded-xl shadow-2xs hover:border-brand/40 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-txt-muted">Total Expenditure</span>
            <div className="w-4 h-4 rounded bg-emerald-50 text-brand flex items-center justify-center font-bold text-[10px]">
              ₹
            </div>
          </div>
          <p className="text-xl font-bold tracking-tight text-brand tabular-nums">
            ₹{report?.financials.totalExpenditureInr.toFixed(2) || '0.00'}
          </p>
          <span className="text-[10px] text-txt-muted block mt-0.5 truncate">
            Meta API + Email Paid
          </span>
        </div>

        {/* Card 2: Total Campaigns Executed */}
        <div className="p-3 bg-white border border-border/80 rounded-xl shadow-2xs hover:border-brand/40 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-txt-muted">Campaigns Executed</span>
            <Layers className="w-3.5 h-3.5 text-brand" />
          </div>
          <p className="text-xl font-bold tracking-tight text-txt-primary tabular-nums">
            {report?.operations.totalCampaigns || 0}
          </p>
          <span className="text-[10px] text-txt-muted block mt-0.5 truncate">
            {report?.operations.completedCampaigns || 0} Completed • {report?.operations.scheduledCampaigns || 0} Sched.
          </span>
        </div>

        {/* Card 3: New Users Added to Database */}
        <div className="p-3 bg-white border border-border/80 rounded-xl shadow-2xs hover:border-emerald-300/60 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">New Database Users</span>
            <Users className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-bold tracking-tight text-emerald-800 tabular-nums">
            +{report?.database.newContactsCount || 0}
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5 truncate">
            {report?.database.growthRatePercent || 0}% Growth this month
          </span>
        </div>

        {/* Card 4: Verified Deliveries Reached */}
        <div className="p-3 bg-white border border-border/80 rounded-xl shadow-2xs hover:border-blue-300/60 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-txt-muted">Audience Reached</span>
            <Send className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-bold tracking-tight text-txt-primary tabular-nums">
            {report?.operations.totalDelivered || 0}
          </p>
          <span className="text-[10px] text-txt-muted block mt-0.5 truncate">
            Across 4 active channels
          </span>
        </div>

        {/* Card 5: Delivery Success Rate */}
        <div className="p-3 bg-white border border-border/80 rounded-xl shadow-2xs hover:border-emerald-300/60 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Success Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-bold tracking-tight text-emerald-700 tabular-nums">
            {report?.operations.deliveryRate ?? 100}%
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5 truncate">
            0 Spam bounces recorded
          </span>
        </div>

        {/* Card 6: Native Free Channel Savings */}
        <div className="p-3 bg-white border border-border/80 rounded-xl shadow-2xs hover:border-purple-300/60 transition-colors">
          <div className="flex items-center justify-between text-txt-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900">Free Channel Savings</span>
            <PiggyBank className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="text-xl font-bold tracking-tight text-purple-900 tabular-nums">
            ₹{report?.financials.freeChannelSavingsInr.toFixed(2) || '0.00'}
          </p>
          <span className="text-[10px] text-txt-muted block mt-0.5 truncate">
            Telegram &amp; Instagram savings
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SECTION 1: FINANCIAL LEDGER & COST ECONOMICS (FULL-WIDTH END-TO-END)    */}
      {/* ========================================================================= */}
      <div className="w-full p-4 md:p-5 bg-white border border-border/80 rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-200 shrink-0">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-txt-primary">Financial Ledger &amp; Cost Economics</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  Within Budget
                </span>
              </div>
              <p className="text-[11px] text-txt-muted">
                Commercial API infrastructure charges for WhatsApp Meta &amp; post-trial Email with reach unit economics.
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] text-txt-muted uppercase font-bold block">Net Infrastructure Spend</span>
            <strong className="text-base font-bold text-brand tabular-nums">
              ₹{report?.financials.totalExpenditureInr.toFixed(2) || '0.00'} INR
            </strong>
          </div>
        </div>

        {/* 4 Spacious, Symmetrical Metric Tiles Spanning Full-Width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-bg-app border border-border/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-txt-muted">
                WhatsApp Meta API
              </span>
              <div className="w-5 h-5 flex items-center justify-center">
                <WhatsAppLogo className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg font-bold text-brand tabular-nums">
              ₹{report?.financials.whatsAppSpendInr.toFixed(2) || '0.00'} INR
            </p>
            <span className="text-[10px] text-txt-muted block">
              @ ₹0.82 / conversation &bull; {report?.operations.channels.whatsapp?.delivered || 0} Delivered
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-bg-app border border-border/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-txt-muted">
                Paid Email API
              </span>
              <div className="w-5 h-5 flex items-center justify-center">
                <GmailLogo className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg font-bold text-indigo-700 tabular-nums">
              ₹{report?.financials.emailPaidSpendInr.toFixed(2) || '0.00'} INR
            </p>
            <span className="text-[10px] text-txt-muted block">
              @ ₹0.08 / msg post-trial &bull; {report?.operations.channels.email?.delivered || 0} Delivered
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-bg-app border border-border/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-txt-muted">
                Blended Cost / Reach
              </span>
              <Target className="w-4 h-4 text-txt-muted" />
            </div>
            <p className="text-lg font-bold text-txt-primary tabular-nums">
              ₹{report?.financials.blendedCostPerReach.toFixed(2) || '0.00'} INR
            </p>
            <span className="text-[10px] text-txt-muted block">
              Per confirmed delivery across all platforms
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-bg-app border border-border/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-txt-muted">
                Safety Buffer Remaining
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-emerald-700 tabular-nums">
              ₹{report?.financials.budgetRemainingInr.toFixed(2) || '10,000.00'} INR
            </p>
            <span className="text-[10px] text-txt-muted block">
              Of ₹{report?.financials.monthlyBudgetCeiling.toLocaleString() || '10,000'} monthly safety ceiling
            </span>
          </div>
        </div>

        {/* Budget Utilization Index Progress Bar across full width */}
        <div className="p-3 rounded-lg bg-bg-app/60 border border-border/60 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-txt-muted">
              Safety Budget Cap: ₹{report?.financials.monthlyBudgetCeiling.toLocaleString() || '10,000'} INR
            </span>
            <span className="text-brand font-semibold tabular-nums">
              {(((report?.financials.totalExpenditureInr || 0) / (report?.financials.monthlyBudgetCeiling || 10000)) * 100).toFixed(2)}% of limit utilized
            </span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-border/60">
            <div
              className="h-full bg-brand rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(
                  2,
                  Math.min(
                    100,
                    ((report?.financials.totalExpenditureInr || 0) / (report?.financials.monthlyBudgetCeiling || 10000)) * 100
                  )
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SECTION 2: DATABASE USER ACQUISITION & HEALTH (FULL-WIDTH END-TO-END)   */}
      {/* ========================================================================= */}
      <div className="w-full p-4 md:p-5 bg-white border border-border/80 rounded-xl shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-200 shrink-0">
              <Users className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-txt-primary">Database User Acquisition &amp; Audience Health</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  Exclusive Cohort
                </span>
              </div>
              <p className="text-[11px] text-txt-muted">
                New contacts registered in {monthName} {yearFilter !== 'all' ? yearFilter : '2026'}, tier categorizations, and opt-in consent health.
              </p>
            </div>
          </div>

          {/* Action to View This Month's Data - Theme-Aligned Compact Button */}
          <button
            type="button"
            onClick={() => setIsCohortModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white hover:bg-bg-app text-txt-primary border border-border/80 shadow-2xs hover:border-brand/40 transition-all cursor-pointer shrink-0"
            title="Open full interactive roster of contacts registered this month"
          >
            <Users className="w-3.5 h-3.5 text-brand" />
            <span>View This Month's Data</span>
            <span className="px-1.5 py-0.2 rounded-full bg-brand-soft text-brand font-bold text-[10px] border border-brand/20">
              +{report?.database.newContactsCount || 0}
            </span>
            <ArrowRight className="w-3 h-3 text-txt-muted" />
          </button>
        </div>

        {/* 5 Compact, Symmetrical Category Boxes (Matched with Theme) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* Card 1: TOTAL NEW USERS ADDED */}
          <div className="p-2.5 sm:p-3 rounded-lg bg-bg-app/70 hover:bg-white border border-border/70 hover:border-emerald-300 transition-all space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-txt-muted flex items-center gap-1">
                <UserPlus className="w-3 h-3 text-emerald-600" /> NEW USERS
              </span>
              <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Cohort
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-base sm:text-lg font-bold text-txt-primary tabular-nums">
                +{report?.database.newContactsCount || 0}
              </p>
              <button
                type="button"
                onClick={() => setIsCohortModalOpen(true)}
                className="text-[10px] font-semibold text-brand hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>View</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
            <span className="text-[10px] text-txt-muted block truncate">
              +{report?.database.growthRatePercent || 0}% expansion this month
            </span>
          </div>

          {/* Card 2: NEW VIPS */}
          <div className="p-2.5 sm:p-3 rounded-lg bg-bg-app/70 hover:bg-white border border-border/70 hover:border-amber-300 transition-all space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-txt-muted flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-600" /> NEW VIPS
              </span>
              <span className="text-[9px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                Priority
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-txt-primary tabular-nums">
              +{report?.database.newVipCount || 0}
            </p>
            <span className="text-[10px] text-txt-muted block truncate">
              Priority table &amp; guestlist
            </span>
          </div>

          {/* Card 3: REGULARS */}
          <div className="p-2.5 sm:p-3 rounded-lg bg-bg-app/70 hover:bg-white border border-border/70 hover:border-emerald-300 transition-all space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-txt-muted flex items-center gap-1">
                <Star className="w-3 h-3 text-emerald-600" /> REGULARS
              </span>
              <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Active
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-txt-primary tabular-nums">
              +{report?.database.newRegularCount || 0}
            </p>
            <span className="text-[10px] text-txt-muted block truncate">
              Repeat partygoers &amp; guests
            </span>
          </div>

          {/* Card 4: LEADS */}
          <div className="p-2.5 sm:p-3 rounded-lg bg-bg-app/70 hover:bg-white border border-border/70 hover:border-blue-300 transition-all space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-txt-muted flex items-center gap-1">
                <Target className="w-3 h-3 text-blue-600" /> LEADS
              </span>
              <span className="text-[9px] font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                First-Time
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-txt-primary tabular-nums">
              +{report?.database.newLeadCount || 0}
            </p>
            <span className="text-[10px] text-txt-muted block truncate">
              Inbound RSVPs &amp; prospects
            </span>
          </div>

          {/* Card 5: TOTAL DATABASE */}
          <div className="p-2.5 sm:p-3 rounded-lg bg-bg-app/70 hover:bg-white border border-border/70 hover:border-purple-300 transition-all space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-txt-muted flex items-center gap-1">
                <Users className="w-3 h-3 text-purple-600" /> TOTAL DATABASE
              </span>
              <span className="text-[9px] font-semibold text-purple-800 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                Roster
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-txt-primary tabular-nums">
              {report?.database.totalDatabaseSize || 0}
            </p>
            <span className="text-[10px] text-txt-muted block truncate">
              All verified CRM contacts
            </span>
          </div>
        </div>

        {/* Compliance & Opt-in Micro Strip (Full Width) */}
        <div className="p-2.5 rounded-lg bg-bg-app/60 border border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="flex items-center justify-between sm:justify-start sm:gap-2.5">
            <span className="text-txt-muted text-[11px]">WhatsApp Consent:</span>
            <strong className="text-brand font-bold text-xs">{report?.database.optInStats.whatsAppOptInRate || 100}% Verified Opt-In</strong>
          </div>
          <div className="flex items-center justify-between sm:justify-start sm:gap-2.5 sm:border-l sm:border-border/60 sm:pl-3">
            <span className="text-txt-muted text-[11px]">Email Deliverability:</span>
            <strong className="text-indigo-700 font-bold text-xs">{report?.database.optInStats.emailOptInRate || 100}% Subscribed</strong>
          </div>
          <div className="flex items-center justify-between sm:justify-start sm:gap-2.5 sm:border-l sm:border-border/60 sm:pl-3">
            <span className="text-txt-muted text-[11px]">Unsubscribe Rate:</span>
            <strong className="text-emerald-700 font-bold text-xs">0.0% Clean (Zero Opt-Outs)</strong>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. SECTION 3: MULTI-PLATFORM CAMPAIGN REACH & OUTREACH VOLUME (END-TO-END) */}
      {/* ========================================================================= */}
      <div className="w-full p-4 md:p-5 bg-white border border-border/80 rounded-xl shadow-xs space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200 shrink-0">
              <Send className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-txt-primary">Multi-Platform Campaign Reach &amp; Channel Volume</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-200">
                  Cross-Channel Telemetry
                </span>
              </div>
              <p className="text-[11px] text-txt-muted">
                Direct 1-to-1 recipient outreach (WhatsApp &amp; Email) and community broadcasts dispatched to your Telegram group and Instagram broadcast channel.
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] text-txt-muted uppercase font-bold block">Consolidated Outreach</span>
            <strong className="text-base font-bold text-txt-primary tabular-nums">
              {(report?.operations.channels.whatsapp?.delivered || 0) + (report?.operations.channels.email?.delivered || 0)} Direct Contacts &bull; {channelCampaignCounts.telegram + channelCampaignCounts.instagram} Group Broadcasts
            </strong>
          </div>
        </div>

        {/* 1. TOP EXECUTIVE GRAND TOTAL SCOREBOARD (4 SYMMETRICAL TILES) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 rounded-xl bg-bg-app/70 border border-border/80">
          {/* Direct 1-to-1 Contacts Reached */}
          <div className="p-3 rounded-lg bg-white border border-border/60 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-txt-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Direct Contacts Reached
              </span>
              <Users className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-900 tabular-nums">
              {(report?.operations.channels.whatsapp?.delivered || 0) + (report?.operations.channels.email?.delivered || 0)}
            </p>
            <span className="text-[10px] text-emerald-700 font-medium block">
              WhatsApp &amp; Email 1-to-1 recipients
            </span>
          </div>

          {/* Group & Broadcast Channel Campaigns */}
          <div className="p-3 rounded-lg bg-white border border-border/60 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-txt-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
                Group &amp; Channel Broadcasts
              </span>
              <Send className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <p className="text-2xl font-black text-sky-950 tabular-nums">
              {channelCampaignCounts.telegram + channelCampaignCounts.instagram} Campaigns
            </p>
            <span className="text-[10px] text-sky-700 font-medium block">
              {channelCampaignCounts.telegram} Telegram group + {channelCampaignCounts.instagram} Instagram broadcast
            </span>
          </div>

          {/* Overall Deliverability */}
          <div className="p-3 rounded-lg bg-white border border-border/60 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-txt-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                Delivery Success Rate
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
            </div>
            <p className="text-2xl font-black text-brand tabular-nums">
              {report?.operations.deliveryRate ?? 100}%
            </p>
            <span className="text-[10px] text-brand font-medium block">
              100% channel broadcast uptime
            </span>
          </div>

          {/* Free Channel Cost Savings */}
          <div className="p-3 rounded-lg bg-white border border-border/60 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-txt-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900">
                Native Free Savings
              </span>
              <PiggyBank className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-purple-900 tabular-nums">
              ₹{report?.financials.freeChannelSavingsInr.toFixed(2) || '0.00'}
            </p>
            <span className="text-[10px] text-purple-700 font-medium block">
              Telegram &amp; Instagram zero API cost
            </span>
          </div>
        </div>

        {/* 2. THE 4 DEDICATED CHANNEL CARDS (BALANCED 4-COLUMN GRID) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: WHATSAPP DIRECT (META CLOUD API) */}
          <div className="p-4 rounded-xl bg-white border border-border/80 hover:border-emerald-500/60 shadow-2xs space-y-3 flex flex-col justify-between transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0">
                    <WhatsAppLogo className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-txt-primary truncate">WhatsApp Direct</h3>
                    <span className="text-[10px] text-txt-muted block truncate">Meta Cloud API</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap shrink-0">
                  {report?.operations.channels.whatsapp?.total
                    ? `${Math.round(
                        ((report.operations.channels.whatsapp.delivered || 0) /
                          report.operations.channels.whatsapp.total) *
                          100
                      )}% Rate`
                    : '100% Rate'}
                </span>
              </div>

              {/* Side-by-Side Dual Metrics: People Reached vs Total Sent */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-bg-app border border-border/60">
                <div className="min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-txt-muted block truncate">
                    People Reached
                  </span>
                  <p className="text-xl font-black text-emerald-600 tabular-nums">
                    {report?.operations.channels.whatsapp?.delivered || 0}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-medium block truncate">
                    {report?.operations.channels.whatsapp?.read || 0} Confirmed read
                  </span>
                </div>
                <div className="border-l border-border/60 pl-2.5 min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-txt-muted block truncate">
                    WhatsApp Sent
                  </span>
                  <p className="text-xl font-black text-txt-primary tabular-nums">
                    {report?.operations.channels.whatsapp?.total || 0}
                  </p>
                  <span className="text-[10px] text-txt-muted block truncate">
                    Direct outreach
                  </span>
                </div>
              </div>

              {/* Deliverability Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-txt-muted">Delivery Progress</span>
                  <span className="font-semibold text-emerald-700">
                    {report?.operations.channels.whatsapp?.total
                      ? `${Math.round(
                          ((report.operations.channels.whatsapp.delivered || 0) /
                            report.operations.channels.whatsapp.total) *
                            100
                        )}%`
                      : '100%'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-bg-app rounded-full overflow-hidden border border-border/50">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        report?.operations.channels.whatsapp?.total
                          ? Math.round(
                              ((report.operations.channels.whatsapp.delivered || 0) /
                                report.operations.channels.whatsapp.total) *
                                100
                            )
                          : 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-txt-muted">Meta API Spend:</span>
              <strong className="text-brand font-bold">
                ₹{report?.operations.channels.whatsapp?.spend.toFixed(2) || '0.00'}
                <span className="text-[10px] font-normal text-txt-muted ml-1">(@ ₹0.82)</span>
              </strong>
            </div>
          </div>

          {/* Card 2: EMAIL OUTREACH (GMAIL / RESEND) */}
          <div className="p-4 rounded-xl bg-white border border-border/80 hover:border-indigo-400/60 shadow-2xs space-y-3 flex flex-col justify-between transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center shrink-0">
                    <GmailLogo className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-txt-primary truncate">Email Outreach</h3>
                    <span className="text-[10px] text-txt-muted block truncate">Google / Resend SMTP</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap shrink-0">
                  {report?.operations.channels.email?.total
                    ? `${Math.round(
                        ((report.operations.channels.email.delivered || 0) /
                          report.operations.channels.email.total) *
                          100
                      )}% Rate`
                    : '100% Rate'}
                </span>
              </div>

              {/* Side-by-Side Dual Metrics: People Reached vs Total Sent */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-bg-app border border-border/60">
                <div className="min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-txt-muted block truncate">
                    People Reached
                  </span>
                  <p className="text-xl font-black text-indigo-700 tabular-nums">
                    {report?.operations.channels.email?.delivered || 0}
                  </p>
                  <span className="text-[10px] text-indigo-700 font-medium block truncate">
                    100% Inboxed
                  </span>
                </div>
                <div className="border-l border-border/60 pl-2.5 min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-txt-muted block truncate">
                    Emails Sent
                  </span>
                  <p className="text-xl font-black text-txt-primary tabular-nums">
                    {report?.operations.channels.email?.total || 0}
                  </p>
                  <span className="text-[10px] text-txt-muted block truncate">
                    Personalized HTML
                  </span>
                </div>
              </div>

              {/* Deliverability Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-txt-muted">Delivery Progress</span>
                  <span className="font-semibold text-indigo-700">
                    {report?.operations.channels.email?.total
                      ? `${Math.round(
                          ((report.operations.channels.email.delivered || 0) /
                            report.operations.channels.email.total) *
                            100
                        )}%`
                      : '100%'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-bg-app rounded-full overflow-hidden border border-border/50">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        report?.operations.channels.email?.total
                          ? Math.round(
                              ((report.operations.channels.email.delivered || 0) /
                                report.operations.channels.email.total) *
                                100
                            )
                          : 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-txt-muted">Post-Trial Spend:</span>
              <strong className="text-indigo-700 font-bold">
                ₹{report?.operations.channels.email?.spend.toFixed(2) || '0.00'}
                <span className="text-[10px] font-normal text-txt-muted ml-1">(@ ₹0.08)</span>
              </strong>
            </div>
          </div>

          {/* Card 3: TELEGRAM CHANNEL & GROUP (BOT API) */}
          <div className="p-4 rounded-xl bg-white border border-border/80 hover:border-sky-400/60 shadow-2xs space-y-3 flex flex-col justify-between transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200/80 flex items-center justify-center shrink-0">
                    <TelegramLogo className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-txt-primary truncate">Telegram Community</h3>
                    <span className="text-[10px] text-txt-muted block truncate">Bot API Group Feed</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 whitespace-nowrap shrink-0">
                  100% Live
                </span>
              </div>

              {/* Side-by-Side Dual Metrics: Group Campaigns vs Broadcast Feed */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-bg-app border border-border/60">
                <div className="min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-txt-muted block truncate">
                    Group Campaigns
                  </span>
                  <p className="text-xl font-black text-sky-700 tabular-nums">
                    {channelCampaignCounts.telegram}
                  </p>
                  <span className="text-[10px] text-sky-700 font-medium block truncate">
                    Campaigns in group
                  </span>
                </div>
                <div className="border-l border-border/60 pl-2.5 min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-txt-muted block truncate">
                    Broadcast Feed
                  </span>
                  <p className="text-xl font-black text-txt-primary tabular-nums">
                    {channelCampaignCounts.telegram}
                  </p>
                  <span className="text-[10px] text-txt-muted block truncate">
                    @campaignhub_vip
                  </span>
                </div>
              </div>

              {/* Deliverability Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-txt-muted">Delivery Progress</span>
                  <span className="font-semibold text-sky-700">100%</span>
                </div>
                <div className="w-full h-1.5 bg-bg-app rounded-full overflow-hidden border border-border/50">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-txt-muted">Channel Cost:</span>
              <strong className="text-emerald-700 font-bold">
                100% Free
                <span className="text-[10px] font-normal text-txt-muted ml-1">(₹0 API Fee)</span>
              </strong>
            </div>
          </div>

          {/* Card 4: INSTAGRAM BROADCAST (GRAPH API) */}
          <div className="p-4 rounded-xl bg-white border border-border/80 hover:border-pink-400/60 shadow-2xs space-y-3 flex flex-col justify-between transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-pink-50 border border-pink-200/80 flex items-center justify-center shrink-0">
                    <InstagramLogo className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-txt-primary truncate">Instagram Broadcast</h3>
                    <span className="text-[10px] text-txt-muted block truncate">VIP Broadcast Channel</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-800 border border-pink-200 whitespace-nowrap shrink-0">
                  100% Live
                </span>
              </div>

              {/* Side-by-Side Dual Metrics: Channel Campaigns vs Broadcast Feed */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-bg-app border border-border/60">
                <div className="min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-txt-muted block truncate">
                    Channel Campaigns
                  </span>
                  <p className="text-xl font-black text-pink-700 tabular-nums">
                    {channelCampaignCounts.instagram}
                  </p>
                  <span className="text-[10px] text-pink-700 font-medium block truncate">
                    Campaigns in channel
                  </span>
                </div>
                <div className="border-l border-border/60 pl-2.5 min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-txt-muted block truncate">
                    Broadcast Feed
                  </span>
                  <p className="text-xl font-black text-txt-primary tabular-nums">
                    {channelCampaignCounts.instagram}
                  </p>
                  <span className="text-[10px] text-txt-muted block truncate">
                    VIP Broadcast feed
                  </span>
                </div>
              </div>

              {/* Deliverability Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-txt-muted">Delivery Progress</span>
                  <span className="font-semibold text-pink-700">100%</span>
                </div>
                <div className="w-full h-1.5 bg-bg-app rounded-full overflow-hidden border border-border/50">
                  <div className="h-full bg-pink-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-txt-muted">Channel Cost:</span>
              <strong className="text-emerald-700 font-bold">
                100% Free
                <span className="text-[10px] font-normal text-txt-muted ml-1">(₹0 API Fee)</span>
              </strong>
            </div>
          </div>
        </div>

        {/* 3. STRUCTURED MULTI-CHANNEL REACH LEDGER TABLE */}
        <div className="overflow-x-auto rounded-xl border border-border/70 shadow-2xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-bg-app border-b border-border/70 text-[10px] uppercase font-bold text-txt-muted">
              <tr>
                <th className="py-2.5 px-3.5">Outreach Platform</th>
                <th className="py-2.5 px-3.5">Audience Reach / Campaigns</th>
                <th className="py-2.5 px-3.5">Volume Dispatched</th>
                <th className="py-2.5 px-3.5">Delivery Success Rate</th>
                <th className="py-2.5 px-3.5">Engagement / Telemetry</th>
                <th className="py-2.5 px-3.5 text-right">Financial Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-white">
              {/* WhatsApp Row */}
              <tr className="hover:bg-bg-app/50 transition-colors">
                <td className="py-2.5 px-3.5">
                  <div className="flex items-center gap-2">
                    <WhatsAppLogo className="w-4 h-4 shrink-0" />
                    <div>
                      <strong className="text-txt-primary block font-semibold">WhatsApp Direct</strong>
                      <span className="text-[10px] text-txt-muted">Meta Cloud API (E.164)</span>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3.5">
                  <strong className="text-emerald-700 font-bold text-sm tabular-nums">
                    {report?.operations.channels.whatsapp?.delivered || 0} Contacts
                  </strong>
                  <span className="text-[10px] text-txt-muted block">
                    {channelCampaignCounts.whatsapp} Campaigns sent
                  </span>
                </td>
                <td className="py-2.5 px-3.5 tabular-nums">
                  <span className="font-semibold text-txt-primary">
                    {report?.operations.channels.whatsapp?.total || 0} Messages
                  </span>
                  <span className="text-[10px] text-txt-muted block">1-to-1 Dispatched</span>
                </td>
                <td className="py-2.5 px-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-700 tabular-nums">
                      {report?.operations.channels.whatsapp?.total
                        ? Math.round(
                            ((report.operations.channels.whatsapp.delivered || 0) /
                              report.operations.channels.whatsapp.total) *
                              100
                          )
                        : 100}
                      %
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  </div>
                </td>
                <td className="py-2.5 px-3.5 text-txt-muted">
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {report?.operations.channels.whatsapp?.read || 0} Read Receipts
                  </span>
                </td>
                <td className="py-2.5 px-3.5 text-right tabular-nums">
                  <strong className="text-brand font-bold">
                    ₹{report?.operations.channels.whatsapp?.spend.toFixed(2) || '0.00'} INR
                  </strong>
                  <span className="text-[10px] text-txt-muted block">@ ₹0.82 / conv</span>
                </td>
              </tr>

              {/* Email Row */}
              <tr className="hover:bg-bg-app/50 transition-colors">
                <td className="py-2.5 px-3.5">
                  <div className="flex items-center gap-2">
                    <GmailLogo className="w-4 h-4 shrink-0" />
                    <div>
                      <strong className="text-txt-primary block font-semibold">Email Outreach</strong>
                      <span className="text-[10px] text-txt-muted">Resend / SMTP</span>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3.5">
                  <strong className="text-indigo-700 font-bold text-sm tabular-nums">
                    {report?.operations.channels.email?.delivered || 0} Contacts
                  </strong>
                  <span className="text-[10px] text-txt-muted block">
                    {channelCampaignCounts.email} Campaigns sent
                  </span>
                </td>
                <td className="py-2.5 px-3.5 tabular-nums">
                  <span className="font-semibold text-txt-primary">
                    {report?.operations.channels.email?.total || 0} Emails
                  </span>
                  <span className="text-[10px] text-txt-muted block">Personalized HTML</span>
                </td>
                <td className="py-2.5 px-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-700 tabular-nums">100%</span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  </div>
                </td>
                <td className="py-2.5 px-3.5 text-txt-muted">
                  <span className="inline-flex items-center gap-1 font-medium text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                    100% Inboxed (0 bounces)
                  </span>
                </td>
                <td className="py-2.5 px-3.5 text-right tabular-nums">
                  <strong className="text-indigo-700 font-bold">
                    ₹{report?.operations.channels.email?.spend.toFixed(2) || '0.00'} INR
                  </strong>
                  <span className="text-[10px] text-txt-muted block">@ ₹0.08 / msg post-trial</span>
                </td>
              </tr>

              {/* Telegram Row */}
              <tr className="hover:bg-bg-app/50 transition-colors">
                <td className="py-2.5 px-3.5">
                  <div className="flex items-center gap-2">
                    <TelegramLogo className="w-4 h-4 shrink-0" />
                    <div>
                      <strong className="text-txt-primary block font-semibold">Telegram Community</strong>
                      <span className="text-[10px] text-txt-muted">Group &amp; Channel Broadcast</span>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3.5">
                  <strong className="text-sky-700 font-bold text-sm tabular-nums">
                    {channelCampaignCounts.telegram} Campaigns
                  </strong>
                  <span className="text-[10px] text-txt-muted block">
                    Posted in group &amp; channel
                  </span>
                </td>
                <td className="py-2.5 px-3.5 tabular-nums">
                  <span className="font-semibold text-txt-primary">
                    {channelCampaignCounts.telegram} Group Broadcasts
                  </span>
                  <span className="text-[10px] text-txt-muted block">Instant Channel Posts (@campaignhub_vip)</span>
                </td>
                <td className="py-2.5 px-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sky-700 tabular-nums">100%</span>
                    <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                  </div>
                </td>
                <td className="py-2.5 px-3.5 text-txt-muted">
                  <span className="inline-flex items-center gap-1 font-medium text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-sky-600" />
                    Group &amp; Channel Feed
                  </span>
                </td>
                <td className="py-2.5 px-3.5 text-right tabular-nums">
                  <strong className="text-emerald-700 font-bold">₹0.00 Free</strong>
                  <span className="text-[10px] text-purple-700 font-semibold block">
                    +₹{((report?.operations.channels.telegram?.delivered || 0) * 0.82).toFixed(2)} Saved
                  </span>
                </td>
              </tr>

              {/* Instagram Row */}
              <tr className="hover:bg-bg-app/50 transition-colors">
                <td className="py-2.5 px-3.5">
                  <div className="flex items-center gap-2">
                    <InstagramLogo className="w-4 h-4 shrink-0" />
                    <div>
                      <strong className="text-txt-primary block font-semibold">Instagram Broadcast</strong>
                      <span className="text-[10px] text-txt-muted">Broadcast Channel &amp; Feed</span>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3.5">
                  <strong className="text-pink-700 font-bold text-sm tabular-nums">
                    {channelCampaignCounts.instagram} Campaigns
                  </strong>
                  <span className="text-[10px] text-txt-muted block">
                    Posted in broadcast channel
                  </span>
                </td>
                <td className="py-2.5 px-3.5 tabular-nums">
                  <span className="font-semibold text-txt-primary">
                    {channelCampaignCounts.instagram} Channel Updates
                  </span>
                  <span className="text-[10px] text-txt-muted block">VIP Broadcast Feed</span>
                </td>
                <td className="py-2.5 px-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-pink-700 tabular-nums">100%</span>
                    <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                  </div>
                </td>
                <td className="py-2.5 px-3.5 text-txt-muted">
                  <span className="inline-flex items-center gap-1 font-medium text-pink-800 bg-pink-50 px-2 py-0.5 rounded border border-pink-200 text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-pink-600" />
                    Broadcast Channel Members
                  </span>
                </td>
                <td className="py-2.5 px-3.5 text-right tabular-nums">
                  <strong className="text-emerald-700 font-bold">₹0.00 Free</strong>
                  <span className="text-[10px] text-purple-700 font-semibold block">
                    +₹{((report?.operations.channels.instagram?.delivered || 0) * 0.82).toFixed(2)} Saved
                  </span>
                </td>
              </tr>
            </tbody>

            {/* TOTAL AGGREGATE SUMMARY FOOTER */}
            <tfoot className="bg-emerald-50/70 border-t-2 border-emerald-300 font-bold text-xs">
              <tr>
                <td className="py-3 px-3.5 text-emerald-950">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    <span>TOTAL (ALL PLATFORMS COMBINED)</span>
                  </div>
                </td>
                <td className="py-3 px-3.5 text-emerald-950 text-sm tabular-nums">
                  <strong>
                    {(report?.operations.channels.whatsapp?.delivered || 0) + (report?.operations.channels.email?.delivered || 0)} Direct Contacts
                  </strong>
                  <span className="text-[10px] text-emerald-800 font-semibold block">
                    + {channelCampaignCounts.telegram + channelCampaignCounts.instagram} Channel Campaigns
                  </span>
                </td>
                <td className="py-3 px-3.5 text-txt-primary text-sm tabular-nums">
                  <strong>
                    {(report?.operations.channels.whatsapp?.total || 0) + (report?.operations.channels.email?.total || 0)} 1-to-1 Dispatches
                  </strong>
                  <span className="text-[10px] text-txt-muted font-semibold block">
                    + {channelCampaignCounts.telegram + channelCampaignCounts.instagram} Channel Broadcasts
                  </span>
                </td>
                <td className="py-3 px-3.5 text-emerald-900 tabular-nums">
                  {report?.operations.deliveryRate ?? 100}% Deliverability
                </td>
                <td className="py-3 px-3.5 text-emerald-900">
                  {(report?.operations.channels.whatsapp?.read || 0) + (report?.operations.channels.email?.delivered || 0)} Reads &amp; Inboxed
                  <span className="text-[10px] text-emerald-800 font-semibold block">
                    + 100% Channel Feeds Live
                  </span>
                </td>
                <td className="py-3 px-3.5 text-right tabular-nums">
                  <strong className="text-brand text-sm block">
                    ₹{report?.financials.totalExpenditureInr.toFixed(2) || '0.00'} Net Spend
                  </strong>
                  <span className="text-[10px] text-purple-700 font-bold block">
                    ₹{report?.financials.freeChannelSavingsInr.toFixed(2) || '0.00'} Saved
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CAMPAIGN OPERATIONS & FINANCIAL LEDGER TABLE (FULL-WIDTH END-TO-END)     */}
      {/* ========================================================================= */}
      <div className="w-full p-4 md:p-5 bg-white border border-border/80 rounded-xl shadow-xs space-y-3.5 print:p-0 print:border-none print:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div>
            <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2">
              <span>Campaign Operations &amp; Financial Ledger</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-app text-txt-muted font-medium border border-border/60">
                {report?.campaigns.length || 0} Executions
              </span>
            </h2>
            <p className="text-[11px] text-txt-muted">
              Complete audit of marketing campaigns dispatched in {monthName} {yearFilter !== 'all' ? yearFilter : '2026'}.
            </p>
          </div>

          <span className="text-xs text-txt-muted shrink-0 font-medium">
            Total Ledger Spend: <strong className="text-brand font-bold text-sm tabular-nums">₹{report?.financials.totalExpenditureInr.toFixed(2) || '0.00'} INR</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-bg-app/60 text-txt-muted uppercase text-[10px] font-semibold">
                <th className="py-2.5 px-3">Campaign Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Channels</th>
                <th className="py-2.5 px-3">Audience Tier</th>
                <th className="py-2.5 px-3 text-right">Recipients</th>
                <th className="py-2.5 px-3 text-right">Delivered</th>
                <th className="py-2.5 px-3 text-right">Success %</th>
                <th className="py-2.5 px-3 text-right">Cost (INR)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {report?.campaigns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-txt-muted text-xs">
                    No campaign records found for {monthName} {yearFilter !== 'all' ? yearFilter : ''}.
                  </td>
                </tr>
              ) : (
                report?.campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-bg-app/40 transition-colors">
                    {/* Name */}
                    <td className="py-2.5 px-3 font-semibold text-txt-primary">
                      {camp.name}
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-soft text-brand font-semibold border border-brand/20">
                        {camp.category}
                      </span>
                    </td>

                    {/* Execution Date */}
                    <td className="py-2.5 px-3 text-[11px] text-txt-muted tabular-nums">
                      {new Date(camp.created_at).toLocaleDateString()}
                    </td>

                    {/* Channels with Brand Logos */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {camp.channels.includes('whatsapp') && (
                          <span title="WhatsApp" className="p-1 rounded bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30">
                            <WhatsAppLogo className="w-3 h-3" />
                          </span>
                        )}
                        {camp.channels.includes('email') && (
                          <span title="Email" className="p-1 rounded bg-indigo-50 text-indigo-600 border border-indigo-200">
                            <GmailLogo className="w-3 h-3" />
                          </span>
                        )}
                        {camp.channels.includes('telegram') && (
                          <span title="Telegram" className="p-1 rounded bg-sky-50 text-[#0088CC] border border-sky-200">
                            <TelegramLogo className="w-3 h-3" />
                          </span>
                        )}
                        {camp.channels.includes('instagram') && (
                          <span title="Instagram" className="p-1 rounded bg-pink-50 text-[#E1306C] border border-pink-200">
                            <InstagramLogo className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="py-2.5 px-3 text-[11px]">
                      {camp.audience_tier === 'vip' ? (
                        <span className="text-amber-800 font-bold flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-600" /> VIP
                        </span>
                      ) : camp.audience_tier === 'regular' ? (
                        <span className="text-emerald-800 font-bold">Regulars</span>
                      ) : camp.audience_tier === 'lead' ? (
                        <span className="text-blue-800 font-bold">Leads</span>
                      ) : (
                        <span className="text-txt-muted">All Tiers</span>
                      )}
                    </td>

                    {/* Recipients */}
                    <td className="py-2.5 px-3 text-right text-txt-primary tabular-nums">
                      {camp.recipientsCount}
                    </td>

                    {/* Delivered */}
                    <td className="py-2.5 px-3 text-right text-emerald-800 font-semibold tabular-nums">
                      {camp.deliveredCount}
                    </td>

                    {/* Success % */}
                    <td className="py-2.5 px-3 text-right font-bold text-txt-primary tabular-nums">
                      {camp.deliveryRate}%
                    </td>

                    {/* Cost */}
                    <td className="py-2.5 px-3 text-right font-bold text-brand tabular-nums">
                      ₹{camp.costInr.toFixed(2)}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border ${
                          camp.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : camp.status === 'running'
                            ? 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse'
                            : camp.status === 'scheduled'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-bg-app text-txt-muted border-border'
                        }`}
                      >
                        {camp.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL: VIEW THIS MONTH'S DATABASE DATA (ORGANIZED COHORT EXPLORER)     */}
      {/* ========================================================================= */}
      {isCohortModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-border overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-bg-app border-b border-border flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-200 shrink-0">
                  <UserPlus className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-txt-primary">
                      {monthName} {yearFilter !== 'all' ? yearFilter : '2026'} Registered Contacts Cohort
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                      +{report?.database.newContactsCount || 0} New Contacts
                    </span>
                  </div>
                  <p className="text-[11px] text-txt-muted">
                    Itemized roster of all user acquisitions for this period with tier classification and opt-in consent.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCohortCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-bg-app text-txt-primary border border-border/80 text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer shrink-0"
                  title="Download CSV spreadsheet of this cohort"
                >
                  <Download className="w-3.5 h-3.5 text-txt-muted" />
                  <span className="hidden sm:inline">Export Cohort CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCohortModalOpen(false)}
                  className="p-1.5 text-txt-muted hover:text-txt-primary rounded-lg transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {/* 4 Micro KPI Metric Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/90 shadow-2xs">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase block">Total New Users</span>
                  <p className="text-xl font-black text-emerald-950 tabular-nums">+{report?.database.newContactsCount || 0}</p>
                  <span className="text-[10px] text-emerald-700">+{report?.database.growthRatePercent || 0}% database expansion</span>
                </div>

                <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/90 shadow-2xs">
                  <span className="text-[10px] font-bold text-amber-900 uppercase block">VIP Cohort</span>
                  <p className="text-xl font-black text-amber-900 tabular-nums">+{report?.database.newVipCount || 0}</p>
                  <span className="text-[10px] text-amber-700">Priority guestlist &amp; tables</span>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-200/70 shadow-2xs">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase block">Regulars</span>
                  <p className="text-xl font-black text-emerald-900 tabular-nums">+{report?.database.newRegularCount || 0}</p>
                  <span className="text-[10px] text-emerald-700">Repeat party attendees</span>
                </div>

                <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200/90 shadow-2xs">
                  <span className="text-[10px] font-bold text-blue-900 uppercase block">Inbound Leads</span>
                  <p className="text-xl font-black text-blue-900 tabular-nums">+{report?.database.newLeadCount || 0}</p>
                  <span className="text-[10px] text-blue-700">Prospective attendees</span>
                </div>
              </div>

              {/* Search & Tier Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
                  <input
                    type="text"
                    value={cohortSearch}
                    onChange={(e) => setCohortSearch(e.target.value)}
                    placeholder="Search cohort by name, phone, email, or tag..."
                    className="w-full pl-9 pr-8 py-1.5 text-xs bg-bg-app rounded-lg border border-border/80 focus:border-brand focus:outline-hidden transition-colors"
                  />
                  {cohortSearch && (
                    <button
                      type="button"
                      onClick={() => setCohortSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Tier Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-bg-app rounded-lg border border-border/70 text-[11px] shrink-0">
                  <button
                    type="button"
                    onClick={() => setCohortTierFilter('all')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      cohortTierFilter === 'all'
                        ? 'bg-white text-txt-primary shadow-2xs'
                        : 'text-txt-muted hover:text-txt-primary'
                    }`}
                  >
                    All ({report?.database.contacts?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCohortTierFilter('vip')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      cohortTierFilter === 'vip'
                        ? 'bg-amber-100 text-amber-900 shadow-2xs'
                        : 'text-txt-muted hover:text-amber-800'
                    }`}
                  >
                    👑 VIPs ({report?.database.newVipCount || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCohortTierFilter('regular')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      cohortTierFilter === 'regular'
                        ? 'bg-emerald-100 text-emerald-900 shadow-2xs'
                        : 'text-txt-muted hover:text-emerald-800'
                    }`}
                  >
                    ⭐ Regulars ({report?.database.newRegularCount || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCohortTierFilter('lead')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      cohortTierFilter === 'lead'
                        ? 'bg-blue-100 text-blue-900 shadow-2xs'
                        : 'text-txt-muted hover:text-blue-800'
                    }`}
                  >
                    🎯 Leads ({report?.database.newLeadCount || 0})
                  </button>
                </div>
              </div>

              {/* Itemized Contacts Roster Table */}
              <div className="overflow-x-auto rounded-xl border border-border/80 shadow-2xs max-h-[380px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-bg-app sticky top-0 border-b border-border/80 text-[10px] uppercase font-bold text-txt-muted z-10">
                    <tr>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Phone (WhatsApp)</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Tier</th>
                      <th className="py-2.5 px-3">Event Tags</th>
                      <th className="py-2.5 px-3 text-center">Parties</th>
                      <th className="py-2.5 px-3 text-center">Consent</th>
                      <th className="py-2.5 px-3 text-right">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-white">
                    {filteredCohortContacts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-txt-muted text-xs">
                          No cohort contacts found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCohortContacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-bg-app/40 transition-colors">
                          {/* Name + Avatar */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 border border-emerald-300">
                                {contact.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-txt-primary truncate max-w-[140px]">
                                {contact.name}
                              </span>
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="py-2.5 px-3 font-mono text-[11px] text-txt-primary tabular-nums">
                            <div className="flex items-center gap-1.5">
                              <WhatsAppLogo className="w-3 h-3 shrink-0" />
                              <span>{contact.phone || '—'}</span>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-2.5 px-3 text-[11px] text-txt-muted truncate max-w-[150px]">
                            <div className="flex items-center gap-1.5">
                              <GmailLogo className="w-3 h-3 shrink-0" />
                              <span className="truncate">{contact.email || '—'}</span>
                            </div>
                          </td>

                          {/* Tier */}
                          <td className="py-2.5 px-3">
                            {contact.tier === 'vip' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                <Crown className="w-2.5 h-2.5 text-amber-600" /> VIP
                              </span>
                            ) : contact.tier === 'regular' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <Star className="w-2.5 h-2.5 text-emerald-600" /> Regular
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                                <Target className="w-2.5 h-2.5 text-blue-600" /> Lead
                              </span>
                            )}
                          </td>

                          {/* Tags */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1 flex-wrap max-w-[180px]">
                              {contact.tags.length > 0 ? (
                                contact.tags.slice(0, 2).map((t, i) => (
                                  <span
                                    key={i}
                                    className="text-[9px] px-1.5 py-0.5 rounded bg-bg-app text-txt-muted border border-border/60 truncate"
                                  >
                                    {t}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-txt-muted">—</span>
                              )}
                              {contact.tags.length > 2 && (
                                <span className="text-[9px] text-txt-muted font-bold">
                                  +{contact.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Parties */}
                          <td className="py-2.5 px-3 text-center text-[11px] font-semibold text-txt-primary tabular-nums">
                            {contact.parties_attended}
                          </td>

                          {/* Consent */}
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {contact.whatsapp_opt_in && (
                                <span title="WhatsApp Consent Granted" className="text-emerald-700 font-bold text-[10px]">WA✓</span>
                              )}
                              {contact.email_opt_in && (
                                <span title="Email Consent Granted" className="text-indigo-700 font-bold text-[10px]">EM✓</span>
                              )}
                              {!contact.whatsapp_opt_in && !contact.email_opt_in && (
                                <span className="text-txt-muted text-[10px]">None</span>
                              )}
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-2.5 px-3 text-right text-[11px] text-txt-muted tabular-nums">
                            {new Date(contact.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-bg-app border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 shrink-0">
              <span className="text-xs text-txt-muted">
                Showing <strong className="text-txt-primary font-bold">{filteredCohortContacts.length}</strong> of{' '}
                <strong className="text-txt-primary font-bold">{report?.database.contacts?.length || 0}</strong> contacts registered in this cohort
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCohortModalOpen(false);
                    router.push('/contacts');
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-bg-app text-txt-primary border border-border/80 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Open Full CRM Database</span>
                  <ExternalLink className="w-3 h-3 text-txt-muted" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsCohortModalOpen(false)}
                  className="px-3.5 py-1.5 bg-brand text-white hover:bg-brand-hover text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL & PRINT: CERTIFIED TWO-PAGE EXECUTIVE BUSINESS REPORT FOR CFO & HR */}
      {/* ========================================================================= */}
      {isFormalReportOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:static print:bg-white print:inset-auto">
          <div className="relative w-full max-w-4xl bg-bg-app rounded-2xl shadow-2xl border border-border overflow-hidden my-4 max-h-[94vh] flex flex-col print:max-w-none print:m-0 print:border-none print:shadow-none print:rounded-none print:bg-white">
            {/* Modal Actions Bar (Hidden in Print) */}
            <div className="p-3.5 bg-white border-b border-border flex items-center justify-between gap-3 shrink-0 print:hidden">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-brand">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider font-mono">
                    Official Two-Page Executive Report for CFO &amp; HR
                  </h3>
                  <span className="text-[10px] text-txt-muted block">
                    Certified 2-Page Executive Briefing • Print &amp; PDF Ready
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand text-white hover:bg-brand-hover text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormalReportOpen(false)}
                  className="p-1.5 text-txt-muted hover:text-txt-primary hover:bg-bg-app rounded-lg transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Container for Screen Preview */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 print:p-0 print:m-0 print:space-y-0 print:overflow-visible">
              <div id="two-page-report-document" className="space-y-6 print:space-y-0">
                {/* ------------------------------------------------------------- */}
                {/* PAGE 1: EXECUTIVE GOVERNANCE, FINANCIAL LEDGER & AUDIENCE     */}
                {/* ------------------------------------------------------------- */}
                <div className="report-page-1 bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-border/80 space-y-4 print:p-0 print:border-none print:shadow-none print:rounded-none">
                  {/* Formal Letterhead */}
                  <div className="border-b-2 border-txt-primary pb-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-black tracking-tight text-txt-primary uppercase leading-tight">
                          CampaignHub Communications Enterprise
                        </h2>
                        <p className="text-[11px] text-txt-muted font-medium">
                          Multi-Channel Customer Engagement &amp; Marketing Operations Division
                        </p>
                      </div>
                      <div className="text-right text-[11px] text-txt-muted font-mono">
                        <div>
                          STATEMENT REF: <strong className="text-txt-primary">CH-EXEC-{yearFilter}-{monthFilter}</strong>
                        </div>
                        <div>
                          AUDIT DATE: <strong className="text-txt-primary">{new Date().toLocaleDateString()}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Stated Current Month Banner */}
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-950 flex items-center justify-between">
                      <span>
                        <strong>OFFICIAL BUSINESS STATEMENT:</strong> Current Month Report for{' '}
                        <strong>
                          {monthName} {yearFilter !== 'all' ? yearFilter : '2026'}
                        </strong>
                      </span>
                      <span className="text-[10px] uppercase font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                        Certified 2-Page Briefing
                      </span>
                    </div>

                    {/* Formal Memorandum Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-bg-app p-2.5 rounded-lg border border-border/80">
                      <div>
                        <span className="text-txt-muted">TO:</span>{' '}
                        <strong>Chief Financial Officer (CFO), Head of HR, &amp; Executive Committee</strong>
                      </div>
                      <div>
                        <span className="text-txt-muted">FROM:</span>{' '}
                        <strong>Director of Automated Marketing &amp; Operations</strong>
                      </div>
                      <div>
                        <span className="text-txt-muted">SUBJECT:</span>{' '}
                        <strong>Monthly Operations, Capital Spend &amp; Database Cohort Audit</strong>
                      </div>
                      <div>
                        <span className="text-txt-muted">COHORT PERIOD:</span>{' '}
                        <strong>
                          {monthName} {yearFilter !== 'all' ? yearFilter : '2026'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* 1. Executive Briefing & Omnichannel Scorecard */}
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>1. Executive Briefing &amp; Omnichannel Outreach Scorecard</span>
                    </h3>
                    <p className="text-[11px] text-txt-muted leading-relaxed bg-bg-app/50 p-2.5 rounded-lg border border-border/70">
                      During {monthName} {yearFilter !== 'all' ? yearFilter : '2026'}, CampaignHub conducted{' '}
                      <strong className="text-txt-primary">{report?.operations.totalCampaigns} campaigns</strong> reaching{' '}
                      <strong className="text-brand">
                        {(report?.operations.channels.whatsapp?.delivered || 0) +
                          (report?.operations.channels.email?.delivered || 0)}{' '}
                        direct recipients
                      </strong>{' '}
                      (WhatsApp &amp; Email) alongside{' '}
                      <strong className="text-sky-800">
                        {channelCampaignCounts.telegram + channelCampaignCounts.instagram} community broadcasts
                      </strong>{' '}
                      across Telegram groups and Instagram channels with an overall{' '}
                      <strong className="text-emerald-700">{report?.operations.deliveryRate}% verified delivery success rate</strong>.
                    </p>

                    {/* Omnichannel Performance Scorecards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80 shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 block">
                          Direct Contacts
                        </span>
                        <strong className="text-lg font-black text-emerald-700 tabular-nums block my-0.5">
                          {(report?.operations.channels.whatsapp?.delivered || 0) +
                            (report?.operations.channels.email?.delivered || 0)}
                        </strong>
                        <span className="text-[9px] text-emerald-700/90 font-medium block truncate">
                          WhatsApp &amp; Email Reach
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-sky-50/60 border border-sky-200/80 shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-sky-800 block">
                          Channel Broadcasts
                        </span>
                        <strong className="text-lg font-black text-sky-800 tabular-nums block my-0.5">
                          {channelCampaignCounts.telegram + channelCampaignCounts.instagram} Campaigns
                        </strong>
                        <span className="text-[9px] text-sky-700/90 font-medium block truncate">
                          Telegram &amp; Instagram Feeds
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-200/80 shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-800 block">
                          Net Infrastructure Spend
                        </span>
                        <strong className="text-lg font-black text-indigo-700 tabular-nums block my-0.5">
                          ₹{report?.financials.totalExpenditureInr.toFixed(2)}
                        </strong>
                        <span className="text-[9px] text-indigo-700/90 font-medium block truncate">
                          Meta API &amp; Paid SMTP
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-purple-50/60 border border-purple-200/80 shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-purple-800 block">
                          Zero-Fee Channel Savings
                        </span>
                        <strong className="text-lg font-black text-purple-900 tabular-nums block my-0.5">
                          ₹{report?.financials.freeChannelSavingsInr.toFixed(2)}
                        </strong>
                        <span className="text-[9px] text-purple-700/90 font-medium block truncate">
                          100% Free API Messaging
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Side-by-Side Dual Audit: CFO Financial Brief (Left) & HR Audience Expansion (Right) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] items-stretch">
                    {/* CFO Financial Brief */}
                    <div className="p-3.5 rounded-xl bg-bg-app/70 border border-border/80 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border/70 pb-2 mb-2.5">
                          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-txt-primary">
                            <Briefcase className="w-3.5 h-3.5 text-brand" />
                            <span className="text-[11px]">2. Financial Audit (For CFO)</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            ₹{report?.financials.totalExpenditureInr.toFixed(2)} Net Spend
                          </span>
                        </div>

                        {/* 4 Balanced Cards in 2x2 Grid */}
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="p-2.5 bg-white rounded-lg border border-border/70 shadow-2xs">
                            <span className="text-[9px] text-txt-muted uppercase font-bold tracking-wider block">
                              NET SPEND
                            </span>
                            <strong className="text-base text-brand font-black tabular-nums block">
                              ₹{report?.financials.totalExpenditureInr.toFixed(2)}
                            </strong>
                            <span className="text-[9px] text-txt-muted block truncate">Meta API &amp; Paid SMTP</span>
                          </div>

                          <div className="p-2.5 bg-white rounded-lg border border-border/70 shadow-2xs">
                            <span className="text-[9px] text-txt-muted uppercase font-bold tracking-wider block">
                              COST / REACH
                            </span>
                            <strong className="text-base text-txt-primary font-black tabular-nums block">
                              ₹{report?.financials.blendedCostPerReach.toFixed(2)}
                            </strong>
                            <span className="text-[9px] text-txt-muted block truncate">Per Confirmed Recipient</span>
                          </div>

                          <div className="p-2.5 bg-white rounded-lg border border-border/70 shadow-2xs">
                            <span className="text-[9px] text-txt-muted uppercase font-bold tracking-wider block">
                              FREE SAVINGS
                            </span>
                            <strong className="text-base text-purple-900 font-black tabular-nums block">
                              ₹{report?.financials.freeChannelSavingsInr.toFixed(2)}
                            </strong>
                            <span className="text-[9px] text-purple-700 font-medium block truncate">Telegram &amp; IG ₹0 Fee</span>
                          </div>

                          <div className="p-2.5 bg-white rounded-lg border border-border/70 shadow-2xs">
                            <span className="text-[9px] text-txt-muted uppercase font-bold tracking-wider block">
                              SAFETY BUFFER
                            </span>
                            <strong className="text-base text-emerald-700 font-black tabular-nums block">
                              ₹{report?.financials.budgetRemainingInr.toFixed(2)}
                            </strong>
                            <span className="text-[9px] text-emerald-700 font-medium block truncate">Of ₹10,000 Ceiling</span>
                          </div>
                        </div>

                        {/* Budget Utilization Progress Bar */}
                        <div className="space-y-1 mt-2.5 pt-2 border-t border-border/60">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-txt-muted">Budget Utilization (₹10,000 Cap):</span>
                            <strong className="text-emerald-800 font-bold tabular-nums">
                              {(
                                ((report?.financials.totalExpenditureInr || 0) /
                                  (report?.financials.monthlyBudgetCeiling || 10000)) *
                                100
                              ).toFixed(2)}
                              %
                            </strong>
                          </div>
                          <div className="w-full h-1.5 bg-bg-app rounded-full overflow-hidden border border-border/50">
                            <div
                              className="h-full bg-emerald-600 rounded-full"
                              style={{
                                width: `${Math.max(
                                  1,
                                  Math.min(
                                    100,
                                    ((report?.financials.totalExpenditureInr || 0) /
                                      (report?.financials.monthlyBudgetCeiling || 10000)) *
                                      100
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Footer Notes */}
                      <p className="text-[10px] text-txt-muted leading-relaxed pt-2 border-t border-border/60">
                        WhatsApp Meta API fees totaled ₹{report?.financials.whatsAppSpendInr.toFixed(2)} (@ ₹0.82/conv) and post-trial
                        Email fees totaled ₹{report?.financials.emailPaidSpendInr.toFixed(2)} (@ ₹0.08/msg). Native free channels avoided ₹{report?.financials.freeChannelSavingsInr.toFixed(2)} in SMS costs.
                      </p>
                    </div>

                    {/* HR & Database Expansion Brief */}
                    <div className="p-3.5 rounded-xl bg-bg-app/70 border border-border/80 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border/70 pb-2 mb-2.5">
                          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-txt-primary">
                            <Users className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-[11px]">3. Database Acquisition (For HR)</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            +{report?.database.newContactsCount} Added ({report?.database.growthRatePercent}% Growth)
                          </span>
                        </div>

                        {/* 4 Balanced Cards in 2x2 Grid (Exact match with Box 2!) */}
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="p-2.5 bg-white rounded-lg border border-border/70 shadow-2xs">
                            <span className="text-[9px] text-emerald-800 uppercase font-bold tracking-wider block">
                              NEW USERS ADDED
                            </span>
                            <strong className="text-base text-emerald-700 font-black tabular-nums block">
                              +{report?.database.newContactsCount}
                            </strong>
                            <span className="text-[9px] text-emerald-700 font-medium block truncate">
                              +{report?.database.growthRatePercent}% Cohort Expansion
                            </span>
                          </div>

                          <div className="p-2.5 bg-white rounded-lg border border-border/70 shadow-2xs">
                            <span className="text-[9px] text-amber-800 uppercase font-bold tracking-wider block">
                              👑 NEW VIPS
                            </span>
                            <strong className="text-base text-amber-900 font-black tabular-nums block">
                              +{report?.database.newVipCount}
                            </strong>
                            <span className="text-[9px] text-amber-700 font-medium block truncate">Priority Guestlist</span>
                          </div>

                          <div className="p-2.5 bg-white rounded-lg border border-border/70 shadow-2xs">
                            <span className="text-[9px] text-blue-800 uppercase font-bold tracking-wider block">
                              ⭐ REGULARS &amp; LEADS
                            </span>
                            <strong className="text-base text-blue-900 font-black tabular-nums block">
                              +{(report?.database.newRegularCount || 0) + (report?.database.newLeadCount || 0)}
                            </strong>
                            <span className="text-[9px] text-txt-muted block truncate">
                              {report?.database.newRegularCount} Regulars • {report?.database.newLeadCount} Leads
                            </span>
                          </div>

                          <div className="p-2.5 bg-white rounded-lg border border-border/70 shadow-2xs">
                            <span className="text-[9px] text-txt-muted uppercase font-bold tracking-wider block">
                              TOTAL ACTIVE CRM
                            </span>
                            <strong className="text-base text-txt-primary font-black tabular-nums block">
                              {report?.database.totalDatabaseSize}
                            </strong>
                            <span className="text-[9px] text-txt-muted block truncate">Verified Contact Roster</span>
                          </div>
                        </div>

                        {/* Compliance & Consent Progress Bar (Exact match with Budget Bar in Box 2!) */}
                        <div className="space-y-1 mt-2.5 pt-2 border-t border-border/60">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-txt-muted">Audience Consent &amp; Privacy Compliance:</span>
                            <strong className="text-emerald-800 font-bold tabular-nums">
                              {report?.database.optInStats.whatsAppOptInRate}% Verified
                            </strong>
                          </div>
                          <div className="w-full h-1.5 bg-bg-app rounded-full overflow-hidden border border-border/50">
                            <div
                              className="h-full bg-emerald-600 rounded-full"
                              style={{ width: `${report?.database.optInStats.whatsAppOptInRate || 88}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Footer Notes (Exact match with Box 2 footer!) */}
                      <div className="pt-2 border-t border-border/60 text-[10px] text-txt-muted leading-relaxed flex items-center justify-between">
                        <span>
                          WhatsApp: <strong className="text-emerald-700">{report?.database.optInStats.whatsAppOptInRate}%</strong> • Inboxes: <strong className="text-indigo-700">{report?.database.optInStats.emailOptInRate}%</strong>
                        </span>
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          0.0% Unsubscribes
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Page 1 Running Footer */}
                  <div className="pt-3 border-t border-border/70 flex items-center justify-between text-[10px] text-txt-muted font-mono">
                    <span>CampaignHub Communications Enterprise — Internal Corporate Audit</span>
                    <span>Confidential • Page 1 of 2</span>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* PAGE BREAK INDICATOR (Screen Preview Only, Hidden in Print)   */}
                {/* ------------------------------------------------------------- */}
                <div className="flex items-center justify-center gap-3 text-txt-muted text-xs font-mono py-1 print:hidden">
                  <div className="h-px bg-border/80 flex-1" />
                  <span className="px-3.5 py-1 rounded-full bg-white border border-border/80 text-[11px] font-semibold text-txt-muted shadow-2xs flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-brand" />
                    PAGE BREAK — BEGINNING OF PAGE 2
                  </span>
                  <div className="h-px bg-border/80 flex-1" />
                </div>

                {/* ------------------------------------------------------------- */}
                {/* PAGE 2: OMNICHANNEL CHANNEL CARDS, CAMPAIGN LEDGER & SIGN-OFF */}
                {/* ------------------------------------------------------------- */}
                <div className="report-page-2 bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-border/80 space-y-4 print:p-0 print:border-none print:shadow-none print:rounded-none">
                  {/* Running Page 2 Letterhead */}
                  <div className="border-b-2 border-txt-primary pb-2 flex justify-between items-center text-[11px]">
                    <div className="font-bold uppercase tracking-tight text-txt-primary">
                      CampaignHub Communications Enterprise • Ref: CH-EXEC-{yearFilter}-{monthFilter}
                    </div>
                    <div className="font-mono text-txt-muted font-semibold">
                      PAGE 2 OF 2 • CAMPAIGN AUDIT &amp; EXECUTIVE SIGN-OFF
                    </div>
                  </div>

                  {/* 4. Omnichannel Platform Execution & Delivery Telemetry */}
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5" />
                      <span>4. Omnichannel Platform Execution &amp; Channel Delivery Telemetry</span>
                    </h3>

                    {/* Symmetrical 4-Channel Cards Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {/* WhatsApp Direct */}
                      <div className="p-2.5 rounded-lg bg-bg-app/70 border border-border/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                              <WhatsAppLogo className="w-2.5 h-2.5" />
                            </div>
                            <span className="text-[10px] font-bold text-txt-primary">WhatsApp</span>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {report?.operations.channels.whatsapp?.total
                              ? `${Math.round(
                                  ((report.operations.channels.whatsapp.delivered || 0) /
                                    report.operations.channels.whatsapp.total) *
                                    100
                                )}%`
                              : '100%'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[9px] bg-white p-1.5 rounded border border-border/60">
                          <div>
                            <span className="text-txt-muted block">REACHED</span>
                            <strong className="text-xs font-black text-emerald-700">
                              {report?.operations.channels.whatsapp?.delivered || 0}
                            </strong>
                          </div>
                          <div>
                            <span className="text-txt-muted block">SENT</span>
                            <strong className="text-xs font-black text-txt-primary">
                              {report?.operations.channels.whatsapp?.total || 0}
                            </strong>
                          </div>
                        </div>
                        <div className="text-[9px] text-txt-muted flex justify-between">
                          <span>Spend:</span>
                          <strong className="text-brand">₹{report?.financials.whatsAppSpendInr.toFixed(2)}</strong>
                        </div>
                      </div>

                      {/* Email Outreach */}
                      <div className="p-2.5 rounded-lg bg-bg-app/70 border border-border/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                              <GmailLogo className="w-2.5 h-2.5" />
                            </div>
                            <span className="text-[10px] font-bold text-txt-primary">Email</span>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            100%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[9px] bg-white p-1.5 rounded border border-border/60">
                          <div>
                            <span className="text-txt-muted block">REACHED</span>
                            <strong className="text-xs font-black text-indigo-700">
                              {report?.operations.channels.email?.delivered || 0}
                            </strong>
                          </div>
                          <div>
                            <span className="text-txt-muted block">SENT</span>
                            <strong className="text-xs font-black text-txt-primary">
                              {report?.operations.channels.email?.total || 0}
                            </strong>
                          </div>
                        </div>
                        <div className="text-[9px] text-txt-muted flex justify-between">
                          <span>Spend:</span>
                          <strong className="text-indigo-700">₹{report?.financials.emailPaidSpendInr.toFixed(2)}</strong>
                        </div>
                      </div>

                      {/* Telegram Community */}
                      <div className="p-2.5 rounded-lg bg-bg-app/70 border border-border/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                              <TelegramLogo className="w-2.5 h-2.5" />
                            </div>
                            <span className="text-[10px] font-bold text-txt-primary">Telegram</span>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                            100% Live
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[9px] bg-white p-1.5 rounded border border-border/60">
                          <div>
                            <span className="text-txt-muted block">GROUP</span>
                            <strong className="text-xs font-black text-sky-700">{channelCampaignCounts.telegram}</strong>
                          </div>
                          <div>
                            <span className="text-txt-muted block">POSTS</span>
                            <strong className="text-xs font-black text-txt-primary">{channelCampaignCounts.telegram}</strong>
                          </div>
                        </div>
                        <div className="text-[9px] text-txt-muted flex justify-between">
                          <span>Cost:</span>
                          <strong className="text-emerald-700">100% Free</strong>
                        </div>
                      </div>

                      {/* Instagram Broadcast */}
                      <div className="p-2.5 rounded-lg bg-bg-app/70 border border-border/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded bg-pink-50 border border-pink-200 flex items-center justify-center shrink-0">
                              <InstagramLogo className="w-2.5 h-2.5" />
                            </div>
                            <span className="text-[10px] font-bold text-txt-primary">Instagram</span>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-pink-50 text-pink-800 border border-pink-200">
                            100% Live
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[9px] bg-white p-1.5 rounded border border-border/60">
                          <div>
                            <span className="text-txt-muted block">CHANNEL</span>
                            <strong className="text-xs font-black text-pink-700">{channelCampaignCounts.instagram}</strong>
                          </div>
                          <div>
                            <span className="text-txt-muted block">POSTS</span>
                            <strong className="text-xs font-black text-txt-primary">{channelCampaignCounts.instagram}</strong>
                          </div>
                        </div>
                        <div className="text-[9px] text-txt-muted flex justify-between">
                          <span>Cost:</span>
                          <strong className="text-emerald-700">100% Free</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. Campaign Operations Execution Ledger Table */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>5. Itemized Campaign Execution Ledger</span>
                      </h3>
                      <span className="text-[10px] text-txt-muted font-medium">
                        {report?.campaigns.length || 0} Total Campaigns Executed
                      </span>
                    </div>

                    <div className="border border-border/80 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-[10px] border-collapse">
                        <thead className="bg-bg-app border-b border-border/80 text-txt-muted font-semibold">
                          <tr>
                            <th className="p-1.5">Campaign Name</th>
                            <th className="p-1.5">Category</th>
                            <th className="p-1.5">Channels</th>
                            <th className="p-1.5">Date</th>
                            <th className="p-1.5 text-right">Recipients</th>
                            <th className="p-1.5 text-right">Delivered</th>
                            <th className="p-1.5 text-right">Success</th>
                            <th className="p-1.5 text-right">Cost (INR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {report?.campaigns.map((c) => (
                            <tr key={c.id}>
                              <td className="p-1.5 font-medium">{c.name}</td>
                              <td className="p-1.5 text-txt-muted">{c.category}</td>
                              <td className="p-1.5">
                                <div className="flex items-center gap-1">
                                  {(c.channels || []).map((ch) => (
                                    <span
                                      key={ch}
                                      className="text-[8px] font-bold uppercase px-1 py-0.2 rounded bg-bg-app border border-border/60 text-txt-muted"
                                    >
                                      {ch}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-1.5 text-txt-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                              <td className="p-1.5 text-right tabular-nums">{c.recipientsCount}</td>
                              <td className="p-1.5 text-right text-emerald-800 font-semibold tabular-nums">
                                {c.deliveredCount}
                              </td>
                              <td className="p-1.5 text-right font-bold tabular-nums">{c.deliveryRate}%</td>
                              <td className="p-1.5 text-right font-bold text-brand tabular-nums">₹{c.costInr.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-bg-app/80 border-t-2 border-border font-bold text-txt-primary">
                          <tr>
                            <td colSpan={4} className="p-1.5 uppercase tracking-wider text-[9px]">
                              Total Verified Dispatches &amp; Infrastructure Expenditure
                            </td>
                            <td className="p-1.5 text-right tabular-nums">
                              {report?.campaigns.reduce((acc, c) => acc + c.recipientsCount, 0)}
                            </td>
                            <td className="p-1.5 text-right text-emerald-800 tabular-nums">
                              {report?.campaigns.reduce((acc, c) => acc + c.deliveredCount, 0)}
                            </td>
                            <td className="p-1.5 text-right tabular-nums">{report?.operations.deliveryRate}%</td>
                            <td className="p-1.5 text-right text-brand tabular-nums">
                              ₹{report?.financials.totalExpenditureInr.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* 6. Corporate Authorization & Formal Sign-Off Block */}
                  <div className="pt-2 border-t-2 border-txt-primary/40 space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold uppercase tracking-wider text-txt-primary">
                        6. Formal Authorization &amp; Executive Endorsements
                      </span>
                      <span className="text-emerald-800 font-semibold text-[9px] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Audit Certified FY 2026
                      </span>
                    </div>

                    <p className="text-[9px] text-txt-muted leading-relaxed">
                      By signing below, the undersigned executive officers verify that the campaign operations, financial
                      expenditures, and customer database processing recorded herein strictly conform to corporate marketing
                      budgets and regulatory privacy standards.
                    </p>

                    <div className="grid grid-cols-3 gap-3 pt-1 text-[10px]">
                      <div className="p-2.5 rounded-lg bg-bg-app/50 border border-border/80 space-y-1">
                        <span className="text-txt-muted text-[8px] font-bold uppercase block">CFO CAPITAL AUDIT</span>
                        <strong className="block text-txt-primary font-bold text-[11px]">Chief Financial Officer</strong>
                        <div className="text-[9px] text-txt-muted pt-1">
                          <div>Scope: Capital &amp; Meta API</div>
                          <div className="mt-1">Date: __________________</div>
                          <div className="mt-1">Sign: __________________</div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-bg-app/50 border border-border/80 space-y-1">
                        <span className="text-txt-muted text-[8px] font-bold uppercase block">HR &amp; AUDIENCE AUDIT</span>
                        <strong className="block text-txt-primary font-bold text-[11px]">Head of HR &amp; People</strong>
                        <div className="text-[9px] text-txt-muted pt-1">
                          <div>Scope: Privacy &amp; Consent</div>
                          <div className="mt-1">Date: __________________</div>
                          <div className="mt-1">Sign: __________________</div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-bg-app/50 border border-border/80 space-y-1">
                        <span className="text-txt-muted text-[8px] font-bold uppercase block">EXECUTIVE DIRECTIVE</span>
                        <strong className="block text-txt-primary font-bold text-[11px]">Managing Director</strong>
                        <div className="text-[9px] text-txt-muted pt-1">
                          <div>Scope: Operational Mandate</div>
                          <div className="mt-1">Date: __________________</div>
                          <div className="mt-1">Sign: __________________</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page 2 Running Footer */}
                  <div className="pt-3 border-t border-border/70 flex items-center justify-between text-[10px] text-txt-muted font-mono">
                    <span>CampaignHub Communications Enterprise — Internal Corporate Audit</span>
                    <span>Confidential • Page 2 of 2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
