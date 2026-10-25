import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizePhone, ContactInputSchema, computeContactTier } from '@campaignhub/shared';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';
    const tier = searchParams.get('tier') || '';
    const optInFilter = searchParams.get('optIn') || 'all'; // all, whatsapp, email, unsubscribed
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();
    let query = supabase.from('contacts').select('*', { count: 'exact' });

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`name.ilike.${term},phone.ilike.${term},email.ilike.${term}`);
    }

    if (tag.trim()) {
      query = query.contains('tags', [tag.trim()]);
    }

    if (tier.trim() && tier !== 'all') {
      query = query.eq('tier', tier.trim());
    }

    if (optInFilter === 'whatsapp') {
      query = query.eq('whatsapp_opt_in', true).eq('unsubscribed', false);
    } else if (optInFilter === 'email') {
      query = query.eq('email_opt_in', true).eq('unsubscribed', false);
    } else if (optInFilter === 'unsubscribed') {
      query = query.eq('unsubscribed', true);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Also get all contacts metadata for filter badges & counts
    const { data: allRows } = await supabase.from('contacts').select('tags, tier, unsubscribed');
    const allTags = new Set<string>();
    const tagCounts: Record<string, number> = {};
    const tierCounts = {
      all: allRows?.length || 0,
      vip: 0,
      regular: 0,
      lead: 0,
      unsubscribed: 0,
    };

    allRows?.forEach((r: any) => {
      r.tags?.forEach((t: string) => {
        allTags.add(t);
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
      if (r.unsubscribed) {
        tierCounts.unsubscribed++;
      }
      const t = r.tier || 'lead';
      if (t === 'vip') tierCounts.vip++;
      else if (t === 'regular') tierCounts.regular++;
      else tierCounts.lead++;
    });

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      limit,
      tierCounts,
      totalTags: allTags.size,
      tagCounts,
      availableTags: Array.from(allTags).sort(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = ContactInputSchema.parse(body);

    // Normalize phone to E.164 with +91 default
    const phoneNorm = normalizePhone(validated.phone);
    if (!phoneNorm.isValid) {
      return NextResponse.json(
        { success: false, error: phoneNorm.error || 'Invalid phone format' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    let cleanTags = validated.tags ? [...validated.tags] : [];
    const parties = validated.parties_attended ?? 0;

    // Auto-compute tier if not explicitly specified
    const computedTier =
      validated.tier ||
      computeContactTier({
        tags: cleanTags,
        parties_attended: parties,
        total_spend_inr: validated.total_spend_inr,
        unsubscribed: validated.unsubscribed,
      });

    if (parties > 0 || computedTier === 'vip' || computedTier === 'regular') {
      cleanTags = cleanTags.filter((t) => t.trim().toUpperCase() !== 'LEAD');
    }
    if (computedTier === 'vip' && !cleanTags.map((t) => t.toUpperCase()).includes('VIP')) {
      cleanTags.push('VIP');
    }

    const contactPayload = {
      name: validated.name,
      phone: phoneNorm.e164,
      email: validated.email.toLowerCase(),
      tags: cleanTags,
      tier: computedTier,
      parties_attended: parties,
      total_spend_inr: validated.total_spend_inr ?? 0,
      last_attended_at: validated.last_attended_at || null,
      engagement_score: validated.engagement_score ?? 0,
      notes: validated.notes || null,
      whatsapp_opt_in: validated.whatsapp_opt_in,
      email_opt_in: validated.email_opt_in,
      telegram_chat_id: validated.telegram_chat_id || null,
      unsubscribed: validated.unsubscribed,
      consent_source: validated.consent_source || 'manual_entry',
      consent_at: validated.consent_at || new Date().toISOString(),
    };

    if (validated.id) {
      // Update existing
      const { data, error } = await supabase
        .from('contacts')
        .update(contactPayload)
        .eq('id', validated.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('contacts')
        .insert(contactPayload)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json(
            {
              success: false,
              error: 'A contact with this phone number or email address already exists.',
            },
            { status: 409 }
          );
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data }, { status: 201 });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Validation error' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Must provide an array of contact IDs to delete' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('contacts').delete().in('id', ids);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Successfully deleted ${ids.length} contacts` });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete contacts' },
      { status: 500 }
    );
  }
}
