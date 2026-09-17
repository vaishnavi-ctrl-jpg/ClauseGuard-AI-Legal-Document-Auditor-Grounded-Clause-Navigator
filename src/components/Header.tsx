// ==============================================================================
// ClauseGuard: Accessible Navigation Header & System Status
// ==============================================================================

import React from 'react';
import { Shield, Sparkles, AlertTriangle, ExternalLink } from 'lucide-react';

interface HeaderProps {
  engineName?: string;
  isDemo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ engineName = 'Detecting...', isDemo = true }) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-40 shadow-xs" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Shield className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">ClauseGuard</span>
              <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                AI Legal Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Contract Risk Auditor • Grounded Citation Verification • Plain-English Translator
            </p>
          </div>
        </div>

        {/* Status Indicators & External Links */}
        <div className="flex items-center space-x-3">
          {/* Real-Time Engine Badge */}
          <div
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              isDemo
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
            title={isDemo ? 'Operating on deterministic demo engine without live Gemini key' : 'Connected to live Google Gemini AI'}
          >
            {isDemo ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                <span className="font-semibold">Engine: Demo Mode</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span className="font-semibold">Engine: {engineName}</span>
              </>
            )}
          </div>

          {/* Legal Boundary Notice Button */}
          <a
            href="#legal-disclaimer"
            className="hidden md:inline-flex items-center space-x-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition"
          >
            <span>Legal Boundary</span>
          </a>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-xs font-medium text-slate-700 hover:text-indigo-600 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 transition bg-slate-50"
            aria-label="View Source Code on GitHub"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
};
