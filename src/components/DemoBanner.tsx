// ==============================================================================
// ClauseGuard: Loud & Disclosed Demo Mode Banner
// ==============================================================================

import React from 'react';
import { AlertCircle, KeyRound, Info } from 'lucide-react';

interface DemoBannerProps {
  isDemo: boolean;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ isDemo }) => {
  if (!isDemo) return null;

  return (
    <div
      className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 border-b border-amber-300/80 px-4 py-3"
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-start space-x-3">
          <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
            !
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-amber-900 flex items-center gap-1.5">
              <span>Notice for Evaluators: Operating in Disclosed Demo Mode</span>
            </p>
            <p className="text-xs text-amber-800/90 mt-0.5">
              No <code className="bg-amber-100/80 px-1 py-0.5 rounded text-amber-950 font-mono text-[11px]">GEMINI_API_KEY</code> detected in environment.
              ClauseGuard is running on its deterministic evaluation engine so all features (risk scoring, grounding verification, counter-proposals) work immediately.
              To switch to live Gemini AI, provide your key in <code className="bg-amber-100/80 px-1 py-0.5 rounded text-amber-950 font-mono text-[11px]">.env.local</code>.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center space-x-2 text-xs font-medium text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-md border border-amber-300">
          <KeyRound className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
          <span>Fails Closed on Invalid Keys</span>
        </div>
      </div>
    </div>
  );
};
