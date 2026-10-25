'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  WhatsAppLogo,
  GmailLogo,
  TelegramLogo,
  InstagramLogo,
} from '@/components/ui/BrandIcons';
import { Activity, BarChart2, TrendingUp } from 'lucide-react';

interface OverviewChartProps {
  data: {
    date: string;
    whatsapp: number;
    email: number;
    telegram: number;
    instagram: number;
  }[];
}

type ChannelFilter = 'all' | 'whatsapp' | 'email' | 'telegram' | 'instagram';

export function OverviewChart({ data }: OverviewChartProps) {
  const [selectedChannel, setSelectedChannel] = useState<ChannelFilter>('all');
  // Default to 'bar' mode so discrete campaign dispatches look structured and grounded
  const [chartType, setChartType] = useState<'area' | 'bar'>('bar');

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-txt-muted text-xs border border-dashed border-border/80 rounded-2xl bg-bg-app space-y-2">
        <Activity className="w-5 h-5 text-txt-muted animate-pulse" />
        <span>No delivery activity recorded for this date range.</span>
      </div>
    );
  }

  // Calculate totals and peak day
  let peakDay = data[0];
  let maxVolume = 0;
  let totalVolume = 0;
  data.forEach((d) => {
    const total = (d.whatsapp || 0) + (d.email || 0) + (d.telegram || 0) + (d.instagram || 0);
    totalVolume += total;
    if (total > maxVolume) {
      maxVolume = total;
      peakDay = d;
    }
  });

  // Custom sleek tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const wa = payload.find((p: any) => p.dataKey === 'whatsapp')?.value || 0;
      const em = payload.find((p: any) => p.dataKey === 'email')?.value || 0;
      const tg = payload.find((p: any) => p.dataKey === 'telegram')?.value || 0;
      const ig = payload.find((p: any) => p.dataKey === 'instagram')?.value || 0;
      const sum = wa + em + tg + ig;

      return (
        <div className="p-3 bg-white/95 backdrop-blur-md rounded-xl border border-border/80 shadow-md text-xs space-y-2 min-w-[180px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
            <span className="font-bold text-txt-primary">{label}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {sum} Dispatches
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            {(selectedChannel === 'all' || selectedChannel === 'whatsapp') && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-txt-muted">
                  <WhatsAppLogo className="w-3 h-3" />
                  <span>WhatsApp</span>
                </div>
                <strong className="text-emerald-700 font-mono font-bold">{wa}</strong>
              </div>
            )}

            {(selectedChannel === 'all' || selectedChannel === 'email') && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-txt-muted">
                  <GmailLogo className="w-3 h-3" />
                  <span>Email</span>
                </div>
                <strong className="text-indigo-700 font-mono font-bold">{em}</strong>
              </div>
            )}

            {(selectedChannel === 'all' || selectedChannel === 'telegram') && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-txt-muted">
                  <TelegramLogo className="w-3 h-3" />
                  <span>Telegram</span>
                </div>
                <strong className="text-sky-700 font-mono font-bold">{tg}</strong>
              </div>
            )}

            {(selectedChannel === 'all' || selectedChannel === 'instagram') && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-txt-muted">
                  <InstagramLogo className="w-3 h-3" />
                  <span>Instagram</span>
                </div>
                <strong className="text-pink-700 font-mono font-bold">{ig}</strong>
              </div>
            )}
          </div>

          <div className="pt-1.5 border-t border-border/50 text-[10px] text-txt-muted flex justify-between">
            <span>Delivery Rate</span>
            <span className="text-emerald-700 font-bold">100% Inboxed</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 w-full">
      {/* Top Controls: Channel Filter Pills & Peak Day Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedChannel('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedChannel === 'all'
                ? 'bg-brand text-white shadow-2xs'
                : 'bg-bg-app text-txt-muted hover:text-txt-primary border border-border/60'
            }`}
          >
            All Channels
          </button>

          <button
            type="button"
            onClick={() => setSelectedChannel('whatsapp')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedChannel === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-bg-app text-txt-muted hover:text-txt-primary border border-border/60'
            }`}
          >
            <WhatsAppLogo className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedChannel('email')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedChannel === 'email'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-bg-app text-txt-muted hover:text-txt-primary border border-border/60'
            }`}
          >
            <GmailLogo className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedChannel('telegram')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedChannel === 'telegram'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-bg-app text-txt-muted hover:text-txt-primary border border-border/60'
            }`}
          >
            <TelegramLogo className="w-3.5 h-3.5" />
            <span>Telegram</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedChannel('instagram')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedChannel === 'instagram'
                ? 'bg-pink-600 text-white shadow-2xs'
                : 'bg-bg-app text-txt-muted hover:text-txt-primary border border-border/60'
            }`}
          >
            <InstagramLogo className="w-3.5 h-3.5" />
            <span>Instagram</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          {maxVolume > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-txt-muted font-medium bg-bg-app px-2.5 py-1 rounded-lg border border-border/60">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Peak: <strong>{peakDay.date}</strong> ({maxVolume} msgs)</span>
            </span>
          )}

          <div className="inline-flex rounded-lg border border-border/60 bg-bg-app p-0.5">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                chartType === 'bar' ? 'bg-white shadow-2xs text-brand' : 'text-txt-muted hover:text-txt-primary'
              }`}
              title="Bar Chart"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Bars</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                chartType === 'area' ? 'bg-white shadow-2xs text-brand' : 'text-txt-muted hover:text-txt-primary'
              }`}
              title="Area Trendline"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Trend</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas with Smooth Animations */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2EE" />
              <XAxis
                dataKey="date"
                stroke="#667770"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#E1E9E3' }}
              />
              <YAxis
                stroke="#667770"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#E1E9E3' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />

              {(selectedChannel === 'all' || selectedChannel === 'whatsapp') && (
                <Bar
                  dataKey="whatsapp"
                  name="WhatsApp"
                  fill="#1E6B4F"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              )}

              {(selectedChannel === 'all' || selectedChannel === 'email') && (
                <Bar
                  dataKey="email"
                  name="Email"
                  fill="#4F46E5"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              )}

              {(selectedChannel === 'all' || selectedChannel === 'telegram') && (
                <Bar
                  dataKey="telegram"
                  name="Telegram"
                  fill="#0284C7"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              )}

              {(selectedChannel === 'all' || selectedChannel === 'instagram') && (
                <Bar
                  dataKey="instagram"
                  name="Instagram"
                  fill="#E1306C"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              )}
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="waGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E6B4F" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1E6B4F" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="emailGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="tgGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="igGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E1306C" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#E1306C" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2EE" />

              <XAxis
                dataKey="date"
                stroke="#667770"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#E1E9E3' }}
              />
              <YAxis
                stroke="#667770"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#E1E9E3' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />

              {(selectedChannel === 'all' || selectedChannel === 'whatsapp') && (
                <Area
                  type="monotone"
                  dataKey="whatsapp"
                  stroke="#1E6B4F"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#waGradient)"
                  isAnimationActive={true}
                  animationDuration={1100}
                  animationEasing="ease-out"
                />
              )}

              {(selectedChannel === 'all' || selectedChannel === 'email') && (
                <Area
                  type="monotone"
                  dataKey="email"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#emailGradient)"
                  isAnimationActive={true}
                  animationDuration={1100}
                  animationEasing="ease-out"
                />
              )}

              {(selectedChannel === 'all' || selectedChannel === 'telegram') && (
                <Area
                  type="monotone"
                  dataKey="telegram"
                  stroke="#0284C7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#tgGradient)"
                  isAnimationActive={true}
                  animationDuration={1100}
                  animationEasing="ease-out"
                />
              )}

              {(selectedChannel === 'all' || selectedChannel === 'instagram') && (
                <Area
                  type="monotone"
                  dataKey="instagram"
                  stroke="#E1306C"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#igGradient)"
                  isAnimationActive={true}
                  animationDuration={1100}
                  animationEasing="ease-out"
                />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
