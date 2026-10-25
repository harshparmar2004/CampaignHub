import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const automationId = body.automationId || 'vip-omnichannel-blast';
    const contact = body.contact || {
      first_name: 'Aarav',
      last_name: 'Sharma',
      phone: '+91 98765 43210',
      email: 'aarav.sharma@vipclub.in',
      lifetime_spend_inr: 75000,
      tags: ['VIP', 'Weekend_Regular', 'Table_Patron'],
    };

    const startTime = Date.now();

    // Step-by-step simulated pipeline execution telemetry
    const steps = [
      {
        step: 1,
        id: 'node-db-sheets',
        name: 'Database & Sheets Sync',
        status: 'completed',
        latencyMs: 14,
        details: 'Ingested 1,248 customer records via Supabase PostgreSQL & Google Sheets Sync.',
        outputCount: 1248,
      },
      {
        step: 2,
        id: 'node-filter-router',
        name: 'Audience Filter & Tag Router',
        status: 'completed',
        latencyMs: 8,
        details: 'Evaluated rule: spend_inr >= 50,000 OR tags CONTAINS "VIP". Routed to VIP High-Priority Queue.',
        outputCount: 842,
      },
      {
        step: 3,
        id: 'node-ai-engine',
        name: 'Groq LPU & Gemini AI Personalizer',
        status: 'completed',
        latencyMs: 142,
        details: 'Synthesized customized VIP copy with {{first_name}} and individual RSVP tokens.',
        outputCount: 842,
      },
      {
        step: 4,
        id: 'node-channels',
        name: 'Omnichannel Parallel Dispatch',
        status: 'completed',
        latencyMs: 290,
        channels: {
          whatsapp: {
            status: 'delivered',
            latencyMs: 180,
            rate: '20 msg/sec',
            costInr: 0.9926,
            messagePreview: `👑 *EXCLUSIVE VIP INVITATION: Friday Night VIP Gala*\n\nHi Aarav! 🌟 You are officially invited to the most anticipated weekend celebration at Club Matrix!`,
          },
          email: {
            status: 'sent',
            latencyMs: 125,
            subject: 'Aarav, your VIP Gala Access Pass is ready!',
            inboxingRate: '99.8%',
          },
          telegram: {
            status: 'published',
            latencyMs: 65,
            target: '@CampaignHubVIPChannel',
            pinned: true,
          },
          instagram: {
            status: 'broadcasted',
            latencyMs: 95,
            channelId: 'ig_bc_8849201',
            type: 'Broadcast Channel Announcement',
          },
        },
      },
      {
        step: 5,
        id: 'node-telemetry',
        name: 'BullMQ Telemetry & Completion',
        status: 'completed',
        latencyMs: 12,
        details: 'Dispatched 842 VIP packets. 99.4% delivery rate. ₹835.77 Meta fee deducted from safety budget.',
        totalTimeMs: Date.now() - startTime + 466,
      },
    ];

    return NextResponse.json({
      success: true,
      automationId,
      executedAt: new Date().toISOString(),
      sampleContact: contact,
      totalLatencyMs: steps.reduce((acc, s) => acc + (s.latencyMs || 0), 0),
      steps,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Automation test execution failed.' },
      { status: 500 }
    );
  }
}
