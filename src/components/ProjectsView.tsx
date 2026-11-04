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
  ScanSearch,
  FileSpreadsheet,
  Layers,
  History,
  Check,
  AlertCircle
} from 'lucide-react';
import { ProjectScope, ScopeAnalysis, ChangeProposal, ActivityLog } from '../types';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'scope' | 'requests' | 'proposals' | 'activity'>('overview');

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
      toast.info('Project Deleted', `Removed ${name}`);
      const remaining = projects.filter(p => p.id !== id);
      if (remaining.length > 0) setSelectedProjectId(remaining[0].id);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="p-12 text-center bg-white border border-[#ECEAF0] rounded-2xl shadow-xs">
        <FolderKanban className="w-10 h-10 text-[#85899A] mx-auto mb-2 opacity-50" />
        <h3 className="text-sm font-bold text-[#17213A]">No projects available</h3>
        <p className="text-xs text-[#85899A] mt-1">Create a new project scope to start tracking client boundaries.</p>
        <button
          onClick={onNewProject}
          className="mt-4 px-4 py-2 bg-[#6946D8] hover:bg-[#5b3bc2] text-white text-xs font-semibold rounded-xl"
        >
          + Create New Project
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ECEAF0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17213A] tracking-tight">My Projects</h1>
          <p className="text-xs text-[#85899A] mt-0.5">
            Manage contract deliverables, locked scopes, and change request histories.
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6946D8] hover:bg-[#5b3bc2] text-white text-xs font-semibold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Main Grid: Projects List (4 cols) + Project Details Workspace (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT LIST (4 cols) ================= */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#85899A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects or clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8]"
            />
          </div>

          {/* Projects Card List */}
          <div className="space-y-2">
            {filteredProjects.map((p) => {
              const isSelected = activeProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p.id)}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-[#6946D8] shadow-xs'
                      : 'bg-white border-[#ECEAF0] hover:border-[#6946D8]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17213A] text-xs line-clamp-1">{p.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-700">
                      {p.status || 'Active'}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#85899A] mt-0.5">{p.clientName}</p>

                  <div className="mt-2.5 pt-2 border-t border-[#ECEAF0] flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#17213A]">
                      {p.currency}{p.budget.toLocaleString()}
                    </span>
                    <span className="text-[#85899A]">
                      {p.revisionsUsed}/{p.revisionLimit || 2} revs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ================= RIGHT WORKSPACE (8 cols) ================= */}
        {activeProject ? (
          <div className="lg:col-span-8 space-y-4">
            
            {/* Project Header Banner */}
            <div className="bg-white border border-[#ECEAF0] rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(23,33,58,0.03)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ECEAF0]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#17213A]">{activeProject.name}</h2>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F0EBFF] text-[#6946D8]">
                      {activeProject.currency}{activeProject.budget.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#85899A] mt-0.5">Client: <strong className="text-[#17213A] font-semibold">{activeProject.clientName}</strong></p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDetectCreep(activeProject.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6946D8] hover:bg-[#5b3bc2] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <ScanSearch className="w-3.5 h-3.5" />
                    <span>Analyze Scope</span>
                  </button>

                  <button
                    onClick={() => onEditProject(activeProject)}
                    className="p-1.5 rounded-lg border border-[#ECEAF0] bg-white hover:bg-[#FAF9F6] text-[#85899A] hover:text-[#17213A]"
                    title="Edit Project Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(activeProject.id, activeProject.name)}
                    className="p-1.5 rounded-lg border border-[#ECEAF0] bg-white hover:bg-rose-50 text-[#85899A] hover:text-rose-500"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 5 Tabs: Overview | Original Scope | Requests | Change Proposals | Activity */}
              <div className="flex items-center gap-1 border-b border-[#ECEAF0] pb-1 text-xs">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'scope', label: 'Original Scope' },
                  { id: 'requests', label: `Requests (${projectAnalyses.length})` },
                  { id: 'proposals', label: `Change Proposals (${projectProposals.length})` },
                  { id: 'activity', label: 'Activity' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#F0EBFF] text-[#6946D8]'
                        : 'text-[#85899A] hover:text-[#17213A] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT: 1. OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in">
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-white border border-[#ECEAF0] rounded-2xl shadow-xs">
                    <span className="text-[10px] text-[#85899A] font-semibold uppercase">Base Budget</span>
                    <p className="text-base font-bold text-[#17213A] mt-1">{activeProject.currency}{activeProject.budget.toLocaleString()}</p>
                  </div>

                  <div className="p-3.5 bg-white border border-[#ECEAF0] rounded-2xl shadow-xs">
                    <span className="text-[10px] text-[#85899A] font-semibold uppercase">Out-of-Scope Rate</span>
                    <p className="text-base font-bold text-[#17213A] mt-1">{activeProject.currency}{activeProject.hourlyRate}/hr</p>
                  </div>

                  <div className="p-3.5 bg-white border border-[#ECEAF0] rounded-2xl shadow-xs">
                    <span className="text-[10px] text-[#85899A] font-semibold uppercase">Revision Policy</span>
                    <p className="text-base font-bold text-[#17213A] mt-1">
                      {activeProject.revisionsUsed}/{activeProject.revisionLimit || 2} <span className="text-xs text-[#85899A] font-normal">used</span>
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-[#ECEAF0] rounded-2xl shadow-xs">
                    <span className="text-[10px] text-[#85899A] font-semibold uppercase">Deadline</span>
                    <p className="text-base font-bold text-[#17213A] mt-1">
                      {activeProject.deadline ? activeProject.deadline : 'Flexible'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {activeProject.description && (
                  <div className="p-4 bg-white border border-[#ECEAF0] rounded-2xl shadow-xs">
                    <span className="text-[10px] font-bold text-[#85899A] uppercase tracking-wider block mb-1">
                      Scope Overview
                    </span>
                    <p className="text-xs text-[#17213A] leading-relaxed">{activeProject.description}</p>
                  </div>
                )}

                {/* Quick Snapshot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-[#ECEAF0] rounded-2xl shadow-xs space-y-2">
                    <span className="text-[10px] font-bold text-[#85899A] uppercase tracking-wider block">
                      Included Deliverables ({activeProject.includedDeliverables.length})
                    </span>
                    <ul className="space-y-1 text-xs">
                      {activeProject.includedDeliverables.slice(0, 4).map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[#17213A]">
                          <span className="text-[#18A999] font-bold">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-white border border-[#ECEAF0] rounded-2xl shadow-xs space-y-2">
                    <span className="text-[10px] font-bold text-[#85899A] uppercase tracking-wider block">
                      Contract Boundaries ({activeProject.excludedDeliverables.length})
                    </span>
                    <ul className="space-y-1 text-xs">
                      {activeProject.excludedDeliverables.slice(0, 4).map((e, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[#17213A]">
                          <span className="text-[#6946D8] font-bold">•</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: 2. ORIGINAL SCOPE (Document View) */}
            {activeTab === 'scope' && (
              <div className="bg-white border border-[#ECEAF0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
                <div className="pb-4 border-b border-[#ECEAF0] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#6946D8] uppercase tracking-wider">
                      Master Project Scope Document
                    </span>
                    <h3 className="text-base font-bold text-[#17213A] mt-0.5">{activeProject.name}</h3>
                    <p className="text-xs text-[#85899A]">Agreed Baseline with {activeProject.clientName}</p>
                  </div>
                  <span className="text-xs font-bold text-[#17213A] font-mono">
                    {activeProject.currency}{activeProject.budget.toLocaleString()}
                  </span>
                </div>

                {/* Included Deliverables Section */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-[#17213A] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#18A999]" />
                    <span>Section 1: Contracted Deliverables</span>
                  </h4>
                  <div className="bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl p-4 space-y-2">
                    {activeProject.includedDeliverables.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#17213A]">
                        <Check className="w-3.5 h-3.5 text-[#18A999] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Excluded Deliverables Section */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-[#17213A] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#6946D8]" />
                    <span>Section 2: Excluded Work & Boundaries</span>
                  </h4>
                  <div className="bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl p-4 space-y-2">
                    {activeProject.excludedDeliverables.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#17213A]">
                        <span className="text-[#6946D8] font-bold shrink-0 mt-0.5">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Milestones & Terms */}
                {activeProject.paymentMilestones && activeProject.paymentMilestones.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-[#17213A] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Section 3: Payment Milestones</span>
                    </h4>
                    <div className="bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl p-4 space-y-2">
                      {activeProject.paymentMilestones.map((m, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#17213A]">
                          <span className="font-bold text-[#6946D8]">{i + 1}.</span>
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
              <div className="bg-white border border-[#ECEAF0] rounded-2xl p-5 shadow-xs space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-[#ECEAF0]">
                  <span className="text-xs font-bold text-[#17213A]">Incoming Scope Analyses</span>
                  <button
                    onClick={() => onDetectCreep(activeProject.id)}
                    className="text-xs font-semibold text-[#6946D8] hover:underline"
                  >
                    + Analyze New Message
                  </button>
                </div>

                {projectAnalyses.length === 0 ? (
                  <p className="text-xs text-[#85899A] py-6 text-center">No requests analyzed for this project yet.</p>
                ) : (
                  <div className="space-y-3">
                    {projectAnalyses.map((an) => (
                      <div key={an.id} className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#17213A]">
                            {new Date(an.timestamp).toLocaleDateString()} at {new Date(an.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            an.overallClassification === 'IN_SCOPE' ? 'bg-emerald-50 text-emerald-700' :
                            an.overallClassification === 'NEEDS_CLARIFICATION' ? 'bg-amber-50 text-amber-700' :
                            'bg-[#F0EBFF] text-[#6946D8]'
                          }`}>
                            {an.overallClassification || 'Reviewed'}
                          </span>
                        </div>
                        <p className="text-[#85899A] italic text-[11px] line-clamp-2">"{an.clientMessage}"</p>
                        <p className="text-[#17213A] leading-relaxed">{an.aiExplanation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 4. CHANGE PROPOSALS */}
            {activeTab === 'proposals' && (
              <div className="bg-white border border-[#ECEAF0] rounded-2xl p-5 shadow-xs space-y-3 animate-in fade-in">
                <span className="text-xs font-bold text-[#17213A] block pb-2 border-b border-[#ECEAF0]">
                  Change Request Orders ({projectProposals.length})
                </span>

                {projectProposals.length === 0 ? (
                  <p className="text-xs text-[#85899A] py-6 text-center">No change proposals created for this project yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {projectProposals.map((prop) => (
                      <div key={prop.id} className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] text-xs flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#17213A] font-mono">{prop.id}</span>
                            <span className="font-semibold text-[#17213A]">{prop.title}</span>
                          </div>
                          <p className="text-[11px] text-[#85899A] mt-0.5">{prop.estimatedHours} hrs • {prop.currency}{prop.additionalCost.toLocaleString()}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-[#ECEAF0] text-[#17213A]">
                          {prop.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 5. ACTIVITY */}
            {activeTab === 'activity' && (
              <div className="bg-white border border-[#ECEAF0] rounded-2xl p-5 shadow-xs space-y-3 animate-in fade-in">
                <span className="text-xs font-bold text-[#17213A] block pb-2 border-b border-[#ECEAF0]">
                  Project Audit Trail
                </span>

                {projectActivities.length === 0 ? (
                  <p className="text-xs text-[#85899A] py-6 text-center">No specific activity logged yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {projectActivities.map((act) => (
                      <div key={act.id} className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#17213A]">{act.title}</span>
                          <span className="text-[10px] text-[#85899A]">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[#85899A] text-[11px] mt-0.5">{act.description}</p>
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
