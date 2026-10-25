import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || 'all'; // '1'-'12' or 'all'
    const year = searchParams.get('year') || 'all';   // '2026' or 'all'

    const supabase = createAdminClient();

    // 1. Fetch all campaigns
    const { data: allCampaigns, error: campErr } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (campErr) {
      return NextResponse.json({ success: false, error: campErr.message }, { status: 500 });
    }

    // 2. Fetch all messages
    const { data: allMessages, error: msgErr } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (msgErr) {
      return NextResponse.json({ success: false, error: msgErr.message }, { status: 500 });
    }

    // 3. Fetch all contacts
    const { data: allContacts, error: contactErr } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (contactErr) {
      return NextResponse.json({ success: false, error: contactErr.message }, { status: 500 });
    }

    // 4. Helper for date filtering
    const matchesPeriod = (dateString?: string | null) => {
      if (!dateString) return false;
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return false;

      if (month !== 'all') {
        const m = d.getMonth() + 1;
        if (String(m) !== month) return false;
      }
      if (year !== 'all') {
        const y = d.getFullYear();
        if (String(y) !== year) return false;
      }
      return true;
    };

    // Filter campaigns by period
    const campaigns = (allCampaigns || []).filter((c: any) => {
      if (month === 'all' && year === 'all') return true;
      return matchesPeriod(c.created_at);
    });

    const campaignIdSet = new Set(campaigns.map((c: any) => c.id));

    // Filter messages for these campaigns
    const messages = (allMessages || []).filter((m: any) => campaignIdSet.has(m.campaign_id));

    // Filter contacts created in this period
    const newContacts = (allContacts || []).filter((c: any) => {
      if (month === 'all' && year === 'all') return true;
      return matchesPeriod(c.created_at);
    });

    // 5. Aggregate Financials & Operations
    let whatsAppSpendInr = 0;
    let whatsAppCount = 0;
    let emailCount = 0;
    let telegramCount = 0;
    let instagramCount = 0;

    let totalDelivered = 0;
    let totalRead = 0;
    let totalFailed = 0;

    const channelStats: Record<string, { total: number; delivered: number; read: number; failed: number; spend: number }> = {
      whatsapp: { total: 0, delivered: 0, read: 0, failed: 0, spend: 0 },
      email: { total: 0, delivered: 0, read: 0, failed: 0, spend: 0 },
      telegram: { total: 0, delivered: 0, read: 0, failed: 0, spend: 0 },
      instagram: { total: 0, delivered: 0, read: 0, failed: 0, spend: 0 },
    };

    messages.forEach((m: any) => {
      const ch = (m.channel || 'whatsapp').toLowerCase();
      if (!channelStats[ch]) {
        channelStats[ch] = { total: 0, delivered: 0, read: 0, failed: 0, spend: 0 };
      }
      channelStats[ch].total++;

      const cost = Number(m.cost_inr) || 0;
      if (ch === 'whatsapp') {
        whatsAppSpendInr += cost;
        channelStats.whatsapp.spend += cost;
        whatsAppCount++;
      } else if (ch === 'email') {
        emailCount++;
      } else if (ch === 'telegram') {
        telegramCount++;
      } else if (ch === 'instagram') {
        instagramCount++;
      }

      if (m.status === 'delivered') {
        totalDelivered++;
        channelStats[ch].delivered++;
      } else if (m.status === 'read') {
        totalDelivered++;
        totalRead++;
        channelStats[ch].delivered++;
        channelStats[ch].read++;
      } else if (m.status === 'failed') {
        totalFailed++;
        channelStats[ch].failed++;
      }
    });

    // Commercial Email API spend post-trial @ ₹0.08 / email
    const emailPaidSpendInr = Number((emailCount * 0.08).toFixed(2));
    channelStats.email.spend = emailPaidSpendInr;

    // Total Net Spend
    const totalExpenditureInr = Number((whatsAppSpendInr + emailPaidSpendInr).toFixed(2));

    // Native Free Channel Savings vs ₹0.82 WhatsApp unit cost
    const freeDeliveriesCount = channelStats.telegram.delivered + channelStats.instagram.delivered;
    const freeChannelSavingsInr = Number((freeDeliveriesCount * 0.82).toFixed(2));

    const totalMessagesCount = messages.length;
    const deliveryRate = totalMessagesCount > 0 ? Math.round((totalDelivered / totalMessagesCount) * 100) : 100;
    const readRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;

    // Unit Economics
    const blendedCostPerReach = totalDelivered > 0 ? Number((totalExpenditureInr / totalDelivered).toFixed(2)) : 0;
    const monthlyBudgetCeiling = 10000;
    const budgetRemainingInr = Math.max(0, Number((monthlyBudgetCeiling - totalExpenditureInr).toFixed(2)));

    // 6. Contact Database Acquisition Metrics
    let newVipCount = 0;
    let newRegularCount = 0;
    let newLeadCount = 0;

    newContacts.forEach((c: any) => {
      const t = (c.tier || 'lead').toLowerCase();
      if (t === 'vip') newVipCount++;
      else if (t === 'regular') newRegularCount++;
      else newLeadCount++;
    });

    const totalDatabaseSize = (allContacts || []).length;
    const totalOptInWhatsApp = (allContacts || []).filter((c: any) => c.whatsapp_opt_in && !c.unsubscribed).length;
    const totalOptInEmail = (allContacts || []).filter((c: any) => c.email_opt_in && !c.unsubscribed).length;
    const totalUnsubscribed = (allContacts || []).filter((c: any) => c.unsubscribed).length;

    const optInStats = {
      whatsAppOptInRate: totalDatabaseSize > 0 ? Math.round((totalOptInWhatsApp / totalDatabaseSize) * 100) : 100,
      emailOptInRate: totalDatabaseSize > 0 ? Math.round((totalOptInEmail / totalDatabaseSize) * 100) : 100,
      unsubscribedCount: totalUnsubscribed,
    };

    // 7. Campaign Ledger Breakdown Table
    const campaignsBreakdown = campaigns.map((c: any) => {
      const cMsgs = messages.filter((m: any) => m.campaign_id === c.id);
      const cTotal = cMsgs.length;
      const cDelivered = cMsgs.filter((m: any) => m.status === 'delivered' || m.status === 'read').length;
      const cRead = cMsgs.filter((m: any) => m.status === 'read').length;
      const cFailed = cMsgs.filter((m: any) => m.status === 'failed').length;

      let cCost = cMsgs.reduce((acc: number, m: any) => acc + (Number(m.cost_inr) || 0), 0);
      const cEmailMsgs = cMsgs.filter((m: any) => (m.channel || '').toLowerCase() === 'email').length;
      cCost += cEmailMsgs * 0.08;

      return {
        id: c.id,
        name: c.name,
        category: c.category || 'Standard Broadcast',
        status: c.status || 'completed',
        channels: c.channels || ['whatsapp'],
        audience_tier: c.audience_tier || 'all',
        created_at: c.created_at,
        recipientsCount: cTotal,
        deliveredCount: cDelivered,
        readCount: cRead,
        failedCount: cFailed,
        costInr: Number(cCost.toFixed(2)),
        deliveryRate: cTotal > 0 ? Math.round((cDelivered / cTotal) * 100) : 100,
        readRate: cDelivered > 0 ? Math.round((cRead / cDelivered) * 100) : 0,
      };
    });

    // 8. Period Name Label
    const monthNames = [
      '', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    let periodLabel = 'All-Time Historical Statement';
    if (month !== 'all' && year !== 'all') {
      periodLabel = `${monthNames[Number(month)]} ${year} Monthly Statement`;
    } else if (month !== 'all') {
      periodLabel = `${monthNames[Number(month)]} (All Years)`;
    } else if (year !== 'all') {
      periodLabel = `Fiscal Year ${year} Executive Statement`;
    }

    // 9. Automated Executive Takeaways
    const executiveHighlights = [
      `Executed ${campaigns.length} multi-channel campaigns with an overall verified delivery success rate of ${deliveryRate}%.`,
      `Net paid infrastructure expenditure was ₹${totalExpenditureInr.toFixed(2)} INR (Meta WhatsApp @ ₹${whatsAppSpendInr.toFixed(2)} + Commercial Email @ ₹${emailPaidSpendInr.toFixed(2)}).`,
      `Saved an estimated ₹${freeChannelSavingsInr.toFixed(2)} INR by leveraging Telegram and Instagram native APIs for ${freeDeliveriesCount} free guest touchpoints.`,
      `Database expanded with ${newContacts.length} new registered contacts (${newVipCount} VIPs, ${newRegularCount} Regulars, ${newLeadCount} Leads) maintaining a ${optInStats.whatsAppOptInRate}% WhatsApp opt-in consent rate.`,
    ];

    return NextResponse.json({
      success: true,
      data: {
        period: {
          month,
          year,
          label: periodLabel,
          generatedAt: new Date().toISOString(),
        },
        financials: {
          totalExpenditureInr,
          whatsAppSpendInr,
          emailPaidSpendInr,
          freeChannelSavingsInr,
          budgetRemainingInr,
          monthlyBudgetCeiling,
          blendedCostPerReach,
        },
        operations: {
          totalCampaigns: campaigns.length,
          completedCampaigns: campaigns.filter((c: any) => c.status === 'completed').length,
          scheduledCampaigns: campaigns.filter((c: any) => c.status === 'scheduled').length,
          activeCampaigns: campaigns.filter((c: any) => c.status === 'running').length,
          totalMessages: totalMessagesCount,
          totalDelivered,
          totalRead,
          totalFailed,
          deliveryRate,
          readRate,
          channels: channelStats,
        },
        database: {
          newContactsCount: newContacts.length,
          newVipCount,
          newRegularCount,
          newLeadCount,
          totalDatabaseSize,
          growthRatePercent: totalDatabaseSize > 0 ? Number((newContacts.length / totalDatabaseSize * 100).toFixed(1)) : 0,
          optInStats,
          contacts: newContacts.map((c: any) => ({
            id: c.id,
            name: c.name || 'Unnamed Contact',
            phone: c.phone || '',
            email: c.email || '',
            tier: c.tier || 'lead',
            tags: c.tags || [],
            parties_attended: Number(c.parties_attended) || 0,
            whatsapp_opt_in: Boolean(c.whatsapp_opt_in),
            email_opt_in: Boolean(c.email_opt_in),
            created_at: c.created_at,
          })),
        },
        campaigns: campaignsBreakdown,
        executiveHighlights,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/reports route:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
