import { ProjectScope, ScopeAnalysis, ChangeProposal, ActivityLog } from '../types';
import { 
  HACKTOBERFEST_DEMO_PROJECT, 
  ALTERNATIVE_DEMO_PROJECTS, 
  INITIAL_DEMO_ANALYSIS 
} from './demoData';

const PROJECTS_KEY = 'scopeshield_projects_v1';
const ANALYSES_KEY = 'scopeshield_analyses_v1';
const PROPOSALS_KEY = 'scopeshield_proposals_v1';
const ACTIVITIES_KEY = 'scopeshield_activities_v1';

export const INITIAL_DEMO_PROPOSAL: ChangeProposal = {
  id: 'CR-2026-081',
  projectId: HACKTOBERFEST_DEMO_PROJECT.id,
  projectName: HACKTOBERFEST_DEMO_PROJECT.name,
  clientName: HACKTOBERFEST_DEMO_PROJECT.clientName,
  title: 'Payment Gateway Integration & Extra Pages',
  originalReference: 'Contract Section 2: Excluded Payment Gateway & 5-Page Initial Scope Limit',
  additionalWork: 'Integration of Razorpay checkout with webhook handling and refund support; 3 additional custom responsive pages (FAQ, Customer Reviews, Sizing Guide); 3rd revision round.',
  reasonForChange: 'Client requested direct transactional capability and extra landing content not included in base contract.',
  estimatedHours: 31,
  hourlyRate: 1000,
  additionalCost: 31000,
  currency: '₹',
  revisedDeadline: '2026-11-27',
  status: 'Sent',
  createdAt: '2026-10-18T11:30:00.000Z',
  updatedAt: '2026-10-18T11:30:00.000Z'
};

export const INITIAL_DEMO_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    type: 'ANALYSIS_CREATED',
    title: 'New request analyzed',
    description: 'Razorpay checkout and 3 extra pages flagged as Out of Scope.',
    timestamp: '2026-10-18T10:45:00.000Z',
    projectId: HACKTOBERFEST_DEMO_PROJECT.id,
    projectName: HACKTOBERFEST_DEMO_PROJECT.name,
    badge: 'Out of Scope',
    badgeColor: 'violet'
  },
  {
    id: 'act-2',
    type: 'PROPOSAL_CREATED',
    title: 'Change proposal created',
    description: 'Generated CR-2026-081 (31 hrs · ₹31,000) for Razorpay & extra pages.',
    timestamp: '2026-10-18T11:30:00.000Z',
    projectId: HACKTOBERFEST_DEMO_PROJECT.id,
    projectName: HACKTOBERFEST_DEMO_PROJECT.name,
    badge: 'CR-2026-081',
    badgeColor: 'blue'
  },
  {
    id: 'act-3',
    type: 'SCOPE_UPDATED',
    title: 'Scope updated',
    description: 'Revision counter reached 2/2 limit for E-commerce Website Redesign.',
    timestamp: '2026-10-15T14:10:00.000Z',
    projectId: HACKTOBERFEST_DEMO_PROJECT.id,
    projectName: HACKTOBERFEST_DEMO_PROJECT.name,
    badge: 'Boundary hit',
    badgeColor: 'amber'
  },
  {
    id: 'act-4',
    type: 'PROJECT_CREATED',
    title: 'Project onboarded',
    description: 'Defined scope boundaries and deliverables for Fitness Tracker REST API.',
    timestamp: '2026-10-05T09:00:00.000Z',
    projectId: 'demo-mobile-api',
    projectName: 'Fitness Tracker REST API Backend',
    badge: 'Active',
    badgeColor: 'emerald'
  }
];

export function initializeStorage(): void {
  try {
    const existingProjects = localStorage.getItem(PROJECTS_KEY);
    if (!existingProjects) {
      const defaultProjects: ProjectScope[] = [
        { ...HACKTOBERFEST_DEMO_PROJECT, status: 'Active', description: 'Complete redesign and responsive build for a modern goods catalog.' },
        ...ALTERNATIVE_DEMO_PROJECTS.map(p => ({ ...p, status: 'Active' as const, description: 'Client deliverable scope with milestone boundaries.' }))
      ];
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(defaultProjects));
    }

    const existingAnalyses = localStorage.getItem(ANALYSES_KEY);
    if (!existingAnalyses) {
      localStorage.setItem(ANALYSES_KEY, JSON.stringify([INITIAL_DEMO_ANALYSIS]));
    }

    const existingProposals = localStorage.getItem(PROPOSALS_KEY);
    if (!existingProposals) {
      localStorage.setItem(PROPOSALS_KEY, JSON.stringify([INITIAL_DEMO_PROPOSAL]));
    }

    const existingActivities = localStorage.getItem(ACTIVITIES_KEY);
    if (!existingActivities) {
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(INITIAL_DEMO_ACTIVITIES));
    }
  } catch (e) {
    console.error('Storage initialization failed:', e);
  }
}

export function getProjects(): ProjectScope[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) {
      initializeStorage();
      return [HACKTOBERFEST_DEMO_PROJECT, ...ALTERNATIVE_DEMO_PROJECTS];
    }
    return JSON.parse(raw);
  } catch {
    return [HACKTOBERFEST_DEMO_PROJECT];
  }
}

export function getProjectById(id: string): ProjectScope | undefined {
  const projects = getProjects();
  return projects.find(p => p.id === id);
}

export function saveProject(project: ProjectScope): ProjectScope {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  const now = new Date().toISOString();

  let updated: ProjectScope;
  if (index >= 0) {
    updated = { ...project, updatedAt: now };
    projects[index] = updated;
    addActivityLog({
      type: 'SCOPE_UPDATED',
      title: 'Scope updated',
      description: `Updated project scope definitions for ${project.name}.`,
      projectId: project.id,
      projectName: project.name,
      badge: 'Updated',
      badgeColor: 'blue'
    });
  } else {
    updated = { ...project, createdAt: now, updatedAt: now };
    projects.unshift(updated);
    addActivityLog({
      type: 'PROJECT_CREATED',
      title: 'New project created',
      description: `Structured scope boundaries established for ${project.name}.`,
      projectId: project.id,
      projectName: project.name,
      badge: 'Created',
      badgeColor: 'emerald'
    });
  }

  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return updated;
}

export function deleteProject(id: string): boolean {
  const projects = getProjects();
  const filtered = projects.filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
  return true;
}

export function getAnalyses(): ScopeAnalysis[] {
  try {
    const raw = localStorage.getItem(ANALYSES_KEY);
    if (!raw) return [INITIAL_DEMO_ANALYSIS];
    return JSON.parse(raw);
  } catch {
    return [INITIAL_DEMO_ANALYSIS];
  }
}

export function saveAnalysis(analysis: ScopeAnalysis): ScopeAnalysis {
  const analyses = getAnalyses();
  const index = analyses.findIndex(a => a.id === analysis.id);

  if (index >= 0) {
    analyses[index] = analysis;
  } else {
    analyses.unshift(analysis);
    addActivityLog({
      type: 'ANALYSIS_CREATED',
      title: 'New request analyzed',
      description: `Analyzed message for ${analysis.projectName}. Classification: ${analysis.overallClassification || 'Reviewed'}.`,
      projectId: analysis.projectId,
      projectName: analysis.projectName,
      badge: analysis.overallClassification === 'IN_SCOPE' ? 'In Scope' : analysis.overallClassification === 'NEEDS_CLARIFICATION' ? 'Clarify' : 'Out of Scope',
      badgeColor: analysis.overallClassification === 'IN_SCOPE' ? 'emerald' : analysis.overallClassification === 'NEEDS_CLARIFICATION' ? 'amber' : 'violet'
    });
  }

  localStorage.setItem(ANALYSES_KEY, JSON.stringify(analyses));
  return analysis;
}

export function deleteAnalysis(id: string): boolean {
  const analyses = getAnalyses();
  const filtered = analyses.filter(a => a.id !== id);
  localStorage.setItem(ANALYSES_KEY, JSON.stringify(filtered));
  return true;
}

export function getProposals(): ChangeProposal[] {
  try {
    const raw = localStorage.getItem(PROPOSALS_KEY);
    if (!raw) return [INITIAL_DEMO_PROPOSAL];
    return JSON.parse(raw);
  } catch {
    return [INITIAL_DEMO_PROPOSAL];
  }
}

export function saveProposal(proposal: ChangeProposal): ChangeProposal {
  const proposals = getProposals();
  const index = proposals.findIndex(p => p.id === proposal.id);
  const now = new Date().toISOString();

  let updated: ChangeProposal;
  if (index >= 0) {
    updated = { ...proposal, updatedAt: now };
    proposals[index] = updated;
  } else {
    updated = { ...proposal, createdAt: now, updatedAt: now };
    proposals.unshift(updated);
    addActivityLog({
      type: 'PROPOSAL_CREATED',
      title: 'Change proposal created',
      description: `Generated proposal ${proposal.id} (${proposal.estimatedHours} hrs · ${proposal.currency}${proposal.additionalCost.toLocaleString()}) for ${proposal.projectName}.`,
      projectId: proposal.projectId,
      projectName: proposal.projectName,
      badge: proposal.id,
      badgeColor: 'blue'
    });
  }

  localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
  return updated;
}

export function deleteProposal(id: string): boolean {
  const proposals = getProposals();
  const filtered = proposals.filter(p => p.id !== id);
  localStorage.setItem(PROPOSALS_KEY, JSON.stringify(filtered));
  return true;
}

export function getActivityLogs(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    if (!raw) return INITIAL_DEMO_ACTIVITIES;
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_ACTIVITIES;
  }
}

export function addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog {
  const activities = getActivityLogs();
  const fullLog: ActivityLog = {
    ...log,
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString()
  };
  activities.unshift(fullLog);
  // Keep last 100 activities
  if (activities.length > 100) activities.length = 100;
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  return fullLog;
}

export function resetAllData(): void {
  localStorage.removeItem(PROJECTS_KEY);
  localStorage.removeItem(ANALYSES_KEY);
  localStorage.removeItem(PROPOSALS_KEY);
  localStorage.removeItem(ACTIVITIES_KEY);
  initializeStorage();
}

export function exportBackupJson(): string {
  const data = {
    app: 'ScopeShield AI',
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    projects: getProjects(),
    analyses: getAnalyses(),
    proposals: getProposals(),
    activities: getActivityLogs()
  };
  return JSON.stringify(data, null, 2);
}
