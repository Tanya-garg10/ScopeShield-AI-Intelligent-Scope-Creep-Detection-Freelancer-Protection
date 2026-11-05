import { ProjectScope, ScopeAnalysis, ScopeChangeItem } from '../types';

export const GEMINI_API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

interface ApiError {
  detail?: string;
}

interface GeminiStatus {
  configured: boolean;
  provider: string;
  model: string;
}

interface GeminiBriefResponse {
  name: string;
  client_name: string;
  currency: ProjectScope['currency'];
  budget: number;
  hourly_rate: number;
  deadline: string;
  included_deliverables: string[];
  excluded_deliverables: string[];
  revision_limit: number;
  requirements: string[];
  conditions: string[];
  unclear_items: string[];
  missing_terms: string[];
}

interface GeminiAnalysisResponse {
  model_used: string;
  overall_classification: NonNullable<ScopeAnalysis['overallClassification']>;
  ai_explanation: string;
  evidence_original_scope: string[];
  missing_information: string[];
  suggested_action: string;
  changes: Array<{
    id: string;
    requested_item: string;
    classification: ScopeChangeItem['classification'];
    severity: ScopeChangeItem['severity'];
    matched_original_item?: string | null;
    matched_excluded_item?: string | null;
    contract_evidence: string;
    reason: string;
    suggested_hours: number;
    user_adjusted_hours: number;
    user_approved: boolean;
  }>;
  total_suggested_hours: number;
  total_adjusted_hours: number;
  total_cost: number;
  currency: ProjectScope['currency'];
  suggested_timeline_extension_days: number;
  generated_response_text: string;
}

function projectPayload(project: ProjectScope) {
  return {
    id: project.id,
    name: project.name,
    client_name: project.clientName,
    description: project.description || '',
    original_brief: project.originalBrief || '',
    notes: project.notes || '',
    currency: project.currency,
    budget: project.budget,
    hourly_rate: project.hourlyRate,
    deadline: project.deadline,
    included_deliverables: project.includedDeliverables,
    excluded_deliverables: project.excludedDeliverables,
    requirements: project.requirements || [],
    conditions: project.conditions || [],
    revision_limit: project.revisionLimit,
    revisions_used: project.revisionsUsed,
  };
}

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${GEMINI_API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not reach the ScopeShield AI backend at ${GEMINI_API_BASE_URL}: ${message}`);
  }

  const data: T & ApiError = await response.json().catch(() => ({} as T & ApiError));
  if (!response.ok) {
    throw new Error(data.detail || `ScopeShield backend returned HTTP ${response.status}.`);
  }
  return data;
}

export async function checkGeminiStatus(): Promise<GeminiStatus> {
  let response: Response;
  try {
    response = await fetch(`${GEMINI_API_BASE_URL}/api/ai/status`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not reach the ScopeShield AI backend: ${message}`);
  }
  if (!response.ok) throw new Error(`ScopeShield backend returned HTTP ${response.status}.`);
  return response.json();
}

export async function extractBriefWithGemini(rawBrief: string) {
  const result = await postJson<GeminiBriefResponse>('/api/ai/extract-scope', { raw_brief: rawBrief });
  return {
    name: result.name,
    clientName: result.client_name,
    currency: result.currency,
    budget: result.budget,
    hourlyRate: result.hourly_rate,
    deadline: result.deadline,
    includedDeliverables: result.included_deliverables,
    excludedDeliverables: result.excluded_deliverables,
    revisionLimit: result.revision_limit,
    revisionsUsed: 0,
    paymentMilestones: result.budget > 0
      ? [
          `50% upfront deposit (${result.currency}${(result.budget * 0.5).toLocaleString()})`,
          `50% upon final delivery (${result.currency}${(result.budget * 0.5).toLocaleString()})`,
        ]
      : [],
    missingTerms: result.missing_terms,
    requirements: result.requirements,
    conditions: [...result.conditions, ...result.unclear_items.map(item => `Needs clarification: ${item}`)],
  };
}

export async function analyzeProjectWithGemini(
  project: ProjectScope,
  clientMessage: string,
  tone: ScopeAnalysis['tone'],
): Promise<ScopeAnalysis> {
  const result = await postJson<GeminiAnalysisResponse>('/api/ai/analyze', {
    project: projectPayload(project),
    client_message: clientMessage,
    tone,
  });
  const changes: ScopeChangeItem[] = result.changes.map(change => ({
    id: change.id,
    requestedItem: change.requested_item,
    classification: change.classification,
    severity: change.severity,
    ...(change.matched_original_item ? { matchedOriginalItem: change.matched_original_item } : {}),
    ...(change.matched_excluded_item ? { matchedExcludedItem: change.matched_excluded_item } : {}),
    contractEvidence: change.contract_evidence,
    reason: change.reason,
    suggestedHours: change.suggested_hours,
    userAdjustedHours: change.user_adjusted_hours,
    userApproved: change.user_approved,
  }));
  return {
    id: `analysis-${Date.now()}`,
    projectId: project.id,
    projectName: project.name,
    clientName: project.clientName || 'Client',
    clientMessage,
    timestamp: new Date().toISOString(),
    modelUsed: result.model_used,
    isDemoMode: false,
    overallClassification: result.overall_classification,
    aiExplanation: result.ai_explanation,
    evidenceOriginalScope: result.evidence_original_scope,
    missingInformation: result.missing_information,
    suggestedAction: result.suggested_action,
    changes,
    totalSuggestedHours: result.total_suggested_hours,
    totalAdjustedHours: result.total_adjusted_hours,
    totalCost: result.total_cost,
    currency: result.currency,
    suggestedTimelineExtensionDays: result.suggested_timeline_extension_days,
    status: result.overall_classification === 'OUT_OF_SCOPE' ? 'proposal_generated' : 'pending_review',
    tone,
    generatedResponseText: result.generated_response_text,
  };
}

export async function generateReplyWithGemini(
  project: ProjectScope,
  analysis: ScopeAnalysis,
  tone: ScopeAnalysis['tone'],
): Promise<string> {
  const result = await postJson<{ generated_response_text: string }>('/api/ai/reply', {
    project: projectPayload(project),
    tone,
    analysis: {
      overall_classification: analysis.overallClassification || 'NEEDS_CLARIFICATION',
      client_message: analysis.clientMessage,
      ai_explanation: analysis.aiExplanation || '',
      missing_information: analysis.missingInformation || [],
      changes: analysis.changes.map(change => ({
        id: change.id,
        requested_item: change.requestedItem,
        classification: change.classification,
        severity: change.severity,
        matched_original_item: change.matchedOriginalItem || null,
        matched_excluded_item: change.matchedExcludedItem || null,
        contract_evidence: change.contractEvidence,
        reason: change.reason,
        suggested_hours: change.suggestedHours,
        user_adjusted_hours: change.userAdjustedHours,
        user_approved: change.userApproved,
      })),
      total_adjusted_hours: analysis.totalAdjustedHours,
      total_cost: analysis.totalCost,
      suggested_timeline_extension_days: analysis.suggestedTimelineExtensionDays,
    },
  });
  return result.generated_response_text;
}
