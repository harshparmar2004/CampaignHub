'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  History,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  XCircle,
  RotateCcw,
  ExternalLink,
  Users,
  Search,
  Filter,
  ImageIcon,
  LinkIcon,
  MessageSquare,
  Mail,
  Radio,
  FileCode,
  DollarSign,
  Send,
  Eye,
  CheckCheck,
  Sparkles,
} from 'lucide-react';
import { WhatsAppLogo, GmailLogo, TelegramLogo, InstagramLogo } from '@/components/ui/BrandIcons';
import { Button } from '@/components/ui/Button';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [campaign, setCampaign] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [controlLoading, setControlLoading] = useState(false);
  const [activeChannelTab, setActiveChannelTab] = useState<string>('all');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [recipientChannelFilter, setRecipientChannelFilter] = useState('all');

  useEffect(() => {
    fetchCampaign();

    // Auto-refresh every 3s if campaign is in-flight
    const timer = setInterval(() => {
      if (campaign?.status === 'running' || campaign?.status === 'scheduled') {
        fetchCampaign(false);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [id, campaign?.status]);

  async function fetchCampaign(showLoading = true) {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}`);
      const data = await res.json();
      if (data.success) {
        setCampaign(data.data);
      }
    } catch (err) {
      console.error('Fetch campaign failed:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }

  async function handleControl(action: 'pause' | 'resume' | 'cancel') {
    setControlLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCampaign(false);
      } else {
        alert(data.error || 'Control action failed');
      }
    } catch (err: any) {
      alert(err.message || 'Action error');
    } finally {
      setControlLoading(false);
    }
  }

  async function handleRetryFailed() {
    setControlLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/retry`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchCampaign(false);
      } else {
        alert(data.error || 'Retry failed');
      }
    } catch (err: any) {
      alert(err.message || 'Retry error');
    } finally {
      setControlLoading(false);
    }
  }

  // Filter messages for recipient telemetry audit
  const filteredMessages = useMemo(() => {
    if (!campaign?.messages) return [];
    return campaign.messages.filter((m: any) => {
      // Channel filter
      if (recipientChannelFilter !== 'all' && m.channel !== recipientChannelFilter) {
        return false;
      }
      // Search
      if (recipientSearch.trim()) {
        const q = recipientSearch.toLowerCase();
        const contactName = m.contacts?.name?.toLowerCase() || '';
        const contactPhone = m.contacts?.phone?.toLowerCase() || '';
        const contactEmail = m.contacts?.email?.toLowerCase() || '';
        if (!contactName.includes(q) && !contactPhone.includes(q) && !contactEmail.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [campaign?.messages, recipientChannelFilter, recipientSearch]);

  if (isLoading && !campaign) {
    return (
      <div className="py-24 text-center text-xs text-txt-muted space-y-2">
        <span className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="font-medium">Loading campaign operational telemetry &amp; channel contents...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="py-24 text-center text-xs text-txt-muted space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-txt-primary">Campaign Not Found</h2>
        <p className="max-w-sm mx-auto text-txt-muted">
          The requested campaign could not be found or has been removed.
        </p>
        <Button variant="secondary" onClick={() => router.push('/campaigns')} className="text-xs h-8 px-4">
          ← Back to Campaign History
        </Button>
      </div>
    );
  }

  const {
    name,
    category,
    status,
    channels = [],
    audience_tier,
    audience_tags = [],
    totalRecipients = 0,
    progressPercent = 0,
    totalCostInr = 0,
    overallStats = { queued: 0, sent: 0, delivered: 0, failed: 0 },
    channelStats = {},
    created_at,
    started_at,
    completed_at,
    scheduled_for,
  } = campaign;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Completed
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Running Broadcast
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            Scheduled
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Draft
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Paused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 capitalize">
            {status}
          </span>
        );
    }
  };

  const getTierBadge = (tier?: string) => {
    if (tier === 'vip') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          👑 VIP Guests Target
        </span>
      );
    }
    if (tier === 'regular') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Regular Customers
        </span>
      );
    }
    if (tier === 'lead') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          New Leads
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        All Audience Contacts
      </span>
    );
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Top Header: Breadcrumbs & In-Flight Control Actions */}
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-txt-muted mb-1.5">
            <span
              className="hover:text-txt-primary cursor-pointer flex items-center gap-1"
              onClick={() => router.push('/campaigns')}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Campaign History
            </span>
            <ChevronRight className="w-3 h-3 text-txt-muted/60" />
            <span className="text-brand font-semibold truncate max-w-xs">{name}</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-txt-primary tracking-tight">{name}</h1>
            {getStatusBadge(status)}
            <span className="px-2.5 py-0.5 text-xs rounded bg-bg-app border border-border text-txt-muted font-medium">
              {category || 'Multi-Channel Outreach'}
            </span>
          </div>

          <p className="text-xs text-txt-muted mt-1">
            Created on {new Date(created_at).toLocaleString()}
            {started_at && ` • Started ${new Date(started_at).toLocaleTimeString()}`}
            {completed_at && ` • Completed ${new Date(completed_at).toLocaleTimeString()}`}
            {scheduled_for && ` • Scheduled for ${new Date(scheduled_for).toLocaleString()}`}
          </p>
        </div>

        {/* Real-time In-Flight Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => router.push('/campaigns')}
            className="text-xs h-8 px-3.5"
          >
            ← Back to History
          </Button>

          {status === 'running' && (
            <Button
              variant="secondary"
              isLoading={controlLoading}
              onClick={() => handleControl('pause')}
              className="text-xs h-8 px-3.5 border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              <Pause className="w-3.5 h-3.5 mr-1" />
              Pause
            </Button>
          )}

          {status === 'paused' && (
            <Button
              variant="primary"
              isLoading={controlLoading}
              onClick={() => handleControl('resume')}
              className="text-xs h-8 px-3.5"
            >
              <Play className="w-3.5 h-3.5 mr-1" />
              Resume
            </Button>
          )}

          {(status === 'running' || status === 'paused' || status === 'scheduled') && (
            <Button
              variant="danger"
              isLoading={controlLoading}
              onClick={() => handleControl('cancel')}
              className="text-xs h-8 px-3.5"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Cancel Broadcast
            </Button>
          )}

          {overallStats?.failed > 0 && (
            <Button
              variant="secondary"
              isLoading={controlLoading}
              onClick={handleRetryFailed}
              className="text-xs h-8 px-3.5 border-red-200 text-status-failed hover:bg-red-50"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1 text-red-500" />
              Retry Failed ({overallStats.failed})
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP SMALL KPI STAT BOXES                                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Total Targeted */}
        <div className="p-3.5 bg-white border border-border rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-txt-muted block mb-1">
            Total Recipients
          </span>
          <p className="text-2xl font-extrabold text-txt-primary">{totalRecipients}</p>
          <div className="mt-1">{getTierBadge(audience_tier)}</div>
        </div>

        {/* Metric 2: Delivered & Read */}
        <div className="p-3.5 bg-white border border-border rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
            Delivered / Read
          </span>
          <p className="text-2xl font-extrabold text-emerald-700">{overallStats?.delivered || 0}</p>
          <span className="text-[11px] text-txt-muted font-mono block mt-1">
            {totalRecipients > 0 ? Math.round(((overallStats?.delivered || 0) / totalRecipients) * 100) : 100}% Success Rate
          </span>
        </div>

        {/* Metric 3: Sent & Queued */}
        <div className="p-3.5 bg-white border border-border rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-txt-muted block mb-1">
            Sent / In-Flight
          </span>
          <p className="text-2xl font-extrabold text-txt-primary">
            {(overallStats?.sent || 0) + (overallStats?.queued || 0)}
          </p>
          <span className="text-[11px] text-txt-muted font-mono block mt-1">
            {overallStats?.queued || 0} queued in buffer
          </span>
        </div>

        {/* Metric 4: Failed / Bounced */}
        <div className="p-3.5 bg-white border border-border rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-status-failed block mb-1">
            Failed / Bounced
          </span>
          <p className="text-2xl font-extrabold text-status-failed">{overallStats?.failed || 0}</p>
          <span className="text-[11px] text-txt-muted block mt-1">
            {overallStats?.failed > 0 ? 'Action required' : 'Zero delivery errors'}
          </span>
        </div>

        {/* Metric 5: Active Channels */}
        <div className="p-3.5 bg-white border border-border rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-txt-muted block mb-1">
            Channels Deployed
          </span>
          <p className="text-2xl font-extrabold text-txt-primary">{channels.length}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {channels.map((ch: string) => (
              <span key={ch} className="w-5 h-5 flex items-center justify-center">
                {ch === 'whatsapp' && <WhatsAppLogo className="w-full h-full" />}
                {ch === 'email' && <GmailLogo className="w-full h-full" />}
                {ch === 'telegram' && <TelegramLogo className="w-full h-full" />}
                {ch === 'instagram' && <InstagramLogo className="w-full h-full" />}
              </span>
            ))}
          </div>
        </div>

        {/* Metric 6: Total Cost INR */}
        <div className="p-3.5 bg-white border border-border rounded-xl shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-txt-muted block mb-1">
            WhatsApp INR Cost
          </span>
          <p className="text-2xl font-extrabold text-emerald-700">₹{totalCostInr.toFixed(2)}</p>
          <span className="text-[10px] text-txt-muted block mt-1 truncate">Meta Cloud API tariff</span>
        </div>
      </div>

      {/* Campaign Delivery Progress Bar */}
      <div className="p-4 bg-white border border-border rounded-xl shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-txt-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand" />
            <span>Broadcast Execution Progress</span>
          </span>
          <span className="font-mono text-brand font-bold text-sm">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-bg-input border border-border/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MULTI-CHANNEL DETAILED CONTENT INSPECTION CARDS                        */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-txt-primary">Multi-Channel Broadcast Contents</h2>
            <p className="text-xs text-txt-muted mt-0.5">
              Review exactly what flyer, message copy, and interactive destination links were published to each channel.
            </p>
          </div>

          {/* Channel Selector Pills */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setActiveChannelTab('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeChannelTab === 'all' ? 'bg-brand text-white shadow-xs' : 'text-txt-muted hover:text-txt-primary'
              }`}
            >
              All Channels ({channels.length})
            </button>
            {channels.map((ch: string) => (
              <button
                key={ch}
                type="button"
                onClick={() => setActiveChannelTab(ch)}
                className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors flex items-center gap-1.5 ${
                  activeChannelTab === ch ? 'bg-brand text-white shadow-xs' : 'text-txt-muted hover:text-txt-primary'
                }`}
              >
                {ch === 'whatsapp' && <WhatsAppLogo className="w-3.5 h-3.5" />}
                {ch === 'email' && <GmailLogo className="w-3.5 h-3.5" />}
                {ch === 'telegram' && <TelegramLogo className="w-3.5 h-3.5" />}
                {ch === 'instagram' && <InstagramLogo className="w-3.5 h-3.5" />}
                <span>{ch}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2A. WHATSAPP BROADCAST CARD */}
        {channels.includes('whatsapp') && (activeChannelTab === 'all' || activeChannelTab === 'whatsapp') && (
          <div className="bg-white border-2 border-[#25D366] rounded-xl shadow-xs overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 shadow-sm">
                  <WhatsAppLogo className="w-full h-full" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">WhatsApp Broadcast Campaign</h3>
                  <span className="text-[11px] text-white/90">Official Meta Cloud API • High Reliability Broadcast</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono bg-white/20 px-3 py-1 rounded-md border border-white/30 text-white">
                <span>Total Cost: ₹{totalCostInr.toFixed(2)} INR</span>
              </div>
            </div>

            {/* WhatsApp Content Body */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left: Flyer Banner Visual Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#25D366]" />
                    <span>Header Banner Poster</span>
                  </span>

                  {campaign.whatsapp_image_url ? (
                    <div className="bg-slate-900/5 border border-border rounded-xl p-3 flex flex-col items-center justify-center overflow-hidden">
                      <img
                        src={campaign.whatsapp_image_url}
                        alt="WhatsApp Campaign Flyer"
                        className="max-h-60 w-auto max-w-full rounded-lg object-contain shadow-xs border border-border/60"
                      />
                      <div className="flex items-center justify-between w-full mt-2 text-[11px] text-txt-muted font-mono">
                        <span className="truncate max-w-xs">{campaign.whatsapp_image_url}</span>
                        <a
                          href={campaign.whatsapp_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-brand font-semibold hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Full</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-border rounded-xl text-center text-xs text-txt-muted bg-slate-50">
                      No header banner image was attached for this WhatsApp campaign.
                    </div>
                  )}
                </div>

                {/* Right: Message Body Copy & Interactive Action Buttons */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-[#25D366]" />
                      <span>Message Body Copy</span>
                    </span>

                    {/* WhatsApp Bubble Simulation Container */}
                    <div className="p-4 bg-[#EFEAE2] border border-[#DCE5DD] rounded-xl shadow-2xs">
                      <div className="bg-white rounded-lg p-3.5 shadow-xs border border-[#E9EDEF] space-y-2.5">
                        <p className="text-xs text-[#111B21] leading-relaxed whitespace-pre-wrap font-sans">
                          {campaign.whatsapp_message_text ||
                            'Hello {{name}}! We are excited to announce our upcoming special company party and celebration!'}
                        </p>
                        <div className="text-[10px] text-[#667781] text-right flex items-center justify-end gap-1">
                          <span>Delivered</span>
                          <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB] stroke-[2.5]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive CTA Link Buttons */}
                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider block">
                      Interactive CTA Destination Links:
                    </span>
                    {campaign.whatsapp_link_url ? (
                      <a
                        href={campaign.whatsapp_link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between w-full p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{campaign.whatsapp_link_title || 'Action Link / RSVP'}</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-txt-muted block">No action links attached.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2B. INSTAGRAM BROADCAST CARD */}
        {channels.includes('instagram') && (activeChannelTab === 'all' || activeChannelTab === 'instagram') && (
          <div className="bg-white border-2 border-pink-400 rounded-xl shadow-xs overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 shadow-sm">
                  <InstagramLogo className="w-full h-full" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Instagram Broadcast Update</h3>
                  <span className="text-[11px] text-white/90">Official Broadcast Channel Announcement</span>
                </div>
              </div>

              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-md border border-white/30 text-white">
                Broadcast Channel: CampaignHub VIP
              </span>
            </div>

            {/* Instagram Content Body */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Poster / Flyer */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-pink-600" />
                    <span>Instagram Flyer / Creative</span>
                  </span>

                  {campaign.instagram_image_url ? (
                    <div className="bg-slate-900/5 border border-border rounded-xl p-3 flex flex-col items-center justify-center">
                      <img
                        src={campaign.instagram_image_url}
                        alt="Instagram Poster"
                        className="max-h-60 w-auto max-w-full rounded-lg object-contain shadow-xs border border-border/60"
                      />
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-border rounded-xl text-center text-xs text-txt-muted bg-slate-50">
                      No poster was attached.
                    </div>
                  )}
                </div>

                {/* Caption & Destination Link */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-pink-600" />
                      <span>Broadcast Caption</span>
                    </span>
                    <div className="p-4 bg-slate-50 border border-border rounded-xl text-xs text-txt-primary leading-relaxed whitespace-pre-wrap font-sans">
                      {campaign.instagram_caption || 'Exclusive broadcast announcement for all members!'}
                    </div>
                  </div>

                  {campaign.instagram_link_url && (
                    <div className="space-y-1.5 pt-2 border-t border-border/60">
                      <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider block">
                        Action CTA Link:
                      </span>
                      <a
                        href={campaign.instagram_link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between w-full p-2.5 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-lg text-xs font-bold text-pink-800 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <LinkIcon className="w-3.5 h-3.5 text-pink-600" />
                          <span>{campaign.instagram_link_title || 'Join Party Now / RSVP'}</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2C. TELEGRAM BROADCAST CARD */}
        {channels.includes('telegram') && (activeChannelTab === 'all' || activeChannelTab === 'telegram') && (
          <div className="bg-white border-2 border-[#0088CC] rounded-xl shadow-xs overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#0088CC] to-[#2AABEE] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 shadow-sm">
                  <TelegramLogo className="w-full h-full" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Telegram Channel Broadcast</h3>
                  <span className="text-[11px] text-white/90">Automated Bot Dispatch • @campaignhub_vip</span>
                </div>
              </div>

              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-md border border-white/30 text-white">
                Telegram Bot Connected
              </span>
            </div>

            {/* Telegram Content Body */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Visual Image */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#0088CC]" />
                    <span>Telegram Header Graphic</span>
                  </span>

                  {campaign.telegram_image_url ? (
                    <div className="bg-slate-900/5 border border-border rounded-xl p-3 flex flex-col items-center justify-center">
                      <img
                        src={campaign.telegram_image_url}
                        alt="Telegram Banner"
                        className="max-h-60 w-auto max-w-full rounded-lg object-contain shadow-xs border border-border/60"
                      />
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-border rounded-xl text-center text-xs text-txt-muted bg-slate-50">
                      No visual graphic attached.
                    </div>
                  )}
                </div>

                {/* Formatted Text & Links */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-[#0088CC]" />
                      <span>Formatted HTML Post</span>
                    </span>
                    <div
                      className="p-4 bg-sky-50/60 border border-sky-100 rounded-xl text-xs text-txt-primary leading-relaxed whitespace-pre-wrap font-sans"
                      dangerouslySetInnerHTML={{
                        __html: campaign.telegram_text || 'Hey everyone! Special announcement for all members.',
                      }}
                    />
                  </div>

                  {campaign.telegram_link_url && (
                    <div className="space-y-1.5 pt-2 border-t border-border/60">
                      <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider block">
                        Action Destination Link:
                      </span>
                      <a
                        href={campaign.telegram_link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between w-full p-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg text-xs font-bold text-sky-800 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <LinkIcon className="w-3.5 h-3.5 text-[#0088CC]" />
                          <span>{campaign.telegram_link_url}</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2D. EMAIL CENTER CARD */}
        {channels.includes('email') && (activeChannelTab === 'all' || activeChannelTab === 'email') && (
          <div className="bg-white border-2 border-blue-500 rounded-xl shadow-xs overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-blue-700 to-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 shadow-sm">
                  <GmailLogo className="w-full h-full" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Email Outreach Broadcast</h3>
                  <span className="text-[11px] text-white/90">Resend Verified Sender • Dedicated IP Delivery</span>
                </div>
              </div>

              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-md border border-white/30 text-white">
                From: Harsh Parmar &lt;onboarding@resend.dev&gt;
              </span>
            </div>

            {/* Email Content Body */}
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-txt-muted uppercase">Subject:</span>
                  <span className="font-bold text-txt-primary">{campaign.email_subject || 'Special Company Update'}</span>
                </div>

                {/* Rendered HTML Container */}
                <div className="border border-border rounded-xl p-4 bg-slate-50 overflow-hidden">
                  <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider block mb-2">
                    Live HTML Email Render Preview:
                  </span>
                  <div
                    className="bg-white border border-border/80 rounded-lg p-5 shadow-xs max-w-xl mx-auto overflow-hidden text-xs"
                    dangerouslySetInnerHTML={{
                      __html:
                        campaign.email_html ||
                        `<p>Hi there,</p><p>You are invited to our special celebration.</p>`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. RECIPIENT AUDIT & DELIVERY TELEMETRY TABLE                             */}
      {/* ========================================================================= */}
      <div className="bg-white border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
              <Users className="w-4 h-4 text-brand" />
              <span>Recipient Audit &amp; Individual Delivery Logs</span>
            </h3>
            <p className="text-[11px] text-txt-muted mt-0.5">
              Exact delivery and read receipts for every contact dispatched in this campaign ({campaign.messages?.length || 0} total records).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search Recipient */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-txt-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search contact..."
                value={recipientSearch}
                onChange={(e) => setRecipientSearch(e.target.value)}
                className="pl-8 pr-2.5 py-1 text-xs bg-bg-app border border-border rounded-md focus:outline-none focus:border-brand font-medium w-44"
              />
            </div>

            {/* Filter Channel */}
            <select
              value={recipientChannelFilter}
              onChange={(e) => setRecipientChannelFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-bg-app text-txt-primary border border-border rounded-md font-medium"
            >
              <option value="all">All Channels</option>
              {channels.map((ch: string) => (
                <option key={ch} value={ch}>
                  {ch.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="py-12 text-center text-xs text-txt-muted space-y-1">
            <p className="font-semibold text-txt-primary">No recipient records match</p>
            <p>Try clearing your search query or channel filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-surface border-b border-border text-[11px] font-bold text-txt-muted uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Recipient Contact</th>
                  <th className="py-2.5 px-3">Tier</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Delivery Status</th>
                  <th className="py-2.5 px-3">Queued Time</th>
                  <th className="py-2.5 px-3">Delivered / Read</th>
                  <th className="py-2.5 px-4 text-right">Cost (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMessages.map((msg: any) => {
                  const contact = msg.contacts || {};
                  return (
                    <tr key={msg.id} className="hover:bg-bg-accentSoft/50 transition-colors">
                      {/* 1. Recipient Contact */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-txt-primary block">
                            {contact.name || 'Anonymous User'}
                          </span>
                          <span className="text-[11px] text-txt-muted font-mono block">
                            {contact.phone || contact.email || '—'}
                          </span>
                        </div>
                      </td>

                      {/* 2. Tier */}
                      <td className="py-3 px-3">
                        {contact.tier === 'vip' ? (
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            👑 VIP
                          </span>
                        ) : contact.tier === 'regular' ? (
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Regular
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {contact.tier || 'Lead'}
                          </span>
                        )}
                      </td>

                      {/* 3. Channel with Logo */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-bg-app border border-border text-[11px] font-semibold capitalize">
                          {msg.channel === 'whatsapp' && <WhatsAppLogo className="w-3.5 h-3.5" />}
                          {msg.channel === 'email' && <GmailLogo className="w-3.5 h-3.5" />}
                          {msg.channel === 'telegram' && <TelegramLogo className="w-3.5 h-3.5" />}
                          {msg.channel === 'instagram' && <InstagramLogo className="w-3.5 h-3.5" />}
                          <span>{msg.channel}</span>
                        </span>
                      </td>

                      {/* 4. Status Badge */}
                      <td className="py-3 px-3">
                        {msg.status === 'read' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            <CheckCheck className="w-3 h-3 text-sky-500" />
                            Read
                          </span>
                        ) : msg.status === 'delivered' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Delivered
                          </span>
                        ) : msg.status === 'sent' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            Sent
                          </span>
                        ) : msg.status === 'failed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-status-failed border border-red-200">
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Queued
                          </span>
                        )}
                      </td>

                      {/* 5. Queued Time */}
                      <td className="py-3 px-3 text-txt-muted text-[11px] whitespace-nowrap">
                        {msg.queued_at ? new Date(msg.queued_at).toLocaleTimeString() : '—'}
                      </td>

                      {/* 6. Delivered/Read Time */}
                      <td className="py-3 px-3 text-txt-muted text-[11px] whitespace-nowrap">
                        {msg.read_at
                          ? `Read ${new Date(msg.read_at).toLocaleTimeString()}`
                          : msg.delivered_at
                          ? `Delivered ${new Date(msg.delivered_at).toLocaleTimeString()}`
                          : '—'}
                      </td>

                      {/* 7. Cost */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-txt-primary">
                        {msg.cost_inr ? `₹${Number(msg.cost_inr).toFixed(2)}` : '₹0.00'}
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
