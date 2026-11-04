import React from 'react';
import { 
  Plus, 
  FolderKanban, 
  ScanSearch, 
  CheckCircle2, 
  FileSpreadsheet, 
  ArrowUpRight, 
  ArrowRight,
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  Inbox
} from 'lucide-react';
import { ProjectScope, ScopeAnalysis, ChangeProposal, ActivityLog } from '../types';

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
  // Metrics calculation
  const activeProjectsCount = projects.filter(p => (p.status || 'Active') === 'Active').length || projects.length;
  const requestsReviewedCount = analyses.length;
  
  // Count in-scope vs change requests
  let inScopeCount = 0;
  analyses.forEach(a => {
    if (a.overallClassification === 'IN_SCOPE') {
      inScopeCount += 1;
    } else {
      const inScopeItems = a.changes.filter(c => c.classification === 'IN_SCOPE' || c.classification === 'LIKELY_IN_SCOPE').length;
      inScopeCount += inScopeItems;
    }
  });

  const changeRequestsCount = proposals.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#ECEAF0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17213A] tracking-tight">
            Good morning, let's protect your work.
          </h1>
          <p className="text-sm text-[#85899A] mt-1 font-medium">
            Your projects, boundaries and client requests — all in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLoadDemoScenario}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#ECEAF0] bg-white hover:bg-[#FAF9F6] text-[#17213A] transition-all shadow-xs"
          >
            Load Sample Scenario
          </button>
          <button
            onClick={onOpenBuilder}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6946D8] hover:bg-[#5b3bc2] text-white text-xs font-semibold shadow-[0_2px_8px_rgba(105,70,216,0.25)] transition-all active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      </div>

      {/* 2. Four Compact Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Active Projects */}
        <div className="p-4 bg-white rounded-2xl border border-[#ECEAF0] shadow-[0_2px_10px_rgba(23,33,58,0.03)] hover:border-[#6946D8]/30 transition-all">
          <div className="flex items-center justify-between text-[#85899A]">
            <span className="text-xs font-medium">Active Projects</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] flex items-center justify-center text-[#17213A]">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#17213A] tracking-tight">{activeProjectsCount}</span>
            <span className="text-[11px] text-[#18A999] font-semibold">Tracked</span>
          </div>
        </div>

        {/* Metric 2: Requests Reviewed */}
        <div className="p-4 bg-white rounded-2xl border border-[#ECEAF0] shadow-[0_2px_10px_rgba(23,33,58,0.03)] hover:border-[#6946D8]/30 transition-all">
          <div className="flex items-center justify-between text-[#85899A]">
            <span className="text-xs font-medium">Requests Reviewed</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] flex items-center justify-center text-[#6946D8]">
              <ScanSearch className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#17213A] tracking-tight">{requestsReviewedCount}</span>
            <span className="text-[11px] text-[#85899A] font-medium">Messages</span>
          </div>
        </div>

        {/* Metric 3: In-Scope Requests */}
        <div className="p-4 bg-white rounded-2xl border border-[#ECEAF0] shadow-[0_2px_10px_rgba(23,33,58,0.03)] hover:border-[#6946D8]/30 transition-all">
          <div className="flex items-center justify-between text-[#85899A]">
            <span className="text-xs font-medium">In-Scope Requests</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] flex items-center justify-center text-[#18A999]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#17213A] tracking-tight">{inScopeCount}</span>
            <span className="text-[11px] text-[#18A999] font-semibold">Approved</span>
          </div>
        </div>

        {/* Metric 4: Change Requests */}
        <div className="p-4 bg-white rounded-2xl border border-[#ECEAF0] shadow-[0_2px_10px_rgba(23,33,58,0.03)] hover:border-[#6946D8]/30 transition-all">
          <div className="flex items-center justify-between text-[#85899A]">
            <span className="text-xs font-medium">Change Requests</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] flex items-center justify-center text-[#6946D8]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#17213A] tracking-tight">{changeRequestsCount}</span>
            <span className="text-[11px] text-[#6946D8] font-semibold">Proposals</span>
          </div>
        </div>

      </div>

      {/* 3. Empty State if no projects */}
      {projects.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#ECEAF0] rounded-2xl shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F0EBFF] flex items-center justify-center text-[#6946D8] mb-4">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#17213A]">No projects created yet</h3>
          <p className="text-xs text-[#85899A] max-w-sm mx-auto mt-1 leading-relaxed">
            Set up your first client project scope to lock in deliverables, exclusions, and revision boundaries.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={onOpenBuilder}
              className="px-4 py-2 bg-[#6946D8] hover:bg-[#5b3bc2] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              + Create New Project
            </button>
            <button
              onClick={onLoadDemoScenario}
              className="px-4 py-2 border border-[#ECEAF0] bg-white hover:bg-[#FAF9F6] text-[#17213A] text-xs font-semibold rounded-xl transition-colors"
            >
              Load Demo Template
            </button>
          </div>
        </div>
      ) : (
        /* 4. Two-Column Layout Below Metrics */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Recent Projects Table (8 cols on lg) */}
          <div className="lg:col-span-8 bg-white border border-[#ECEAF0] rounded-2xl shadow-[0_2px_12px_rgba(23,33,58,0.03)] overflow-hidden">
            
            <div className="p-4 sm:p-5 border-b border-[#ECEAF0] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#17213A]">Recent Projects</h2>
                <p className="text-[11px] text-[#85899A] mt-0.5">Active agreements, deliverables and contract scopes</p>
              </div>

              <button
                onClick={() => onSelectProject(projects[0]?.id || '')}
                className="text-xs font-semibold text-[#6946D8] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#ECEAF0] bg-[#FAF9F6]/60 text-[11px] font-semibold text-[#85899A]">
                    <th className="py-3 px-4 sm:px-5">Project Name</th>
                    <th className="py-3 px-3">Client</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Last Updated</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECEAF0]">
                  {projects.slice(0, 5).map((project) => {
                    const status = project.status || 'Active';
                    const lastUpdated = project.updatedAt 
                      ? new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Recently';

                    return (
                      <tr 
                        key={project.id}
                        className="hover:bg-[#FAF9F6]/80 transition-colors group cursor-pointer"
                        onClick={() => onSelectProject(project.id)}
                      >
                        <td className="py-3.5 px-4 sm:px-5 font-medium text-[#17213A]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#F0EBFF] text-[#6946D8] flex items-center justify-center font-bold text-[10px]">
                              {project.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-xs text-[#17213A] group-hover:text-[#6946D8] transition-colors">{project.name}</p>
                              <p className="text-[10px] text-[#85899A]">{project.includedDeliverables.length} deliverables • {project.revisionLimit || 2} rev cap</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-[#17213A] font-medium">
                          {project.clientName || 'Direct Client'}
                        </td>

                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            status === 'Active' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-[#18A999]' : 'bg-slate-400'}`} />
                            {status}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-[#85899A] text-[11px]">
                          {lastUpdated}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProject(project.id);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6946D8] hover:text-[#5b3bc2] py-1 px-2.5 rounded-lg hover:bg-[#F0EBFF] transition-colors"
                          >
                            <span>Open</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

          {/* RIGHT: Recent Activity Timeline (4 cols on lg) */}
          <div className="lg:col-span-4 bg-white border border-[#ECEAF0] rounded-2xl shadow-[0_2px_12px_rgba(23,33,58,0.03)] p-4 sm:p-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#ECEAF0] mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#17213A]">Recent Activity</h2>
                <p className="text-[11px] text-[#85899A] mt-0.5">Automated scope audit trail</p>
              </div>

              <span className="text-[10px] font-semibold text-[#85899A] uppercase tracking-wider">Live</span>
            </div>

            <div className="relative pl-4 space-y-5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#ECEAF0]">
              {activities.slice(0, 5).map((act) => {
                const timeString = act.timestamp 
                  ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Just now';

                let dotColor = 'bg-[#6946D8]';
                if (act.badgeColor === 'emerald') dotColor = 'bg-[#18A999]';
                if (act.badgeColor === 'amber') dotColor = 'bg-amber-400';
                if (act.badgeColor === 'violet') dotColor = 'bg-[#6946D8]';

                return (
                  <div key={act.id} className="relative group">
                    {/* Timeline bullet dot */}
                    <div className={`absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${dotColor} shadow-xs`} />
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#17213A]">{act.title}</span>
                        <span className="text-[10px] text-[#85899A]">{timeString}</span>
                      </div>

                      <p className="text-[11px] text-[#85899A] mt-1 leading-relaxed">
                        {act.description}
                      </p>

                      {act.badge && (
                        <div className="mt-1.5">
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-[#FAF9F6] border border-[#ECEAF0] font-medium text-[#17213A]">
                            {act.badge}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Action in Card Footer */}
            <div className="mt-6 pt-3 border-t border-[#ECEAF0]">
              <button
                onClick={() => onOpenDetector(projects[0]?.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-[#6946D8] bg-[#F0EBFF] hover:bg-[#e4dbff] rounded-xl transition-colors"
              >
                <ScanSearch className="w-3.5 h-3.5" />
                <span>Test New Client Message</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
