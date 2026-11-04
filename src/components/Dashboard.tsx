import React from 'react';
import { 
  ArrowRight, 
  Plus, 
  Radar, 
  FolderKanban, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  ArrowUpRight,
  Layers,
  HelpCircle,
  Inbox
} from 'lucide-react';
import { ProjectScope, ScopeAnalysis, ChangeProposal, ActivityLog } from '../types';
import { ScopeMap } from './ScopeMap';

interface DashboardProps {
  projects: ProjectScope[];
  analyses: ScopeAnalysis[];
  proposals: ChangeProposal[];
  activities: ActivityLog[];
  onSelectProject: (projectId: string) => void;
  onOpenDetector: (projectId?: string) => void;
  onOpenBuilder: () => void;
  onOpenProposals: () => void;
  onLoadDemoScenario: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  analyses,
  proposals,
  activities,
  onSelectProject,
  onOpenDetector,
  onOpenBuilder,
  onOpenProposals,
  onLoadDemoScenario
}) => {
  const activeProject = projects[0];

  // Boundary metrics
  const requestsReviewedCount = analyses.length;
  let withinAgreementCount = 0;
  let needsClarificationCount = 0;
  let scopeChangeCount = 0;

  analyses.forEach(a => {
    if (a.overallClassification === 'IN_SCOPE') withinAgreementCount++;
    else if (a.overallClassification === 'NEEDS_CLARIFICATION') needsClarificationCount++;
    else scopeChangeCount++;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* 1. TOP EDITORIAL HERO SECTION */}
      <section className="space-y-5 pb-6 border-b border-[#E9E7E2]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#7255E8]" />
          <span className="eyebrow text-[#171A2B]">YOUR FREELANCE COMMAND CENTER</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <h1 className="editorial-title text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#171A2B] tracking-tight">
              Your work.<br />
              <span className="text-[#7255E8]">Your boundaries.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#777887] leading-relaxed max-w-xl font-normal">
              One intelligent workspace to understand agreements, identify scope changes and protect the value of your work.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenDetector()}
              className="px-4 py-2.5 rounded-xl border border-[#E9E7E2] bg-[#FFFFFF] hover:bg-[#F8F7F4] text-[#171A2B] text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
            >
              <Radar className="w-3.5 h-3.5 text-[#7255E8]" />
              <span>Explore intelligence</span>
            </button>

            <button
              onClick={onOpenBuilder}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#171A2B] hover:bg-[#7255E8] text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.99]"
            >
              <span>Create a project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Empty State if no projects */}
      {projects.length === 0 ? (
        <div className="p-16 text-center bg-[#FFFFFF] border border-[#E9E7E2] rounded-2xl shadow-xs">
          <Inbox className="w-10 h-10 text-[#777887] mx-auto mb-3 opacity-50" />
          <h3 className="font-display font-bold text-base text-[#171A2B]">No active projects in command center</h3>
          <p className="text-xs text-[#777887] max-w-sm mx-auto mt-1 leading-relaxed">
            Initialize your first client agreement to establish contractual boundaries, deliverables, and revision caps.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={onOpenBuilder}
              className="px-4 py-2 bg-[#171A2B] hover:bg-[#7255E8] text-white text-xs font-bold rounded-xl"
            >
              Create a project →
            </button>
            <button
              onClick={onLoadDemoScenario}
              className="px-4 py-2 border border-[#E9E7E2] bg-[#FFFFFF] text-xs font-semibold rounded-xl"
            >
              Load Demo Template
            </button>
          </div>
        </div>
      ) : (
        /* 2. SOPHISTICATED PROJECT INTELLIGENCE OVERVIEW (ASYMMETRIC COMPOSITION) */
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* LEFT — Active Workspace: Editorial Project Panel (7 cols) */}
            <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E9E7E2] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_2px_12px_rgba(23,26,43,0.02)]">
              
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#E9E7E2]">
                  <span className="eyebrow">ACTIVE WORKSPACE</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                    {activeProject.status || 'Active'}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-2xl text-[#171A2B] tracking-tight">
                    {activeProject.name}
                  </h3>
                  <p className="text-xs text-[#777887] mt-0.5">
                    Client: <strong className="text-[#171A2B] font-semibold">{activeProject.clientName}</strong>
                  </p>
                </div>

                {activeProject.description && (
                  <p className="text-xs text-[#171A2B] leading-relaxed line-clamp-2">
                    {activeProject.description}
                  </p>
                )}

                {/* Scope Completeness & Milestones */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2]">
                    <span className="text-[10px] font-mono text-[#777887] block">Deliverables</span>
                    <span className="text-sm font-bold text-[#171A2B] font-mono mt-0.5 block">
                      {activeProject.includedDeliverables.length} Locked
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2]">
                    <span className="text-[10px] font-mono text-[#777887] block">Exclusions</span>
                    <span className="text-sm font-bold text-[#171A2B] font-mono mt-0.5 block">
                      {activeProject.excludedDeliverables.length} Clauses
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2]">
                    <span className="text-[10px] font-mono text-[#777887] block">Revision Cap</span>
                    <span className="text-sm font-bold text-[#171A2B] font-mono mt-0.5 block">
                      {activeProject.revisionsUsed}/{activeProject.revisionLimit || 2} Used
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Project Actions */}
              <div className="pt-6 border-t border-[#E9E7E2] mt-6 flex items-center justify-between">
                <div className="text-[11px] text-[#777887] font-mono">
                  Base: <strong className="text-[#171A2B]">{activeProject.currency}{activeProject.budget.toLocaleString()}</strong> • Rate: <strong className="text-[#171A2B]">{activeProject.currency}{activeProject.hourlyRate}/hr</strong>
                </div>

                <button
                  onClick={() => onSelectProject(activeProject.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F8F7F4] hover:bg-[#F0EDFF] text-[#171A2B] hover:text-[#7255E8] rounded-xl text-xs font-semibold border border-[#E9E7E2] transition-colors"
                >
                  <span>Open workspace</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* RIGHT — Boundary Intelligence: Status Visualization (5 cols) */}
            <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E9E7E2] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_2px_12px_rgba(23,26,43,0.02)]">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E9E7E2]">
                  <span className="eyebrow">BOUNDARY INTELLIGENCE</span>
                  <span className="text-[10px] font-mono text-[#777887]">REAL-TIME AUDIT</span>
                </div>

                {/* Subtle Circular Status Radar / Numerical Typography */}
                <div className="grid grid-cols-2 gap-4 py-2">
                  
                  {/* Metric: Requests Analyzed */}
                  <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] relative overflow-hidden">
                    <span className="text-[10px] font-mono text-[#777887] uppercase block">Requests Analyzed</span>
                    <span className="text-3xl font-display font-extrabold text-[#171A2B] tracking-tight mt-1 block">
                      {requestsReviewedCount}
                    </span>
                    <span className="text-[10px] text-[#777887]">Client Inquiries</span>
                  </div>

                  {/* Metric: Within Agreement */}
                  <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] relative overflow-hidden">
                    <span className="text-[10px] font-mono text-[#42B9A8] uppercase block">Within Agreement</span>
                    <span className="text-3xl font-display font-extrabold text-[#42B9A8] tracking-tight mt-1 block">
                      {withinAgreementCount}
                    </span>
                    <span className="text-[10px] text-[#42B9A8]">In Scope (0 Billable)</span>
                  </div>

                  {/* Metric: Need Clarification */}
                  <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] relative overflow-hidden">
                    <span className="text-[10px] font-mono text-amber-700 uppercase block">Need Clarification</span>
                    <span className="text-3xl font-display font-extrabold text-amber-600 tracking-tight mt-1 block">
                      {needsClarificationCount}
                    </span>
                    <span className="text-[10px] text-amber-700">Threshold Queries</span>
                  </div>

                  {/* Metric: Potential Scope Changes */}
                  <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] relative overflow-hidden">
                    <span className="text-[10px] font-mono text-[#7255E8] uppercase block">Scope Additions</span>
                    <span className="text-3xl font-display font-extrabold text-[#7255E8] tracking-tight mt-1 block">
                      {scopeChangeCount}
                    </span>
                    <span className="text-[10px] text-[#7255E8]">Change Orders Generated</span>
                  </div>

                </div>

                <div className="p-3 rounded-xl bg-[#F0EDFF]/60 border border-[#7255E8]/20 flex items-start gap-2.5 text-xs text-[#171A2B]">
                  <Sparkles className="w-4 h-4 text-[#7255E8] shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Zero-hallucination boundary protection:</strong> Every request is parsed against contract scope clauses before client replies are drafted.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E9E7E2]">
                <button
                  onClick={() => onOpenDetector(activeProject.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#171A2B] hover:bg-[#7255E8] text-white text-xs font-semibold transition-colors"
                >
                  <Radar className="w-3.5 h-3.5" />
                  <span>Analyze incoming client message</span>
                </button>
              </div>

            </div>

          </div>

          {/* SIGNATURE SCOPE MAP EMBED (Topological Boundary Visualization) */}
          <div className="space-y-2">
            <ScopeMap project={activeProject} analysis={analyses[0] || null} />
          </div>

          {/* RECENT ACTIVITY STREAM WITH TIMELINE */}
          <section className="bg-[#FFFFFF] border border-[#E9E7E2] rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(23,26,43,0.02)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E7E2]">
              <div>
                <span className="eyebrow">CHRONOLOGICAL AUDIT TRAIL</span>
                <h3 className="font-display font-bold text-base text-[#171A2B] mt-0.5">Recent Activity</h3>
              </div>

              <span className="text-[10px] font-mono text-[#777887]">Live Stream</span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E9E7E2]">
              {activities.slice(0, 5).map((act) => {
                const dateObj = new Date(act.timestamp);
                const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateString = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

                return (
                  <div key={act.id} className="relative group">
                    {/* Bullet marker */}
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-[#171A2B] group-hover:bg-[#7255E8] transition-colors" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#171A2B]">{act.title}</span>
                        {act.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#F8F7F4] border border-[#E9E7E2] text-[#171A2B]">
                            {act.badge}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-[#777887]">
                        {dateString} • {timeString}
                      </span>
                    </div>

                    <p className="text-xs text-[#777887] mt-0.5 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      )}

    </div>
  );
};
