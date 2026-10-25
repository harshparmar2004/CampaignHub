'use client';

import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatusText } from '@/components/ui/StatusText';
import {
  Search,
  Upload,
  Download,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  Crown,
  Flame,
  UserCheck,
  CalendarCheck,
  MessageCircle,
  ExternalLink,
  Tag,
  RefreshCw,
  Users,
  Filter,
} from 'lucide-react';
import type { Contact, ContactTier } from '@campaignhub/shared';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tier Counts & Active Tier Tab
  const [activeTierTab, setActiveTierTab] = useState<'all' | 'vip' | 'regular' | 'lead' | 'unsubscribed' | 'tags'>('all');
  const [tierCounts, setTierCounts] = useState({
    all: 0,
    vip: 0,
    regular: 0,
    lead: 0,
    unsubscribed: 0,
  });
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [totalTags, setTotalTags] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [optInFilter, setOptInFilter] = useState('all');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Reclassification State
  const [isReclassifying, setIsReclassifying] = useState(false);
  const [reclassifyFeedback, setReclassifyFeedback] = useState<string | null>(null);

  // Contact Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formTier, setFormTier] = useState<ContactTier>('lead');
  const [formPartiesAttended, setFormPartiesAttended] = useState(0);
  const [formTotalSpend, setFormTotalSpend] = useState(0);
  const [formNotes, setFormNotes] = useState('');
  const [formTelegramChatId, setFormTelegramChatId] = useState('');
  const [formWaOptIn, setFormWaOptIn] = useState(true);
  const [formEmailOptIn, setFormEmailOptIn] = useState(true);
  const [formUnsubscribed, setFormUnsubscribed] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Smart CSV/JSON Import Modal & State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [importHeaders, setImportHeaders] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'merge' | 'replace' | 'skip'>('merge');
  const [isEventAttendance, setIsEventAttendance] = useState(true);
  const [directVip, setDirectVip] = useState(false);
  const [eventTag, setEventTag] = useState('');
  const [defaultSpendInr, setDefaultSpendInr] = useState(0);
  const [mapping, setMapping] = useState({
    name: '',
    phone: '',
    email: '',
    tags: '',
    parties_attended: '',
    total_spend_inr: '',
    telegram_chat_id: '',
  });
  const [confirmConsent, setConfirmConsent] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchContacts();
  }, [page, search, selectedTag, optInFilter, activeTierTab]);

  async function fetchContacts() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        tag: selectedTag,
        optIn: activeTierTab === 'unsubscribed' ? 'unsubscribed' : optInFilter,
        tier: (activeTierTab === 'unsubscribed' || activeTierTab === 'tags') ? 'all' : activeTierTab,
      });
      const res = await fetch(`/api/contacts?${params}`);
      const data = await res.json();
      if (data.success) {
        setContacts(data.data || []);
        setTotal(data.total || 0);
        setAvailableTags(data.availableTags || []);
        if (data.tierCounts) {
          setTierCounts(data.tierCounts);
        }
        if (data.tagCounts) {
          setTagCounts(data.tagCounts);
        }
        if (typeof data.totalTags === 'number') {
          setTotalTags(data.totalTags);
        }
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // 1-Click Reclassify Tiers
  async function handleReclassifyTiers() {
    setIsReclassifying(true);
    setReclassifyFeedback(null);
    try {
      const res = await fetch('/api/contacts/reclassify', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setReclassifyFeedback(data.message);
        fetchContacts();
        setTimeout(() => setReclassifyFeedback(null), 5000);
      } else {
        alert(data.error || 'Failed to reclassify tiers');
      }
    } catch (err: any) {
      alert(err.message || 'Network error during tier audit');
    } finally {
      setIsReclassifying(false);
    }
  }

  function openAddModal() {
    setEditingContact(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormTags('');
    setFormTier('lead');
    setFormPartiesAttended(0);
    setFormTotalSpend(0);
    setFormNotes('');
    setFormTelegramChatId('');
    setFormWaOptIn(true);
    setFormEmailOptIn(true);
    setFormUnsubscribed(false);
    setFormError('');
    setIsModalOpen(true);
  }

  function openEditModal(c: Contact) {
    setEditingContact(c);
    setFormName(c.name);
    setFormPhone(c.phone);
    setFormEmail(c.email);
    setFormTags((c.tags || []).join(', '));
    setFormTier(c.tier || 'lead');
    setFormPartiesAttended(c.parties_attended || 0);
    setFormTotalSpend(c.total_spend_inr || 0);
    setFormNotes(c.notes || '');
    setFormTelegramChatId(c.telegram_chat_id || '');
    setFormWaOptIn(c.whatsapp_opt_in);
    setFormEmailOptIn(c.email_opt_in);
    setFormUnsubscribed(c.unsubscribed);
    setFormError('');
    setIsModalOpen(true);
  }

  async function handleSaveContact(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setFormError('');

    const parsedTags = formTags
      .split(/[,;|]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      id: editingContact?.id,
      name: formName,
      phone: formPhone,
      email: formEmail,
      tags: parsedTags,
      tier: formTier,
      parties_attended: Number(formPartiesAttended) || 0,
      total_spend_inr: Number(formTotalSpend) || 0,
      notes: formNotes || null,
      telegram_chat_id: formTelegramChatId || null,
      whatsapp_opt_in: formWaOptIn,
      email_opt_in: formEmailOptIn,
      unsubscribed: formUnsubscribed,
    };

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchContacts();
      } else {
        setFormError(data.error || 'Failed to save contact');
      }
    } catch (err: any) {
      setFormError(err.message || 'Network error');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(ids: string[]) {
    if (!confirm(`Are you sure you want to delete ${ids.length} contact(s)?`)) return;
    try {
      const res = await fetch('/api/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedIds(new Set());
        fetchContacts();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contacts.map((c) => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  // Smart File Import handling (CSV or JSON)
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportSummary(null);

    const isJson = file.name.endsWith('.json');

    if (isJson) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          const rows = Array.isArray(parsed) ? parsed : parsed.contacts || parsed.data || [parsed];
          if (rows.length > 0) {
            const headers = Object.keys(rows[0]);
            setImportHeaders(headers);
            setImportData(rows);
            autoDetectMapping(headers);
          }
        } catch (err) {
          alert('Invalid JSON file format.');
        }
      };
      reader.readAsText(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          setImportHeaders(headers);
          setImportData(results.data);
          autoDetectMapping(headers);
        },
      });
    }
  }

  function autoDetectMapping(headers: string[]) {
    const findHeader = (names: string[]) =>
      headers.find((h) => names.includes(h.toLowerCase().trim())) || '';

    setMapping({
      name: findHeader(['name', 'full name', 'fullname', 'contact name', 'guest name']),
      phone: findHeader(['phone', 'mobile', 'whatsapp', 'phone number', 'contact']),
      email: findHeader(['email', 'email address', 'mail']),
      tags: findHeader(['tags', 'tag', 'group', 'category', 'ticket type']),
      parties_attended: findHeader(['parties', 'attended', 'events', 'parties_attended', 'visits']),
      total_spend_inr: findHeader(['spend', 'amount', 'ticket price', 'total_spend', 'inr']),
      telegram_chat_id: findHeader(['telegram', 'telegram_chat_id', 'chat_id']),
    });
  }

  async function handleImportSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmConsent) {
      alert('You must confirm recipient consent before importing.');
      return;
    }

    if (!mapping.name || !mapping.phone || !mapping.email) {
      alert('Please map Name, Phone, and Email columns.');
      return;
    }

    setIsImporting(true);

    const rows = importData.map((row) => ({
      name: row[mapping.name] || '',
      phone: row[mapping.phone] || '',
      email: row[mapping.email] || '',
      tags: mapping.tags ? row[mapping.tags] : '',
      parties_attended: mapping.parties_attended ? row[mapping.parties_attended] : undefined,
      total_spend_inr: mapping.total_spend_inr ? row[mapping.total_spend_inr] : undefined,
      telegram_chat_id: mapping.telegram_chat_id ? row[mapping.telegram_chat_id] : '',
    }));

    try {
      const res = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirm_consent: true,
          consent_source: `import_${importFile?.name || 'file'}`,
          import_mode: importMode,
          is_event_attendance: isEventAttendance,
          direct_vip: directVip,
          event_tag: eventTag,
          default_spend_inr: Number(defaultSpendInr) || 0,
          rows,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setImportSummary(data.summary);
        fetchContacts();
      } else {
        alert(data.error || 'Import failed');
      }
    } catch (err: any) {
      alert(err.message || 'Import error');
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header with Aligned Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-txt-primary">Contacts &amp; Audience CRM</h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Auto-Tiering Active
            </span>
          </div>
          <p className="text-xs text-txt-muted mt-1">
            Tracking customer loyalty, party attendance (+1), and event tags.
          </p>
        </div>

        {/* Action Buttons Toolbar - All in One Clean Row */}
        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2">
          {/* Recalculate Tiers */}
          <Button
            variant="secondary"
            onClick={handleReclassifyTiers}
            isLoading={isReclassifying}
            className="text-xs h-9 px-3 border-amber-300 bg-amber-50/70 text-amber-900 hover:bg-amber-100 font-semibold shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
            Recalculate Tiers
          </Button>

          {/* Export CSV */}
          <Button
            variant="secondary"
            onClick={() => window.open('/api/contacts/export', '_blank')}
            className="text-xs h-9 px-3 border-border bg-white hover:bg-bg-app shadow-2xs text-txt-primary"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>

          {/* Import CSV / JSON */}
          <Button
            variant="secondary"
            onClick={() => {
              setImportSummary(null);
              setIsImportModalOpen(true);
            }}
            className="text-xs h-9 px-3 font-semibold text-emerald-800 border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Import CSV / JSON
          </Button>

          {/* Add Contact (Primary) */}
          <Button
            onClick={openAddModal}
            className="text-xs h-9 px-4 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Audit Feedback Toast */}
      {reclassifyFeedback && (
        <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="font-semibold">{reclassifyFeedback}</span>
          </div>
          <button onClick={() => setReclassifyFeedback(null)} className="text-amber-700 hover:text-amber-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 6 COMPACT, STREAMLINED KPI METRIC BOXES WITH 1-CLICK TIER & TAG FILTERING */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {[
          {
            id: 'all',
            label: 'All Database',
            count: tierCounts.all,
            icon: Users,
            activeStyle: 'border-indigo-400 bg-indigo-50/80 text-indigo-950 ring-1 ring-indigo-400',
            iconContainer: 'bg-indigo-100 text-indigo-700',
          },
          {
            id: 'vip',
            label: 'VIP Guests',
            count: tierCounts.vip,
            icon: Crown,
            activeStyle: 'border-amber-400 bg-amber-50/80 text-amber-950 ring-1 ring-amber-400',
            iconContainer: 'bg-amber-100 text-amber-700',
          },
          {
            id: 'regular',
            label: 'Regulars',
            count: tierCounts.regular,
            icon: Flame,
            activeStyle: 'border-emerald-400 bg-emerald-50/80 text-emerald-950 ring-1 ring-emerald-400',
            iconContainer: 'bg-emerald-100 text-emerald-700',
          },
          {
            id: 'lead',
            label: 'Leads',
            count: tierCounts.lead,
            icon: UserCheck,
            activeStyle: 'border-sky-400 bg-sky-50/80 text-sky-950 ring-1 ring-sky-400',
            iconContainer: 'bg-sky-100 text-sky-700',
          },
          {
            id: 'tags',
            label: 'Active Tags',
            count: totalTags || availableTags.length,
            icon: Tag,
            activeStyle: 'border-purple-400 bg-purple-50/80 text-purple-950 ring-1 ring-purple-400',
            iconContainer: 'bg-purple-100 text-purple-700',
          },
          {
            id: 'unsubscribed',
            label: 'Unsubscribed',
            count: tierCounts.unsubscribed,
            icon: AlertCircle,
            activeStyle: 'border-rose-400 bg-rose-50/80 text-rose-950 ring-1 ring-rose-400',
            iconContainer: 'bg-rose-100 text-rose-700',
          },
        ].map((box) => {
          const isActive = activeTierTab === box.id;
          const Icon = box.icon;
          return (
            <button
              key={box.id}
              type="button"
              onClick={() => {
                setActiveTierTab(box.id as any);
                if (box.id !== 'tags') {
                  setSelectedTag('');
                }
                setPage(1);
              }}
              className={
                'p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-center gap-2.5 select-none ' +
                (isActive
                  ? `${box.activeStyle} shadow-2xs`
                  : 'bg-white border-border hover:border-border-strong hover:bg-slate-50/50 text-txt-primary shadow-2xs')
              }
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${box.iconContainer}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold text-txt-muted truncate leading-tight">
                  {box.label}
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-base font-extrabold font-mono text-txt-primary leading-none">
                    {box.count}
                  </span>
                  {isActive && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ORGANIZED ACTIVE TAGS EXPLORER PANEL */}
      {(activeTierTab === 'tags' || selectedTag) && (() => {
        const filteredTags = availableTags.filter((t) =>
          t.toLowerCase().includes(tagSearch.toLowerCase())
        );

        function getTagCategory(tag: string): 'events' | 'vip' | 'general' {
          const u = tag.toUpperCase();
          if (
            u.includes('PARTY') ||
            u.includes('BASH') ||
            u.includes('NIGHT') ||
            u.includes('FEST') ||
            u.includes('EVENT') ||
            /\d{4}/.test(tag) ||
            /(OCT|NOV|DEC|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP)/i.test(tag)
          ) {
            return 'events';
          }
          if (
            u.includes('VIP') ||
            u.includes('TABLE') ||
            u.includes('INVESTOR') ||
            u.includes('SPONSOR')
          ) {
            return 'vip';
          }
          return 'general';
        }

        const eventTags = filteredTags.filter((t) => getTagCategory(t) === 'events');
        const vipTags = filteredTags.filter((t) => getTagCategory(t) === 'vip');
        const generalTags = filteredTags.filter((t) => getTagCategory(t) === 'general');

        function renderTagButton(tag: string) {
          const isSelected = selectedTag === tag;
          const count = tagCounts[tag] || 0;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setSelectedTag(isSelected ? '' : tag);
                setPage(1);
              }}
              className={
                'w-full px-2.5 py-1.5 rounded-md text-xs transition-all flex items-center justify-between gap-1.5 cursor-pointer text-left border ' +
                (isSelected
                  ? 'bg-purple-600 text-white font-bold border-purple-700 shadow-2xs'
                  : 'bg-white border-purple-100/90 hover:bg-purple-50 text-txt-primary hover:text-purple-900')
              }
            >
              <span className="truncate text-[11px] font-medium">{tag}</span>
              <span
                className={
                  'text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold shrink-0 ' +
                  (isSelected
                    ? 'bg-purple-800 text-white'
                    : 'bg-purple-50 text-purple-700 border border-purple-200/60')
                }
              >
                {count}
              </span>
            </button>
          );
        }

        return (
          <div className="p-3.5 bg-gradient-to-b from-purple-50/60 to-purple-50/20 border border-purple-200/90 rounded-xl space-y-3 shadow-2xs">
            {/* Header: Title, Search, and Clear */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-purple-200/60">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-purple-950 block">
                    Active Tags Directory ({availableTags.length} Total Tags)
                  </span>
                  <span className="text-[10.5px] text-purple-800/80 block">
                    Click any tag to filter contacts by event, VIP list, or audience group.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Tag Search Input */}
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2.5 top-2 text-purple-500" />
                  <input
                    type="text"
                    placeholder="Filter tags..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="pl-7 pr-2.5 py-1 bg-white border border-purple-200 rounded-lg text-xs w-36 text-purple-950 placeholder-purple-400 focus:outline-none focus:border-purple-400 min-h-[28px]"
                  />
                </div>

                {selectedTag && (
                  <button
                    onClick={() => {
                      setSelectedTag('');
                      setPage(1);
                    }}
                    className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-white border border-purple-200 hover:bg-purple-100/50 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all min-h-[28px]"
                  >
                    <X className="w-3 h-3" />
                    Clear Tag
                  </button>
                )}
              </div>
            </div>

            {/* 3 Organized Categorized Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {/* Category 1: Party & Event Attendance */}
              <div className="p-2.5 bg-white/95 border border-purple-100 rounded-lg space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-purple-950 px-1 pb-1 border-b border-purple-50">
                  <span className="flex items-center gap-1.5">
                    <span>🎟️</span>
                    <span>Party &amp; Events</span>
                  </span>
                  <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100 font-semibold">
                    {eventTags.length}
                  </span>
                </div>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-0.5">
                  {eventTags.length === 0 ? (
                    <span className="text-[10px] text-txt-muted italic px-1 py-1">No event tags match</span>
                  ) : (
                    eventTags.map((tag) => renderTagButton(tag))
                  )}
                </div>
              </div>

              {/* Category 2: VIP & Tables */}
              <div className="p-2.5 bg-white/95 border border-amber-100 rounded-lg space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-950 px-1 pb-1 border-b border-amber-50">
                  <span className="flex items-center gap-1.5">
                    <span>⭐</span>
                    <span>VIP &amp; Tables</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-100 font-semibold">
                    {vipTags.length}
                  </span>
                </div>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-0.5">
                  {vipTags.length === 0 ? (
                    <span className="text-[10px] text-txt-muted italic px-1 py-1">No VIP tags match</span>
                  ) : (
                    vipTags.map((tag) => renderTagButton(tag))
                  )}
                </div>
              </div>

              {/* Category 3: Audience Groups */}
              <div className="p-2.5 bg-white/95 border border-emerald-100 rounded-lg space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950 px-1 pb-1 border-b border-emerald-50">
                  <span className="flex items-center gap-1.5">
                    <span>👥</span>
                    <span>Audience Groups</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100 font-semibold">
                    {generalTags.length}
                  </span>
                </div>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-0.5">
                  {generalTags.length === 0 ? (
                    <span className="text-[10px] text-txt-muted italic px-1 py-1">No audience tags match</span>
                  ) : (
                    generalTags.map((tag) => renderTagButton(tag))
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Active Filter Status & Table Header Indicator */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-txt-primary">
            {activeTierTab === 'vip' && '🌟 VIP Guests Table'}
            {activeTierTab === 'regular' && '🔥 Regular Attendees Table'}
            {activeTierTab === 'lead' && '🌱 Leads & New Inquiries Table'}
            {activeTierTab === 'tags' && (selectedTag ? `🏷️ Contacts Tagged: "${selectedTag}"` : '🏷️ All Tagged Contacts')}
            {activeTierTab === 'unsubscribed' && '⚠️ Unsubscribed Contacts Table'}
            {activeTierTab === 'all' && 'All Contacts Database'}
          </span>
          <span className="text-txt-muted text-[11px] font-mono">
            ({total} {total === 1 ? 'record' : 'records'})
          </span>
        </div>

        {(activeTierTab !== 'all' || selectedTag || search || optInFilter !== 'all') && (
          <button
            onClick={() => {
              setActiveTierTab('all');
              setSelectedTag('');
              setSearch('');
              setOptInFilter('all');
              setPage(1);
            }}
            className="text-[11px] font-semibold text-brand hover:underline flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            Reset to All Contacts
          </button>
        )}
      </div>

      {/* Refined Filters & Search Toolbar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-txt-muted" />
            <input
              type="text"
              placeholder="Search by name, phone (+91...) or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-bg-input text-txt-primary border border-border rounded-lg min-h-[38px] font-medium"
            />
          </div>

          <div>
            <select
              value={selectedTag}
              onChange={(e) => {
                setSelectedTag(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-bg-input text-txt-primary border border-border rounded-lg min-h-[38px] font-medium"
            >
              <option value="">Filter by Event Tag (All)</option>
              {availableTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={optInFilter}
              onChange={(e) => {
                setOptInFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-bg-input text-txt-primary border border-border rounded-lg min-h-[38px] font-medium"
            >
              <option value="all">All Opt-In Channels</option>
              <option value="whatsapp">WhatsApp Opt-In Only</option>
              <option value="email">Email Opt-In Only</option>
              <option value="unsubscribed">Unsubscribed Only</option>
            </select>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-txt-primary font-bold">
              {selectedIds.size} contact(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                onClick={() => handleDelete(Array.from(selectedIds))}
                className="text-xs h-7"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Contacts Table with Visual Tier & Attendance Badges */}
      <Card className="p-0 overflow-hidden border border-border rounded-xl shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-input border-b border-border text-txt-muted select-none">
              <tr>
                <th className="py-3 px-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={contacts.length > 0 && selectedIds.size === contacts.length}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 accent-brand rounded"
                  />
                </th>
                <th className="py-3 px-3.5 font-bold uppercase tracking-wider text-[11px]">Member Name</th>
                <th className="py-3 px-3.5 font-bold uppercase tracking-wider text-[11px]">Customer Tier</th>
                <th className="py-3 px-3.5 font-bold uppercase tracking-wider text-[11px]">Parties Attended</th>
                <th className="py-3 px-3.5 font-bold uppercase tracking-wider text-[11px]">Phone (+91)</th>
                <th className="py-3 px-3.5 font-bold uppercase tracking-wider text-[11px]">Email</th>
                <th className="py-3 px-3.5 font-bold uppercase tracking-wider text-[11px]">Tags</th>
                <th className="py-3 px-3.5 font-bold uppercase tracking-wider text-[11px]">Channels</th>
                <th className="py-3 px-3.5 font-bold uppercase tracking-wider text-[11px] text-right">
                  1-Click Outreach &amp; Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-txt-muted text-xs">
                    Loading contacts database...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-txt-muted text-xs">
                    No contacts found in this tier matching your search criteria.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => {
                  const isSelected = selectedIds.has(c.id);
                  const tier = c.tier || 'lead';
                  const cleanPhone = (c.phone || '').replace(/[^\d]/g, '');

                  return (
                    <tr key={c.id} className="hover:bg-bg-accentSoft/30 transition-colors">
                      <td className="py-3 px-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(c.id)}
                          className="w-3.5 h-3.5 accent-brand rounded"
                        />
                      </td>

                      {/* Name */}
                      <td className="py-3 px-3.5 font-bold text-txt-primary">
                        <div>
                          <span>{c.name}</span>
                          {c.notes && (
                            <span className="block text-[10px] text-txt-muted font-normal truncate max-w-xs">
                              {c.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tier Badge */}
                      <td className="py-3 px-3.5">
                        {tier === 'vip' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                            <Crown className="w-3 h-3 text-amber-600" />
                            VIP Member
                          </span>
                        ) : tier === 'regular' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                            <Flame className="w-3 h-3 text-emerald-600" />
                            Regular (Mid)
                          </span>
                        ) : tier === 'inactive' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-red-100 text-red-800 border border-red-300">
                            Unsubscribed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-sky-50 text-sky-800 border border-sky-200">
                            🌱 Lead / New
                          </span>
                        )}
                      </td>

                      {/* Parties Attended Counter */}
                      <td className="py-3 px-3.5 font-mono">
                        <span
                          className={
                            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold text-[11px] ' +
                            ((c.parties_attended || 0) >= 3
                              ? 'bg-amber-50 text-amber-900 border border-amber-200 font-bold'
                              : (c.parties_attended || 0) >= 1
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                              : 'bg-bg-app text-txt-muted border border-border')
                          }
                        >
                          <CalendarCheck className="w-3 h-3 text-txt-muted" />
                          {c.parties_attended || 0} {c.parties_attended === 1 ? 'Party' : 'Parties'}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-3.5 font-mono text-[11px] text-txt-primary">{c.phone}</td>

                      {/* Email */}
                      <td className="py-3 px-3.5 text-txt-primary">{c.email}</td>

                      {/* Tags */}
                      <td className="py-3 px-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {c.tags && c.tags.length > 0 ? (
                            c.tags.map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded bg-bg-app border border-border text-[10px] text-txt-muted font-medium"
                              >
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-txt-muted text-xs">—</span>
                          )}
                        </div>
                      </td>

                      {/* Channel Consent Badges */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={
                              'w-2 h-2 rounded-full ' +
                              (c.whatsapp_opt_in && !c.unsubscribed ? 'bg-[#25D366]' : 'bg-border-strong')
                            }
                            title={c.whatsapp_opt_in ? 'WhatsApp Active' : 'WhatsApp Inactive'}
                          />
                          <span
                            className={
                              'w-2 h-2 rounded-full ' +
                              (c.email_opt_in && !c.unsubscribed ? 'bg-[#4285F4]' : 'bg-border-strong')
                            }
                            title={c.email_opt_in ? 'Email Active' : 'Email Inactive'}
                          />
                        </div>
                      </td>

                      {/* 1-Click Outreach & Actions */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-CLICK FREE WHATSAPP DIRECT CHAT */}
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                              `Hey ${c.name}! 🎉 Here is your exclusive VIP Party Invitation from CampaignHub. Everything is set up for a great time!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded bg-[#E8F8EE] hover:bg-[#25D366] text-[#075E54] hover:text-white border border-[#25D366]/40 text-[10.5px] font-bold flex items-center gap-1 transition-all shadow-2xs"
                            title="Open 1-Click Chat in WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>Chat</span>
                          </a>

                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-txt-muted hover:text-brand transition-colors rounded hover:bg-bg-app"
                            title="Edit member details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete([c.id])}
                            className="p-1.5 text-txt-muted hover:text-status-failed transition-colors rounded hover:bg-bg-app"
                            title="Delete contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="p-3.5 border-t border-border flex items-center justify-between text-xs">
            <span className="text-txt-muted">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} contacts
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="text-xs h-8"
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page * limit >= total}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs h-8"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add / Edit Contact Modal with Tier & Attendance */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContact ? 'Edit Contact & Tier Details' : 'Add New Member to Database'}
      >
        <form onSubmit={handleSaveContact} className="space-y-3.5">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-status-failed font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Priya Sharma"
            />
            <Input
              label="Phone Number"
              required
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="e.g. 9876543210 (Normalized to +91)"
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            required
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            placeholder="e.g. priya@company.com"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-txt-primary mb-1">Customer Tier</label>
              <select
                value={formTier}
                onChange={(e) => setFormTier(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-bg-input text-txt-primary border border-border rounded-lg h-9 font-medium"
              >
                <option value="vip">🌟 VIP Member</option>
                <option value="regular">🔥 Regular (Mid-Tier)</option>
                <option value="lead">🌱 Lead / New</option>
                <option value="inactive">⚠️ Inactive / Unsubscribed</option>
              </select>
            </div>

            <Input
              label="Parties Attended"
              type="number"
              value={String(formPartiesAttended)}
              onChange={(e) => setFormPartiesAttended(parseInt(e.target.value, 10) || 0)}
              placeholder="0"
            />

            <Input
              label="Total Spend (₹)"
              type="number"
              value={String(formTotalSpend)}
              onChange={(e) => setFormTotalSpend(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

          <Input
            label="Event Tags (comma separated)"
            value={formTags}
            onChange={(e) => setFormTags(e.target.value)}
            placeholder="e.g. vip, party_oct, table_booking, investor"
          />

          <Input
            label="Notes / Preferences (optional)"
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            placeholder="e.g. Likes front booth, prefers WhatsApp over email, champagne lover"
          />

          <div className="pt-2 border-t border-border space-y-2">
            <label className="flex items-center gap-2 text-xs text-txt-primary cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={formWaOptIn}
                onChange={(e) => setFormWaOptIn(e.target.checked)}
                className="w-4 h-4 accent-brand rounded"
              />
              <span>WhatsApp Outreach Active</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-txt-primary cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={formEmailOptIn}
                onChange={(e) => setFormEmailOptIn(e.target.checked)}
                className="w-4 h-4 accent-brand rounded"
              />
              <span>Email Newsletter / Updates Active</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-txt-primary cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={formUnsubscribed}
                onChange={(e) => setFormUnsubscribed(e.target.checked)}
                className="w-4 h-4 accent-brand rounded"
              />
              <span className="text-status-failed">Completely Unsubscribed from All Outreach</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editingContact ? 'Save Changes' : 'Create Contact'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* SMART CSV & JSON IMPORT MODAL (WITH UPSERT & MERGE) */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Smart Monthly Ingestion (CSV / JSON)"
        maxWidth="max-w-2xl"
      >
        {importSummary ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Smart Ingestion Completed Successfully</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                <div className="p-2 bg-white rounded border border-emerald-100">
                  <span className="text-txt-muted block text-[10px]">Processed</span>
                  <strong className="text-txt-primary text-sm">{importSummary.totalRows}</strong>
                </div>
                <div className="p-2 bg-white rounded border border-emerald-100">
                  <span className="text-txt-muted block text-[10px]">Net New Added</span>
                  <strong className="text-emerald-700 text-sm">{importSummary.addedCount}</strong>
                </div>
                <div className="p-2 bg-white rounded border border-emerald-100">
                  <span className="text-txt-muted block text-[10px]">Merged / Updated</span>
                  <strong className="text-brand text-sm">{importSummary.updatedCount}</strong>
                </div>
                <div className="p-2 bg-white rounded border border-emerald-100">
                  <span className="text-txt-muted block text-[10px]">🌟 Promoted to VIP</span>
                  <strong className="text-amber-600 text-sm">{importSummary.promotedToVipCount}</strong>
                </div>
              </div>
            </div>

            {importSummary.skippedDetails && importSummary.skippedDetails.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-txt-primary">Skipped Rows Details:</h4>
                <div className="max-h-40 overflow-y-auto border border-border rounded-lg divide-y divide-border text-[11px]">
                  {importSummary.skippedDetails.map((s: any, idx: number) => (
                    <div key={idx} className="p-2 flex items-center justify-between">
                      <span>
                        Row #{s.row}: <strong>{s.name || s.identifier}</strong>
                      </span>
                      <span className="text-status-failed font-medium">{s.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setIsImportModalOpen(false)}>Done &amp; View Contacts</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
            {/* File Selector */}
            <div>
              <label className="block text-xs font-bold text-txt-primary mb-1">
                Select Monthly Export File (CSV or JSON)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .json"
                onChange={handleFileChange}
                className="w-full p-2 border border-border rounded-lg text-xs bg-bg-input"
              />
              <span className="text-[10px] text-txt-muted mt-1 block">
                Supports exports from Luma, BookMyShow, Paytm Insider, Google Sheets, or POS.
              </span>
            </div>

            {/* Ingestion Mode Selector */}
            <div className="p-3 bg-bg-app border border-border rounded-xl space-y-2">
              <label className="block text-xs font-bold text-txt-primary">
                1. How should existing contacts be handled?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: 'merge',
                    title: 'Smart Upsert & Merge',
                    desc: 'Merge tags, add party visit (+1), auto-promote to VIP.',
                  },
                  {
                    id: 'replace',
                    title: 'Overwrite Fields',
                    desc: 'Replace existing data with new file values.',
                  },
                  {
                    id: 'skip',
                    title: 'Skip Duplicates',
                    desc: 'Only add net-new members.',
                  },
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setImportMode(m.id as any)}
                    className={
                      'p-2.5 rounded-lg border cursor-pointer transition-all ' +
                      (importMode === m.id
                        ? 'bg-emerald-50 border-emerald-500 shadow-2xs font-semibold'
                        : 'bg-white border-border hover:border-border-strong')
                    }
                  >
                    <span className="block font-bold text-txt-primary text-xs">{m.title}</span>
                    <span className="block text-[10px] text-txt-muted mt-0.5">{m.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Attendance Checkbox & Event Tag */}
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-3">
              <label className="flex items-start gap-2 cursor-pointer font-bold text-amber-950 text-xs">
                <input
                  type="checkbox"
                  checked={isEventAttendance}
                  onChange={(e) => setIsEventAttendance(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded mt-0.5"
                />
                <div>
                  <span>
                    This file is an Event / Party Attendance List (Auto-increment party count by +1)
                  </span>
                  <span className="block text-[10px] font-normal text-amber-900/80 mt-0.5">
                    Matches existing members by Phone or Email address. Automatically filters out the &quot;Lead&quot; tag and advances attendees to Regulars or VIPs.
                  </span>
                </div>
              </label>

              {isEventAttendance && (
                <div className="pt-2 border-t border-amber-200/60 space-y-2">
                  <span className="text-[11px] font-bold text-amber-950 block">
                    2. VIP Graduation Policy for this Import:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div
                      onClick={() => setDirectVip(false)}
                      className={
                        'p-2.5 rounded-lg border cursor-pointer transition-all ' +
                        (!directVip
                          ? 'bg-white border-amber-500 shadow-2xs font-semibold'
                          : 'bg-white/70 border-amber-200 hover:border-amber-400')
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-txt-primary">🔥 Smart Graduation (Default)</span>
                      </div>
                      <p className="text-[10px] text-txt-muted mt-1 leading-relaxed">
                        1st-time attendees graduate from Lead &rarr; <strong>Regular</strong>. Repeat attendees (2+ parties) automatically become <strong>🌟 VIP</strong>.
                      </p>
                    </div>

                    <div
                      onClick={() => setDirectVip(true)}
                      className={
                        'p-2.5 rounded-lg border cursor-pointer transition-all ' +
                        (directVip
                          ? 'bg-amber-100 border-amber-600 shadow-2xs font-semibold'
                          : 'bg-white/70 border-amber-200 hover:border-amber-400')
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-amber-950">🌟 Instant VIP Status</span>
                      </div>
                      <p className="text-[10px] text-txt-muted mt-1 leading-relaxed">
                        Mark all attendees in this list as <strong>🌟 VIP</strong> immediately (ideal for exclusive guestlists or VIP table bookings).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[11px] font-semibold text-txt-primary block mb-1">
                    Event Tag to Apply (e.g. Party_Oct2026):
                  </span>
                  <input
                    type="text"
                    value={eventTag}
                    onChange={(e) => setEventTag(e.target.value)}
                    placeholder="e.g. Halloween_Party_2026"
                    className="w-full px-3 py-1.5 bg-white border border-border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-txt-primary block mb-1">
                    Default Spend per Attendee (₹, optional):
                  </span>
                  <input
                    type="number"
                    value={String(defaultSpendInr)}
                    onChange={(e) => setDefaultSpendInr(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 1500"
                    className="w-full px-3 py-1.5 bg-white border border-border rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Column Mapping */}
            {importHeaders.length > 0 && (
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold text-txt-primary">Map File Columns:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-txt-primary mb-0.5">Name *</label>
                    <select
                      value={mapping.name}
                      onChange={(e) => setMapping({ ...mapping, name: e.target.value })}
                      className="w-full p-1.5 border border-border rounded-md text-xs bg-bg-input"
                    >
                      <option value="">Select column</option>
                      {importHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-txt-primary mb-0.5">Phone *</label>
                    <select
                      value={mapping.phone}
                      onChange={(e) => setMapping({ ...mapping, phone: e.target.value })}
                      className="w-full p-1.5 border border-border rounded-md text-xs bg-bg-input"
                    >
                      <option value="">Select column</option>
                      {importHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-txt-primary mb-0.5">Email *</label>
                    <select
                      value={mapping.email}
                      onChange={(e) => setMapping({ ...mapping, email: e.target.value })}
                      className="w-full p-1.5 border border-border rounded-md text-xs bg-bg-input"
                    >
                      <option value="">Select column</option>
                      {importHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-txt-primary mb-0.5">Tags (optional)</label>
                    <select
                      value={mapping.tags}
                      onChange={(e) => setMapping({ ...mapping, tags: e.target.value })}
                      className="w-full p-1.5 border border-border rounded-md text-xs bg-bg-input"
                    >
                      <option value="">Select column</option>
                      {importHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-txt-primary mb-0.5">Spend (optional)</label>
                    <select
                      value={mapping.total_spend_inr}
                      onChange={(e) => setMapping({ ...mapping, total_spend_inr: e.target.value })}
                      className="w-full p-1.5 border border-border rounded-md text-xs bg-bg-input"
                    >
                      <option value="">Select column</option>
                      {importHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Consent confirmation */}
            <div className="p-3 bg-bg-input border border-border rounded-lg">
              <label className="flex items-start gap-2 text-[11px] text-txt-primary cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={confirmConsent}
                  onChange={(e) => setConfirmConsent(e.target.checked)}
                  className="w-4 h-4 accent-brand rounded mt-0.5"
                />
                <span>
                  <strong>I confirm these contacts have given consent to receive event announcements.</strong>
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setIsImportModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!importFile || !confirmConsent} isLoading={isImporting}>
                Process Smart Ingestion
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
