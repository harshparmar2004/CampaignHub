import { NextResponse } from 'next/server';
import { getMaskedSettings, bulkSaveSettings } from '@/lib/settings';
import { UpdateSettingsSchema } from '@campaignhub/shared';

export async function GET() {
  try {
    const masked = await getMaskedSettings();
    return NextResponse.json({ success: true, data: masked });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = UpdateSettingsSchema.parse(body);

    await bulkSaveSettings(validated);

    const updated = await getMaskedSettings();
    return NextResponse.json({
      success: true,
      message: 'Settings updated and encrypted successfully',
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Invalid settings payload' },
      { status: 400 }
    );
  }
}
