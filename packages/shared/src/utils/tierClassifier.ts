import type { ContactTier } from '../types/index.js';

export interface TierClassificationInput {
  tags?: string[];
  tier?: string | null;
  parties_attended?: number;
  total_spend_inr?: number;
  unsubscribed?: boolean;
}

/**
 * Computes the customer tier based on attendance, spend, and explicit VIP tags.
 * - 'vip': Attended >= 2 parties (repeat attendee) OR total spend >= ₹3,000 OR explicitly tagged 'VIP'/'VVIP'
 * - 'regular': Attended 1 party (first-time attendee) OR spend > 0 OR tagged 'REGULAR'/'MID'
 * - 'lead': 0 parties attended, no spend, general inquiry / registered
 * - 'inactive': Unsubscribed or inactive
 */
export function computeContactTier(contact: TierClassificationInput): ContactTier {
  if (contact.unsubscribed) {
    return 'inactive';
  }

  const tags = contact.tags || [];
  const normalizedTags = tags.map((t) => t.trim().toUpperCase());

  // Explicit override via tag
  const isExplicitVip = normalizedTags.includes('VIP') || normalizedTags.includes('VVIP');
  const isExplicitMid =
    normalizedTags.includes('REGULAR') ||
    normalizedTags.includes('MID') ||
    normalizedTags.includes('MID-TIER');

  const parties = Number(contact.parties_attended) || 0;
  const spend = Number(contact.total_spend_inr) || 0;

  // 1. VIP Tier qualification: Repeat attendees (2+ parties), spend >= ₹3,000, or tagged VIP
  if (isExplicitVip || parties >= 2 || spend >= 3000) {
    return 'vip';
  }

  // 2. Regular / Mid-Tier qualification: 1 party attended or spend > 0
  if (isExplicitMid || parties >= 1 || spend > 0) {
    return 'regular';
  }

  // 3. Default to Lead / Non-attendee
  return 'lead';
}
