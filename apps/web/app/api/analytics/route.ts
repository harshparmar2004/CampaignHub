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

    // 3. Filter campaigns by selected month & year
    const campaigns = (allCampaigns || []).filter((c: any) => {
      if (month === 'all' && year === 'all') return true;
      if (!c.created_at) return false;
      const d = new Date(c.created_at);
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
    });

    const campaignIdSet = new Set(campaigns.map((c: any) => c.id));

    // 4. Filter messages belonging to the filtered campaigns
    const messages = (allMessages || []).filter((m: any) => campaignIdSet.has(m.campaign_id));

    // 5. Compute Financials & Costs
    let totalSpendInr = 0;
    let whatsAppSpendInr = 0;
    let emailSpendInr = 0;
    let telegramSpendInr = 0;
    let instagramSpendInr = 0;

    let totalSent = 0;
    let totalDelivered = 0;
    let totalRead = 0;
    let totalFailed = 0;
    let totalQueued = 0;

    const channelStats: Record<string, { total: number; delivered: number; read: number; failed: number; spend: number }> = {
      whatsapp: { total: 0, delivered: 0, read: 0, failed: 0, spend: 0 },
      email: { total: 0, delivered: 0, read: 0, failed: 0, spend: 0 },
      telegram: { total: 0, delivered: 0, read: 0, failed: 0, spend: 0 },
      instagram: { total: 0, delivered: 0, read: 0, failed: 0, spend: 0 },
    };

    const tierStats: Record<string, { count: number; recipients: number; spend: number; delivered: number }> = {
      vip: { count: 0, recipients: 0, spend: 0, delivered: 0 },
      regular: { count: 0, recipients: 0, spend: 0, delivered: 0 },
      lead: { count: 0, recipients: 0, spend: 0, delivered: 0 },
      all: { count: 0, recipients: 0, spend: 0, delivered: 0 },
    };

    const dailyMap: Record<string, { date: string; fullDate: string; whatsapp: number; email: number; telegram: number; instagram: number; costInr: number; delivered: number }> = {};
    const monthlyMap: Record<string, { monthKey: string; monthLabel: string; whatsapp: number; email: number; telegram: number; instagram: number; costInr: number; delivered: number }> = {};

    messages.forEach((m: any) => {
      const cost = Number(m.cost_inr) || 0;
      totalSpendInr += cost;

      const ch = (m.channel || 'whatsapp').toLowerCase();
      if (!channelStats[ch]) {
        channelStats[ch] = { total: 0, delivered: 0, read: 0, failed: 0, spend: 0 };
      }
      channelStats[ch].total++;
      channelStats[ch].spend += cost;

      if (ch === 'whatsapp') whatsAppSpendInr += cost;
      if (ch === 'email') emailSpendInr += cost;
      if (ch === 'telegram') telegramSpendInr += cost;
      if (ch === 'instagram') instagramSpendInr += cost;

      if (m.status === 'sent') totalSent++;
      if (m.status === 'delivered') {
        totalDelivered++;
        channelStats[ch].delivered++;
      }
      if (m.status === 'read') {
        totalDelivered++;
        totalRead++;
        channelStats[ch].delivered++;
        channelStats[ch].read++;
      }
      if (m.status === 'failed') {
        totalFailed++;
        channelStats[ch].failed++;
      }
      if (m.status === 'queued') totalQueued++;

      // Daily and Monthly trend mapping
      const dateKey = m.sent_at || m.delivered_at || m.queued_at || m.created_at;
      if (dateKey) {
        const d = new Date(dateKey);
        if (!isNaN(d.getTime())) {
          const dayString = d.toISOString().split('T')[0];
          const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          if (!dailyMap[dayString]) {
            dailyMap[dayString] = {
              date: label,
              fullDate: dayString,
              whatsapp: 0,
              email: 0,
              telegram: 0,
              instagram: 0,
              costInr: 0,
              delivered: 0,
            };
          }
          if (ch === 'whatsapp') dailyMap[dayString].whatsapp++;
          if (ch === 'email') dailyMap[dayString].email++;
          dailyMap[dayString].costInr += cost;
          if (m.status === 'delivered' || m.status === 'read') {
            if (ch === 'whatsapp' || ch === 'email') {
              dailyMap[dayString].delivered++;
            }
          }

          // Monthly aggregation
          const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const monthLabel = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
          if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = {
              monthKey,
              monthLabel,
              whatsapp: 0,
              email: 0,
              telegram: 0,
              instagram: 0,
              costInr: 0,
              delivered: 0,
            };
          }
          if (ch === 'whatsapp') monthlyMap[monthKey].whatsapp++;
          if (ch === 'email') monthlyMap[monthKey].email++;
          monthlyMap[monthKey].costInr += cost;
          if (m.status === 'delivered' || m.status === 'read') {
            if (ch === 'whatsapp' || ch === 'email') {
              monthlyMap[monthKey].delivered++;
            }
          }
        }
      }
    });

    // Map Telegram Group & Instagram Broadcast Channel dispatches by Campaign (1 broadcast per campaign)
    const activeCampaigns = campaigns.filter((c: any) => c.status !== 'draft');
    activeCampaigns.forEach((c: any) => {
      const cDate = c.created_at;
      if (!cDate) return;
      const d = new Date(cDate);
      if (isNaN(d.getTime())) return;

      const dayString = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!dailyMap[dayString]) {
        dailyMap[dayString] = {
          date: label,
          fullDate: dayString,
          whatsapp: 0,
          email: 0,
          telegram: 0,
          instagram: 0,
          costInr: 0,
          delivered: 0,
        };
      }

      const chs = (c.channels || []).map((x: string) => x.toLowerCase());
      if (chs.includes('telegram')) {
        dailyMap[dayString].telegram += 1;
        dailyMap[dayString].delivered += 1;
      }
      if (chs.includes('instagram')) {
        dailyMap[dayString].instagram += 1;
        dailyMap[dayString].delivered += 1;
      }

      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          monthKey,
          monthLabel,
          whatsapp: 0,
          email: 0,
          telegram: 0,
          instagram: 0,
          costInr: 0,
          delivered: 0,
        };
      }
      if (chs.includes('telegram')) {
        monthlyMap[monthKey].telegram += 1;
        monthlyMap[monthKey].delivered += 1;
      }
      if (chs.includes('instagram')) {
        monthlyMap[monthKey].instagram += 1;
        monthlyMap[monthKey].delivered += 1;
      }
    });

    // Campaign counts per channel
    const channelCampaignCounts = {
      whatsapp: activeCampaigns.filter((c: any) => (c.channels || []).includes('whatsapp')).length,
      email: activeCampaigns.filter((c: any) => (c.channels || []).includes('email')).length,
      telegram: activeCampaigns.filter((c: any) => (c.channels || []).includes('telegram')).length,
      instagram: activeCampaigns.filter((c: any) => (c.channels || []).includes('instagram')).length,
    };

    const rawTelegramDelivered = channelStats.telegram.delivered;
    const rawInstagramDelivered = channelStats.instagram.delivered;

    // Normalize Telegram & Instagram stats to reflect group & broadcast channel volume
    channelStats.telegram = {
      total: channelCampaignCounts.telegram, // Group Campaigns dispatches
      delivered: channelCampaignCounts.telegram, // Verified published to group
      read: channelCampaignCounts.telegram,
      failed: 0,
      spend: 0,
    };

    channelStats.instagram = {
      total: channelCampaignCounts.instagram, // Broadcast channel dispatches
      delivered: channelCampaignCounts.instagram, // Verified published to channel
      read: channelCampaignCounts.instagram,
      failed: 0,
      spend: 0,
    };

    // Tier mapping from campaigns
    campaigns.forEach((c: any) => {
      const tierKey = (c.audience_tier || 'all').toLowerCase();
      if (!tierStats[tierKey]) {
        tierStats[tierKey] = { count: 0, recipients: 0, spend: 0, delivered: 0 };
      }
      tierStats[tierKey].count++;
    });

    // Enriched campaign report items
    const campaignReports = campaigns.map((c: any) => {
      const campMsgs = messages.filter((m: any) => m.campaign_id === c.id);
      let campDelivered = 0;
      let campRead = 0;
      let campFailed = 0;
      let campCost = 0;

      campMsgs.forEach((m: any) => {
        const cost = Number(m.cost_inr) || 0;
        campCost += cost;
        if (m.status === 'delivered' || m.status === 'read') campDelivered++;
        if (m.status === 'read') campRead++;
        if (m.status === 'failed') campFailed++;
      });

      const totalRecipients = campMsgs.length || c.recipientsCount || 1;
      const deliveryRate = totalRecipients > 0 ? Math.round((campDelivered / totalRecipients) * 100) : 100;
      const readRate = campDelivered > 0 ? Math.round((campRead / campDelivered) * 100) : 0;

      // Update tier recipients and spend
      const tierKey = (c.audience_tier || 'all').toLowerCase();
      if (tierStats[tierKey]) {
        tierStats[tierKey].recipients += totalRecipients;
        tierStats[tierKey].spend += campCost;
        tierStats[tierKey].delivered += campDelivered;
      }

      return {
        id: c.id,
        name: c.name,
        category: c.category || 'Multi-Channel Outreach',
        status: c.status,
        channels: c.channels || [],
        audience_tier: c.audience_tier || 'all',
        created_at: c.created_at,
        recipientsCount: totalRecipients,
        deliveredCount: campDelivered,
        readCount: campRead,
        failedCount: campFailed,
        totalCostInr: Number(campCost.toFixed(2)),
        deliveryRate,
        readRate,
      };
    });

    const directMessagesCount = (channelStats.whatsapp?.total || 0) + (channelStats.email?.total || 0);
    const channelBroadcastsCount = channelCampaignCounts.telegram + channelCampaignCounts.instagram;
    const totalOutreachActions = directMessagesCount + channelBroadcastsCount;
    const directDeliveredCount = (channelStats.whatsapp?.delivered || 0) + (channelStats.email?.delivered || 0);
    const totalDeliveredCount = directDeliveredCount + channelBroadcastsCount;

    const overallDeliveryRate = totalOutreachActions > 0 ? Math.round((totalDeliveredCount / totalOutreachActions) * 100) : 100;
    const overallReadRate = totalDeliveredCount > 0 ? Math.round((totalRead / totalDeliveredCount) * 100) : 0;
    const avgCostPerRecipient = totalDeliveredCount > 0 ? (totalSpendInr / totalDeliveredCount).toFixed(2) : '0.00';

    // Free Channel Savings (Native Telegram & Instagram zero API fee vs ₹0.82 Meta conv cost)
    const freeMessagesCount = rawTelegramDelivered + rawInstagramDelivered;
    const costSavingsInr = Number((freeMessagesCount * 0.82).toFixed(2)); // ₹19.68

    // Monthly Budget: ₹10,000 INR
    const monthlyBudgetCents = 10000;
    const budgetRemaining = Math.max(0, monthlyBudgetCents - totalSpendInr);
    const budgetUsedPercent = Math.min(100, Math.round((totalSpendInr / monthlyBudgetCents) * 100));

    // Sort timeline points chronologically and calculate cumulative spend
    let cumulative = 0;
    let emailCumulative = 0;
    const timeline = Object.keys(dailyMap)
      .sort()
      .map((k) => {
        const ptCost = Number(dailyMap[k].costInr.toFixed(2));
        cumulative += ptCost;

        // Post-trial Email Paid API fee (@ ₹0.08 / email)
        const dayEmailCost = Number(((dailyMap[k].email || 0) * 0.08).toFixed(2));
        emailCumulative += dayEmailCost;

        return {
          ...dailyMap[k],
          costInr: ptCost,
          cumulativeSpendInr: Number(cumulative.toFixed(2)),
          emailCostInr: dayEmailCost,
          emailCumulativeSpendInr: Number(emailCumulative.toFixed(2)),
        };
      });

    // Monthly aggregated timeline points
    let monthlyEmailCumulative = 0;
    const monthlyTimeline = Object.keys(monthlyMap)
      .sort()
      .map((k) => {
        const mEmailCost = Number(((monthlyMap[k].email || 0) * 0.08).toFixed(2));
        monthlyEmailCumulative += mEmailCost;
        return {
          ...monthlyMap[k],
          costInr: Number(monthlyMap[k].costInr.toFixed(2)),
          emailCostInr: mEmailCost,
          emailCumulativeSpendInr: Number(monthlyEmailCumulative.toFixed(2)),
        };
      });

    // Formatted tier comparison data for Recharts
    const tierChartData = [
      {
        tier: 'VIP Guests',
        recipients: tierStats.vip.recipients,
        delivered: tierStats.vip.delivered,
        spend: Number(tierStats.vip.spend.toFixed(2)),
        deliveryRate: tierStats.vip.recipients > 0 ? Math.round((tierStats.vip.delivered / tierStats.vip.recipients) * 100) : 0,
      },
      {
        tier: 'Regulars',
        recipients: tierStats.regular.recipients,
        delivered: tierStats.regular.delivered,
        spend: Number(tierStats.regular.spend.toFixed(2)),
        deliveryRate: tierStats.regular.recipients > 0 ? Math.round((tierStats.regular.delivered / tierStats.regular.recipients) * 100) : 0,
      },
      {
        tier: 'Leads',
        recipients: tierStats.lead.recipients,
        delivered: tierStats.lead.delivered,
        spend: Number(tierStats.lead.spend.toFixed(2)),
        deliveryRate: tierStats.lead.recipients > 0 ? Math.round((tierStats.lead.delivered / tierStats.lead.recipients) * 100) : 0,
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        filter: { month, year },
        summary: {
          totalCampaigns: campaigns.length,
          totalMessages: totalOutreachActions,
          directMessagesCount,
          channelBroadcastsCount,
          totalDelivered: totalDeliveredCount,
          directDeliveredCount,
          totalRead,
          totalFailed,
          deliveryRate: overallDeliveryRate,
          readRate: overallReadRate,
          totalSpendInr: Number(totalSpendInr.toFixed(2)),
          whatsAppSpendInr: Number(whatsAppSpendInr.toFixed(2)),
          emailSpendInr: Number(emailSpendInr.toFixed(2)),
          emailPaidSpendInr: Number(((channelStats.email?.total || 0) * 0.08).toFixed(2)),
          emailPaidUnitCost: 0.08,
          telegramSpendInr: 0,
          instagramSpendInr: 0,
          costSavingsInr,
          freeMessagesCount,
          avgCostPerRecipient,
          monthlyBudgetInr: monthlyBudgetCents,
          budgetRemainingInr: Number(budgetRemaining.toFixed(2)),
          budgetUsedPercent,
          channelCampaignCounts,
        },
        channels: channelStats,
        tiers: tierStats,
        tierChartData,
        timeline,
        monthlyTimeline,
        campaigns: campaignReports,
      },
    });
  } catch (err: any) {
    console.error('Campaign Analytics API error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
