// ==============================================================================
// ClauseGuard: Accessible Document Ingestion & Sample Loader
// ==============================================================================

import React, { useState } from 'react';
import { FileText, Sparkles, UploadCloud, RotateCcw, AlertCircle } from 'lucide-react';
import { SAMPLE_CONTRACTS, SampleContract } from '@/lib/sampleContracts';
import { MIN_DOCUMENT_CHAR_LENGTH, MAX_DOCUMENT_CHAR_LENGTH } from '@/lib/security';

interface DocumentInputProps {
  onAnalyze: (text: string) => void;
  loading: boolean;
}

export const DocumentInput: React.FC<DocumentInputProps> = ({ onAnalyze, loading }) => {
  const [contractText, setContractText] = useState('');
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  const charCount = contractText.length;
  const wordCount = contractText.trim() ? contractText.trim().split(/\s+/).length : 0;
  const isValidLength = charCount >= MIN_DOCUMENT_CHAR_LENGTH && charCount <= MAX_DOCUMENT_CHAR_LENGTH;

  const handleLoadSample = (sample: SampleContract) => {
    setSelectedSample(sample.id);
    setContractText(sample.text);
  };

  const handleClear = () => {
    setContractText('');
    setSelectedSample(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setContractText(content);
        setSelectedSample(null);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidLength && !loading) {
      onAnalyze(contractText);
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6" aria-labelledby="doc-input-title">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 id="doc-input-title" className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            <span>Input Legal Document or Contract</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Paste full agreement text, upload a file, or load a realistic test sample.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            Samples:
          </span>
          {SAMPLE_CONTRACTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleLoadSample(sample)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                selectedSample === sample.id
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title={sample.description}
            >
              {sample.name.split(' ')[0]} Lease
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Textarea */}
        <div className="relative">
          <label htmlFor="contract-textarea" className="sr-only">
            Contract or legal text
          </label>
          <textarea
            id="contract-textarea"
            value={contractText}
            onChange={(e) => {
              setContractText(e.target.value);
              setSelectedSample(null);
            }}
            placeholder="Paste your rental lease, freelance contract, employment terms, or NDA text here to audit for hidden risks..."
            rows={9}
            className="w-full p-4 rounded-xl border border-slate-300 text-sm font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition leading-relaxed resize-y"
            aria-describedby="contract-length-help"
            disabled={loading}
          />

          {/* Quick Clear Floating Button */}
          {contractText && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-3 p-1.5 text-slate-400 hover:text-slate-600 bg-white/90 rounded-md border border-slate-200 shadow-xs"
              title="Clear text"
              aria-label="Clear document text"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Footer Bar: Metrics, Upload, and Submit */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            {/* File Upload Trigger */}
            <label className="inline-flex items-center space-x-1.5 font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer">
              <UploadCloud className="w-4 h-4" aria-hidden="true" />
              <span>Upload .txt / .md</span>
              <input
                type="file"
                accept=".txt,.md,.text"
                onChange={handleFileUpload}
                className="sr-only"
                disabled={loading}
              />
            </label>

            {/* Live Counters */}
            <span id="contract-length-help">
              <strong className="text-slate-700 font-mono">{wordCount}</strong> words •{' '}
              <strong className="text-slate-700 font-mono">{charCount.toLocaleString()}</strong> /{' '}
              {MAX_DOCUMENT_CHAR_LENGTH.toLocaleString()} chars
            </span>
          </div>

          {/* Submit Button */}
          <div className="flex items-center space-x-3">
            {charCount > 0 && !isValidLength && (
              <span className="text-rose-600 inline-flex items-center gap-1 font-medium text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                {charCount < MIN_DOCUMENT_CHAR_LENGTH
                  ? `Need ${MIN_DOCUMENT_CHAR_LENGTH - charCount} more characters`
                  : 'Exceeds max length'}
              </span>
            )}

            <button
              type="submit"
              disabled={!isValidLength || loading}
              className={`inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition ${
                isValidLength && !loading
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 cursor-pointer active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Auditing Contract...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>Audit & Verify Clauses</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
