import { redirect } from 'next/navigation';

export default function MediaLegacyRedirectPage() {
  redirect('/social?tab=whatsapp');
}
