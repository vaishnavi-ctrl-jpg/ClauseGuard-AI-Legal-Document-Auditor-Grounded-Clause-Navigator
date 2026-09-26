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
      className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="counter-modal-title"
    >
      <div
        ref={modalRef}
        className={cn("bg-[#12484C] text-[#E2E2E0] rounded-2xl border border-[#2B7574]/50 shadow-2xl max-w-2xl w-full p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto font-sans")}
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#2B7574]/30 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2B7574]/25 text-[#2B7574] border border-[#2B7574]/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="counter-modal-title" className="text-lg font-serif font-bold text-[#E2E2E0]">
                Counter-Proposal & Negotiation Drafter
              </h2>
              <p className="text-xs text-[#E2E2E0]/70 font-mono">
                Targeted clause: <span className="font-semibold text-[#2B7574]">{clause.title}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#E2E2E0]/60 hover:text-[#E2E2E0] hover:bg-[#0E2931] border border-transparent hover:border-[#2B7574]/30 transition cursor-pointer"
            aria-label="Close negotiation modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3" aria-live="polite">
            <div className="w-8 h-8 border-3 border-[#2B7574] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-[#E2E2E0]">Drafting balanced legal counter-proposal...</p>
            <p className="text-xs text-[#E2E2E0]/60 font-mono">Synthesizing mutual notice windows and fair liability caps</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-[#861211]/25 border border-[#861211]/60 text-red-200 text-sm font-mono" role="alert">
            <p className="font-bold">Error drafting proposal</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        ) : proposal ? (
          <div className="space-y-4">
            {/* Metadata Badge */}
            <div className="flex items-center justify-between text-xs bg-[#0E2931] p-2.5 rounded-xl border border-[#2B7574]/30 font-mono">
              <div className="flex items-center gap-1.5 text-[#E2E2E0]/80">
                <ShieldCheck className="w-4 h-4 text-[#2B7574]" aria-hidden="true" />
                <span>Engine: <strong className="text-[#2B7574]">{proposal.metadata.engineName}</strong></span>
              </div>
              <div className="flex items-center gap-1 text-[#E2E2E0]/60 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#2B7574]" aria-hidden="true" />
                <span>{proposal.metadata.latencyMs}ms</span>
              </div>
            </div>

            {/* Proposed Fair Revision */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="revised-clause" className="text-xs font-mono font-bold uppercase tracking-wider text-[#2B7574]">
                  Proposed Balanced Replacement Clause
                </label>
                <button
                  type="button"
                  onClick={() => copyToClipboard(proposal.revisedFairClause, 'clause')}
                  className="text-xs font-mono font-semibold text-[#2B7574] hover:text-emerald-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedClause ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedClause ? 'Copied' : 'Copy Clause'}</span>
                </button>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0E2931]/90 border border-emerald-500/40 text-emerald-300 font-mono text-xs leading-relaxed shadow-inner">
                {proposal.revisedFairClause}
              </div>
            </div>

            {/* Negotiation Rationale */}
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#2B7574]">
                Why this is Reasonable & Standard
              </h3>
              <p className="text-xs text-[#E2E2E0]/85 leading-relaxed bg-[#0E2931] p-3.5 rounded-xl border border-[#2B7574]/30 font-sans">
                {proposal.rationale}
              </p>
            </div>

            {/* Ready-to-Send Email Draft */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#2B7574] flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-[#2B7574]" aria-hidden="true" />
                  <span>Ready-to-Send Email to Counterparty</span>
                </h3>
                <button
                  type="button"
                  onClick={() => copyToClipboard(proposal.readyToSendDraft, 'draft')}
                  className="inline-flex items-center gap-1 text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-[#861211] text-[#E2E2E0] hover:bg-[#a21715] border border-[#861211]/60 transition shadow-sm cursor-pointer"
                >
                  {copiedDraft ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDraft ? 'Copied to Clipboard!' : 'Copy Email'}</span>
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-[#0E2931] text-[#E2E2E0] font-sans text-xs leading-relaxed whitespace-pre-wrap border border-[#2B7574]/40">
                {proposal.readyToSendDraft}
              </pre>
            </div>
          </div>
        ) : null}

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-[#2B7574]/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono font-bold text-[#E2E2E0] bg-[#0E2931] hover:bg-[#2B7574]/30 border border-[#2B7574]/40 rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
