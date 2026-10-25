'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface AudienceEngagementProps {
  totalContacts: number;
}

export function AudienceEngagementCard({ totalContacts = 8 }: AudienceEngagementProps) {
  return (
    <div className="w-full bg-white rounded-2xl border border-border/80 shadow-2xs p-4 sm:p-5 space-y-4">
      {/* Header with Title, Growth Pill, and Contacts Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-2xs">
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-txt-primary">Audience &amp; Growth</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5 text-emerald-600" />
                <span>+75% M-o-M</span>
              </span>
            </div>
            <p className="text-xs text-txt-muted mt-0.5">
              Verified CRM guest database, opt-in consent integrity, and subscriber cohorts.
            </p>
          </div>
        </div>

        <Link
          href="/contacts"
          className="text-xs text-brand hover:underline font-bold flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>Open Full Contact Database ({totalContacts})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Symmetrical 4-Cohort Grid (Small, Proper Boxes Matching Aesthetic) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Cohort 1: VIPs */}
        <div className="p-3.5 bg-bg-app rounded-xl border border-border/70 space-y-1 hover:border-amber-400 transition-all shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-txt-muted font-bold flex items-center gap-1">
              <span>👑 VIP Cohort</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          </div>
          <strong className="text-lg sm:text-xl font-black text-amber-800 block tabular-nums">
            3 Contacts
          </strong>
          <span className="text-[10px] text-txt-muted block">
            Priority gala allocations &bull; 100% RSVP
          </span>
        </div>

        {/* Cohort 2: Regulars */}
        <div className="p-3.5 bg-bg-app rounded-xl border border-border/70 space-y-1 hover:border-blue-400 transition-all shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-txt-muted font-bold flex items-center gap-1">
              <span>⭐ Regulars</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          </div>
          <strong className="text-lg sm:text-xl font-black text-blue-800 block tabular-nums">
            2 Contacts
          </strong>
          <span className="text-[10px] text-txt-muted block">
            Active repeat patrons &bull; 85% attendance
          </span>
        </div>

        {/* Cohort 3: Leads */}
        <div className="p-3.5 bg-bg-app rounded-xl border border-border/70 space-y-1 hover:border-indigo-400 transition-all shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-txt-muted font-bold flex items-center gap-1">
              <span>🎯 Inbound Leads</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          </div>
          <strong className="text-lg sm:text-xl font-black text-indigo-800 block tabular-nums">
            1 Contact
          </strong>
          <span className="text-[10px] text-txt-muted block">
            RSVP inquiries &bull; High conversion
          </span>
        </div>

        {/* Cohort 4: Total CRM Base */}
        <div className="p-3.5 bg-bg-app rounded-xl border border-border/70 space-y-1 hover:border-emerald-400 transition-all shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-txt-muted font-bold flex items-center gap-1">
              <span>👥 Total Verified CRM</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <strong className="text-lg sm:text-xl font-black text-emerald-800 block tabular-nums">
            {totalContacts} Contacts
          </strong>
          <span className="text-[10px] text-txt-muted block">
            100% Deliverable phone &amp; email
          </span>
        </div>
      </div>

      {/* Compliance & Consent Gauge Strip */}
      <div className="p-3.5 bg-bg-app rounded-xl border border-border/70 space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-txt-primary flex items-center gap-1.5 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Audience Consent &amp; Delivery Verification Score</span>
          </span>
          <strong className="text-emerald-700 font-mono text-xs font-bold">
            88.0% Verified Opt-In
          </strong>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-border/60">
          <div className="h-full bg-brand rounded-full transition-all duration-1000" style={{ width: '88%' }}></div>
        </div>

        {/* 4 Multi-Channel Consent Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-txt-muted pt-1">
          <div className="flex items-center justify-between sm:justify-start sm:gap-2">
            <span>WhatsApp Opt-in:</span>
            <strong className="text-emerald-700 font-bold">88% Verified</strong>
          </div>
          <div className="flex items-center justify-between sm:justify-start sm:gap-2">
            <span>Email Deliverability:</span>
            <strong className="text-indigo-700 font-bold">88% Inboxed</strong>
          </div>
          <div className="flex items-center justify-between sm:justify-start sm:gap-2">
            <span>Telegram Subs:</span>
            <strong className="text-sky-700 font-bold">480 Members</strong>
          </div>
          <div className="flex items-center justify-between sm:justify-start sm:gap-2">
            <span>Unsubscribe Rate:</span>
            <strong className="text-emerald-700 font-bold">0.0% (Clean)</strong>
          </div>
        </div>
      </div>

      {/* Trust & Audit Footer */}
      <div className="p-2.5 sm:p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            DPDP India Act &bull; GDPR Ready &bull; Zero Spam Flags &bull; Automatic Opt-Out Compliance
          </span>
        </div>
        <Link
          href="/reports"
          className="text-emerald-800 hover:text-emerald-950 font-bold hover:underline flex items-center gap-1 text-[11px] shrink-0"
        >
          <span>View Compliance Audit Statement</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
