'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Play,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GitFork,
  ExternalLink,
  ChevronDown,
  Layers,
  Zap,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  AutomationCanvas,
  PIPELINE_NODES,
} from '@/components/automations/AutomationCanvas';
import {
  NodeDetailsDrawer,
  type PipelineNodeData,
} from '@/components/automations/NodeDetailsDrawer';

export default function AutomationsPage() {
  const [selectedNode, setSelectedNode] = useState<PipelineNodeData | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState('vip-omnichannel-blast');
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [activeTestStep, setActiveTestStep] = useState(0);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingSingleNode, setIsTestingSingleNode] = useState(false);

  const workflows = [
    {
      id: 'vip-omnichannel-blast',
      name: '👑 VIP Nightclub & Event Omnichannel Blast',
      badge: 'Active & Listening',
      description: 'Ingests VIP guests from DB & Sheets, filters high spenders, generates personalized AI copy, and blasts WhatsApp, Email, Telegram & Instagram.',
    },
    {
      id: 'weekend-guestlist-priority',
      name: '⚡ Weekend Priority Guestlist & RSVP Automation',
      badge: 'Standby',
      description: 'Scheduled weekly event trigger checking RSVP limits and dispatching timed reminders across channels.',
    },
    {
      id: 'new-member-welcome',
      name: '🌟 New Member Welcome & Concierge Intro',
      badge: 'Standby',
      description: 'Triggered when a new contact is added with automatic WhatsApp onboarding and email verification.',
    },
  ];

  const currentWorkflow =
    workflows.find((w) => w.id === selectedWorkflow) || workflows[0];

  const handleTriggerLiveRun = async () => {
    if (isRunningTest) return;
    setIsRunningTest(true);
    setActiveTestStep(1);
    setTestResult(null);

    try {
      // Step 1: Database & Sheets
      await new Promise((r) => setTimeout(r, 700));
      setActiveTestStep(2);

      // Step 2: Audience Filter
      await new Promise((r) => setTimeout(r, 650));
      setActiveTestStep(3);

      // Step 3: AI Engine
      await new Promise((r) => setTimeout(r, 900));
      setActiveTestStep(4);

      // Step 4: Omnichannel Dispatch (WhatsApp, Email, Telegram, Instagram)
      await new Promise((r) => setTimeout(r, 1100));
      setActiveTestStep(5);

      // Fetch actual backend execution telemetry
      const res = await fetch('/api/automations/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ automationId: selectedWorkflow }),
      });
      const data = await res.json();
      setTestResult(data);

      await new Promise((r) => setTimeout(r, 800));
    } catch (err) {
      console.error('Test run failed:', err);
    } finally {
      setIsRunningTest(false);
      // Keep completed step highlight for 5 seconds
      setTimeout(() => setActiveTestStep(0), 5000);
    }
  };

  const handleTestSingleNode = async (nodeId: string) => {
    setIsTestingSingleNode(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsTestingSingleNode(false);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#F4F7F3]">
      {/* Top Header & Studio Controller */}
      <div className="bg-white border-b border-border/80 px-4 sm:px-6 py-3 flex-shrink-0 z-20 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Title & Workflow Selector */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-brand shrink-0 shadow-2xs">
              <GitFork className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-txt-primary tracking-tight">
                  Automations &amp; Visual Pipeline Studio
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>24/7 Engine Active</span>
                </span>
              </div>

              {/* Selector */}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-txt-muted hidden sm:inline">Active Pipeline:</span>
                <select
                  value={selectedWorkflow}
                  onChange={(e) => setSelectedWorkflow(e.target.value)}
                  className="text-xs font-bold text-txt-primary bg-bg-app border border-border/80 rounded-lg px-2 py-1 focus:outline-hidden cursor-pointer"
                >
                  {workflows.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons: Live Test Simulator & Create */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {testResult?.success && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Dispatched in {testResult.totalLatencyMs}ms (99.4% Delivered)
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleTriggerLiveRun}
              disabled={isRunningTest}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                isRunningTest
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-brand hover:bg-brand-hover text-white'
              }`}
            >
              {isRunningTest ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    Simulating Step {activeTestStep} of 5...
                  </span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Test Live Run</span>
                </>
              )}
            </button>

            <Link
              href="/campaigns/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-bg-app border border-border text-xs font-bold text-txt-primary transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-brand" />
              <span className="hidden sm:inline">New Pipeline</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Studio Canvas Viewport */}
      <div className="flex-1 w-full min-h-0 relative overflow-hidden flex flex-col">
        <AutomationCanvas
          onSelectNode={(node) => setSelectedNode(node)}
          selectedNodeId={selectedNode?.id}
          isRunningTest={isRunningTest}
          activeTestStep={activeTestStep}
        />
      </div>

      {/* Interactive Node Details Inspector Drawer */}
      <NodeDetailsDrawer
        node={selectedNode}
        isOpen={Boolean(selectedNode)}
        onClose={() => setSelectedNode(null)}
        onTestNode={handleTestSingleNode}
        isTestingNode={isTestingSingleNode}
      />
    </div>
  );
}
