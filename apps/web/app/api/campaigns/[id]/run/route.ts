import { NextResponse } from 'next/server';
import { executeCampaignPipeline } from '@/lib/pipeline/dispatchEngine';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log(`[API] Triggering real-time execution for campaign ID: ${id}`);
    const summary = await executeCampaignPipeline(id);

    return NextResponse.json({
      success: true,
      message: `Campaign "${summary.campaignName}" executed in real-time. Dispatched: ${summary.totalDispatched}, Sent: ${summary.sentCount}, Failed: ${summary.failedCount}.`,
      data: summary,
    });
  } catch (err: any) {
    console.error(`[API] Campaign run error for ${params.id}:`, err);
    return NextResponse.json(
      { success: false, error: err.message || 'Execution error' },
      { status: 500 }
    );
  }
}
