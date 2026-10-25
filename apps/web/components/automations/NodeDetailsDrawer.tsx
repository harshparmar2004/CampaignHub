'use client';

import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  FileCode,
  Layers,
  Zap,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Database,
  ArrowRight,
  Table as TableIcon,
  Search,
  Filter,
} from 'lucide-react';
import {
  WhatsAppLogo,
  GmailLogo,
  TelegramLogo,
  InstagramLogo,
  GroqLogo,
  GeminiLogo,
} from '@/components/ui/BrandIcons';

export interface PipelineNodeData {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  colorScheme: 'emerald' | 'indigo' | 'amber' | 'blue' | 'purple' | 'orange';
  iconType: 'database' | 'filter' | 'ai' | 'whatsapp' | 'email' | 'telegram' | 'instagram' | 'telemetry';
  status: 'active' | 'idle' | 'running';
  executingText: string;
  hasDataText: string;
  metrics: { label: string; value: string }[];
  config: { label: string; value: string; badge?: string }[];
  sqlQuery?: string;
  tableData?: Array<Record<string, any>>;
  inputSample: Record<string, any>;
  outputSample: {
    type: 'raw' | 'whatsapp' | 'email' | 'telegram' | 'instagram';
    content: any;
  };
  logs: { time: string; message: string; type?: 'info' | 'success' | 'warn' }[];
}

interface NodeDetailsDrawerProps {
  node: PipelineNodeData | null;
  isOpen: boolean;
  onClose: () => void;
  onTestNode?: (nodeId: string) => void;
  isTestingNode?: boolean;
}

export function NodeDetailsDrawer({
  node,
  isOpen,
  onClose,
  onTestNode,
  isTestingNode = false,
}: NodeDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'data' | 'overview' | 'preview' | 'logs'>('data');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !node) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderNodeIcon = () => {
    switch (node.iconType) {
      case 'whatsapp':
        return <WhatsAppLogo className="w-5 h-5" />;
      case 'email':
        return <GmailLogo className="w-5 h-5" />;
      case 'telegram':
        return <TelegramLogo className="w-5 h-5" />;
      case 'instagram':
        return <InstagramLogo className="w-5 h-5" />;
      case 'ai':
        return <GroqLogo className="w-5 h-5" />;
      case 'database':
        return <Database className="w-5 h-5 text-emerald-700" />;
      case 'filter':
        return <Sliders className="w-5 h-5 text-amber-700" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-emerald-700" />;
    }
  };

  const filteredRows = (node.tableData || []).filter((row) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return Object.values(row).some(
      (val) => val && String(val).toLowerCase().includes(query)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-start pointer-events-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#14231C]/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-150 cursor-pointer pointer-events-auto"
        onClick={onClose}
      />

      {/* Drawer Surface - DOCKED TO THE LEFT SIDE */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 border-r border-border/80 pointer-events-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-[#F4F7F3] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white border border-border shadow-2xs flex items-center justify-center shrink-0">
              {renderNodeIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-txt-muted">
                  {node.category}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
                  {node.badge}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-border flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Executed &bull; Active</span>
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-txt-primary truncate mt-0.5">
                {node.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onTestNode && (
              <button
                type="button"
                onClick={() => onTestNode(node.id)}
                disabled={isTestingNode}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isTestingNode ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>Test Node</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-white transition-colors cursor-pointer"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-border bg-white text-xs font-bold overflow-x-auto scrollbar-none">
          {[
            { id: 'data', label: '📊 Live Data & List' },
            { id: 'overview', label: '⚙️ Overview & Execution' },
            { id: 'preview', label: '✨ Message & Output' },
            { id: 'logs', label: '📜 Real-Time Logs' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-txt-muted hover:text-txt-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F9FBF8]">
          {/* TAB 1: LIVE DATA & LIST (PostgreSQL dataset, Audience breakdown, etc.) */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              {/* SQL Query / Ingestion Rule Header */}
              {node.sqlQuery && (
                <div className="p-3.5 rounded-xl bg-[#14231C] text-emerald-300 font-mono text-[11px] space-y-1.5 border border-border shadow-2xs">
                  <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3 text-emerald-400" />
                      <span>PostgreSQL Live Query &bull; Supabase Database</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(node.sqlQuery || '', 'sql')}
                      className="text-white hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {copiedKey === 'sql' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'sql' ? 'Copied' : 'Copy SQL'}</span>
                    </button>
                  </div>
                  <div className="text-white select-all break-words leading-relaxed">
                    {node.sqlQuery}
                  </div>
                </div>
              )}

              {/* Search Bar for Records */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-txt-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search in this node's data records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-border rounded-xl focus:outline-hidden font-medium"
                  />
                </div>
                <div className="text-[11px] font-bold text-txt-muted shrink-0">
                  Showing {filteredRows.length} of {node.tableData?.length || 0} items
                </div>
              </div>

              {/* Data Table */}
              {node.tableData && node.tableData.length > 0 ? (
                <div className="rounded-xl border border-border bg-white shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto max-h-[380px] scrollbar-thin">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#E9F0E8] text-[#1E6B4F] font-bold sticky top-0 z-10 border-b border-border">
                        <tr>
                          {Object.keys(node.tableData[0]).map((col) => (
                            <th key={col} className="p-2.5 uppercase text-[10px] tracking-wider whitespace-nowrap">
                              {col.replace(/_/g, ' ')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {filteredRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-bg-app transition-colors">
                            {Object.entries(row).map(([key, val], cIdx) => (
                              <td key={cIdx} className="p-2.5 text-txt-primary whitespace-nowrap text-[11px]">
                                {key === 'status' || key === 'qualification' ? (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      String(val).toLowerCase().includes('vip') ||
                                      String(val).toLowerCase().includes('pass') ||
                                      String(val).toLowerCase().includes('delivered') ||
                                      String(val).toLowerCase().includes('sent')
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                                    }`}
                                  >
                                    {String(val)}
                                  </span>
                                ) : key === 'lifetime_spend_inr' || key === 'cost' ? (
                                  <span className="font-mono font-bold text-emerald-900">
                                    ₹{Number(val).toLocaleString()}
                                  </span>
                                ) : Array.isArray(val) ? (
                                  <span className="inline-flex gap-1 flex-wrap">
                                    {val.map((tag: string, tIdx: number) => (
                                      <span
                                        key={tIdx}
                                        className="px-1.5 py-0.2 rounded bg-bg-app text-txt-muted text-[10px] border border-border"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </span>
                                ) : (
                                  <span>{String(val)}</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-txt-muted bg-white rounded-xl border border-border">
                  No tabular data detected for this node.
                </div>
              )}

              {/* Inbound Sample JSON Card */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider flex items-center gap-1">
                    <FileCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>Inbound Record Schema &bull; JSON View</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(JSON.stringify(node.inputSample, null, 2), 'inbound_json')}
                    className="text-[11px] text-brand hover:underline flex items-center gap-1 font-bold cursor-pointer"
                  >
                    {copiedKey === 'inbound_json' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'inbound_json' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#14231C] text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-border">
                  {JSON.stringify(node.inputSample, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: OVERVIEW & EXECUTION DETAILS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Execution Status Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-xs font-bold text-emerald-950">
                      Currently Executing:
                    </strong>
                    <span className="text-[11px] text-emerald-900 font-mono block mt-0.5">
                      {node.executingText}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                  Healthy &bull; 0 Errors
                </span>
              </div>

              {/* What this node has */}
              <div className="p-3.5 rounded-xl bg-white border border-border text-xs space-y-1 shadow-2xs">
                <strong className="text-[11px] font-bold text-txt-muted uppercase tracking-wider block">
                  Active Buffer &amp; Data Payload
                </strong>
                <p className="text-xs font-bold text-txt-primary">
                  {node.hasDataText}
                </p>
                <p className="text-[11px] text-txt-muted mt-1">
                  {node.subtitle}
                </p>
              </div>

              {/* Node Summary Metrics Cards */}
              <div className="grid grid-cols-2 gap-3">
                {node.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-border shadow-2xs space-y-1"
                  >
                    <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider block">
                      {m.label}
                    </span>
                    <span className="text-sm font-black text-txt-primary block font-mono">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Parameters */}
              <div className="p-4 rounded-xl bg-white border border-border shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-txt-muted" />
                    <span>Configured Parameters</span>
                  </h4>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    AES-256-GCM Vault Active
                  </span>
                </div>

                <div className="space-y-2 divide-y divide-border/60 text-xs">
                  {node.config.map((cfg, idx) => (
                    <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                      <span className="text-txt-muted font-medium">{cfg.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-txt-primary">{cfg.value}</span>
                        {cfg.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#E9F0E8] text-[#1E6B4F]">
                            {cfg.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MESSAGE & OUTPUT PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand" />
                  <span>Formatted Output Preview</span>
                </h4>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      typeof node.outputSample.content === 'string'
                        ? node.outputSample.content
                        : JSON.stringify(node.outputSample.content, null, 2),
                      'preview_copy'
                    )
                  }
                  className="text-[11px] text-brand hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  {copiedKey === 'preview_copy' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'preview_copy' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {node.outputSample.type === 'whatsapp' ? (
                <div className="p-4 rounded-2xl bg-[#E9F0E8] border border-[#C9D6CB] text-xs text-[#14231C] space-y-2 shadow-2xs font-sans">
                  <div className="flex items-center justify-between text-[10px] text-emerald-800 font-bold border-b border-[#C9D6CB] pb-1.5">
                    <span className="flex items-center gap-1">
                      <WhatsAppLogo className="w-3.5 h-3.5" />
                      <span>WhatsApp Direct Dispatch Preview</span>
                    </span>
                    <span>20 msg/sec &bull; ₹0.9926</span>
                  </div>
                  <div className="whitespace-pre-line leading-relaxed text-[12px]">
                    {node.outputSample.content}
                  </div>
                  <div className="pt-1.5 flex justify-end text-[10px] text-[#52645A] font-mono">
                    10:45 PM &bull; ✓✓ Read
                  </div>
                </div>
              ) : node.outputSample.type === 'email' ? (
                <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-2xs text-xs">
                  <div className="p-3 bg-[#F4F7F3] border-b border-border space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-txt-muted uppercase font-bold">Subject:</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Resend SMTP Inbox Verified
                      </span>
                    </div>
                    <div className="font-bold text-txt-primary">
                      {node.outputSample.content.subject || 'Aarav, your VIP Gala Access Pass is ready!'}
                    </div>
                  </div>
                  <div className="p-4 whitespace-pre-line text-txt-primary text-xs leading-relaxed">
                    {node.outputSample.content.body || JSON.stringify(node.outputSample.content, null, 2)}
                  </div>
                </div>
              ) : node.outputSample.type === 'telegram' ? (
                <div className="p-4 rounded-2xl bg-[#229ED9]/10 border border-[#229ED9]/30 text-xs text-[#14231C] space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-[#229ED9] font-bold">
                    <span className="flex items-center gap-1">
                      <TelegramLogo className="w-3.5 h-3.5" />
                      <span>Pinned Telegram Post &bull; @CampaignHubVIPChannel</span>
                    </span>
                    <span className="bg-white px-1.5 py-0.5 rounded-md border border-[#229ED9]/20">0 Fee</span>
                  </div>
                  <div className="whitespace-pre-line leading-relaxed">
                    {node.outputSample.content}
                  </div>
                </div>
              ) : (
                <pre className="p-3.5 rounded-xl bg-white text-txt-primary font-mono text-[11px] overflow-x-auto leading-relaxed border border-border shadow-2xs">
                  {typeof node.outputSample.content === 'string'
                    ? node.outputSample.content
                    : JSON.stringify(node.outputSample.content, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* TAB 4: LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-txt-muted" />
                  <span>Real-Time Execution Logs</span>
                </h4>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Stream
                </span>
              </div>

              <div className="rounded-xl bg-[#14231C] p-3 font-mono text-[11px] text-stone-300 space-y-2 border border-border">
                {node.logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-500 shrink-0 font-semibold">{log.time}</span>
                    <span
                      className={`flex-1 ${
                        log.type === 'success'
                          ? 'text-emerald-300'
                          : log.type === 'warn'
                            ? 'text-amber-300'
                            : 'text-stone-200'
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-white flex items-center justify-between text-xs text-txt-muted">
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-brand" />
            Node Health: <strong>100% Operational</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-bg-app hover:bg-border text-txt-primary font-bold transition-colors cursor-pointer"
          >
            Close Left Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
