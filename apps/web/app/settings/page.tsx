'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  Sparkles,
  Eye,
  EyeOff,
  ExternalLink,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
  Flame,
  Radio,
  Layers,
  Zap,
  Bot,
  Cpu,
  Server,
  ArrowRight,
  CornerDownRight,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  WhatsAppLogo,
  GmailLogo,
  TelegramLogo,
  InstagramLogo,
  GroqLogo,
  GeminiLogo,
  OllamaLogo,
} from '@/components/ui/BrandIcons';
import type { MaskedSettings } from '@campaignhub/shared';

export default function SettingsPage() {
  const [settings, setSettings] = useState<MaskedSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'ai' | 'whatsapp' | 'email' | 'telegram' | 'instagram' | 'limits'>('all');

  // Password visibility toggles
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const toggleVisibility = (field: string) => {
    setShowKey((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Form states: AI & Gemini
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-2.0-flash');
  const [geminiTemperature, setGeminiTemperature] = useState(0.7);

  // Form states: Groq Cloud LPU & xAI Grok
  const [groqApiKey, setGroqApiKey] = useState('');
  const [groqModel, setGroqModel] = useState('qwen/qwen3.8-27b');
  const [groqSupportedModels, setGroqSupportedModels] = useState<string[]>([
    'qwen/qwen3.8-27b',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'grok-2',
    'grok-beta',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'allam-2-7b',
  ]);

  // Live Connection Verification & Health Audit
  const [verificationResults, setVerificationResults] = useState<
    Record<string, { status: 'connected' | 'error'; label: string; detail?: string }>
  >({});
  const [isVerifying, setIsVerifying] = useState(false);

  // Form states: Ollama Local (100% Free Offline)
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('gemma4:e4b');
  const [ollamaInstalledModels, setOllamaInstalledModels] = useState<string[]>(['gemma4:e4b']);

  // Form states: AI Orchestration Primary Provider
  const [aiPrimaryProvider, setAiPrimaryProvider] = useState<'gemini' | 'groq' | 'ollama'>('gemini');

  // Interactive AI Sandbox / Failover Tester State
  const [showSandbox, setShowSandbox] = useState(false);
  const [sandboxPrompt, setSandboxPrompt] = useState('Write an exclusive VIP invitation for Saturday night Bollywood Gala with DJ Shadow at Club Matrix');
  const [sandboxChannel, setSandboxChannel] = useState<'whatsapp' | 'email' | 'telegram' | 'instagram'>('whatsapp');
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [sandboxError, setSandboxError] = useState('');

  // Form states: WhatsApp Meta Cloud API
  const [metaAccessToken, setMetaAccessToken] = useState('');
  const [metaPhoneId, setMetaPhoneId] = useState('');
  const [metaWabaId, setMetaWabaId] = useState('');
  const [metaAppSecret, setMetaAppSecret] = useState('');
  const [metaVerifyToken, setMetaVerifyToken] = useState('campaignhub_wa_verify');

  // Form states: Email (Resend)
  const [resendApiKey, setResendApiKey] = useState('');
  const [resendFromName, setResendFromName] = useState('');
  const [resendFromEmail, setResendFromEmail] = useState('');

  // Form states: Telegram Bot
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChannelId, setTelegramChannelId] = useState('');

  // Form states: Instagram Meta Graph API
  const [instagramAccountId, setInstagramAccountId] = useState('');
  const [instagramAccessToken, setInstagramAccessToken] = useState('');
  const [instagramBroadcastChannelId, setInstagramBroadcastChannelId] = useState('');

  // Form states: Rate Limits & Pricing
  const [rateLimitWhatsapp, setRateLimitWhatsapp] = useState(20);
  const [rateLimitEmail, setRateLimitEmail] = useState(5);
  const [rateLimitTelegram, setRateLimitTelegram] = useState(30);

  const [priceWaMarketing, setPriceWaMarketing] = useState(0.9926);
  const [priceWaUtility, setPriceWaUtility] = useState(0.1323);
  const [priceWaAuth, setPriceWaAuth] = useState(0.1323);
  const [monthlyBudgetCapInr, setMonthlyBudgetCapInr] = useState(10000);

  // Connection test states
  const [testStatus, setTestStatus] = useState<
    Record<string, { loading: boolean; result?: any; error?: string }>
  >({});
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';
  const waWebhookUrl = `${appBaseUrl}/api/webhooks/whatsapp`;
  const resendWebhookUrl = `${appBaseUrl}/api/webhooks/resend`;

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings');
      const json = await res.json();
      if (json.success && json.data) {
        const d: MaskedSettings = json.data;
        setSettings(d);
        setGeminiModel(d.gemini_model || 'gemini-2.0-flash');
        setGeminiTemperature(d.gemini_temperature ?? 0.7);

        setGroqModel(d.groq_model || 'qwen/qwen3.8-27b');
        setOllamaBaseUrl(d.ollama_base_url || 'http://localhost:11434');
        setOllamaModel(d.ollama_model || 'gemma4:e4b');
        setAiPrimaryProvider(d.ai_primary_provider || 'groq');

        // Automatically query Groq endpoint to discover available models on key
        fetch('/api/settings/test-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: 'groq' }),
        })
          .then((r) => r.json())
          .then((groqData) => {
            if (groqData.success && groqData.data?.supported_models) {
              setGroqSupportedModels(groqData.data.supported_models);
            }
          })
          .catch(() => {});

        // Automatically query local Ollama in background to discover installed models
        fetch('/api/settings/test-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: 'ollama' }),
        })
          .then((r) => r.json())
          .then((ollamaData) => {
            if (ollamaData.success && ollamaData.data?.installed_models) {
              setOllamaInstalledModels(ollamaData.data.installed_models);
              if (ollamaData.data.installed_models.length > 0) {
                setOllamaModel((prev) =>
                  ollamaData.data.installed_models.includes(prev)
                    ? prev
                    : ollamaData.data.installed_models[0]
                );
              }
            }
          })
          .catch(() => {});

        setMetaPhoneId(d.meta_phone_number_id || '');
        setMetaWabaId(d.meta_waba_id || '');
        setMetaVerifyToken(d.meta_webhook_verify_token || 'campaignhub_wa_verify');

        setResendFromName(d.resend_from_name || '');
        setResendFromEmail(d.resend_from_email || '');

        setTelegramChannelId(d.telegram_channel_id || '');

        setInstagramAccountId(d.instagram_account_id || '');
        setInstagramBroadcastChannelId(d.instagram_broadcast_channel_id || '');

        setRateLimitWhatsapp(d.rate_limit_whatsapp || 20);
        setRateLimitEmail(d.rate_limit_email || 5);
        setRateLimitTelegram(d.rate_limit_telegram || 30);

        setPriceWaMarketing(d.price_whatsapp_marketing_inr || 0.9926);
        setPriceWaUtility(d.price_whatsapp_utility_inr || 0.1323);
        setPriceWaAuth(d.price_whatsapp_auth_inr || 0.1323);
        setMonthlyBudgetCapInr(d.monthly_budget_cap_inr || 10000);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch settings' });
    } finally {
      setIsLoading(false);
    }
  }

  async function runLiveVerifications(savedKeys?: {
    groqApiKey?: string;
    geminiApiKey?: string;
    telegramBotToken?: string;
    metaAccessToken?: string;
    metaPhoneId?: string;
    resendApiKey?: string;
    instagramAccessToken?: string;
    instagramAccountId?: string;
  }) {
    setIsVerifying(true);
    setVerificationResults({});

    const testsToRun: Array<{
      channel: 'groq' | 'gemini' | 'telegram' | 'whatsapp' | 'email' | 'instagram';
      label: string;
      shouldRun: boolean;
      credentials?: any;
    }> = [
      {
        channel: 'groq',
        label: 'Groq LPU / xAI Grok',
        shouldRun: Boolean(savedKeys?.groqApiKey || settings?.has_groq_api_key),
        credentials: savedKeys?.groqApiKey ? { groq_api_key: savedKeys.groqApiKey } : undefined,
      },
      {
        channel: 'gemini',
        label: 'Google Gemini AI',
        shouldRun: Boolean(savedKeys?.geminiApiKey || settings?.has_gemini_api_key),
        credentials: savedKeys?.geminiApiKey ? { gemini_api_key: savedKeys.geminiApiKey } : undefined,
      },
      {
        channel: 'telegram',
        label: 'Telegram Bot',
        shouldRun: Boolean(savedKeys?.telegramBotToken || settings?.has_telegram_bot_token),
        credentials: savedKeys?.telegramBotToken ? { telegram_bot_token: savedKeys.telegramBotToken } : undefined,
      },
      {
        channel: 'whatsapp',
        label: 'WhatsApp Cloud API',
        shouldRun: Boolean((savedKeys?.metaAccessToken || settings?.has_meta_access_token) && (savedKeys?.metaPhoneId || metaPhoneId)),
        credentials: (savedKeys?.metaAccessToken || savedKeys?.metaPhoneId) ? {
          meta_access_token: savedKeys?.metaAccessToken,
          meta_phone_number_id: savedKeys?.metaPhoneId || metaPhoneId,
        } : undefined,
      },
      {
        channel: 'email',
        label: 'Resend Email SMTP',
        shouldRun: Boolean(savedKeys?.resendApiKey || settings?.has_resend_api_key),
        credentials: savedKeys?.resendApiKey ? { resend_api_key: savedKeys.resendApiKey } : undefined,
      },
      {
        channel: 'instagram',
        label: 'Instagram Graph',
        shouldRun: Boolean((savedKeys?.instagramAccessToken || settings?.has_instagram_access_token) && (savedKeys?.instagramAccountId || instagramAccountId)),
        credentials: (savedKeys?.instagramAccessToken || savedKeys?.instagramAccountId) ? {
          instagram_access_token: savedKeys?.instagramAccessToken,
          instagram_account_id: savedKeys?.instagramAccountId || instagramAccountId,
        } : undefined,
      },
    ];

    const activeTests = testsToRun.filter((t) => t.shouldRun);
    if (activeTests.length === 0) {
      activeTests.push({
        channel: 'groq',
        label: 'Groq LPU / xAI Grok',
        shouldRun: true,
      });
    }

    const updatedResults: Record<string, { status: 'connected' | 'error'; label: string; detail?: string }> = {};

    await Promise.all(
      activeTests.map(async (t) => {
        try {
          const res = await fetch('/api/settings/test-connection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channel: t.channel,
              credentials: t.credentials,
            }),
          });
          const json = await res.json();
          if (json.success) {
            let detail = 'Active & Connected';
            if (t.channel === 'groq' && json.data) {
              const activeMod = json.data.active_model || 'ready';
              const isXai = json.data.provider === 'xai_grok' || activeMod.includes('grok');
              detail = `${json.data.latency_ms || 180}ms • ${isXai ? 'xAI Grok' : 'Groq LPU'} (${activeMod})`;
            } else if (t.channel === 'telegram' && json.data?.bot_username) {
              detail = `@${json.data.bot_username} connected`;
            } else if (t.channel === 'whatsapp' && json.data?.phone_number) {
              detail = `${json.data.phone_number} active`;
            } else if (t.channel === 'email' && json.data?.verified_domain) {
              detail = `Domain: ${json.data.verified_domain}`;
            }
            updatedResults[t.channel] = { status: 'connected', label: t.label, detail };
          } else {
            updatedResults[t.channel] = {
              status: 'error',
              label: t.label,
              detail: json.error || 'Connection failed',
            };
          }
        } catch (err: any) {
          updatedResults[t.channel] = {
            status: 'error',
            label: t.label,
            detail: err.message || 'Timeout',
          };
        }
      })
    );

    setVerificationResults(updatedResults);
    setIsVerifying(false);
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const keysEntered = {
      groqApiKey: groqApiKey.trim() || undefined,
      geminiApiKey: geminiApiKey.trim() || undefined,
      telegramBotToken: telegramBotToken.trim() || undefined,
      metaAccessToken: metaAccessToken.trim() || undefined,
      metaPhoneId: metaPhoneId.trim() || undefined,
      resendApiKey: resendApiKey.trim() || undefined,
      instagramAccessToken: instagramAccessToken.trim() || undefined,
      instagramAccountId: instagramAccountId.trim() || undefined,
    };

    const payload: Record<string, any> = {
      gemini_model: geminiModel,
      gemini_temperature: Number(geminiTemperature),

      groq_model: groqModel,
      ollama_base_url: ollamaBaseUrl ? ollamaBaseUrl.trim() : 'http://localhost:11434',
      ollama_model: ollamaModel,
      ai_primary_provider: aiPrimaryProvider,

      meta_phone_number_id: metaPhoneId.trim(),
      meta_waba_id: metaWabaId.trim(),
      meta_webhook_verify_token: metaVerifyToken.trim(),

      resend_from_name: resendFromName.trim(),
      resend_from_email: resendFromEmail.trim(),

      telegram_channel_id: telegramChannelId.trim(),

      instagram_account_id: instagramAccountId.trim(),
      instagram_broadcast_channel_id: instagramBroadcastChannelId.trim(),

      rate_limit_whatsapp: Number(rateLimitWhatsapp),
      rate_limit_email: Number(rateLimitEmail),
      rate_limit_telegram: Number(rateLimitTelegram),

      price_whatsapp_marketing_inr: Number(priceWaMarketing),
      price_whatsapp_utility_inr: Number(priceWaUtility),
      price_whatsapp_auth_inr: Number(priceWaAuth),
      monthly_budget_cap_inr: Number(monthlyBudgetCapInr),
    };

    if (geminiApiKey.trim()) payload.gemini_api_key = geminiApiKey.trim();
    if (groqApiKey.trim()) payload.groq_api_key = groqApiKey.trim();
    if (metaAccessToken.trim()) payload.meta_access_token = metaAccessToken.trim();
    if (metaAppSecret.trim()) payload.meta_app_secret = metaAppSecret.trim();
    if (resendApiKey.trim()) payload.resend_api_key = resendApiKey.trim();
    if (telegramBotToken.trim()) payload.telegram_bot_token = telegramBotToken.trim();
    if (instagramAccessToken.trim()) payload.instagram_access_token = instagramAccessToken.trim();

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: 'All API keys, Multi-AI engines & credentials encrypted with AES-256-GCM and saved successfully!',
        });
        setSettings(data.data);
        setGeminiApiKey('');
        setGroqApiKey('');
        setMetaAccessToken('');
        setMetaAppSecret('');
        setResendApiKey('');
        setTelegramBotToken('');
        setInstagramAccessToken('');

        // Automatically trigger live connection verification
        runLiveVerifications(keysEntered);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to save settings' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  }

  async function runConnectionTest(channel: 'whatsapp' | 'telegram' | 'email' | 'instagram' | 'gemini' | 'groq' | 'ollama') {
    setTestStatus((prev) => ({ ...prev, [channel]: { loading: true } }));
    try {
      const res = await fetch('/api/settings/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus((prev) => ({
          ...prev,
          [channel]: { loading: false, result: data.data },
        }));
        if (channel === 'groq' && data.data?.supported_models && data.data.supported_models.length > 0) {
          setGroqSupportedModels(data.data.supported_models);
          if (!data.data.supported_models.includes(groqModel)) {
            setGroqModel(data.data.supported_models[0]);
          }
        }
        if (channel === 'ollama' && data.data?.installed_models && data.data.installed_models.length > 0) {
          setOllamaInstalledModels(data.data.installed_models);
          if (!data.data.installed_models.includes(ollamaModel)) {
            setOllamaModel(data.data.installed_models[0]);
          }
        }
      } else {
        setTestStatus((prev) => ({
          ...prev,
          [channel]: { loading: false, error: data.error },
        }));
      }
    } catch (err: any) {
      setTestStatus((prev) => ({
        ...prev,
        [channel]: { loading: false, error: err.message || 'Connection test failed' },
      }));
    }
  }

  async function testAiSandbox() {
    if (!sandboxPrompt.trim()) return;
    setIsTestingAi(true);
    setSandboxResult(null);
    setSandboxError('');
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: sandboxPrompt,
          channel: sandboxChannel,
          temperature: Number(geminiTemperature),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSandboxResult(data);
      } else {
        setSandboxError(data.error || 'AI generation failed across all providers');
      }
    } catch (err: any) {
      setSandboxError(err.message || 'Failed to connect to AI generator');
    } finally {
      setIsTestingAi(false);
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 w-full">
      {/* ===================================================================== */}
      {/* 1. TOP HEADER & NAVIGATION FILTER PILLS                               */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-border/80 shadow-2xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 className="text-xl sm:text-2xl font-black text-txt-primary tracking-tight">
                Settings &amp; Credential Vault
              </h1>
            </div>
            <p className="text-xs text-txt-muted mt-0.5">
              Configure Google Gemini AI, Meta WhatsApp Cloud API, Resend Email, Telegram, Instagram Graph, and throughput rules.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>AES-256-GCM Vault Active</span>
            </span>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-2 border-t border-border/60">
          {[
            { id: 'all', label: 'All Settings' },
            { id: 'whatsapp', label: '🟢 WhatsApp Meta' },
            { id: 'email', label: '📧 Email SMTP' },
            { id: 'telegram', label: '✈️ Telegram' },
            { id: 'instagram', label: '📸 Instagram' },
            { id: 'limits', label: '⚙️ Limits & Pricing' },
            { id: 'ai', label: '🤖 AI Engines (Groq & Gemini)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand text-white shadow-2xs'
                  : 'bg-bg-app text-txt-muted hover:text-txt-primary hover:bg-border/40 border border-border/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
              : 'bg-red-50 border-red-300 text-red-900 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* ===================================================================== */}
        {/* 1. META WHATSAPP CLOUD API (AUTHENTIC GREEN THEME & LOGO)             */}
        {/* ===================================================================== */}
        {(activeTab === 'all' || activeTab === 'whatsapp') && (
          <div className="rounded-2xl border border-border/80 shadow-2xs overflow-hidden bg-white">
            {/* Authentic WhatsApp Green Gradient Header */}
            <div className="bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-2xs shrink-0">
                  <WhatsAppLogo className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                      Meta WhatsApp Cloud API (v21.0)
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white">
                      Direct BSP Gateway
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Official Meta WhatsApp Business Cloud connection. Direct throughput, zero BSP markup, verified green tick.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs py-1.5 px-3 min-h-[34px]"
                  isLoading={testStatus.whatsapp?.loading}
                  onClick={() => runConnectionTest('whatsapp')}
                >
                  <WhatsAppLogo className="w-3.5 h-3.5 mr-1" />
                  <span>Test WhatsApp Connection</span>
                </Button>
              </div>
            </div>

            {/* Test Connection Results */}
            {testStatus.whatsapp?.result && (
              <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Name: {testStatus.whatsapp.result.verified_name} &bull; Quality: {testStatus.whatsapp.result.quality_rating}</span>
                </span>
                <span className="font-bold text-emerald-800">Tier: {testStatus.whatsapp.result.throughput_tier}</span>
              </div>
            )}
            {testStatus.whatsapp?.error && (
              <div className="p-3 bg-red-50 border-b border-red-200 text-xs text-red-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>WhatsApp Connection Error: {testStatus.whatsapp.error}</span>
              </div>
            )}

            {/* WhatsApp Fields */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Permanent Token */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-txt-primary uppercase tracking-wider">
                    Permanent System User Access Token
                  </label>
                  <div className="relative">
                    <input
                      type={showKey.meta ? 'text' : 'password'}
                      placeholder={settings?.has_meta_access_token ? `${settings.meta_access_token_preview} (configured)` : 'EAAG...'}
                      value={metaAccessToken}
                      onChange={(e) => setMetaAccessToken(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-bg-app border border-border/80 rounded-xl focus:border-brand focus:outline-hidden transition-all pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility('meta')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary cursor-pointer p-1"
                    >
                      {showKey.meta ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-txt-muted">
                    Generate in Meta Business Manager with <code className="text-emerald-700 font-mono">whatsapp_business_messaging</code>.
                  </p>
                </div>

                {/* Phone Number ID */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-txt-primary uppercase tracking-wider">
                    Phone Number ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 102938475610293"
                    value={metaPhoneId}
                    onChange={(e) => setMetaPhoneId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-bg-app border border-border/80 rounded-xl focus:border-brand focus:outline-hidden transition-all font-mono"
                  />
                  <p className="text-[11px] text-txt-muted">Found in WhatsApp Manager &rarr; API Setup &rarr; Phone Number ID.</p>
                </div>

                {/* WABA ID */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-txt-primary uppercase tracking-wider">
                    WhatsApp Business Account ID (WABA ID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 192837465019283"
                    value={metaWabaId}
                    onChange={(e) => setMetaWabaId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-bg-app border border-border/80 rounded-xl focus:border-brand focus:outline-hidden transition-all font-mono"
                  />
                  <p className="text-[11px] text-txt-muted">Required for Meta approved template synchronization.</p>
                </div>

                {/* App Secret */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-txt-primary uppercase tracking-wider">
                    Meta App Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showKey.appSecret ? 'text' : 'password'}
                      placeholder={settings?.has_meta_app_secret ? '•••••••••••••••• (configured)' : 'e.g. 8f7e6d5c4b...'}
                      value={metaAppSecret}
                      onChange={(e) => setMetaAppSecret(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-bg-app border border-border/80 rounded-xl focus:border-brand focus:outline-hidden transition-all pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility('appSecret')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary cursor-pointer p-1"
                    >
                      {showKey.appSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-txt-muted">Used to cryptographically verify X-Hub-Signature-256 on incoming 2-way replies.</p>
                </div>

                {/* Webhook Verify Token */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-txt-primary uppercase tracking-wider">
                    Webhook Verify Token
                  </label>
                  <input
                    type="text"
                    placeholder="campaignhub_wa_verify"
                    value={metaVerifyToken}
                    onChange={(e) => setMetaVerifyToken(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-bg-app border border-border/80 rounded-xl focus:border-brand focus:outline-hidden transition-all font-mono"
                  />
                  <p className="text-[11px] text-txt-muted">Match this token in Meta App Dashboard when verifying the webhook callback.</p>
                </div>

                {/* Webhook Callback URL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-txt-primary uppercase tracking-wider">
                    Webhook Callback URL (Meta Cloud)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={waWebhookUrl}
                      className="w-full px-3.5 py-2 text-xs bg-bg-app text-txt-muted border border-border/80 rounded-xl font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(waWebhookUrl, 'wa')}
                      className="p-2 border border-border/80 bg-white hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      {copiedUrl === 'wa' ? <Check className="w-3.5 h-3.5 text-brand" /> : <Copy className="w-3.5 h-3.5 text-txt-muted" />}
                      <span className="hidden sm:inline">{copiedUrl === 'wa' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-txt-muted">Configure under Meta App &rarr; WhatsApp &rarr; Configuration &rarr; Webhook.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 4. EMAIL OUTREACH GATEWAY (RESEND / SMTP THEME & LOGO)               */}
        {/* ===================================================================== */}
        {(activeTab === 'all' || activeTab === 'email') && (
          <div className="rounded-2xl border border-border/80 shadow-2xs overflow-hidden bg-white">
            {/* Royal Indigo Email Gradient Header */}
            <div className="bg-gradient-to-r from-[#1E3A8A] via-[#3730A3] to-[#4F46E5] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-2xs shrink-0">
                  <GmailLogo className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                      Resend Email Gateway (SMTP &amp; API)
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white">
                      SPF/DKIM Signed
                    </span>
                  </div>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    High-deliverability transactional and promotional email dispatch with 100% inboxing verification.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs py-1.5 px-3 min-h-[34px]"
                  isLoading={testStatus.email?.loading}
                  onClick={() => runConnectionTest('email')}
                >
                  <GmailLogo className="w-3.5 h-3.5 mr-1" />
                  <span>Test Email Connection</span>
                </Button>
              </div>
            </div>

            {/* Test Connection Results */}
            {testStatus.email?.result && (
              <div className="p-3 bg-indigo-50 border-b border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Total Domains: {testStatus.email.result.total_domains} &bull; Verified: {testStatus.email.result.verified_domains.join(', ') || 'Active'}</span>
                </span>
                <span className="font-bold text-indigo-800">Sender: {testStatus.email.result.from_email}</span>
              </div>
            )}
            {testStatus.email?.error && (
              <div className="p-3 bg-red-50 border-b border-red-200 text-xs text-red-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Resend Error: {testStatus.email.error}</span>
              </div>
            )}

            {/* Email Fields */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Resend API Key */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-txt-primary uppercase tracking-wider">
                    Resend API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKey.resend ? 'text' : 'password'}
                      placeholder={settings?.has_resend_api_key ? `${settings.resend_api_key_preview} (configured)` : 're_123456789...'}
                      value={resendApiKey}
                      onChange={(e) => setResendApiKey(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-bg-app border border-border/80 rounded-xl focus:border-brand focus:outline-hidden transition-all pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility('resend')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary cursor-pointer p-1"
                    >
                      {showKey.resend ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-txt-muted">Obtain from Resend Dashboard under API Keys.</p>
                </div>

                {/* From Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-txt-primary uppercase tracking-wider">
                    From Sender Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CampaignHub VIP Operations"
                    value={resendFromName}
                    onChange={(e) => setResendFromName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-bg-app border border-border/80 rounded-xl focus:border-brand focus:outline-hidden transition-all font-semibold"
                  />
                  <p className="text-[11px] text-txt-muted">The friendly display name shown in guest inboxes.</p>
                </div>

                {/* From Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-txt-primary uppercase tracking-wider">
                    From Sender Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. vip@campaignhub.in or onboarding@resend.dev"
                    value={resendFromEmail}
                    onChange={(e) => setResendFromEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-bg-app border border-border/80 rounded-xl focus:border-brand focus:outline-hidden transition-all font-mono"
                  />
                  <p className="text-[11px] text-txt-muted">Must be an authorized or verified domain configured on Resend.</p>
                </div>

                {/* Resend Webhook */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-txt-primary uppercase tracking-wider">
                    Resend Webhook URL (Delivery &amp; Open Tracking)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={resendWebhookUrl}
                      className="w-full px-3.5 py-2 text-xs bg-bg-app text-txt-muted border border-border/80 rounded-xl font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(resendWebhookUrl, 'resend')}
                      className="p-2 border border-border/80 bg-white hover:bg-indigo-50 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      {copiedUrl === 'resend' ? <Check className="w-3.5 h-3.5 text-brand" /> : <Copy className="w-3.5 h-3.5 text-txt-muted" />}
                      <span className="hidden sm:inline">{copiedUrl === 'resend' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-txt-muted">Receives instant delivered, opened, and clicked events.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 3. TELEGRAM BOT API GATEWAY (AUTHENTIC SKY BLUE THEME & LOGO)        */}
        {/* ===================================================================== */}
        {(activeTab === 'all' || activeTab === 'telegram') && (
          <div className="rounded-2xl border border-border/80 shadow-2xs overflow-hidden bg-white">
            {/* Sky Blue Telegram Gradient Header */}
            <div className="bg-gradient-to-r from-[#006699] via-[#0088CC] to-[#0EA5E9] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-2xs shrink-0">
                  <TelegramLogo className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                      Telegram Bot API Gateway (v7.2)
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white">
                      Free Lifetime API
                    </span>
                  </div>
                  <p className="text-xs text-sky-100 mt-0.5">
                    Broadcast announcements, pinned flyers, and instant community posts with zero API costs.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs py-1.5 px-3 min-h-[34px]"
                  isLoading={testStatus.telegram?.loading}
                  onClick={() => runConnectionTest('telegram')}
                >
                  <TelegramLogo className="w-3.5 h-3.5 mr-1" />
                  <span>Test Telegram Bot</span>
                </Button>
              </div>
            </div>

            {/* Test Connection Results */}
            {testStatus.telegram?.result && (
              <div className="p-3 bg-sky-50 border-b border-sky-200 text-xs text-sky-900 flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <span>Bot: {testStatus.telegram.result.bot_username} ({testStatus.telegram.result.bot_name}) &bull; Channel: {testStatus.telegram.result.channel_title}</span>
                </span>
                <span className="font-bold text-sky-800">{testStatus.telegram.result.channel_subscribers} Subscribers</span>
              </div>
            )}
            {testStatus.telegram?.error && (
              <div className="p-3 bg-red-50 border-b border-red-200 text-xs text-red-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Telegram Bot Error: {testStatus.telegram.error}</span>
              </div>
            )}

            {/* Telegram Fields */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bot Token */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-txt-primary uppercase tracking-wider">
                    Telegram Bot Token
                  </label>
                  <div className="relative">
                    <input
                      type={showKey.telegram ? 'text' : 'password'}
                      placeholder={settings?.has_telegram_bot_token ? `${settings.telegram_bot_token_preview} (configured)` : '123456789:ABCdefGHI...'}
                      value={telegramBotToken}
                      onChange={(e) => setTelegramBotToken(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-bg-app border border-border/80 rounded-xl focus:border-brand focus:outline-hidden transition-all pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility('telegram')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary cursor-pointer p-1"
                    >
                      {showKey.telegram ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-txt-muted">Created via @BotFather on Telegram.</p>
                </div>

                {/* Target Channel */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-txt-primary uppercase tracking-wider">
                    Target Channel Handle or Group ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. @campaignhub_vip or -1001234567890"
                    value={telegramChannelId}
                    onChange={(e) => setTelegramChannelId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-bg-app border border-border/80 rounded-xl focus:border-brand focus:outline-hidden transition-all font-mono"
                  />
                  <p className="text-[11px] text-txt-muted">Ensure your bot is added to this channel as an Administrator with Post &amp; Pin permissions.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 4. INSTAGRAM META GRAPH API GATEWAY (SUNSET GRADIENT & LOGO)        */}
        {/* ===================================================================== */}
        {(activeTab === 'all' || activeTab === 'instagram') && (
          <div className="rounded-2xl border border-border/80 shadow-2xs overflow-hidden bg-white">
            {/* Sunset Gradient Instagram Header */}
            <div className="bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-2xs shrink-0">
                  <InstagramLogo className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                      Instagram Meta Graph API (Broadcast &amp; Audio)
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white">
                      Graph API v21.0
                    </span>
                  </div>
                  <p className="text-xs text-pink-100 mt-0.5">
                    Connect Instagram Professional Accounts for VIP Broadcast Channels, Audio Podcast Notes, and feed notifications.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs py-1.5 px-3 min-h-[34px]"
                  isLoading={testStatus.instagram?.loading}
                  onClick={() => runConnectionTest('instagram')}
                >
                  <InstagramLogo className="w-3.5 h-3.5 mr-1" />
                  <span>Test Instagram Connection</span>
                </Button>
              </div>
            </div>

            {/* Test Connection Results */}
            {testStatus.instagram?.result && (
              <div className="p-3 bg-pink-50 border-b border-pink-200 text-xs text-pink-900 flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-pink-600" />
                  <span>Account: {testStatus.instagram.result.username} &bull; {testStatus.instagram.result.followers} Followers</span>
                </span>
                <span className="font-bold text-pink-800">Broadcast Channel Active</span>
              </div>
            )}
            {testStatus.instagram?.error && (
              <div className="p-3 bg-red-50 border-b border-red-200 text-xs text-red-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Instagram Error: {testStatus.instagram.error}</span>
              </div>
            )}

            {/* Instagram Fields */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Account ID */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-txt-primary uppercase tracking-wider">
                    Instagram Business Account ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 17841400000000000"
                    value={instagramAccountId}
                    onChange={(e) => setInstagramAccountId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-bg-app border border-border/80 rounded-xl focus:border-brand focus:outline-hidden transition-all font-mono"
                  />
                  <p className="text-[11px] text-txt-muted">Obtained from Meta Business Suite under Instagram Accounts.</p>
                </div>

                {/* Broadcast Channel ID */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-txt-primary uppercase tracking-wider">
                    VIP Broadcast Channel ID or Handle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. @campaignhub_vip or broadcast_102938"
                    value={instagramBroadcastChannelId}
                    onChange={(e) => setInstagramBroadcastChannelId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-bg-app border border-border/80 rounded-xl focus:border-brand focus:outline-hidden transition-all font-mono"
                  />
                  <p className="text-[11px] text-txt-muted">Where VIP audio notes and podcast announcements are published.</p>
                </div>

                {/* Instagram Access Token */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-txt-primary uppercase tracking-wider">
                    Instagram Graph Access Token (Optional if using Meta System User Token)
                  </label>
                  <div className="relative">
                    <input
                      type={showKey.instagram ? 'text' : 'password'}
                      placeholder={settings?.has_instagram_access_token ? `${settings.instagram_access_token_preview} (configured)` : 'Uses Meta Cloud System User Token if empty'}
                      value={instagramAccessToken}
                      onChange={(e) => setInstagramAccessToken(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-bg-app border border-border/80 rounded-xl focus:border-brand focus:outline-hidden transition-all pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility('instagram')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary cursor-pointer p-1"
                    >
                      {showKey.instagram ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-txt-muted">Requires <code className="text-pink-700 font-mono">instagram_basic</code> and <code className="text-pink-700 font-mono">instagram_manage_messages</code> permissions.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 5. THROUGHPUT LIMITS & PRICING CONSTANTS (INR)                        */}
        {/* ===================================================================== */}
        {(activeTab === 'all' || activeTab === 'limits') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Rate Limits */}
            <div className="bg-white rounded-2xl border border-border/80 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Sliders className="w-4 h-4 text-brand" />
                <h3 className="text-sm font-bold text-txt-primary">Throughput Rate Limits</h3>
              </div>
              <p className="text-xs text-txt-muted">
                Controls maximum outbound background queue dispatches per second to prevent rate-limit throttling.
              </p>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-txt-primary">WhatsApp Messages / Sec</span>
                    <strong className="text-brand font-mono">{rateLimitWhatsapp} msg/s</strong>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={rateLimitWhatsapp}
                    onChange={(e) => setRateLimitWhatsapp(parseInt(e.target.value, 10) || 20)}
                    className="w-full px-3 py-1.5 text-xs bg-bg-app border border-border/80 rounded-xl font-mono"
                  />
                  <span className="text-[10px] text-txt-muted block">Meta recommended default: 20 msg/sec</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-txt-primary">Email Messages / Sec</span>
                    <strong className="text-indigo-700 font-mono">{rateLimitEmail} msg/s</strong>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={rateLimitEmail}
                    onChange={(e) => setRateLimitEmail(parseInt(e.target.value, 10) || 5)}
                    className="w-full px-3 py-1.5 text-xs bg-bg-app border border-border/80 rounded-xl font-mono"
                  />
                  <span className="text-[10px] text-txt-muted block">Protects domain sender reputation: 5 msg/sec</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-txt-primary">Telegram Messages / Sec</span>
                    <strong className="text-sky-700 font-mono">{rateLimitTelegram} msg/s</strong>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={rateLimitTelegram}
                    onChange={(e) => setRateLimitTelegram(parseInt(e.target.value, 10) || 30)}
                    className="w-full px-3 py-1.5 text-xs bg-bg-app border border-border/80 rounded-xl font-mono"
                  />
                  <span className="text-[10px] text-txt-muted block">Telegram Bot API broadcast standard: 30 msg/sec</span>
                </div>
              </div>
            </div>

            {/* Card 2: India WhatsApp Pricing Constants */}
            <div className="bg-white rounded-2xl border border-border/80 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Flame className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-txt-primary">India WhatsApp Pricing (INR)</h3>
              </div>
              <p className="text-xs text-txt-muted">
                Configures real-time campaign spend calculations in INR. Matches Meta rate card.
              </p>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-txt-primary">Marketing Message (INR)</span>
                    <strong className="text-emerald-700 font-mono">₹{priceWaMarketing}</strong>
                  </div>
                  <input
                    type="number"
                    step="0.0001"
                    value={priceWaMarketing}
                    onChange={(e) => setPriceWaMarketing(parseFloat(e.target.value) || 0.9926)}
                    className="w-full px-3 py-1.5 text-xs bg-bg-app border border-border/80 rounded-xl font-mono"
                  />
                  <span className="text-[10px] text-txt-muted block">Meta India Official rate: ₹0.9926 / message</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-txt-primary">Utility Message (INR)</span>
                    <strong className="text-emerald-700 font-mono">₹{priceWaUtility}</strong>
                  </div>
                  <input
                    type="number"
                    step="0.0001"
                    value={priceWaUtility}
                    onChange={(e) => setPriceWaUtility(parseFloat(e.target.value) || 0.1323)}
                    className="w-full px-3 py-1.5 text-xs bg-bg-app border border-border/80 rounded-xl font-mono"
                  />
                  <span className="text-[10px] text-txt-muted block">Meta India Official rate: ₹0.1323 / message</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-txt-primary">Monthly Safety Budget Cap (INR)</span>
                    <strong className="text-brand font-mono">₹{monthlyBudgetCapInr}</strong>
                  </div>
                  <input
                    type="number"
                    value={monthlyBudgetCapInr}
                    onChange={(e) => setMonthlyBudgetCapInr(parseFloat(e.target.value) || 10000)}
                    className="w-full px-3 py-1.5 text-xs bg-bg-app border border-border/80 rounded-xl font-mono"
                  />
                  <span className="text-[10px] text-txt-muted block">Automated circuit-breaker ceiling: ₹10,000 INR</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 6. AI INTELLIGENCE & COPYWRITING ENGINES (GROQ + GEMINI + OLLAMA)    */}
        {/* ===================================================================== */}
        {(activeTab === 'all' || activeTab === 'ai') && (
          <div className="rounded-2xl border border-border/80 shadow-2xs overflow-hidden bg-white space-y-4 pb-5">
            {/* Clean, Refined Header */}
            <div className="p-4 sm:p-5 border-b border-border/60 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-black tracking-tight text-txt-primary">
                      AI Copywriting &amp; Multi-Engine Suite
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
                      Auto-Failover Active
                    </span>
                  </div>
                  <p className="text-xs text-txt-muted mt-0.5">
                    Connect Groq Cloud LPU, Google Gemini, and local Ollama. If one engine is unavailable, generation smoothly cascades to the next.
                  </p>
                </div>
              </div>

              {/* Primary Engine Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <label className="text-xs font-bold text-txt-primary whitespace-nowrap">
                  Primary Engine:
                </label>
                <select
                  value={aiPrimaryProvider}
                  onChange={(e) => setAiPrimaryProvider(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-border/80 rounded-xl font-bold text-brand focus:outline-hidden shadow-2xs cursor-pointer"
                >
                  <option value="groq">⚡ Groq Cloud LPU (~600ms &bull; Free)</option>
                  <option value="gemini">✨ Google Gemini 2.0</option>
                  <option value="ollama">💻 Ollama Local (100% Offline)</option>
                </select>
              </div>
            </div>

            {/* 3-Column Provider Cards: Groq, Gemini, Ollama */}
            <div className="px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Groq Cloud LPU & xAI Grok */}
              <div className="rounded-xl border border-orange-200/80 bg-orange-50/20 p-4 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-orange-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl overflow-hidden shadow-2xs border border-orange-200/90 shrink-0 bg-white">
                        <GroqLogo className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-txt-primary">Groq LPU &amp; xAI Grok</h4>
                        <span className="text-[10px] text-orange-700 font-bold block leading-none">Sub-second Speed (~180ms)</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      className="text-[10px] py-0.5 px-2 h-6 min-h-0 bg-white hover:bg-orange-100 text-orange-900 border border-orange-200 shadow-2xs cursor-pointer"
                      isLoading={testStatus.groq?.loading}
                      onClick={() => runConnectionTest('groq')}
                    >
                      <Zap className="w-2.5 h-2.5 mr-1 text-orange-600" />
                      <span>Test</span>
                    </Button>
                  </div>

                  {testStatus.groq?.result && (
                    <div className="p-2 rounded-lg bg-orange-100/70 text-[11px] text-orange-950 font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1 truncate">
                        <CheckCircle2 className="w-3 h-3 text-orange-600 shrink-0" />
                        <span>{testStatus.groq.result.latency_ms}ms &bull; {testStatus.groq.result.active_model}</span>
                      </span>
                      <span className="text-[10px] font-bold text-orange-800 shrink-0">
                        {testStatus.groq.result.provider === 'xai_grok' ? 'xAI Grok' : 'Groq LPU'}
                      </span>
                    </div>
                  )}
                  {testStatus.groq?.error && (
                    <div className="p-2 rounded-lg bg-red-50 text-[11px] text-red-900 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
                      <span className="truncate">{testStatus.groq.error}</span>
                    </div>
                  )}

                  {/* Groq or xAI Grok API Key */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-txt-primary uppercase tracking-wider">
                        Groq or xAI Grok Key
                      </label>
                      <span className="text-[9px] font-semibold text-orange-800 bg-orange-100/60 px-1.5 py-0.2 rounded-md">
                        gsk_... or xai-...
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={showKey.groq ? 'text' : 'password'}
                        placeholder={settings?.has_groq_api_key ? `${settings.groq_api_key_preview} (configured)` : 'gsk_... or xai-...'}
                        value={groqApiKey}
                        onChange={(e) => setGroqApiKey(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-border/80 rounded-lg focus:border-brand focus:outline-hidden pr-8 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVisibility('groq')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary cursor-pointer p-0.5"
                      >
                        {showKey.groq ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-txt-muted">
                      Works with both Groq Cloud LPUs and xAI Grok flagship keys.
                    </p>
                  </div>

                  {/* Groq / Grok Model */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-txt-primary uppercase tracking-wider">
                      Model
                    </label>
                    <select
                      value={groqModel}
                      onChange={(e) => setGroqModel(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-border/80 rounded-lg focus:border-brand focus:outline-hidden font-semibold truncate cursor-pointer"
                    >
                      {groqSupportedModels.map((m) => (
                        <option key={m} value={m}>
                          {m} {m.startsWith('grok') ? '(xAI Grok)' : m.includes('qwen') ? '★ Active (Fast)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-orange-100 flex items-center justify-between text-[10px] text-txt-muted flex-wrap gap-1">
                  <span className="font-semibold text-emerald-700">Sub-second Speed</span>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-700 hover:underline font-bold flex items-center gap-0.5"
                    >
                      <span>groq.com</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <span>&bull;</span>
                    <a
                      href="https://console.x.ai"
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-700 hover:underline font-bold flex items-center gap-0.5"
                    >
                      <span>x.ai</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Card 2: Google Gemini */}
              <div className="rounded-xl border border-purple-200/80 bg-purple-50/20 p-4 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-purple-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl overflow-hidden shadow-2xs border border-slate-700/80 shrink-0 bg-slate-950">
                        <GeminiLogo className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-txt-primary">Google Gemini</h4>
                        <span className="text-[10px] text-purple-700 font-bold block leading-none">Multimodal Cloud</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      className="text-[10px] py-0.5 px-2 h-6 min-h-0 bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 shadow-2xs"
                      isLoading={testStatus.gemini?.loading}
                      onClick={() => runConnectionTest('gemini')}
                    >
                      <Sparkles className="w-2.5 h-2.5 mr-1 text-purple-600" />
                      <span>Test</span>
                    </Button>
                  </div>

                  {testStatus.gemini?.result && (
                    <div className="p-2 rounded-lg bg-purple-100/70 text-[11px] text-purple-950 font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1 truncate">
                        <CheckCircle2 className="w-3 h-3 text-purple-600 shrink-0" />
                        <span>{testStatus.gemini.result.model} &bull; Active</span>
                      </span>
                      <span className="text-[10px] font-bold text-purple-800 shrink-0">Verified</span>
                    </div>
                  )}
                  {testStatus.gemini?.error && (
                    <div className="p-2 rounded-lg bg-red-50 text-[11px] text-red-900 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
                      <span className="truncate">{testStatus.gemini.error}</span>
                    </div>
                  )}

                  {/* Gemini API Key */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-txt-primary uppercase tracking-wider">
                      Gemini API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showKey.gemini ? 'text' : 'password'}
                        placeholder={settings?.has_gemini_api_key ? `${settings.gemini_api_key_preview} (configured)` : 'AIzaSy...'}
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-border/80 rounded-lg focus:border-brand focus:outline-hidden pr-8 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVisibility('gemini')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary cursor-pointer p-0.5"
                      >
                        {showKey.gemini ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Gemini Model */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-txt-primary uppercase tracking-wider">
                      Model
                    </label>
                    <select
                      value={geminiModel}
                      onChange={(e) => setGeminiModel(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-border/80 rounded-lg focus:border-brand focus:outline-hidden font-semibold truncate"
                    >
                      <option value="gemini-2.0-flash">gemini-2.0-flash (Recommended)</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Lightweight)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Reasoning)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-[10px] text-txt-muted">
                  <span className="font-semibold text-purple-700">1,500 req/day free</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-700 hover:underline font-bold flex items-center gap-0.5"
                  >
                    <span>Google AI Studio</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {/* Card 3: Ollama Local Engine */}
              <div className="rounded-xl border border-slate-300/80 bg-slate-50/50 p-4 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl overflow-hidden shadow-2xs border border-slate-700/80 shrink-0 bg-slate-950">
                        <OllamaLogo className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-txt-primary">Ollama Local</h4>
                        <span className="text-[10px] text-slate-700 font-bold block leading-none">Offline Fallback</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      className="text-[10px] py-0.5 px-2 h-6 min-h-0 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs"
                      isLoading={testStatus.ollama?.loading}
                      onClick={() => runConnectionTest('ollama')}
                    >
                      <Server className="w-2.5 h-2.5 mr-1 text-slate-700" />
                      <span>Test</span>
                    </Button>
                  </div>

                  {testStatus.ollama?.result && (
                    <div className="p-2 rounded-lg bg-slate-200/80 text-[11px] text-slate-950 font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1 truncate">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{testStatus.ollama.result.active_model} &bull; Reachable</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-700 shrink-0">Offline Ready</span>
                    </div>
                  )}
                  {testStatus.ollama?.error && (
                    <div className="p-2 rounded-lg bg-amber-50 text-[11px] text-amber-900 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">{testStatus.ollama.error}</span>
                    </div>
                  )}

                  {/* Ollama Base URL */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-txt-primary uppercase tracking-wider">
                      Host Address
                    </label>
                    <input
                      type="text"
                      placeholder="http://localhost:11434"
                      value={ollamaBaseUrl}
                      onChange={(e) => setOllamaBaseUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-border/80 rounded-lg focus:border-brand focus:outline-hidden font-mono"
                    />
                  </div>

                  {/* Ollama Model */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-txt-primary uppercase tracking-wider flex items-center justify-between">
                      <span>Model</span>
                      {ollamaInstalledModels.length > 0 && (
                        <span className="text-[9px] text-emerald-700 font-bold lowercase">
                          ({ollamaInstalledModels.length} detected)
                        </span>
                      )}
                    </label>
                    {ollamaInstalledModels.length > 0 ? (
                      <select
                        value={ollamaModel}
                        onChange={(e) => setOllamaModel(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-border/80 rounded-lg focus:border-brand focus:outline-hidden font-mono font-bold truncate"
                      >
                        {ollamaInstalledModels.map((m) => (
                          <option key={m} value={m}>
                            {m} (Installed)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="e.g. gemma4:e4b, llama3.2"
                        value={ollamaModel}
                        onChange={(e) => setOllamaModel(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-border/80 rounded-lg focus:border-brand focus:outline-hidden font-mono"
                      />
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-txt-muted">
                  <span className="font-semibold text-slate-700">Zero API Keys</span>
                  <span className="font-mono text-slate-500">ollama serve</span>
                </div>
              </div>
            </div>

            {/* Bottom Controls Row: Creativity & Auto-Failover info */}
            <div className="mx-4 sm:mx-6 p-3 bg-bg-app rounded-xl border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-txt-primary flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Creativity Temperature:</span>
                </span>
                <div className="inline-flex rounded-lg border border-border/70 bg-white p-0.5 text-[11px]">
                  {[
                    { val: 0.3, label: '0.3 Precise' },
                    { val: 0.7, label: '0.7 Balanced' },
                    { val: 1.0, label: '1.0 Creative' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setGeminiTemperature(opt.val)}
                      className={`px-2 py-0.5 rounded-md font-bold cursor-pointer transition-all ${
                        geminiTemperature === opt.val
                          ? 'bg-brand text-white shadow-2xs'
                          : 'text-txt-muted hover:text-txt-primary'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-txt-muted hidden sm:inline">
                  🛡️ Cascade: <strong className="text-txt-primary">Groq → Gemini → Ollama → Smart Template</strong>
                </span>
              </div>
            </div>

            {/* Dedicated AI Chatbot Section Banner */}
            <div className="mx-4 sm:mx-6 mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-50 via-amber-50/40 to-white border border-[#E3DDCF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#F5EDE1] border border-[#E5DAC6] flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-[#CC5500]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1F1E1D] flex items-center gap-2">
                    <span>Dedicated AI Chatbot Workspace</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-soft text-brand">
                      Sidebar Section
                    </span>
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Launch the full-screen interactive chatbot with chat history, model switcher, and campaign generation.
                  </p>
                </div>
              </div>

              <Link
                href="/ai-engine"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#CC5500] hover:bg-[#B34700] text-white text-xs font-bold transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
              >
                <span>Open AI Chatbot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 7. BOTTOM SUBMIT & ENCRYPT ACTION BAR (STICKY WITH LIVE STATUS)       */}
        {/* ===================================================================== */}
        <div className="sticky bottom-4 z-40 p-4 sm:p-5 bg-white/95 backdrop-blur-md rounded-2xl border border-border shadow-lg space-y-3 transition-all">
          {/* Live Feedback Banner displayed directly above button */}
          {feedback && (
            <div
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs'
                  : 'bg-red-50 border-red-300 text-red-950 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              {isVerifying && (
                <div className="flex items-center gap-1.5 text-brand text-xs font-bold shrink-0">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand" />
                  <span>Verifying live health...</span>
                </div>
              )}
            </div>
          )}

          {/* Live Verified Channel Status Badges */}
          {(isVerifying || Object.keys(verificationResults).length > 0) && (
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-border/50">
              <span className="text-[11px] font-bold text-txt-secondary uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Live Health Status:</span>
              </span>
              {isVerifying && Object.keys(verificationResults).length === 0 && (
                <span className="text-xs text-txt-muted flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin text-brand" />
                  Pinging configured channels &amp; AI engines...
                </span>
              )}
              {Object.entries(verificationResults).map(([ch, r]) => (
                <span
                  key={ch}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-2xs ${
                    r.status === 'connected'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  {r.status === 'connected' ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                  )}
                  <span>{r.label}:</span>
                  <span className="font-normal opacity-90">{r.detail}</span>
                </span>
              ))}
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-txt-muted">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>AES-256-GCM Vault Protection:</strong> Settings encrypt on save and immediately activate across AI Chatbot &amp; Campaigns.
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                type="submit"
                isLoading={isSaving}
                disabled={isSaving || isVerifying}
                className="w-full sm:w-auto min-w-[220px] bg-brand hover:bg-brand-hover text-white shadow-md text-xs font-bold py-2.5 px-6 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                    <span>Encrypting &amp; Saving...</span>
                  </>
                ) : isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                    <span>Verifying Health...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-200" />
                    <span>Save &amp; Encrypt All Settings</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
