// ==============================================================================
// ClauseGuard: Realistic Sample Contracts for Live Screen Evaluation
// ==============================================================================

export interface SampleContract {
  id: string;
  name: string;
  category: string;
  description: string;
  text: string;
}

export const SAMPLE_CONTRACTS: SampleContract[] = [
  {
    id: 'sample-lease',
    name: 'Residential Tenancy Agreement',
    category: 'Tenancy / Lease',
    description: 'Contains predatory landlord entry rights, full deposit forfeiture, and tenant HVAC liability.',
    text: `RESIDENTIAL LEASE AGREEMENT

This Agreement is entered into between Oakridge Properties LLC ("Landlord") and the undersigned Tenant ("Tenant") for the premises located at 742 Evergreen Terrace, Unit 4B.

SECTION 1: TERM AND RENT
The term of this lease begins on October 1, 2026, and continues for a period of twelve (12) consecutive months. Tenant agrees to pay monthly rent of $2,250.00 due on the first calendar day of each month.

SECTION 2: LANDLORD ACCESS AND ENTRY
Landlord reserves the right to enter the leased premises at any time without prior written notice for inspections, showings, or repairs. Tenant waives any requirement of advance notification.

SECTION 3: EARLY TERMINATION & LIQUIDATED DAMAGES
In the event of early termination for any reason whatsoever, the entire security deposit shall be automatically forfeited as liquidated damages in addition to 2 months rent. No exceptions shall be made for employment transfer or illness.

SECTION 4: MAINTENANCE AND APPLIANCE REPAIRS
Tenant shall be solely responsible for all maintenance, repairs, and seasonal servicing of the central heating, ventilation, and air conditioning (HVAC) systems. Any mechanical replacement costs exceeding $500 shall be billed to Tenant as additional rent.

SECTION 5: PETS AND PROHIBITED GUESTS
No pets are allowed under any circumstances. Any overnight guest staying more than forty-eight (48) consecutive hours shall incur an unauthorized occupant surcharge of $75.00 per day.

SECTION 6: GOVERNING LAW AND SEVERABILITY
This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction in which the premises are situated. If any provision is deemed unenforceable, remaining terms remain in full force.`,
  },
  {
    id: 'sample-freelance',
    name: 'Freelance Software Developer Agreement',
    category: 'Work / Freelance',
    description: 'Contains perpetual background IP surrender, uncapped indemnity, and Net-90 payment terms.',
    text: `INDEPENDENT CONTRACTOR SERVICES AGREEMENT

This Agreement is entered into between Apex Digital Ventures Inc. ("Client") and the Independent Specialist ("Contractor").

SECTION 1: SERVICES AND DELIVERABLES
Contractor agrees to perform full-stack software development services as specified in Exhibit A attached hereto.

SECTION 2: OWNERSHIP AND INTELLECTUAL PROPERTY
Contractor irrevocably assigns and transfers all rights, title, interest, tools, methodologies, and pre-existing source code to the Client. Contractor retains no rights to reuse code architectures developed prior to or during the engagement.

SECTION 3: UNLIMITED INDEMNIFICATION
Contractor agrees to indemnify, defend, and hold harmless Client against any and all claims, losses, damages, liabilities, and attorney fees without limitation arising from any third-party claim.

SECTION 4: PAYMENT AND ACCEPTANCE
Invoices shall be payable within 90 days following Client final subjective approval of all monthly deliverables. Client reserves the right to withhold payments if satisfaction criteria are not met in Client's sole discretion.

SECTION 5: NON-COMPETE RESTRICTION
For a period of twenty-four (24) months following termination of this Agreement, Contractor shall not directly or indirectly provide software consulting services to any business operating in the software sector globally.

SECTION 6: ENTIRE AGREEMENT
This document constitutes the entire agreement between the parties and supersedes all prior negotiations or oral understandings.`,
  },
  {
    id: 'sample-saas',
    name: 'Cloud Platform Terms of Service',
    category: 'Consumer / SaaS',
    description: 'Contains unilateral price changes, mandatory individual binding arbitration, and class action waiver.',
    text: `CLOUD ENGINE PLATFORM TERMS OF SERVICE

Welcome to Cloud Engine. By creating an account or accessing our services, you agree to be bound by the following terms.

1. MODIFICATION OF TERMS
The Company reserves the sole discretion to modify, update, or alter these terms at any time with immediate effect upon posting. Continued use constitutes binding acceptance of modified terms.

2. MANDATORY ARBITRATION AND CLASS ACTION WAIVER
All disputes shall be resolved through confidential binding arbitration on an individual basis, and user expressly waives any right to participate in class actions or jury trials.

3. DATA RETENTION AND DERIVATIVE TRAINING
Customer agrees that all uploaded files, documents, and telemetry may be retained indefinitely and utilized by Company to train proprietary artificial intelligence models without attribution or royalty.

4. AUTOMATIC RENEWAL AND CANCELLATION
Subscriptions automatically renew annually at the prevailing standard rate. Cancellations must be submitted in writing via certified postal mail at least sixty (60) days prior to the renewal date.

5. LIMITATION OF LIABILITY
In no event shall Company be liable for any lost profits, lost data, or indirect damages. Total cumulative liability shall not exceed ten United States dollars ($10.00).`,
  },
];
