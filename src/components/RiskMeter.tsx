// ==============================================================================
// ClauseGuard: Accessible Risk Meter & Severity Gauge
// ==============================================================================

import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Activity, Clock, FileText } from 'lucide-react';
import { RiskLevel, RiskBreakdown } from '@/lib/types';

interface RiskMeterProps {
  score: number;
  tier: RiskLevel;
  summary: string;
  breakdown: RiskBreakdown;
  latencyMs?: number;
  wordCount?: number;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  score,
  tier,
  summary,
  breakdown,
  latencyMs,
  wordCount,
}) => {
  // Deterministic styling + accessible labels
  const tierConfig = {
    CRITICAL: {
      label: 'High Hostility / Predatory Terms',
      tagText: 'CRITICAL RISK',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
      barColor: 'bg-rose-600',
      textColor: 'text-rose-600',
      icon: ShieldAlert,
      description: 'Contains severe one-sided liabilities, forfeitures, or waivers requiring immediate renegotiation.',
    },
    CAUTION: {
      label: 'Moderate Concerns Detected',
      tagText: 'CAUTION ADVISED',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      barColor: 'bg-amber-500',
      textColor: 'text-amber-600',
      icon: AlertTriangle,
      description: 'Contains several asymmetric or non-standard provisions that warrant clarification or adjustment.',
    },
    FAIR: {
      label: 'Balanced & Standard Terms',
      tagText: 'FAIR & STANDARD',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      barColor: 'bg-emerald-600',
      textColor: 'text-emerald-600',
      icon: ShieldCheck,
      description: 'Provisions appear largely reciprocal and consistent with customary market standards.',
    },
  }[tier];

  const TierIcon = tierConfig.icon;

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden" aria-labelledby="audit-overview-heading">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        {/* Score & Tier Title */}
        <div className="flex items-start space-x-5">
          {/* Circular Score Visual with Accessible Text */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={tierConfig.textColor}
                strokeDasharray={`${score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black tracking-tight text-slate-900">{score}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">/ 100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contract Risk Score</span>
              {/* Dual Indicator: Badge has both Color AND Explicit Text Label AND Icon for Colorblind Accessibility */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${tierConfig.badgeBg}`}
                role="status"
              >
                <TierIcon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{tierConfig.tagText}</span>
              </span>
            </div>
            <h2 id="audit-overview-heading" className="text-xl font-bold text-slate-900">
              {tierConfig.label}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">{tierConfig.description}</p>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80 w-full lg:w-auto justify-between lg:justify-start">
          {latencyMs !== undefined && (
            <div className="flex items-center gap-1.5" title="Time taken for complete analysis & verification">
              <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Latency: <strong className="text-slate-700 font-mono">{latencyMs}ms</strong></span>
            </div>
          )}
          {wordCount !== undefined && (
            <div className="flex items-center gap-1.5" title="Analyzed document word count">
              <FileText className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Words: <strong className="text-slate-700 font-mono">{wordCount}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-indigo-600">
            <Activity className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Deterministic Verified</span>
          </div>
        </div>
      </div>

      {/* Executive Plain English Summary */}
      <div className="mt-5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Plain-English Executive Summary
        </h3>
        <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
      </div>

      {/* Multi-Dimensional Risk Breakdown */}
      <div className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Risk Vector Breakdown (0 = Safe, 100 = Severe Exposure)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <RiskMetricItem label="Liability Exposure" score={breakdown.liabilityScore} />
          <RiskMetricItem label="Financial Penalty Trap" score={breakdown.financialScore} />
          <RiskMetricItem label="Early Exit Difficulty" score={breakdown.exitDifficultyScore} />
          <RiskMetricItem label="Privacy & Data Control" score={breakdown.privacyScore} />
        </div>
      </div>
    </section>
  );
};

interface RiskMetricItemProps {
  label: string;
  score: number;
}

const RiskMetricItem: React.FC<RiskMetricItemProps> = ({ label, score }) => {
  const getBarColor = (val: number) => {
    if (val >= 70) return 'bg-rose-500';
    if (val >= 40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/60">
      <div className="flex justify-between items-center text-xs mb-1.5">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-mono font-bold text-slate-900">{score}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};
