'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Send,
  Trash2,
  Copy,
  Check,
  Zap,
  Sparkles,
  Server,
  ShieldCheck,
  RefreshCw,
  ArrowUp,
  Compass,
  Plus,
  MessageSquare,
  Maximize2,
  Minimize2,
  PanelLeft,
  PanelLeftClose,
  Settings as SettingsIcon,
  Sliders,
  ChevronDown,
  RotateCcw,
  Edit3,
  Bot,
  Rocket,
  Mail,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { GroqLogo, GeminiLogo, OllamaLogo } from '@/components/ui/BrandIcons';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: 'groq' | 'gemini' | 'ollama' | 'smart-template-engine';
  model?: string;
  latencyMs?: number;
  timestamp: Date;
  isError?: boolean;
  note?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  category?: 'campaign' | 'general';
}

export interface AIModelOption {
  id: string;
  name: string;
  provider: 'groq' | 'gemini' | 'ollama' | 'cascade';
  badge?: string;
  description?: string;
}

export const AVAILABLE_MODELS: AIModelOption[] = [
  // Groq Models
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    provider: 'groq',
    badge: 'Fast & Smart',
    description: 'Groq Cloud LPU • High reasoning & speed (~180ms)',
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'groq',
    badge: 'Ultra Fast',
    description: 'Groq Cloud LPU • Sub-100ms ultra-low latency',
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B',
    provider: 'groq',
    badge: 'High Context',
    description: 'Groq Cloud LPU • High context limit',
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B',
    provider: 'groq',
    badge: 'Standard',
    description: 'Groq Cloud LPU • Fast lightweight',
  },
  {
    id: 'qwen/qwen3.8-27b',
    name: 'Qwen 2.5 32B',
    provider: 'groq',
    badge: 'Balanced',
    description: 'Groq Cloud LPU • Balanced quality',
  },
  {
    id: 'grok-2',
    name: 'xAI Grok 2',
    provider: 'groq',
    badge: 'xAI Grok',
    description: 'xAI Grok 2 • State-of-the-art flagship reasoning & intelligence',
  },
  {
    id: 'grok-beta',
    name: 'xAI Grok Beta',
    provider: 'groq',
    badge: 'xAI Grok',
    description: 'xAI Grok Beta • Real-time conversational intelligence & speed',
  },

  // Gemini Models
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    badge: 'Recommended',
    description: 'Google AI Studio • Next-generation multimodal speed',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    badge: 'Fast',
    description: 'Google AI Studio • Low latency general intelligence',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    badge: 'Deep Reasoning',
    description: 'Google AI Studio • Complex campaign analysis',
  },

  // Ollama Models
  {
    id: 'llama3.2',
    name: 'Ollama Llama 3.2',
    provider: 'ollama',
    badge: 'Local Engine',
    description: 'Localhost:11434 • Private & offline',
  },
  {
    id: 'mistral:latest',
    name: 'Ollama Mistral',
    provider: 'ollama',
    badge: 'Local',
    description: 'Localhost:11434 • Open weights',
  },
  {
    id: 'deepseek-r1:latest',
    name: 'Ollama DeepSeek R1',
    provider: 'ollama',
    badge: 'Local Reasoning',
    description: 'Localhost:11434 • Reasoning model',
  },

  // Auto-Cascade Engine
  {
    id: 'cascade-auto',
    name: 'Auto-Cascade Engine',
    provider: 'cascade',
    badge: 'Fault-Tolerant',
    description: 'Automatic failover: Groq ➔ Gemini ➔ Ollama',
  },
];

interface AiEngineChatbotProps {
  groqApiKey?: string;
  groqModel?: string;
  geminiApiKey?: string;
  geminiModel?: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  primaryProvider?: 'groq' | 'gemini' | 'ollama';
  temperature?: number;
  hasGroqKey?: boolean;
  hasGeminiKey?: boolean;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

/**
 * AI Bot Icon
 */
export function AiStarburstIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return <Bot className={className} />;
}

// Deprecated alias for backwards compatibility
export const ClaudeStarburstIcon = AiStarburstIcon;

/**
 * Helper to parse inline Markdown tokens (bold, italic, code, {{placeholders}}, urls, <br>)
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const tokenRegex = /(<br\s*\/?>|\*\*.*?\*\*|__.*?__|`.*?`|\{\{.*?\}\}|\*.*?\*|_.*?_|https?:\/\/[^\s<]+)/gi;
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(text.slice(lastIdx, match.index));
    }
    const token = match[0];

    if (/^<br\s*\/?>$/i.test(token)) {
      nodes.push(<br key={`br-${match.index}`} />);
    } else if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={`b-${match.index}`} className="font-bold text-[#14231C]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('__') && token.endsWith('__')) {
      nodes.push(
        <strong key={`b2-${match.index}`} className="font-bold text-[#14231C]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code
          key={`c-${match.index}`}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#E9F0E8] text-[#1E6B4F] font-mono text-[11px] font-semibold border border-[#DCE5DD]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('{{') && token.endsWith('}}')) {
      nodes.push(
        <span
          key={`tag-${match.index}`}
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md text-[11px] font-mono font-bold bg-[#E9F0E8] text-[#1E6B4F] border border-[#C9D6CB] shadow-2xs"
        >
          {token}
        </span>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(
        <em key={`i-${match.index}`} className="italic text-[#52645A]">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('_') && token.endsWith('_')) {
      nodes.push(
        <em key={`i2-${match.index}`} className="italic text-[#52645A]">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('http://') || token.startsWith('https://')) {
      nodes.push(
        <a
          key={`l-${match.index}`}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1E6B4F] hover:text-[#185A42] underline font-semibold underline-offset-2 break-all"
        >
          {token}
        </a>
      );
    } else {
      nodes.push(token);
    }

    lastIdx = tokenRegex.lastIndex;
  }

  if (lastIdx < text.length) {
    nodes.push(text.slice(lastIdx));
  }

  return nodes;
}

/**
 * High-Fidelity Rich Markdown Viewer
 * Renders headers, lists, code blocks, tables, and inline styles with zero raw asterisks.
 */
function AiMarkdownViewer({ content }: { content: string }) {
  const [copiedCodeBlock, setCopiedCodeBlock] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeBlock(idx);
    setTimeout(() => setCopiedCodeBlock(null), 2000);
  };

  // Split into code blocks and normal blocks
  const segments: { type: 'code' | 'text'; lang?: string; raw: string }[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastEnd = 0;
  let codeMatch: RegExpExecArray | null;

  while ((codeMatch = codeBlockRegex.exec(content)) !== null) {
    if (codeMatch.index > lastEnd) {
      segments.push({ type: 'text', raw: content.slice(lastEnd, codeMatch.index) });
    }
    segments.push({
      type: 'code',
      lang: codeMatch[1] || 'plaintext',
      raw: codeMatch[2].replace(/\n$/, ''),
    });
    lastEnd = codeBlockRegex.lastIndex;
  }
  if (lastEnd < content.length) {
    segments.push({ type: 'text', raw: content.slice(lastEnd) });
  }

  return (
    <div className="space-y-3 font-sans text-[13.5px] text-[#14231C] leading-relaxed select-text">
      {segments.map((segment, sIdx) => {
        if (segment.type === 'code') {
          return (
            <div
              key={`code-${sIdx}`}
              className="my-3 rounded-xl overflow-hidden border border-[#DCE5DD] bg-[#1E1E1E] text-slate-100 shadow-xs"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#2B2B2B] text-slate-300 text-[11px] font-mono border-b border-[#3B3B3B]">
                <span className="uppercase tracking-wider font-bold text-slate-400">
                  {segment.lang}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(segment.raw, sIdx)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedCodeBlock === sIdx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 text-xs font-mono overflow-x-auto leading-relaxed scrollbar-thin">
                <code>{segment.raw}</code>
              </pre>
            </div>
          );
        }

        // Parse paragraphs, headings, tables, bullet lists, ordered lists, quotes
        const rawLines = segment.raw.split('\n');
        const elements: React.ReactNode[] = [];
        let currentListItems: React.ReactNode[] = [];
        let isOrderedList = false;

        const flushList = () => {
          if (currentListItems.length > 0) {
            if (isOrderedList) {
              elements.push(
                <ol
                  key={`ol-${elements.length}`}
                  className="space-y-1.5 my-2 pl-1 list-none"
                >
                  {currentListItems}
                </ol>
              );
            } else {
              elements.push(
                <ul
                  key={`ul-${elements.length}`}
                  className="space-y-1.5 my-2 pl-1 list-none"
                >
                  {currentListItems}
                </ul>
              );
            }
            currentListItems = [];
            isOrderedList = false;
          }
        };

        for (let i = 0; i < rawLines.length; i++) {
          const line = rawLines[i];
          const trimmed = line.trim();

          if (!trimmed) {
            flushList();
            elements.push(<div key={`sp-${i}`} className="h-2" />);
            continue;
          }

          // Horizontal divider
          if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
            flushList();
            elements.push(<hr key={`hr-${i}`} className="border-[#DCE5DD] my-3" />);
            continue;
          }

          // Tables
          if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            flushList();
            const tableLines: string[] = [trimmed];
            while (
              i + 1 < rawLines.length &&
              rawLines[i + 1].trim().startsWith('|') &&
              rawLines[i + 1].trim().endsWith('|')
            ) {
              i++;
              tableLines.push(rawLines[i].trim());
            }

            const parseRow = (rowStr: string) => {
              return rowStr
                .slice(1, -1)
                .split('|')
                .map((c) => c.trim());
            };

            const headerCells = parseRow(tableLines[0]);
            const isSeparator = (str: string) => /^[:\s\-\|]+$/.test(str);
            const dataRowLines = tableLines.slice(1).filter((l) => !isSeparator(l));

            elements.push(
              <div
                key={`tbl-${i}`}
                className="my-3 overflow-x-auto rounded-xl border border-[#DCE5DD] bg-white shadow-2xs"
              >
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#E9F0E8] text-[#1E6B4F] border-b border-[#DCE5DD]">
                    <tr>
                      {headerCells.map((hc, hIdx) => (
                        <th key={`th-${hIdx}`} className="p-2.5 font-bold tracking-tight">
                          {renderInlineMarkdown(hc)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE5DD]">
                    {dataRowLines.map((dr, rIdx) => {
                      const cells = parseRow(dr);
                      return (
                        <tr key={`tr-${rIdx}`} className="hover:bg-[#F9FBF8] transition-colors">
                          {cells.map((c, cIdx) => (
                            <td key={`td-${cIdx}`} className="p-2.5 text-[#14231C] align-top">
                              {renderInlineMarkdown(c)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
            continue;
          }

          // Headers
          if (trimmed.startsWith('#### ')) {
            flushList();
            elements.push(
              <h5
                key={`h4-${i}`}
                className="font-bold text-[#14231C] text-[14px] mt-3 mb-1 tracking-tight"
              >
                {renderInlineMarkdown(trimmed.slice(5))}
              </h5>
            );
            continue;
          }
          if (trimmed.startsWith('### ')) {
            flushList();
            elements.push(
              <h4
                key={`h3-${i}`}
                className="font-bold text-[#14231C] text-[15px] mt-3.5 mb-1 tracking-tight flex items-center gap-1.5"
              >
                <span>{renderInlineMarkdown(trimmed.slice(4))}</span>
              </h4>
            );
            continue;
          }
          if (trimmed.startsWith('## ')) {
            flushList();
            elements.push(
              <h3
                key={`h2-${i}`}
                className="font-bold text-[#14231C] text-base mt-4 mb-1.5 tracking-tight"
              >
                {renderInlineMarkdown(trimmed.slice(3))}
              </h3>
            );
            continue;
          }
          if (trimmed.startsWith('# ')) {
            flushList();
            elements.push(
              <h2
                key={`h1-${i}`}
                className="font-black text-[#14231C] text-lg mt-4 mb-2 tracking-tight"
              >
                {renderInlineMarkdown(trimmed.slice(2))}
              </h2>
            );
            continue;
          }

          // Blockquotes
          if (trimmed.startsWith('> ')) {
            flushList();
            elements.push(
              <blockquote
                key={`bq-${i}`}
                className="border-l-3 border-[#1E6B4F] pl-3.5 py-1.5 my-2 bg-[#E9F0E8]/50 rounded-r-lg text-[#14231C] italic text-[13px]"
              >
                {renderInlineMarkdown(trimmed.slice(2))}
              </blockquote>
            );
            continue;
          }

          // Unordered Lists (*, -, •)
          const unorderedMatch = line.match(/^(\s*)([-*•])\s+(.+)$/);
          if (unorderedMatch) {
            if (isOrderedList) flushList();
            isOrderedList = false;
            currentListItems.push(
              <li key={`li-${i}`} className="flex items-start gap-2.5 text-[13px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E6B4F] shrink-0 mt-2" />
                <span className="flex-1 leading-relaxed">
                  {renderInlineMarkdown(unorderedMatch[3])}
                </span>
              </li>
            );
            continue;
          }

          // Ordered Lists (1., 2., etc.)
          const orderedMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
          if (orderedMatch) {
            if (!isOrderedList) flushList();
            isOrderedList = true;
            currentListItems.push(
              <li key={`oli-${i}`} className="flex items-start gap-2.5 text-[13px]">
                <span className="w-5 h-5 rounded-md bg-[#E9F0E8] text-[#1E6B4F] font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-[#DCE5DD]">
                  {orderedMatch[2]}
                </span>
                <span className="flex-1 leading-relaxed">
                  {renderInlineMarkdown(orderedMatch[3])}
                </span>
              </li>
            );
            continue;
          }

          // Regular paragraph line
          flushList();
          elements.push(
            <p key={`p-${i}`} className="my-1 leading-relaxed">
              {renderInlineMarkdown(line)}
            </p>
          );
        }

        flushList();
        return <div key={`seg-${sIdx}`}>{elements}</div>;
      })}
    </div>
  );
}

const ClaudeMarkdownViewer = AiMarkdownViewer;

/**
 * Intelligent parser that extracts multi-channel copy blocks:
 * WhatsApp, Telegram, Instagram, and Email.
 */
function parseMultiChannelCampaign(content: string): {
  isMultiChannel: boolean;
  introText: string;
  channels: {
    whatsapp?: string;
    telegram?: string;
    instagram?: string;
    email?: string;
  };
  outroText: string;
} {
  const hasWhatsApp = /(###|##)\s*(?:📱\s*)?WhatsApp/i.test(content);
  const hasTelegram = /(###|##)\s*(?:✈️\s*)?Telegram/i.test(content);
  const hasInstagram = /(###|##)\s*(?:📸\s*)?Instagram/i.test(content);
  const hasEmail = /(###|##)\s*(?:✉️\s*)?Email/i.test(content);

  const matchedChannels = [hasWhatsApp, hasTelegram, hasInstagram, hasEmail].filter(Boolean).length;
  if (matchedChannels < 2) {
    return { isMultiChannel: false, introText: content, channels: {}, outroText: '' };
  }

  const firstHeaderMatch = content.search(/(?:###|##)\s*(?:📱|✈️|📸|✉️|WhatsApp|Telegram|Instagram|Email)/i);
  const introText = firstHeaderMatch > 0 ? content.slice(0, firstHeaderMatch).trim() : '';
  const bodyToParse = firstHeaderMatch >= 0 ? content.slice(firstHeaderMatch) : content;

  const headerRegex = /(?:###|##)\s*([^\n]+)\n([\s\S]*?)(?=(?:(?:###|##)\s*[^\n]+|$))/g;
  let match: RegExpExecArray | null;
  const channelData: {
    whatsapp?: string;
    telegram?: string;
    instagram?: string;
    email?: string;
  } = {};

  while ((match = headerRegex.exec(bodyToParse)) !== null) {
    const title = match[1].trim();
    const rawSection = match[2].trim().replace(/^---+|---+$/g, '').trim();

    if (/WhatsApp/i.test(title)) {
      channelData.whatsapp = rawSection;
    } else if (/Telegram/i.test(title)) {
      channelData.telegram = rawSection;
    } else if (/Instagram/i.test(title)) {
      channelData.instagram = rawSection;
    } else if (/Email/i.test(title)) {
      channelData.email = rawSection;
    }
  }

  return {
    isMultiChannel: Object.keys(channelData).length >= 2,
    introText,
    channels: channelData,
    outroText: '',
  };
}

interface MultiChannelProps {
  channels: {
    whatsapp?: string;
    telegram?: string;
    instagram?: string;
    email?: string;
  };
  rawContent: string;
  msgId: string;
}

function CampaignMultiChannelViewer({ channels, rawContent, msgId }: MultiChannelProps) {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'telegram' | 'instagram' | 'email' | 'all'>('whatsapp');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyChannel = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  interface ChannelCardItem {
    id: 'whatsapp' | 'telegram' | 'instagram' | 'email';
    name: string;
    icon: string;
    badge: string;
    statsTip: string;
    content: string;
  }

  const rawCards: ChannelCardItem[] = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Direct',
      icon: '📱',
      badge: 'Meta Cloud API v21.0',
      statsTip: 'India Marketing rate ~₹0.9926 &bull; 20 msg/sec &bull; 98% open rate',
      content: channels.whatsapp || '',
    },
    {
      id: 'telegram',
      name: 'Telegram Broadcast',
      icon: '✈️',
      badge: 'Telegram Bot API v7.2',
      statsTip: '100% Free Lifetime API &bull; Zero Messaging Fee &bull; Pin to Channel',
      content: channels.telegram || '',
    },
    {
      id: 'instagram',
      name: 'Instagram Broadcast',
      icon: '📸',
      badge: 'Meta Graph API v21.0',
      statsTip: 'High Engagement &bull; Story & Broadcast Channel &bull; Bio link',
      content: channels.instagram || '',
    },
    {
      id: 'email',
      name: 'Email Campaign',
      icon: '✉️',
      badge: 'Resend SMTP Gateway',
      statsTip: 'SPF/DKIM Verified &bull; 100% Inboxing &bull; ₹0.08/email',
      content: channels.email || '',
    },
  ];
  const channelCards = rawCards.filter((c) => Boolean(c.content.trim()));

  const renderCard = (c: typeof channelCards[0]) => {
    const isCopied = copiedKey === c.id;

    return (
      <div
        key={c.id}
        className="rounded-2xl bg-white border border-[#DCE5DD] overflow-hidden shadow-xs hover:border-[#1E6B4F]/40 transition-all space-y-0"
      >
        {/* Card Header Bar */}
        <div className="px-3.5 py-2.5 bg-[#F4F7F3] border-b border-[#DCE5DD] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-base">{c.icon}</span>
            <div>
              <div className="font-bold text-xs text-[#14231C] flex items-center gap-1.5">
                <span>{c.name}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-white text-[#52645A] border border-[#DCE5DD]">
                  {c.badge}
                </span>
              </div>
              <p
                className="text-[10px] text-[#52645A]"
                dangerouslySetInnerHTML={{ __html: c.statsTip }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* 1-Click Copy Button for this channel */}
            <button
              type="button"
              onClick={() => handleCopyChannel(c.id, c.content)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                isCopied
                  ? 'bg-[#1E6B4F] text-white'
                  : 'bg-white hover:bg-[#E9F0E8] text-[#1E6B4F] border border-[#C9D6CB]'
              }`}
              title={`Copy clean ${c.name} text`}
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#1E6B4F]" />
                  <span>Copy {c.name.split(' ')[0]}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Channel Platform Simulation Body */}
        <div className="p-3 sm:p-4 bg-white select-text">
          {c.id === 'whatsapp' ? (
            /* Realistic WhatsApp green bubble */
            <div className="max-w-md rounded-2xl rounded-tl-sm bg-[#E9F0E8]/70 border border-[#C9D6CB] p-3 text-[12.5px] text-[#14231C] space-y-2 relative shadow-2xs">
              <AiMarkdownViewer content={c.content} />
              <div className="flex justify-end items-center gap-1 text-[10px] text-[#52645A] pt-1">
                <span>10:45 PM</span>
                <span className="text-[#1E6B4F] font-bold">✓✓</span>
              </div>
            </div>
          ) : c.id === 'telegram' ? (
            /* Telegram Post Box */
            <div className="rounded-xl bg-[#F4F7F3] border-l-4 border-sky-500 border border-[#DCE5DD] p-3 text-[12.5px] text-[#14231C] space-y-2">
              <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
                <span>📌 Pinned Channel Broadcast</span>
              </div>
              <AiMarkdownViewer content={c.content} />
            </div>
          ) : c.id === 'instagram' ? (
            /* Instagram Broadcast Card */
            <div className="rounded-2xl bg-gradient-to-br from-pink-50/50 via-purple-50/40 to-white border border-[#DCE5DD] p-3.5 text-[12.5px] text-[#14231C] space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700">
                <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                <span>Broadcast Channel Update</span>
              </div>
              <AiMarkdownViewer content={c.content} />
              <div className="flex items-center gap-2 pt-1 border-t border-purple-100 text-[11px] text-[#52645A]">
                <span>❤️ 142</span>
                <span>🍾 89</span>
                <span>🔥 210</span>
              </div>
            </div>
          ) : (
            /* Email Preview Card */
            <div className="rounded-xl border border-[#DCE5DD] bg-[#F4F7F3]/40 p-3.5 text-[12.5px] text-[#14231C] space-y-2">
              <div className="text-[10px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1 pb-1 border-b border-[#DCE5DD]">
                <span>✉️ Formatted Email Broadcast</span>
              </div>
              <AiMarkdownViewer content={c.content} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 my-2">
      {/* Channel Selector Navigation & Creator Shortcut */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-[#DCE5DD]">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          {channelCards.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveTab(c.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === c.id
                  ? 'bg-[#1E6B4F] text-white shadow-2xs'
                  : 'bg-white hover:bg-[#E9F0E8] text-[#52645A] hover:text-[#1E6B4F] border border-[#DCE5DD]'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.name.split(' ')[0]}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#1E6B4F] text-white shadow-2xs'
                : 'bg-white hover:bg-[#E9F0E8] text-[#52645A] hover:text-[#1E6B4F] border border-[#DCE5DD]'
            }`}
          >
            <span>📑</span>
            <span>All Channels</span>
          </button>
        </div>

        {/* Direct link to Launch in New Campaign */}
        <Link
          href="/campaigns/new"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E9F0E8] hover:bg-[#DCE5DD] text-[#1E6B4F] text-[11px] font-bold transition-colors border border-[#C9D6CB]"
        >
          <span>Open in Campaign Creator</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Render active tab card or all cards */}
      {activeTab === 'all' ? (
        <div className="space-y-3">
          {channelCards.map((c) => renderCard(c))}
        </div>
      ) : (
        <div>
          {channelCards.filter((c) => c.id === activeTab).map((c) => renderCard(c))}
        </div>
      )}
    </div>
  );
}

function AiAssistantMessageBody({ content, msgId }: { content: string; msgId: string }) {
  const parsed = parseMultiChannelCampaign(content);

  if (parsed.isMultiChannel) {
    return (
      <div className="space-y-2">
        {parsed.introText && (
          <AiMarkdownViewer content={parsed.introText} />
        )}
        <CampaignMultiChannelViewer
          channels={parsed.channels}
          rawContent={content}
          msgId={msgId}
        />
        {parsed.outroText && (
          <AiMarkdownViewer content={parsed.outroText} />
        )}
      </div>
    );
  }

  return <AiMarkdownViewer content={content} />;
}

/**
 * Initial AI Welcome Greeting
 */
const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    `### 👋 Hello! I'm your CampaignHub AI Co-Pilot\n\n` +
    `I have complete knowledge of **CampaignHub**, including how to create and launch multi-channel campaigns, target audience segmentation (` +
    `👑 **VIP**, ⭐ **Regulars**, 🎯 **Leads**), official Meta WhatsApp pricing, and outreach strategy.\n\n` +
    `**What would you like help with today?**\n` +
    `• Ask me step-by-step guidance on creating a campaign\n` +
    `• Draft high-converting invitations for WhatsApp, Email, or Telegram\n` +
    `• Benchmark sub-second inference speeds across Groq LPU, Gemini, and Ollama`,
  provider: 'groq',
  model: 'qwen/qwen3.8-27b',
  latencyMs: 140,
  timestamp: new Date(),
};

/**
 * Main AiEngineChatbot Component (Dedicated AI Workspace Experience)
 */
export function AiEngineChatbot({
  groqApiKey = '',
  groqModel = 'llama-3.3-70b-versatile',
  geminiApiKey = '',
  geminiModel = 'gemini-2.0-flash',
  ollamaBaseUrl = 'http://localhost:11434',
  ollamaModel = 'llama3.2',
  primaryProvider = 'groq',
  temperature = 0.7,
  hasGroqKey = false,
  hasGeminiKey = false,
  isFullScreen = false,
  onToggleFullScreen,
}: AiEngineChatbotProps) {
  const [selectedEngine, setSelectedEngine] = useState<'groq' | 'gemini' | 'ollama' | 'cascade'>(
    primaryProvider || 'groq'
  );
  const [selectedModelId, setSelectedModelId] = useState<string>(
    groqModel || 'llama-3.3-70b-versatile'
  );
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [channelFormat, setChannelFormat] = useState<
    'general' | 'whatsapp' | 'email' | 'telegram' | 'instagram'
  >('general');
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLeftBarOpen, setIsLeftBarOpen] = useState(true);

  // Rename session state
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Chat Sessions History (Categorized into Campaign Drafts and General Chats)
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'session-campaign-1',
      category: 'campaign',
      title: 'VIP Gala Multi-Channel Draft',
      messages: [
        {
          id: 'user-vip',
          role: 'user',
          content: 'Create a campaign for Friday Night VIP Gala with bottle service and RSVP passes',
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: 'asst-vip',
          role: 'assistant',
          content: `### 📱 WhatsApp Message
👑 *EXCLUSIVE VIP INVITATION: Friday Night VIP Gala*

Hi {{first_name}}! 🌟 You are officially invited to the most anticipated weekend celebration at Club Matrix!

✨ *VIP Hospitality Privileges:*
• Express VIP queue bypass & red carpet access
• Reserved table bottle service & premium host
• Complimentary welcome cocktail before 11 PM

🎟️ *Confirm Your Spot & Guestlist:*
👉 {{link}}

_Allocations are strictly limited for table patrons. Please RSVP early!_

---

### ✈️ Telegram Channel Post
⚡ **ANNOUNCEMENT: FRIDAY NIGHT VIP GALA**

Hey community! 🚀 Official guestlist access for **Friday Night VIP Gala** is now open!

📅 **Event Details:**
• Doors open 9:00 PM onwards &bull; Main Floor
• Live performance & guest DJ sets
• Dedicated VIP lounge & priority concierge

🔗 **RSVP & Access Passes:** {{link}}

*📌 Pinning this post for quick access. Tables are strictly first-come, first-served!*

---

### 📸 Instagram Broadcast Channel
Hey fam! 🌟 Weekend plans just dropped!

We are hosting the **Friday Night VIP Gala** and guestlist spots just went live! 🍸🎶

Drop a 🍾 in the reactions or tap the link in our bio/story to get on the priority guestlist before allocations close!

🔗 RSVP Link: {{link}}

#CampaignHub #Nightlife #VIPExperience #VIPGala #WeekendVibes

---

### ✉️ Email Campaign
- **Subject:** You're Invited: Friday Night VIP Gala (Exclusive VIP Access)
- **Preview Text:** Claim your exclusive VIP pass for Friday Night VIP Gala before public release.
- **Email Body:**
Hi {{name}},

We are thrilled to formally invite you to the **Friday Night VIP Gala**. Everything has been curated for an extraordinary night of celebration, music, and luxury hospitality.

**Event Highlights:**
• Exclusive VIP express entry bypass
• Curated table and bottle hospitality
• Complimentary welcome cocktail

**Confirm Your Attendance:**
👉 [Confirm RSVP Here]({{link}})

We look forward to hosting you!

Warm regards,  
The CampaignHub Team`,
          provider: 'groq',
          model: 'llama-3.3-70b-versatile',
          latencyMs: 180,
          timestamp: new Date(Date.now() - 3600000),
        },
      ],
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: 'session-general-1',
      category: 'general',
      title: 'Explain step-by-step how to crea...',
      messages: [
        {
          id: 'gen-q',
          role: 'user',
          content: 'Explain step-by-step how to create and launch a new campaign in CampaignHub.',
          timestamp: new Date(Date.now() - 7200000),
        },
        {
          id: 'gen-a',
          role: 'assistant',
          content: `### 🚀 Step-by-Step Campaign Creation Guide in CampaignHub

Creating and deploying a multi-channel campaign in CampaignHub is built to be fast, automated, and reliable:

#### 1. Navigate to Campaign Creator
Open **/campaigns/new** from the left navigation or click the **+ New Campaign** button in the top navigation bar.

#### 2. Define Campaign Details
- **Title**: Enter a descriptive campaign name (e.g., *Exclusive VIP Gala Night*).
- **Category**: Select the event type (*Nightlife*, *Festive*, *Celebration*, *Product Drop*).
- **Delivery Timing**: Choose **Send Immediately** or **Schedule for Later** with date and time.
- **Target Audience**: Select **All Contacts** or filter by Audience Tiers (👑 *VIP*, ⭐ *Regulars*, 🎯 *Leads*).

#### 3. Content Customization (per channel)
| Channel | What to configure | Example placeholders |
|---|---|---|
| **WhatsApp** | • Write copy or pick a Meta-approved template.<br>• Add a **Flyer Image URL**.<br>• Add **RSVP action buttons**.<br>• Insert dynamic tags like \`{{first_name}}\` and \`{{link}}\`. | \`Hey {{first_name}}! 🍾 Join us...\` |
| **Email** | • **Subject line** (max 78 chars).<br>• Rich HTML body.<br>• Use \`{{name}}\` and \`{{link}}\`. | \`Subject: {{first_name}}, your VIP invite awaits!\` |
| **Telegram** | • Bot announcement text.<br>• Header graphic URL.<br>• Toggle **Pin to Channel**. | \`⚡ New event alert for our community! {{link}}\` |
| **Instagram** | • Broadcast channel caption.<br>• Engaging hook & 3-5 hashtags. | \`🌟 Weekend plans dropped! Tap link to RSVP: {{link}}\` |

#### 4. Launch & Background Worker
Review the recipient count and Meta fee estimate, then click **Launch Campaign**. The 24/7 background worker immediately handles dispatch with rate limits and delivery telemetry in **/campaigns/[id]**!`,
          provider: 'groq',
          model: 'llama-3.3-70b-versatile',
          latencyMs: 165,
          timestamp: new Date(Date.now() - 7200000),
        },
      ],
      createdAt: new Date(Date.now() - 7200000),
    },
    {
      id: 'session-new',
      category: 'general',
      title: 'New chat',
      messages: [],
      createdAt: new Date(),
    },
  ]);

  const [activeSessionId, setActiveSessionId] = useState<string>('session-campaign-1');

  // Load saved state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedModel = localStorage.getItem('campaignhub_active_model_id');
      const savedEngine = localStorage.getItem('campaignhub_active_engine') as any;
      if (savedModel) setSelectedModelId(savedModel);
      if (savedEngine) setSelectedEngine(savedEngine);

      const savedSessions = localStorage.getItem('campaignhub_ai_sessions_v5');
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(
            parsed.map((s: any) => ({
              ...s,
              category: s.category || (/campaign|vip|invite|draft|gala/i.test(s.title) ? 'campaign' : 'general'),
              createdAt: new Date(s.createdAt),
              messages: (s.messages || []).map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp),
              })),
            }))
          );
          const savedActiveId = localStorage.getItem('campaignhub_active_session_id_v5');
          if (savedActiveId && parsed.some((p: any) => p.id === savedActiveId)) {
            setActiveSessionId(savedActiveId);
          }
        }
      }
    } catch (e) {
      console.warn('Could not load AI sessions from localStorage:', e);
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('campaignhub_ai_sessions_v5', JSON.stringify(sessions));
      localStorage.setItem('campaignhub_active_session_id_v5', activeSessionId);
    } catch (e) {
      console.warn('Could not save AI sessions to localStorage:', e);
    }
  }, [sessions, activeSessionId]);

  const currentSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  const currentModelOption =
    AVAILABLE_MODELS.find((m) => m.id === selectedModelId) ||
    AVAILABLE_MODELS.find((m) => m.provider === selectedEngine) ||
    AVAILABLE_MODELS[0];

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  // Campaign specific starter prompt cards
  const campaignStarterPrompts = [
    {
      label: '👑 VIP Gala Invite',
      title: 'VIP Gala Invite',
      desc: 'High-converting copy with RSVP link and bottle service perks',
      text: 'Create a campaign for Friday Night VIP Gala with bottle service and RSVP passes',
    },
    {
      label: '🍾 Nightlife Party Drop',
      title: 'Nightlife Party Drop',
      desc: 'Guestlist tickets, headline DJs, and nightlife broadcast',
      text: 'Create a campaign for Weekend Nightclub Blast with DJ lineup and guestlist RSVP',
    },
    {
      label: '💥 Festive Flash Promo',
      title: 'Festive Flash Promo',
      desc: 'Early bird ticket release with countdown timer hook',
      text: 'Create a campaign for Diwali Festive Celebration with early-bird RSVP discounts',
    },
    {
      label: '🚀 Product Launch Announcement',
      title: 'Product Launch',
      desc: 'Exclusive member reveal with dynamic link and beta access',
      text: 'Create a multi-channel campaign announcing an exclusive product release',
    },
  ];

  // General help starter prompt cards
  const generalStarterPrompts = [
    {
      label: '🚀 How to create a campaign?',
      title: 'Create a Campaign Step-by-Step',
      desc: 'Full walkthrough from /campaigns/new to background dispatch',
      text: 'Explain step-by-step how to create and launch a new campaign in CampaignHub.',
    },
    {
      label: '💰 Meta WhatsApp Pricing',
      title: 'Explain WhatsApp Meta Rates',
      desc: 'Official India rates (Marketing vs Utility) & spend tracking',
      text: 'What are the exact WhatsApp Meta API rates in India and how does CampaignHub track expenditure?',
    },
    {
      label: '👥 Audience Segmentation',
      title: 'Audience Tiers & CRM Guide',
      desc: 'Difference between VIP, Regulars, and Leads in CRM',
      text: 'Explain the difference between VIP, Regulars, and Leads in CampaignHub Contacts CRM.',
    },
    {
      label: '⚡ Multi-AI Engine Suite',
      title: 'Compare Groq, Gemini & Ollama',
      desc: 'Speed and model selection guidelines',
      text: 'How do the different AI engines (Groq LPU, Gemini 2.0 Flash, Ollama) compare in CampaignHub?',
    },
  ];

  const handleSelectModel = (model: AIModelOption) => {
    setSelectedModelId(model.id);
    setSelectedEngine(model.provider);
    setIsModelDropdownOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('campaignhub_active_model_id', model.id);
      localStorage.setItem('campaignhub_active_engine', model.provider);
    }
  };

  const handleSaveEditTitle = (sessionId: string) => {
    if (!editingTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: editingTitle.trim() } : s))
    );
    setEditingSessionId(null);
  };

  const handleStartNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      category: 'general',
      title: 'New chat',
      messages: [],
      createdAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setInputPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleStartNewCampaignDraft = (templatePrompt?: string) => {
    const newId = `campaign-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      category: 'campaign',
      title: 'New Campaign Draft',
      messages: [],
      createdAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setInputPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (templatePrompt) {
      setTimeout(() => {
        handleSendMessage(templatePrompt);
      }, 60);
    }
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      // Don't delete last, just reset it
      setSessions([
        {
          id: 'session-default',
          category: 'general',
          title: 'New chat',
          messages: [],
          createdAt: new Date(),
        },
      ]);
      setActiveSessionId('session-default');
      return;
    }

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter((s) => s.id !== sessionId);
      setActiveSessionId(remaining[0].id);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [], title: s.category === 'campaign' ? 'New Campaign Draft' : 'New chat' } : s))
    );
    setInputPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isGenerating) return;

    const userMsgId = `user-${Date.now()}`;
    const updatedMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: text,
        timestamp: new Date(),
      },
    ];

    const isCampaignQuery = /campaign|create|draft|invite|invitation|launch|event|gala|party|promo|blast|announcement|drop/i.test(text);

    // Update session title & category dynamically if it's the first query
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const newTitle =
            s.title === 'New chat' || s.title === 'New Campaign Draft' || s.title === 'New Conversation' || s.messages.length === 0
              ? text.slice(0, 32) + (text.length > 32 ? '...' : '')
              : s.title;
          const assignedCategory = s.category || (isCampaignQuery ? 'campaign' : 'general');
          return {
            ...s,
            category: assignedCategory,
            title: newTitle,
            messages: updatedMessages,
          };
        }
        return s;
      })
    );

    setInputPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsGenerating(true);

    const startCallTime = Date.now();

    try {
      const isMaskedOrEmpty = (k?: string) => !k || k.includes('•') || k.includes('*') || k.trim().length < 5;
      const overrideKey =
        selectedEngine === 'groq'
          ? (!isMaskedOrEmpty(groqApiKey) ? groqApiKey.trim() : undefined)
          : selectedEngine === 'gemini'
            ? (!isMaskedOrEmpty(geminiApiKey) ? geminiApiKey.trim() : undefined)
            : undefined;

      const overrideMod =
        selectedEngine === 'cascade'
          ? undefined
          : selectedModelId;

      const conversationHistory = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          messages: conversationHistory,
          channel: channelFormat,
          temperature,
          forceProvider: selectedEngine === 'cascade' ? undefined : selectedEngine,
          strictProvider: selectedEngine !== 'cascade',
          overrideApiKey: overrideKey,
          overrideModel: overrideMod,
        }),
      });

      const data = await res.json();
      const elapsedMs = Date.now() - startCallTime;

      if (res.ok && data.success) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.text,
          provider: data.providerUsed,
          model: data.modelUsed,
          latencyMs: data.latencyMs || elapsedMs,
          timestamp: new Date(),
          note: data.note,
        };

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: [...s.messages, assistantMsg],
              };
            }
            return s;
          })
        );
      } else {
        const errorMsg = data.error || `HTTP ${res.status}: Failed to generate response`;
        let guidance = '';
        if (selectedEngine === 'gemini') {
          guidance = 'Please verify your Google AI Studio Gemini API Key in Settings.';
        } else if (selectedEngine === 'groq') {
          guidance = 'Please verify your Groq API Key (gsk_...) in Settings.';
        } else if (selectedEngine === 'ollama') {
          guidance = 'Make sure local Ollama is running (`ollama serve`) or use Groq Cloud.';
        }

        const errorBubble: ChatMessage = {
          id: `assistant-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **${errorMsg}**\n\n${guidance ? `*${guidance}*` : ''}`,
          provider: selectedEngine === 'cascade' ? 'smart-template-engine' : selectedEngine,
          model: 'Error Diagnostics',
          latencyMs: elapsedMs,
          timestamp: new Date(),
          isError: true,
        };

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: [...s.messages, errorBubble],
              };
            }
            return s;
          })
        );
      }
    } catch (err: any) {
      const errBubble: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Connection Failure:** ${err.message || 'Unable to connect to AI server'}`,
        provider: selectedEngine === 'cascade' ? 'smart-template-engine' : selectedEngine,
        model: 'Connection Error',
        latencyMs: Date.now() - startCallTime,
        timestamp: new Date(),
        isError: true,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, errBubble],
            };
          }
          return s;
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderInputCapsule = (isCentered = false) => (
    <div className={`w-full ${isCentered ? 'max-w-xl mx-auto' : 'max-w-2xl mx-auto'}`}>
      <div
        className={`rounded-2xl border border-[#DCE5DD] bg-white shadow-xs hover:border-[#1E6B4F]/40 focus-within:border-[#1E6B4F] focus-within:ring-2 focus-within:ring-[#1E6B4F]/15 transition-all ${
          isCentered ? 'p-3.5 pb-2.5 shadow-sm' : 'px-3 pt-2 pb-1.5'
        }`}
      >
        {/* Multi-line auto-resizing Textarea */}
        <textarea
          ref={textareaRef}
          rows={isCentered ? 2 : 1}
          value={inputPrompt}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          disabled={isGenerating}
          placeholder={isCentered ? 'How can I help you today?...' : 'Write a message...'}
          className={`w-full bg-transparent text-[13px] text-[#14231C] placeholder:text-[#52645A]/60 font-sans outline-none resize-none leading-normal ${
            isCentered ? 'min-h-[48px] max-h-[180px]' : 'min-h-[26px] max-h-[140px]'
          }`}
        />

        {/* Bottom Inner Toolbar: Only Send Button on the Right */}
        <div className="mt-1 flex items-center justify-end">
          {/* CampaignHub Brand Green Circular Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputPrompt.trim() || isGenerating}
            className={`${
              isCentered ? 'w-7 h-7' : 'w-6 h-6'
            } rounded-full bg-[#1E6B4F] hover:bg-[#185A42] text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xs cursor-pointer shrink-0`}
            title="Send message"
          >
            {isGenerating ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <ArrowUp className={`${isCentered ? 'w-3.5 h-3.5' : 'w-3 h-3'} stroke-[2.5]`} />
            )}
          </button>
        </div>
      </div>

      {/* Minimal disclaimer below input */}
      <p className="text-[10px] text-[#52645A]/70 text-center mt-1">
        CampaignHub AI can make mistakes. Please double-check responses.
      </p>
    </div>
  );

  const containerClasses = isFullScreen
    ? 'fixed inset-0 z-50 bg-[#F4F7F3] flex flex-row font-sans text-[#14231C] overflow-hidden'
    : 'w-full h-full bg-[#F4F7F3] flex flex-row font-sans text-[#14231C] overflow-hidden';

  return (
    <div className={containerClasses}>
      {/* ===================================================================== */}
      {/* 1. LEFT SIDEBAR / DRAWER (Chat History, New Chat)                     */}
      {/* ===================================================================== */}
      <div
        className={`${
          isLeftBarOpen ? 'w-56 sm:w-60 flex' : 'hidden'
        } flex-col border-r border-[#DCE5DD] bg-white shrink-0 h-full transition-all select-none overflow-hidden`}
      >
        {/* Brand / Title Header */}
        <div className="px-3 py-2.5 border-b border-[#DCE5DD] bg-white flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <Bot className="w-4 h-4 text-[#1E6B4F] shrink-0" />
            <span className="text-xs font-bold text-[#14231C] tracking-tight">AI Chatbot</span>
          </div>

          <button
            type="button"
            onClick={() => setIsLeftBarOpen(false)}
            title="Collapse Sidebar"
            className="p-1 text-[#52645A] hover:text-[#14231C] rounded-md transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sidebar Actions & Presets */}
        <div className="p-2 space-y-1.5 border-b border-[#DCE5DD]">
          {/* Primary: New Campaign Draft */}
          <button
            type="button"
            onClick={() => handleStartNewCampaignDraft()}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-[#1E6B4F] text-white hover:bg-[#185A42] text-xs font-bold transition-all shadow-xs cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Rocket className="w-3.5 h-3.5 text-white shrink-0" />
              <span>New Campaign</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-white font-mono font-bold">
              +
            </span>
          </button>

          {/* Secondary: New General Chat */}
          <button
            type="button"
            onClick={handleStartNewChat}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#E9F0E8] text-xs font-medium text-[#14231C] transition-colors cursor-pointer group"
          >
            <div className="w-4 h-4 rounded bg-[#E9F0E8] group-hover:bg-[#DCE5DD] flex items-center justify-center text-[#1E6B4F] shrink-0">
              <Plus className="w-3 h-3" />
            </div>
            <span>New general chat</span>
          </button>

          {/* Quick Campaign Template Chips */}
          <div className="pt-1 flex flex-wrap gap-1">
            {[
              { label: '👑 VIP Gala', text: 'Create a campaign for Friday Night VIP Gala with bottle service and RSVP passes' },
              { label: '🍾 Nightlife', text: 'Create a campaign for Weekend Nightclub Blast with DJ lineup and guestlist RSVP' },
              { label: '💥 Festive', text: 'Create a campaign for Diwali Festive Celebration with early-bird RSVP discounts' },
              { label: '🚀 Launch', text: 'Create a multi-channel campaign announcing an exclusive product release' },
            ].map((preset, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => handleStartNewCampaignDraft(preset.text)}
                className="text-[9.5px] font-medium px-1.5 py-0.5 rounded bg-[#F4F7F3] hover:bg-[#E9F0E8] hover:text-[#1E6B4F] text-[#52645A] border border-[#DCE5DD] transition-all cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categorized Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-2 scrollbar-thin">
          {/* SECTION 1: CAMPAIGN DRAFTS */}
          <div>
            <div className="flex items-center justify-between px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#1E6B4F]">
              <div className="flex items-center gap-1">
                <Rocket className="w-3 h-3 text-[#1E6B4F]" />
                <span>Campaign Drafts</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-[#E9F0E8] text-[#1E6B4F] font-mono text-[9px] font-bold">
                {sessions.filter((s) => s.category === 'campaign').length}
              </span>
            </div>

            <div className="space-y-0.5">
              {sessions.filter((s) => s.category === 'campaign').length === 0 ? (
                <button
                  type="button"
                  onClick={() => handleStartNewCampaignDraft()}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-[11px] text-[#52645A] hover:text-[#1E6B4F] hover:bg-[#E9F0E8] transition-colors cursor-pointer border border-dashed border-[#DCE5DD] text-center my-0.5"
                >
                  + Create first campaign
                </button>
              ) : (
                sessions
                  .filter((s) => s.category === 'campaign')
                  .map((s) => {
                    const isActive = s.id === activeSessionId;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setActiveSessionId(s.id)}
                        className={`group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-[#E9F0E8] text-[#1E6B4F] font-semibold border-l-2 border-[#1E6B4F]'
                            : 'text-[#52645A] hover:text-[#14231C] hover:bg-[#F4F7F3] font-normal'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                          <Rocket
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? 'text-[#1E6B4F]' : 'text-[#52645A]/70 group-hover:text-[#14231C]'
                            }`}
                          />
                          {editingSessionId === s.id ? (
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onBlur={() => handleSaveEditTitle(s.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditTitle(s.id);
                                if (e.key === 'Escape') setEditingSessionId(null);
                              }}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              className="w-full bg-white text-xs px-1.5 py-0.5 rounded border border-[#1E6B4F] outline-none text-[#14231C]"
                            />
                          ) : (
                            <span
                              className="truncate"
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingSessionId(s.id);
                                setEditingTitle(s.title);
                              }}
                            >
                              {s.title}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSessionId(s.id);
                              setEditingTitle(s.title);
                            }}
                            title="Rename"
                            className="p-1 text-[#52645A] hover:text-[#14231C] rounded transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSession(e, s.id)}
                            title="Delete"
                            className="p-1 text-[#52645A] hover:text-red-600 rounded transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* SECTION 2: RECENT CHATS */}
          <div className="pt-1">
            <div className="flex items-center justify-between px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#52645A]">
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-[#52645A]" />
                <span>Recent Chats</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-[#F4F7F3] text-[#52645A] font-mono text-[9px] border border-[#DCE5DD]">
                {sessions.filter((s) => s.category !== 'campaign').length}
              </span>
            </div>

            <div className="space-y-0.5">
              {sessions
                .filter((s) => s.category !== 'campaign')
                .map((s) => {
                  const isActive = s.id === activeSessionId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setActiveSessionId(s.id)}
                      className={`group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-[#E9F0E8] text-[#1E6B4F] font-semibold border-l-2 border-[#1E6B4F]'
                          : 'text-[#52645A] hover:text-[#14231C] hover:bg-[#F4F7F3] font-normal'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                        <MessageSquare
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive ? 'text-[#1E6B4F]' : 'text-[#52645A]/70 group-hover:text-[#14231C]'
                          }`}
                        />
                        {editingSessionId === s.id ? (
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={() => handleSaveEditTitle(s.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEditTitle(s.id);
                              if (e.key === 'Escape') setEditingSessionId(null);
                            }}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-white text-xs px-1.5 py-0.5 rounded border border-[#1E6B4F] outline-none text-[#14231C]"
                          />
                        ) : (
                          <span
                            className="truncate"
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setEditingSessionId(s.id);
                              setEditingTitle(s.title);
                            }}
                          >
                            {s.title}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSessionId(s.id);
                            setEditingTitle(s.title);
                          }}
                          title="Rename"
                          className="p-1 text-[#52645A] hover:text-[#14231C] rounded transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(e, s.id)}
                          title="Delete"
                          className="p-1 text-[#52645A] hover:text-red-600 rounded transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Minimal Footer Status in Left Sidebar */}
        <div className="px-3 py-2 border-t border-[#DCE5DD] bg-white text-[10px] text-[#52645A] flex items-center justify-between">
          <span>AI Engine</span>
          <span className="text-[#1E6B4F] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E6B4F] inline-block" />
            Ready
          </span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. MAIN CONVERSATION CANVAS (Narrow, Minimalist, Claude Style)        */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#F4F7F3]">
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-2 bg-white border-b border-[#DCE5DD] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {!isLeftBarOpen && (
              <button
                type="button"
                onClick={() => setIsLeftBarOpen(true)}
                title="Open Chat History Sidebar"
                className="p-1.5 text-[#52645A] hover:text-[#14231C] hover:bg-[#E9F0E8] rounded-lg transition-colors cursor-pointer mr-1"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            <h3 className="text-xs sm:text-sm font-bold tracking-tight text-[#14231C] truncate">
              {currentSession?.title || 'AI Chatbot'}
            </h3>
          </div>

          {/* Right Header Actions: Interactive Model Switcher, Reset, Fullscreen */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Interactive Model Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4F7F3] hover:bg-[#E9F0E8] text-[#14231C] text-xs font-semibold border border-[#DCE5DD] transition-all cursor-pointer"
              >
                <span className="text-[#1E6B4F]">⚡</span>
                <span className="truncate max-w-[120px] sm:max-w-[160px]">
                  {currentModelOption?.name || selectedModelId}
                </span>
                <ChevronDown className="w-3 h-3 text-[#52645A]" />
              </button>

              {/* Model Dropdown Menu */}
              {isModelDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsModelDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-white rounded-2xl border border-[#DCE5DD] shadow-xl p-2 z-50 text-xs space-y-1 max-h-[420px] overflow-y-auto">
                    <span className="px-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-[#52645A] block">
                      Select AI Model
                    </span>

                    {/* Groq LPU Models */}
                    <div className="pt-1 pb-0.5 px-2 text-[10px] font-bold text-[#1E6B4F] uppercase tracking-wider flex items-center gap-1">
                      <span>⚡ Groq Cloud LPU (Ultra Fast)</span>
                    </div>
                    {AVAILABLE_MODELS.filter((m) => m.provider === 'groq').map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectModel(m)}
                        className={`w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                          selectedModelId === m.id
                            ? 'bg-[#E9F0E8] text-[#1E6B4F] font-bold border border-[#C9D6CB]'
                            : 'hover:bg-[#F4F7F3] text-[#14231C]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-xs truncate">{m.name}</div>
                          <div className="text-[10px] text-[#52645A] truncate">{m.description}</div>
                        </div>
                        {m.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white border border-[#DCE5DD] text-[#1E6B4F] font-bold shrink-0">
                            {m.badge}
                          </span>
                        )}
                      </button>
                    ))}

                    {/* Gemini Models */}
                    <div className="pt-2 pb-0.5 px-2 text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                      <span>✨ Google Gemini (Google AI Studio)</span>
                    </div>
                    {AVAILABLE_MODELS.filter((m) => m.provider === 'gemini').map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectModel(m)}
                        className={`w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                          selectedModelId === m.id
                            ? 'bg-purple-50 text-purple-800 font-bold border border-purple-200'
                            : 'hover:bg-[#F4F7F3] text-[#14231C]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-xs truncate">{m.name}</div>
                          <div className="text-[10px] text-[#52645A] truncate">{m.description}</div>
                        </div>
                        {m.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white border border-purple-200 text-purple-700 font-bold shrink-0">
                            {m.badge}
                          </span>
                        )}
                      </button>
                    ))}

                    {/* Ollama Models */}
                    <div className="pt-2 pb-0.5 px-2 text-[10px] font-bold text-[#14231C] uppercase tracking-wider flex items-center gap-1">
                      <span>🦙 Ollama (Local &amp; Open Weights)</span>
                    </div>
                    {AVAILABLE_MODELS.filter((m) => m.provider === 'ollama').map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectModel(m)}
                        className={`w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                          selectedModelId === m.id
                            ? 'bg-[#E9F0E8] text-[#1E6B4F] font-bold border border-[#C9D6CB]'
                            : 'hover:bg-[#F4F7F3] text-[#14231C]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-xs truncate">{m.name}</div>
                          <div className="text-[10px] text-[#52645A] truncate">{m.description}</div>
                        </div>
                        {m.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white border border-[#DCE5DD] text-[#14231C] font-bold shrink-0">
                            {m.badge}
                          </span>
                        )}
                      </button>
                    ))}

                    {/* Auto-Cascade */}
                    <div className="pt-2 pb-0.5 px-2 text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                      <span>🛡️ Fault-Tolerant Cascade</span>
                    </div>
                    {AVAILABLE_MODELS.filter((m) => m.provider === 'cascade').map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectModel(m)}
                        className={`w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                          selectedEngine === 'cascade'
                            ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                            : 'hover:bg-[#F4F7F3] text-[#14231C]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-xs truncate">{m.name}</div>
                          <div className="text-[10px] text-[#52645A] truncate">{m.description}</div>
                        </div>
                        {m.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white border border-emerald-200 text-emerald-800 font-bold shrink-0">
                            {m.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Clear conversation */}
            <button
              type="button"
              onClick={handleClearChat}
              title="Reset conversation"
              className="p-1.5 text-[#52645A] hover:text-[#14231C] hover:bg-[#E9F0E8] rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen toggle button */}
            {onToggleFullScreen && (
              <button
                type="button"
                onClick={onToggleFullScreen}
                title={isFullScreen ? 'Exit Full Screen' : 'Toggle Full Screen'}
                className="p-1.5 text-[#52645A] hover:text-[#14231C] hover:bg-[#E9F0E8] rounded-md transition-colors cursor-pointer"
              >
                {isFullScreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {messages.length === 0 ? (
          /* ===================================================================== */
          /* NEW CHAT SCREEN (Centered in the middle of viewport, CampaignHub)     */
          /* ===================================================================== */
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-xl mx-auto w-full text-center my-auto">
            {/* Icon Badge */}
            <div className="w-12 h-12 rounded-2xl bg-[#E9F0E8] border border-[#DCE5DD] text-[#1E6B4F] flex items-center justify-center mx-auto mb-4 shadow-xs">
              {currentSession?.category === 'campaign' ? (
                <Rocket className="w-6 h-6 text-[#1E6B4F]" />
              ) : (
                <Bot className="w-6 h-6 text-[#1E6B4F]" />
              )}
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl font-sans font-bold text-[#14231C] tracking-tight mb-2">
              {currentSession?.category === 'campaign'
                ? 'Campaign Copy & Strategy Creator'
                : 'How can I help you today?'}
            </h1>
            <p className="text-xs sm:text-sm text-[#52645A] max-w-md mx-auto mb-5 leading-relaxed">
              {currentSession?.category === 'campaign'
                ? 'Describe your event, party, launch, or promotion to generate tailored, copy-paste-ready copy for WhatsApp, Telegram, Instagram, and Email.'
                : 'Ask anything about CampaignHub campaign workflows, audience tiers, WhatsApp messaging, or delivery strategy.'}
            </p>

            {/* Centered Input Capsule */}
            <div className="w-full mb-4">
              {renderInputCapsule(true)}
            </div>

            {/* Starter Suggestion Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
              {(currentSession?.category === 'campaign' ? campaignStarterPrompts : generalStarterPrompts).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleSendMessage(p.text)}
                  className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white hover:bg-[#E9F0E8] hover:text-[#1E6B4F] text-[#52645A] border border-[#DCE5DD] transition-all cursor-pointer shadow-xs hover:border-[#1E6B4F]/40"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ===================================================================== */
          /* ACTIVE CONVERSATION MODE (Spacious Chat Feed + Bottom Input Capsule)  */
          /* ===================================================================== */
          <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 bg-[#F4F7F3] scroll-smooth"
            >
              <div className="max-w-2xl mx-auto space-y-4">
                {/* Conversation Messages */}
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';

                  if (isUser) {
                    return (
                      <div key={msg.id} className="flex justify-end">
                        <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 bg-[#1E6B4F] text-white text-[13px] font-medium leading-relaxed shadow-xs">
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className="flex items-start gap-3">
                      {/* AI Assistant Avatar Badge */}
                      <div className="w-7 h-7 rounded-lg bg-[#E9F0E8] border border-[#DCE5DD] text-[#1E6B4F] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Bot className="w-4 h-4 text-[#1E6B4F]" />
                      </div>

                      {/* Assistant Response Body */}
                      <div className="flex-1 min-w-0">
                        {/* Assistant Metadata Row */}
                        <div className="flex items-center justify-between gap-2 pb-1 mb-1.5 border-b border-[#DCE5DD] text-[11px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[#14231C]">AI Assistant</span>
                            <span className="text-[#52645A]/50">&bull;</span>
                            <span className="text-[#52645A] font-medium">
                              {msg.provider === 'groq'
                                ? 'Groq LPU'
                                : msg.provider === 'gemini'
                                  ? 'Google Gemini'
                                  : msg.provider === 'ollama'
                                    ? 'Ollama'
                                    : 'CampaignHub'}
                            </span>
                            {msg.model && (
                              <span className="px-1.5 py-0.2 rounded bg-[#E9F0E8] text-[#1E6B4F] font-mono text-[9px] font-bold border border-[#DCE5DD]">
                                {msg.model}
                              </span>
                            )}
                            {msg.latencyMs !== undefined && (
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold flex items-center gap-0.5 ${
                                  msg.latencyMs < 700
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : msg.latencyMs < 2000
                                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                      : 'bg-stone-100 text-stone-700'
                                }`}
                              >
                                <Zap className="w-2.5 h-2.5" />
                                <span>{msg.latencyMs}ms</span>
                              </span>
                            )}
                          </div>

                          {/* 1-Click Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[#52645A] hover:text-[#14231C] hover:bg-[#E9F0E8] transition-colors cursor-pointer text-xs font-semibold"
                            title="Copy to clipboard"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-[#1E6B4F]" />
                                <span className="text-[#1E6B4F] font-bold text-[10px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[10px]">Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Rendered Markdown Body with Multi-Channel Campaign Support */}
                        <div className="py-0.5">
                          <AiAssistantMessageBody content={msg.content} msgId={msg.id} />
                        </div>

                        {/* Note pill if bridged or fallback */}
                        {msg.note && (
                          <div className="mt-2 pt-1 border-t border-[#DCE5DD] text-[10px] text-[#1E6B4F] font-semibold flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-[#1E6B4F]" />
                            <span>{msg.note}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Generating / Thinking Indicator */}
                {isGenerating && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#E9F0E8] border border-[#DCE5DD] text-[#1E6B4F] flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                      <Bot className="w-4 h-4 text-[#1E6B4F]" />
                    </div>
                    <div className="bg-white rounded-xl px-3 py-2 border border-[#DCE5DD] shadow-xs flex items-center gap-2 text-xs text-[#52645A]">
                      <RefreshCw className="w-3 h-3 text-[#1E6B4F] animate-spin" />
                      <span className="font-medium text-[11px]">
                        {selectedEngine === 'groq'
                          ? 'Generating with Groq LPU (~180ms)...'
                          : selectedEngine === 'gemini'
                            ? 'Analyzing prompt with Google Gemini...'
                            : selectedEngine === 'ollama'
                              ? 'Generating with Ollama...'
                              : 'Routing request...'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Compact Bottom Input Capsule in Active Mode (Cleanly anchored at bottom) */}
            <div className="px-4 pt-1 pb-3 bg-[#F4F7F3] shrink-0">
              {renderInputCapsule(false)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
