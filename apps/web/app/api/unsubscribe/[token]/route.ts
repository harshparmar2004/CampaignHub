import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyUnsubscribeToken } from '@campaignhub/shared';

const APP_SECRET = process.env.APP_SECRET || 'fallback-app-secret-32-characters-min';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params;
  const verified = verifyUnsubscribeToken(token, APP_SECRET);

  if (!verified.valid || !verified.contactId) {
    return new NextResponse(
      renderHtmlPage(
        'Invalid or Expired Link',
        'This unsubscribe link is invalid or has expired. If you still wish to unsubscribe, please contact our support team.',
        false
      ),
      {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('contacts')
    .update({
      email_opt_in: false,
      unsubscribed: true,
    })
    .eq('id', verified.contactId);

  if (error) {
    return new NextResponse(
      renderHtmlPage('Error', 'Unable to process unsubscribe request. Please try again.', false),
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  return new NextResponse(
    renderHtmlPage(
      'Successfully Unsubscribed',
      'You have been unsubscribed from all email notifications from CampaignHub. You will no longer receive marketing messages.',
      true
    ),
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

function renderHtmlPage(title: string, message: string, isSuccess: boolean): string {
  const accentColor = isSuccess ? '#1E6B4F' : '#A12A2A';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — CampaignHub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #F4F7F3;
      color: #14231C;
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .card {
      background-color: #FFFFFF;
      border: 1px solid #DCE5DD;
      border-radius: 14px;
      max-width: 480px;
      width: 100%;
      padding: 36px 32px;
      text-align: center;
    }
    .logo {
      font-size: 18px;
      font-weight: 700;
      color: #14231C;
      margin-bottom: 24px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .dot {
      width: 10px;
      height: 10px;
      background-color: #1E6B4F;
      border-radius: 50%;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: ${accentColor};
      margin-bottom: 12px;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #52645A;
      margin-bottom: 24px;
    }
    .footer {
      font-size: 12px;
      color: #52645A;
      border-top: 1px solid #DCE5DD;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <span class="dot"></span>
      CampaignHub
    </div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="footer">
      Preferences recorded safely. You may close this window.
    </div>
  </div>
</body>
</html>`;
}
