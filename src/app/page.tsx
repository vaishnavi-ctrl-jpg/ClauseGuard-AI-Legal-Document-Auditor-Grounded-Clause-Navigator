'use client';

// ==============================================================================
// ClauseGuard: Main Application Dashboard
// ==============================================================================

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { DemoBanner } from '@/components/DemoBanner';
import { DocumentInput } from '@/components/DocumentInput';
import { RiskMeter } from '@/components/RiskMeter';
import { ClauseList } from '@/components/ClauseList';
import { NegotiationModal } from '@/components/NegotiationModal';
import { ContractChat } from '@/components/ContractChat';
import { ChecklistExport } from '@/components/ChecklistExport';
import { LegalDisclaimer } from '@/components/LegalDisclaimer';
import { DocumentAnalysis, ClauseItem } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';

export default function Home() {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [currentContractText, setCurrentContractText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Negotiation Modal State
  const [selectedClause, setSelectedClause] = useState<ClauseItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAnalyze = async (text: string) => {
    setLoading(true);
    setError(null);
    setCurrentContractText(text);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText: text }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }

      const data: DocumentAnalysis = await res.json();
      setAnalysis(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCounter = (clause: ClauseItem) => {
    setSelectedClause(clause);
    setIsModalOpen(true);
  };

  const isDemo = analysis ? analysis.metadata.isDemo : true;
  const engineName = analysis ? analysis.metadata.engineName : 'Ready';

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <Header engineName={engineName} isDemo={isDemo} />
      <DemoBanner isDemo={isDemo} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" role="main">
        {/* Document Ingestion Card */}
        <DocumentInput onAnalyze={handleAnalyze} loading={loading} />

        {/* Error Alert */}
        {error && (
          <div
            className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-3 shadow-xs"
            role="alert"
          >
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold text-sm">Analysis Execution Error</p>
              <p className="text-xs mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Audit Results Dashboard */}
        {analysis && (
          <div className="space-y-8 animate-fadeIn">
            {/* Risk Gauge & Summary */}
            <RiskMeter
              score={analysis.overallRiskScore}
              tier={analysis.riskTier}
              summary={analysis.summary}
              breakdown={analysis.riskBreakdown}
              latencyMs={analysis.metadata.latencyMs}
              wordCount={analysis.metadata.wordCount}
            />

            {/* Split View: Clauses & Grounded Chat */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7">
                <ClauseList clauses={analysis.clauses} onDraftCounter={handleOpenCounter} />
              </div>
              <div className="lg:col-span-5 sticky top-20">
                <ContractChat contractText={currentContractText} />
              </div>
            </div>

            {/* Pre-Signing Checklist & Export */}
            <ChecklistExport checklist={analysis.checklist} analysis={analysis} />
          </div>
        )}
      </main>

      {/* Counter Proposal Modal with Accessible Focus Trap */}
      <NegotiationModal
        clause={selectedClause}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Persistent Legal Boundary Notice */}
      <LegalDisclaimer />
    </div>
  );
}
