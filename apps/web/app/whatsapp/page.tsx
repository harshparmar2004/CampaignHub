import { redirect } from 'next/navigation';

export default function WhatsAppLegacyRedirectPage() {
  redirect('/social?tab=whatsapp');
}
