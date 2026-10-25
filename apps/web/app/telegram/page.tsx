import { redirect } from 'next/navigation';

export default function TelegramLegacyRedirectPage() {
  redirect('/social?tab=telegram');
}
