export type Currency = '₹' | '$' | '€' | '£';

export type ClassificationType = 
  | 'IN_SCOPE' 
  | 'NEEDS_CLARIFICATION' 
  | 'OUT_OF_SCOPE'
  | 'LIKELY_IN_SCOPE' 
  | 'POTENTIAL_SCOPE_CHANGE' 
  | 'NEEDS_HUMAN_REVIEW';

export interface ScopeDeliverable {
  id: string;
  text: string;
  category?: 'core' | 'design' | 'feature' | 'revision' | 'milestone';
}

export interface ProjectScope {
  id: string;
  name: string;
  clientName: string;
  description?: string;
  originalBrief?: string;
  currency: Currency;
  budget: number;
  hourlyRate: number;
  deadline: string;
  status?: 'Active' | 'Completed' | 'Pending Review' | 'On Hold';
  includedDeliverables: string[];
  excludedDeliverables: string[];
  requirements?: string[];
  conditions?: string[];
  revisionLimit: number;
  revisionsUsed: number;
  paymentMilestones: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface ScopeChangeItem {
  id: string;
  requestedItem: string;
  classification: ClassificationType;
  severity: 'low' | 'medium' | 'high';
  matchedOriginalItem?: string;
  matchedExcludedItem?: string;
  contractEvidence: string;
  reason: string;
  suggestedHours: number;
  userAdjustedHours: number;
  userApproved: boolean;
  notes?: string;
}

export interface ScopeAnalysis {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  clientMessage: string;
  timestamp: string;
  modelUsed: string;
  isDemoMode: boolean;
  overallClassification?: 'IN_SCOPE' | 'NEEDS_CLARIFICATION' | 'OUT_OF_SCOPE';
  aiExplanation?: string;
  evidenceOriginalScope?: string[];
  missingInformation?: string[];
  suggestedAction?: string;
  changes: ScopeChangeItem[];
  totalSuggestedHours: number;
  totalAdjustedHours: number;
  totalCost: number;
  currency: Currency;
  suggestedTimelineExtensionDays: number;
  status: 'pending_review' | 'proposal_generated' | 'sent_to_client' | 'approved' | 'declined';
  tone: 'professional' | 'friendly' | 'formal';
  generatedResponseText: string;
}

export interface ChangeProposal {
  id: string;
  projectId: string;
  projectName: string;
  clientName?: string;
  title: string;
  originalReference: string;
  additionalWork: string;
  reasonForChange: string;
  estimatedHours: number;
  hourlyRate: number;
  additionalCost: number;
  currency: Currency;
  revisedDeadline?: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Declined';
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  type: 'ANALYSIS_CREATED' | 'SCOPE_UPDATED' | 'PROPOSAL_CREATED' | 'PROJECT_CREATED';
  title: string;
  description: string;
  timestamp: string;
  projectId?: string;
  projectName?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'violet' | 'blue';
}

export interface OllamaConfig {
  hostUrl: string;
  model: string;
  isConnected: boolean;
  lastChecked?: string;
  latencyMs?: number;
  installedModels: string[];
  errorMessage?: string;
}
