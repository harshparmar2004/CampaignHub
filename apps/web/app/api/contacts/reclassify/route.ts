import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { computeContactTier } from '@campaignhub/shared';

export async function POST() {
  try {
    const supabase = createAdminClient();

    const { data: contacts, error } = await supabase.from('contacts').select('*');
    if (error || !contacts) {
      return NextResponse.json({ success: false, error: error?.message || 'Failed to fetch contacts' }, { status: 500 });
    }

    let updatedCount = 0;
    const tierCounts = { vip: 0, regular: 0, lead: 0, inactive: 0 };

    for (const contact of contacts) {
      const parties = Number(contact.parties_attended) || 0;
      let tags = Array.isArray(contact.tags) ? [...contact.tags] : [];

      // If attendee or repeat visitor, strip out 'Lead' tag
      if (parties > 0 || contact.tier === 'vip' || contact.tier === 'regular') {
        tags = tags.filter((t: string) => t.trim().toUpperCase() !== 'LEAD');
      }

      const computedTier = computeContactTier({
        tags,
        parties_attended: parties,
        total_spend_inr: contact.total_spend_inr || 0,
        unsubscribed: contact.unsubscribed || false,
      });

      if (computedTier === 'vip' && !tags.map((t: string) => t.toUpperCase()).includes('VIP')) {
        tags.push('VIP');
      }

      tierCounts[computedTier] = (tierCounts[computedTier] || 0) + 1;

      const tierChanged = computedTier !== contact.tier;
      const tagsChanged = JSON.stringify(tags) !== JSON.stringify(contact.tags || []);

      if (tierChanged || tagsChanged) {
        await supabase
          .from('contacts')
          .update({ tier: computedTier, tags })
          .eq('id', contact.id);
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Audited ${contacts.length} contacts. Updated ${updatedCount} tier assignments.`,
      updatedCount,
      tierCounts,
      totalCount: contacts.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to reclassify tiers' }, { status: 500 });
  }
}
