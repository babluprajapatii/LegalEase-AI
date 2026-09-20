// Mock domain data for LegalEase-AI. Realistic, contextual content (no lorem ipsum).

export type DocStatus = 'analyzed' | 'processing' | 'uploaded';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface DocumentRecord {
  id: string;
  name: string;
  type: string;
  status: DocStatus;
  uploaded: string; // ISO date
  pages: number;
  clauses: number;
}

export interface Clause {
  id: string;
  title: string;
  risk: RiskLevel;
  section: string;
  page: number;
  paraphrase: string;
  whyItMatters: string;
  clarify: string[];
  original: string;
}

export interface RiskArea {
  id: string;
  title: string;
  level: RiskLevel;
  category: string;
  summary: string;
  whyAttention: string;
  clarify: string[];
  section: string;
  page: number;
}

export const DOCUMENTS: DocumentRecord[] = [
  { id: 'lease-2024', name: 'Lease Agreement 2024', type: 'Residential Lease', status: 'analyzed', uploaded: '2024-06-12', pages: 14, clauses: 23 },
  { id: 'employment', name: 'Employment Contract', type: 'Employment', status: 'processing', uploaded: '2024-06-10', pages: 8, clauses: 15 },
  { id: 'vendor-terms', name: 'Vendor Terms — Draft', type: 'Service Agreement', status: 'uploaded', uploaded: '2024-06-08', pages: 5, clauses: 12 },
  { id: 'lease-v1', name: 'Lease Agreement 2023 (v1)', type: 'Residential Lease', status: 'analyzed', uploaded: '2023-06-14', pages: 13, clauses: 21 },
];

export const ACTIVITY = [
  { id: 'a1', text: 'Analysis completed: Lease Agreement 2024', when: '2 hours ago' },
  { id: 'a2', text: 'Comparison completed: Lease v2 vs Lease v1', when: '1 day ago' },
  { id: 'a3', text: 'Document uploaded: Employment Contract', when: '3 days ago' },
];

export const SUMMARY =
  'This is a 12-month residential lease between the landlord and tenant for the property at 48 Maple Court. Rent is $1,600 per month, due on the 1st. The lease renews automatically unless notice is given before June 1, 2025, and requires 30 days’ written notice to terminate.';

export const DETAILS = [
  { label: 'Type', value: 'Residential Lease' },
  { label: 'Parties', value: 'Landlord, Tenant' },
  { label: 'Effective', value: 'July 1, 2024' },
  { label: 'Pages', value: '14' },
];

export const CLAUSES: Clause[] = [
  {
    id: 'termination',
    title: 'Termination Clause',
    risk: 'medium',
    section: 'Section 9.1',
    page: 8,
    paraphrase: 'Either party may terminate this agreement with 30 days’ written notice to the other party.',
    whyItMatters: 'You may lose your lease if you don’t provide notice in time. This could affect your housing costs and moving plans.',
    clarify: ['What counts as “written notice”?', 'Is there a penalty for late notice?'],
    original: 'Either party may terminate this Agreement upon thirty (30) days’ prior written notice delivered to the other party at the address specified herein.',
  },
  {
    id: 'auto-renewal',
    title: 'Auto-Renewal Clause',
    risk: 'high',
    section: 'Section 12.3',
    page: 11,
    paraphrase: 'The lease automatically renews for another term unless you give notice before the renewal deadline.',
    whyItMatters: 'Automatic renewal can lock you into an extended commitment without your explicit consent.',
    clarify: ['How long is the renewal term?', 'Can you opt out after renewal?'],
    original: 'This Lease shall automatically renew for successive twelve (12) month terms unless either party provides written notice of non-renewal no later than thirty (30) days prior to the expiration of the then-current term.',
  },
  {
    id: 'deposit',
    title: 'Security Deposit',
    risk: 'low',
    section: 'Section 5.2',
    page: 5,
    paraphrase: 'A security deposit equal to one month’s rent is held and returned within 30 days of move-out, less any deductions.',
    whyItMatters: 'Understanding deposit terms helps you plan move-out and recover your funds.',
    clarify: ['What deductions are permitted?', 'When is the deposit returned?'],
    original: 'Tenant shall deposit with Landlord the sum of one (1) month’s rent as a security deposit, to be returned within thirty (30) days following the termination of tenancy, less lawful deductions.',
  },
  {
    id: 'indemnification',
    title: 'Indemnification',
    risk: 'medium',
    section: 'Section 14.1',
    page: 13,
    paraphrase: 'You agree to cover certain costs or losses the landlord may face related to your use of the property.',
    whyItMatters: 'Broad indemnification may expose you to costs beyond what you expect.',
    clarify: ['What losses are covered?', 'Are there limits on the amount?'],
    original: 'Tenant agrees to indemnify, defend, and hold harmless Landlord from and against any and all claims, damages, and expenses arising out of Tenant’s use or occupancy of the Premises.',
  },
];

export const OBLIGATIONS = [
  { party: 'Landlord', text: 'Provide habitable premises', section: 'Section 4.1', page: 4 },
  { party: 'Tenant', text: 'Pay rent by the 1st of each month', section: 'Section 3.1', page: 3 },
  { party: 'Tenant', text: 'Maintain the property in good condition', section: 'Section 6.2', page: 6 },
];

export const DATES = [
  { label: 'Lease Start', value: 'July 1, 2024', section: 'Section 1.1', page: 1 },
  { label: 'Lease End', value: 'June 30, 2025', section: 'Section 1.1', page: 1 },
  { label: 'Renewal Deadline', value: 'June 1, 2025', section: 'Section 12.3', page: 11 },
];

export const RISK_AREAS: RiskArea[] = [
  {
    id: 'r-auto',
    title: 'Auto-Renewal Clause',
    level: 'high',
    category: 'Auto-Renewal',
    summary: 'This clause may automatically renew the lease if you don’t provide notice before June 1, 2025.',
    whyAttention: 'Automatic renewal can lock you into an extended commitment without your explicit consent. You may want to review the renewal terms carefully.',
    clarify: ['How long is the renewal term?', 'Can you opt out after renewal?', 'Are renewal terms different from the original lease?'],
    section: 'Section 12.3',
    page: 11,
  },
  {
    id: 'r-indemnity',
    title: 'Indemnification',
    level: 'medium',
    category: 'Indemnity',
    summary: 'The indemnification language is broad and may extend to costs beyond ordinary use of the property.',
    whyAttention: 'Broad indemnification may create obligations that are hard to predict. Consider discussing the scope with a qualified legal professional.',
    clarify: ['What specific losses are covered?', 'Is there a cap on liability?'],
    section: 'Section 14.1',
    page: 13,
  },
];

export const NEXT_STEPS = {
  actions: [
    'Review the auto-renewal clause before June 1, 2025',
    'Clarify maintenance responsibilities with the landlord',
    'Compare security deposit terms between lease versions',
  ],
  lawyerQuestions: [
    'What are the implications of the rent increase in the renewed term?',
    'Is the indemnification clause enforceable in my jurisdiction?',
    'Can I negotiate the auto-renewal terms?',
  ],
  documents: [
    'Previous lease agreement (if available)',
    'Records of communication with the landlord',
    'Income verification documents',
  ],
  clarify: [
    'Maintenance responsibility boundaries',
    'Notice delivery method',
  ],
};

export const SUGGESTED_QUESTIONS = [
  'What is the termination notice period?',
  'When does the lease expire?',
  'Can the landlord enter my unit?',
];

export interface QAAnswer {
  finding: string;
  sources: { section: string; page: number }[];
  confidence: 'highly confident' | 'moderately confident' | 'limited information';
  notFound?: boolean;
}

export const QA_RESPONSES: Record<string, QAAnswer> = {
  'What is the termination notice period?': {
    finding: 'According to the document, termination requires 30 days’ written notice. The notice must be delivered before the renewal deadline.',
    sources: [{ section: 'Section 9.1', page: 8 }, { section: 'Section 12.3', page: 11 }],
    confidence: 'moderately confident',
  },
  'When does the lease expire?': {
    finding: 'The lease term ends on June 30, 2025, unless it is renewed automatically under the auto-renewal clause.',
    sources: [{ section: 'Section 1.1', page: 1 }, { section: 'Section 12.3', page: 11 }],
    confidence: 'highly confident',
  },
  'Can the landlord enter my unit?': {
    finding: 'This information is not present in the uploaded document.',
    sources: [],
    confidence: 'limited information',
    notFound: true,
  },
};

export const COMPARISON = {
  docA: { name: 'Lease Agreement 2024', version: 'v2', status: 'analyzed' as DocStatus },
  docB: { name: 'Lease Agreement 2023', version: 'v1', status: 'analyzed' as DocStatus },
  differences: 8,
  added: [
    { title: 'Late Fee Provision', note: 'v2 only', section: 'Section 3.4', page: 3 },
    { title: 'Pet Policy', note: 'v2 only', section: 'Section 7.1', page: 7 },
  ],
  removed: [
    { title: 'Early Termination Option', note: 'v1 only', section: 'Section 9.5', page: 9 },
  ],
  modified: [
    { title: 'Rent Amount', before: '$1,500 / month', after: '$1,600 / month', section: 'Section 3.1', page: 3 },
    { title: 'Security Deposit', before: 'One month’s rent', after: 'Two months’ rent', section: 'Section 5.2', page: 5 },
  ],
  nextSteps: [
    'Review the rent increase in Section 3.1',
    'Compare pet policies if you have pets',
    'Ask a lawyer about the new late fee provision',
  ],
};

export const USER = {
  name: 'Alex Rivera',
  email: 'alex.rivera@email.com',
  initial: 'A',
  created: 'March 4, 2024',
};

export const DISCLAIMERS = {
  general: 'This tool uses AI for informational purposes. It does not provide legal advice and may contain errors.',
  analysis:
    'This is educational information generated by AI based on your uploaded document. It does not constitute legal advice and may contain errors. Verify important information with a qualified legal professional.',
  highRisk:
    'This document appears to contain provisions that may significantly affect your rights or obligations. Professional legal review is strongly recommended.',
};

export const RISK_META: Record<RiskLevel, { label: string; symbol: string; color: string; bg: string }> = {
  low: { label: 'Low attention', symbol: '○', color: 'var(--color-risk-low)', bg: 'var(--color-success-bg)' },
  medium: { label: 'Review', symbol: '△', color: 'var(--color-risk-medium)', bg: 'var(--color-warning-bg)' },
  high: { label: 'High attention', symbol: '▲', color: 'var(--color-risk-high)', bg: 'var(--color-error-bg)' },
};
