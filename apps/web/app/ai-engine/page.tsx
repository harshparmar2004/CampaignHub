'use client';

import React, { useState, useEffect } from 'react';
import { AiEngineChatbot } from '@/components/settings/AiEngineChatbot';

export default function AiEnginePage() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.success && json.data) {
          setSettings(json.data);
        }
      } catch (err) {
        console.error('Failed to load settings for AI Engine:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();

    const handleFocus = () => loadSettings();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        loadSettings();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col overflow-hidden">
      <AiEngineChatbot
        groqApiKey={settings?.groq_api_key || ''}
        groqModel={settings?.groq_model || 'llama-3.3-70b-versatile'}
        geminiApiKey={settings?.gemini_api_key || ''}
        geminiModel={settings?.gemini_model || 'gemini-2.0-flash'}
        ollamaBaseUrl={settings?.ollama_base_url || 'http://localhost:11434'}
        ollamaModel={settings?.ollama_model || 'llama3.2'}
        primaryProvider={settings?.ai_primary_provider || 'groq'}
        temperature={settings?.gemini_temperature ?? 0.7}
        hasGroqKey={settings?.has_groq_api_key ?? false}
        hasGeminiKey={settings?.has_gemini_api_key ?? false}
        isFullScreen={isFullScreen}
        onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
      />
    </div>
  );
}
