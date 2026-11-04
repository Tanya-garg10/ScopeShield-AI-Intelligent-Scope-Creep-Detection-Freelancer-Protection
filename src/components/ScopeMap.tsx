import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, CheckCircle2, Crosshair, ArrowUpRight, Sparkles } from 'lucide-react';
import { ProjectScope, ScopeAnalysis, ScopeChangeItem } from '../types';

interface ScopeMapProps {
  project: ProjectScope;
  analysis?: ScopeAnalysis | null;
  interactive?: boolean;
}

export const ScopeMap: React.FC<ScopeMapProps> = ({
  project,
  analysis,
  interactive = true
}) => {
  const [activeNode, setActiveNode] = useState<{
    id: string;
    title: string;
    status: 'INSIDE' | 'EDGE' | 'OUTSIDE';
    detail: string;
    hours?: number;
    evidence?: string;
  } | null>(null);

  // Group items by zone: Inside (Included), Edge (Clarification), Outside (Out of scope)
  const insideDeliverables = project.includedDeliverables.slice(0, 4);

  const outsideChanges = analysis?.changes.filter(
    c => c.classification === 'OUT_OF_SCOPE' || c.classification === 'POTENTIAL_SCOPE_CHANGE'
  ) || [];

  const edgeChanges = analysis?.changes.filter(
    c => c.classification === 'NEEDS_CLARIFICATION' || c.classification === 'NEEDS_HUMAN_REVIEW'
  ) || [];

  return (
    <div className="relative bg-[#FFFFFF] border border-[#E9E7E2] rounded-2xl p-5 overflow-hidden shadow-[0_2px_12px_rgba(23,26,43,0.02)]">
      
      {/* Top Header & Map Eyebrow */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E9E7E2]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#7255E8] animate-ping" />
          <span className="eyebrow text-[#171A2B]">THE SCOPE MAP</span>
          <span className="text-[10px] text-[#777887] font-mono">• Topological Boundary Analysis</span>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-[#42B9A8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#42B9A8]" />
            Inside (Included)
          </span>
          <span className="flex items-center gap-1 text-amber-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Edge (Clarify)
          </span>
          <span className="flex items-center gap-1 text-[#7255E8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7255E8]" />
            Outside (+Delta)
          </span>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full h-72 sm:h-80 flex items-center justify-center my-2">
        <svg
          viewBox="0 0 600 320"
          className="w-full h-full select-none"
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="scope-map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F0EDFF" strokeWidth="0.75" />
            </pattern>
            {/* Radial gradient for central boundary core */}
            <radialGradient id="boundary-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F0EDFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid background */}
          <rect x="0" y="0" width="600" height="320" fill="url(#scope-map-grid)" opacity="0.6" />

          {/* Outer Orbit (Outside Scope Area) */}
          <circle cx="300" cy="160" r="140" fill="none" stroke="#E9E7E2" strokeWidth="1" strokeDasharray="4 4" />
          <text x="300" y="32" textAnchor="middle" fill="#777887" fontSize="9" fontFamily="monospace" letterSpacing="0.1em">
            ZONE III — OUTSIDE CONTRACT BOUNDARY (CHANGE ORDER REQUIRED)
          </text>

          {/* Edge Orbit (Clarification Threshold) */}
          <circle cx="300" cy="160" r="95" fill="none" stroke="#FBBF24" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />
          <text x="300" y="75" textAnchor="middle" fill="#B45309" fontSize="8" fontFamily="monospace">
            ZONE II — BOUNDARY THRESHOLD
          </text>

          {/* Core Contract Boundary (Inside Scope) */}
          <rect
            x="220"
            y="100"
            width="160"
            height="120"
            rx="16"
            fill="url(#boundary-glow)"
            stroke="#42B9A8"
            strokeWidth="1.5"
          />
          <text x="300" y="125" textAnchor="middle" fill="#171A2B" fontSize="10" fontWeight="700" fontFamily="sans-serif">
            {project.name.length > 20 ? project.name.slice(0, 18) + '...' : project.name}
          </text>
          <text x="300" y="140" textAnchor="middle" fill="#42B9A8" fontSize="9" fontWeight="600" fontFamily="monospace">
            ZONE I — BASELINE CONTRACT ({project.currency}{project.budget.toLocaleString()})
          </text>

          {/* Inside Nodes (Contracted items) */}
          {insideDeliverables.map((d, idx) => {
            const posX = idx % 2 === 0 ? 245 : 355;
            const posY = idx < 2 ? 165 : 195;
            return (
              <g
                key={`inside-${idx}`}
                className="cursor-pointer group"
                onClick={() => setActiveNode({
                  id: `in-${idx}`,
                  title: d,
                  status: 'INSIDE',
                  detail: 'Contracted deliverable guaranteed within base agreement.'
                })}
              >
                <circle cx={posX} cy={posY} r="5" fill="#42B9A8" className="transition-transform group-hover:scale-125" />
                <circle cx={posX} cy={posY} r="9" fill="none" stroke="#42B9A8" strokeWidth="0.75" opacity="0.4" />
                <text x={posX} y={posY + 14} textAnchor="middle" fill="#777887" fontSize="7.5" fontWeight="500">
                  {d.slice(0, 14)}..
                </text>
              </g>
            );
          })}

          {/* Edge Nodes (Clarifications) */}
          {edgeChanges.length > 0 ? (
            edgeChanges.map((ec, idx) => {
              const posX = 300 + 88 * Math.cos((idx * Math.PI) / 2 + 0.5);
              const posY = 160 + 88 * Math.sin((idx * Math.PI) / 2 + 0.5);
              return (
                <g
                  key={`edge-${idx}`}
                  className="cursor-pointer group"
                  onClick={() => setActiveNode({
                    id: ec.id,
                    title: ec.requestedItem,
                    status: 'EDGE',
                    detail: ec.reason,
                    evidence: ec.contractEvidence
                  })}
                >
                  <line x1="300" y1="160" x2={posX} y2={posY} stroke="#FBBF24" strokeWidth="1" strokeDasharray="2 2" />
                  <circle cx={posX} cy={posY} r="6" fill="#FBBF24" className="transition-transform group-hover:scale-125" />
                  <text x={posX} y={posY - 10} textAnchor="middle" fill="#B45309" fontSize="8" fontWeight="600">
                    Clarify
                  </text>
                </g>
              );
            })
          ) : (
            <circle cx="380" cy="120" r="4" fill="#FBBF24" opacity="0.6" />
          )}

          {/* Outside Nodes (Out-of-Scope Items with Topological Vector Vectors) */}
          {outsideChanges.map((oc, idx) => {
            const angles = [-0.6, 0.7, 2.3, 3.8];
            const angle = angles[idx % angles.length];
            const radius = 135;
            const posX = 300 + radius * Math.cos(angle);
            const posY = 160 + radius * Math.sin(angle);

            return (
              <g
                key={`outside-${idx}`}
                className="cursor-pointer group"
                onClick={() => setActiveNode({
                  id: oc.id,
                  title: oc.requestedItem,
                  status: 'OUTSIDE',
                  detail: oc.reason,
                  hours: oc.userAdjustedHours,
                  evidence: oc.contractEvidence
                })}
              >
                {/* Connecting Vector line from central boundary to out-of-scope breach */}
                <line
                  x1="300"
                  y1="160"
                  x2={posX}
                  y2={posY}
                  stroke="#7255E8"
                  strokeWidth="1.25"
                  strokeDasharray="4 2"
                  opacity="0.8"
                />
                
                {/* Out of scope node */}
                <circle cx={posX} cy={posY} r="7" fill="#7255E8" className="transition-transform group-hover:scale-125" />
                <circle cx={posX} cy={posY} r="12" fill="none" stroke="#7255E8" strokeWidth="0.8" opacity="0.3" className="animate-pulse" />
                
                {/* Pill label */}
                <rect
                  x={posX - 40}
                  y={posY + 10}
                  width="80"
                  height="16"
                  rx="4"
                  fill="#FFFFFF"
                  stroke="#E9E7E2"
                />
                <text x={posX} y={posY + 21} textAnchor="middle" fill="#7255E8" fontSize="8" fontWeight="700">
                  +{oc.userAdjustedHours}h Delta
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover/Click Inspector Overlay */}
        {activeNode && (
          <div className="absolute bottom-2 left-2 right-2 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md border border-[#E9E7E2] rounded-xl p-3 shadow-lg text-xs z-10 animate-in fade-in">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#E9E7E2]">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                activeNode.status === 'INSIDE' ? 'bg-emerald-50 text-emerald-700' :
                activeNode.status === 'EDGE' ? 'bg-amber-50 text-amber-700' :
                'bg-[#F0EDFF] text-[#7255E8]'
              }`}>
                {activeNode.status === 'INSIDE' ? 'Included in Base Scope' : activeNode.status === 'EDGE' ? 'Threshold: Clarify' : 'Breach: Additional Scope'}
              </span>
              <button onClick={() => setActiveNode(null)} className="text-[#777887] hover:text-[#171A2B] text-xs">✕</button>
            </div>
            <p className="font-bold text-[#171A2B] text-xs line-clamp-1">{activeNode.title}</p>
            <p className="text-[11px] text-[#777887] mt-0.5 leading-snug">{activeNode.detail}</p>
            {activeNode.hours && (
              <p className="text-[10px] font-mono text-[#7255E8] font-semibold mt-1">
                Estimated Effort: {activeNode.hours} billable hours
              </p>
            )}
          </div>
        )}
      </div>

      {/* Map Footer Summary Metrics */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#E9E7E2] text-xs">
        <div className="p-2.5 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2]/70 text-center">
          <span className="text-[10px] font-mono text-[#777887] uppercase block">Base Contract Items</span>
          <span className="text-sm font-bold text-[#171A2B]">{project.includedDeliverables.length} Deliverables</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2]/70 text-center">
          <span className="text-[10px] font-mono text-[#777887] uppercase block">Threshold Inquiries</span>
          <span className="text-sm font-bold text-amber-700">{edgeChanges.length} Edge Cases</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2]/70 text-center">
          <span className="text-[10px] font-mono text-[#777887] uppercase block">Scope Breaches</span>
          <span className="text-sm font-bold text-[#7255E8]">+{outsideChanges.length} Additions ({analysis?.totalAdjustedHours || 0} hrs)</span>
        </div>
      </div>

    </div>
  );
};
