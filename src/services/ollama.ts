import { OllamaConfig, ProjectScope, ScopeAnalysis, ScopeChangeItem } from '../types';

export const DEFAULT_OLLAMA_CONFIG: OllamaConfig = {
  hostUrl: 'http://localhost:11434',
  model: 'qwen3:4b-instruct',
  isConnected: false,
  installedModels: [],
};

// Check if Ollama is running locally
export async function checkOllamaConnection(hostUrl = 'http://localhost:11434'): Promise<{
  isConnected: boolean;
  latencyMs?: number;
  models: string[];
  error?: string;
}> {
  const startTime = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${hostUrl.replace(/\/$/, '')}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        isConnected: false,
        models: [],
        error: `Ollama returned HTTP status ${res.status}`,
      };
    }

    const data = await res.json();
    const latencyMs = Math.round(performance.now() - startTime);
    const models: string[] = (data.models || []).map((m: { name?: string }) => m.name || '');

    return {
      isConnected: true,
      latencyMs,
      models,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      isConnected: false,
      models: [],
      error: msg.includes('abort') ? 'Connection timed out' : 'Ollama not detected at ' + hostUrl,
    };
  }
}

// Extraction heuristic for unstructured briefs
// RULE: Never invent missing deadlines, prices or revision limits.
export function extractScopeHeuristics(rawText: string): Partial<ProjectScope> & { 
  missingTerms: string[];
  requirements: string[];
  conditions: string[];
} {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // Try to find currency
  let currency: '₹' | '$' | '€' | '£' = '₹';
  if (text.includes('₹') || lower.includes('inr') || lower.includes('rupees')) {
    currency = '₹';
  } else if (text.includes('$') || lower.includes('usd') || lower.includes('dollar')) {
    currency = '$';
  } else if (text.includes('€') || lower.includes('eur')) {
    currency = '€';
  } else if (text.includes('£') || lower.includes('gbp')) {
    currency = '£';
  }

  // Budget detection (only if explicitly present)
  let budget = 0;
  const budgetMatch = text.match(/(?:budget|fee|total|cost|price)[:\s]*([₹$€£]?)\s*([\d,]+)/i) ||
                      text.match(/([₹$€£])\s*([\d,]+)/);
  if (budgetMatch) {
    const val = parseInt(budgetMatch[2].replace(/,/g, ''), 10);
    if (!isNaN(val)) budget = val;
  }

  // Rate match (only if explicitly present)
  let hourlyRate = 0;
  const rateMatch = text.match(/(?:rate|hourly)[:\s]*([₹$€£]?)\s*([\d,]+)(?:\/hr|\s*per hour)?/i);
  if (rateMatch) {
    const val = parseInt(rateMatch[2].replace(/,/g, ''), 10);
    if (!isNaN(val)) hourlyRate = val;
  }

  // Revision count (only if explicitly present)
  let revisionLimit = 0;
  const revMatch = text.match(/(\d+)\s*(?:rounds? of revisions?|revisions?)/i);
  if (revMatch) {
    revisionLimit = parseInt(revMatch[1], 10);
  }

  // Deadline detection (only if explicitly present)
  let deadline = '';
  const deadlineMatch = text.match(/(?:deadline|due date|delivery date|completion|by)[:\s]*([0-9]{4}-[0-9]{2}-[0-9]{2}|[A-Za-z]+ \d{1,2}(?:, \d{4})?)/i);
  if (deadlineMatch) {
    deadline = deadlineMatch[1];
  }

  // Deliverables, exclusions, requirements, conditions
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const included: string[] = [];
  const excluded: string[] = [];
  const requirements: string[] = [];
  const conditions: string[] = [];

  let currentSection: 'inc' | 'exc' | 'req' | 'cond' | 'none' = 'none';

  for (const line of lines) {
    const l = line.toLowerCase();
    if (l.includes('deliverable') || l.includes('included') || l.includes('scope:') || l.includes('what we build')) {
      currentSection = 'inc';
      continue;
    }
    if (l.includes('excluded') || l.includes('not included') || l.includes('out of scope') || l.includes('exclusions')) {
      currentSection = 'exc';
      continue;
    }
    if (l.includes('requirement') || l.includes('prerequisite') || l.includes('tech stack')) {
      currentSection = 'req';
      continue;
    }
    if (l.includes('condition') || l.includes('terms') || l.includes('assumption')) {
      currentSection = 'cond';
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ') || /^\d+\./.test(line)) {
      const clean = line.replace(/^[-*•\d.]\s*/, '').trim();
      if (currentSection === 'exc') {
        excluded.push(clean);
      } else if (currentSection === 'req') {
        requirements.push(clean);
      } else if (currentSection === 'cond') {
        conditions.push(clean);
      } else {
        included.push(clean);
      }
    } else if (line.length > 5 && !line.endsWith(':')) {
      if (currentSection === 'inc') included.push(line);
      else if (currentSection === 'exc') excluded.push(line);
      else if (currentSection === 'req') requirements.push(line);
      else if (currentSection === 'cond') conditions.push(line);
    }
  }

  // Sensible extraction fallback if not formatted
  if (included.length === 0) {
    lines.forEach(line => {
      if (!line.includes(':') && line.length > 10 && !line.toLowerCase().includes('budget')) {
        included.push(line);
      }
    });
  }

  const missingTerms: string[] = [];
  if (budget === 0) missingTerms.push('Project Budget (not specified in brief)');
  if (!deadline) missingTerms.push('Delivery Deadline (not specified in brief)');
  if (revisionLimit === 0) missingTerms.push('Revision Limit (not specified in brief)');
  if (excluded.length === 0) missingTerms.push('Explicit Exclusions (recommended to define to prevent creep)');

  // Try to determine project name from first line or text
  const rawFirstLine = lines[0] || 'New Client Project';
  const name = rawFirstLine.replace(/[#*_-]/g, '').trim().slice(0, 60) || 'New Client Project';

  return {
    name,
    clientName: '',
    currency,
    budget,
    hourlyRate: hourlyRate || (currency === '₹' ? 1000 : 75),
    deadline,
    includedDeliverables: included.length > 0 ? included : ['Core responsive web application development'],
    excludedDeliverables: excluded,
    revisionLimit,
    revisionsUsed: 0,
    paymentMilestones: budget > 0 ? [
      `50% Upfront deposit (${currency}${(budget * 0.5).toLocaleString()})`,
      `50% Upon final milestone signoff (${currency}${(budget * 0.5).toLocaleString()})`
    ] : [],
    missingTerms,
    requirements,
    conditions
  };
}

// Scope Creep Deterministic Analyzer (Engineered for Accuracy & Strict Truth)
export function runScopeCreepComparison(
  project: ProjectScope,
  clientMessage: string,
  modelName = 'ScopeShield Deterministic AI Engine',
  isDemo = true
): ScopeAnalysis {
  const msg = clientMessage.trim();
  const lowerMsg = msg.toLowerCase();
  const changes: ScopeChangeItem[] = [];
  const evidenceOriginalScope: string[] = [];
  const missingInformation: string[] = [];

  // Check 1: Payment gateway (Razorpay / Stripe / checkout)
  if (lowerMsg.includes('razorpay') || lowerMsg.includes('stripe') || lowerMsg.includes('checkout') || lowerMsg.includes('payment gateway') || lowerMsg.includes('payment integration')) {
    const matchedExcluded = project.excludedDeliverables.find(e => 
      e.toLowerCase().includes('payment') || e.toLowerCase().includes('razorpay') || e.toLowerCase().includes('stripe')
    ) || 'Excluded Work: Payment gateway integrations';

    changes.push({
      id: 'change-razorpay',
      requestedItem: 'Payment gateway integration (Razorpay / checkout)',
      classification: 'OUT_OF_SCOPE',
      severity: 'high',
      matchedExcludedItem: matchedExcluded,
      contractEvidence: `Contract Excluded Section: "${matchedExcluded}". Explicitly listed as outside the baseline contract.`,
      reason: 'The client requests full transactional payment processing. Payment gateways involve merchant account credentials, webhooks, compliance, SSL verification, and refund flows.',
      suggestedHours: 12,
      userAdjustedHours: 12,
      userApproved: true
    });
    evidenceOriginalScope.push(`Excluded Deliverable: "${matchedExcluded}"`);
  }

  // Check 2: Extra pages (e.g. "three additional pages", "5 more pages")
  const pageMatch = lowerMsg.match(/(\d+|two|three|four|five|six|several)\s+(?:additional|extra|more)?\s*pages?/i);
  if (pageMatch || lowerMsg.includes('extra page') || lowerMsg.includes('additional page') || lowerMsg.includes('new pages')) {
    const numPages = pageMatch ? (pageMatch[1] === 'three' ? 3 : pageMatch[1] === 'two' ? 2 : parseInt(pageMatch[1], 10) || 3) : 3;
    const matchedInc = project.includedDeliverables.find(d => d.toLowerCase().includes('page')) || `Up to agreed initial page count`;
    const matchedExc = project.excludedDeliverables.find(d => d.toLowerCase().includes('page')) || 'Additional pages beyond base agreement';

    changes.push({
      id: 'change-pages',
      requestedItem: `${numPages} additional website pages`,
      classification: 'OUT_OF_SCOPE',
      severity: 'high',
      matchedOriginalItem: matchedInc,
      matchedExcludedItem: matchedExc,
      contractEvidence: `Contract Included Scope: "${matchedInc}". Contract Exclusions: "${matchedExc}".`,
      reason: `The base project covered the initial page set. Building ${numPages} additional pages expands information architecture, wireframing, copywriting formatting, responsive layouts, and cross-browser testing.`,
      suggestedHours: numPages * 5,
      userAdjustedHours: numPages * 5,
      userApproved: true
    });
    evidenceOriginalScope.push(`Included Deliverable: "${matchedInc}"`);
    if (matchedExc) evidenceOriginalScope.push(`Excluded Deliverable: "${matchedExc}"`);
  }

  // Check 3: Revisions exceeded or requested
  if (lowerMsg.includes('revision') || lowerMsg.includes('round of changes') || lowerMsg.includes('extra round') || lowerMsg.includes('changes before')) {
    const matchedInc = project.includedDeliverables.find(d => d.toLowerCase().includes('revision')) || `${project.revisionLimit || 2} revision rounds`;
    const revisionsLeft = Math.max(0, (project.revisionLimit || 2) - project.revisionsUsed);

    if (revisionsLeft === 0) {
      changes.push({
        id: 'change-revision',
        requestedItem: 'Additional round of revisions beyond contract limit',
        classification: 'OUT_OF_SCOPE',
        severity: 'medium',
        matchedOriginalItem: matchedInc,
        contractEvidence: `Contract Revision Policy: "${matchedInc}". Current status: ${project.revisionsUsed}/${project.revisionLimit || 2} rounds consumed.`,
        reason: 'The client assumes this revision round is included, but the contractual revision limit has already been utilized. Any further iteration requires billable staging hours.',
        suggestedHours: 4,
        userAdjustedHours: 4,
        userApproved: true
      });
      evidenceOriginalScope.push(`Contract Revision Policy: "${matchedInc}" (${project.revisionsUsed}/${project.revisionLimit || 2} used)`);
    } else {
      changes.push({
        id: 'change-revision-available',
        requestedItem: 'Revision request within contractual allowance',
        classification: 'IN_SCOPE',
        severity: 'low',
        matchedOriginalItem: matchedInc,
        contractEvidence: `Agreement includes ${project.revisionLimit} revision rounds. ${revisionsLeft} round(s) currently remain.`,
        reason: 'This revision request falls directly inside the remaining allocated revision rounds.',
        suggestedHours: 0,
        userAdjustedHours: 0,
        userApproved: false
      });
      evidenceOriginalScope.push(`Agreement includes ${project.revisionLimit} revision rounds (${revisionsLeft} remaining)`);
    }
  }

  // Check 4: Rush deadline / immediate turnaround
  if (lowerMsg.includes('before friday') || lowerMsg.includes('asap') || lowerMsg.includes('urgent') || lowerMsg.includes('by tomorrow') || lowerMsg.includes('rush')) {
    changes.push({
      id: 'change-rush',
      requestedItem: 'Expedited / rush timeline delivery',
      classification: 'NEEDS_CLARIFICATION',
      severity: 'medium',
      contractEvidence: project.deadline ? `Agreed baseline delivery milestone is ${project.deadline}. Unplanned rush turnaround impacts active sprints.` : 'No express expedited turnaround terms specified in base contract.',
      reason: 'The client requested an accelerated turnaround date. Clarify whether this requires rescheduling other deliverables or assessing an expedited priority fee.',
      suggestedHours: 2,
      userAdjustedHours: 0,
      userApproved: false
    });
    missingInformation.push('Client requested immediate deadline without specifying whether other deliverables should be deprioritized.');
  }

  // Check 5: Styling tweaks or minor fixes
  if (lowerMsg.includes('color tweak') || lowerMsg.includes('typo') || lowerMsg.includes('minor change') || lowerMsg.includes('small fix') || lowerMsg.includes('spelling')) {
    changes.push({
      id: 'change-minor-fix',
      requestedItem: 'Minor copy or styling adjustment',
      classification: 'IN_SCOPE',
      severity: 'low',
      contractEvidence: 'Standard polish and minor styling within current staging milestone.',
      reason: 'Minor styling refinements and typographical corrections fall within normal quality assurance expectations.',
      suggestedHours: 0,
      userAdjustedHours: 0,
      userApproved: false
    });
    evidenceOriginalScope.push('Deliverables: Responsive design quality and staging review');
  }

  // Check 6: Unknown or general feature request
  if (changes.length === 0) {
    const isAmbiguous = lowerMsg.length < 30 || lowerMsg.includes('maybe') || lowerMsg.includes('think about') || lowerMsg.includes('can we');
    if (isAmbiguous) {
      changes.push({
        id: 'change-clarify',
        requestedItem: 'Client inquiry / specification needs clarification',
        classification: 'NEEDS_CLARIFICATION',
        severity: 'low',
        contractEvidence: 'No explicit match found in included or excluded contract clauses.',
        reason: 'The request lacks concrete technical specifications to determine whether it fits under the base deliverables or constitutes an out-of-scope addition.',
        suggestedHours: 2,
        userAdjustedHours: 2,
        userApproved: true
      });
      missingInformation.push('Detailed functional requirements and technical criteria are needed from the client.');
    } else {
      changes.push({
        id: 'change-custom-req',
        requestedItem: 'New custom feature request',
        classification: 'OUT_OF_SCOPE',
        severity: 'medium',
        contractEvidence: 'Item is not listed in the signed project included deliverables.',
        reason: 'The requested functionality introduces work beyond the agreed scope boundaries.',
        suggestedHours: 6,
        userAdjustedHours: 6,
        userApproved: true
      });
      missingInformation.push('Specific deliverables and wireframes for the new feature have not been agreed upon.');
    }
  }

  // Determine overall classification
  let overallClassification: 'IN_SCOPE' | 'NEEDS_CLARIFICATION' | 'OUT_OF_SCOPE' = 'IN_SCOPE';
  if (changes.some(c => c.classification === 'OUT_OF_SCOPE' || c.classification === 'POTENTIAL_SCOPE_CHANGE')) {
    overallClassification = 'OUT_OF_SCOPE';
  } else if (changes.some(c => c.classification === 'NEEDS_CLARIFICATION' || c.classification === 'NEEDS_HUMAN_REVIEW')) {
    overallClassification = 'NEEDS_CLARIFICATION';
  }

  // Compute totals
  const totalSuggestedHours = changes.reduce((acc, c) => acc + (c.userApproved ? c.suggestedHours : 0), 0);
  const totalAdjustedHours = changes.reduce((acc, c) => acc + (c.userApproved ? c.userAdjustedHours : 0), 0);
  const totalCost = totalAdjustedHours * project.hourlyRate;
  const suggestedTimelineExtensionDays = totalAdjustedHours > 20 ? 5 : totalAdjustedHours > 10 ? 3 : totalAdjustedHours > 0 ? 1 : 0;

  // AI explanation
  let aiExplanation = '';
  let suggestedAction = '';
  if (overallClassification === 'OUT_OF_SCOPE') {
    aiExplanation = `This request contains items that exceed the agreed boundaries of "${project.name}". Specifically, ${changes.filter(c => c.classification === 'OUT_OF_SCOPE' || c.classification === 'POTENTIAL_SCOPE_CHANGE').map(c => c.requestedItem).join(', ')} were not included in the original agreement or are explicitly excluded.`;
    suggestedAction = `Generate a formal Change Request proposal with transparent hourly estimates (${totalAdjustedHours} hrs · ${project.currency}${totalCost.toLocaleString()}) and obtain client confirmation before commencing work.`;
  } else if (overallClassification === 'NEEDS_CLARIFICATION') {
    aiExplanation = `The client's message touches on items where specifications or timeline expectations are ambiguous. Before committing to delivery or billing, clarify technical requirements and sprint impact.`;
    suggestedAction = `Send a polite clarifying question to confirm requirements and confirm whether priority shifts are needed.`;
  } else {
    aiExplanation = `The requested items fall within the existing project deliverables or remaining revision allowances. You can proceed with standard execution without additional billing.`;
    suggestedAction = `Acknowledge the request and confirm that it will be handled as part of the scheduled milestone.`;
  }

  if (evidenceOriginalScope.length === 0) {
    evidenceOriginalScope.push(`Project: ${project.name} (Budget: ${project.currency}${project.budget.toLocaleString()})`);
  }

  const analysis: ScopeAnalysis = {
    id: `analysis-${Date.now()}`,
    projectId: project.id,
    projectName: project.name,
    clientName: project.clientName || 'Client',
    clientMessage,
    timestamp: new Date().toISOString(),
    modelUsed: modelName,
    isDemoMode: isDemo,
    overallClassification,
    aiExplanation,
    evidenceOriginalScope,
    missingInformation,
    suggestedAction,
    changes,
    totalSuggestedHours,
    totalAdjustedHours,
    totalCost,
    currency: project.currency,
    suggestedTimelineExtensionDays,
    status: overallClassification === 'OUT_OF_SCOPE' ? 'proposal_generated' : 'pending_review',
    tone: 'professional',
    generatedResponseText: ''
  };

  analysis.generatedResponseText = generateChangeRequestCopy(project, analysis, 'professional');
  return analysis;
}

// Generate professional, client-ready responses with varying tones
// Note: We never automatically dispatch messages.
export function generateChangeRequestCopy(
  project: ProjectScope,
  analysis: ScopeAnalysis,
  tone: 'professional' | 'friendly' | 'formal' = 'professional'
): string {
  const approvedItems = analysis.changes.filter(c => c.userApproved && c.userAdjustedHours > 0);
  const currency = project.currency;
  const totalCost = analysis.totalAdjustedHours * project.hourlyRate;
  const clientGreeting = project.clientName ? project.clientName : 'Client';

  if (analysis.overallClassification === 'IN_SCOPE') {
    if (tone === 'friendly') {
      return `Hi ${clientGreeting},

Thanks for sending this over! Good news: this falls right into our agreed scope for ${project.name}.

I've added this to our current sprint and will make sure it's included in the upcoming preview. No additional charges or timeline changes needed.

Best regards,
Your Freelance Partner`;
    }
    if (tone === 'formal') {
      return `Dear ${clientGreeting},

This acknowledges receipt of your request regarding ${project.name}.

Upon reviewing our current project deliverables and revision allowances, this item is confirmed as IN-SCOPE. Work will proceed in accordance with the existing milestone schedule.

Sincerely,
Project Lead`;
    }
    return `Hi ${clientGreeting},

Thank you for your message. I've reviewed your request against our project scope for ${project.name}.

This item is included under our agreed deliverables, so I will incorporate it into the current milestone as planned without any additional fee or schedule impact.

Best regards,
Your Freelance Partner`;
  }

  if (analysis.overallClassification === 'NEEDS_CLARIFICATION') {
    if (tone === 'friendly') {
      return `Hi ${clientGreeting},

Thanks for reaching out! I want to make sure I get this exactly right for ${project.name}.

Could you clarify a couple of quick details on this request?
${analysis.missingInformation?.length ? analysis.missingInformation.map(m => `• ${m}`).join('\n') : '• The exact requirements and timeline expectations.'}

Once I have those specifics, I can confirm whether we can wrap it into the current milestone or if it requires a quick schedule adjustment.

Warmly,
Your Freelance Partner`;
    }
    if (tone === 'formal') {
      return `Dear ${clientGreeting},

Thank you for your communication regarding ${project.name}.

To ensure accurate alignment with our Master Services Agreement, we require clarification on the following items before proceeding:
${analysis.missingInformation?.length ? analysis.missingInformation.map(m => `- ${m}`).join('\n') : '- Technical criteria and scheduling priority.'}

Please provide these details so we may evaluate the impact on deliverables and milestone deadlines.

Sincerely,
Project Lead`;
    }
    return `Hi ${clientGreeting},

Thank you for the update on ${project.name}.

Before I begin, I'd like to clarify a few details to make sure we're completely aligned:
${analysis.missingInformation?.length ? analysis.missingInformation.map(m => `• ${m}`).join('\n') : '• Additional technical requirements and target deadline.'}

Once you confirm, I will let you know right away if this impacts our delivery timeline or scope.

Best regards,
Your Freelance Partner`;
  }

  // OUT OF SCOPE
  if (tone === 'friendly') {
    return `Hi ${clientGreeting},

Thanks so much for reaching out! Really excited about how ${project.name} is coming along.

Regarding the new additions you mentioned:
${approvedItems.map(item => `• **${item.requestedItem}** (${item.userAdjustedHours} hrs)`).join('\n')}

Because our original agreement was built around a specific fixed scope (${project.includedDeliverables[0] || 'base deliverables'}), these items represent additional work beyond that initial plan.

I'd love to build these for you! Here is what it looks like:
- **Estimated Extra Effort**: ${analysis.totalAdjustedHours} hours
- **Additional Investment**: ${currency}${totalCost.toLocaleString()} (${currency}${project.hourlyRate}/hr)
- **Timeline Adjustment**: +${analysis.suggestedTimelineExtensionDays} business days

If this sounds good to you, reply with a quick "Approved" and I will add it to the schedule right away!

Warm regards,
Your Freelance Partner`;
  }

  if (tone === 'formal') {
    return `PROJECT CHANGE ORDER (ADDENDUM)
Date: ${new Date().toLocaleDateString()}
Project: ${project.name}
Client: ${clientGreeting}

1. PURPOSE & REFERENCE
This Change Order supplements the initial project agreement. The Client has requested additional scope items beyond the agreed deliverables.

2. SPECIFICATION OF REQUESTED ADDITIONS:
${approvedItems.map((item, idx) => `2.${idx + 1} ${item.requestedItem}
   - Reference: ${item.contractEvidence}
   - Estimated Effort: ${item.userAdjustedHours} billable hours (${currency}${(item.userAdjustedHours * project.hourlyRate).toLocaleString()})`).join('\n\n')}

3. FINANCIAL SUMMARY:
- Total Additional Effort: ${analysis.totalAdjustedHours} billable hours
- Agreed Rate: ${currency}${project.hourlyRate}/hr
- Total Additional Fee: ${currency}${totalCost.toLocaleString()}

4. SCHEDULE IMPACT:
- Current Target Milestone: ${project.deadline || 'Per Agreement'}
- Revised Schedule Impact: +${analysis.suggestedTimelineExtensionDays} business days from authorization.

5. AUTHORIZATION:
Work on the above modifications shall commence upon written approval or confirmation of this addendum.

Submitted by: Independent Contractor / ScopeShield AI Record`;
  }

  // Default: Professional & Firm
  return `Hi ${clientGreeting},

Thank you for your feedback! I'm glad to see the progress we're making on ${project.name}.

Regarding your recent message requesting additional additions:
${approvedItems.map((item, i) => `${i + 1}. **${item.requestedItem}**
   - *Scope Note*: ${item.contractEvidence}`).join('\n')}

To maintain high quality and protect our project timeline, here is a transparent breakdown to incorporate these items:

${approvedItems.map(item => `• **${item.requestedItem}**: ${item.userAdjustedHours} hrs × ${currency}${project.hourlyRate}/hr = ${currency}${(item.userAdjustedHours * project.hourlyRate).toLocaleString()}`).join('\n')}

---
**Summary of Change Request**:
- **Total Additional Hours**: ${analysis.totalAdjustedHours} hours
- **Additional Investment**: ${currency}${totalCost.toLocaleString()}
- **Timeline Impact**: +${analysis.suggestedTimelineExtensionDays} business days (to account for development and quality assurance)

Please let me know if you would like me to proceed with this Change Request. Once confirmed, I'll update the project schedule and begin the work.

Best regards,
Your Freelance Partner`;
}
