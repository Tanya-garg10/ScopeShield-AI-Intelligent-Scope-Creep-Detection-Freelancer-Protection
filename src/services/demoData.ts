import { ProjectScope, ScopeAnalysis } from '../types';

export const HACKTOBERFEST_DEMO_PROJECT: ProjectScope = {
  id: 'demo-ecommerce-redesign',
  name: 'E-commerce Website Redesign',
  clientName: 'Modern Goods Ltd.',
  currency: '₹',
  budget: 30000,
  hourlyRate: 1000,
  deadline: '2026-11-20',
  includedDeliverables: [
    'Up to five (5) custom responsive website pages (Home, Shop, Product Detail, About Us, Contact)',
    'Responsive design optimized for desktop, tablet, and mobile browsers',
    'Product listing catalog with category filtering and search preview',
    'Contact form with email dispatch and inquiry validation',
    'Two (2) formal rounds of revisions included during design & staging'
  ],
  excludedDeliverables: [
    'Payment gateway integration (e.g., Razorpay, Stripe, PayU, bank transfers)',
    'Additional pages beyond the agreed initial 5 pages',
    'Ongoing server maintenance, hosting management, and DNS configuration',
    'Product photography, custom copywriting, and digital marketing setup'
  ],
  revisionLimit: 2,
  revisionsUsed: 2,
  paymentMilestones: [
    '50% upfront project deposit (₹15,000) [Paid]',
    '50% upon final delivery, QA verification, and site signoff (₹15,000)'
  ],
  notes: 'Client agreed to fixed-scope contract terms on 2026-10-01. Any integration or additional pages require a written Change Order.',
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-18T09:00:00.000Z',
  isDemo: true
};

export const DEMO_CLIENT_MESSAGE = `The website looks good. Could you also add Razorpay checkout, three additional pages, and another round of revisions before Friday? We assumed these were included.`;

export const ALTERNATIVE_DEMO_PROJECTS: ProjectScope[] = [
  {
    id: 'demo-mobile-api',
    name: 'Fitness Tracker REST API Backend',
    clientName: 'FitPulse Labs',
    currency: '$',
    budget: 4500,
    hourlyRate: 75,
    deadline: '2026-12-05',
    includedDeliverables: [
      'Core user authentication (JWT token, password hashing, email verification)',
      'Workout session logging endpoints (CRUD for cardio and weight sets)',
      'Basic weekly analytics summary endpoint (total volume & minutes)',
      'API documentation via OpenAPI Swagger specification',
      'One round of integration support for frontend team'
    ],
    excludedDeliverables: [
      'Social feed and friend leaderboard system',
      'Third-party wearable sync (Apple HealthKit / Google Health Connect)',
      'Push notification dispatch infrastructure (Firebase Cloud Messaging)',
      'Production Kubernetes or high-availability multi-region cluster setup'
    ],
    revisionLimit: 2,
    revisionsUsed: 1,
    paymentMilestones: [
      '30% kickoff milestone ($1,350) [Paid]',
      '40% staging deployment milestone ($1,800)',
      '30% final code handoff & documentation ($1,350)'
    ],
    notes: 'Hourly rate of $75/hr applies to any out-of-scope backend additions.',
    createdAt: '2026-10-05T14:30:00.000Z',
    updatedAt: '2026-10-18T10:00:00.000Z',
    isDemo: true
  },
  {
    id: 'demo-brand-identity',
    name: 'SaaS Brand Identity & Visual Guidelines',
    clientName: 'CloudMatrix Inc.',
    currency: '$',
    budget: 2800,
    hourlyRate: 65,
    deadline: '2026-11-10',
    includedDeliverables: [
      'Primary logo design with horizontal and vertical lockups (SVG, PNG)',
      'Color palette specifications with HEX, RGB, and CMYK color codes',
      'Typography hierarchy guide with recommended web & body fonts',
      'Social media profile avatars and banner templates (3 sizes)',
      'Two revision rounds for logo concepts'
    ],
    excludedDeliverables: [
      '3D animated logo motion bumper',
      'Printed collateral templates (brochures, business cards, stationery)',
      'UI component design system or web app UI screens',
      'Trademark registration legal filing'
    ],
    revisionLimit: 2,
    revisionsUsed: 2,
    paymentMilestones: [
      '50% deposit before concept generation ($1,400) [Paid]',
      '50% upon final vector deliverable transfer ($1,400)'
    ],
    notes: 'Brand guideline deck limited to 15 pages.',
    createdAt: '2026-10-10T11:00:00.000Z',
    updatedAt: '2026-10-18T10:15:00.000Z',
    isDemo: true
  }
];

export const INITIAL_DEMO_ANALYSIS: ScopeAnalysis = {
  id: 'analysis-demo-ecommerce-01',
  projectId: HACKTOBERFEST_DEMO_PROJECT.id,
  projectName: HACKTOBERFEST_DEMO_PROJECT.name,
  clientName: HACKTOBERFEST_DEMO_PROJECT.clientName,
  clientMessage: DEMO_CLIENT_MESSAGE,
  timestamp: new Date().toISOString(),
  modelUsed: 'ScopeShield Deterministic AI Engine (Demo Mode)',
  isDemoMode: true,
  overallClassification: 'OUT_OF_SCOPE',
  aiExplanation: 'The client request includes payment gateway integration and 3 extra pages which exceed the contractual 5-page limit and explicitly excluded items. Additionally, all 2 agreed revision rounds have already been utilized.',
  evidenceOriginalScope: [
    'Section "Excluded Work": Payment gateway integration (e.g., Razorpay, Stripe, PayU, bank transfers)',
    'Section "Included Deliverables": Up to five (5) custom responsive website pages',
    'Section "Revision Limit": Two (2) formal rounds of revisions included (Current: 2/2 used)'
  ],
  missingInformation: [
    'Client requested "before Friday" without clarifying whether to postpone standard staging QA.'
  ],
  suggestedAction: 'Issue formal Change Request CR-2026-081 for ₹31,000 (31 hrs) and +5 business days before commencing any out-of-scope tasks.',
  status: 'proposal_generated',
  tone: 'professional',
  suggestedTimelineExtensionDays: 5,
  changes: [
    {
      id: 'change-1',
      requestedItem: 'Razorpay checkout payment gateway integration',
      classification: 'OUT_OF_SCOPE',
      severity: 'high',
      matchedExcludedItem: 'Payment gateway integration (e.g., Razorpay, Stripe, PayU, bank transfers)',
      contractEvidence: 'Section "Excluded Work": Payment gateway integration is explicitly listed as outside the original ₹30,000 project agreement.',
      reason: 'The client requests full checkout integration with Razorpay. This requires payment credentials configuration, webhook handling, security compliance, error state handling, and testing which was expressly excluded.',
      suggestedHours: 12,
      userAdjustedHours: 12,
      userApproved: true
    },
    {
      id: 'change-2',
      requestedItem: 'Three (3) additional website pages',
      classification: 'OUT_OF_SCOPE',
      severity: 'high',
      matchedOriginalItem: 'Up to five (5) custom responsive website pages (Home, Shop, Product Detail, About Us, Contact)',
      matchedExcludedItem: 'Additional pages beyond the agreed initial 5 pages',
      contractEvidence: 'Section "Included Deliverables": Agreement covers up to 5 pages. Section "Excluded Work": Additional pages beyond 5 are excluded.',
      reason: 'Client requests 3 more pages (increasing scope from 5 to 8 total pages, a 60% increase in layout, design, and responsive testing).',
      suggestedHours: 15,
      userAdjustedHours: 15,
      userApproved: true
    },
    {
      id: 'change-3',
      requestedItem: 'Additional round of revisions before Friday',
      classification: 'OUT_OF_SCOPE',
      severity: 'medium',
      matchedOriginalItem: 'Two (2) formal rounds of revisions included during design & staging',
      contractEvidence: 'Section "Revision Policy": Original contract specifies a limit of 2 rounds. Both rounds have already been utilized.',
      reason: 'The client asks for another round of revisions under the assumption it was included. The contract cap of 2 rounds has been exhausted, and requesting expedited turnaround ("before Friday") incurs rescheduling.',
      suggestedHours: 4,
      userAdjustedHours: 4,
      userApproved: true
    }
  ],
  totalSuggestedHours: 31,
  totalAdjustedHours: 31,
  totalCost: 31000,
  currency: '₹',
  generatedResponseText: `Hi Modern Goods Ltd. Team,

Thank you for your feedback! I'm thrilled to hear that you're liking the look of the new e-commerce website.

Regarding your request to add Razorpay checkout, 3 additional pages, and an extra revision round:

I'm very happy to build these features for you! Looking back at our signed project scope:
1. **Payment Gateway (Razorpay)**: Was specifically listed under "Excluded Work" in our initial agreement.
2. **Three Additional Pages**: Our agreement includes up to 5 custom responsive pages, which have now been designed and coded.
3. **Extra Revision Round**: Our agreed 2 rounds of revisions have been completed.

To deliver these items with the high quality you expect, here is a transparent breakdown of the additional work required:

- **Razorpay Integration & Webhook Handling**: 12 hrs × ₹1,000/hr = ₹12,000
- **3 Additional Custom Responsive Pages**: 15 hrs × ₹1,000/hr = ₹15,000
- **3rd Round of Revisions & Staging QA**: 4 hrs × ₹1,000/hr = ₹4,000

---
**Total Additional Scope Estimate**: 31 hours (₹31,000)
**Updated Delivery Date**: Due to the added development and QA cycles, delivery would move from this Friday to next Wednesday (estimated +5 business days).

Please let me know if you would like to proceed with this Change Request. Once confirmed, I'll send over the updated addendum and immediately start on the Razorpay setup and extra pages!

Best regards,
Your Freelance Partner`
};
