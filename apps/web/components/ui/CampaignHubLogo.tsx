'use client';

import React, { useId } from 'react';

interface CampaignHubLogoProps {
  size?: number | 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

export function CampaignHubLogoMark({ size = 24, className = '' }: { size?: number; className?: string }) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        {/* Deep Emerald Forest Gradient Squircle */}
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1B4D39" />
          <stop offset="100%" stopColor="#0B1A13" />
        </linearGradient>

        {/* Radiant Emerald Arc Gradient */}
        <linearGradient id={`blade-${id}`} x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Luminous Central Core Gradient */}
        <linearGradient id={`glow-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>

      {/* Rounded Squircle Container */}
      <rect
        width="64"
        height="64"
        rx="16"
        fill={`url(#bg-${id})`}
        stroke="#2D6A4F"
        strokeWidth="1.5"
      />

      {/* Luminous Central Beacon Node */}
      <circle cx="32" cy="32" r="7.5" fill={`url(#glow-${id})`} />

      {/* Sweeping Upper Orbital Broadcast Arc */}
      <path
        d="M 32 14 C 42.5 14 50 21.5 50 32"
        stroke={`url(#blade-${id})`}
        strokeWidth="5.5"
        strokeLinecap="round"
      />

      {/* Sweeping Lower Orbital Broadcast Arc */}
      <path
        d="M 32 50 C 21.5 50 14 42.5 14 32"
        stroke={`url(#blade-${id})`}
        strokeWidth="5.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CampaignHubLogo({
  size = 'md',
  showWordmark = true,
  className = '',
  wordmarkClassName = '',
}: CampaignHubLogoProps) {
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
        ? 24
        : size === 'lg'
          ? 42
          : 34;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <CampaignHubLogoMark size={pixelSize} />
      {showWordmark && (
        <span
          className={`font-bold tracking-tight text-[#14231C] ${
            pixelSize >= 36 ? 'text-2xl' : pixelSize >= 28 ? 'text-xl' : pixelSize >= 24 ? 'text-base' : 'text-sm'
          } ${wordmarkClassName}`}
        >
          CampaignHub
        </span>
      )}
    </div>
  );
}

export default CampaignHubLogo;
