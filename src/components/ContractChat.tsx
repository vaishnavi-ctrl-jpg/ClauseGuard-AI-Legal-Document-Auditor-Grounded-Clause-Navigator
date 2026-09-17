// ==============================================================================
// ClauseGuard: Grounded Legal Q&A Chat with Verified Citations & aria-live
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, CheckCircle2, HelpCircle, XCircle, Sparkles } from 'lucide-react';
import { ChatMessage, GroundedCitation } from '@/lib/types';

interface ContractChatProps {
  contractText: string;
}

export const ContractChat: React.FC<ContractChatProps> = ({ contractText }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        'Hello! I am your ClauseGuard Legal Assistant. Ask me any question regarding obligations, risks, or rights in this agreement. Every answer is grounded directly in the contract text with verified citations.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionToSend?: string) => {
    const q = (questionToSend || inputQuestion).trim();
    if (!q || loading) return;

    setError(null);
    setInputQuestion('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractText,
          question: q,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        citations: data.citations || [],
        isDemo: data.isDemo,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve grounded answer.');
    } finally {
      setLoading(false);
    }
  };

  const QUICK_QUESTIONS = [
    'Can landlord enter without advance notice?',
    'What happens to my deposit if I leave early?',
    'Who is responsible for major appliance repairs?',
  ];

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-[520px]" aria-labelledby="chat-heading">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 id="chat-heading" className="text-base font-bold text-slate-900">
              Grounded Contract Q&A
            </h2>
            <p className="text-xs text-slate-500">
              Answers are strictly grounded in contract text; hallucinations are filtered out.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          Anti-Hallucination Active
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 text-xs text-slate-600">
        <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">Try asking:</span>
        {QUICK_QUESTIONS.map((qq) => (
          <button
            key={qq}
            type="button"
            onClick={() => handleSend(qq)}
            className="shrink-0 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 transition text-[11px]"
            disabled={loading}
          >
            {qq}
          </button>
        ))}
      </div>

      {/* Messages Stream with aria-live="polite" */}
      <div
        className="flex-1 overflow-y-auto space-y-3.5 pr-2"
        aria-live="polite"
        role="log"
        aria-label="Conversation with contract assistant"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Bot className="w-4 h-4" aria-hidden="true" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-xs rounded-br-xs'
                  : 'bg-slate-100/80 text-slate-900 border border-slate-200/80 rounded-bl-xs'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Citations Grounding Chips */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Grounded Document Citations:
                  </span>
                  {msg.citations.map((cite, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-500">
                          {cite.lineIndex ? `Line #${cite.lineIndex}` : 'Contract Citation'}
                        </span>
                        <CitationStatusBadge citation={cite} />
                      </div>
                      <p className="font-mono text-[11px] text-slate-600 italic">"{cite.quote}"</p>
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`text-[10px] mt-1.5 ${
                  msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                } flex justify-end`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <User className="w-4 h-4" aria-hidden="true" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-500 p-2 bg-slate-50 rounded-lg w-fit" aria-live="assertive">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Consulting contract clauses & verifying citations...</span>
          </div>
        )}

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs" role="alert">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2"
      >
        <label htmlFor="chat-input" className="sr-only">
          Ask a question about the contract
        </label>
        <input
          id="chat-input"
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="Ask a question about clauses, risks, or penalties..."
          className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !inputQuestion.trim()}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
            !loading && inputQuestion.trim()
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
          aria-label="Send question"
        >
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </section>
  );
};

const CitationStatusBadge: React.FC<{ citation: GroundedCitation }> = ({ citation }) => {
  if (citation.status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        Verified In Source
      </span>
    );
  }
  if (citation.status === 'PARAPHRASED') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
        <HelpCircle className="w-3 h-3 text-amber-600" />
        Paraphrased
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
      <XCircle className="w-3 h-3 text-rose-600" />
      Unverified
    </span>
  );
};
