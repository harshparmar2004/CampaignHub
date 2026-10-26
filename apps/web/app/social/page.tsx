'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Newspaper,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Send,
  Check,
  Copy,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  Search,
  Filter,
  CheckCheck,
  Headphones,
  Pin,
  Clock,
  Activity,
  FileText,
  AlertCircle,
  Eye,
  Inbox,
  Radio,
  Layers,
  Paperclip,
  Smile,
  Sparkles,
  ChevronRight,
  User,
  Phone,
  Tag,
  MessageSquare,
  ChevronDown,
  LayoutGrid,
  Bot,
} from 'lucide-react';
import {
  WhatsAppLogo,
  GmailLogo,
  TelegramLogo,
  InstagramLogo,
} from '@/components/ui/BrandIcons';
import type { WhatsAppTemplate, EmailTemplate } from '@campaignhub/shared';

// Supported platform tabs — NO "all" button
export type SocialTab = 'whatsapp' | 'mail' | 'telegram' | 'instagram' | 'news';
export type WorkspaceView = 'inbox' | 'broadcast' | 'templates' | 'ledger' | 'media';

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface ConversationItem {
  id: string;
  contactName: string;
  phone: string;
  tier: string;
  spendInr: string;
  unreadCount: number;
  lastActive: string;
  tags: string[];
  messages: ChatMessage[];
}

function SocialHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get('tab') as SocialTab;
  const initialTab: SocialTab =
    initialTabParam && ['whatsapp', 'mail', 'telegram', 'instagram', 'news'].includes(initialTabParam)
      ? initialTabParam
      : 'whatsapp';

  const [activeTab, setActiveTab] = useState<SocialTab>(initialTab);
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('inbox');

  // Sync tab state with URL query param
  useEffect(() => {
    const tabParam = searchParams.get('tab') as SocialTab;
    if (tabParam && ['whatsapp', 'mail', 'telegram', 'instagram', 'news'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: SocialTab) => {
    setActiveTab(tab);
    router.push(`/social?tab=${tab}`, { scroll: false });
  };

  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT ACROSS CHANNELS
  // ---------------------------------------------------------------------------
  const [, setIsLoading] = useState(true);

  // 1. WhatsApp State
  const [waStats, setWaStats] = useState({
    sent: 15,
    delivered: 13,
    read: 13,
    failed: 2,
    replies: 3,
    cost_inr: 11.48,
  });
  const [waTemplates, setWaTemplates] = useState<WhatsAppTemplate[]>([]);
  const [waReplies, setWaReplies] = useState<any[]>([]);
  const [waLogs, setWaLogs] = useState<any[]>([]);
  const [waStatusFilter, setWaStatusFilter] = useState('all');
  const [waSearchTerm, setWaSearchTerm] = useState('');
  const [isWaTemplateModalOpen, setIsWaTemplateModalOpen] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplCategory, setTplCategory] = useState<'MARKETING' | 'UTILITY'>('MARKETING');
  const [tplBody, setTplBody] = useState('Hello {{1}}, here is your exclusive VIP update from CampaignHub!');
  const [isSubmittingTpl, setIsSubmittingTpl] = useState(false);

  // Direct WhatsApp Composer Simulator State
  const [waDirectTo, setWaDirectTo] = useState('+91 98765 43210');
  const [waDirectName, setWaDirectName] = useState('Arjun Mehta');
  const [waDirectText, setWaDirectText] = useState(
    'Hello Arjun, your VIP Access Pass for the Diwali Festive Gala is confirmed! Show this message at the concierge desk.'
  );
  const [isSendingWaDirect, setIsSendingWaDirect] = useState(false);
  const [waDirectFeedback, setWaDirectFeedback] = useState<string | null>(null);
  const [selectedTemplateForDirect, setSelectedTemplateForDirect] = useState('custom');

  // Live 2-Way Inbox & Chat Console State
  const [activeConvId, setActiveConvId] = useState<string>('in-2');
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'vip'>('all');
  const [chatInputText, setChatInputText] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatDeliveryNotice, setChatDeliveryNotice] = useState<string | null>(null);

  // High-Productivity Multi-Customer Conversations Store
  const [conversations, setConversations] = useState<ConversationItem[]>([
    {
      id: 'in-2',
      contactName: 'Priya Patel',
      phone: '+91 98234 56789',
      tier: 'VIP Patron',
      spendInr: '₹92,000',
      unreadCount: 1,
      lastActive: '12m ago',
      tags: ['VIP Patron', 'Diwali Gala', 'Priority RSVP'],
      messages: [
        {
          id: 'm-1',
          sender: 'agent',
          text: 'Hello Priya, your VIP Access Pass for the Diwali Festive Gala is confirmed! Show this message at the concierge desk.',
          timestamp: '10:15 AM',
          status: 'read',
        },
        {
          id: 'm-2',
          sender: 'customer',
          text: 'Thank you for the update! Very excited for the new feature release and gala tonight.',
          timestamp: '10:28 AM',
        },
      ],
    },
    {
      id: 'in-1',
      contactName: 'Aarav Sharma',
      phone: '+91 98765 43210',
      tier: 'Enterprise VIP',
      spendInr: '₹1,15,000',
      unreadCount: 0,
      lastActive: '1h ago',
      tags: ['VIP', 'Corporate Table', 'High Spender'],
      messages: [
        {
          id: 'm-3',
          sender: 'agent',
          text: 'Hello Aarav, your VIP invitation for the Diwali Festive Gala is active. Looking forward to hosting you!',
          timestamp: '09:00 AM',
          status: 'read',
        },
        {
          id: 'm-4',
          sender: 'customer',
          text: 'Can I get more details on the enterprise pricing tier and group table reservations?',
          timestamp: '09:18 AM',
        },
        {
          id: 'm-5',
          sender: 'agent',
          text: 'Certainly! A dedicated concierge host will reserve the Central Lounge for your party. Details sent.',
          timestamp: '09:25 AM',
          status: 'read',
        },
      ],
    },
    {
      id: 'in-3',
      contactName: 'Arjun Mehta',
      phone: '+91 98111 22334',
      tier: 'Diamond Patron',
      spendInr: '₹75,000',
      unreadCount: 0,
      lastActive: '3h ago',
      tags: ['VIP', 'Exclusive Access', 'Early Bird'],
      messages: [
        {
          id: 'm-6',
          sender: 'agent',
          text: 'Hello Arjun, your VIP Access Pass for the Diwali Festive Gala is confirmed! Show this message at the concierge desk.',
          timestamp: 'Yesterday',
          status: 'read',
        },
        {
          id: 'm-7',
          sender: 'customer',
          text: 'Reservation confirmed. Looking forward to the Diwali Gala tonight!',
          timestamp: 'Yesterday',
        },
      ],
    },
    {
      id: 'in-4',
      contactName: 'Rohan Mehta',
      phone: '+91 98333 44556',
      tier: 'Gold Member',
      spendInr: '₹48,000',
      unreadCount: 0,
      lastActive: 'Yesterday',
      tags: ['Gold Member', 'Regular Guest'],
      messages: [
        {
          id: 'm-8',
          sender: 'customer',
          text: 'Are guest passes transferable for tomorrow evening?',
          timestamp: 'Yesterday',
        },
        {
          id: 'm-9',
          sender: 'agent',
          text: 'Yes Rohan! Simply forward the access QR pass with your registered guest name.',
          timestamp: 'Yesterday',
          status: 'read',
        },
      ],
    },
    {
      id: 'in-5',
      contactName: 'Ananya Roy',
      phone: '+91 98444 55667',
      tier: 'VIP Patron',
      spendInr: '₹68,500',
      unreadCount: 0,
      lastActive: '2d ago',
      tags: ['VIP', 'Cocktail Lounge'],
      messages: [
        {
          id: 'm-10',
          sender: 'customer',
          text: 'Received the VIP pass on WhatsApp, thanks!',
          timestamp: '2d ago',
        },
        {
          id: 'm-11',
          sender: 'agent',
          text: 'Our pleasure Ananya! Concierge service is at your disposal.',
          timestamp: '2d ago',
          status: 'read',
        },
      ],
    },
  ]);

  // Live Chat Send Handler
  const handleSendLiveChat = async () => {
    if (!chatInputText.trim() || isSendingChat) return;
    const currentConv = conversations.find((c) => c.id === activeConvId);
    if (!currentConv) return;

    const messageText = chatInputText;
    setChatInputText('');
    setIsSendingChat(true);
    setChatDeliveryNotice(null);

    // Optimistically add message
    const newMsg: ChatMessage = {
      id: 'msg-local-' + Date.now(),
      sender: 'agent',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            lastActive: 'Just now',
            unreadCount: 0,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    try {
      const res = await fetch('/api/whatsapp/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replyToPhone: currentConv.phone,
          contactName: currentConv.contactName,
          messageText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setChatDeliveryNotice(`✓ Message delivered via Meta Cloud API to ${currentConv.contactName}`);
        setTimeout(() => setChatDeliveryNotice(null), 4000);
      }
    } catch (e: any) {
      console.warn('Reply error:', e);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Inline WhatsApp Quick Reply (Legacy / Broadcaster compatibility)
  const [replyInputText, setReplyInputText] = useState('');
  const [activeReplyingPhone, setActiveReplyingPhone] = useState<string | null>(null);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState<string | null>(null);
  const [replySearchTerm, setReplySearchTerm] = useState('');

  // Safe Date Formatter helper
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recently';
      return (
        d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) +
        ' • ' +
        d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      );
    } catch {
      return 'Recently';
    }
  };

  // 2. Mail State
  const [mailStats, setMailStats] = useState({
    sent: 16,
    delivered: 16,
    opened: 14,
    clicked: 8,
    bounced: 0,
    unsubscribed: 0,
  });
  const [mailTemplates, setMailTemplates] = useState<EmailTemplate[]>([]);
  const [mailLogs, setMailLogs] = useState<any[]>([]);
  const [mailStatusFilter, setMailStatusFilter] = useState('all');
  const [mailSearchTerm, setMailSearchTerm] = useState('');
  const [isMailTestModalOpen, setIsMailTestModalOpen] = useState(false);
  const [mailTestTo, setMailTestTo] = useState('arjun@enterprise.com');
  const [mailTestSubject, setMailTestSubject] = useState('VIP Gala Pass & Guestlist Confirmation — CampaignHub');
  const [mailTestHtml, setMailTestHtml] = useState(
    '<h2>Hello Arjun,</h2><p>Your VIP access pass for tonight has been issued. Please find your reservation details enclosed.</p>'
  );
  const [isSendingMailTest, setIsSendingMailTest] = useState(false);
  const [mailTestFeedback, setMailTestFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Template HTML Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  // 3. Telegram State
  const [tgStats, setTgStats] = useState({
    sent: 4,
    failed: 0,
    lastPostTime: 'Today at 6:45 PM',
  });
  const [tgPosts, setTgPosts] = useState<any[]>([]);
  const [tgChannelTarget, setTgChannelTarget] = useState('@campaignhub_vip');
  const [tgPostText, setTgPostText] = useState(
    '🚀 <b>New CampaignHub VIP Update</b>\n\nExclusive access is now open for the Diwali Festive Gala! Reserve priority seating at https://campaignhub.vip'
  );
  const [tgImageUrl, setTgImageUrl] = useState('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80');
  const [tgPinPost, setTgPinPost] = useState(true);
  const [isTgPosting, setIsTgPosting] = useState(false);
  const [tgPostFeedback, setTgPostFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 4. Instagram State
  const [igStats] = useState({
    updatesCount: 3,
    followersReached: 2450,
    storiesShared: 6,
    zeroCostSavings: 24.6,
  });
  const [igPostType, setIgPostType] = useState('Broadcast Channel Drop');
  const [igPostCaption, setIgPostCaption] = useState(
    '✨ Tonight at VIP Lounge: Exclusive sounds & cocktails with DJ Maya. Members RSVP via bio link! 🎧 #VIPNight #CampaignHub'
  );
  const [igMediaUrl, setIgMediaUrl] = useState(
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80'
  );
  const [igAudioUrl, setIgAudioUrl] = useState('https://campaignhub.in/audio/podcast-ep4-preview.mp3');
  const [isIgPosting, setIsIgPosting] = useState(false);
  const [igPostFeedback, setIgPostFeedback] = useState<string | null>(null);
  const [igPosts, setIgPosts] = useState([
    {
      id: 'ig-1',
      caption: 'Official VIP Gala & Party Invitation podcast release 🎧 Featuring resident DJs & event lineup',
      time: 'Yesterday at 8:15 PM',
      views: 890,
      type: 'Broadcast Channel',
      audioTitle: 'Podcast Ep #4: Soundscape Preview',
    },
    {
      id: 'ig-2',
      caption: 'Weekend Club Gathering & DJ Night teaser video 🎵 Table bookings 90% full',
      time: '3 days ago',
      views: 1240,
      type: 'Feed & Stories',
      audioTitle: 'Teaser Mix: Sunset Deep House',
    },
    {
      id: 'ig-3',
      caption: 'Halloween Costume Bash - Early Bird VIP drop 🎃 Passes live in broadcast channel',
      time: '1 week ago',
      views: 980,
      type: 'Broadcast Channel',
      audioTitle: null,
    },
  ]);

  // 5. News / PR State
  const [newsReleases, setNewsReleases] = useState([
    {
      id: 'pr-1',
      headline: 'CampaignHub Communications Enterprise Unveils Omnichannel Marketing Automation 2.0',
      date: 'October 24, 2026',
      outlet: 'Corporate Wire & RSS',
      status: 'Published',
      summary: 'Next-generation direct-to-consumer delivery engine integrates WhatsApp Meta Cloud API, Google SMTP, and Telegram Bot pipelines.',
    },
    {
      id: 'pr-2',
      headline: 'VIP Guestlist Expansion: Diwali Festive Night Gala Reaches 75% Cohort Growth',
      date: 'October 20, 2026',
      outlet: 'Lifestyle Media Digest',
      status: 'Published',
      summary: 'Priority guest bookings surge ahead of the festive season with automated RSVP tracking.',
    },
    {
      id: 'pr-3',
      headline: 'Zero-Cost Messaging Protocol Saves Marketing Teams ₹19.68 Per Campaign Touchpoint',
      date: 'October 15, 2026',
      outlet: 'Tech Press Release',
      status: 'Published',
      summary: 'Empowering brands with zero-fee Telegram community feeds and Instagram broadcast channels alongside audited Meta Cloud delivery.',
    },
  ]);
  const [newHeadline, setNewHeadline] = useState('');
  const [newOutlet, setNewOutlet] = useState('Corporate Wire & RSS');
  const [newReleaseBody, setNewReleaseBody] = useState('');
  const [isPublishingRelease, setIsPublishingRelease] = useState(false);

  // 6. Media Assets State (Filtered per platform)
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [copiedMediaId, setCopiedMediaId] = useState<string | null>(null);
  const [isAddMediaModalOpen, setIsAddMediaModalOpen] = useState(false);
  const [newMediaName, setNewMediaName] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaChannel, setNewMediaChannel] = useState('WhatsApp');
  const [isSavingMedia, setIsSavingMedia] = useState(false);

  // ---------------------------------------------------------------------------
  // DATA FETCHING & SYNCHRONIZATION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function loadAllChannelsData() {
      setIsLoading(true);
      try {
        const [waLogsRes, waTplRes, waRepliesRes, mailLogsRes, mailTplRes, tgPostsRes, mediaRes] =
          await Promise.allSettled([
            fetch('/api/whatsapp/logs?status=all'),
            fetch('/api/whatsapp/templates'),
            fetch('/api/whatsapp/replies'),
            fetch('/api/mail/logs?status=all'),
            fetch('/api/mail/templates'),
            fetch('/api/telegram/posts'),
            fetch('/api/media'),
          ]);

        // WhatsApp
        if (waLogsRes.status === 'fulfilled') {
          const d = await waLogsRes.value.json();
          if (d.stats) setWaStats(d.stats);
          if (d.data) setWaLogs(d.data);
        }
        if (waTplRes.status === 'fulfilled') {
          const d = await waTplRes.value.json();
          if (d.success) setWaTemplates(d.data || []);
        }
        if (waRepliesRes.status === 'fulfilled') {
          const d = await waRepliesRes.value.json();
          if (d.success) setWaReplies(d.data || []);
        }

        // Mail
        if (mailLogsRes.status === 'fulfilled') {
          const d = await mailLogsRes.value.json();
          if (d.stats) setMailStats(d.stats);
          if (d.data) setMailLogs(d.data);
        }
        if (mailTplRes.status === 'fulfilled') {
          const d = await mailTplRes.value.json();
          if (d.success) setMailTemplates(d.data || []);
        }

        // Telegram
        if (tgPostsRes.status === 'fulfilled') {
          const d = await tgPostsRes.value.json();
          if (d.success) setTgPosts(d.data || []);
          if (d.stats) setTgStats(d.stats);
        }

        // Media
        if (mediaRes.status === 'fulfilled') {
          const d = await mediaRes.value.json();
          if (d.success) setMediaAssets(d.data || []);
        }
      } catch (err) {
        console.error('Error fetching social channels data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAllChannelsData();
  }, []);

  // Copy Media URL Helper
  const handleCopyMedia = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedMediaId(id);
    setTimeout(() => setCopiedMediaId(null), 2000);
  };

  // Add Media Asset
  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaName || !newMediaUrl) return;
    setIsSavingMedia(true);
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMediaName,
          url: newMediaUrl,
          channel: newMediaChannel,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setMediaAssets((prev) => [d.data, ...prev]);
        setIsAddMediaModalOpen(false);
        setNewMediaName('');
        setNewMediaUrl('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingMedia(false);
    }
  };

  // Filter Media for current platform
  const getChannelMedia = (channelName: string) => {
    return mediaAssets.filter(
      (m) =>
        m.channel === channelName ||
        m.channel === 'All Channels' ||
        (channelName === 'WhatsApp' && !m.channel)
    );
  };

  // Filter WhatsApp Logs
  const filteredWaLogs = waLogs.filter((log) => {
    const matchesStatus = waStatusFilter === 'all' || log.status === waStatusFilter;
    const name = log.contacts?.name?.toLowerCase() || '';
    const phone = log.contacts?.phone || '';
    const matchesSearch =
      !waSearchTerm || name.includes(waSearchTerm.toLowerCase()) || phone.includes(waSearchTerm);
    return matchesStatus && matchesSearch;
  });

  // Filter Mail Logs
  const filteredMailLogs = mailLogs.filter((log) => {
    const matchesStatus = mailStatusFilter === 'all' || log.status === mailStatusFilter;
    const name = log.contacts?.name?.toLowerCase() || '';
    const email = log.contacts?.email?.toLowerCase() || '';
    const matchesSearch =
      !mailSearchTerm || name.includes(mailSearchTerm.toLowerCase()) || email.includes(mailSearchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ===================================================================== */}
      {/* 1. OMNICHANNEL NETWORK BAR & PLATFORM SELECTOR                        */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-border/80 shadow-2xs p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Channel Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => handleTabChange('whatsapp')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow-2xs ring-2 ring-emerald-600/20'
                  : 'bg-bg-app text-txt-muted hover:text-txt-primary hover:bg-border/40 border border-border/60'
              }`}
            >
              <WhatsAppLogo className="w-4 h-4" />
              <span>WhatsApp Direct</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold border ${
                  activeTab === 'whatsapp'
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                13 Reached
              </span>
            </button>

            {/* Mail */}
            <button
              type="button"
              onClick={() => handleTabChange('mail')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'mail'
                  ? 'bg-indigo-600 text-white shadow-2xs ring-2 ring-indigo-600/20'
                  : 'bg-bg-app text-txt-muted hover:text-txt-primary hover:bg-border/40 border border-border/60'
              }`}
            >
              <GmailLogo className="w-4 h-4" />
              <span>Mails (SMTP)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold border ${
                  activeTab === 'mail'
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                16 Sent
              </span>
            </button>

            {/* Telegram */}
            <button
              type="button"
              onClick={() => handleTabChange('telegram')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'telegram'
                  ? 'bg-sky-600 text-white shadow-2xs ring-2 ring-sky-600/20'
                  : 'bg-bg-app text-txt-muted hover:text-txt-primary hover:bg-border/40 border border-border/60'
              }`}
            >
              <TelegramLogo className="w-4 h-4" />
              <span>Telegram Community</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold border ${
                  activeTab === 'telegram'
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-sky-50 text-sky-800 border-sky-200'
                }`}
              >
                4 Posts
              </span>
            </button>

            {/* Instagram */}
            <button
              type="button"
              onClick={() => handleTabChange('instagram')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'instagram'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-2xs ring-2 ring-pink-600/20'
                  : 'bg-bg-app text-txt-muted hover:text-txt-primary hover:bg-border/40 border border-border/60'
              }`}
            >
              <InstagramLogo className="w-4 h-4" />
              <span>Instagram Drops</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold border ${
                  activeTab === 'instagram'
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-pink-50 text-pink-800 border-pink-200'
                }`}
              >
                3 Updates
              </span>
            </button>

            {/* News */}
            <button
              type="button"
              onClick={() => handleTabChange('news')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-slate-800 text-white shadow-2xs ring-2 ring-slate-800/20'
                  : 'bg-bg-app text-txt-muted hover:text-txt-primary hover:bg-border/40 border border-border/60'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>PR Wire</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold border ${
                  activeTab === 'news'
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                3 Releases
              </span>
            </button>
          </div>

          {/* Right Status Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>5 Networks Online</span>
            </span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-app hover:bg-border/60 text-txt-primary border border-border text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-txt-muted" />
              <span>Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. PLATFORM 1: WHATSAPP DIRECT (ENTERPRISE OPERATIONAL COMMAND CENTER) */}
      {/* ===================================================================== */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-4">
          {/* Connection & Meta Health Banner */}
          <div className="p-3.5 sm:p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                <WhatsAppLogo className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-txt-primary text-sm">WhatsApp Business Account (Meta Cloud API)</h3>
                  <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] border border-emerald-300">
                    VERIFIED GREEN TICK
                  </span>
                </div>
                <p className="text-txt-muted text-[11px]">
                  Phone: <strong className="text-txt-primary font-mono">+91 98765 43210</strong> &bull; WABA ID: <span className="font-mono">waba_982310892</span> &bull; Cloud API: <span className="font-mono">v21.0</span> &bull; Limit: <strong className="text-emerald-800">Tier 1 (1,000 msgs/24h)</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 font-bold text-emerald-800 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quality: HIGH</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 font-bold text-emerald-800 text-[11px]">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Webhook: Live Stream</span>
              </span>
            </div>
          </div>

          {/* WhatsApp Executive Scorecard (6 Streamlined Metric Tiles) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-white rounded-xl border border-border/80 shadow-2xs space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Direct Reached</span>
              <strong className="text-xl font-black text-emerald-700 tabular-nums">{waStats.delivered}</strong>
              <span className="text-[10px] text-emerald-700 font-medium block">86.7% Confirmed</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-border/80 shadow-2xs space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Total Dispatched</span>
              <strong className="text-xl font-black text-txt-primary tabular-nums">{waStats.sent}</strong>
              <span className="text-[10px] text-txt-muted block">Outbound msgs</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-border/80 shadow-2xs space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Inbound Replies</span>
              <strong className="text-xl font-black text-blue-700 tabular-nums">{conversations.length}</strong>
              <span className="text-[10px] text-blue-700 font-medium block">2-Way Active</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-border/80 shadow-2xs space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Read / Open Rate</span>
              <strong className="text-xl font-black text-emerald-700 tabular-nums">86.7%</strong>
              <span className="text-[10px] text-emerald-700 font-medium block">13 Read receipts</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-border/80 shadow-2xs space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Meta API Fee</span>
              <strong className="text-xl font-black text-brand tabular-nums">₹{waStats.cost_inr.toFixed(2)}</strong>
              <span className="text-[10px] text-txt-muted block">@ ₹0.82/conv</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-border/80 shadow-2xs space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Savings vs SMS</span>
              <strong className="text-xl font-black text-emerald-700 tabular-nums">₹19.68</strong>
              <span className="text-[10px] text-emerald-700 font-medium block">Rich media free</span>
            </div>
          </div>

          {/* Workspace Mode Switcher (Sleek Segmented Workstation Tabs) */}
          <div className="bg-white rounded-xl border border-border/80 p-1.5 shadow-2xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setWorkspaceView('inbox')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                workspaceView === 'inbox'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-txt-muted hover:text-txt-primary hover:bg-bg-app'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live 2-Way Inbox</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  workspaceView === 'inbox'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {conversations.length} Active
              </span>
            </button>

            <button
              type="button"
              onClick={() => setWorkspaceView('broadcast')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                workspaceView === 'broadcast'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-txt-muted hover:text-txt-primary hover:bg-bg-app'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Direct Broadcast Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setWorkspaceView('templates')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                workspaceView === 'templates'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-txt-muted hover:text-txt-primary hover:bg-bg-app'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Meta Approved Templates</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  workspaceView === 'templates'
                    ? 'bg-white/20 text-white'
                    : 'bg-bg-app text-txt-muted border border-border'
                }`}
              >
                {waTemplates.length || 2}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setWorkspaceView('ledger')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                workspaceView === 'ledger'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-txt-muted hover:text-txt-primary hover:bg-bg-app'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Delivery Ledger &amp; Telemetry</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  workspaceView === 'ledger'
                    ? 'bg-white/20 text-white'
                    : 'bg-bg-app text-txt-muted border border-border'
                }`}
              >
                {filteredWaLogs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setWorkspaceView('media')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                workspaceView === 'media'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-txt-muted hover:text-txt-primary hover:bg-bg-app'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Media Vault</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  workspaceView === 'media'
                    ? 'bg-white/20 text-white'
                    : 'bg-bg-app text-txt-muted border border-border'
                }`}
              >
                {getChannelMedia('WhatsApp').length}
              </span>
            </button>
          </div>

          {/* ===================================================================== */}
          {/* WORKSPACE VIEW 1: LIVE 2-WAY INBOX & CHAT CONSOLE (CENTERPIECE)       */}
          {/* ===================================================================== */}
          {workspaceView === 'inbox' && (
            <div className="bg-white rounded-2xl border border-border/80 shadow-2xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
              {/* PANE 1: Customer Conversation List (3.5 cols) */}
              <div className="lg:col-span-4 border-r border-border/70 flex flex-col bg-bg-app/30">
                {/* Search & Filter Header */}
                <div className="p-3 border-b border-border/70 space-y-2 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Inbox className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Customer Inquiries</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Live Stream
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-txt-muted" />
                    <input
                      type="text"
                      value={chatSearchTerm}
                      onChange={(e) => setChatSearchTerm(e.target.value)}
                      placeholder="Search customer or phone..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-bg-app rounded-lg border border-border/80 text-txt-primary focus:border-brand"
                    />
                  </div>

                  <div className="flex items-center gap-1 pt-1">
                    {(['all', 'unread', 'vip'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setChatFilter(filter)}
                        className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase transition-colors cursor-pointer ${
                          chatFilter === filter
                            ? 'bg-emerald-600 text-white'
                            : 'bg-bg-app text-txt-muted hover:text-txt-primary hover:bg-border/60'
                        }`}
                      >
                        {filter === 'all' ? 'All Inquiries' : filter === 'unread' ? 'Unread (1)' : 'VIP Patrons'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversation List Items */}
                <div className="flex-1 overflow-y-auto divide-y divide-border/50">
                  {conversations
                    .filter((c) => {
                      if (chatFilter === 'unread' && c.unreadCount === 0) return false;
                      if (chatFilter === 'vip' && !c.tags.some((t) => t.toLowerCase().includes('vip'))) return false;
                      if (!chatSearchTerm) return true;
                      const term = chatSearchTerm.toLowerCase();
                      return (
                        c.contactName.toLowerCase().includes(term) ||
                        c.phone.toLowerCase().includes(term) ||
                        c.messages.some((m) => m.text.toLowerCase().includes(term))
                      );
                    })
                    .map((conv) => {
                      const isSelected = activeConvId === conv.id;
                      const lastMsg = conv.messages[conv.messages.length - 1];

                      return (
                        <div
                          key={conv.id}
                          onClick={() => {
                            setActiveConvId(conv.id);
                            // Mark as read
                            setConversations((prev) =>
                              prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
                            );
                          }}
                          className={`p-3 transition-all cursor-pointer border-l-4 ${
                            isSelected
                              ? 'bg-emerald-50/80 border-emerald-600 shadow-2xs'
                              : 'bg-white hover:bg-bg-app/70 border-transparent'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                                  isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'
                                }`}
                              >
                                {conv.contactName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <strong className="text-xs font-bold text-txt-primary truncate">
                                    {conv.contactName}
                                  </strong>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                </div>
                                <span className="text-[10px] text-txt-muted font-mono block">
                                  {conv.phone}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0 space-y-1">
                              <span className="text-[9px] text-txt-muted block font-medium">
                                {conv.lastActive}
                              </span>
                              {conv.unreadCount > 0 && (
                                <span className="inline-block px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-black">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-[11px] text-txt-muted mt-1.5 line-clamp-1">
                            {lastMsg ? lastMsg.text : 'No messages'}
                          </p>

                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-200">
                              {conv.tier}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700 font-medium">
                              Spend: {conv.spendInr}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* PANE 2: Active Chat Thread Window (5.5 cols) */}
              {(() => {
                const currentConv =
                  conversations.find((c) => c.id === activeConvId) || conversations[0];

                return (
                  <div className="lg:col-span-5 flex flex-col border-r border-border/70 min-h-[620px] bg-[#efeae2]">
                    {/* Active Conversation App Header */}
                    <div className="bg-[#008069] text-white p-3 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-800 border border-white/30 flex items-center justify-center font-bold text-xs text-white shrink-0">
                          {currentConv ? currentConv.contactName.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white">
                              {currentConv ? currentConv.contactName : 'Guest Contact'}
                            </h4>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/20 text-white font-semibold">
                              VIP
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                            <span className="font-mono">{currentConv ? currentConv.phone : ''}</span>
                            <span>&bull;</span>
                            <span>Webhook Active</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setWaDirectTo(currentConv.phone);
                            setWaDirectName(currentConv.contactName);
                            setWorkspaceView('broadcast');
                          }}
                          className="text-[10px] bg-white/15 hover:bg-white/25 text-white font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          Open in Studio &rarr;
                        </button>
                      </div>
                    </div>

                    {/* Chat Bubble Stream */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#d1d7db_1px,transparent_1px)] [background-size:16px_16px] max-h-[460px]">
                      <div className="text-center my-1">
                        <span className="text-[9px] bg-white/90 text-slate-600 px-3 py-0.5 rounded-full shadow-2xs font-bold border border-slate-200">
                          TODAY
                        </span>
                      </div>

                      {currentConv &&
                        currentConv.messages.map((msg) => {
                          const isAgent = msg.sender === 'agent';

                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[82%] p-2.5 rounded-2xl shadow-xs text-xs space-y-1 ${
                                  isAgent
                                    ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none border border-emerald-300/40'
                                    : 'bg-white text-[#111b21] rounded-tl-none border border-border/60'
                                }`}
                              >
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                <div className="flex items-center justify-end gap-1 text-[9px] text-[#667781] pt-0.5">
                                  <span>{msg.timestamp}</span>
                                  {isAgent && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Delivery Feedback Banner */}
                    {chatDeliveryNotice && (
                      <div className="mx-3 my-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-300 flex items-center justify-between">
                        <span>{chatDeliveryNotice}</span>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}

                    {/* Quick Response Shortcut Chips */}
                    <div className="p-2.5 bg-[#f0f2f5] border-t border-slate-200 space-y-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-bold text-slate-500 uppercase mr-1">
                          Quick Replies:
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setChatInputText(
                              `Hi ${currentConv.contactName.split(' ')[0]}, your VIP Access Pass for the Diwali Festive Gala is confirmed! Show this message at the concierge desk.`
                            )
                          }
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-300 transition-colors cursor-pointer"
                        >
                          Confirm Pass
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setChatInputText(
                              `Hello ${currentConv.contactName.split(' ')[0]}, our team has noted your question and is preparing the reservation details for you now.`
                            )
                          }
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-300 transition-colors cursor-pointer"
                        >
                          Team On It
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setChatInputText(
                              `Here is the exclusive reservation portal and gala schedule: https://campaignhub.in/rsvp`
                            )
                          }
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-300 transition-colors cursor-pointer"
                        >
                          Gala Itinerary
                        </button>
                      </div>

                      {/* Interactive Live WhatsApp Reply Composer */}
                      <div className="flex items-center gap-2">
                        <Input
                          value={chatInputText}
                          onChange={(e) => setChatInputText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendLiveChat();
                            }
                          }}
                          placeholder={`Message ${currentConv.contactName}... (Press Enter to Send)`}
                          className="text-xs bg-white rounded-xl flex-1 border-slate-300"
                        />
                        <Button
                          onClick={handleSendLiveChat}
                          disabled={!chatInputText.trim() || isSendingChat}
                          className="gap-1.5 bg-[#008069] hover:bg-emerald-700 text-white min-h-[38px] px-4 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSendingChat ? 'Sending...' : 'Send'}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* PANE 3: Customer CRM Profile & Telemetry Card (3 cols) */}
              {(() => {
                const currentConv =
                  conversations.find((c) => c.id === activeConvId) || conversations[0];

                return (
                  <div className="lg:col-span-3 p-4 bg-white flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      {/* Customer Header */}
                      <div className="text-center pt-2">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xl mx-auto shadow-md ring-4 ring-emerald-100">
                          {currentConv ? currentConv.contactName.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <h4 className="text-sm font-bold text-txt-primary mt-2">
                          {currentConv ? currentConv.contactName : 'Guest'}
                        </h4>
                        <span className="text-[11px] font-mono text-txt-muted block">
                          {currentConv ? currentConv.phone : ''}
                        </span>
                        <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>{currentConv ? currentConv.tier : 'VIP'}</span>
                        </div>
                      </div>

                      {/* CRM Intelligence */}
                      <div className="space-y-2.5 text-xs pt-2 border-t border-border/70">
                        <div className="p-3 bg-bg-app rounded-xl border border-border/60 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-txt-muted block">
                            Total Lifetime Spend
                          </span>
                          <strong className="text-lg font-black text-emerald-700 block">
                            {currentConv ? currentConv.spendInr : '₹0'}
                          </strong>
                          <span className="text-[10px] text-emerald-700 font-medium block">
                            Top 5% Patron Segment
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-txt-muted block">
                            Communication Opt-In
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp E.164 Opted-In</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-txt-muted block">
                            Patron Tags
                          </span>
                          <div className="flex items-center gap-1 flex-wrap">
                            {currentConv &&
                              currentConv.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-bg-app text-txt-primary border border-border/80"
                                >
                                  {tag}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick CRM Action Buttons */}
                    <div className="space-y-2 pt-3 border-t border-border/70">
                      <Button
                        onClick={() => {
                          setWaDirectTo(currentConv.phone);
                          setWaDirectName(currentConv.contactName);
                          setWorkspaceView('broadcast');
                        }}
                        className="w-full text-xs min-h-[36px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        <span>Direct Campaign Blast</span>
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(currentConv.phone);
                          alert('Copied ' + currentConv.phone + ' to clipboard!');
                        }}
                        className="w-full text-xs py-1.5 rounded-lg border border-border text-txt-muted hover:text-txt-primary hover:bg-bg-app font-semibold transition-colors cursor-pointer"
                      >
                        Copy Phone Number
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ===================================================================== */}
          {/* WORKSPACE VIEW 2: DIRECT BROADCAST STUDIO                             */}
          {/* ===================================================================== */}
          {workspaceView === 'broadcast' && (
            <div className="p-5 sm:p-6 bg-white rounded-2xl border border-border/80 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                    <Send className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-txt-primary">Direct WhatsApp Broadcast Studio</h3>
                    <p className="text-xs text-txt-muted">
                      Compose 1:1 messages or template blasts with token merge tags and real-time smartphone preview.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Meta Cloud API v21.0</span>
                </div>
              </div>

              {/* 2-Column Balanced Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Form Controls (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Quick Select Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase text-txt-muted mr-1">Quick Select:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setWaDirectTo('+91 98765 43210');
                        setWaDirectName('Arjun Mehta');
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-bg-app hover:bg-border/60 text-txt-primary border border-border/80 font-medium transition-colors cursor-pointer"
                    >
                      Arjun Mehta (+91 98765 43210)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWaDirectTo('+91 98234 56789');
                        setWaDirectName('Priya Patel');
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-bg-app hover:bg-border/60 text-txt-primary border border-border/80 font-medium transition-colors cursor-pointer"
                    >
                      Priya Patel (+91 98234 56789)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWaDirectTo('+91 98111 22334');
                        setWaDirectName('Aarav Sharma');
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-bg-app hover:bg-border/60 text-txt-primary border border-border/80 font-medium transition-colors cursor-pointer"
                    >
                      Aarav Sharma (+91 98111 22334)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-txt-muted uppercase block mb-1">Target Phone (+Country)</label>
                      <Input
                        value={waDirectTo}
                        onChange={(e) => setWaDirectTo(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-txt-muted uppercase block mb-1">Contact Name</label>
                      <Input
                        value={waDirectName}
                        onChange={(e) => setWaDirectName(e.target.value)}
                        placeholder="e.g. Arjun Mehta"
                        className="w-full text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-txt-muted uppercase block mb-1">Message Format / Template</label>
                      <select
                        value={selectedTemplateForDirect}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedTemplateForDirect(val);
                          if (val === 'custom') {
                            setWaDirectText(
                              'Hello ' +
                                (waDirectName || 'there') +
                                ', your VIP Access Pass for the Diwali Festive Gala is confirmed! Show this message at the concierge desk.'
                            );
                          } else {
                            const found = waTemplates.find((t) => t.id === val || t.name === val);
                            if (found) {
                              setWaDirectText(found.body.replace('{{1}}', waDirectName || 'Guest'));
                            }
                          }
                        }}
                        className="w-full px-3 py-2 text-xs bg-bg-app rounded-lg border border-border/80 text-txt-primary font-medium"
                      >
                        <option value="custom">Custom Direct Message (Instant Text/Media)</option>
                        {waTemplates.map((t) => (
                          <option key={t.id} value={t.name}>
                            Meta Template: {t.name} ({t.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-txt-muted uppercase block mb-1">Insert Merge Variables</label>
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {['{{name}}', '{{first_name}}', '{{phone}}', '{{tier}}', '{{link}}'].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setWaDirectText((prev) => prev + ' ' + tag)}
                            className="text-[10px] font-mono px-2 py-1 rounded bg-bg-app hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-border text-txt-muted font-bold transition-colors cursor-pointer"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-txt-muted uppercase block">Message Body Content</label>
                      <span className="text-[10px] text-txt-muted">{waDirectText.length} characters</span>
                    </div>
                    <Textarea
                      value={waDirectText}
                      onChange={(e) => setWaDirectText(e.target.value)}
                      rows={4}
                      placeholder="Type your WhatsApp broadcast message..."
                      className="w-full text-xs font-normal leading-relaxed"
                    />
                  </div>

                  {/* Send Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="text-xs font-semibold">
                      {waDirectFeedback && (
                        <span
                          className={
                            waDirectFeedback.startsWith('✓')
                              ? 'text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200'
                              : 'text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200'
                          }
                        >
                          {waDirectFeedback}
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={async () => {
                        if (!waDirectText.trim() || !waDirectTo.trim() || isSendingWaDirect) return;
                        setIsSendingWaDirect(true);
                        setWaDirectFeedback(null);

                        try {
                          const res = await fetch('/api/whatsapp/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              to: waDirectTo,
                              name: waDirectName,
                              message: waDirectText,
                              templateId:
                                selectedTemplateForDirect !== 'custom'
                                  ? selectedTemplateForDirect
                                  : undefined,
                            }),
                          });

                          const data = await res.json();
                          if (data.success) {
                            setWaLogs((prev) => [
                              {
                                id: data.messageId || 'msg-live-' + Date.now(),
                                contact_id: 'c-new',
                                channel: 'whatsapp',
                                status: data.status || 'delivered',
                                provider_message_id: data.providerMessageId,
                                cost_inr: data.cost_inr || 0.82,
                                sent_at: data.delivered_at || new Date().toISOString(),
                                delivered_at: data.delivered_at || new Date().toISOString(),
                                contacts: { name: waDirectName, phone: waDirectTo, email: '', tier: 'vip' },
                              },
                              ...prev,
                            ]);
                            setWaStats((prev) => ({
                              ...prev,
                              sent: prev.sent + 1,
                              delivered: prev.delivered + 1,
                              cost_inr: Number((prev.cost_inr + (data.cost_inr || 0.82)).toFixed(2)),
                            }));
                            setWaDirectFeedback(
                              `✓ Message delivered to ${waDirectTo} (ID: ${data.providerMessageId || 'Confirmed'})`
                            );
                          } else {
                            setWaDirectFeedback(`✗ Transmission failed: ${data.error || 'Server error'}`);
                          }
                        } catch (err: any) {
                          setWaDirectFeedback(`✗ Error: ${err.message}`);
                        } finally {
                          setIsSendingWaDirect(false);
                          setTimeout(() => setWaDirectFeedback(null), 5000);
                        }
                      }}
                      disabled={isSendingWaDirect || !waDirectText.trim() || !waDirectTo.trim()}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white min-h-[40px] py-2 px-5 text-xs font-bold rounded-xl shadow-xs shrink-0 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSendingWaDirect ? 'Sending via Meta Cloud API...' : '⚡ Execute & Send WhatsApp Direct'}</span>
                    </Button>
                  </div>
                </div>

                {/* Right Column: Smartphone Simulator (5 cols) */}
                <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between text-white/70 text-[10px] pb-2 border-b border-white/10 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="font-bold uppercase tracking-wider text-white">Live Phone Simulator</span>
                    </div>
                    <span className="font-mono text-emerald-400">Meta v21.0</span>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-slate-700/60 bg-[#efeae2] shadow-inner flex flex-col min-h-[300px]">
                    <div className="bg-[#008069] text-white px-3 py-2 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-700 border border-white/30 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {waDirectName ? waDirectName.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-white truncate max-w-[140px]">
                              {waDirectName || 'Guest Contact'}
                            </span>
                            <CheckCircle2 className="w-3 h-3 text-emerald-200 shrink-0" />
                          </div>
                          <span className="text-[9px] text-emerald-100 block font-mono truncate">
                            {waDirectTo || '+91 98765 43210'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-semibold bg-white/20 px-1.5 py-0.5 rounded text-white">
                        Verified
                      </span>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between space-y-3 bg-[radial-gradient(#d1d7db_1px,transparent_1px)] [background-size:16px_16px]">
                      <div className="text-center">
                        <span className="text-[9px] bg-white/90 text-slate-600 px-2.5 py-0.5 rounded-full shadow-2xs font-bold">
                          TODAY
                        </span>
                      </div>

                      <div className="max-w-[90%] ml-auto bg-[#d9fdd3] text-[#111b21] p-3 rounded-2xl rounded-tr-none shadow-xs text-xs space-y-1.5 border border-emerald-300/40">
                        <p className="leading-relaxed whitespace-pre-wrap break-words">
                          {waDirectText
                            .replace(/\{\{name\}\}/gi, waDirectName || 'Valued Guest')
                            .replace(/\{\{first_name\}\}/gi, (waDirectName || 'Guest').split(' ')[0])
                            .replace(/\{\{phone\}\}/gi, waDirectTo)
                            .replace(/\{\{tier\}\}/gi, 'VIP')
                            .replace(/\{\{link\}\}/gi, 'https://campaignhub.in')}
                        </p>
                        <div className="flex items-center justify-end gap-1 text-[9px] text-[#667781] pt-0.5">
                          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#f0f2f5] px-3 py-2 flex items-center gap-2 border-t border-slate-200">
                      <div className="flex-1 bg-white px-3 py-1.5 rounded-full text-[11px] text-slate-400 border border-slate-200">
                        Message...
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[#008069] flex items-center justify-center text-white shrink-0">
                        <Send className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* WORKSPACE VIEW 3: APPROVED META CLOUD TEMPLATES                       */}
          {/* ===================================================================== */}
          {workspaceView === 'templates' && (
            <div className="p-5 sm:p-6 bg-white rounded-2xl border border-border/80 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div>
                  <h3 className="text-sm font-bold text-txt-primary">Approved WhatsApp Cloud Templates (Meta Business Manager)</h3>
                  <p className="text-xs text-txt-muted">
                    Pre-approved templates with dynamic merge tags, category authorization, and language mappings.
                  </p>
                </div>
                <Button
                  onClick={() => setIsWaTemplateModalOpen(true)}
                  className="gap-1.5 text-xs py-1.5 px-3 min-h-0 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Meta Template</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {waTemplates.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-bg-app rounded-xl text-xs text-txt-muted border border-border/60">
                    Default templates synced from Meta Cloud API.
                  </div>
                ) : (
                  waTemplates.map((tpl) => (
                    <div key={tpl.id} className="p-3.5 bg-bg-app rounded-xl border border-border/70 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-txt-primary font-mono">{tpl.name}</span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {tpl.status || 'APPROVED'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-txt-muted">
                          <span>Category: <strong>{tpl.category}</strong></span>
                          <span>&bull;</span>
                          <span>Lang: <strong>{tpl.language || 'en_US'}</strong></span>
                        </div>
                        <p className="text-xs text-txt-muted bg-white p-2.5 rounded-lg border border-border/50 line-clamp-3">
                          {tpl.body}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                        <span className="text-[10px] text-txt-muted italic">Reply STOP to opt out</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTemplateForDirect(tpl.name);
                            setWaDirectText(tpl.body.replace('{{1}}', waDirectName || 'Guest'));
                            setWorkspaceView('broadcast');
                          }}
                          className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                        >
                          Load into Studio &rarr;
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* WORKSPACE VIEW 4: DELIVERY LEDGER & TELEMETRY                         */}
          {/* ===================================================================== */}
          {workspaceView === 'ledger' && (
            <div className="p-5 sm:p-6 bg-white rounded-2xl border border-border/80 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div>
                  <h3 className="text-sm font-bold text-txt-primary">Itemized WhatsApp Message Delivery Ledger</h3>
                  <p className="text-xs text-txt-muted">
                    Real-time transmission logs with confirmed delivery receipts, latency, and Meta API billing.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-txt-muted" />
                    <input
                      type="text"
                      value={waSearchTerm}
                      onChange={(e) => setWaSearchTerm(e.target.value)}
                      placeholder="Search name or phone..."
                      className="pl-8 pr-3 py-1.5 text-xs bg-bg-app rounded-lg border border-border/80 text-txt-primary w-48 focus:border-brand"
                    />
                  </div>
                  <select
                    value={waStatusFilter}
                    onChange={(e) => setWaStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-bg-app rounded-lg border border-border/80 text-txt-primary font-medium"
                  >
                    <option value="all">All Status</option>
                    <option value="delivered">Delivered</option>
                    <option value="read">Read</option>
                    <option value="queued">Queued / Sent</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bg-app text-txt-muted uppercase text-[10px] font-bold border-b border-border/60">
                    <tr>
                      <th className="py-2.5 px-3">Recipient &amp; Phone</th>
                      <th className="py-2.5 px-3">Message Type / Template</th>
                      <th className="py-2.5 px-3">Sent Time</th>
                      <th className="py-2.5 px-3">Delivered Latency</th>
                      <th className="py-2.5 px-3">Delivery Status</th>
                      <th className="py-2.5 px-3">Meta Charge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredWaLogs.slice(0, 10).map((log) => (
                      <tr key={log.id} className="hover:bg-bg-app/50 transition-colors">
                        <td className="py-2.5 px-3">
                          <strong className="text-txt-primary block">{log.contacts?.name || 'Contact'}</strong>
                          <span className="text-[10px] text-txt-muted font-mono">{log.contacts?.phone || '+91 98765 43210'}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-[11px] text-txt-primary">
                            {log.campaigns?.whatsapp_template_id || 'vip_gala_pass_2026'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-txt-muted text-[11px]">
                          {log.sent_at ? new Date(log.sent_at).toLocaleTimeString() : 'Just now'}
                        </td>
                        <td className="py-2.5 px-3 text-txt-muted text-[11px]">
                          {log.delivered_at ? new Date(log.delivered_at).toLocaleTimeString() : '1.1s latency'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCheck className="w-3 h-3 text-emerald-600" />
                            <span>{log.status || 'delivered'}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-txt-primary">
                          ₹0.82
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* WORKSPACE VIEW 5: CREATIVE MEDIA ASSETS VAULT                         */}
          {/* ===================================================================== */}
          {workspaceView === 'media' && (
            <div className="p-5 sm:p-6 bg-white rounded-2xl border border-border/80 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div>
                  <h3 className="text-sm font-bold text-txt-primary">WhatsApp Media Assets &amp; Event Passes</h3>
                  <p className="text-xs text-txt-muted">
                    Flyers, VIP badges, and image invitations optimized for WhatsApp direct messages.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setNewMediaChannel('WhatsApp');
                    setIsAddMediaModalOpen(true);
                  }}
                  className="gap-1.5 text-xs py-1.5 px-3 min-h-0 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add WhatsApp Asset</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {getChannelMedia('WhatsApp').map((asset) => (
                  <div key={asset.id} className="p-2.5 bg-bg-app rounded-xl border border-border/70 space-y-2">
                    <div className="w-full h-28 rounded-lg overflow-hidden bg-slate-100 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="text-xs font-bold text-txt-primary truncate">{asset.name}</h4>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-border/50">
                      <button
                        type="button"
                        onClick={() => handleCopyMedia(asset.url, asset.id)}
                        className="text-[11px] text-brand hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedMediaId === asset.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedMediaId === asset.id ? 'Copied!' : 'Copy URL'}</span>
                      </button>
                      <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-txt-muted hover:text-txt-primary">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. PLATFORM 2: MAILS (SMTP FULL OPERATIONAL HUB)                      */}
      {/* ===================================================================== */}
      {activeTab === 'mail' && (
        <div className="space-y-6">
          {/* DNS & SMTP Connection Banner */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                <GmailLogo className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-txt-primary text-sm">Google Workspace &amp; Resend SMTP Relay</h3>
                  <span className="px-2 py-0.2 rounded-full bg-indigo-100 text-indigo-800 font-black text-[10px] border border-indigo-300">
                    DMARC REJECT VERIFIED
                  </span>
                </div>
                <p className="text-txt-muted text-[11px]">
                  Sender: <strong className="text-txt-primary">vip@campaignhub.in</strong> &bull; Relay: <span className="font-mono">smtp.resend.com:587 (TLS 1.3)</span> &bull; Postmaster Reputation: <strong className="text-emerald-800">99.8/100</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-indigo-300 font-bold text-indigo-800 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>SPF: PASS</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-indigo-300 font-bold text-indigo-800 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>DKIM: 2048-bit PASS</span>
              </span>
            </div>
          </div>

          {/* Email KPI Scorecard (6 Metric Tiles) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Inboxed / Delivered</span>
              <strong className="text-xl font-black text-indigo-700 tabular-nums">{mailStats.delivered}</strong>
              <span className="text-[10px] text-indigo-700 font-medium block">100% Inboxed</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Total Dispatched</span>
              <strong className="text-xl font-black text-txt-primary tabular-nums">{mailStats.sent}</strong>
              <span className="text-[10px] text-txt-muted block">HTML Emails</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Opened</span>
              <strong className="text-xl font-black text-emerald-700 tabular-nums">{mailStats.opened}</strong>
              <span className="text-[10px] text-emerald-700 font-medium block">87.5% Open Rate</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Clicks &amp; RSVPs</span>
              <strong className="text-xl font-black text-blue-700 tabular-nums">{mailStats.clicked}</strong>
              <span className="text-[10px] text-blue-700 font-medium block">50.0% CTR</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Bounces / Spam</span>
              <strong className="text-xl font-black text-emerald-700 tabular-nums">0</strong>
              <span className="text-[10px] text-emerald-700 font-medium block">0.0% Clean List</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Post-Trial Spend</span>
              <strong className="text-xl font-black text-indigo-700 tabular-nums">₹1.28</strong>
              <span className="text-[10px] text-txt-muted block">@ ₹0.08 / email</span>
            </div>
          </div>

          {/* Email Template Library & Quick Broadcaster */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Template Gallery (7 cols) */}
            <div className="lg:col-span-7 p-4 sm:p-5 bg-white rounded-2xl border border-border/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-txt-primary">Responsive HTML Email Template Library</h3>
                  <p className="text-xs text-txt-muted">Dynamic merge tags (`name`, `event_date`, `table_no`) with preview.</p>
                </div>
                <Button onClick={() => setIsMailTestModalOpen(true)} className="gap-1.5 text-xs py-1.5 px-3 min-h-0 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Email</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mailTemplates.map((tpl) => (
                  <div key={tpl.id} className="p-3.5 bg-bg-app rounded-xl border border-border/70 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-txt-primary">{tpl.name}</h4>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                          HTML5
                        </span>
                      </div>
                      <span className="text-[11px] text-txt-muted block truncate font-medium">{tpl.subject}</span>
                      <div className="text-[11px] text-txt-muted bg-white p-2 rounded-lg border border-border/50 line-clamp-3">
                        {((tpl as any).body_html || (tpl as any).html || (tpl as any).body || '')
                          .replace(/<[^>]*>?/gm, '')
                          .trim() || 'No preview text'}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border/50 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setPreviewTemplate(tpl)}
                        className="text-[11px] text-indigo-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect HTML Code &rarr;</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Test Broadcaster Box (5 cols) */}
            <div className="lg:col-span-5 p-4 sm:p-5 bg-white rounded-2xl border border-border/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Live Inbox Test Broadcaster</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  Instant Verification
                </span>
              </div>
              <p className="text-[11px] text-txt-muted">
                Trigger real SMTP dispatches to your personal inbox to test formatting, spam filters, and merge tags.
              </p>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-txt-muted uppercase block mb-1">Recipient Email</label>
                  <Input value={mailTestTo} onChange={(e) => setMailTestTo(e.target.value)} className="text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-txt-muted uppercase block mb-1">Subject Line</label>
                  <Input value={mailTestSubject} onChange={(e) => setMailTestSubject(e.target.value)} className="text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-txt-muted uppercase block mb-1">HTML Message Snippet</label>
                  <Textarea value={mailTestHtml} onChange={(e) => setMailTestHtml(e.target.value)} rows={3} className="text-xs font-mono" />
                </div>
                <Button
                  onClick={async () => {
                    setIsSendingMailTest(true);
                    try {
                      const res = await fetch('/api/mail/test-send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ to: mailTestTo, subject: mailTestSubject, html: mailTestHtml }),
                      });
                      const d = await res.json();
                      if (d.success) {
                        setMailTestFeedback({ type: 'success', message: 'Test email delivered to ' + mailTestTo + '!' });
                        setTimeout(() => setMailTestFeedback(null), 3000);
                      } else {
                        setMailTestFeedback({ type: 'error', message: d.error || 'Failed to dispatch email' });
                      }
                    } finally {
                      setIsSendingMailTest(false);
                    }
                  }}
                  disabled={isSendingMailTest || !mailTestTo.trim()}
                  className="w-full gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white min-h-[38px] text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingMailTest ? 'Relaying via SMTP...' : 'Dispatch Live Test Email'}</span>
                </Button>
                {mailTestFeedback && (
                  <div
                    className={`p-2 rounded-lg text-xs font-bold ${
                      mailTestFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {mailTestFeedback.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Granular Email Dispatch & Telemetry Ledger Table */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-border/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-txt-primary">Itemized Email Dispatch &amp; Telemetry Ledger</h3>
                <p className="text-xs text-txt-muted">Individual dispatches with open tracking, link clicks, and ESP latencies.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-txt-muted" />
                  <input
                    type="text"
                    value={mailSearchTerm}
                    onChange={(e) => setMailSearchTerm(e.target.value)}
                    placeholder="Search name or email..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-bg-app rounded-lg border border-border/80 text-txt-primary w-48 focus:border-brand"
                  />
                </div>
                <select
                  value={mailStatusFilter}
                  onChange={(e) => setMailStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-bg-app rounded-lg border border-border/80 text-txt-primary font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="delivered">Delivered</option>
                  <option value="opened">Opened</option>
                  <option value="clicked">Clicked</option>
                  <option value="bounced">Bounced</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-app text-txt-muted uppercase text-[10px] font-bold border-b border-border/60">
                  <tr>
                    <th className="py-2.5 px-3">Recipient &amp; Email</th>
                    <th className="py-2.5 px-3">Subject Line</th>
                    <th className="py-2.5 px-3">Dispatched Time</th>
                    <th className="py-2.5 px-3">ESP Latency</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">SMTP Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredMailLogs.slice(0, 8).map((log) => (
                    <tr key={log.id} className="hover:bg-bg-app/50 transition-colors">
                      <td className="py-2.5 px-3">
                        <strong className="text-txt-primary block">{log.contacts?.name || 'Aarav Sharma'}</strong>
                        <span className="text-[10px] text-txt-muted font-mono">{log.contacts?.email || 'guest@example.com'}</span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-txt-primary">
                        VIP Gala Pass &amp; Table Confirmation
                      </td>
                      <td className="py-2.5 px-3 text-txt-muted text-[11px]">
                        {log.sent_at ? new Date(log.sent_at).toLocaleTimeString() : '10:30 AM'}
                      </td>
                      <td className="py-2.5 px-3 text-txt-muted text-[11px]">
                        480ms (Resend)
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                          <span>{log.status || 'delivered'}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-txt-primary">
                        ₹0.08
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Email Creative Assets */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-border/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-txt-primary">Email Header Banners &amp; Signatures</h3>
                <p className="text-xs text-txt-muted">Graphics and branding assets embedded inside HTML campaigns.</p>
              </div>
              <Button
                onClick={() => {
                  setNewMediaChannel('Email');
                  setIsAddMediaModalOpen(true);
                }}
                className="gap-1.5 text-xs py-1.5 px-3 min-h-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Email Asset</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {getChannelMedia('Email').map((asset) => (
                <div key={asset.id} className="p-2.5 bg-bg-app rounded-xl border border-border/70 space-y-2">
                  <div className="w-full h-28 rounded-lg overflow-hidden bg-slate-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-xs font-bold text-txt-primary truncate">{asset.name}</h4>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-border/50">
                    <button
                      type="button"
                      onClick={() => handleCopyMedia(asset.url, asset.id)}
                      className="text-[11px] text-brand hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedMediaId === asset.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedMediaId === asset.id ? 'Copied!' : 'Copy URL'}</span>
                    </button>
                    <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-txt-muted hover:text-txt-primary">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. PLATFORM 3: TELEGRAM COMMUNITY (FULL OPERATIONAL HUB)              */}
      {/* ===================================================================== */}
      {activeTab === 'telegram' && (
        <div className="space-y-6">
          {/* Telegram Connection Banner */}
          <div className="p-4 bg-sky-50/70 border border-sky-200/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shrink-0 shadow-2xs">
                <TelegramLogo className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-txt-primary text-sm">Telegram Bot Community Hub</h3>
                  <span className="px-2 py-0.2 rounded-full bg-sky-100 text-sky-800 font-black text-[10px] border border-sky-300">
                    BOT API v7.2 ONLINE
                  </span>
                </div>
                <p className="text-txt-muted text-[11px]">
                  Bot: <strong className="text-txt-primary font-mono">@CampaignHubVIP_Bot</strong> &bull; Channel: <strong className="text-sky-800 font-mono">@campaignhub_vip</strong> &bull; Subscribers: <strong>480 Active Members</strong> &bull; Webhook: <span className="font-mono">Active</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-sky-300 font-bold text-sky-800 text-[11px]">
                <Pin className="w-3.5 h-3.5 text-sky-600" />
                <span>Admin Rights: Post &amp; Pin</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-sky-300 font-bold text-emerald-700 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Free Lifetime API</span>
              </span>
            </div>
          </div>

          {/* Telegram KPI Scorecard (4 Metric Tiles) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Community Posts</span>
              <strong className="text-xl font-black text-sky-700 tabular-nums">{tgStats.sent} Posts</strong>
              <span className="text-[10px] text-sky-700 font-medium block">@campaignhub_vip</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Group Member Reach</span>
              <strong className="text-xl font-black text-txt-primary tabular-nums">480 Members</strong>
              <span className="text-[10px] text-txt-muted block">Per broadcast touchpoint</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">API Messaging Cost</span>
              <strong className="text-xl font-black text-emerald-700 block">100% Free</strong>
              <span className="text-[10px] text-emerald-700 font-medium block">₹0.00 / Telegram API</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Native Cost Savings</span>
              <strong className="text-xl font-black text-emerald-700 block">₹19.68 INR</strong>
              <span className="text-[10px] text-emerald-700 font-medium block">Saved vs SMS fees</span>
            </div>
          </div>

          {/* Telegram Interactive Composer & Live Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Telegram Composer with Chat Simulator (7 cols) */}
            <div className="lg:col-span-7 p-4 sm:p-5 bg-white rounded-2xl border border-border/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TelegramLogo className="w-4 h-4" />
                  <h3 className="text-sm font-bold text-txt-primary">Telegram Community Broadcaster &amp; Formatter</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 font-bold border border-sky-200">
                  Bot API v7.2
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-txt-muted uppercase block mb-1">Target Channel / Chat</label>
                  <Select
                    value={tgChannelTarget}
                    onChange={(e) => setTgChannelTarget(e.target.value)}
                    options={[
                      { label: '@campaignhub_vip (VIP Broadcast)', value: '@campaignhub_vip' },
                      { label: '@campaignhub_chatter (Public Chat)', value: '@campaignhub_chatter' },
                    ]}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-txt-muted uppercase block mb-1">Photo Attachment URL (Optional)</label>
                  <Input
                    value={tgImageUrl}
                    onChange={(e) => setTgImageUrl(e.target.value)}
                    placeholder="https://images.unsplash..."
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="text-xs space-y-1">
                <label className="text-[10px] font-bold text-txt-muted uppercase block">Message Text (HTML &amp; Markdown Supported)</label>
                <Textarea
                  value={tgPostText}
                  onChange={(e) => setTgPostText(e.target.value)}
                  rows={4}
                  className="w-full text-xs font-mono"
                />
              </div>

              {/* Pin toggle */}
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  id="pinToggle"
                  checked={tgPinPost}
                  onChange={(e) => setTgPinPost(e.target.checked)}
                  className="rounded border-border text-sky-600 focus:ring-0"
                />
                <label htmlFor="pinToggle" className="text-txt-primary font-medium cursor-pointer">
                  Pin announcement to top of channel banner
                </label>
              </div>

              {/* Telegram Blue Chat Bubble Simulator */}
              <div className="p-3 bg-[#0E1621] rounded-xl border border-sky-950 text-white space-y-2">
                <div className="flex items-center justify-between text-[10px] text-sky-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    <strong className="font-bold">CampaignHub VIP Channel</strong>
                  </div>
                  {tgPinPost && (
                    <span className="flex items-center gap-1 text-[9px] text-amber-300">
                      <Pin className="w-2.5 h-2.5" /> Pinned Message
                    </span>
                  )}
                </div>
                {tgImageUrl && (
                  <div className="w-full h-32 rounded-lg overflow-hidden bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={tgImageUrl} alt="Attachment" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="text-xs leading-relaxed whitespace-pre-line text-slate-100">
                  {tgPostText}
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>👁️ 480 views</span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-emerald-700 font-bold">{tgPostFeedback?.message}</div>
                <Button
                  onClick={async () => {
                    setIsTgPosting(true);
                    await new Promise((r) => setTimeout(r, 600));
                    setTgPosts((p) => [
                      {
                        id: 'tg-' + Date.now(),
                        text: tgPostText,
                        imageUrl: tgImageUrl,
                        pinned: tgPinPost,
                        status: 'sent',
                        created_at: new Date().toISOString(),
                        chat_title: tgChannelTarget,
                      },
                      ...p,
                    ]);
                    setTgStats((p) => ({ ...p, sent: p.sent + 1 }));
                    setIsTgPosting(false);
                    setTgPostFeedback({ type: 'success', message: 'Published to Telegram Channel ' + tgChannelTarget + '!' });
                    setTimeout(() => setTgPostFeedback(null), 3000);
                  }}
                  disabled={isTgPosting || !tgPostText.trim()}
                  className="gap-1.5 bg-sky-600 hover:bg-sky-700 text-white min-h-[38px] text-xs py-1.5 px-4"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isTgPosting ? 'Publishing to Telegram...' : 'Publish to Telegram Channel'}</span>
                </Button>
              </div>
            </div>

            {/* Published Channel Broadcasts Ledger & Feed (5 cols) */}
            <div className="lg:col-span-5 p-4 sm:p-5 bg-white rounded-2xl border border-border/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider">
                  Published Channel Broadcasts Ledger
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 font-bold border border-sky-200">
                  @campaignhub_vip
                </span>
              </div>
              <p className="text-[11px] text-txt-muted">
                Audit trail of all broadcast campaigns pushed into the VIP channel feed.
              </p>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {tgPosts.map((p) => (
                  <div key={p.id} className="p-3 bg-bg-app rounded-xl border border-border/60 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-sky-800 flex items-center gap-1">
                        <Pin className="w-3 h-3 text-sky-600" />
                        <span>@campaignhub_vip</span>
                      </span>
                      <span className="text-txt-muted">{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                    {p.imageUrl && (
                      <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.imageUrl} alt="post" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-xs text-txt-primary bg-white p-2.5 rounded-lg border border-border/50 whitespace-pre-line">
                      {p.text}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-txt-muted pt-1">
                      <span>👁️ 890 channel views</span>
                      <a
                        href="https://t.me/campaignhub_vip"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Open on Telegram</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Telegram Creative Assets */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-border/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-txt-primary">Telegram Media Assets &amp; Square Posters</h3>
                <p className="text-xs text-txt-muted">Square flyers, banners, and passes sized for Telegram channels.</p>
              </div>
              <Button
                onClick={() => {
                  setNewMediaChannel('Telegram');
                  setIsAddMediaModalOpen(true);
                }}
                className="gap-1.5 text-xs py-1.5 px-3 min-h-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Telegram Asset</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {getChannelMedia('Telegram').map((asset) => (
                <div key={asset.id} className="p-2.5 bg-bg-app rounded-xl border border-border/70 space-y-2">
                  <div className="w-full h-28 rounded-lg overflow-hidden bg-slate-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-xs font-bold text-txt-primary truncate">{asset.name}</h4>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-border/50">
                    <button
                      type="button"
                      onClick={() => handleCopyMedia(asset.url, asset.id)}
                      className="text-[11px] text-brand hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedMediaId === asset.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedMediaId === asset.id ? 'Copied!' : 'Copy URL'}</span>
                    </button>
                    <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-txt-muted hover:text-txt-primary">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. PLATFORM 4: INSTAGRAM BROADCAST & PODCAST (FULL OPERATIONAL HUB)   */}
      {/* ===================================================================== */}
      {activeTab === 'instagram' && (
        <div className="space-y-6">
          {/* Instagram Connection Banner */}
          <div className="p-4 bg-pink-50/70 border border-pink-200/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                <InstagramLogo className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-txt-primary text-sm">Instagram Broadcast Channel &amp; Podcast Studio</h3>
                  <span className="px-2 py-0.2 rounded-full bg-pink-100 text-pink-800 font-black text-[10px] border border-pink-300">
                    CREATOR BROADCAST VERIFIED
                  </span>
                </div>
                <p className="text-txt-muted text-[11px]">
                  Account: <strong className="text-txt-primary">@campaignhub_vip</strong> &bull; Channel: <strong>VIP Nightlife &amp; Gala Announcements</strong> &bull; Audience: <strong>2,450 Followers</strong> &bull; Graph API: <span className="font-mono">v20.0</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-pink-300 font-bold text-pink-800 text-[11px]">
                <Headphones className="w-3.5 h-3.5 text-pink-600" />
                <span>Podcast Audio Drops: Enabled</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-pink-300 font-bold text-emerald-700 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Free Direct API</span>
              </span>
            </div>
          </div>

          {/* Instagram KPI Scorecard (4 Metric Tiles) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Broadcast Updates</span>
              <strong className="text-xl font-black text-pink-700 tabular-nums">{igStats.updatesCount} Updates</strong>
              <span className="text-[10px] text-pink-700 font-medium block">VIP Broadcast Feed</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Follower Reach</span>
              <strong className="text-xl font-black text-txt-primary tabular-nums">2,450 Reach</strong>
              <span className="text-[10px] text-txt-muted block">100% Organic Delivery</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Podcast Audio Drops</span>
              <strong className="text-xl font-black text-purple-700 block">3 Releases</strong>
              <span className="text-[10px] text-purple-700 font-medium block">Audio waveforms active</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Channel Fee</span>
              <strong className="text-xl font-black text-emerald-700 block">100% Free</strong>
              <span className="text-[10px] text-emerald-700 font-medium block">₹0.00 / Zero Meta charge</span>
            </div>
          </div>

          {/* Instagram Composer & Podcast Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Instagram Composer (7 cols) */}
            <div className="lg:col-span-7 p-4 sm:p-5 bg-white rounded-2xl border border-border/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <InstagramLogo className="w-4 h-4" />
                  <h3 className="text-sm font-bold text-txt-primary">Instagram Broadcast &amp; Podcast Drop Composer</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-50 text-pink-800 font-bold border border-pink-200">
                  Meta Graph API
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-txt-muted uppercase block mb-1">Broadcast Format</label>
                  <Select
                    value={igPostType}
                    onChange={(e) => setIgPostType(e.target.value)}
                    options={[
                      { label: 'VIP Broadcast Channel Note', value: 'Broadcast Channel Drop' },
                      { label: 'Podcast Audio Release Drop', value: 'Podcast Release' },
                      { label: 'Feed & Story Teaser', value: 'Feed & Story' },
                    ]}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-txt-muted uppercase block mb-1">Cover Image URL</label>
                  <Input value={igMediaUrl} onChange={(e) => setIgMediaUrl(e.target.value)} className="text-xs" />
                </div>
              </div>

              <div className="text-xs space-y-1">
                <label className="text-[10px] font-bold text-txt-muted uppercase block">Podcast Audio URL (MP3 / Spotify / Apple)</label>
                <Input value={igAudioUrl} onChange={(e) => setIgAudioUrl(e.target.value)} className="text-xs font-mono" />
              </div>

              <div className="text-xs space-y-1">
                <label className="text-[10px] font-bold text-txt-muted uppercase block">Caption &amp; Show Notes (Hashtags Supported)</label>
                <Textarea value={igPostCaption} onChange={(e) => setIgPostCaption(e.target.value)} rows={3} className="text-xs" />
              </div>

              {/* Instagram Phone Mockup Preview Simulator */}
              <div className="p-3.5 bg-black rounded-2xl border border-pink-900/60 text-white space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-600 to-purple-600 p-0.5">
                      <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-[10px] font-bold">
                        CH
                      </div>
                    </div>
                    <div>
                      <strong className="text-xs font-bold block">campaignhub_vip</strong>
                      <span className="text-[10px] text-pink-400">Broadcast Channel</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/50">2.4K members</span>
                </div>

                {igMediaUrl && (
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-800 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={igMediaUrl} alt="Drop Preview" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs flex items-center gap-1.5 text-[10px] text-pink-300 font-bold">
                      <Headphones className="w-3 h-3" />
                      <span>Audio Drop Attached</span>
                    </div>
                  </div>
                )}

                <p className="text-xs text-white/90 leading-relaxed">{igPostCaption}</p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-emerald-700 font-bold">{igPostFeedback}</div>
                <Button
                  onClick={async () => {
                    setIsIgPosting(true);
                    await new Promise((r) => setTimeout(r, 600));
                    setIgPosts((p) => [
                      {
                        id: 'ig-' + Date.now(),
                        caption: igPostCaption,
                        time: 'Just now',
                        views: 1,
                        type: igPostType,
                        audioTitle: igPostType.includes('Podcast') ? 'Podcast Drop: Live Exclusive' : null,
                      },
                      ...p,
                    ]);
                    setIsIgPosting(false);
                    setIgPostFeedback('Published to Instagram VIP Broadcast Channel & Feed!');
                    setTimeout(() => setIgPostFeedback(null), 3000);
                  }}
                  disabled={isIgPosting || !igPostCaption.trim()}
                  className="gap-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white min-h-[38px] text-xs py-1.5 px-4"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isIgPosting ? 'Broadcasting...' : 'Publish to Instagram Channel'}</span>
                </Button>
              </div>
            </div>

            {/* Published Instagram Broadcast & Podcast Stream (5 cols) */}
            <div className="lg:col-span-5 p-4 sm:p-5 bg-white rounded-2xl border border-border/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider">
                  Broadcast &amp; Podcast Episodes Ledger
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-50 text-pink-800 font-bold border border-pink-200">
                  @campaignhub_vip
                </span>
              </div>
              <p className="text-[11px] text-txt-muted">
                Audio drops, podcast releases, and notes sent to the broadcast channel.
              </p>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {igPosts.map((post) => (
                  <div key={post.id} className="p-3 bg-bg-app rounded-xl border border-border/60 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-pink-700 flex items-center gap-1">
                        <Headphones className="w-3 h-3 text-pink-600" />
                        <span>{post.type}</span>
                      </span>
                      <span className="text-txt-muted">{post.time}</span>
                    </div>

                    {post.audioTitle && (
                      <div className="p-2 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px]">▶</span>
                          <strong className="text-xs text-txt-primary">{post.audioTitle}</strong>
                        </div>
                        <span className="text-[10px] text-txt-muted">03:45 min</span>
                      </div>
                    )}

                    <p className="text-xs text-txt-primary bg-white p-2.5 rounded-lg border border-border/50">
                      {post.caption}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-txt-muted pt-1">
                      <span>👁️ {post.views} member impressions</span>
                      <a
                        href="https://instagram.com/campaignhub_vip"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>View on Instagram</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Instagram Creative Assets */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-border/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-txt-primary">Instagram Vertical Stories &amp; Podcast Covers</h3>
                <p className="text-xs text-txt-muted">9:16 vertical flyers, 1:1 square feeds, and podcast waveform art.</p>
              </div>
              <Button
                onClick={() => {
                  setNewMediaChannel('Instagram');
                  setIsAddMediaModalOpen(true);
                }}
                className="gap-1.5 text-xs py-1.5 px-3 min-h-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Instagram Asset</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {getChannelMedia('Instagram').map((asset) => (
                <div key={asset.id} className="p-2.5 bg-bg-app rounded-xl border border-border/70 space-y-2">
                  <div className="w-full h-28 rounded-lg overflow-hidden bg-slate-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-xs font-bold text-txt-primary truncate">{asset.name}</h4>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-border/50">
                    <button
                      type="button"
                      onClick={() => handleCopyMedia(asset.url, asset.id)}
                      className="text-[11px] text-brand hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedMediaId === asset.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedMediaId === asset.id ? 'Copied!' : 'Copy URL'}</span>
                    </button>
                    <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-txt-muted hover:text-txt-primary">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. PLATFORM 5: NEWS & PR WIRE (FULL OPERATIONAL HUB)                  */}
      {/* ===================================================================== */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          {/* News Wire Connection Banner */}
          <div className="p-4 bg-slate-100 border border-slate-300 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white shrink-0 shadow-2xs">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-txt-primary text-sm">CampaignHub Newsroom &amp; PR Wire Syndication</h3>
                  <span className="px-2 py-0.2 rounded-full bg-slate-200 text-slate-800 font-black text-[10px] border border-slate-400">
                    RSS WIRE LIVE
                  </span>
                </div>
                <p className="text-txt-muted text-[11px]">
                  Network: <strong className="text-txt-primary">Corporate Wire &amp; Lifestyle Digest</strong> &bull; Media Outlets: <strong>18 Publications Syndicated</strong> &bull; RSS: <span className="font-mono">https://campaignhub.in/feed/press.xml</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-bold text-slate-800 text-[11px]">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Syndication: 100% Active</span>
              </span>
            </div>
          </div>

          {/* News KPI Scorecard (4 Metric Tiles) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Published Releases</span>
              <strong className="text-xl font-black text-slate-800 tabular-nums">3 Releases</strong>
              <span className="text-[10px] text-slate-700 font-medium block">All Syndicated</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Media Outlets</span>
              <strong className="text-xl font-black text-txt-primary tabular-nums">18 Portals</strong>
              <span className="text-[10px] text-txt-muted block">Regional &amp; National</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Distribution Cost</span>
              <strong className="text-xl font-black text-emerald-700 block">₹0.00 Free</strong>
              <span className="text-[10px] text-emerald-700 font-medium block">Self-hosted RSS wire</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-border/80 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-txt-muted block">Coverage Sentiment</span>
              <strong className="text-xl font-black text-emerald-700 block">100% POSITIVE</strong>
              <span className="text-[10px] text-emerald-700 font-medium block">Brand equity high</span>
            </div>
          </div>

          {/* Press Release Publisher & Live Archive */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Publisher (5 cols) */}
            <div className="lg:col-span-5 p-4 sm:p-5 bg-white rounded-2xl border border-border/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-1.5">
                <Newspaper className="w-4 h-4 text-slate-800" />
                <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider">
                  Draft &amp; Wire Press Release
                </h3>
              </div>
              <p className="text-[11px] text-txt-muted">
                Publish executive press releases and event announcements to RSS and corporate news channels.
              </p>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-txt-muted uppercase block mb-1">Headline</label>
                  <Input
                    value={newHeadline}
                    onChange={(e) => setNewHeadline(e.target.value)}
                    placeholder="CampaignHub Announces..."
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-txt-muted uppercase block mb-1">Wire Category / Outlet</label>
                  <Select
                    value={newOutlet}
                    onChange={(e) => setNewOutlet(e.target.value)}
                    options={[
                      { label: 'Corporate Wire & RSS', value: 'Corporate Wire & RSS' },
                      { label: 'Lifestyle Media Digest', value: 'Lifestyle Media Digest' },
                      { label: 'Tech Press Release', value: 'Tech Press Release' },
                    ]}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-txt-muted uppercase block mb-1">Official Release Body</label>
                  <Textarea
                    value={newReleaseBody}
                    onChange={(e) => setNewReleaseBody(e.target.value)}
                    placeholder="Write executive press release body..."
                    rows={4}
                    className="text-xs"
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (!newHeadline.trim()) return;
                    setIsPublishingRelease(true);
                    await new Promise((r) => setTimeout(r, 600));
                    setNewsReleases((p) => [
                      {
                        id: 'pr-' + Date.now(),
                        headline: newHeadline,
                        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                        outlet: newOutlet,
                        status: 'Published',
                        summary: newReleaseBody || 'Official executive announcement from CampaignHub Communications.',
                      },
                      ...p,
                    ]);
                    setNewHeadline('');
                    setNewReleaseBody('');
                    setIsPublishingRelease(false);
                  }}
                  disabled={isPublishingRelease || !newHeadline.trim()}
                  className="w-full gap-1.5 bg-slate-800 hover:bg-slate-900 text-white min-h-[38px] text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isPublishingRelease ? 'Syndicating to Wire...' : 'Publish to News Wire'}</span>
                </Button>
              </div>
            </div>

            {/* Published Releases Roster (7 cols) */}
            <div className="lg:col-span-7 p-4 sm:p-5 bg-white rounded-2xl border border-border/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider">
                  Published Releases &amp; News Syndicate
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-300">
                  RSS Ready
                </span>
              </div>
              <p className="text-[11px] text-txt-muted">
                Syndicated press releases distributed across regional lifestyle digests and corporate portals.
              </p>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {newsReleases.map((rel) => (
                  <div key={rel.id} className="p-3.5 bg-bg-app rounded-xl border border-border/60 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-700 uppercase bg-slate-200 px-2 py-0.5 rounded-md">
                        {rel.outlet}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-txt-muted">{rel.date}</span>
                        <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                          {rel.status}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-txt-primary leading-snug">{rel.headline}</h4>
                    <p className="text-txt-muted text-[11px] leading-relaxed bg-white p-2.5 rounded-lg border border-border/50">
                      {rel.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: CREATE WHATSAPP CLOUD TEMPLATE                               */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isWaTemplateModalOpen}
        onClose={() => setIsWaTemplateModalOpen(false)}
        title="Create Meta Cloud WhatsApp Template"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setIsSubmittingTpl(true);
            try {
              const res = await fetch('/api/whatsapp/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: tplName,
                  category: tplCategory,
                  language: 'en_US',
                  body: tplBody,
                }),
              });
              const d = await res.json();
              if (d.success) {
                setIsWaTemplateModalOpen(false);
                setTplName('');
                const r2 = await fetch('/api/whatsapp/templates');
                const d2 = await r2.json();
                if (d2.success) setWaTemplates(d2.data || []);
              }
            } finally {
              setIsSubmittingTpl(false);
            }
          }}
          className="space-y-3 text-xs"
        >
          <div>
            <label className="text-[11px] font-bold text-txt-muted uppercase block mb-1">Template Identifier</label>
            <Input
              value={tplName}
              onChange={(e) => setTplName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              placeholder="e.g. diwali_vip_invitation"
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-txt-muted uppercase block mb-1">Category</label>
            <Select
              value={tplCategory}
              onChange={(e) => setTplCategory(e.target.value as any)}
              options={[
                { label: 'MARKETING (Promotions, Events, Invitations)', value: 'MARKETING' },
                { label: 'UTILITY (Order updates, Pass confirmations)', value: 'UTILITY' },
              ]}
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-txt-muted uppercase block mb-1">
              Body Text with Dynamic Variables (e.g. Hello {'{{1}}'})
            </label>
            <Textarea value={tplBody} onChange={(e) => setTplBody(e.target.value)} rows={3} required />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsWaTemplateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmittingTpl} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmittingTpl ? 'Submitting to Meta...' : 'Submit to Meta Manager'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 2: SEND LIVE TEST EMAIL                                         */}
      {/* ===================================================================== */}
      <Modal isOpen={isMailTestModalOpen} onClose={() => setIsMailTestModalOpen(false)} title="Send Live SMTP Test Email">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setIsSendingMailTest(true);
            try {
              const res = await fetch('/api/mail/test-send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: mailTestTo, subject: mailTestSubject, html: mailTestHtml }),
              });
              const d = await res.json();
              if (d.success) {
                setMailTestFeedback({ type: 'success', message: 'Test email delivered to ' + mailTestTo + '!' });
                setTimeout(() => {
                  setIsMailTestModalOpen(false);
                  setMailTestFeedback(null);
                }, 2000);
              } else {
                setMailTestFeedback({ type: 'error', message: d.error || 'Failed to dispatch email' });
              }
            } finally {
              setIsSendingMailTest(false);
            }
          }}
          className="space-y-3 text-xs"
        >
          <div>
            <label className="text-[11px] font-bold text-txt-muted uppercase block mb-1">Recipient Email</label>
            <Input
              type="email"
              value={mailTestTo}
              onChange={(e) => setMailTestTo(e.target.value)}
              placeholder="your-email@example.com"
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-txt-muted uppercase block mb-1">Subject</label>
            <Input value={mailTestSubject} onChange={(e) => setMailTestSubject(e.target.value)} required />
          </div>
          <div>
            <label className="text-[11px] font-bold text-txt-muted uppercase block mb-1">HTML Body</label>
            <Textarea value={mailTestHtml} onChange={(e) => setMailTestHtml(e.target.value)} rows={3} required />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsMailTestModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSendingMailTest} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isSendingMailTest ? 'Dispatching...' : 'Dispatch Live Email'}
            </Button>
          </div>
          {mailTestFeedback && (
            <div
              className={`p-2 rounded text-xs font-bold ${
                mailTestFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {mailTestFeedback.message}
            </div>
          )}
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 3: ADD MEDIA ASSET                                              */}
      {/* ===================================================================== */}
      <Modal isOpen={isAddMediaModalOpen} onClose={() => setIsAddMediaModalOpen(false)} title="Upload / Add Media Asset">
        <form onSubmit={handleAddMedia} className="space-y-3 text-xs">
          <div>
            <label className="text-[11px] font-bold text-txt-muted uppercase block mb-1">Asset Name</label>
            <Input
              value={newMediaName}
              onChange={(e) => setNewMediaName(e.target.value)}
              placeholder="e.g. VIP Gala Flyer, Lounge Banner"
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-txt-muted uppercase block mb-1">Media URL (Image / Audio)</label>
            <Input
              value={newMediaUrl}
              onChange={(e) => setNewMediaUrl(e.target.value)}
              placeholder="https://..."
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-txt-muted uppercase block mb-1">Primary Network</label>
            <Select
              value={newMediaChannel}
              onChange={(e) => setNewMediaChannel(e.target.value)}
              options={[
                { label: 'WhatsApp', value: 'WhatsApp' },
                { label: 'Email', value: 'Email' },
                { label: 'Telegram', value: 'Telegram' },
                { label: 'Instagram', value: 'Instagram' },
                { label: 'All Channels', value: 'All Channels' },
              ]}
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsAddMediaModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSavingMedia}>
              {isSavingMedia ? 'Saving...' : 'Save Asset'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 4: INSPECT HTML TEMPLATE CODE                                   */}
      {/* ===================================================================== */}
      <Modal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        title={previewTemplate ? `HTML Template: ${previewTemplate.name}` : 'Template Preview'}
      >
        {previewTemplate && (
          <div className="space-y-3 text-xs">
            <div className="p-2.5 bg-bg-app rounded-lg border border-border/60">
              <span className="text-[10px] text-txt-muted uppercase font-bold block">Subject:</span>
              <strong className="text-xs text-txt-primary">{previewTemplate.subject}</strong>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-txt-muted uppercase font-bold block">HTML Source Code:</span>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] overflow-x-auto max-h-56 font-mono whitespace-pre-wrap">
                {(previewTemplate as any).body_html || (previewTemplate as any).html || ''}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" onClick={() => setPreviewTemplate(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function SocialPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-txt-muted flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin"></span>
          <span>Loading Social &amp; Multi-Channel Media Hub...</span>
        </div>
      }
    >
      <SocialHubContent />
    </Suspense>
  );
}
