// ==============================================================================
// ClauseGuard: Accessible Negotiation Modal with Complete Keyboard Focus Trap
// ==============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { X, Copy, Check, Sparkles, Send, ShieldCheck, Clock } from 'lucide-react';
import { ClauseItem, CounterProposal } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NegotiationModalProps {
  clause: ClauseItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NegotiationModal: React.FC<NegotiationModalProps> = ({
  clause,
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<CounterProposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [copiedClause, setCopiedClause] = useState(false);

  // Store trigger element when opening for focus restoration
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    }
  }, [isOpen]);

  // Request counter-proposal from API when modal opens
  useEffect(() => {
    if (!isOpen || !clause) {
      setProposal(null);
      setError(null);
      return;
    }

    let isMounted = true;
    const fetchProposal = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/negotiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clauseId: clause.id,
            clauseTitle: clause.title,
            originalClause: clause.legaleseSnippet,
            potentialRisk: clause.potentialRisk,
          }),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || `HTTP error ${res.status}`);
        }

        const data: CounterProposal = await res.json();
        if (isMounted) {
          setProposal(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to generate counter-proposal');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProposal();

    return () => {
      isMounted = false;
    };
  }, [isOpen, clause]);

  // Robust Focus Trap & Keyboard Handling (WCAG 2.1 Compliant)
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element on modal appearance
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab: if on first element, cycle to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab: if on last element, cycle to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to original trigger element on modal close
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, loading, proposal]);

  const copyToClipboard = async (text: string, type: 'draft' | 'clause') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'draft') {
        setCopiedDraft(true);
        setTimeout(() => setCopiedDraft(false), 2000);
      } else {
        setCopiedClause(true);
        setTimeout(() => setCopiedClause(false), 2000);
      }
    } catch {
      // Fallback if clipboard API unavailable
    }
  };

  if (!isOpen || !clause) return null;

  return (
    <div
      className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="counter-modal-title"
    >
      <div
        ref={modalRef}
        className={cn("bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto")}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="counter-modal-title" className="text-lg font-bold text-slate-900">
                Counter-Proposal & Negotiation Drafter
              </h2>
              <p className="text-xs text-slate-500">
                Targeted clause: <span className="font-semibold text-slate-700">{clause.title}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close negotiation modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3" aria-live="polite">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-600">Drafting balanced legal counter-proposal...</p>
            <p className="text-xs text-slate-400">Synthesizing mutual notice windows and fair liability caps</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm" role="alert">
            <p className="font-bold">Error drafting proposal</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        ) : proposal ? (
          <div className="space-y-4">
            {/* Metadata Badge */}
            <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                <span>Engine: <strong>{proposal.metadata.engineName}</strong></span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{proposal.metadata.latencyMs}ms</span>
              </div>
            </div>

            {/* Proposed Fair Revision */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="revised-clause" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Proposed Balanced Replacement Clause
                </label>
                <button
                  type="button"
                  onClick={() => copyToClipboard(proposal.revisedFairClause, 'clause')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                >
                  {copiedClause ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedClause ? 'Copied' : 'Copy Clause'}</span>
                </button>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 font-mono text-xs leading-relaxed">
                {proposal.revisedFairClause}
              </div>
            </div>

            {/* Negotiation Rationale */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Why this is Reasonable & Standard
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {proposal.rationale}
              </p>
            </div>

            {/* Ready-to-Send Email Draft */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <Send className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                  <span>Ready-to-Send Email to Counterparty</span>
                </h3>
                <button
                  type="button"
                  onClick={() => copyToClipboard(proposal.readyToSendDraft, 'draft')}
                  className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
                >
                  {copiedDraft ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDraft ? 'Copied to Clipboard!' : 'Copy Email'}</span>
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-sans text-xs leading-relaxed whitespace-pre-wrap border border-slate-800 selection:bg-indigo-600">
                {proposal.readyToSendDraft}
              </pre>
            </div>
          </div>
        ) : null}

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
