import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizePhone, CsvImportPayloadSchema, computeContactTier } from '@campaignhub/shared';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CsvImportPayloadSchema.parse(body);

    const supabase = createAdminClient();

    // 1. Fetch all existing contacts to match by phone or email
    const { data: existingContacts, error: fetchErr } = await supabase
      .from('contacts')
      .select('*');

    if (fetchErr) {
      return NextResponse.json({ success: false, error: fetchErr.message }, { status: 500 });
    }

    const phoneToContact = new Map<string, any>();
    const emailToContact = new Map<string, any>();

    (existingContacts || []).forEach((c: any) => {
      if (c.phone) phoneToContact.set(c.phone, c);
      if (c.email) emailToContact.set(c.email.toLowerCase(), c);
    });

    const toInsert: any[] = [];
    const toUpdate: { id: string; updates: any }[] = [];
    const skipped: { row: number; name: string; identifier: string; reason: string }[] = [];

    const seenInBatchPhones = new Set<string>();
    const seenInBatchEmails = new Set<string>();

    const now = new Date().toISOString();
    let promotedToVipCount = 0;

    for (let i = 0; i < validated.rows.length; i++) {
      const row = validated.rows[i];
      const rowNum = i + 1;

      // Validate email
      const email = (row.email || '').toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        skipped.push({ row: rowNum, name: row.name, identifier: row.email, reason: 'Invalid email address' });
        continue;
      }

      // Normalize phone
      const phoneNorm = normalizePhone(row.phone, '+91');
      if (!phoneNorm.isValid) {
        skipped.push({ row: rowNum, name: row.name, identifier: String(row.phone), reason: phoneNorm.error || 'Invalid phone format' });
        continue;
      }
      const phone = phoneNorm.e164;

      // Deduplicate within the file itself
      if (seenInBatchPhones.has(phone)) {
        skipped.push({ row: rowNum, name: row.name, identifier: phone, reason: 'Duplicate phone within import file' });
        continue;
      }
      if (seenInBatchEmails.has(email)) {
        skipped.push({ row: rowNum, name: row.name, identifier: email, reason: 'Duplicate email within import file' });
        continue;
      }
      seenInBatchPhones.add(phone);
      seenInBatchEmails.add(email);

      // Parse tags from row + optional event_tag
      let rowTags: string[] = [];
      if (row.tags) {
        rowTags = String(row.tags)
          .split(/[,;|]/)
          .map((t) => t.trim())
          .filter(Boolean);
      }
      if (validated.event_tag && validated.event_tag.trim()) {
        rowTags.push(validated.event_tag.trim());
      }

      // Check if contact already exists
      const existing = phoneToContact.get(phone) || emailToContact.get(email);

      if (existing) {
        if (validated.import_mode === 'skip') {
          skipped.push({
            row: rowNum,
            name: row.name,
            identifier: phone,
            reason: 'Contact already exists (skip duplicates mode)',
          });
          continue;
        }

        if (validated.import_mode === 'merge') {
          // Attendance check
          const isAttended =
            validated.is_event_attendance ||
            row.attended === true ||
            String(row.attended).toLowerCase() === 'true' ||
            String(row.attended).toLowerCase() === 'yes';

          const increment = isAttended ? 1 : (Number(row.parties_attended) || 0);
          const newPartiesCount = (existing.parties_attended || 0) + increment;
          const spendIncrement = Number(row.total_spend_inr) || validated.default_spend_inr || 0;
          const newTotalSpend = (Number(existing.total_spend_inr) || 0) + spendIncrement;

          // Merge tags and filter out 'Lead' if they have attended any event
          let mergedTags = Array.from(new Set([...(existing.tags || []), ...rowTags]));
          if (isAttended || newPartiesCount > 0 || validated.direct_vip) {
            mergedTags = mergedTags.filter((t) => t.trim().toUpperCase() !== 'LEAD');
          }

          const oldTier = existing.tier || 'lead';
          let newTier: any;

          if (validated.direct_vip) {
            newTier = 'vip';
            if (!mergedTags.map((t) => t.toUpperCase()).includes('VIP')) {
              mergedTags.push('VIP');
            }
          } else {
            newTier = computeContactTier({
              tags: mergedTags,
              parties_attended: newPartiesCount,
              total_spend_inr: newTotalSpend,
              unsubscribed: existing.unsubscribed,
            });
            if (newTier === 'vip' && !mergedTags.map((t) => t.toUpperCase()).includes('VIP')) {
              mergedTags.push('VIP');
            }
          }

          if (newTier === 'vip' && oldTier !== 'vip') {
            promotedToVipCount++;
          }

          const updates: any = {
            name: row.name.trim() || existing.name,
            tags: mergedTags,
            tier: newTier,
            parties_attended: newPartiesCount,
            total_spend_inr: newTotalSpend,
          };

          if (isAttended) {
            updates.last_attended_at = now;
          }
          if (row.notes) {
            updates.notes = existing.notes
              ? `${existing.notes} | ${row.notes.trim()}`
              : row.notes.trim();
          }

          toUpdate.push({ id: existing.id, updates });
        } else if (validated.import_mode === 'replace') {
          const isAttended =
            validated.is_event_attendance ||
            row.attended === true ||
            String(row.attended).toLowerCase() === 'true' ||
            String(row.attended).toLowerCase() === 'yes';

          const parties = isAttended ? 1 : Number(row.parties_attended) || 0;
          const spend = Number(row.total_spend_inr) || validated.default_spend_inr || 0;

          let cleanTags = [...rowTags];
          if (isAttended || parties > 0 || validated.direct_vip) {
            cleanTags = cleanTags.filter((t) => t.trim().toUpperCase() !== 'LEAD');
          }

          let newTier: any;
          if (validated.direct_vip) {
            newTier = 'vip';
            if (!cleanTags.map((t) => t.toUpperCase()).includes('VIP')) {
              cleanTags.push('VIP');
            }
          } else {
            newTier = computeContactTier({
              tags: cleanTags,
              parties_attended: parties,
              total_spend_inr: spend,
              unsubscribed: false,
            });
            if (newTier === 'vip' && !cleanTags.map((t) => t.toUpperCase()).includes('VIP')) {
              cleanTags.push('VIP');
            }
          }

          if (newTier === 'vip' && existing.tier !== 'vip') {
            promotedToVipCount++;
          }

          toUpdate.push({
            id: existing.id,
            updates: {
              name: row.name.trim(),
              phone,
              email,
              tags: cleanTags,
              tier: newTier,
              parties_attended: parties,
              total_spend_inr: spend,
              last_attended_at: isAttended ? now : null,
              notes: row.notes ? row.notes.trim() : null,
            },
          });
        }
      } else {
        // Net new contact
        const isAttended =
          validated.is_event_attendance ||
          row.attended === true ||
          String(row.attended).toLowerCase() === 'true' ||
          String(row.attended).toLowerCase() === 'yes';

        const parties = isAttended ? 1 : Number(row.parties_attended) || 0;
        const spend = Number(row.total_spend_inr) || validated.default_spend_inr || 0;

        let initialTags = [...rowTags];
        if (isAttended || parties > 0 || validated.direct_vip) {
          initialTags = initialTags.filter((t) => t.trim().toUpperCase() !== 'LEAD');
        }

        let tier: any;
        if (validated.direct_vip) {
          tier = 'vip';
          if (!initialTags.map((t) => t.toUpperCase()).includes('VIP')) {
            initialTags.push('VIP');
          }
        } else {
          tier = computeContactTier({
            tags: initialTags,
            parties_attended: parties,
            total_spend_inr: spend,
            unsubscribed: false,
          });
          if (tier === 'vip' && !initialTags.map((t) => t.toUpperCase()).includes('VIP')) {
            initialTags.push('VIP');
          }
        }

        if (tier === 'vip') {
          promotedToVipCount++;
        }

        toInsert.push({
          name: row.name.trim(),
          phone,
          email,
          tags: initialTags,
          tier,
          parties_attended: parties,
          total_spend_inr: spend,
          last_attended_at: isAttended ? now : null,
          engagement_score: 0,
          notes: row.notes ? row.notes.trim() : null,
          whatsapp_opt_in: true,
          email_opt_in: true,
          telegram_chat_id: row.telegram_chat_id ? String(row.telegram_chat_id).trim() : null,
          unsubscribed: false,
          consent_source: validated.consent_source || 'csv_import',
          consent_at: now,
          created_at: now,
        });
      }
    }

    // 2. Perform updates
    for (const item of toUpdate) {
      await supabase.from('contacts').update(item.updates).eq('id', item.id);
    }

    // 3. Perform batch inserts
    if (toInsert.length > 0) {
      const chunkSize = 200;
      for (let i = 0; i < toInsert.length; i += chunkSize) {
        const chunk = toInsert.slice(i, i + chunkSize);
        const { error: insertErr } = await supabase.from('contacts').insert(chunk);
        if (insertErr) {
          return NextResponse.json(
            { success: false, error: `Batch insert error: ${insertErr.message}` },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: validated.rows.length,
        addedCount: toInsert.length,
        updatedCount: toUpdate.length,
        promotedToVipCount,
        skippedCount: skipped.length,
        skippedDetails: skipped,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Import processing failed' },
      { status: 400 }
    );
  }
}
