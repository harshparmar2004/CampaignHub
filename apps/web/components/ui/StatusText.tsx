import React from 'react';

export type StatusType =
  | 'success'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'approved'
  | 'posted'
  | 'completed'
  | 'pending'
  | 'scheduled'
  | 'queued'
  | 'running'
  | 'failed'
  | 'rejected'
  | 'bounced'
  | 'cancelled'
  | 'skipped'
  | 'draft'
  | 'paused';

interface StatusTextProps {
  status: string;
  className?: string;
}

export function StatusText({ status, className = '' }: StatusTextProps) {
  const s = status.toLowerCase();

  let colorClass = 'text-txt-muted';

  if (['success', 'sent', 'delivered', 'read', 'approved', 'posted', 'completed'].includes(s)) {
    colorClass = 'text-status-success font-medium';
  } else if (['pending', 'scheduled', 'queued', 'running', 'paused'].includes(s)) {
    colorClass = 'text-status-pending font-medium';
  } else if (['failed', 'rejected', 'bounced', 'cancelled', 'error'].includes(s)) {
    colorClass = 'text-status-failed font-medium';
  } else if (['skipped', 'draft'].includes(s)) {
    colorClass = 'text-txt-muted';
  }

  // Format label: capitalized words
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-block text-sm ${colorClass} ${className}`}>
      {label}
    </span>
  );
}
