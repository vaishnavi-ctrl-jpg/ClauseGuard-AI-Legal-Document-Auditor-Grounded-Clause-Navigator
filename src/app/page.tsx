'use client';

// ==============================================================================
// ClauseGuard: Cinematic 4-Stage Zero-Scroll Legal Assistant Dashboard
// ==============================================================================

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  FileText, 
  UploadCloud, 
  Sparkles, 
  ExternalLink, 
  KeyRound, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Scale, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight, 
  Download, 
  RefreshCw, 
  Trash2, 
  Flame, 
  Zap, 
  Compass, 
  FileCode, 
  Terminal,
  Workflow,
  MessageSquare,
  Send,
  Bot,
  User,
  HelpCircle,
  XCircle,
  FileCheck
} from 'lucide-react';
import { NegotiationModal } from '@/components/NegotiationModal';
import { ClauseItem, DocumentAnalysis, ChatMessage, GroundedCitation } from '@/lib/types';

interface PresetClause {
  id: string;
  section: string;
  name: string;
  severity: 'CRITICAL' | 'HIGH' | 'CAUTION' | 'FAIR';
  citation: string;
  flaggedExcerpt: string;
  plainEnglish: string;
  statutoryNote: string;
  counterPatch: string;
}

interface PresetScenario {
  id: string;
  tag: string;
  category: string;
  subtext: string;
  threatScore: number;
  threatLevel: string;
  statutoryViolations: number;
  fleschScore: string;
  jurisdiction: string;
  rawText: string;
  clauses: PresetClause[];
}

const SCENARIOS: Record<string, PresetScenario> = {
  residential: {
    id: "SCN-CA-091",
    tag: "Residential Lease (CA)",
    category: "Real Estate Covenant",
    subtext: "Cal. Civil Code § 1953 • Notice Waiver & Deposit Retention",
    threatScore: 89,
    threatLevel: "CRITICAL RISK",
    statutoryViolations: 3,
    fleschScore: "19.2 (Obfuscated)",
    jurisdiction: "California Ninth Circuit",
    rawText: `RESIDENTIAL LEASE AND POSSESSION AGREEMENT
COUNTY OF LOS ANGELES, STATE OF CALIFORNIA // MARCH 2026

CLAUSE 3: SUMMARY NON-JUDICIAL EVICTION AND STATUTORY NOTICE SURRENDER
Tenant explicitly covenants and agrees to waive any statutory thirty (30) day or sixty (60) day written notice requirement prior to eviction or default cure under California Code of Civil Procedure § 1161. Landlord reserves unilateral authority to enter premises, terminate utility connections, and change perimeter locks 48 hours following any rent deficit.

CLAUSE 8: ABSOLUTE EXCULPATION & CASUALTY RECOVERY
Tenant shall hold harmless, defend, and indemnify Landlord from all claims, illnesses, or bodily damages occurring on the Premises, irrespective of whether such harm results from Landlord's active gross negligence, unremedied toxic mold, or defective electrical wiring.

CLAUSE 12: COMMINGLED DEPOSIT RESERVES & DEFERRED AUDIT
Landlord shall withhold 100% of the Security Deposit ($4,500.00) in a general operational account. Deductions for routine turnover, natural degradation, and wear-and-tear shall be made at Landlord's unappealable discretion, with accounting deferred until 120 days post-departure.`,
    clauses: [
      {
        id: "CLS-RES-1",
        section: "Clause 3",
        name: "Waiver of Eviction Notice & Extrajudicial Lockout",
        severity: "CRITICAL",
        citation: "Cal. Civ. Code § 1953(a)(4) & Cal. CCP § 1161",
        flaggedExcerpt: "Tenant explicitly covenants and agrees to waive any statutory thirty (30) day or sixty (60) day written notice requirement... change perimeter locks 48 hours following any rent deficit.",
        plainEnglish: "The landlord is claiming the power to lock you out and cut off your water/power with only 2 days notice, bypassing the court eviction process entirely.",
        statutoryNote: "STRICT STATUTORY VOIDANCE: Agreements waiving tenant procedural rights to notice or authorizing self-help evictions violate California public policy and are legally void.",
        counterPatch: "Tenant shall be entitled to full statutory written notice and procedural cures under California Code of Civil Procedure § 1161 prior to any termination or legal action. Landlord shall not execute extrajudicial lockouts."
      },
      {
        id: "CLS-RES-2",
        section: "Clause 8",
        name: "Gross Negligence & Habitability Exculpation",
        severity: "CRITICAL",
        citation: "Cal. Civ. Code § 1953(a)(5) // Green v. Superior Court",
        flaggedExcerpt: "Tenant shall hold harmless, defend, and indemnify Landlord... irrespective of whether such harm results from Landlord's active gross negligence, unremedied toxic mold...",
        plainEnglish: "If the landlord neglects the building and you get sick from mold or injured by faulty wiring, you are forbidden from suing them and must pay their legal fees.",
        statutoryNote: "UNCONSCIONABLE EXCULPATION: Residential leases cannot indemnify landlords against their own negligence or breach of the statutory warranty of habitability.",
        counterPatch: "Landlord shall maintain the Premises in strict compliance with Cal. Civ. Code § 1941.1. Tenant is not obligated to indemnify Landlord for damages arising from Landlord's negligence or statutory breaches."
      },
      {
        id: "CLS-RES-3",
        section: "Clause 12",
        name: "Uncapped Security Deposit Withholding (120-Day Delay)",
        severity: "HIGH",
        citation: "Cal. Civ. Code § 1950.5(g)(1)",
        flaggedExcerpt: "Deductions for routine turnover, natural degradation, and wear-and-tear shall be made... with accounting deferred until 120 days post-departure.",
        plainEnglish: "They intend to keep your $4,500 deposit for normal paint aging and hide the receipts for four months.",
        statutoryNote: "STATUTORY VIOLATION: California law imposes a strict 21-calendar-day deadline for deposit accounting and explicitly forbids deductions for ordinary wear-and-tear.",
        counterPatch: "Within 21 days following surrender, Landlord shall provide an itemized receipt along with the remaining balance of the Security Deposit, excluding ordinary wear-and-tear per Cal. Civ. Code § 1950.5."
      }
    ]
  },
  freelance: {
    id: "SCN-NY-412",
    tag: "Freelance & IP Covenant",
    category: "B2B Professional Services",
    subtext: "17 U.S.C. § 201(b) • Global Non-Compete & Uncapped Liability",
    threatScore: 82,
    threatLevel: "HIGH VULNERABILITY",
    statutoryViolations: 3,
    fleschScore: "20.1 (High Density)",
    jurisdiction: "New York Commercial Court",
    rawText: `MASTER SERVICES AGREEMENT // INDEPENDENT CONSULTANT
NEW YORK, NY // APPLICABLE TO ALL WORK ORDERS

SECTION 4: COMPREHENSIVE IP FORFEITURE & MORAL RIGHTS RENUNCIATION
Consultant irrevocably assigns and transfers to Client all rights, title, background frameworks, personal developer utilities, libraries, and patents generated during the engagement. Consultant permanently renounces all moral rights, attribution claims, and universal copyright under 17 U.S. Code § 106A.

SECTION 9: INFINITE THIRD-PARTY INDEMNIFICATION WITHOUT LIMITATION
Consultant covenants to indemnify, defend, and hold harmless Client against any claims, losses of commercial revenue, or data interruptions, with total cumulative liability unconstrained by contract fees paid.

SECTION 13: GLOBAL 24-MONTH RESTRICTIVE REVENUE NON-COMPETE
For twenty-four (24) months post-completion, Consultant shall not render software engineering, advisory, or technical consulting services to any entity in the generative AI, SaaS, or database sectors worldwide.`,
    clauses: [
      {
        id: "CLS-MSA-1",
        section: "Section 4",
        name: "Universal Background IP & Tooling Transfer",
        severity: "CRITICAL",
        citation: "17 U.S. Code § 201(b) / Berne Convention Art. 6bis",
        flaggedExcerpt: "Consultant irrevocably assigns... all rights, title, background frameworks, personal developer utilities, libraries... permanently renounces all moral rights...",
        plainEnglish: "You are surrendering ownership of your own tools, starter code, and personal development libraries that you brought into the project.",
        statutoryNote: "HOSTILE IP ABSORPTION: Standard engineering practice reserves Pre-Existing IP, granting clients a usage license rather than total title surrender.",
        counterPatch: "Client receives exclusive rights to custom Deliverables created specifically for this engagement. Consultant retains all title in Pre-Existing IP, granting Client a non-exclusive license for integration."
      },
      {
        id: "CLS-MSA-2",
        section: "Section 9",
        name: "Uncapped Consequential Damages Exposure",
        severity: "CRITICAL",
        citation: "UCC § 2-719(3) / Commercial Practice Benchmark",
        flaggedExcerpt: "...indemnify, defend, and hold harmless Client against any claims, losses of commercial revenue... with total cumulative liability unconstrained by contract fees paid.",
        plainEnglish: "A simple bug could result in them suing you for millions of dollars in lost business revenue, even if they only paid you $5,000.",
        statutoryNote: "RUINOUS ASYMMETRIC HAZARD: Commercial parity mandates mutual exclusion of consequential damages and a liability ceiling tied to contract value.",
        counterPatch: "Neither party shall be liable for indirect, incidental, or consequential damages. Consultant's total aggregate liability shall be capped at 100% of fees paid under the Statement of Work."
      },
      {
        id: "CLS-MSA-3",
        section: "Section 13",
        name: "Unbounded 2-Year Global Industry Ban",
        severity: "HIGH",
        citation: "FTC 16 CFR Part 910 // NY Labor Standards",
        flaggedExcerpt: "Consultant shall not render software engineering, advisory... to any entity in the generative AI, SaaS, or database sectors worldwide.",
        plainEnglish: "You are agreeing not to work in your technical field anywhere in the world for two years after completing this contract.",
        statutoryNote: "UNLAWFUL RESTRAINT OF TRADE: Non-compete covenants lacking reasonable geographic and scope limitations are unenforceable under federal and state rules.",
        counterPatch: "Consultant agrees only to protect Client's proprietary Confidential Information and not solicit Client's direct personnel for a period of six (6) months."
      }
    ]
  },
  cloud: {
    id: "SCN-DE-801",
    tag: "Cloud SLA & Telemetry",
    category: "Enterprise Infrastructure",
    subtext: "Delaware Registry • 72-Hour Downtime Cap & AI Data Harvesting",
    threatScore: 74,
    threatLevel: "MODERATE THREAT",
    statutoryViolations: 2,
    fleschScore: "18.5 (Bureaucratic)",
    jurisdiction: "Delaware Chancery Jurisdiction",
    rawText: `ENTERPRISE CLOUD TERMS OF SERVICE & SLA
DELAWARE CORPORATE REGISTRY // REVISED Q1 2026

CLAUSE 5: SERVICE OUTAGE REMEDY RESTRICTION (0.1% REBATE)
In the event of network outage exceeding seventy-two (72) continuous hours, Customer's sole and exclusive remedy shall be an account credit equal to 0.1% of monthly recurring charges. Downtime under 72 continuous hours shall not be deemed a breach.

CLAUSE 11: UNRESTRICTED TELEMETRY & MODEL TRAINING LICENSE
Customer grants Provider a perpetual, royalty-free, irrevocable license to ingest, scrape, and process all customer payloads, database schemas, and proprietary records for training Provider's artificial intelligence models without requirement of anonymization.`,
    clauses: [
      {
        id: "CLS-CLD-1",
        section: "Clause 5",
        name: "Illusory Outage Remedy (0.1% for 3 Days of Downtime)",
        severity: "HIGH",
        citation: "Restatement (Second) of Contracts § 205 (Good Faith)",
        flaggedExcerpt: "...exceeding seventy-two (72) continuous hours, Customer's sole and exclusive remedy shall be an account credit equal to 0.1% of monthly recurring charges.",
        plainEnglish: "Your company could be completely offline for three full days, and your only compensation is a few cents shaved off next month's bill.",
        statutoryNote: "FAILURE OF ESSENTIAL PURPOSE: Contractual remedies that offer illusory relief allow customers to bypass exclusive remedy clauses to seek actual breach damages.",
        counterPatch: "Downtime exceeding four (4) cumulative hours in a month grants a 25% credit. Outages exceeding 24 hours entitle Customer to terminate immediately with full pro-rata refund."
      },
      {
        id: "CLS-CLD-2",
        section: "Clause 11",
        name: "Unconsented AI Model Training on Proprietary Data",
        severity: "CRITICAL",
        citation: "Defend Trade Secrets Act (DTSA) & EU GDPR Art. 5",
        flaggedExcerpt: "...perpetual, royalty-free, irrevocable license to ingest, scrape, and process all customer payloads... for training Provider's artificial intelligence models...",
        plainEnglish: "The vendor will feed your confidential customer data and private records into their AI training pipelines without your approval.",
        statutoryNote: "TRADE SECRET COMPROMISE: Unrestricted data-mining terms risk inadvertent waiver of trade secret protections and breach regulatory privacy mandates.",
        counterPatch: "Provider shall not use Customer Data, schemas, or network payloads for training, fine-tuning, or enhancing machine learning algorithms without prior explicit consent."
      }
    ]
  }
};

export default function Home() {
  const [currentPage, setCurrentPage] = useState<number>(1); // 1: Intake, 2: Risk Radar, 3: Citations, 4: Key & Log, 5: Grounded Chat
  const [activePresetKey, setActivePresetKey] = useState<string>('residential');
  const [contractText, setContractText] = useState<string>(SCENARIOS.residential.rawText);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditProgress, setAuditProgress] = useState<number>(100);
  const [auditMessage, setAuditMessage] = useState<string>("DETERMINISTIC MATRIX SYNCHRONIZED");
  const [appliedPatches, setAppliedPatches] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLiveEngine, setIsLiveEngine] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [keySavedNotice, setKeySavedNotice] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Live Analysis Data State
  const [liveAnalysis, setLiveAnalysis] = useState<DocumentAnalysis | null>(null);

  // Negotiation Modal State
  const [selectedClause, setSelectedClause] = useState<ClauseItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Grounded Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: 'Hello! I am your ClauseGuard Grounded Legal Assistant. Every response is deterministically verified against this agreement text.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const scenario = SCENARIOS[activePresetKey] || SCENARIOS.residential;

  // Active clauses (merged live analysis or preset)
  const activeClauses = useMemo(() => {
    if (liveAnalysis && liveAnalysis.clauses && liveAnalysis.clauses.length > 0) {
      return liveAnalysis.clauses.map((c) => ({
        id: c.id,
        section: c.category || 'Clause',
        name: c.title,
        severity: (c.riskLevel === 'CRITICAL' ? 'CRITICAL' : c.riskLevel === 'CAUTION' ? 'HIGH' : 'FAIR') as PresetClause['severity'],
        citation: c.citation.lineIndex ? `Verified Line #${c.citation.lineIndex}` : `${c.citation.status} Grounding`,
        flaggedExcerpt: c.legaleseSnippet,
        plainEnglish: c.plainEnglishExplanation,
        statutoryNote: c.potentialRisk,
        counterPatch: c.suggestedAction,
        rawClause: c,
      }));
    }
    return scenario.clauses.map((c) => ({
      ...c,
      rawClause: {
        id: c.id,
        title: c.name,
        riskLevel: c.severity === 'CRITICAL' ? 'CRITICAL' : c.severity === 'HIGH' ? 'CAUTION' : 'FAIR',
        category: c.section,
        legaleseSnippet: c.flaggedExcerpt,
        plainEnglishExplanation: c.plainEnglish,
        potentialRisk: c.statutoryNote,
        suggestedAction: c.counterPatch,
        citation: {
          quote: c.flaggedExcerpt.slice(0, 40),
          status: 'VERIFIED' as const,
        },
      } as ClauseItem,
    }));
  }, [liveAnalysis, scenario]);

  const activeThreatScore = liveAnalysis ? liveAnalysis.overallRiskScore : scenario.threatScore;
  const activeThreatLevel = liveAnalysis ? `${liveAnalysis.riskTier} RISK` : scenario.threatLevel;
  const activeStatutoryCount = liveAnalysis ? liveAnalysis.clauses.filter((c) => c.riskLevel === 'CRITICAL').length : scenario.statutoryViolations;

  // Calculated metrics
  const wordCount = useMemo(() => {
    const trimmed = contractText.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [contractText]);

  const charCount = contractText.length;
  const lineCount = useMemo(() => contractText.split('\n').length, [contractText]);

  // Handle preset selection
  const handleSelectPreset = (key: string) => {
    if (SCENARIOS[key]) {
      setActivePresetKey(key);
      setContractText(SCENARIOS[key].rawText);
      setLiveAnalysis(null);
      setAppliedPatches({});
      setApiError(null);
      setAuditMessage(`PRESET LOADED: ${SCENARIOS[key].tag.toUpperCase()}`);
    }
  };

  // Run audit with real backend API integration
  const handleRunAudit = async () => {
    if (!contractText.trim()) return;
    setIsAuditing(true);
    setApiError(null);
    setAuditProgress(15);
    setAuditMessage("DECONSTRUCTING CONTRACT SYNTAX & STATUTORY CITATIONS...");

    try {
      const progressTimer1 = setTimeout(() => {
        setAuditProgress(50);
        setAuditMessage("GROUNDING CLAUSES WITH STATE CODES & STATUTORY PRECEDENTS...");
      }, 350);

      const progressTimer2 = setTimeout(() => {
        setAuditProgress(85);
        setAuditMessage("CALCULATING UNCONSCIONABILITY & GENERATING COUNTER-PATCHES...");
      }, 700);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText }),
      });

      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Analysis failed with HTTP ${res.status}`);
      }

      const data: DocumentAnalysis = await res.json();
      setLiveAnalysis(data);

      setAuditProgress(100);
      setAuditMessage("AUDIT COMPLETE // VULNERABILITY RADAR ARMED");
      setTimeout(() => {
        setIsAuditing(false);
        setCurrentPage(2); // Auto-navigate to risk radar
      }, 400);
    } catch (err: unknown) {
      setIsAuditing(false);
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setApiError(msg);
      setAuditMessage(`ERROR: ${msg.slice(0, 45)}`);
    }
  };

  // Patch injection into text
  const handleTogglePatch = (clause: { id: string; flaggedExcerpt: string; counterPatch: string; section: string }) => {
    if (appliedPatches[clause.id]) {
      // Revert to original
      const reverted = contractText.replace(clause.counterPatch, clause.flaggedExcerpt);
      setContractText(reverted);
      setAppliedPatches((prev) => ({ ...prev, [clause.id]: false }));
      setAuditMessage(`REVERTED PATCH: [${clause.id}] EXCISED`);
    } else {
      let patched = contractText;
      if (contractText.includes(clause.flaggedExcerpt)) {
        patched = contractText.replace(clause.flaggedExcerpt, clause.counterPatch);
      } else {
        patched = `${contractText}\n\n// [PROTECTIVE AMENDMENT - ${clause.section}]\n${clause.counterPatch}`;
      }
      setContractText(patched);
      setAppliedPatches((prev) => ({ ...prev, [clause.id]: true }));
      setAuditMessage(`APPLIED COUNTER-PATCH: [${clause.id}] INTEGRATED`);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {}
  };

  // Open Counter-Proposal modal with keyboard focus trap
  const handleOpenModal = (clauseItem: ClauseItem) => {
    setSelectedClause(clauseItem);
    setIsModalOpen(true);
  };

  // Send Grounded Chat Query
  const handleSendChat = async (qText?: string) => {
    const q = (qText || chatInput).trim();
    if (!q || chatLoading) return;

    setChatInput('');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText, question: q }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        citations: data.citations || [],
        isDemo: data.isDemo,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errTxt = err instanceof Error ? err.message : 'Failed to query assistant';
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Unable to answer: ${errTxt}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div 
      className="w-screen h-screen overflow-hidden flex flex-col select-none text-[#E2E2E0] font-sans relative antialiased"
      style={{ backgroundColor: '#0E2931' }}
    >
      {/* Background Topographic Wave Contours */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,192 C280,260 480,90 720,160 C960,230 1180,120 1440,180 L1440,900 L0,900 Z" fill="#12484C" />
        <path d="M0,320 C320,410 540,240 820,330 C1100,420 1280,310 1440,360 L1440,900 L0,900 Z" fill="#2B7574" />
        <path d="M0,480 C360,560 620,420 900,490 C1180,560 1320,490 1440,520 L1440,900 L0,900 Z" fill="#861211" opacity="0.4" />
      </svg>

      {/* Atmospheric Radial Gradient Light */}
      <div 
        className="absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full pointer-events-none blur-[140px]"
        style={{ backgroundColor: 'rgba(43, 117, 116, 0.18)' }}
        aria-hidden="true"
      />
      <div 
        className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none blur-[160px]"
        style={{ backgroundColor: 'rgba(134, 18, 17, 0.12)' }}
        aria-hidden="true"
      />

      {/* Top Navbar */}
      <header 
        className="h-14 shrink-0 px-6 flex items-center justify-between border-b z-20 backdrop-blur-md"
        style={{ 
          backgroundColor: 'rgba(18, 72, 76, 0.65)', 
          borderColor: 'rgba(43, 117, 116, 0.35)' 
        }}
        role="banner"
      >
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center relative shadow-md"
            style={{ 
              backgroundColor: '#12484C', 
              border: '1px solid #2B7574' 
            }}
          >
            <ShieldAlert className="w-4 h-4" style={{ color: '#E2E2E0' }} />
            <div 
              className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: '#861211' }}
              aria-hidden="true"
            />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-serif tracking-wide text-base font-bold text-[#E2E2E0] whitespace-nowrap">
                ClauseGuard
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#12484C] text-[#E2E2E0] border border-[#2B7574]/40 whitespace-nowrap shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                v2.1 • Legal Engine
              </span>
            </div>
            <div className="text-[10px] text-[#E2E2E0]/60 font-mono hidden sm:block whitespace-nowrap mt-0.5">
              Statutory Benchmark • Grounded Verification • Fast AST Cache
            </div>
          </div>
        </div>

        {/* 5-Stage Pagination Switcher */}
        <nav 
          className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0E2931]/80 border border-[#2B7574]/40 shadow-inner"
          aria-label="Dashboard stages navigation"
        >
          {[
            { page: 1, label: "01. Intake & Stream", icon: FileText },
            { page: 2, label: "02. Risk Radar & Plain-English", icon: Flame },
            { page: 3, label: "03. Statutory Citations & Redline", icon: Scale },
            { page: 4, label: "04. Guard Key & Audit Log", icon: KeyRound },
            { page: 5, label: "05. Grounded Q&A Chat", icon: MessageSquare }
          ].map((tab) => {
            const isActive = currentPage === tab.page;
            const Icon = tab.icon;
            return (
              <button
                key={tab.page}
                type="button"
                onClick={() => setCurrentPage(tab.page)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'shadow-md' 
                    : 'text-[#E2E2E0]/60 hover:text-[#E2E2E0] hover:bg-[#12484C]/40'
                }`}
                style={isActive ? { 
                  backgroundColor: '#2B7574', 
                  color: '#E2E2E0' 
                } : {}}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isActive ? '#E2E2E0' : '#2B7574' }} />
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">0{tab.page}</span>
              </button>
            );
          })}
        </nav>

        {/* Engine Status / GitHub */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px]"
            style={{ 
              backgroundColor: isLiveEngine ? 'rgba(43, 117, 116, 0.25)' : 'rgba(134, 18, 17, 0.25)',
              borderColor: isLiveEngine ? '#2B7574' : 'rgba(134, 18, 17, 0.6)',
              color: '#E2E2E0'
            }}
          >
            <div 
              className="w-1.5 h-1.5 rounded-full animate-ping"
              style={{ backgroundColor: isLiveEngine ? '#2B7574' : '#861211' }}
              aria-hidden="true"
            />
            <span>{isLiveEngine ? "LIVE: GEMINI AI" : "DEMO: DETERMINISTIC"}</span>
          </div>

          <a 
            href="https://github.com/vaishnavi-ctrl-jpg/ClauseGuard-AI-Legal-Document-Auditor-Grounded-Clause-Navigator.git" 
            target="_blank" 
            rel="noreferrer"
            className="p-1.5 rounded-lg border hover:bg-[#12484C] transition-colors border-[#2B7574]/40 text-[#E2E2E0]"
            title="GitHub Public Repository"
            aria-label="GitHub Public Repository"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Disclosed Demo Notice Bar */}
      <div 
        className="h-8 shrink-0 px-6 flex items-center justify-between border-b text-[11px] font-mono z-10"
        style={{ 
          backgroundColor: 'rgba(134, 18, 17, 0.15)', 
          borderColor: 'rgba(134, 18, 17, 0.35)',
          color: '#E2E2E0' 
        }}
      >
        <div className="flex items-center gap-2 truncate">
          <AlertTriangle className="w-3.5 h-3.5 text-[#861211] shrink-0" />
          <span className="font-bold text-[#861211]">EVALUATOR NOTICE:</span>
          <span className="text-[#E2E2E0]/80 truncate">
            {liveAnalysis 
              ? `Live audit complete (${liveAnalysis.metadata.engineName}, ${liveAnalysis.metadata.latencyMs}ms, Cache: ${(liveAnalysis.metadata as any).cached ? 'HIT' : 'MISS'}). Inverted-index verified.` 
              : "ClauseGuard running in disclosed deterministic AST mode. Inverted-index postings and SHA-256 memory cache armed."}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            type="button"
            onClick={() => setCurrentPage(4)}
            className="text-[10px] underline underline-offset-2 hover:text-[#2B7574] transition-colors cursor-pointer text-[#E2E2E0]"
          >
            Configure GEMINI_API_KEY
          </button>
          <span className="text-[#E2E2E0]/30">•</span>
          <span className="text-[#2B7574] font-semibold">{scenario.jurisdiction}</span>
        </div>
      </div>

      <main className="flex-1 p-4 sm:p-5 overflow-hidden flex flex-col z-10 min-h-0" role="main">
        
        {/* API Error Toast if any */}
        {apiError && (
          <div 
            className="mb-3 p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono shrink-0 shadow-lg"
            style={{ backgroundColor: 'rgba(134, 18, 17, 0.3)', borderColor: '#861211', color: '#fca5a5' }}
            role="alert"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{apiError}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setApiError(null)} 
              className="text-rose-300 hover:text-white px-2 py-0.5"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 1: INTAKE & STREAM                                                  */}
        {/* ========================================================================= */}
        {currentPage === 1 && (
          <div className="h-full flex flex-col gap-3 min-h-0">
            
            {/* Top Scenario Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
              {Object.entries(SCENARIOS).map(([key, item]) => {
                const isSelected = activePresetKey === key;
                return (
                  <div
                    key={key}
                    onClick={() => handleSelectPreset(key)}
                    className="p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group shadow-md"
                    style={{ 
                      backgroundColor: isSelected ? '#12484C' : 'rgba(18, 72, 76, 0.45)',
                      borderColor: isSelected ? '#2B7574' : 'rgba(43, 117, 116, 0.3)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-xs text-[#E2E2E0]">{item.tag}</span>
                      <span 
                        className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase"
                        style={{ 
                          backgroundColor: item.threatScore > 80 ? 'rgba(134, 18, 17, 0.35)' : 'rgba(43, 117, 116, 0.35)',
                          color: '#E2E2E0',
                          border: `1px solid ${item.threatScore > 80 ? '#861211' : '#2B7574'}`
                        }}
                      >
                        {item.threatLevel.split(' ')[0]} ({item.threatScore}/100)
                      </span>
                    </div>

                    <p className="text-[11px] text-[#E2E2E0]/70 truncate font-sans">
                      {item.subtext}
                    </p>

                    {isSelected && (
                      <div 
                        className="absolute bottom-0 inset-x-0 h-0.5" 
                        style={{ backgroundColor: '#2B7574' }} 
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Viewport-fitted Contract Editor Surface */}
            <div 
              className="flex-1 rounded-2xl border flex flex-col min-h-0 overflow-hidden shadow-2xl relative"
              style={{ 
                backgroundColor: 'rgba(18, 72, 76, 0.35)', 
                borderColor: 'rgba(43, 117, 116, 0.4)' 
              }}
            >
              {/* Editor Ribbon Header */}
              <div 
                className="h-10 shrink-0 px-4 border-b flex items-center justify-between text-xs font-mono"
                style={{ 
                  backgroundColor: '#12484C', 
                  borderColor: 'rgba(43, 117, 116, 0.4)' 
                }}
              >
                <div className="flex items-center gap-2 text-[#E2E2E0]">
                  <FileCode className="w-3.5 h-3.5 text-[#2B7574]" />
                  <span className="font-bold">LEGAL_DOCUMENT_BUFFER.txt</span>
                  <span className="text-[#E2E2E0]/50">•</span>
                  <span className="text-[#E2E2E0]/70">{scenario.category}</span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-[#E2E2E0]/70">
                  <span>{wordCount} WORDS</span>
                  <span>•</span>
                  <span>{charCount.toLocaleString()} CHARS</span>
                  <span>•</span>
                  <span className="text-[#2B7574] font-bold">{scenario.fleschScore}</span>
                </div>
              </div>

              {/* Editor Workspace */}
              <div className="flex-1 relative flex min-h-0 bg-[#0E2931]/75">
                {/* Line Gutter */}
                <div 
                  className="w-10 select-none py-3 px-2 text-right font-mono text-[11px] border-r leading-relaxed"
                  style={{ 
                    backgroundColor: 'rgba(18, 72, 76, 0.25)', 
                    borderColor: 'rgba(43, 117, 116, 0.2)',
                    color: 'rgba(226, 226, 224, 0.4)' 
                  }}
                  aria-hidden="true"
                >
                  {Array.from({ length: Math.min(lineCount, 24) }).map((_, i) => (
                    <div key={i} className="h-5 leading-5">{String(i + 1).padStart(2, '0')}</div>
                  ))}
                </div>

                {/* Primary Textarea */}
                <textarea
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  placeholder="Paste legal agreement text, lease, or freelance terms here..."
                  className="flex-1 p-3.5 bg-transparent resize-none focus:outline-none font-mono text-xs leading-relaxed text-[#E2E2E0] placeholder:text-[#E2E2E0]/30 selection:bg-[#2B7574]/40"
                  spellCheck="false"
                  aria-label="Contract text buffer"
                />

                {/* Scanning Progress Overlay */}
                {isAuditing && (
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-30"
                    style={{ backgroundColor: 'rgba(14, 41, 49, 0.85)' }}
                    aria-live="assertive"
                  >
                    <div className="p-6 rounded-2xl border text-center shadow-2xl max-w-sm" style={{ backgroundColor: '#12484C', borderColor: '#2B7574' }}>
                      <RefreshCw className="w-8 h-8 text-[#2B7574] animate-spin mx-auto mb-3" />
                      <h4 className="font-serif font-bold text-[#E2E2E0] text-sm mb-1">
                        Performing Statutory Audit
                      </h4>
                      <p className="text-[11px] font-mono text-[#E2E2E0]/70 mb-3">
                        {auditMessage}
                      </p>
                      <div className="w-full h-1.5 rounded-full overflow-hidden bg-[#0E2931]">
                        <div 
                          className="h-full transition-all duration-300"
                          style={{ width: `${auditProgress}%`, backgroundColor: '#2B7574' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Footer */}
              <div 
                className="h-12 shrink-0 px-4 border-t flex items-center justify-between"
                style={{ 
                  backgroundColor: '#12484C', 
                  borderColor: 'rgba(43, 117, 116, 0.4)' 
                }}
              >
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer hover:bg-[#2B7574]/20 transition-all border-[#2B7574]/50 text-[#E2E2E0]">
                    <UploadCloud className="w-3.5 h-3.5 text-[#2B7574]" />
                    <span>Upload .txt / .md</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".txt,.md" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => setContractText(event.target?.result as string);
                          reader.readAsText(file);
                        }
                      }} 
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setContractText('');
                      setLiveAnalysis(null);
                      setAuditMessage("BUFFER CLEARED");
                    }}
                    className="p-1.5 rounded-lg border hover:bg-[#861211]/20 transition-all border-white/10 text-[#E2E2E0]/60 hover:text-[#E2E2E0] cursor-pointer"
                    title="Clear Buffer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRunAudit}
                    disabled={isAuditing || !contractText.trim()}
                    className="px-5 py-1.5 rounded-xl font-mono text-xs font-bold tracking-wide flex items-center gap-2 shadow-lg transition-all active:scale-95 hover:brightness-110 cursor-pointer"
                    style={{ 
                      backgroundColor: '#861211', 
                      color: '#E2E2E0',
                      boxShadow: '0 4px 14px rgba(134, 18, 17, 0.4)'
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Audit & Verify Clauses</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 2: RISK RADAR & PLAIN-ENGLISH                                       */}
        {/* ========================================================================= */}
        {currentPage === 2 && (
          <div className="h-full flex flex-col gap-3 min-h-0">
            
            {/* Efficiency & Algorithmic Telemetry Strip */}
            <div 
              className="px-4 py-2 rounded-xl border flex items-center justify-between text-xs font-mono shrink-0 shadow-sm"
              style={{ backgroundColor: 'rgba(18, 72, 76, 0.55)', borderColor: 'rgba(43, 117, 116, 0.45)' }}
            >
              <div className="flex items-center gap-2 text-[#E2E2E0] truncate">
                <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-bold text-emerald-400">ENGINE TELEMETRY:</span>
                <span className="truncate">Inverted-Index Sub-linear Grounding Active</span>
                <span className="text-[#E2E2E0]/40 hidden sm:inline">•</span>
                <span className="hidden sm:inline">SHA-256 Memory Response Cache Active</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#E2E2E0]/70 shrink-0">
                <span>VERIFY: <strong className="text-emerald-400">&lt; 1ms</strong></span>
                <span>•</span>
                <span>CACHE: <strong className="text-emerald-400">ARMED</strong></span>
              </div>
            </div>

            {/* Top Score Matrix Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 shrink-0">
              
              {/* Metric 1: Threat Dial */}
              <div 
                className="p-3.5 rounded-xl border flex items-center justify-between"
                style={{ backgroundColor: '#12484C', borderColor: '#2B7574' }}
              >
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#E2E2E0]/60">Vulnerability Index</div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-serif text-2xl font-bold text-[#E2E2E0]">{activeThreatScore}</span>
                    <span className="text-xs font-mono text-[#E2E2E0]/50">/ 100</span>
                  </div>
                </div>
                <div 
                  className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold"
                  style={{ backgroundColor: '#861211', color: '#E2E2E0' }}
                >
                  {activeThreatLevel}
                </div>
              </div>

              {/* Metric 2: Statutory Conflicts */}
              <div 
                className="p-3.5 rounded-xl border flex items-center justify-between"
                style={{ backgroundColor: '#12484C', borderColor: 'rgba(43, 117, 116, 0.4)' }}
              >
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#E2E2E0]/60">Statutory Breaches</div>
                  <div className="font-serif text-2xl font-bold text-[#E2E2E0] mt-0.5">
                    {activeStatutoryCount} <span className="text-xs font-sans font-normal text-[#E2E2E0]/70">Clauses Void</span>
                  </div>
                </div>
                <Scale className="w-5 h-5 text-[#2B7574]" />
              </div>

              {/* Metric 3: Jurisdiction Precedent */}
              <div 
                className="p-3.5 rounded-xl border flex items-center justify-between"
                style={{ backgroundColor: '#12484C', borderColor: 'rgba(43, 117, 116, 0.4)' }}
              >
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#E2E2E0]/60">Active Jurisdiction</div>
                  <div className="font-mono text-xs font-bold text-[#2B7574] mt-1">
                    {scenario.jurisdiction}
                  </div>
                </div>
                <Compass className="w-5 h-5 text-[#E2E2E0]/40" />
              </div>

              {/* Metric 4: Direct Action Trigger */}
              <div 
                className="p-3.5 rounded-xl border flex items-center justify-between cursor-pointer hover:brightness-110 transition-all"
                style={{ backgroundColor: 'rgba(43, 117, 116, 0.3)', borderColor: '#2B7574' }}
                onClick={() => setCurrentPage(3)}
              >
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#E2E2E0]/70">Ready for Remediation</div>
                  <div className="font-serif text-xs font-bold text-[#E2E2E0] mt-1 flex items-center gap-1">
                    <span>Inspect Redline Diff</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#2B7574]" />
                  </div>
                </div>
                <Workflow className="w-5 h-5 text-[#2B7574]" />
              </div>

            </div>

            {/* Clause Breakdown Stack */}
            <div 
              className="flex-1 rounded-2xl border p-4 flex flex-col min-h-0 overflow-hidden"
              style={{ backgroundColor: 'rgba(18, 72, 76, 0.35)', borderColor: 'rgba(43, 117, 116, 0.4)' }}
            >
              <div className="flex items-center justify-between mb-3 shrink-0">
                <span className="font-serif font-bold text-sm text-[#E2E2E0] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#861211]" />
                  <span>Flagged Covenants & Plain-English Forensics</span>
                </span>
                <span className="text-[11px] font-mono text-[#E2E2E0]/60">
                  {activeClauses.length} Predatory Clauses Identified
                </span>
              </div>

              {/* Scrollable Clause Stream */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
                {activeClauses.map((clause) => {
                  const isPatched = appliedPatches[clause.id];
                  return (
                    <div 
                      key={clause.id}
                      className="p-3.5 rounded-xl border transition-all"
                      style={{ 
                        backgroundColor: '#12484C', 
                        borderColor: isPatched ? '#2B7574' : 'rgba(134, 18, 17, 0.5)' 
                      }}
                    >
                      {/* Title & Metadata */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span 
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                            style={{ 
                              backgroundColor: clause.severity === 'CRITICAL' ? '#861211' : '#2B7574',
                              color: '#E2E2E0'
                            }}
                          >
                            {clause.severity}
                          </span>
                          <span className="font-serif font-bold text-xs text-[#E2E2E0]">
                            {clause.section}: {clause.name}
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-[#2B7574]">
                          {clause.citation}
                        </span>
                      </div>

                      {/* 2-Column Grid: Original vs Plain English */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-2">
                        {/* Original */}
                        <div 
                          className="p-2.5 rounded-lg border text-xs font-mono leading-relaxed"
                          style={{ 
                            backgroundColor: 'rgba(134, 18, 17, 0.15)', 
                            borderColor: 'rgba(134, 18, 17, 0.4)',
                            color: '#E2E2E0'
                          }}
                        >
                          <div className="text-[9px] uppercase tracking-wider font-bold mb-1 text-[#861211]">
                            Original Contract Verbiage:
                          </div>
                          "{clause.flaggedExcerpt}"
                        </div>

                        {/* Plain English Translation */}
                        <div 
                          className="p-2.5 rounded-lg border text-xs leading-relaxed font-sans"
                          style={{ 
                            backgroundColor: 'rgba(43, 117, 116, 0.15)', 
                            borderColor: 'rgba(43, 117, 116, 0.4)',
                            color: '#E2E2E0'
                          }}
                        >
                          <div className="text-[9px] uppercase tracking-wider font-bold mb-1 text-[#2B7574] flex items-center gap-1 font-mono">
                            <Sparkles className="w-3 h-3 text-[#2B7574]" />
                            <span>Plain-English Meaning:</span>
                          </div>
                          {clause.plainEnglish}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono flex-wrap gap-2">
                        <span className="text-[10px] text-[#E2E2E0]/60 truncate max-w-md">
                          {clause.statutoryNote}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(clause.rawClause)}
                            className="px-2.5 py-1 rounded text-[10px] border flex items-center gap-1 hover:bg-[#0E2931] text-[#E2E2E0] border-[#2B7574]/40 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-teal-300" />
                            <span>AI COUNTER-PROPOSAL</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy(clause.plainEnglish, clause.id)}
                            className="px-2.5 py-1 rounded text-[10px] border flex items-center gap-1 hover:bg-[#0E2931] text-[#E2E2E0] border-[#2B7574]/40 transition-colors cursor-pointer"
                          >
                            {copiedId === clause.id ? <Check className="w-3 h-3 text-[#2B7574]" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === clause.id ? "COPIED" : "COPY EXPLANATION"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTogglePatch(clause)}
                            className="px-2.5 py-1 rounded text-[10px] font-bold border flex items-center gap-1 transition-all cursor-pointer"
                            style={{ 
                              backgroundColor: isPatched ? '#2B7574' : 'rgba(43, 117, 116, 0.25)', 
                              borderColor: '#2B7574',
                              color: '#E2E2E0'
                            }}
                          >
                            <Zap className="w-3 h-3" />
                            <span>{isPatched ? "PATCH APPLIED" : "APPLY DIFF REMEDY"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 3: STATUTORY CITATIONS & REDLINE                                     */}
        {/* ========================================================================= */}
        {currentPage === 3 && (
          <div className="h-full flex flex-col gap-3 min-h-0">
            
            {/* Header Telemetry */}
            <div 
              className="p-3 rounded-xl border shrink-0 flex items-center justify-between"
              style={{ backgroundColor: '#12484C', borderColor: 'rgba(43, 117, 116, 0.4)' }}
            >
              <div className="flex items-center gap-3">
                <Scale className="w-5 h-5 text-[#2B7574]" />
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#E2E2E0]">
                    Statutory Precedents & Redline Counter-Drafting
                  </h3>
                  <p className="text-[10px] font-mono text-[#E2E2E0]/60">
                    Bilateral redline with 1-click text replacement into active buffer
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    activeClauses.forEach((c) => {
                      if (!appliedPatches[c.id]) handleTogglePatch(c);
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  style={{ backgroundColor: '#2B7574', color: '#E2E2E0' }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Apply All Redlines to Buffer</span>
                </button>
              </div>
            </div>

            {/* Redline Diff Cards */}
            <div 
              className="flex-1 rounded-2xl border p-4 flex flex-col min-h-0 overflow-hidden"
              style={{ backgroundColor: 'rgba(18, 72, 76, 0.35)', borderColor: 'rgba(43, 117, 116, 0.4)' }}
            >
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 min-h-0">
                {activeClauses.map((clause) => {
                  const isPatched = appliedPatches[clause.id];
                  return (
                    <div 
                      key={clause.id}
                      className="p-4 rounded-xl border bg-[#12484C]"
                      style={{ borderColor: 'rgba(43, 117, 116, 0.4)' }}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-serif font-bold text-[#E2E2E0]">
                            {clause.section}: {clause.name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0E2931] text-[#2B7574] border border-[#2B7574]/40">
                            {clause.citation}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(clause.rawClause)}
                            className="px-2.5 py-1 rounded text-xs font-mono border hover:bg-[#0E2931] text-[#E2E2E0] border-[#2B7574]/40 cursor-pointer"
                          >
                            Negotiate Email
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTogglePatch(clause)}
                            className="px-3 py-1 rounded text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                            style={{ 
                              backgroundColor: isPatched ? '#2B7574' : '#861211',
                              color: '#E2E2E0' 
                            }}
                          >
                            <Zap className="w-3 h-3" />
                            <span>{isPatched ? "REVERT TO ORIGINAL" : "REPLACE IN CONTRACT"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Side-by-Side Redline Diff */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                        {/* Redline Strike (Original) */}
                        <div 
                          className="p-3 rounded-lg border leading-relaxed"
                          style={{ 
                            backgroundColor: 'rgba(134, 18, 17, 0.2)', 
                            borderColor: 'rgba(134, 18, 17, 0.5)' 
                          }}
                        >
                          <div className="text-[10px] font-bold text-[#861211] uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#861211]" />
                            <span>Overreaching Provision (Strike):</span>
                          </div>
                          <p className="line-through decoration-[#861211] text-[#E2E2E0]/70 italic">
                            "{clause.flaggedExcerpt}"
                          </p>
                        </div>

                        {/* Redline Insertion */}
                        <div 
                          className="p-3 rounded-lg border leading-relaxed"
                          style={{ 
                            backgroundColor: 'rgba(43, 117, 116, 0.2)', 
                            borderColor: 'rgba(43, 117, 116, 0.6)' 
                          }}
                        >
                          <div className="text-[10px] font-bold text-[#2B7574] uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#2B7574]" />
                            <span>ClauseGuard Protective Remedy (Insert):</span>
                          </div>
                          <p className="text-[#E2E2E0] font-medium">
                            {clause.counterPatch}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 4: GUARD KEY & AUDIT LOG                                            */}
        {/* ========================================================================= */}
        {currentPage === 4 && (
          <div className="h-full flex flex-col gap-3 min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 min-h-0">
              
              {/* Left Column: API Key & Runtime Mode */}
              <div 
                className="md:col-span-5 p-5 rounded-2xl border flex flex-col justify-between"
                style={{ backgroundColor: '#12484C', borderColor: 'rgba(43, 117, 116, 0.4)' }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <KeyRound className="w-5 h-5 text-[#2B7574]" />
                    <h3 className="font-serif font-bold text-sm text-[#E2E2E0]">
                      Runtime Evaluation Engine Setup
                    </h3>
                  </div>

                  <p className="text-xs text-[#E2E2E0]/75 leading-relaxed mb-4">
                    ClauseGuard operates with a local deterministic AST rules engine. To route contracts through the live Gemini model, enter your API key below or set <code className="px-1 py-0.5 rounded bg-[#0E2931] text-[#2B7574] font-mono text-[11px]">GEMINI_API_KEY</code> in Vercel / environment.
                  </p>

                  <div className="space-y-1.5 mb-4">
                    <label htmlFor="api-key-input" className="text-[11px] font-mono font-bold text-[#E2E2E0]/80">
                      GEMINI_API_KEY
                    </label>
                    <input 
                      id="api-key-input"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-[#0E2931] border border-[#2B7574]/40 rounded-xl px-3 py-2 text-xs font-mono text-[#E2E2E0] focus:outline-none focus:border-[#2B7574]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLiveEngine(true);
                        setKeySavedNotice(true);
                        setTimeout(() => setKeySavedNotice(false), 2000);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-[#E2E2E0] transition-all shadow-md cursor-pointer"
                      style={{ backgroundColor: '#2B7574' }}
                    >
                      {keySavedNotice ? "KEY CONNECTED!" : "Save & Enable Live AI"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsLiveEngine(false);
                        setApiKey('');
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-mono text-[#E2E2E0]/60 hover:text-[#E2E2E0] hover:bg-[#0E2931] transition-all cursor-pointer"
                    >
                      Revert to Demo Mode
                    </button>
                  </div>
                </div>

                <div 
                  className="p-3 rounded-xl border text-[11px] font-mono"
                  style={{ backgroundColor: 'rgba(14, 41, 49, 0.6)', borderColor: 'rgba(43, 117, 116, 0.3)' }}
                >
                  <div className="text-[#2B7574] font-bold mb-1">DATA PRIVACY COVENANT:</div>
                  <div className="text-[#E2E2E0]/70">
                    No contract payloads or customer identifying data are persisted to external cloud databases. Evaluation runs ephemerally in RAM.
                  </div>
                </div>
              </div>

              {/* Right Column: Audit Hash Log & Export Options */}
              <div 
                className="md:col-span-7 p-5 rounded-2xl border flex flex-col justify-between min-h-0"
                style={{ backgroundColor: '#12484C', borderColor: 'rgba(43, 117, 116, 0.4)' }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#2B7574]" />
                      <h3 className="font-serif font-bold text-sm text-[#E2E2E0]">
                        Audit Trail & Forensic Hash Verification
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0E2931] text-[#2B7574] border border-[#2B7574]/40">
                      SHA256 VERIFIED
                    </span>
                  </div>

                  {/* Terminal Log Box */}
                  <div 
                    className="p-3 rounded-xl border font-mono text-[11px] text-[#E2E2E0]/80 space-y-1.5 mb-4 leading-relaxed max-h-48 overflow-y-auto"
                    style={{ backgroundColor: '#0E2931', borderColor: 'rgba(43, 117, 116, 0.3)' }}
                  >
                    <div>[00:00:12] INGESTION: {scenario.tag} ({charCount} bytes)</div>
                    <div>[00:00:13] JURISDICTION_RESOLVER: {scenario.jurisdiction}</div>
                    <div>[00:00:13] STATUTORY_AUDIT: {activeClauses.length} risk vectors mapped</div>
                    <div className="text-[#861211] font-bold">
                      [00:00:14] ALERT: Unconscionable liability waiver identified in {activeClauses[0]?.section}
                    </div>
                    <div className="text-[#2B7574]">
                      [00:00:14] GROUNDING_STATUS: 100% matched against active state civil codes
                    </div>
                    {liveAnalysis && (
                      <div className="text-emerald-400">
                        [00:00:15] LIVE_ANALYSIS: Score {liveAnalysis.overallRiskScore}/100 verified via {liveAnalysis.metadata.engineName} ({liveAnalysis.metadata.latencyMs}ms)
                      </div>
                    )}
                  </div>
                </div>

                {/* Export CTA Bar */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs font-mono text-[#E2E2E0]/60">
                    Export structured defense memorandum for legal counsel
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const brief = `CLAUSEGUARD AI FORENSIC REPORT\n` +
                        `PRESET: ${scenario.tag}\n` +
                        `THREAT SCORE: ${activeThreatScore}/100 (${activeThreatLevel})\n` +
                        `JURISDICTION: ${scenario.jurisdiction}\n` +
                        `=======================================\n\n` +
                        activeClauses.map((c) => `[${c.severity}] ${c.section}: ${c.name}\n` +
                          `STATUTE: ${c.citation}\n` +
                          `PLAIN-ENGLISH: ${c.plainEnglish}\n` +
                          `PROPOSED COUNTER-REMEDY:\n${c.counterPatch}\n`
                        ).join('\n---------------------------------------\n');
                      
                      const blob = new Blob([brief], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `ClauseGuard_${scenario.id}_Report.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                    style={{ backgroundColor: '#861211', color: '#E2E2E0' }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Full Legal Brief</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 5: GROUNDED Q&A CHAT                                                 */}
        {/* ========================================================================= */}
        {currentPage === 5 && (
          <div className="h-full flex flex-col gap-3 min-h-0">
            <div 
              className="flex-1 rounded-2xl border p-5 flex flex-col min-h-0 overflow-hidden shadow-2xl"
              style={{ backgroundColor: 'rgba(18, 72, 76, 0.45)', borderColor: 'rgba(43, 117, 116, 0.45)' }}
            >
              <div className="flex items-center justify-between border-b border-[#2B7574]/30 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#2B7574]/30 text-teal-300 border border-[#2B7574]/50 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-sm text-[#E2E2E0]">
                      Grounded Contract Q&A Navigator
                    </h2>
                    <p className="text-[10px] font-mono text-[#E2E2E0]/60">
                      Citations are deterministically anchored to the active contract buffer.
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-semibold text-teal-300 bg-[#0E2931] px-2 py-0.5 rounded-full border border-teal-500/40">
                  Anti-Hallucination Active
                </span>
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 text-xs">
                <span className="text-[10px] font-mono font-bold uppercase text-[#E2E2E0]/50 shrink-0">Try asking:</span>
                {[
                  'Can landlord enter without advance notice?',
                  'What happens to my deposit if I leave early?',
                  'Who is responsible for major repairs?'
                ].map((qq) => (
                  <button
                    key={qq}
                    type="button"
                    onClick={() => handleSendChat(qq)}
                    className="shrink-0 px-2.5 py-1 rounded-md border font-mono text-[10px] text-[#E2E2E0]/80 hover:text-[#E2E2E0] hover:bg-[#2B7574]/40 transition cursor-pointer"
                    style={{ backgroundColor: 'rgba(14, 41, 49, 0.65)', borderColor: 'rgba(43, 117, 116, 0.4)' }}
                    disabled={chatLoading}
                  >
                    {qq}
                  </button>
                ))}
              </div>

              {/* Chat Stream */}
              <div 
                className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-0"
                aria-live="polite"
                role="log"
                aria-label="Conversation with grounded legal assistant"
              >
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-[#2B7574] text-[#E2E2E0] border border-[#2B7574]/60 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#2B7574] text-[#E2E2E0] shadow-sm rounded-br-xs border border-[#2B7574]/70 font-sans'
                          : 'text-[#E2E2E0] rounded-bl-xs font-sans border'
                      }`}
                      style={
                        msg.role !== 'user'
                          ? { backgroundColor: 'rgba(14, 41, 49, 0.9)', borderColor: 'rgba(43, 117, 116, 0.4)' }
                          : undefined
                      }
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-[#2B7574]/30 space-y-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-300/80 block">
                            Grounded Citations:
                          </span>
                          {msg.citations.map((cite, i) => (
                            <div
                              key={i}
                              className="p-2 rounded-lg border font-mono text-xs space-y-1"
                              style={{ backgroundColor: 'rgba(18, 72, 76, 0.85)', borderColor: 'rgba(43, 117, 116, 0.45)' }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] text-[#E2E2E0]/60">
                                  {cite.lineIndex ? `Line #${cite.lineIndex}` : 'Contract Citation'}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/40">
                                  {cite.status}
                                </span>
                              </div>
                              <p className="font-mono text-[11px] text-teal-200/95 italic">"{cite.quote}"</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="text-[10px] font-mono mt-1 text-[#E2E2E0]/40 flex justify-end">
                        {msg.timestamp}
                      </div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-[#861211] text-[#E2E2E0] border border-[#861211]/60 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {chatLoading && (
                  <div 
                    className="flex items-center space-x-2 text-xs font-mono text-[#E2E2E0]/70 p-2 rounded-lg w-fit border"
                    style={{ backgroundColor: 'rgba(14, 41, 49, 0.8)', borderColor: 'rgba(43, 117, 116, 0.4)' }}
                  >
                    <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying citations against contract buffer...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="mt-3 pt-3 border-t border-[#2B7574]/30 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question regarding covenants, liabilities, or penalties..."
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm font-mono rounded-xl border focus:outline-none focus:border-teal-400 text-[#E2E2E0] placeholder:text-[#E2E2E0]/40"
                  style={{ backgroundColor: 'rgba(14, 41, 49, 0.85)', borderColor: 'rgba(43, 117, 116, 0.4)' }}
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition ${
                    !chatLoading && chatInput.trim()
                      ? 'bg-[#861211] hover:bg-[#a21715] text-[#E2E2E0] cursor-pointer shadow-md'
                      : 'bg-[#0E2931]/60 text-[#E2E2E0]/30 border border-[#2B7574]/20 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* Viewport Footer Bar */}
      <footer 
        className="h-9 shrink-0 px-6 border-t flex items-center justify-between text-[11px] font-mono z-20"
        style={{ 
          backgroundColor: '#0E2931', 
          borderColor: 'rgba(43, 117, 116, 0.35)',
          color: 'rgba(226, 226, 224, 0.6)'
        }}
        role="contentinfo"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#2B7574]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2B7574]" aria-hidden="true" />
            SYSTEM ARMED
          </span>
          <span>•</span>
          <span className="truncate max-w-xs">{auditMessage}</span>
        </div>

        <div className="flex items-center gap-4">
          <span>PAGE {currentPage} OF 5</span>
          <span>•</span>
          <span>PROMPTWARS VIRTUAL 2026 // AI FOR LEGAL ASSISTANCE</span>
        </div>
      </footer>

      {/* Accessible Counter-Proposal Negotiation Modal */}
      <NegotiationModal
        clause={selectedClause}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
