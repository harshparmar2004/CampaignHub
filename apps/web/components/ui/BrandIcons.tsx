import React from 'react';

interface BrandIconProps {
  className?: string;
  size?: number;
}

/**
 * Official WhatsApp Logo
 * Authentic green badge with telephone handset inside speech bubble.
 */
export function WhatsAppLogo({ className = 'w-6 h-6', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
    >
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.403 5.638A8.919 8.919 0 0 0 12.053 3c-4.948 0-8.976 4.027-8.978 8.977 0 1.582.413 3.126 1.198 4.488L3 21.114l4.757-1.248a8.946 8.946 0 0 0 4.29 1.093h.004c4.947 0 8.975-4.027 8.977-8.977 0-2.398-.934-4.653-2.625-6.344zm-6.35 13.812h-.003a7.446 7.446 0 0 1-3.798-1.041l-.272-.162-2.824.74.754-2.752-.177-.282a7.445 7.445 0 0 1-1.141-3.976c.002-4.114 3.349-7.461 7.465-7.461a7.42 7.42 0 0 1 5.28 2.188 7.42 7.42 0 0 1 2.184 5.28c-.002 4.114-3.349 7.462-7.466 7.462zm4.095-5.593c-.225-.113-1.327-.655-1.533-.73-.205-.075-.354-.112-.504.112-.149.224-.579.73-.71.879-.13.149-.261.168-.486.056-.225-.113-.948-.349-1.806-1.114-.667-.595-1.118-1.33-1.249-1.555-.13-.225-.014-.347.099-.459.101-.1.225-.262.337-.393.113-.131.15-.224.225-.374.075-.15.037-.281-.019-.393-.056-.113-.505-1.217-.692-1.666-.182-.438-.367-.378-.504-.385l-.43-.008c-.149 0-.392.056-.597.28-.205.225-.784.767-.784 1.872 0 1.104.803 2.17 0.915 2.32.112.15 1.58 2.412 3.827 3.382.535.231.952.369 1.277.473.537.171 1.025.147 1.411.089.431-.064 1.327-.542 1.514-1.066.187-.524.187-.973.131-1.066-.056-.093-.205-.15-.43-.262z"
        fill="white"
      />
    </svg>
  );
}

/**
 * Official Google Gmail Logo
 * Authentic Google Workspace 4-color M emblem.
 */
export function GmailLogo({ className = 'w-6 h-6', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 48 512 402"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
    >
      <path
        fill="#4285f4"
        d="M34.91 448.818h81.454V251L0 163.727V413.91c0 19.287 15.622 34.91 34.91 34.91z"
      />
      <path
        fill="#34a853"
        d="M395.636 448.818h81.455c19.287 0 34.909-15.622 34.909-34.909V163.727L395.636 251z"
      />
      <path
        fill="#fbbc04"
        d="M395.636 99.727V251L512 163.727v-46.545c0-43.142-49.25-67.782-83.782-41.891z"
      />
      <path
        fill="#ea4335"
        d="M116.364 251V99.727L256 204.455 395.636 99.727V251L256 355.727z"
      />
      <path
        fill="#c5221f"
        d="M0 117.182v46.545L116.364 251V99.727L83.782 75.291C49.25 49.4 0 74.04 0 117.18z"
      />
    </svg>
  );
}

/**
 * Official Telegram Logo
 * Sky blue circular badge with white paper plane.
 */
export function TelegramLogo({ className = 'w-6 h-6', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
    >
      <circle cx="12" cy="12" r="12" fill="#0088CC" />
      <path
        d="M5.491 11.74 18.152 6.86c.587-.213 1.099.146.908.972l-2.155 10.156c-.16.721-.588.898-1.192.56l-3.284-2.42-1.584 1.526c-.176.176-.324.324-.664.324l.235-3.344 6.088-5.5c.265-.235-.058-.366-.411-.131l-7.525 4.739-3.242-1.014c-.705-.22-.719-.705.147-1.028z"
        fill="white"
      />
    </svg>
  );
}

/**
 * Official Instagram Logo
 * Vibrant sunset gradient badge with authentic white camera glyph.
 */
export function InstagramLogo({ className = 'w-6 h-6', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
    >
      <defs>
        <linearGradient id="ig-brand-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-brand-gradient)" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 7.005c-2.754 0-4.995 2.241-4.995 4.995s2.241 4.995 4.995 4.995 4.995-2.241 4.995-4.995S14.754 7.005 12 7.005zm0 8.243a3.248 3.248 0 1 1 0-6.496 3.248 3.248 0 0 1 0 6.496zm5.195-8.438a1.166 1.166 0 1 1-2.332 0 1.166 1.166 0 0 1 2.332 0zM12 4c2.607 0 2.918.01 3.945.057 2.658.121 3.876 1.343 3.998 3.998.047 1.027.057 1.338.057 3.945s-.01 2.918-.057 3.945c-.122 2.655-1.34 3.877-3.998 3.998-1.027.047-1.338.057-3.945.057s-2.918-.01-3.945-.057c-2.655-.121-3.877-1.34-3.998-3.998-.047-1.027-.057-1.338-.057-3.945s.01-2.918.057-3.945c.121-2.655 1.343-3.877 3.998-3.998 1.027-.047 1.338-.057 3.945-.057zm0-1.75c-2.65 0-2.983.011-4.025.059-3.545.162-5.518 2.136-5.68 5.68-.048 1.042-.059 1.375-.059 4.011s.011 2.969.059 4.011c.162 3.544 2.135 5.518 5.68 5.68 1.042.048 1.375.059 4.025.059s2.983-.011 4.025-.059c3.544-.162 5.518-2.136 5.68-5.68.048-1.042.059-1.375.059-4.011s-.011-2.969-.059-4.011c-.162-3.544-2.136-5.518-5.68-5.68-1.042-.048-1.375-.059-4.025-.059z"
        fill="white"
      />
    </svg>
  );
}

/**
 * Official Groq Logo
 * Signature Groq vibrant orange/coral badge with modern LPU glyph and Nano Banana high-res asset.
 */
export function GroqLogo({ className = 'w-6 h-6', size }: BrandIconProps) {
  return (
    <img
      src="/logos/groq.jpg"
      alt="Groq"
      className={`rounded-lg object-cover ${className}`}
      width={size}
      height={size}
    />
  );
}

/**
 * Official Google Gemini Logo
 * Iconic Google Gemini multi-color 4-pointed sparkle gradient star.
 */
export function GeminiLogo({ className = 'w-6 h-6', size }: BrandIconProps) {
  return (
    <img
      src="/logos/gemini.png"
      alt="Google Gemini"
      className={`rounded-lg object-cover ${className}`}
      width={size}
      height={size}
    />
  );
}

/**
 * Official Ollama Logo
 * Iconic monochrome badge with cute llama mascot silhouette for 100% free offline LLMs.
 */
export function OllamaLogo({ className = 'w-6 h-6', size }: BrandIconProps) {
  return (
    <img
      src="/logos/ollama.png"
      alt="Ollama"
      className={`rounded-lg object-cover ${className}`}
      width={size}
      height={size}
    />
  );
}
