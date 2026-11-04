import React, { useState } from 'react';
import { 
  History, 
  Filter, 
  ScanSearch, 
  FileSpreadsheet, 
  ShieldAlert, 
  FolderKanban, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { ActivityLog } from '../types';

interface ActivityHistoryViewProps {
  activities: ActivityLog[];
  onSelectProject?: (projectId: string) => void;
  onOpenDetector?: (projectId?: string) => void;
}

export const ActivityHistoryView: React.FC<ActivityHistoryViewProps> = ({
  activities,
  onSelectProject,
  onOpenDetector
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = filterType === 'ALL' 
    ? activities 
    : activities.filter(a => a.type === filterType);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ECEAF0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17213A] tracking-tight">Activity History</h1>
          <p className="text-xs text-[#85899A] mt-0.5">
            Complete audit trail of scope reviews, boundary updates, and client change proposals.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#ECEAF0] text-xs">
          {[
            { id: 'ALL', label: 'All Activity' },
            { id: 'ANALYSIS_CREATED', label: 'Analyses' },
            { id: 'PROPOSAL_CREATED', label: 'Proposals' },
            { id: 'SCOPE_UPDATED', label: 'Scope Updates' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
                filterType === f.id
                  ? 'bg-[#F0EBFF] text-[#6946D8]'
                  : 'text-[#85899A] hover:text-[#17213A]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white border border-[#ECEAF0] rounded-2xl p-6 sm:p-8 shadow-xs">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#85899A]">
            No activity found for the selected filter.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#ECEAF0]">
            {filtered.map((act) => {
              const dateObj = new Date(act.timestamp);
              const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              let dotColor = 'bg-[#6946D8]';
              if (act.badgeColor === 'emerald') dotColor = 'bg-[#18A999]';
              if (act.badgeColor === 'amber') dotColor = 'bg-amber-400';
              if (act.badgeColor === 'blue') dotColor = 'bg-blue-500';

              return (
                <div key={act.id} className="relative group">
                  {/* Timeline dot */}
                  <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white ${dotColor} shadow-xs`} />
                  
                  <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] hover:border-[#6946D8]/30 transition-all text-xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#17213A] text-sm">{act.title}</span>
                        {act.badge && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-[#ECEAF0] text-[#17213A]">
                            {act.badge}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-[#85899A]">
                        {formattedDate} at {formattedTime}
                      </span>
                    </div>

                    <p className="text-[#17213A] leading-relaxed">
                      {act.description}
                    </p>

                    {act.projectName && (
                      <div className="pt-2 border-t border-[#ECEAF0] flex items-center justify-between text-[11px]">
                        <span className="text-[#85899A]">
                          Project: <strong className="text-[#17213A] font-semibold">{act.projectName}</strong>
                        </span>

                        {act.projectId && onSelectProject && (
                          <button
                            onClick={() => onSelectProject(act.projectId!)}
                            className="text-[#6946D8] hover:underline font-semibold flex items-center gap-1"
                          >
                            <span>View Project</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
