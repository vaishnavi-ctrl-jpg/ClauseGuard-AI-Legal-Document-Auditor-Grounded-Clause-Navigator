// ==============================================================================
// ClauseGuard: Filterable Clause List with Grounded Citation Chips
// ==============================================================================

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  XCircle,
  FileEdit,
  Search,
  Filter,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { ClauseItem, RiskLevel } from '@/lib/types';

interface ClauseListProps {
  clauses: ClauseItem[];
  onDraftCounter: (clause: ClauseItem) => void;
}

export const ClauseList: React.FC<ClauseListProps> = ({ clauses, onDraftCounter }) => {
  const [filterRisk, setFilterRisk] = useState<'ALL' | RiskLevel>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Record<string, 'plain' | 'original'>>({});

  const filteredClauses = clauses.filter((c) => {
    const matchesRisk = filterRisk === 'ALL' || c.riskLevel === filterRisk;
    const matchesSearch =
      searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.plainEnglishExplanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.legaleseSnippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const toggleTab = (clauseId: string, tab: 'plain' | 'original') => {
    setActiveTab((prev) => ({ ...prev, [clauseId]: tab }));
  };

  return (
    <section className="space-y-4" aria-labelledby="clauses-heading">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 id="clauses-heading" className="text-lg font-bold text-slate-900">
            Detected Clauses ({clauses.length})
          </h2>
          <p className="text-xs text-slate-500">
            Every highlighted quote is cross-referenced against the raw contract text for verified grounding.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search clauses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-48"
              aria-label="Search clauses by keyword"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs" role="radiogroup" aria-label="Filter clauses by risk level">
            {(['ALL', 'CRITICAL', 'CAUTION', 'FAIR'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setFilterRisk(r)}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  filterRisk === r
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                role="radio"
                aria-checked={filterRisk === r}
              >
                {r === 'ALL' ? 'All' : r === 'CRITICAL' ? 'Critical' : r === 'CAUTION' ? 'Caution' : 'Fair'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clause Cards */}
      {filteredClauses.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          No clauses matched your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredClauses.map((clause) => {
            const currentTab = activeTab[clause.id] || 'plain';

            return (
              <article
                key={clause.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden"
              >
                {/* Clause Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/40">
                  <div className="flex items-center space-x-2.5 flex-wrap">
                    {/* Accessible Risk Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        clause.riskLevel === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : clause.riskLevel === 'CAUTION'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {clause.riskLevel === 'CRITICAL' && <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />}
                      {clause.riskLevel === 'CAUTION' && <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />}
                      {clause.riskLevel === 'FAIR' && <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />}
                      <span>{clause.riskLevel}</span>
                    </span>

                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {clause.category}
                    </span>

                    <h3 className="font-bold text-slate-900 text-base">{clause.title}</h3>
                  </div>

                  {/* Deterministic Citation Chip */}
                  <CitationChip citation={clause.citation} />
                </div>

                {/* Body Content */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* View Tabs */}
                  <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleTab(clause.id, 'plain')}
                      className={`pb-1 px-1 font-semibold flex items-center gap-1 transition ${
                        currentTab === 'plain'
                          ? 'text-indigo-600 border-b-2 border-indigo-600'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      aria-selected={currentTab === 'plain'}
                    >
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Plain English Meaning</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleTab(clause.id, 'original')}
                      className={`pb-1 px-1 font-semibold flex items-center gap-1 transition ${
                        currentTab === 'original'
                          ? 'text-indigo-600 border-b-2 border-indigo-600'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      aria-selected={currentTab === 'original'}
                    >
                      <span>Original Legalese Quoted</span>
                    </button>
                  </div>

                  {/* Tab Contents */}
                  {currentTab === 'plain' ? (
                    <div className="space-y-3">
                      <div className="bg-indigo-50/50 p-3.5 rounded-lg border border-indigo-100">
                        <p className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-1">
                          In Plain Terms
                        </p>
                        <p className="text-sm text-slate-800 leading-relaxed font-medium">
                          {clause.plainEnglishExplanation}
                        </p>
                      </div>

                      {clause.potentialRisk && (
                        <div className="text-xs text-rose-800 bg-rose-50/60 p-2.5 rounded-lg border border-rose-100 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                          <div>
                            <strong>Hidden Trap: </strong>
                            <span>{clause.potentialRisk}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg font-mono text-xs leading-relaxed border border-slate-800">
                      <div className="flex justify-between items-center text-slate-400 text-[11px] mb-2 border-b border-slate-800 pb-1">
                        <span>Verbatim Contract Quote</span>
                        {clause.citation.lineIndex && <span>Source Line #{clause.citation.lineIndex}</span>}
                      </div>
                      <p className="whitespace-pre-wrap selection:bg-indigo-500 selection:text-white">
                        "{clause.legaleseSnippet}"
                      </p>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-600">
                      <strong className="text-slate-800">Recommended Action: </strong>
                      <span>{clause.suggestedAction}</span>
                    </div>

                    {clause.riskLevel !== 'FAIR' && (
                      <button
                        type="button"
                        onClick={() => onDraftCounter(clause)}
                        className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs shrink-0"
                        aria-label={`Draft counter-proposal for ${clause.title}`}
                      >
                        <FileEdit className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Draft Counter-Proposal</span>
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

interface CitationChipProps {
  citation: ClauseItem['citation'];
}

const CitationChip: React.FC<CitationChipProps> = ({ citation }) => {
  if (citation.status === 'VERIFIED') {
    return (
      <div
        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300"
        title="Exact or whitespace-normalized substring found in source contract"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
        <span>Verified in Document{citation.lineIndex ? ` (Line ${citation.lineIndex})` : ''}</span>
      </div>
    );
  }

  if (citation.status === 'PARAPHRASED') {
    return (
      <div
        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300"
        title="Semantic/token overlap found in contract clause text"
      >
        <HelpCircle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
        <span>Paraphrased Match ({Math.round(citation.matchScore * 100)}% token match)</span>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-300"
      title="Anti-Hallucination Alert: AI quote could not be verified in the input contract"
    >
      <XCircle className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
      <span>Unverified Citation</span>
    </div>
  );
};
