'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusText } from '@/components/ui/StatusText';
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface NeedsAttentionProps {
  data: {
    failedMessagesCount: number;
    rejectedTemplates: { name: string; status: string; rejection_reason?: string }[];
    pendingTemplatesCount: number;
    systemAlerts: { id: string; type: string; message: string; severity: string }[];
    checklist: {
      whatsappConfigured: boolean;
      emailConfigured: boolean;
      telegramConfigured: boolean;
    };
  } | null;
}

export function NeedsAttentionCard({ data }: NeedsAttentionProps) {
  if (!data) return null;

  const {
    failedMessagesCount,
    rejectedTemplates,
    pendingTemplatesCount,
    systemAlerts,
    checklist,
  } = data;

  const hasIssues =
    failedMessagesCount > 0 ||
    rejectedTemplates.length > 0 ||
    pendingTemplatesCount > 0 ||
    systemAlerts.length > 0 ||
    !checklist.whatsappConfigured ||
    !checklist.emailConfigured ||
    !checklist.telegramConfigured;

  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${hasIssues ? 'text-status-failed' : 'text-brand'}`} />
            <span>Needs Attention</span>
          </CardTitle>
        </CardHeader>

        <div className="space-y-3 text-xs">
          {/* Campaign Failure Threshold Alerts */}
          {systemAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3 bg-red-50 border border-red-200 rounded-element text-status-failed space-y-1"
            >
              <span className="font-bold block uppercase tracking-wider text-[10px]">
                Critical Campaign Warning
              </span>
              <p>{alert.message}</p>
            </div>
          ))}

          {/* Failed Messages Count */}
          {failedMessagesCount > 0 && (
            <div className="flex items-center justify-between p-2.5 bg-bg-input border border-border rounded-element">
              <span className="text-txt-primary font-medium">Failed Messages Requiring Triage</span>
              <span className="text-status-failed font-bold">{failedMessagesCount} failed</span>
            </div>
          )}

          {/* Rejected WhatsApp Templates */}
          {rejectedTemplates.length > 0 && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-element space-y-1">
              <span className="text-status-failed font-bold block">
                {rejectedTemplates.length} WhatsApp Template(s) Rejected by Meta:
              </span>
              {rejectedTemplates.map((t, idx) => (
                <div key={idx} className="text-txt-primary flex items-center justify-between">
                  <span>{t.name}</span>
                  <span className="text-status-failed">{t.rejection_reason || 'Policy violation'}</span>
                </div>
              ))}
            </div>
          )}

          {/* Pending WhatsApp Templates */}
          {pendingTemplatesCount > 0 && (
            <div className="flex items-center justify-between p-2.5 bg-bg-input border border-border rounded-element">
              <span className="text-txt-primary">WhatsApp Templates Pending Meta Approval</span>
              <span className="text-status-pending font-bold">{pendingTemplatesCount} pending</span>
            </div>
          )}

          {/* Missing Channel Connections */}
          {(!checklist.whatsappConfigured || !checklist.emailConfigured || !checklist.telegramConfigured) && (
            <div className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-element space-y-1.5">
              <span className="text-status-pending font-bold block">Missing Channel Credentials:</span>
              <div className="space-y-1">
                {!checklist.whatsappConfigured && (
                  <p className="text-txt-muted">• WhatsApp Permanent Token or Phone ID not set</p>
                )}
                {!checklist.emailConfigured && (
                  <p className="text-txt-muted">• Resend API Key or Sender Address not configured</p>
                )}
                {!checklist.telegramConfigured && (
                  <p className="text-txt-muted">• Telegram Bot Token or Channel ID missing</p>
                )}
              </div>
            </div>
          )}

          {!hasIssues && (
            <div className="py-6 text-center text-brand space-y-1">
              <CheckCircle className="w-8 h-8 mx-auto text-brand" />
              <p className="font-bold text-sm">All Systems Healthy</p>
              <p className="text-txt-muted">
                Zero delivery failures, domain authenticated, and templates approved.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 mt-2 border-t border-border">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-xs text-brand hover:text-brand-hover font-bold transition-colors"
        >
          <span>Open Settings & Credentials Vault</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
