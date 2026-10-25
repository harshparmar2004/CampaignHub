import { redirect } from 'next/navigation';

export default function MailLegacyRedirectPage() {
  redirect('/social?tab=mail');
}
