// ==============================================================================
// ClauseGuard: Interactive Pre-Signing Checklist & Report Export
// ==============================================================================

import React, { useState } from 'react';
import { CheckSquare, Download, Share2, Check, AlertCircle } from 'lucide-react';
import { PreSigningChecklistItem, DocumentAnalysis } from '@/lib/types';

interface ChecklistExportProps {
  checklist: PreSigningChecklistItem[];
  analysis: DocumentAnalysis;
}

export const ChecklistExport: React.FC<ChecklistExportProps> = ({
  checklist: initialChecklist,
  analysis,
}) => {
  const [items, setItems] = useState<PreSigningChecklistItem[]>(initialChecklist);
  const [copied, setCopied] = useState(false);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleExportMarkdown = () => {
    const md = generateMarkdownReport(analysis, items);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ClauseGuard_Audit_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = async () => {
    const md = generateMarkdownReport(analysis, items);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6" aria-labelledby="checklist-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
        <div>
          <h2 id="checklist-heading" className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            <span>Pre-Signing Action Checklist & Export</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Key steps to resolve or negotiate before putting pen to paper.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Report!' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportMarkdown}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2.5">
        {items.map((item) => (
          <label
            key={item.id}
            className={`flex items-start space-x-3 p-3 rounded-xl border transition cursor-pointer ${
              item.completed
                ? 'bg-slate-50/70 border-slate-200 line-through text-slate-400'
                : 'bg-white border-slate-200 hover:border-indigo-200 text-slate-800'
            }`}
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleItem(item.id)}
              className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <div className="flex-1 flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-medium">{item.task}</span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md shrink-0 border ${
                  item.urgency === 'URGENT'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : item.urgency === 'RECOMMENDED'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {item.urgency}
              </span>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
};

function generateMarkdownReport(analysis: DocumentAnalysis, checklist: PreSigningChecklistItem[]): string {
  return `# ClauseGuard Legal Audit Report
**Document**: ${analysis.documentTitle}
**Audit Date**: ${new Date(analysis.metadata.analyzedAt).toLocaleDateString()}
**Risk Score**: ${analysis.overallRiskScore}/100 (${analysis.riskTier})
**Analysis Engine**: ${analysis.metadata.engineName} (${analysis.metadata.latencyMs}ms)

---

## Executive Summary
${analysis.summary}

---

## Risk Breakdown
- **Liability Exposure**: ${analysis.riskBreakdown.liabilityScore}%
- **Financial Trap Index**: ${analysis.riskBreakdown.financialScore}%
- **Exit Difficulty**: ${analysis.riskBreakdown.exitDifficultyScore}%
- **Privacy & Data Control**: ${analysis.riskBreakdown.privacyScore}%

---

## Flagged Clauses & Plain English Meaning
${analysis.clauses
  .map(
    (c, i) => `### ${i + 1}. ${c.title} [${c.riskLevel}]
- **Category**: ${c.category}
- **Citation Grounding**: ${c.citation.status} ${c.citation.lineIndex ? `(Line #${c.citation.lineIndex})` : ''}
- **Quoted Clause**: "${c.legaleseSnippet}"
- **Plain English**: ${c.plainEnglishExplanation}
- **Hidden Risk**: ${c.potentialRisk}
- **Action Advice**: ${c.suggestedAction}
`
  )
  .join('\n')}

---

## Pre-Signing Action Checklist
${checklist
  .map((item) => `- [${item.completed ? 'x' : ' '}] (${item.urgency}) ${item.task}`)
  .join('\n')}

---
*Notice: ClauseGuard provides automated legal information and assistance for educational purposes and does not constitute formal legal advice.*
`;
}
