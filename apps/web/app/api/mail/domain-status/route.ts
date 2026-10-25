import { NextResponse } from 'next/server';
import { getDecryptedSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getDecryptedSettings();
    const apiKey = settings.resend_api_key;
    const fromEmail = settings.resend_from_email || '';
    const fromDomain = fromEmail.includes('@') ? fromEmail.split('@')[1] : '';

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Resend API key is not configured in settings.',
      });
    }

    const res = await fetch('https://api.resend.com/domains', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to fetch domains from Resend' },
        { status: 400 }
      );
    }

    const domains = data.data || [];
    let targetDomain = domains.find(
      (d: any) => d.name.toLowerCase() === fromDomain.toLowerCase()
    );

    if (!targetDomain && domains.length > 0) {
      targetDomain = domains[0];
    }

    // If target domain found, fetch its specific DNS records
    let dnsRecords: any[] = [];
    if (targetDomain) {
      const detailRes = await fetch(`https://api.resend.com/domains/${targetDomain.id}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const detailData = await detailRes.json();
      dnsRecords = detailData.records || [];
    }

    return NextResponse.json({
      success: true,
      data: {
        from_name: settings.resend_from_name || 'CampaignHub',
        from_email: settings.resend_from_email || 'Not configured',
        domain_name: targetDomain?.name || fromDomain || 'No domain configured',
        status: targetDomain?.status || 'unverified',
        records: dnsRecords,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Domain check failed' },
      { status: 500 }
    );
  }
}
