'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { WhatsAppLogo, GmailLogo, TelegramLogo, InstagramLogo } from '@/components/ui/BrandIcons';
import {
  Eye,
  Send,
  Calendar,
  MessageSquare,
  Mail,
  Radio,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  Users,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Info,
  X,
  Clock,
  ArrowRight,
  FileCode,
  LayoutTemplate,
  SlidersHorizontal,
  Tag,
  Check,
  ChevronRight,
  Plus,
  Trash2,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Camera,
  Mic,
  ArrowLeft,
  CheckCheck,
  Lock,
  Wifi,
} from 'lucide-react';
import {
  extractWhatsAppVariables,
  interpolateWhatsApp,
  interpolateEmail,
  calculateWhatsAppCost,
  type WhatsAppTemplate,
  type ChannelType,
} from '@campaignhub/shared';

// WhatsApp text formatter: parses WhatsApp formatting and escapes HTML safely
function formatWhatsAppText(
  rawText: string,
  previewName: string,
  primaryUrl: string
): string {
  if (!rawText) return '';
  let text = rawText
    .replace(/{{name}}/g, previewName)
    .replace(/{{first_name}}/g, previewName.split(' ')[0])
    .replace(/{{phone}}/g, '+91 98765 43210')
    .replace(/{{link}}/g, primaryUrl || '');

  // Escape HTML entities to prevent injection
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Apply WhatsApp formatting:
  // *bold* -> <strong>bold</strong>
  text = text.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
  // _italic_ -> <em>italic</em>
  text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
  // ~strike~ -> <del>strike</del>
  text = text.replace(/~([^~]+)~/g, '<del class="opacity-75">$1</del>');
  // ```code``` -> <code>code</code>
  text = text.replace(/```([^`]+)```/g, '<code class="bg-[#F0F2F5] px-1 py-0.5 rounded font-mono text-xs">$1</code>');
  // Line breaks
  text = text.replace(/\n/g, '<br />');

  return text;
}

// Aesthetic Dummy Email Templates
const DUMMY_EMAIL_TEMPLATES = [
  {
    id: 'party_invitation',
    name: '🎉 Celebration & Party Invite',
    subject: 'Exclusive Invitation for {{name}}: Special Company Celebration & Party!',
    linkUrl: 'https://campaignhub.example.com/party-rsvp',
    linkTitle: 'RSVP & Event Details',
    html: `<div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #DCE5DD; border-radius: 8px;">
  <div style="border-bottom: 2px solid #1E6B4F; padding-bottom: 12px; margin-bottom: 20px;">
    <span style="font-size: 11px; font-weight: 700; color: #1E6B4F; text-transform: uppercase; letter-spacing: 0.8px;">Official Invitation</span>
    <h2 style="color: #14231C; font-size: 20px; margin: 4px 0 0 0; font-weight: 800;">Annual Company Gala &amp; Celebration</h2>
  </div>
  <p style="color: #14231C; font-size: 15px; font-weight: 600; margin-bottom: 12px;">Hi {{name}},</p>
  <p style="color: #52645A; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
    This is the stuff! We are hosting a special company celebration and evening party, and you are warmly invited to celebrate together.
  </p>
  <div style="background-color: #F4F7F3; border: 1px solid #DCE5DD; border-radius: 6px; padding: 14px 18px; margin: 18px 0;">
    <p style="margin: 0 0 6px 0; font-size: 13px; color: #14231C;"><strong>📅 Date &amp; Time:</strong> Saturday, 7:00 PM IST</p>
    <p style="margin: 0 0 6px 0; font-size: 13px; color: #14231C;"><strong>📍 Venue:</strong> The Grand Ballroom, Downtown Center</p>
    <p style="margin: 0; font-size: 13px; color: #14231C;"><strong>✨ Dress Code:</strong> Festive / Smart Casual</p>
  </div>
  <p style="color: #52645A; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
    Please confirm your attendance via the link below so we can arrange your guest pass and catering preferences:
  </p>
  <div style="text-align: center; margin: 22px 0;">
    <a href="{{link}}" style="display: inline-block; background-color: #1E6B4F; color: #ffffff; padding: 11px 26px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 6px;">
      Confirm RSVP &amp; View Link →
    </a>
  </div>
  <p style="color: #7B8E83; font-size: 12px; line-height: 1.5; margin-top: 22px; border-top: 1px solid #E8F0E9; padding-top: 14px;">
    Looking forward to seeing you there!<br>
    <strong style="color: #14231C;">Warm regards,<br>Harsh Parmar &amp; The Organizing Team</strong>
  </p>
</div>`,
  },
  {
    id: 'company_announcement',
    name: '📢 Important Company Update',
    subject: 'Important Announcement for {{name}}: Q4 Growth & Team Milestone',
    linkUrl: 'https://campaignhub.example.com/company-update',
    linkTitle: 'Read Full Announcement',
    html: `<div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #DCE5DD; border-radius: 8px;">
  <div style="background-color: #E8F8EE; color: #1E6B4F; padding: 4px 10px; border-radius: 4px; display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">Company Announcement</div>
  <h2 style="color: #14231C; font-size: 19px; margin-top: 0; font-weight: 700;">Exciting Milestones &amp; Upcoming Plans</h2>
  <p style="color: #52645A; font-size: 14px; line-height: 1.6;">Hello {{name}},</p>
  <p style="color: #52645A; font-size: 14px; line-height: 1.6;">
    We are thrilled to share significant milestones achieved this quarter thanks to your dedication and partnership. Here is everything you need to know about our upcoming initiatives.
  </p>
  <div style="text-align: center; margin: 20px 0;">
    <a href="{{link}}" style="display: inline-block; background-color: #1E6B4F; color: #ffffff; padding: 10px 22px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 5px;">
      View Complete Roadmap →
    </a>
  </div>
  <p style="color: #7B8E83; font-size: 12px; margin-top: 20px;">CampaignHub Team</p>
</div>`,
  },
  {
    id: 'product_launch',
    name: '🚀 Product Launch & Access',
    subject: 'Early Access for {{name}}: Introducing CampaignHub 2.0',
    linkUrl: 'https://campaignhub.example.com/early-access',
    linkTitle: 'Claim Early Access',
    html: `<div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #DCE5DD; border-radius: 8px;">
  <span style="color: #2563EB; font-size: 11px; font-weight: 700; text-transform: uppercase;">Product Release</span>
  <h2 style="color: #14231C; font-size: 20px; margin: 4px 0 12px 0; font-weight: 700;">CampaignHub 2.0 is officially here</h2>
  <p style="color: #52645A; font-size: 14px; line-height: 1.6;">Hi {{name}},</p>
  <p style="color: #52645A; font-size: 14px; line-height: 1.6;">
    You have been selected for exclusive early access to our newest multi-channel outreach engine with native WhatsApp, Email, and Telegram orchestration.
  </p>
  <div style="text-align: center; margin: 22px 0;">
    <a href="{{link}}" style="display: inline-block; background-color: #2563EB; color: #ffffff; padding: 11px 24px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 6px;">
      Activate Your Access →
    </a>
  </div>
  <p style="color: #7B8E83; font-size: 12px;">Warm regards,<br>The Product Team</p>
</div>`,
  },
];

interface WhatsAppActionButton {
  id: string;
  title: string;
  url: string;
}

interface InstagramActionButton {
  id: string;
  title: string;
  url: string;
}

export default function NewCampaignPage() {
  const router = useRouter();

  // 1. Campaign Details & Audience Meta
  const [name, setName] = useState('');
  const [campaignCategory, setCampaignCategory] = useState('Celebration');
  const [audienceType, setAudienceType] = useState<'all' | 'vip' | 'regular' | 'tag'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [sendTiming, setSendTiming] = useState<'now' | 'schedule'>('now');
  const [scheduledAt, setScheduledAt] = useState('');

  // Selected Channels
  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>([
    'whatsapp',
    'email',
    'telegram',
    'instagram',
  ]);

  // 2. WhatsApp Section States
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [waMode, setWaMode] = useState<'custom' | 'template'>('custom');
  const [selectedWaTemplateId, setSelectedWaTemplateId] = useState<string>('');
  const [waVariableMap, setWaVariableMap] = useState<Record<string, string>>({});
  const [waImageUrl, setWaImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'
  );
  const [waCustomText, setWaCustomText] = useState<string>(
    'Hello {{name}}! 🌟 We are excited to announce our upcoming special company party and celebration! Everything is set up for a fantastic evening.'
  );

  // WhatsApp Multi-Link CTA Buttons
  const [waActionButtons, setWaActionButtons] = useState<WhatsAppActionButton[]>([
    {
      id: 'btn-1',
      title: 'RSVP & Event Details',
      url: 'https://campaignhub.example.com/party-rsvp',
    },
  ]);

  // 3. Email Section States (Initialized with Celebration template)
  const [selectedEmailTemplateId, setSelectedEmailTemplateId] = useState<string>(DUMMY_EMAIL_TEMPLATES[0].id);
  const [emailSubject, setEmailSubject] = useState<string>(DUMMY_EMAIL_TEMPLATES[0].subject);
  const [emailLinkUrl, setEmailLinkUrl] = useState<string>(DUMMY_EMAIL_TEMPLATES[0].linkUrl);
  const [emailLinkTitle, setEmailLinkTitle] = useState<string>(DUMMY_EMAIL_TEMPLATES[0].linkTitle);
  const [emailHtml, setEmailHtml] = useState<string>(DUMMY_EMAIL_TEMPLATES[0].html);
  const [emailViewMode, setEmailViewMode] = useState<'code' | 'preview'>('preview');

  // 4. Telegram Section States
  const [telegramChannel, setTelegramChannel] = useState<string>('@campaignhub_internal');
  const [telegramText, setTelegramText] = useState<string>(
    '🎉 <b>Special Company Gathering & Party Announcement!</b>\n\nHey everyone! We have this party coming up and we would love to have all our members join us.\n\n🔗 <b>RSVP & Location Link:</b> https://campaignhub.example.com/party-rsvp\n\nSee you there!'
  );
  const [telegramImageUrl, setTelegramImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'
  );
  const [telegramLinkUrl, setTelegramLinkUrl] = useState<string>('https://campaignhub.example.com/party-rsvp');

  // 5. Instagram Broadcast Section States
  const [instagramChannelName, setInstagramChannelName] = useState<string>('CampaignHub VIP Broadcast');
  const [instagramImageUrl, setInstagramImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'
  );
  const [instagramCaption, setInstagramCaption] = useState<string>(
    'Hey everyone! 🌟 Welcome to our exclusive broadcast update.\n\nWe are hosting a massive party & celebration event this weekend! You are officially invited to join us for an evening of networking, great music, and celebration.\n\nTap the link below to RSVP and save your spot!'
  );
  const [instagramActionButtons, setInstagramActionButtons] = useState<InstagramActionButton[]>([
    {
      id: 'ig-btn-1',
      title: 'RSVP / Join Party Now',
      url: 'https://campaignhub.example.com/party-rsvp',
    },
  ]);

  // Simulated recipient for preview
  const [previewName, setPreviewName] = useState<string>('Harsh Parmar');

  // Pre-flight Summary & Counts
  const [audienceSummary, setAudienceSummary] = useState<any | null>(null);

  // Centered Pop-up Modal States
  const [isWhatsAppPreviewOpen, setIsWhatsAppPreviewOpen] = useState(false);
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [isTelegramPreviewOpen, setIsTelegramPreviewOpen] = useState(false);
  const [isInstagramPreviewOpen, setIsInstagramPreviewOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Multi-AI Copywriting Assistant State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTargetChannel, setAiTargetChannel] = useState<'whatsapp' | 'email' | 'telegram' | 'instagram'>('whatsapp');
  const [aiPromptInput, setAiPromptInput] = useState('Write an exciting party invitation for Saturday night Bollywood Gala with DJ Shadow at Club Matrix');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{
    text: string;
    provider: string;
    model: string;
    fallbackUsed: boolean;
    latencyMs: number;
  } | null>(null);
  const [aiError, setAiError] = useState('');

  async function handleGenerateWithAi() {
    if (!aiPromptInput.trim()) return;
    setIsGeneratingAi(true);
    setAiError('');
    setAiFeedback(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPromptInput,
          channel: aiTargetChannel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiFeedback({
          text: data.text,
          provider: data.providerUsed,
          model: data.modelUsed,
          fallbackUsed: data.fallbackUsed,
          latencyMs: data.latencyMs,
        });

        // Auto-apply copy to the targeted channel
        if (aiTargetChannel === 'whatsapp') {
          setWaCustomText(data.text);
          setWaMode('custom');
        } else if (aiTargetChannel === 'email') {
          const lines = data.text.split('\n');
          const subjectLine = lines.find((l: string) => l.toLowerCase().startsWith('subject:'));
          if (subjectLine) {
            setEmailSubject(subjectLine.replace(/^subject:\s*/i, ''));
            const bodyLines = lines.filter((l: string) => !l.toLowerCase().startsWith('subject:'));
            setEmailHtml(`<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">${bodyLines.join('<br />')}</div>`);
          } else {
            setEmailHtml(`<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">${data.text.replace(/\n/g, '<br />')}</div>`);
          }
        } else if (aiTargetChannel === 'telegram') {
          setTelegramText(data.text);
        } else if (aiTargetChannel === 'instagram') {
          setInstagramCaption(data.text);
        }
      } else {
        setAiError(data.error || 'AI generation failed');
      }
    } catch (err: any) {
      setAiError(err.message || 'AI service error');
    } finally {
      setIsGeneratingAi(false);
    }
  }

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAudienceEstimate();
  }, [audienceType, selectedTags, selectedChannels]);

  async function fetchInitialData() {
    try {
      const [tplRes, contactsRes] = await Promise.all([
        fetch('/api/whatsapp/templates'),
        fetch('/api/contacts?limit=100'),
      ]);

      const tplData = await tplRes.json();
      if (tplData.success && tplData.data && tplData.data.length > 0) {
        setTemplates(tplData.data);
        setSelectedWaTemplateId(tplData.data[0].name);
      }

      const contactsData = await contactsRes.json();
      if (contactsData.success && contactsData.data) {
        const tagsSet = new Set<string>();
        contactsData.data.forEach((c: any) => {
          if (c.tags && Array.isArray(c.tags)) {
            c.tags.forEach((t: string) => tagsSet.add(t));
          }
        });
        setAvailableTags(Array.from(tagsSet));
      }
    } catch (err) {
      console.error('Failed to load initial campaign data:', err);
    }
  }

  async function fetchAudienceEstimate() {
    try {
      const tagsParam = audienceType === 'tag' ? selectedTags.join(',') : '';
      const tierParam = audienceType === 'vip' || audienceType === 'regular' ? audienceType : 'all';
      const res = await fetch(`/api/campaigns/estimate?tags=${tagsParam}&tier=${tierParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAudienceSummary(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch audience estimate:', err);
    }
  }

  const handleSelectTemplate = (name: string) => {
    setSelectedWaTemplateId(name);
    const tpl = templates.find((t) => t.name === name);
    if (tpl) {
      const vars = extractWhatsAppVariables(tpl.body);
      const initialMap: Record<string, string> = {};
      vars.forEach((v) => {
        initialMap[v] = 'name';
      });
      setWaVariableMap(initialMap);
    }
  };

  const loadDummyEmailTemplate = (templateId: string) => {
    setSelectedEmailTemplateId(templateId);
    const tpl = DUMMY_EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (tpl) {
      setEmailSubject(tpl.subject);
      setEmailLinkUrl(tpl.linkUrl);
      setEmailLinkTitle(tpl.linkTitle);
      setEmailHtml(tpl.html);
      setEmailViewMode('preview');
    }
  };

  const addWaActionButton = () => {
    if (waActionButtons.length >= 3) return; // WhatsApp limits up to 3 interactive CTA buttons
    setWaActionButtons([
      ...waActionButtons,
      {
        id: `btn-${Date.now()}`,
        title: 'View Event Venue',
        url: 'https://campaignhub.example.com/venue-map',
      },
    ]);
  };

  const updateWaActionButton = (id: string, field: 'title' | 'url', value: string) => {
    setWaActionButtons(
      waActionButtons.map((btn) => (btn.id === id ? { ...btn, [field]: value } : btn))
    );
  };

  const removeWaActionButton = (id: string) => {
    if (waActionButtons.length <= 1) return;
    setWaActionButtons(waActionButtons.filter((btn) => btn.id !== id));
  };

  const addInstagramActionButton = () => {
    if (instagramActionButtons.length >= 3) return; // Up to 3 action CTA links
    setInstagramActionButtons([
      ...instagramActionButtons,
      {
        id: `ig-btn-${Date.now()}`,
        title: `Action Link #${instagramActionButtons.length + 1}`,
        url: 'https://campaignhub.example.com',
      },
    ]);
  };

  const updateInstagramActionButton = (id: string, field: 'title' | 'url', value: string) => {
    setInstagramActionButtons(
      instagramActionButtons.map((btn) => (btn.id === id ? { ...btn, [field]: value } : btn))
    );
  };

  const removeInstagramActionButton = (id: string) => {
    if (instagramActionButtons.length <= 1) return;
    setInstagramActionButtons(instagramActionButtons.filter((btn) => btn.id !== id));
  };

  const toggleChannel = (ch: ChannelType) => {
    if (selectedChannels.includes(ch)) {
      if (selectedChannels.length === 1) return; // Keep at least one
      setSelectedChannels(selectedChannels.filter((c) => c !== ch));
    } else {
      setSelectedChannels([...selectedChannels, ch]);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  async function handleSubmitCampaign(action: 'launch' | 'draft') {
    setIsSubmitting(true);
    setFormError('');

    const primaryButton = waActionButtons[0];
    const primaryIgButton = instagramActionButtons[0];

    const payload = {
      action,
      name,
      channels: selectedChannels,
      audience_tags: audienceType === 'tag' ? selectedTags : [],
      audience_tier: audienceType === 'vip' || audienceType === 'regular' ? audienceType : 'all',
      scheduled_at: sendTiming === 'schedule' && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      whatsapp_template_id: selectedChannels.includes('whatsapp')
        ? waMode === 'template'
          ? selectedWaTemplateId
          : 'custom_message'
        : null,
      whatsapp_variable_map: selectedChannels.includes('whatsapp') && waMode === 'template' ? waVariableMap : {},
      whatsapp_image_url: selectedChannels.includes('whatsapp') ? waImageUrl || null : null,
      whatsapp_message_text: selectedChannels.includes('whatsapp') ? waCustomText || null : null,
      whatsapp_link_url: selectedChannels.includes('whatsapp') ? primaryButton?.url || null : null,
      whatsapp_link_title: selectedChannels.includes('whatsapp') ? primaryButton?.title || null : null,
      email_subject: selectedChannels.includes('email') ? emailSubject : null,
      email_html: selectedChannels.includes('email') ? emailHtml : null,
      email_link_url: selectedChannels.includes('email') ? emailLinkUrl || null : null,
      telegram_text: selectedChannels.includes('telegram') ? telegramText : null,
      telegram_image_url: selectedChannels.includes('telegram') ? telegramImageUrl || null : null,
      telegram_link_url: selectedChannels.includes('telegram') ? telegramLinkUrl || null : null,
      instagram_image_url: selectedChannels.includes('instagram') ? instagramImageUrl || null : null,
      instagram_caption: selectedChannels.includes('instagram') ? instagramCaption || null : null,
      instagram_link_url: selectedChannels.includes('instagram') ? primaryIgButton?.url || null : null,
      instagram_link_title: selectedChannels.includes('instagram') ? primaryIgButton?.title || null : null,
      instagram_additional_links: selectedChannels.includes('instagram')
        ? instagramActionButtons.map((btn) => ({ url: btn.url, title: btn.title }))
        : [],
    };

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsConfirmModalOpen(false);
        router.push('/campaigns/' + data.data.id);
      } else {
        setFormError(data.error || 'Failed to create campaign');
      }
    } catch (err: any) {
      setFormError(err.message || 'Network exception');
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeTemplateObj = templates.find((t) => t.name === selectedWaTemplateId);
  const waVariables = activeTemplateObj ? extractWhatsAppVariables(activeTemplateObj.body) : [];

  return (
    // MODERN, SLIM, POLISHED FULL-WIDTH SAAS WORKSPACE
    <div className="w-full space-y-5 pb-20">
      {/* Top Header: Clean Breadcrumb & Actions */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-txt-muted mb-1">
            <span className="hover:text-txt-primary cursor-pointer" onClick={() => router.push('/overview')}>Campaigns</span>
            <ChevronRight className="w-3 h-3 text-txt-muted/60" />
            <span className="text-brand font-semibold">New Multi-Channel Broadcast</span>
          </div>
          <h1 className="text-xl font-bold text-txt-primary tracking-tight">Create Campaign</h1>
          <p className="text-xs text-txt-muted mt-0.5">
            Target verified contacts, author formatted channel copy, and test live pop-up previews.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleSubmitCampaign('draft')}
            isLoading={isSubmitting}
            className="text-xs h-8 px-3.5 border-border hover:bg-bg-accentSoft"
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            disabled={!name.trim()}
            onClick={() => setIsConfirmModalOpen(true)}
            className="text-xs h-8 px-4 bg-brand hover:bg-brand-hover text-white shadow-xs"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Review &amp; Launch
          </Button>
        </div>
      </div>

      {formError && (
        <div className="w-full p-3 bg-red-50/80 border border-red-200/90 rounded-lg text-xs text-status-failed flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CAMPAIGN BASICS & AUDIENCE TARGETING (LIGHTER VIBRANT EMERALD HEADER) */}
      {/* ========================================================================= */}
      <div className="w-full bg-white border-2 border-emerald-500/80 rounded-xl shadow-[0_4px_24px_-4px_rgba(16,185,129,0.18)] overflow-hidden">
        {/* LIGHTER VIBRANT EMERALD HEADER BAR */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#047857] via-[#059669] to-[#10B981] text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/25 backdrop-blur-xs flex items-center justify-center text-white border border-white/40 shadow-xs flex-shrink-0 font-bold text-xs">
              01
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>Campaign Basics &amp; Target Audience</span>
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25 text-white backdrop-blur-xs border border-white/30">
                  Global Configuration
                </span>
              </div>
              <p className="text-[11px] text-white/95 mt-0.5 font-medium">
                Define campaign identification, recipient filtering, and delivery timing.
              </p>
            </div>
          </div>

          {/* AUDIENCE REACH PILL */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-xs rounded-lg border border-white/30 text-xs text-white shadow-xs self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span className="text-white/90 font-medium">Audience Reach:</span>
            <strong className="font-mono font-bold text-white">{audienceSummary?.totalAudience || 6} Contacts</strong>
          </div>
        </div>

        {/* DEFINED BOXES WORKFLOW */}
        <div className="p-5 space-y-4">
          {/* BOX 1A: CAMPAIGN NAME & CATEGORY */}
          <div className="p-4 bg-bg-app border border-border rounded-xl space-y-3">
            <label className="text-xs font-bold text-txt-primary flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>1. Campaign Identification &amp; Category</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <span className="text-[11px] text-txt-muted block mb-1 font-medium">
                  Campaign Name <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Company Celebration Gala & Team Gathering"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white text-txt-primary border border-border rounded-lg h-9 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-all font-medium placeholder:text-txt-muted/50"
                />
              </div>

              <div>
                <span className="text-[11px] text-txt-muted block mb-1 font-medium">
                  Campaign Category
                </span>
                <select
                  value={campaignCategory}
                  onChange={(e) => setCampaignCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-txt-primary border border-border rounded-lg h-9 focus:outline-none focus:border-emerald-600 transition-all font-medium"
                >
                  <option value="Celebration">🎉 Celebration / Gathering</option>
                  <option value="Announcement">📢 Company Announcement</option>
                  <option value="Marketing">🚀 Product Launch / Promo</option>
                  <option value="Operations">⚙️ Internal Operations</option>
                </select>
              </div>
            </div>
          </div>

          {/* BOX 1B: TARGET AUDIENCE & DELIVERY SCHEDULE */}
          <div className="p-4 bg-bg-app border border-border rounded-xl space-y-3">
            <label className="text-xs font-bold text-txt-primary flex items-center gap-2 uppercase tracking-wider">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>2. Target Audience &amp; Delivery Timing</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Audience Segment */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-txt-muted block font-medium">
                  Recipient Audience Selection:
                </span>
                <div className="bg-white p-1 rounded-lg border border-border flex flex-wrap items-center gap-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setAudienceType('all')}
                    className={'flex-1 min-w-[105px] py-1.5 px-2.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ' +
                      (audienceType === 'all'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-txt-muted hover:text-txt-primary')}
                  >
                    <span>All Contacts</span>
                    <span className={'text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ' +
                      (audienceType === 'all' ? 'bg-white/25 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')}>
                      {audienceSummary?.totalAudience ?? '...'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudienceType('vip')}
                    className={'flex-1 min-w-[115px] py-1.5 px-2.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ' +
                      (audienceType === 'vip'
                        ? 'bg-amber-500 text-white font-bold shadow-xs'
                        : 'text-txt-muted hover:text-txt-primary')}
                  >
                    <span>🌟 VIP Only</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudienceType('regular')}
                    className={'flex-1 min-w-[115px] py-1.5 px-2.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ' +
                      (audienceType === 'regular'
                        ? 'bg-emerald-700 text-white font-bold shadow-xs'
                        : 'text-txt-muted hover:text-txt-primary')}
                  >
                    <span>🔥 Regulars</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudienceType('tag')}
                    className={'flex-1 min-w-[105px] py-1.5 px-2.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ' +
                      (audienceType === 'tag'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-txt-muted hover:text-txt-primary')}
                  >
                    <span>Filter Tags</span>
                    {selectedTags.length > 0 && (
                      <span className={'text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ' +
                        (audienceType === 'tag' ? 'bg-white/25 text-white' : 'bg-emerald-600 text-white')}>
                        {selectedTags.length}
                      </span>
                    )}
                  </button>
                </div>

                {audienceType === 'tag' && (
                  <div className="p-2.5 bg-white border border-border rounded-lg space-y-1.5 animate-in fade-in duration-150 shadow-2xs">
                    <span className="text-[10px] text-txt-muted block font-medium">Select contact tags to include:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {availableTags.length === 0 ? (
                        <span className="text-[10px] text-txt-muted">No custom tags in contacts.</span>
                      ) : (
                        availableTags.map((tag) => {
                          const active = selectedTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className={'px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all ' +
                                (active
                                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                                  : 'bg-white text-txt-primary border-border hover:border-border-strong')}
                            >
                              {tag}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Schedule Timing */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-txt-muted block font-medium">
                  Delivery Dispatch Schedule:
                </span>
                <div className="bg-white p-1 rounded-lg border border-border flex items-center gap-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setSendTiming('now')}
                    className={'flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ' +
                      (sendTiming === 'now'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-txt-muted hover:text-txt-primary')}
                  >
                    <span>🚀 Send Immediately</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendTiming('schedule')}
                    className={'flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ' +
                      (sendTiming === 'schedule'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-txt-muted hover:text-txt-primary')}
                  >
                    <span>⏰ Schedule for Later</span>
                  </button>
                </div>

                {sendTiming === 'schedule' && (
                  <div className="pt-1 animate-in fade-in duration-150">
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white text-txt-primary border border-border rounded-lg h-9 focus:outline-none focus:border-emerald-600 shadow-2xs font-medium"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BOX 1C: ACTIVE OUTREACH CHANNELS */}
          <div className="p-4 bg-bg-app border border-border rounded-xl space-y-3">
            <label className="text-xs font-bold text-txt-primary flex items-center gap-2 uppercase tracking-wider">
              <Radio className="w-4 h-4 text-emerald-600" />
              <span>3. Active Outreach Channels</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: 'whatsapp',
                  name: 'WhatsApp Direct',
                  badge: 'Meta Cloud API',
                  icon: WhatsAppLogo,
                  activeBg: 'border-2 border-[#25D366] bg-[#E8F8EE]/80 shadow-[0_4px_14px_-2px_rgba(37,211,102,0.25)]',
                },
                {
                  id: 'email',
                  name: 'Email Broadcast',
                  badge: 'Resend SMTP',
                  icon: GmailLogo,
                  activeBg: 'border-2 border-[#4285F4] bg-blue-50/70 shadow-[0_4px_14px_-2px_rgba(66,133,244,0.25)]',
                },
                {
                  id: 'telegram',
                  name: 'Telegram Broadcast',
                  badge: 'Bot API',
                  icon: TelegramLogo,
                  activeBg: 'border-2 border-[#0088CC] bg-sky-50/80 shadow-[0_4px_14px_-2px_rgba(0,136,204,0.25)]',
                },
                {
                  id: 'instagram',
                  name: 'Instagram Broadcast',
                  badge: 'Meta Graph API',
                  icon: InstagramLogo,
                  activeBg: 'border-2 border-[#E1306C] bg-pink-50/60 shadow-[0_4px_14px_-2px_rgba(225,48,108,0.25)]',
                },
              ].map(({ id, name, badge, icon: Icon, activeBg }) => {
                const checked = selectedChannels.includes(id as ChannelType);
                return (
                  <div
                    key={id}
                    onClick={() => toggleChannel(id as ChannelType)}
                    className={'p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ' +
                      (checked
                        ? activeBg + ' shadow-xs ring-1 ring-black/5'
                        : 'bg-white border-border text-txt-muted hover:border-border-strong opacity-75')}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-border/80 shadow-xs p-1">
                        <Icon className="w-full h-full" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-txt-primary leading-tight">{name}</h4>
                        <span className="text-[10px] text-txt-muted font-medium">{badge}</span>
                      </div>
                    </div>
                    <div
                      className={'w-4 h-4 rounded flex items-center justify-center transition-all ' +
                        (checked ? 'bg-brand text-white' : 'border border-border bg-white')}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. WHATSAPP CAMPAIGN STUDIO (GREEN HIGHLIGHTED HEADER + SEQUENTIAL LAYOUT) */}
      {/* ========================================================================= */}
      {selectedChannels.includes('whatsapp') && (
        <div className="w-full bg-white border-2 border-[#25D366] rounded-xl shadow-[0_4px_24px_-4px_rgba(37,211,102,0.22)] overflow-hidden">
          {/* GREEN HIGHLIGHTED WHATSAPP HEADER BAR */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366] text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0 p-1">
                <WhatsAppLogo className="w-full h-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                    <span>WhatsApp Campaign Studio</span>
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs border border-white/30">
                    Official Meta Cloud API
                  </span>
                </div>
                <p className="text-[11px] text-white/90 mt-0.5">
                  Compose sequential campaign image, message body copy, and interactive action CTA link buttons.
                </p>
              </div>
            </div>

            {/* PREVIEW BUTTON */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsWhatsAppPreviewOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#075E54] bg-white hover:bg-emerald-50 active:bg-emerald-100 rounded-lg shadow-sm border border-white/60 transition-all hover:shadow cursor-pointer select-none self-start sm:self-auto"
            >
              <Eye className="w-4 h-4 text-[#25D366]" />
              <span>Preview WhatsApp</span>
            </button>
          </div>

          {/* SEQUENTIAL WORKFLOW (TOP-TO-BOTTOM) */}
          <div className="p-5 space-y-5">
            {/* 2A. FIRST: HEADER BANNER IMAGE LINK & ACTIVE IMAGE PREVIEW */}
            <div className="p-4 bg-bg-app border border-border rounded-xl space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-txt-primary flex items-center gap-2 uppercase tracking-wider">
                    <ImageIcon className="w-4 h-4 text-[#25D366]" />
                    <span>1. Header Banner Image (Optional)</span>
                  </label>
                  <p className="text-[11px] text-txt-muted mt-0.5">
                    Attach an event poster or flyer at the top of your broadcast message. Supports direct JPEG or PNG links.
                  </p>
                </div>
                {waImageUrl && (
                  <button
                    type="button"
                    onClick={() => setWaImageUrl('')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-status-failed bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 rounded-lg transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Remove Image</span>
                  </button>
                )}
              </div>

              {/* Direct Image URL Input with integrated icon and quick actions */}
              <div className="relative flex items-center">
                <div className="absolute left-3 text-txt-muted pointer-events-none flex items-center">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  placeholder="Paste direct flyer or banner image URL (e.g. https://example.com/flyer.jpg)"
                  value={waImageUrl}
                  onChange={(e) => setWaImageUrl(e.target.value)}
                  className="w-full pl-9 pr-24 py-2 text-xs bg-white text-txt-primary border border-border rounded-lg h-10 focus:outline-none focus:border-brand font-medium placeholder:text-txt-muted/70 transition-colors shadow-2xs"
                />
                <div className="absolute right-1.5 flex items-center gap-1">
                  {waImageUrl && (
                    <button
                      type="button"
                      onClick={() => setWaImageUrl('')}
                      className="p-1 text-txt-muted hover:text-txt-primary hover:bg-bg-accentSoft rounded transition-colors"
                      title="Clear URL"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsWhatsAppPreviewOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-brand bg-brand-soft hover:bg-brand-soft/80 rounded border border-brand/20 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-brand" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>

              {/* ACTIVE BANNER IMAGE PREVIEW (RICH IN-PLACE FLYER DISPLAY) */}
              {waImageUrl ? (
                <div className="bg-white border border-border rounded-xl overflow-hidden shadow-xs">
                  {/* Top Preview Meta Bar */}
                  <div className="px-3.5 py-2.5 bg-bg-surface/80 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Banner Attached
                      </span>
                      <span className="text-[11px] text-txt-muted font-mono truncate max-w-xs sm:max-w-md">
                        {waImageUrl}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setIsWhatsAppPreviewOpen(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md text-[11px] font-semibold text-emerald-800 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-emerald-600" />
                        <span>Preview in Message</span>
                      </button>
                      <a
                        href={waImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-bg-accentSoft border border-border rounded-md text-[11px] font-semibold text-txt-primary transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-txt-muted" />
                        <span>Open Original</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setWaImageUrl('')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-status-failed bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* High Quality In-Place Image Display */}
                  <div className="w-full bg-slate-950/5 relative flex items-center justify-center p-3 sm:p-4 min-h-[180px] max-h-[340px] overflow-hidden">
                    <img
                      src={waImageUrl}
                      alt="Active Campaign Banner"
                      className="max-h-[300px] w-auto max-w-full rounded-lg object-contain shadow-sm border border-border/60"
                      onError={(e) => {
                        (e.target as any).style.display = 'none';
                        const parent = (e.target as any).parentElement;
                        if (parent) {
                          const fallback = parent.querySelector('.img-error-fallback');
                          if (fallback) fallback.style.display = 'flex';
                        }
                      }}
                    />
                    <div
                      className="img-error-fallback hidden flex-col items-center justify-center text-center p-6 text-txt-muted space-y-2"
                    >
                      <AlertTriangle className="w-8 h-8 text-amber-500" />
                      <p className="text-xs font-semibold text-txt-primary">Unable to load image preview from this URL</p>
                      <p className="text-[11px] max-w-sm">Please verify the link is a direct, public image URL ending with .jpg, .png, or from an image host like Unsplash or Imgur.</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Placeholder State */
                <div className="p-6 border-2 border-dashed border-border rounded-xl bg-white/60 text-center flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-bg-accentSoft flex items-center justify-center text-txt-muted mb-1">
                    <ImageIcon className="w-5 h-5 text-txt-muted" />
                  </div>
                  <p className="text-xs font-semibold text-txt-primary">No header banner image attached</p>
                  <p className="text-[11px] text-txt-muted max-w-md">
                    Optional: Paste an image URL above to display your party flyer, event poster, or announcement graphic at the very top of the WhatsApp message.
                  </p>
                </div>
              )}
            </div>

            {/* 2B. SECOND: MESSAGE BODY COPY (FORMATTING & VARIABLES) */}
            <div className="p-4 bg-bg-app border border-border rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <label className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#25D366]" />
                  <span>2. WhatsApp Message Body Copy *</span>
                </label>
                <div className="flex items-center gap-2">
                  {/* Mode Switcher */}
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => setWaMode('custom')}
                      className={'px-3 py-1 text-xs font-medium rounded-md transition-all ' +
                        (waMode === 'custom'
                          ? 'bg-brand text-white font-bold shadow-xs'
                          : 'text-txt-muted hover:text-txt-primary')}
                    >
                      Custom Styled Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaMode('template')}
                      className={'px-3 py-1 text-xs font-medium rounded-md transition-all ' +
                        (waMode === 'template'
                          ? 'bg-brand text-white font-bold shadow-xs'
                          : 'text-txt-muted hover:text-txt-primary')}
                    >
                      Meta Approved Template
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsWhatsAppPreviewOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>

              {waMode === 'custom' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-txt-muted">
                    <span>Write broadcast message text:</span>
                    <div className="flex items-center gap-2">
                      <span>Formatting:</span>
                      <code className="bg-white px-1.5 py-0.5 rounded border border-border">*bold*</code>
                      <code className="bg-white px-1.5 py-0.5 rounded border border-border">_italic_</code>
                      <code className="bg-white px-1.5 py-0.5 rounded border border-border">~strike~</code>
                    </div>
                  </div>

                  <textarea
                    rows={5}
                    required
                    value={waCustomText}
                    onChange={(e) => setWaCustomText(e.target.value)}
                    placeholder="Hello {{name}}! We are thrilled to invite you to our special event..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white text-txt-primary border border-border rounded-lg leading-relaxed focus:outline-none focus:border-brand font-sans"
                  />

                  {/* Personalization Variable Tag Inserters */}
                  <div className="flex items-center flex-wrap gap-2 text-xs text-txt-muted pt-0.5">
                    <span className="text-[11px] font-semibold text-txt-primary mr-1">Insert personalization:</span>
                    {['{{name}}', '{{first_name}}', '{{phone}}', '{{link}}'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setWaCustomText((prev) => prev + ' ' + tag)}
                        className="px-2.5 py-1 bg-white hover:bg-bg-accentSoft border border-border rounded-md text-xs text-brand font-mono font-semibold transition-all shadow-xs"
                      >
                        + {tag}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setAiTargetChannel('whatsapp');
                        setIsAiModalOpen(true);
                      }}
                      className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-[#F55036] hover:opacity-90 text-white text-xs font-bold rounded-md shadow-2xs transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>✨ AI Copywriter (Auto-Fallback)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-txt-primary uppercase tracking-wider mb-1">
                      Select Approved Template
                    </label>
                    <select
                      value={selectedWaTemplateId}
                      onChange={(e) => handleSelectTemplate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white text-txt-primary border border-border rounded-lg h-9"
                    >
                      {templates.map((tpl) => (
                        <option key={tpl.id} value={tpl.name}>
                          {tpl.name} ({tpl.category} - {tpl.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeTemplateObj && (
                    <div className="p-3 bg-white border border-border rounded-lg text-xs text-txt-primary font-mono leading-relaxed">
                      {activeTemplateObj.body}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2C. THIRD: ACTION CTA BUTTONS & MULTI-LINK OPTIONS */}
            <div className="p-4 bg-bg-app border border-border rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-txt-primary flex items-center gap-2 uppercase tracking-wider">
                    <LinkIcon className="w-4 h-4 text-[#25D366]" />
                    <span>3. Action CTA Buttons &amp; Destination Links</span>
                  </label>
                  <p className="text-[11px] text-txt-muted mt-0.5">
                    WhatsApp interactive buttons appear under the message bubble. Add multiple links for RSVP, location, or website.
                  </p>
                </div>

                {/* ADD MORE LINK OPTION BUTTON */}
                {waActionButtons.length < 3 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addWaActionButton}
                    className="text-xs h-8 px-3 border-[#25D366]/50 text-[#1E6B4F] hover:bg-[#E8F8EE] flex items-center gap-1 font-semibold shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Link</span>
                  </Button>
                )}
              </div>

              {/* Dynamic Action Buttons List */}
              <div className="space-y-2.5">
                {waActionButtons.map((btn, index) => (
                  <div
                    key={btn.id}
                    className="p-3 bg-white border border-border rounded-lg space-y-2 shadow-xs relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-brand-soft text-brand text-[10px] flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <span>CTA Button #{index + 1}</span>
                      </span>

                      {waActionButtons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWaActionButton(btn.id)}
                          className="text-status-failed hover:text-red-700 p-1 text-[11px] flex items-center gap-1 font-medium transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Link</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] text-txt-muted block mb-1 font-medium">CTA Button Label:</span>
                        <input
                          type="text"
                          placeholder="e.g. RSVP & Event Details"
                          value={btn.title}
                          onChange={(e) => updateWaActionButton(btn.id, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-bg-input text-txt-primary border border-border rounded-md h-8.5 focus:outline-none focus:border-brand font-medium"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] text-txt-muted block mb-1 font-medium">Destination Link URL:</span>
                        <input
                          type="text"
                          placeholder="https://campaignhub.example.com/party-rsvp"
                          value={btn.url}
                          onChange={(e) => updateWaActionButton(btn.id, 'url', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-bg-input text-txt-primary border border-border rounded-md h-8.5 focus:outline-none focus:border-brand font-medium"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EMAIL CAMPAIGN STUDIO (ORGANIZED SEQUENTIAL SAAS WORKFLOW) */}
      {/* ========================================================================= */}
      {selectedChannels.includes('email') && (
        <div className="w-full bg-white border-2 border-[#4285F4] rounded-xl shadow-[0_4px_24px_-4px_rgba(66,133,244,0.22)] overflow-hidden">
          {/* GMAIL BRAND MULTI-COLOR GRADIENT HEADER BAR (BLUE, RED, YELLOW, GREEN) */}
          <div
            style={{ background: 'linear-gradient(90deg, #1A73E8 0%, #4285F4 22%, #EA4335 48%, #FBBC04 74%, #34A853 100%)' }}
            className="px-5 py-3.5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0 p-1.5">
                <GmailLogo className="w-full h-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 drop-shadow-xs">
                    <span>Email Campaign Studio</span>
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/25 text-white backdrop-blur-xs border border-white/30">
                    Resend Delivery
                  </span>
                </div>
                <p className="text-[11px] text-white/95 mt-0.5 font-medium drop-shadow-2xs">
                  Compose sequential email templates, dynamic subject lines, and personalized visual content.
                </p>
              </div>
            </div>

            {/* HIGH-CONTRAST PREVIEW BUTTON */}
            <button
              type="button"
              onClick={() => setIsEmailPreviewOpen(true)}
              className="text-xs h-8 px-3.5 bg-white text-[#1A73E8] hover:bg-white/95 border-0 shadow-md font-bold flex items-center gap-1.5 self-start sm:self-auto transition-all active:scale-95 rounded-lg flex-shrink-0"
            >
              <Eye className="w-3.5 h-3.5 text-[#1A73E8]" />
              <span>Preview Email</span>
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* BOX 3A: 1. ONE-CLICK EMAIL TEMPLATE LIBRARY */}
            <div className="p-4 bg-bg-app border border-border rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-txt-primary flex items-center gap-2 uppercase tracking-wider">
                  <LayoutTemplate className="w-4 h-4 text-[#4285F4]" />
                  <span>1. Choose Email Design Template</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-txt-muted font-medium hidden sm:inline">Click any template or</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAiTargetChannel('email');
                      setIsAiModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-violet-600 to-[#F55036] hover:opacity-90 text-white text-xs font-bold rounded-md shadow-2xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>✨ Generate Email with AI</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DUMMY_EMAIL_TEMPLATES.map((tpl) => {
                  const isSelected = selectedEmailTemplateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => loadDummyEmailTemplate(tpl.id)}
                      className={'p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none ' +
                        (isSelected
                          ? 'bg-blue-50/70 border-2 border-[#4285F4] shadow-xs ring-1 ring-[#4285F4]/30'
                          : 'bg-white border-border hover:border-[#4285F4]/50 opacity-80 hover:opacity-100')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-txt-primary leading-tight">{tpl.name}</span>
                        <div
                          className={'w-4 h-4 rounded-full flex items-center justify-center transition-all flex-shrink-0 ' +
                            (isSelected ? 'bg-[#4285F4] text-white' : 'border border-border bg-white')}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-txt-muted truncate mt-1.5 font-medium">{tpl.subject}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BOX 3B: 2. EMAIL SUBJECT LINE & DESTINATION LINK */}
            <div className="p-4 bg-bg-app border border-border rounded-xl space-y-3">
              <label className="text-xs font-bold text-txt-primary flex items-center gap-2 uppercase tracking-wider">
                <Mail className="w-4 h-4 text-[#EA4335]" />
                <span>2. Subject Line &amp; Destination Link</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <span className="text-[11px] text-txt-muted block mb-1 font-medium">
                    Email Subject Line <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g. Exclusive Invitation for {{name}}: Special Company Party!"
                    className="w-full px-3.5 py-2 text-xs bg-white text-txt-primary border border-border rounded-lg h-9 focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]/30 font-medium"
                  />
                  {/* Subject Variable Chips */}
                  <div className="flex items-center gap-1.5 pt-1.5 text-xs text-txt-muted">
                    <span className="text-[10.5px] font-semibold text-txt-primary">Insert personalization:</span>
                    {['{{name}}', '{{first_name}}'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setEmailSubject((prev) => prev + ' ' + tag)}
                        className="px-2 py-0.5 bg-white hover:bg-blue-50 border border-border rounded-md text-[10px] text-[#1A73E8] font-mono font-semibold transition-all shadow-xs"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-txt-muted block mb-1 font-medium">
                    Party / Destination Link URL
                  </span>
                  <input
                    type="text"
                    placeholder="https://campaignhub.example.com/party-rsvp"
                    value={emailLinkUrl}
                    onChange={(e) => setEmailLinkUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white text-txt-primary border border-border rounded-lg h-9 focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]/30 font-medium"
                  />
                  <span className="text-[10px] text-txt-muted block mt-1.5 font-medium">
                    Automatically mapped to <code className="bg-white px-1 py-0.5 rounded border border-border font-mono text-[10px]">{"{{link}}"}</code> in email RSVP buttons and hyperlinks.
                  </span>
                </div>
              </div>
            </div>

            {/* BOX 3C: 3. EMAIL CONTENT & LIVE VISUAL EDITOR */}
            <div className="p-4 bg-bg-app border border-border rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <label className="text-xs font-bold text-txt-primary flex items-center gap-2 uppercase tracking-wider">
                  <FileCode className="w-4 h-4 text-[#34A853]" />
                  <span>3. Email Body &amp; Visual Content Editor *</span>
                </label>

                {/* VIEW MODE TOGGLE CAPSULE */}
                <div className="flex items-center bg-white p-0.5 rounded-lg border border-border shadow-xs">
                  <button
                    type="button"
                    onClick={() => setEmailViewMode('preview')}
                    className={'px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ' +
                      (emailViewMode === 'preview'
                        ? 'bg-[#4285F4] text-white font-bold shadow-xs'
                        : 'text-txt-muted hover:text-txt-primary')}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visual Render</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailViewMode('code')}
                    className={'px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ' +
                      (emailViewMode === 'code'
                        ? 'bg-[#4285F4] text-white font-bold shadow-xs'
                        : 'text-txt-muted hover:text-txt-primary')}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>HTML Source</span>
                  </button>
                </div>
              </div>

              {/* Variable Chips Inserter Toolbar */}
              <div className="flex items-center flex-wrap gap-1.5 pt-0.5 text-xs text-txt-muted">
                <span className="text-[11px] font-semibold text-txt-primary mr-1">Insert personalization:</span>
                {['{{name}}', '{{first_name}}', '{{link}}', '{{email}}'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setEmailHtml((prev) => prev + ' ' + tag)}
                    className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-border rounded-md text-[10.5px] text-[#1A73E8] font-mono font-semibold transition-all shadow-xs"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              {/* Content Canvas */}
              {emailViewMode === 'preview' ? (
                <div className="bg-white border border-border rounded-xl p-5 shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-4 text-xs text-txt-muted">
                    <span className="font-semibold text-txt-primary flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#34A853]" />
                      Live Recipient Visual Render ({previewName})
                    </span>
                    <button
                      type="button"
                      onClick={() => setEmailViewMode('code')}
                      className="text-[11px] text-[#1A73E8] hover:text-[#174EA6] hover:underline font-semibold flex items-center gap-1"
                    >
                      <FileCode className="w-3 h-3" /> Edit in HTML Source
                    </button>
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-txt-primary leading-relaxed text-xs"
                    dangerouslySetInnerHTML={{
                      __html: interpolateEmail(
                        emailHtml,
                        { name: previewName, link: emailLinkUrl },
                        { link: emailLinkUrl }
                      ),
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-[11px] text-txt-muted block">Direct HTML / CSS Markup:</span>
                  <textarea
                    rows={9}
                    required
                    value={emailHtml}
                    onChange={(e) => setEmailHtml(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-white text-txt-primary border border-border rounded-lg leading-relaxed focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]/30"
                  />
                </div>
              )}

              {/* Delivery Guarantee Notice */}
              <div className="p-3 bg-blue-50/80 border border-blue-200/90 rounded-lg text-xs flex items-center gap-2.5 text-blue-900 shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#4285F4] flex-shrink-0" />
                <span className="text-[11px] text-blue-900 leading-relaxed font-medium">
                  When dispatched, each recipient automatically sees their real name (e.g.{' '}
                  <strong className="text-[#1A73E8]">&quot;Hi {previewName}, this is the stuff...&quot;</strong>) and personalized RSVP link. Click{' '}
                  <strong className="text-[#1A73E8] underline cursor-pointer hover:text-[#174EA6]" onClick={() => setIsEmailPreviewOpen(true)}>Preview Email</strong> above to inspect in the centered pop-up modal!
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TELEGRAM BROADCAST STUDIO (SKY HIGHLIGHTED HEADER) */}
      {/* ========================================================================= */}
      {selectedChannels.includes('telegram') && (
        <div className="w-full bg-white border-2 border-[#0088CC] rounded-xl shadow-[0_4px_24px_-4px_rgba(0,136,204,0.22)] overflow-hidden">
          {/* SKY HIGHLIGHTED TELEGRAM HEADER BAR */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-[#006A9C] via-[#0088CC] to-[#38A8E0] text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0 p-1">
                <TelegramLogo className="w-full h-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                    <span>Telegram Broadcast Studio</span>
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs border border-white/30">
                    Bot API
                  </span>
                </div>
                <p className="text-[11px] text-white/90 mt-0.5">
                  Post formatted announcement text, banner photo, and action button.
                </p>
              </div>
            </div>

            {/* PREVIEW BUTTON */}
            <Button
              type="button"
              onClick={() => setIsTelegramPreviewOpen(true)}
              className="text-xs h-8 px-3.5 bg-white text-[#0088CC] hover:bg-white/90 border-0 shadow-md font-bold flex items-center gap-1.5 self-start sm:self-auto transition-transform active:scale-95"
            >
              <Eye className="w-3.5 h-3.5 text-[#0088cc]" />
              <span>Preview Telegram</span>
            </Button>
          </div>

          <div className="p-5 space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-txt-muted mb-1 uppercase tracking-wider">
                  Target Channel / Group Handle *
                </label>
                <input
                  type="text"
                  required
                  value={telegramChannel}
                  onChange={(e) => setTelegramChannel(e.target.value)}
                  placeholder="@campaignhub_internal"
                  className="w-full px-3 py-1.5 text-xs bg-bg-input text-txt-primary border border-border rounded-lg h-9 focus:outline-none focus:border-brand font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-txt-muted mb-1 uppercase tracking-wider">
                  Optional Banner Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.example.com/promo.jpg"
                  value={telegramImageUrl}
                  onChange={(e) => setTelegramImageUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-bg-input text-txt-primary border border-border rounded-lg h-9 focus:outline-none focus:border-brand font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-txt-muted uppercase tracking-wider">
                  Telegram Post Copy (HTML supported) *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAiTargetChannel('telegram');
                    setIsAiModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gradient-to-r from-violet-600 to-[#F55036] hover:opacity-90 text-white text-[11px] font-bold rounded-md shadow-2xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  <span>✨ Generate with AI</span>
                </button>
              </div>
              <textarea
                rows={4}
                required
                value={telegramText}
                onChange={(e) => setTelegramText(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-bg-input text-txt-primary border border-border rounded-lg leading-relaxed focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-txt-muted mb-1 uppercase tracking-wider">
                Action Button Destination URL (Optional)
              </label>
              <input
                type="text"
                placeholder="https://campaignhub.example.com/party-rsvp"
                value={telegramLinkUrl}
                onChange={(e) => setTelegramLinkUrl(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-bg-input text-txt-primary border border-border rounded-lg h-9 focus:outline-none focus:border-brand font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INSTAGRAM BROADCAST STUDIO (SUNSET GRADIENT HEADER & MULTI-LINK CTA) */}
      {/* ========================================================================= */}
      {selectedChannels.includes('instagram') && (
        <div className="w-full bg-white border-2 border-[#E1306C] rounded-xl shadow-[0_4px_24px_-4px_rgba(225,48,108,0.22)] overflow-hidden">
          {/* INSTAGRAM SUNSET GRADIENT HEADER BAR */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0 p-1">
                <InstagramLogo className="w-full h-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                    <span>Instagram Broadcast Studio</span>
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs border border-white/30">
                    Meta Graph API
                  </span>
                  <span className="hidden md:inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/20 text-white backdrop-blur-xs">
                    Multi-Page Sync
                  </span>
                </div>
                <p className="text-[11px] text-white/90 mt-0.5">
                  Publish to your primary broadcast channel with multi-link CTA buttons; auto-syncs to all 10-30+ pages configured in Settings.
                </p>
              </div>
            </div>

            {/* PREVIEW BUTTON */}
            <button
              type="button"
              onClick={() => setIsInstagramPreviewOpen(true)}
              className="text-xs h-8 px-3.5 bg-white text-[#C13584] hover:bg-white/95 border-0 shadow-md font-bold flex items-center gap-1.5 self-start sm:self-auto transition-all active:scale-95 rounded-lg flex-shrink-0"
            >
              <Eye className="w-3.5 h-3.5 text-[#E1306C]" />
              <span>Preview Instagram</span>
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* BOX 5A: 1. BANNER IMAGE ASSET & LINK */}
            <div className="p-4 bg-bg-app border border-border rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-txt-primary flex items-center gap-2 uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4 text-[#E1306C]" />
                  <span>1. Broadcast Banner Image (Meta Graph API)</span>
                </label>
                {instagramImageUrl && (
                  <button
                    type="button"
                    onClick={() => setInstagramImageUrl('')}
                    className="text-[11px] text-txt-muted hover:text-red-500 font-medium transition-colors"
                  >
                    Clear Image
                  </button>
                )}
              </div>

              {/* 1-Click Image Presets */}
              <div className="flex items-center flex-wrap gap-2 text-xs">
                <span className="text-[11px] font-medium text-txt-muted">Quick Presets:</span>
                {[
                  {
                    name: '🎉 Party & Celebration',
                    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
                  },
                  {
                    name: '📢 Special Announcement',
                    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
                  },
                  {
                    name: '🚀 Product Launch & Promo',
                    url: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&auto=format&fit=crop&q=80',
                  },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setInstagramImageUrl(preset.url)}
                    className="px-2.5 py-1 bg-white hover:bg-bg-accentSoft border border-border rounded-lg text-[11px] font-medium text-txt-primary transition-all shadow-2xs hover:border-[#E1306C]/40"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              {/* Image URL Input */}
              <input
                type="text"
                placeholder="https://example.com/instagram-banner.jpg"
                value={instagramImageUrl}
                onChange={(e) => setInstagramImageUrl(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white text-txt-primary border border-border rounded-lg h-9 focus:outline-none focus:border-[#E1306C] focus:ring-1 focus:ring-[#E1306C]/30 font-medium"
              />

              {/* Banner Thumbnail Preview */}
              {instagramImageUrl && (
                <div className="flex items-center gap-3 p-2.5 bg-white border border-border rounded-lg">
                  <div className="w-14 h-14 rounded-lg bg-bg-app border border-border overflow-hidden flex-shrink-0 shadow-xs">
                    <img
                      src={instagramImageUrl}
                      alt="Instagram Banner Thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-txt-primary block">Active Banner Preview</span>
                    <a
                      href={instagramImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#C13584] hover:underline flex items-center gap-1 font-medium truncate mt-0.5"
                    >
                      <span>{instagramImageUrl}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* BOX 5B: 2. BROADCAST MESSAGE TEXT */}
            <div className="p-4 bg-bg-app border border-border rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-txt-primary flex items-center gap-2 uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-[#E1306C]" />
                  <span>2. Broadcast Caption &amp; Message Body *</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-txt-muted">
                    {instagramCaption.length} characters
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAiTargetChannel('instagram');
                      setIsAiModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gradient-to-r from-violet-600 to-[#F55036] hover:opacity-90 text-white text-[11px] font-bold rounded-md shadow-2xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    <span>✨ Generate with AI</span>
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                rows={5}
                required
                value={instagramCaption}
                onChange={(e) => setInstagramCaption(e.target.value)}
                placeholder="Write your broadcast channel announcement here..."
                className="w-full px-3.5 py-2.5 text-xs bg-white text-txt-primary border border-border rounded-lg leading-relaxed focus:outline-none focus:border-[#E1306C] focus:ring-1 focus:ring-[#E1306C]/30 font-medium"
              />

              {/* Agentic Multi-Page Notice */}
              <div className="p-3 bg-gradient-to-r from-[#833AB4]/5 via-[#FD1D1D]/5 to-[#F77737]/5 border border-[#E1306C]/30 rounded-lg text-xs flex items-center gap-2.5 text-txt-primary shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#E1306C] flex-shrink-0" />
                <span className="text-[11px] text-txt-muted leading-relaxed">
                  <strong className="text-txt-primary">Agentic Multi-Page Distribution:</strong> When launched, this broadcast will automatically be published to <strong className="text-[#C13584]">{instagramChannelName}</strong> and dynamically replicated to all 10, 20, 30+ Instagram accounts configured in Settings via Meta Graph API.
                </span>
              </div>
            </div>

            {/* BOX 5C: 3. ACTION CTA LINKS & MULTI-LINK OPTION */}
            <div className="p-4 bg-bg-app border border-border rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-txt-primary flex items-center gap-2 uppercase tracking-wider">
                    <LinkIcon className="w-4 h-4 text-[#E1306C]" />
                    <span>3. Action CTA Links (Multi-Link Supported)</span>
                  </label>
                  <p className="text-[11px] text-txt-muted mt-0.5">
                    Add interactive destination links for your party, tickets, RSVP, or website.
                  </p>
                </div>

                {/* Add Another Link Button */}
                {instagramActionButtons.length < 3 && (
                  <button
                    type="button"
                    onClick={addInstagramActionButton}
                    className="px-3 py-1.5 bg-white text-[#C13584] hover:bg-[#FDF2F8] border border-[#E1306C]/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#E1306C]" />
                    <span>Add Another Link ({instagramActionButtons.length}/3)</span>
                  </button>
                )}
              </div>

              {/* List of Action Links */}
              <div className="space-y-3">
                {instagramActionButtons.map((btn, index) => (
                  <div
                    key={btn.id}
                    className="p-3.5 bg-white border border-border rounded-xl space-y-3 shadow-2xs relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-txt-primary flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-gradient-to-r from-[#833AB4] to-[#FD1D1D] text-white flex items-center justify-center text-[10px]">
                          {index + 1}
                        </span>
                        <span>{index === 0 ? 'Primary Action Link' : `Secondary Link #${index + 1}`}</span>
                      </span>

                      {instagramActionButtons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInstagramActionButton(btn.id)}
                          className="text-txt-muted hover:text-red-500 p-1 rounded-md transition-colors"
                          title="Remove this link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] text-txt-muted block mb-1 font-medium">Button Label / CTA Title</span>
                        <input
                          type="text"
                          value={btn.title}
                          onChange={(e) => updateInstagramActionButton(btn.id, 'title', e.target.value)}
                          placeholder="e.g. RSVP & Join Celebration"
                          className="w-full px-3 py-1.5 text-xs bg-bg-app text-txt-primary border border-border rounded-lg h-9 focus:outline-none focus:border-[#E1306C] focus:ring-1 focus:ring-[#E1306C]/30 font-medium"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-txt-muted block mb-1 font-medium">Destination URL</span>
                        <input
                          type="text"
                          value={btn.url}
                          onChange={(e) => updateInstagramActionButton(btn.id, 'url', e.target.value)}
                          placeholder="https://campaignhub.example.com/party-rsvp"
                          className="w-full px-3 py-1.5 text-xs bg-bg-app text-txt-primary border border-border rounded-lg h-9 focus:outline-none focus:border-[#E1306C] focus:ring-1 focus:ring-[#E1306C]/30 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="w-full flex items-center justify-between pt-4 border-t border-border/80">
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleSubmitCampaign('draft')}
          isLoading={isSubmitting}
          className="text-xs h-8 px-4"
        >
          Save Draft
        </Button>
        <Button
          type="button"
          disabled={!name.trim()}
          onClick={() => setIsConfirmModalOpen(true)}
          className="text-xs h-8 px-5 bg-brand hover:bg-brand-hover text-white shadow-xs"
        >
          <Send className="w-3.5 h-3.5 mr-1.5" />
          Review &amp; Launch Campaign
        </Button>
      </div>

      {/* ========================================================================= */}
      {/* 1. CENTERED POP-UP MODAL: ENLARGED AUTHENTIC WHATSAPP MESSAGE SCREEN */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isWhatsAppPreviewOpen}
        onClose={() => setIsWhatsAppPreviewOpen(false)}
        title="WhatsApp Message Preview"
        description="Simulated preview for recipient Harsh Parmar (+91 98765 43210)"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          {/* REALISTIC ENLARGED SMARTPHONE CONTAINER */}
          <div className="w-full max-w-[460px] mx-auto rounded-[32px] border-[5px] border-[#1F2937] shadow-2xl overflow-hidden bg-[#ECE5DD] flex flex-col min-h-[580px]">
            {/* Phone Top Notch & Status Bar */}
            <div className="bg-[#008069] text-white px-5 pt-2.5 pb-1 flex items-center justify-between text-[11px] font-semibold select-none border-b border-black/10">
              <span>9:41</span>
              {/* Speaker / Dynamic Island */}
              <div className="w-20 h-3 bg-[#111827] rounded-full mx-auto -mt-0.5 opacity-90" />
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">5G</span>
                <div className="w-5 h-2.5 border border-white rounded-xs p-0.5 flex items-center">
                  <div className="w-full h-full bg-white rounded-xs" />
                </div>
              </div>
            </div>

            {/* WhatsApp App Header Bar */}
            <div className="bg-[#008069] text-white px-3.5 py-2.5 flex items-center justify-between shadow-sm select-none">
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5 text-white/90 hover:text-white cursor-pointer mr-0.5" />
                {/* Official Business Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs p-1">
                    <WhatsAppLogo className="w-full h-full" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#25D366] text-white flex items-center justify-center border-2 border-[#008069]">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>
                {/* Contact Title & Subtitle */}
                <div className="leading-tight">
                  <div className="flex items-center gap-1 font-bold text-sm">
                    <span className="truncate max-w-[170px] sm:max-w-[210px]">CampaignHub</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366] text-white flex-shrink-0" />
                  </div>
                  <span className="text-[10.5px] text-white/85 block">Official Business Account • online</span>
                </div>
              </div>

              {/* Call & Menu Action Icons */}
              <div className="flex items-center gap-3.5 text-white/90">
                <Video className="w-4.5 h-4.5 hover:text-white cursor-pointer" />
                <Phone className="w-4 h-4 hover:text-white cursor-pointer" />
                <MoreVertical className="w-4 h-4 hover:text-white cursor-pointer" />
              </div>
            </div>

            {/* WhatsApp Chat Canvas with Authentic Doodle Texture */}
            <div
              className="flex-1 p-3.5 overflow-y-auto space-y-3 flex flex-col justify-between"
              style={{
                backgroundColor: '#ECE5DD',
                backgroundImage:
                  'radial-gradient(#d5cdc2 0.75px, transparent 0.75px), radial-gradient(#d5cdc2 0.75px, #ECE5DD 0.75px)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px',
              }}
            >
              <div className="space-y-2.5">
                {/* WhatsApp Encryption Notice */}
                <div className="mx-auto max-w-[92%] bg-[#FFEECD] text-[#54656F] text-[10.5px] leading-tight px-3 py-1.5 rounded-lg text-center shadow-2xs border border-[#F3E2B8] flex items-center gap-1.5 justify-center">
                  <Lock className="w-3 h-3 text-[#54656F] flex-shrink-0" />
                  <span>Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.</span>
                </div>

                {/* Date Badge */}
                <div className="flex justify-center">
                  <span className="bg-white/90 backdrop-blur-xs text-[#54656F] text-[10px] font-semibold px-2.5 py-0.5 rounded-md shadow-2xs uppercase tracking-wider">
                    Today
                  </span>
                </div>

                {/* Incoming WhatsApp Message Bubble */}
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-xs shadow-[0_1px_1.5px_rgba(11,20,26,0.18)] max-w-[95%] sm:max-w-[90%] border border-[#E9EDEF] overflow-hidden">
                    {/* Header Banner Image (if provided) */}
                    {waImageUrl && (
                      <div className="w-full max-h-56 bg-slate-100 overflow-hidden relative group flex items-center justify-center">
                        <img
                          src={waImageUrl}
                          alt="Campaign Banner"
                          className="w-full max-h-56 object-cover block"
                          onError={(e) => {
                            const parent = (e.target as any).parentElement;
                            if (parent) parent.style.display = 'none';
                          }}
                        />
                        <a
                          href={waImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/65 hover:bg-black/85 text-white rounded-md text-[10px] font-medium flex items-center gap-1 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Full Image</span>
                        </a>
                      </div>
                    )}

                    {/* Message Body Copy */}
                    <div className="p-3.5 space-y-2">
                      <div
                        className="text-[13px] text-[#111B21] leading-relaxed select-text font-normal whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html:
                            waMode === 'custom'
                              ? formatWhatsAppText(waCustomText, previewName, waActionButtons[0]?.url || '')
                              : activeTemplateObj
                              ? formatWhatsAppText(
                                  interpolateWhatsApp(activeTemplateObj.body, waVariableMap, {
                                    name: previewName,
                                    phone: '+91 98765 43210',
                                  }),
                                  previewName,
                                  waActionButtons[0]?.url || ''
                                )
                              : 'No message written.',
                        }}
                      />

                      {/* Timestamp & Double Checkmarks */}
                      <div className="text-[10px] text-[#667781] text-right flex items-center justify-end gap-1 pt-1">
                        <span>11:42 AM</span>
                        <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB] stroke-[2.5]" />
                      </div>
                    </div>

                    {/* Interactive Stacked WhatsApp CTA Action Buttons */}
                    {waActionButtons.map((btn, idx) =>
                      btn.url ? (
                        <div key={btn.id} className="border-t border-[#E9EDEF]">
                          <a
                            href={btn.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-4 text-[#00A884] hover:bg-[#F5F6F6] active:bg-[#E9EDEF] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer group text-center"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#00A884] group-hover:scale-110 transition-transform flex-shrink-0" />
                            <span className="truncate">{btn.title || `Action Link ${idx + 1}`}</span>
                          </a>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom WhatsApp Input Bar */}
              <div className="bg-[#F0F2F5] px-3 py-2 border-t border-[#E9EDEF] rounded-b-[26px] flex items-center gap-2 select-none -mx-3.5 -mb-3.5 mt-2">
                <Smile className="w-5 h-5 text-[#54656F] cursor-pointer hover:text-[#111B21]" />
                <div className="flex-1 bg-white rounded-full px-3.5 py-1.5 flex items-center justify-between shadow-2xs border border-[#E9EDEF]">
                  <span className="text-xs text-[#8696A0]">Message</span>
                  <div className="flex items-center gap-2 text-[#54656F]">
                    <Paperclip className="w-4 h-4 cursor-pointer hover:text-[#111B21]" />
                    <Camera className="w-4 h-4 cursor-pointer hover:text-[#111B21]" />
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#008069] text-white flex items-center justify-center shadow-xs cursor-pointer hover:bg-[#00705c] transition-colors flex-shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              variant="secondary"
              onClick={() => setIsWhatsAppPreviewOpen(false)}
              className="text-xs h-8 px-4 font-semibold"
            >
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. CENTERED POP-UP MODAL: EMAIL MESSAGE PREVIEW */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEmailPreviewOpen}
        onClose={() => setIsEmailPreviewOpen(false)}
        title="Email Message Preview"
        description="Simulated preview for recipient Harsh Parmar (harsh@company.com)"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div className="bg-white border border-border rounded-element shadow-sm overflow-hidden text-xs">
            {/* Email Header Fields */}
            <div className="p-3 border-b border-border bg-bg-surface/60 space-y-1.5 text-txt-muted text-xs">
              <div className="flex items-center gap-1.5">
                <GmailLogo className="w-4 h-4 flex-shrink-0" />
                <span><strong className="text-txt-primary">From:</strong> Harsh Parmar &lt;onboarding@resend.dev&gt;</span>
              </div>
              <div>
                <strong className="text-txt-primary">To:</strong> {previewName} &lt;harsh.parmar@example.com&gt;
              </div>
              <div>
                <strong className="text-txt-primary">Subject:</strong>{' '}
                <span className="text-txt-primary font-bold">
                  {interpolateEmail(emailSubject, { name: previewName })}
                </span>
              </div>
            </div>

            {/* Rendered Personalized Email Body */}
            <div className="p-4 space-y-3">
              <div
                className="prose prose-sm max-w-none text-txt-primary leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: interpolateEmail(
                    emailHtml,
                    { name: previewName, link: emailLinkUrl },
                    { link: emailLinkUrl }
                  ),
                }}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setIsEmailPreviewOpen(false)} className="text-xs h-7.5 px-3">
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 3. CENTERED POP-UP MODAL: TELEGRAM POST PREVIEW */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isTelegramPreviewOpen}
        onClose={() => setIsTelegramPreviewOpen(false)}
        title="Telegram Broadcast Preview"
        description={`Simulated preview for ${telegramChannel}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="bg-[#EEF2E8] p-3.5 rounded-card border border-border min-h-[320px] flex flex-col justify-end">
            <div className="bg-white border border-border rounded-element shadow-sm max-w-[95%] overflow-hidden text-xs text-txt-primary space-y-2">
              {/* Banner image if provided */}
              {telegramImageUrl && (
                <div className="w-full h-32 bg-bg-input overflow-hidden border-b border-border">
                  <img
                    src={telegramImageUrl}
                    alt="Telegram Banner"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="p-3 space-y-2">
                <div className="text-xs font-bold text-[#0088cc] flex items-center gap-1.5">
                  <TelegramLogo className="w-4 h-4 flex-shrink-0" />
                  <span>{telegramChannel}</span>
                </div>

                <div
                  className="whitespace-pre-wrap leading-relaxed text-xs"
                  dangerouslySetInnerHTML={{
                    __html: telegramText.replace(/{{link}}/g, telegramLinkUrl || ''),
                  }}
                />

                {telegramLinkUrl && (
                  <div className="pt-2 border-t border-border">
                    <a
                      href={telegramLinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-3 bg-[#EEF5FA] hover:bg-[#dbeaf5] text-[#0088cc] text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>RSVP &amp; View Details</span>
                    </a>
                  </div>
                )}

                <div className="text-[10px] text-txt-muted text-right flex items-center justify-end gap-1">
                  <span>👁 1.4k</span>
                  <span>11:32 AM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setIsTelegramPreviewOpen(false)} className="text-xs h-7.5 px-3">
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 4. CENTERED POP-UP MODAL: INSTAGRAM BROADCAST CHANNEL PREVIEW */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isInstagramPreviewOpen}
        onClose={() => setIsInstagramPreviewOpen(false)}
        title="Instagram Broadcast Channel Preview"
        description={`Simulated mobile broadcast channel for ${instagramChannelName} (24.8K members)`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="w-full max-w-[420px] mx-auto rounded-[28px] border-[4px] border-[#1F2937] shadow-2xl overflow-hidden bg-slate-50 flex flex-col min-h-[520px]">
            {/* Phone Top Status Bar */}
            <div className="bg-white text-black px-5 pt-2.5 pb-1 flex items-center justify-between text-[11px] font-semibold select-none border-b border-border/40">
              <span>9:41</span>
              <div className="w-20 h-3 bg-[#111827] rounded-full mx-auto -mt-0.5 opacity-90" />
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">5G</span>
                <div className="w-5 h-2.5 border border-black rounded-xs p-0.5 flex items-center">
                  <div className="w-full h-full bg-black rounded-xs" />
                </div>
              </div>
            </div>

            {/* Instagram Broadcast Header */}
            <div className="bg-white text-txt-primary px-3.5 py-2.5 flex items-center justify-between border-b border-border shadow-2xs select-none">
              <div className="flex items-center gap-2.5">
                <ArrowLeft className="w-4 h-4 text-txt-primary cursor-pointer hover:opacity-75 transition-opacity" onClick={() => setIsInstagramPreviewOpen(false)} />
                {/* Avatar with signature Instagram gradient ring */}
                <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-white p-[1.5px] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Channel Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-txt-primary leading-tight">{instagramChannelName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500 flex-shrink-0" />
                  </div>
                  <span className="text-[10px] text-txt-muted block">Broadcast channel • 24.8K members</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-txt-muted">
                <MoreVertical className="w-4 h-4" />
              </div>
            </div>

            {/* Chat Body Canvas */}
            <div className="flex-1 p-3.5 flex flex-col justify-end space-y-3">
              {/* Date Header Pill */}
              <div className="flex justify-center">
                <span className="px-2.5 py-0.5 bg-white border border-border/80 text-[10px] font-semibold text-txt-muted rounded-full shadow-2xs">
                  Today 11:45 AM
                </span>
              </div>

              {/* Broadcast Announcement Card */}
              <div className="bg-white border border-border/80 rounded-2xl shadow-sm overflow-hidden text-xs text-txt-primary space-y-2.5">
                {/* Banner Image */}
                {instagramImageUrl && (
                  <div className="w-full h-44 bg-bg-app overflow-hidden border-b border-border">
                    <img
                      src={instagramImageUrl}
                      alt="Instagram Broadcast Banner"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Caption / Text */}
                <div className="px-3.5 pt-1 pb-2 space-y-3">
                  <div className="text-[10px] font-bold text-[#C13584] uppercase tracking-wider flex items-center gap-1">
                    <InstagramLogo className="w-3.5 h-3.5" />
                    <span>Official Broadcast Update</span>
                  </div>

                  <p className="whitespace-pre-wrap leading-relaxed text-xs text-txt-primary font-normal">
                    {instagramCaption}
                  </p>

                  {/* Multi-Link Action CTA Buttons */}
                  {instagramActionButtons.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {instagramActionButtons.map((btn, idx) => (
                        <a
                          key={btn.id}
                          href={btn.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 bg-gradient-to-r from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#F77737]/10 hover:from-[#833AB4]/20 hover:to-[#F77737]/20 border border-[#E1306C]/30 text-[#C13584] rounded-xl flex items-center justify-between font-bold text-xs transition-all shadow-xs group"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <ExternalLink className="w-3 h-3 text-[#E1306C] flex-shrink-0" />
                            <span className="truncate">{btn.title || `Action Link #${idx + 1}`}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#E1306C]/70 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Timestamp & Realistic Reaction Bar */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-bg-app hover:bg-[#FDF2F8] border border-border rounded-full text-[10px] font-medium text-txt-primary flex items-center gap-1 transition-colors cursor-pointer">
                        <span>❤️</span>
                        <span className="font-semibold text-txt-muted text-[9.5px]">248</span>
                      </span>
                      <span className="px-1.5 py-0.5 bg-bg-app hover:bg-[#FDF2F8] border border-border rounded-full text-[10px] font-medium text-txt-primary flex items-center gap-1 transition-colors cursor-pointer">
                        <span>🔥</span>
                        <span className="font-semibold text-txt-muted text-[9.5px]">182</span>
                      </span>
                      <span className="px-1.5 py-0.5 bg-bg-app hover:bg-[#FDF2F8] border border-border rounded-full text-[10px] font-medium text-txt-primary flex items-center gap-1 transition-colors cursor-pointer">
                        <span>🎉</span>
                        <span className="font-semibold text-txt-muted text-[9.5px]">95</span>
                      </span>
                      <span className="px-1.5 py-0.5 bg-bg-app hover:bg-[#FDF2F8] border border-border rounded-full text-[10px] font-medium text-txt-primary flex items-center gap-1 transition-colors cursor-pointer">
                        <span>👏</span>
                        <span className="font-semibold text-txt-muted text-[9.5px]">74</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-txt-muted">11:45 AM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Channel Admin Only Notice */}
            <div className="p-3 bg-white border-t border-border flex items-center justify-center gap-1.5 text-txt-muted text-[11px] select-none font-medium">
              <Lock className="w-3 h-3 text-txt-muted" />
              <span>Only admins can send messages in this channel</span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setIsInstagramPreviewOpen(false)} className="text-xs h-7.5 px-3">
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MULTI-AI RESILIENT COPYWRITING MODAL (GEMINI + GROQ + OLLAMA)             */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="✨ Multi-AI Copywriter with Auto-Fallback"
        description="Generates tailored event invitations using Google Gemini. If rate-limited or busy, it automatically fails over to Groq LPU or local Ollama without interruptions."
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-purple-50 via-indigo-50 to-orange-50 border border-indigo-200 rounded-xl text-xs">
            <span className="font-bold text-txt-primary flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand" />
              <span>Target Channel:</span>
            </span>
            <div className="flex items-center gap-1">
              {[
                { id: 'whatsapp', label: '🟢 WhatsApp' },
                { id: 'email', label: '📧 Email' },
                { id: 'telegram', label: '✈️ Telegram' },
                { id: 'instagram', label: '📸 Instagram' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setAiTargetChannel(c.id as any)}
                  className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    aiTargetChannel === c.id
                      ? 'bg-brand text-white shadow-xs'
                      : 'bg-white text-txt-muted hover:text-txt-primary border border-border/60'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-txt-primary uppercase tracking-wider block">
              Event Details or Copywriting Prompt:
            </label>
            <textarea
              rows={3}
              value={aiPromptInput}
              onChange={(e) => setAiPromptInput(e.target.value)}
              placeholder="e.g. Write an exciting party invitation for Saturday night Bollywood Gala with DJ Shadow at Club Matrix, doors open 9 PM..."
              className="w-full p-3 text-xs bg-bg-app border border-border rounded-xl focus:border-brand focus:outline-hidden font-medium"
            />

            {/* Quick Presets */}
            <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-txt-muted pt-1">
              <span className="font-bold text-txt-primary">Quick ideas:</span>
              {[
                '🎉 Grand Weekend Club Party',
                '👑 VIP Table & Bottle Service Drop',
                '⚡ Last 24 Hours RSVP Flash',
                '🎵 DJ Shadow Live & Artist Night',
              ].map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => setAiPromptInput(`Write an exciting copy for: ${idea} with venue details, timing, and an urgent RSVP call to action.`)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 cursor-pointer text-[10px] font-semibold"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {aiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {aiFeedback && (
            <div className="p-3.5 bg-white border border-brand/40 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2">
                <span className="font-bold text-brand flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Generated via {aiFeedback.provider.toUpperCase()} ({aiFeedback.model}) in {aiFeedback.latencyMs}ms</span>
                </span>
                {aiFeedback.fallbackUsed && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Auto-Fallback Activated
                  </span>
                )}
              </div>
              <p className="text-xs text-txt-primary font-mono whitespace-pre-wrap max-h-36 overflow-y-auto bg-bg-app p-2.5 rounded-lg border border-border/60">
                {aiFeedback.text}
              </p>
              <p className="text-[11px] text-emerald-700 font-bold">
                ✓ Copy has been automatically applied to your {aiTargetChannel.toUpperCase()} editor!
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <span className="text-[10px] text-txt-muted">
              Auto-cascade: Gemini ➔ Groq LPU (Free) ➔ Ollama Local
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAiModalOpen(false)}
                className="text-xs px-3 h-8"
              >
                Close
              </Button>
              <Button
                type="button"
                isLoading={isGeneratingAi}
                onClick={handleGenerateWithAi}
                className="text-xs px-4 h-8 bg-gradient-to-r from-violet-600 via-indigo-600 to-[#F55036] text-white font-bold"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-200" />
                <span>Generate with Multi-AI</span>
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 5. CONFIRMATION LAUNCH MODAL WITH PRE-FLIGHT SUMMARY */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Campaign Launch"
        description="Verify audience reach, channels, and estimated spend before dispatching to the 24/7 background worker."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-brand-soft border border-brand/30 rounded-element text-sm space-y-2.5">
            <h4 className="font-bold text-brand text-sm">{name}</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-txt-primary pt-1">
              <div>
                <span className="text-txt-muted block text-[11px]">Channels:</span>
                <span className="font-bold capitalize">{selectedChannels.join(', ')}</span>
              </div>
              <div>
                <span className="text-txt-muted block text-[11px]">Target Audience:</span>
                <span className="font-bold">
                  {audienceType === 'all' ? 'All Contacts' : selectedTags.join(', ')}
                </span>
              </div>
              <div>
                <span className="text-txt-muted block text-[11px]">Eligible Contacts:</span>
                <span className="font-bold">{audienceSummary?.totalAudience || 6}</span>
              </div>
              <div>
                <span className="text-txt-muted block text-[11px]">Estimated WhatsApp Spend:</span>
                <span className="font-bold text-brand font-mono">
                  ₹{audienceSummary?.estimatedWhatsAppCostInr || 5.96}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-txt-muted leading-relaxed">
            Once confirmed, jobs are enqueued with unique idempotency keys and delivered by the 24/7 worker respecting carrier and API rate limits.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsConfirmModalOpen(false)} className="text-xs h-7.5 px-3">
              Back to Editing
            </Button>
            <Button
              type="button"
              isLoading={isSubmitting}
              onClick={() => handleSubmitCampaign('launch')}
              className="text-xs h-7.5 px-4 bg-brand hover:bg-brand-hover text-white shadow-xs"
            >
              Confirm and Launch Campaign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
