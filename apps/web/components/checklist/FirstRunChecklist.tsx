'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ChecklistProps {
  checklist: {
    whatsappConfigured: boolean;
    emailConfigured: boolean;
    telegramConfigured: boolean;
  };
}

export function FirstRunChecklist({ checklist }: ChecklistProps) {
  const items = [
    {
      title: 'Database & Auth Connected',
      description: 'Supabase PostgreSQL tables, indexes, and Row Level Security active.',
      isReady: true,
      link: '/contacts',
    },
    {
      title: 'AES-256-GCM Encryption Key',
      description: 'Cryptographic vault initialized with 32-byte hexadecimal key.',
      isReady: true,
      link: '/settings',
    },
    {
      title: 'Meta WhatsApp Cloud API',
      description: 'Permanent System User token and Phone Number ID configured.',
      isReady: checklist.whatsappConfigured,
      link: '/settings',
    },
    {
      title: 'Resend Transactional Email',
      description: 'API key and authenticated sending domain registered.',
      isReady: checklist.emailConfigured,
      link: '/settings',
    },
    {
      title: 'Telegram Bot API',
      description: 'Bot token and target broadcasting channel ID configured.',
      isReady: checklist.telegramConfigured,
      link: '/settings',
    },
  ];

  const allReady = items.every((i) => i.isReady);

  if (allReady) return null; // Auto-dismiss once fully configured

  return (
    <Card className="border-border-strong bg-bg-surface">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand" />
            <span>CampaignHub First-Run Readiness Checklist</span>
          </CardTitle>
          <CardDescription>
            Complete the following channel integrations to enable 24/7 autonomous dispatch.
          </CardDescription>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-card border text-xs flex flex-col justify-between ${
              item.isReady
                ? 'bg-brand-soft/40 border-brand/30'
                : 'bg-amber-50/50 border-amber-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-txt-primary">{item.title}</span>
                {item.isReady ? (
                  <span className="text-brand font-medium">Ready</span>
                ) : (
                  <span className="text-status-pending font-medium">Missing</span>
                )}
              </div>
              <p className="text-txt-muted text-[11px] leading-relaxed">{item.description}</p>
            </div>

            {!item.isReady && (
              <div className="pt-2 mt-2 border-t border-border/50">
                <Link
                  href={item.link}
                  className="text-brand hover:text-brand-hover font-bold inline-flex items-center gap-1 text-[11px]"
                >
                  <span>Configure</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
