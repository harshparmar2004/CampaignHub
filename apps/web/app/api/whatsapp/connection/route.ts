import { NextResponse } from 'next/server';
import { getDecryptedSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getDecryptedSettings();
    const token = settings.meta_access_token;
    const phoneId = settings.meta_phone_number_id;

    if (!token || !phoneId) {
      return NextResponse.json({
        success: false,
        error: 'WhatsApp credentials not configured in Settings.',
      });
    }

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneId}?fields=verified_name,display_phone_number,code_verification_status,quality_rating,throughput`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data.error?.message || 'Meta API error' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        display_phone_number: data.display_phone_number || 'Configured',
        verified_name: data.verified_name || 'Business Account',
        quality_rating: data.quality_rating || 'UNKNOWN',
        verification_status: data.code_verification_status || 'VERIFIED',
        messaging_limit_tier: data.throughput?.level || 'TIER_1K',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Connection check failed' },
      { status: 500 }
    );
  }
}
