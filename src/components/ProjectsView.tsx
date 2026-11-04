import React, { useState } from 'react';
import { 
  FolderKanban, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Radar,
  Layers,
  History,
  Check,
  AlertCircle,
  ExternalLink,
  ArrowUpRight
} from 'lucide-react';
import { ProjectScope, ScopeAnalysis, ChangeProposal, ActivityLog } from '../types';
import { ScopeMap } from './ScopeMap';
import { useToast } from './Toast';

interface ProjectsViewProps {
  projects: ProjectScope[];
  analyses: ScopeAnalysis[];
  proposals: ChangeProposal[];
  activities: ActivityLog[];
  onSelectProject: (projectId: string) => void;
  onEditProject: (project: ProjectScope) => void;
  onDeleteProject: (projectId: string) => void;
  onNewProject: () => void;
  onDetectCreep: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  analyses,
  proposals,
  activities,
  onSelectProject,
  onEditProject,
  onDeleteProject,
  onNewProject,
  onDetectCreep
}) => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'agreement' | 'requests' | 'proposals' | 'history'>('overview');

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeProject = projects.find(p => p.id === selectedProjectId) || filteredProjects[0];
  const projectAnalyses = analyses.filter(a => a.projectId === activeProject?.id);
  const projectProposals = proposals.filter(p => p.projectId === activeProject?.id);
  const projectActivities = activities.filter(a => a.projectId === activeProject?.id);

  const handleSelect = (id: string) => {
    setSelectedProjectId(id);
    onSelectProject(id);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}"?`)) {
      onDeleteProject(id);
      toast.info('Project Removed', `Deleted ${name}`);
      const remaining = projects.filter(p => p.id !== id);
      if (remaining.length > 0) setSelectedProjectId(remaining[0].id);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="p-16 text-center bg-white border border-[#E9E7E2] rounded-2xl shadow-xs">
        <FolderKanban className="w-10 h-10 text-[#777887] mx-auto mb-2 opacity-50" />
        <h3 className="font-bold text-sm text-[#17213A]">No projects active</h3>
        <p className="text-xs text-[#777887] mt-1">Create a new project scope to start protecting client boundaries.</p>
        <button
          onClick={onNewProject}
          className="mt-4 px-4 py-2 bg-[#171A2B] hover:bg-[#7255E8] text-white text-xs font-bold rounded-xl"
        >
          Create a project →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E9E7E2]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7255E8]" />
            <span className="eyebrow text-[#171A2B]">PROJECT ENVIRONMENTS</span>
          </div>
          <h1 className="editorial-title text-3xl sm:text-4xl font-extrabold text-[#171A2B] tracking-tight">
            Dedicated Workspaces.
          </h1>
          <p className="text-xs sm:text-sm text-[#777887] mt-1 font-normal">
            Manage contract deliverables, locked scopes, and change request histories.
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#171A2B] hover:bg-[#7255E8] text-white text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Grid: Project Rail (4 cols) + Workspace Environment (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT: PROJECT LIST RAIL (4 cols) ================= */}
        <div className="lg:col-span-4 space-y-3">
          
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#777887] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter projects or clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#E9E7E2] rounded-xl text-[#171A2B] focus:outline-none focus:border-[#7255E8]"
            />
          </div>

          <div className="space-y-2">
            {filteredProjects.map((p) => {
              const isSelected = activeProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p.id)}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-[#7255E8] shadow-xs'
                      : 'bg-white border-[#E9E7E2] hover:border-[#7255E8]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#171A2B] text-xs line-clamp-1">{p.name}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-emerald-50 text-emerald-700">
                      {p.status || 'Active'}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#777887] mt-0.5">{p.clientName}</p>

                  <div className="mt-3 pt-2 border-t border-[#E9E7E2] flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-[#171A2B]">
                      {p.currency}{p.budget.toLocaleString()}
                    </span>
                    <span className="text-[#777887]">
                      {p.revisionsUsed}/{p.revisionLimit || 2} revs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ================= RIGHT: DEDICATED PROJECT WORKSPACE (8 cols) ================= */}
        {activeProject ? (
          <div className="lg:col-span-8 space-y-5">
            
            {/* Project Environment Header */}
            <div className="bg-white border border-[#E9E7E2] rounded-2xl p-6 shadow-[0_2px_12px_rgba(23,26,43,0.02)] space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E9E7E2]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-xl text-[#171A2B]">{activeProject.name}</h2>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F0EDFF] text-[#7255E8]">
                      {activeProject.currency}{activeProject.budget.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#777887] mt-0.5 font-mono">Client: {activeProject.clientName}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDetectCreep(activeProject.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#171A2B] hover:bg-[#7255E8] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Radar className="w-3.5 h-3.5" />
                    <span>Analyze Scope</span>
                  </button>

                  <button
                    onClick={() => onEditProject(activeProject)}
                    className="p-1.5 rounded-lg border border-[#E9E7E2] bg-white hover:bg-[#F8F7F4] text-[#777887] hover:text-[#171A2B]"
                    title="Edit Agreement"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(activeProject.id, activeProject.name)}
                    className="p-1.5 rounded-lg border border-[#E9E7E2] bg-white hover:bg-rose-50 text-[#777887] hover:text-rose-500"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 5 ELEGANT TABS: Overview / Agreement / Requests / Proposals / History */}
              <div className="flex items-center gap-1 border-b border-[#E9E7E2] pb-1 text-xs font-medium">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'agreement', label: 'Agreement' },
                  { id: 'requests', label: `Requests (${projectAnalyses.length})` },
                  { id: 'proposals', label: `Proposals (${projectProposals.length})` },
                  { id: 'history', label: 'History' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#F0EDFF] text-[#7255E8]'
                        : 'text-[#777887] hover:text-[#171A2B] hover:bg-[#F8F7F4]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

            </div>

            {/* TAB CONTENT: 1. OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-5 animate-in fade-in">
                
                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-white border border-[#E9E7E2] rounded-2xl shadow-xs">
                    <span className="eyebrow block">BASE CONTRACT</span>
                    <p className="text-base font-bold text-[#171A2B] font-mono mt-1">{activeProject.currency}{activeProject.budget.toLocaleString()}</p>
                  </div>

                  <div className="p-3.5 bg-white border border-[#E9E7E2] rounded-2xl shadow-xs">
                    <span className="eyebrow block">OUT-OF-SCOPE RATE</span>
                    <p className="text-base font-bold text-[#171A2B] font-mono mt-1">{activeProject.currency}{activeProject.hourlyRate}/hr</p>
                  </div>

                  <div className="p-3.5 bg-white border border-[#E9E7E2] rounded-2xl shadow-xs">
                    <span className="eyebrow block">REVISION CAP</span>
                    <p className="text-base font-bold text-[#171A2B] font-mono mt-1">
                      {activeProject.revisionsUsed}/{activeProject.revisionLimit || 2} <span className="text-xs text-[#777887] font-normal">used</span>
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-[#E9E7E2] rounded-2xl shadow-xs">
                    <span className="eyebrow block">TARGET DEADLINE</span>
                    <p className="text-base font-bold text-[#171A2B] font-mono mt-1">
                      {activeProject.deadline ? activeProject.deadline : 'Flexible'}
                    </p>
                  </div>
                </div>

                {/* Scope Map */}
                <ScopeMap project={activeProject} analysis={projectAnalyses[0] || null} />

              </div>
            )}

            {/* TAB CONTENT: 2. AGREEMENT (Structured Document View) */}
            {activeTab === 'agreement' && (
              <div className="bg-white border border-[#E9E7E2] rounded-2xl p-8 shadow-xs space-y-6 animate-in fade-in">
                
                <div className="pb-4 border-b border-[#171A2B] flex items-center justify-between">
                  <div>
                    <span className="eyebrow text-[#7255E8]">MASTER SCOPE AGREEMENT</span>
                    <h3 className="editorial-title text-xl font-bold text-[#171A2B] mt-0.5">{activeProject.name}</h3>
                    <p className="text-xs text-[#777887] font-mono">Baseline Agreement with {activeProject.clientName}</p>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#171A2B]">
                    {activeProject.currency}{activeProject.budget.toLocaleString()}
                  </span>
                </div>

                {/* Included Deliverables */}
                <div className="space-y-2">
                  <span className="eyebrow text-[#42B9A8] block">1. CONTRACTED DELIVERABLES ({activeProject.includedDeliverables.length})</span>
                  <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] space-y-2">
                    {activeProject.includedDeliverables.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#171A2B]">
                        <Check className="w-3.5 h-3.5 text-[#42B9A8] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exclusions */}
                <div className="space-y-2">
                  <span className="eyebrow text-[#7255E8] block">2. EXCLUDED WORK & BOUNDARIES ({activeProject.excludedDeliverables.length})</span>
                  <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] space-y-2">
                    {activeProject.excludedDeliverables.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#171A2B]">
                        <span className="text-[#7255E8] font-bold shrink-0">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Milestones */}
                {activeProject.paymentMilestones && activeProject.paymentMilestones.length > 0 && (
                  <div className="space-y-2">
                    <span className="eyebrow block">3. PAYMENT MILESTONES</span>
                    <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] space-y-2">
                      {activeProject.paymentMilestones.map((m, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs font-mono text-[#171A2B]">
                          <span className="text-[#7255E8] font-bold">{i + 1}.</span>
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB CONTENT: 3. REQUESTS */}
            {activeTab === 'requests' && (
              <div className="bg-white border border-[#E9E7E2] rounded-2xl p-6 shadow-xs space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#E9E7E2]">
                  <span className="eyebrow">INCOMING REQUEST AUDIT ({projectAnalyses.length})</span>
                  <button
                    onClick={() => onDetectCreep(activeProject.id)}
                    className="text-xs font-semibold text-[#7255E8] hover:underline"
                  >
                    + Analyze New Request
                  </button>
                </div>

                {projectAnalyses.length === 0 ? (
                  <p className="text-xs text-[#777887] py-8 text-center">No requests analyzed for this project yet.</p>
                ) : (
                  <div className="space-y-3">
                    {projectAnalyses.map((an) => (
                      <div key={an.id} className="p-4 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-[#777887]">
                            {new Date(an.timestamp).toLocaleDateString()} at {new Date(an.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                            an.overallClassification === 'IN_SCOPE' ? 'bg-emerald-50 text-emerald-800' :
                            an.overallClassification === 'NEEDS_CLARIFICATION' ? 'bg-amber-50 text-amber-800' :
                            'bg-[#F0EDFF] text-[#7255E8]'
                          }`}>
                            {an.overallClassification}
                          </span>
                        </div>
                        <p className="italic text-[#777887] text-[11px]">"{an.clientMessage}"</p>
                        <p className="text-[#171A2B] leading-relaxed">{an.aiExplanation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 4. PROPOSALS */}
            {activeTab === 'proposals' && (
              <div className="bg-white border border-[#E9E7E2] rounded-2xl p-6 shadow-xs space-y-3 animate-in fade-in">
                <span className="eyebrow block pb-3 border-b border-[#E9E7E2]">
                  CHANGE REQUEST ORDERS ({projectProposals.length})
                </span>

                {projectProposals.length === 0 ? (
                  <p className="text-xs text-[#777887] py-8 text-center">No change proposals created for this project yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {projectProposals.map((prop) => (
                      <div key={prop.id} className="p-4 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] text-xs flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#171A2B]">{prop.id}</span>
                            <span className="font-bold text-[#171A2B]">{prop.title}</span>
                          </div>
                          <p className="text-[11px] text-[#777887] font-mono mt-0.5">
                            {prop.estimatedHours} hrs • {prop.currency}{prop.additionalCost.toLocaleString()}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-[#E9E7E2] text-[#171A2B]">
                          {prop.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 5. HISTORY */}
            {activeTab === 'history' && (
              <div className="bg-white border border-[#E9E7E2] rounded-2xl p-6 shadow-xs space-y-3 animate-in fade-in">
                <span className="eyebrow block pb-3 border-b border-[#E9E7E2]">
                  PROJECT AUDIT TRAIL
                </span>

                {projectActivities.length === 0 ? (
                  <p className="text-xs text-[#777887] py-8 text-center">No activity records logged for this workspace yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {projectActivities.map((act) => (
                      <div key={act.id} className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#171A2B]">{act.title}</span>
                          <span className="text-[10px] font-mono text-[#777887]">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[#777887] text-[11px] mt-0.5">{act.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        ) : null}

      </div>

    </div>
  );
};
