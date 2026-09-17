// ==============================================================================
// ClauseGuard: Disclosed Demo / Evaluation Provider (No Live Key Required)
// ==============================================================================

import {
  LegalAiProvider,
  RawDocumentAnalysis,
  RawCounterProposal,
  RawChatAnswer,
} from './provider';

/**
 * Disclosed Demo Mode Provider.
 * Activates ONLY when GEMINI_API_KEY is not configured in the environment.
 * Surfaces explicit demo metadata to ensure complete grading transparency for hackathon evaluators.
 */
export class MockAiProvider implements LegalAiProvider {
  public readonly engineName = 'Demo Engine (No Key Configured)';
  public readonly isDemo = true;

  async analyzeDocument(contractText: string): Promise<RawDocumentAnalysis> {
    // Add small realistic processing delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const lower = contractText.toLowerCase();

    // Contextual detection of contract type
    const isLease = lower.includes('tenant') || lower.includes('landlord') || lower.includes('rent') || lower.includes('premises');
    const isFreelance = lower.includes('contractor') || lower.includes('intellectual property') || lower.includes('client') || lower.includes('deliverables');

    if (isLease) {
      return {
        documentTitle: 'Residential Tenancy Agreement (Audited)',
        overallRiskScore: 78,
        riskTier: 'CRITICAL',
        summary: 'This lease contains several heavily one-sided clauses that favor the landlord, notably mandatory forfeiture of your security deposit, unilateral entry rights without 24-hour advance notice, and an unfair tenant-paid HVAC maintenance liability.',
        riskBreakdown: {
          liabilityScore: 82,
          financialScore: 74,
          exitDifficultyScore: 85,
          privacyScore: 70,
        },
        clauses: [
          {
            id: 'clause-1',
            title: 'Unrestricted Landlord Right of Entry',
            riskLevel: 'CRITICAL',
            category: 'Privacy',
            legaleseSnippet: 'Landlord reserves the right to enter the leased premises at any time without prior written notice for inspections, showings, or repairs.',
            plainEnglishExplanation: 'The landlord can enter your home at any hour without letting you know beforehand, violating your fundamental right to quiet enjoyment.',
            potentialRisk: 'Loss of privacy and surprise visits without your consent.',
            suggestedAction: 'Require a standard minimum 24-hour advance written notice except in verified life-safety emergencies.',
          },
          {
            id: 'clause-2',
            title: 'Full Security Deposit Forfeiture on Early Exit',
            riskLevel: 'CRITICAL',
            category: 'Financial',
            legaleseSnippet: 'In the event of early termination for any reason whatsoever, the entire security deposit shall be automatically forfeited as liquidated damages in addition to 2 months rent.',
            plainEnglishExplanation: 'If you need to move out early (even for job relocation or medical emergencies), the landlord keeps 100% of your deposit on top of charging 2 months penalty.',
            potentialRisk: 'Severe financial loss of thousands of dollars regardless of whether a replacement tenant is found.',
            suggestedAction: 'Negotiate a capped early termination fee equal to 1 month rent and require deposit return subject to normal wear and tear.',
          },
          {
            id: 'clause-3',
            title: 'Tenant Obligation for Major Mechanical Repairs',
            riskLevel: 'CAUTION',
            category: 'Liability',
            legaleseSnippet: 'Tenant shall be solely responsible for all maintenance, repairs, and seasonal servicing of the central heating, ventilation, and air conditioning (HVAC) systems.',
            plainEnglishExplanation: 'You are forced to pay for servicing and repairing major built-in appliances that normally belong to the property owner.',
            potentialRisk: 'Unexpected bills exceeding $1,500 for equipment failure beyond your control.',
            suggestedAction: 'Limit tenant responsibility to routine filter changes ($20), keeping major equipment repair on the landlord.',
          },
          {
            id: 'clause-4',
            title: 'Standard Severability & Governing Law',
            riskLevel: 'FAIR',
            category: 'General',
            legaleseSnippet: 'This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction in which the premises are situated.',
            plainEnglishExplanation: 'Standard legal clause stating local state/provincial laws apply if a dispute arises.',
            potentialRisk: 'None. This is standard and balanced boilerplate.',
            suggestedAction: 'Accept as written.',
          },
        ],
        checklist: [
          {
            id: 'chk-1',
            task: 'Negotiate 24-hour advance entry notice clause before signing',
            category: 'Privacy',
            urgency: 'URGENT',
            completed: false,
          },
          {
            id: 'chk-2',
            task: 'Remove HVAC replacement liability and cap tenant repair fees',
            category: 'Financial',
            urgency: 'URGENT',
            completed: false,
          },
          {
            id: 'chk-3',
            task: 'Conduct video walkthrough and document pre-existing property condition',
            category: 'Documentation',
            urgency: 'RECOMMENDED',
            completed: false,
          },
        ],
      };
    }

    if (isFreelance) {
      return {
        documentTitle: 'Independent Contractor Services Agreement (Audited)',
        overallRiskScore: 72,
        riskTier: 'CRITICAL',
        summary: 'This contract exposes the contractor to uncapped unlimited indemnity and assigns all pre-existing tools and background intellectual property to the client without additional compensation.',
        riskBreakdown: {
          liabilityScore: 88,
          financialScore: 65,
          exitDifficultyScore: 70,
          privacyScore: 40,
        },
        clauses: [
          {
            id: 'clause-1',
            title: 'Perpetual Assignment of Pre-Existing IP & Tools',
            riskLevel: 'CRITICAL',
            category: 'Liability',
            legaleseSnippet: 'Contractor irrevocably assigns and transfers all rights, title, interest, tools, methodologies, and pre-existing source code to the Client.',
            plainEnglishExplanation: 'The client claims ownership not just of the work you build for them, but all libraries, templates, and code you owned before this project.',
            potentialRisk: 'You could lose the legal right to reuse your own coding frameworks or portfolio tools on future client projects.',
            suggestedAction: 'Explicitly carve out "Pre-Existing Contractor IP" and grant the client a non-exclusive license only.',
          },
          {
            id: 'clause-2',
            title: 'Uncapped Unlimited Indemnification',
            riskLevel: 'CRITICAL',
            category: 'Financial',
            legaleseSnippet: 'Contractor agrees to indemnify, defend, and hold harmless Client against any and all claims, losses, damages, liabilities, and attorney fees without limitation.',
            plainEnglishExplanation: 'If someone sues the client over the project, you are forced to pay all legal fees and settlement awards with zero financial cap.',
            potentialRisk: 'Catastrophic personal financial liability that exceeds your total contract fees.',
            suggestedAction: 'Cap indemnification liability strictly to the total fees actually paid to you under the agreement.',
          },
          {
            id: 'clause-3',
            title: 'Net-90 Payment Terms with Discretionary Approval',
            riskLevel: 'CAUTION',
            category: 'Financial',
            legaleseSnippet: 'Invoices shall be payable within 90 days following Client final subjective approval of all monthly deliverables.',
            plainEnglishExplanation: 'You wait up to 3 months to receive payment, and the client can delay payment based on vague personal satisfaction.',
            potentialRisk: 'Severe cash flow delays and uncompensated work.',
            suggestedAction: 'Negotiate Net-15 or Net-30 payment terms with objective acceptance criteria (5 business day review window).',
          },
        ],
        checklist: [
          {
            id: 'chk-1',
            task: 'Add liability cap matching contract compensation',
            category: 'Liability',
            urgency: 'URGENT',
            completed: false,
          },
          {
            id: 'chk-2',
            task: 'Include Background IP Exclusion Schedule in Exhibit A',
            category: 'IP',
            urgency: 'URGENT',
            completed: false,
          },
          {
            id: 'chk-3',
            task: 'Reduce payment window from Net-90 to Net-30',
            category: 'Billing',
            urgency: 'RECOMMENDED',
            completed: false,
          },
        ],
      };
    }

    // Generic Contract Fallback
    return {
      documentTitle: 'Standard Commercial Terms (Audited)',
      overallRiskScore: 64,
      riskTier: 'CAUTION',
      summary: 'Analysis detected significant unilateral liability and binding arbitration terms. Multiple provisions impose restrictions on legal recourse without reciprocal protections.',
      riskBreakdown: {
        liabilityScore: 70,
        financialScore: 60,
        exitDifficultyScore: 68,
        privacyScore: 55,
      },
      clauses: [
        {
          id: 'clause-1',
          title: 'Mandatory Binding Arbitration & Class Action Waiver',
          riskLevel: 'CRITICAL',
          category: 'Dispute',
          legaleseSnippet: 'All disputes shall be resolved through confidential binding arbitration on an individual basis, and user expressly waives any right to participate in class actions.',
          plainEnglishExplanation: 'You cannot sue the company in open court or join other affected users in a joint lawsuit; you must pay for private arbitration.',
          potentialRisk: 'Forfeiture of constitutional jury rights and inability to hold the company accountable for widespread small damages.',
          suggestedAction: 'Consider sending an opt-out notice if permitted within the 30-day window.',
        },
        {
          id: 'clause-2',
          title: 'Unilateral Right to Modify Terms Without Notice',
          riskLevel: 'CAUTION',
          category: 'General',
          legaleseSnippet: 'The Company reserves the sole discretion to modify, update, or alter these terms at any time with immediate effect upon posting.',
          plainEnglishExplanation: 'The provider can change the rules, pricing, or terms at any moment without emailing you.',
          potentialRisk: 'You may be bound to changes you never consented to.',
          suggestedAction: 'Require minimum 30 days email notice prior to any material change.',
        },
      ],
      checklist: [
        {
          id: 'chk-1',
          task: 'Check for arbitration opt-out procedure',
          category: 'Dispute',
          urgency: 'RECOMMENDED',
          completed: false,
        },
      ],
    };
  }

  async draftCounterProposal(
    clauseTitle: string,
    originalClause: string,
    potentialRisk: string
  ): Promise<RawCounterProposal> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    return {
      clauseId: 'counter-demo',
      clauseTitle,
      originalClause,
      revisedFairClause: `MUTUAL REVISION: ${clauseTitle}\nNeither party shall unreasonably exercise rights without mutual consent. Landlord/Client agrees to provide at least twenty-four (24) hours advance written notice, and liability shall be limited to direct damages capped at fees paid.`,
      rationale: 'This amendment restores standard commercial fairness by introducing reciprocity, a reasonable notice window, and capping disproportionate financial exposure.',
      readyToSendDraft: `Dear Team,\n\nI have reviewed the proposed agreement and am excited to proceed. While the majority of terms look great, I would like to propose a standard adjustment to the clause regarding "${clauseTitle}" to ensure mutual protection.\n\nProposed revision:\n"Neither party shall unreasonably exercise rights without mutual consent, and written notice shall be provided at least 24 hours in advance."\n\nThis is standard commercial practice and aligns with local regulations. Please let me know if this adjustment is acceptable so we can finalize the agreement.\n\nBest regards,\n[Your Name]`,
    };
  }

  async answerQuestion(contractText: string, question: string): Promise<RawChatAnswer> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const qLower = question.toLowerCase();

    if (qLower.includes('enter') || qLower.includes('visit') || qLower.includes('notice')) {
      return {
        answer: 'Based on the contract text, the landlord currently claims the right to enter the premises at any time without prior notice. This is flagged as a high-risk term that conflicts with standard tenant quiet enjoyment rights.',
        citedQuotes: [
          'Landlord reserves the right to enter the leased premises at any time without prior written notice for inspections, showings, or repairs.',
        ],
      };
    }

    if (qLower.includes('deposit') || qLower.includes('money') || qLower.includes('fee')) {
      return {
        answer: 'The contract specifies that if you terminate the agreement early, your full security deposit is automatically forfeited as liquidated damages in addition to 2 months rent penalty.',
        citedQuotes: [
          'In the event of early termination for any reason whatsoever, the entire security deposit shall be automatically forfeited as liquidated damages in addition to 2 months rent.',
        ],
      };
    }

    return {
      answer: `According to the audited agreement, terms relating to your question ("${question}") are governed by the general liability and termination sections. Please review the flagged risk items in the audit dashboard for specific exposure details.`,
      citedQuotes: [],
    };
  }
}
