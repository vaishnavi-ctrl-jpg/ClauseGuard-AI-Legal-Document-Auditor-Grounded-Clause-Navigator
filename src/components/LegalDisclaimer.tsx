// ==============================================================================
// ClauseGuard: Mandatory Legal Assistance Boundary & Ethical Disclaimer
// ==============================================================================

import React from 'react';
import { Scale, ShieldAlert } from 'lucide-react';

export const LegalDisclaimer: React.FC = () => {
  return (
    <footer
      id="legal-disclaimer"
      className="mt-12 pt-8 pb-12 border-t border-slate-200 bg-slate-50 text-slate-500 text-xs"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-start space-x-3.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Scale className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <span>Legal Assistance Boundary & Disclaimer</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-4xl">
                ClauseGuard is an artificial intelligence-powered legal navigation and comprehension assistant built for informational,
                educational, and self-advocacy purposes. It is <strong>not a licensed law firm and does not provide formal legal advice</strong> or
                attorney-client representation. Grounded citations and plain-English translations are generated via automated NLP and LLM heuristics.
                Always consult a qualified attorney licensed in your jurisdiction for critical legal decisions.
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right text-[11px] text-slate-400">
            <span>PromptWars Virtual 2026</span>
            <br />
            <span>AI for Legal Assistance & Access</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
