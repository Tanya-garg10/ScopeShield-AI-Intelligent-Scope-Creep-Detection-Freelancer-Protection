import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Copy, 
  Check, 
  RefreshCw, 
  Edit3, 
  FileText, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Info,
  Clock,
  ArrowUpRight,
  Send,
  Sliders,
  CheckCheck,
  CornerDownRight
} from 'lucide-react';
import { ProjectScope, ScopeAnalysis, ScopeChangeItem, OllamaConfig, ChangeProposal } from '../types';
import { DEMO_CLIENT_MESSAGE } from '../services/demoData';
import { runScopeCreepComparison, generateChangeRequestCopy } from '../services/ollama';
import { ScopeMap } from './ScopeMap';
import { useToast } from './Toast';

interface ScopeCreepDetectorProps {
  projects: ProjectScope[];
  selectedProjectId?: string;
  onSaveAnalysis: (analysis: ScopeAnalysis) => void;
  onGenerateProposal?: (proposal: Partial<ChangeProposal>) => void;
  isDemoMode: boolean;
  ollamaConfig: OllamaConfig;
  onOpenSettings: () => void;
}

export const ScopeCreepDetector: React.FC<ScopeCreepDetectorProps> = ({
  projects,
  selectedProjectId,
  onSaveAnalysis,
  onGenerateProposal,
  isDemoMode,
  ollamaConfig,
  onOpenSettings
}) => {
  const toast = useToast();

  const [activeProjectId, setActiveProjectId] = useState<string>(
    selectedProjectId || projects[0]?.id || ''
  );

  useEffect(() => {
    if (selectedProjectId) {
      setActiveProjectId(selectedProjectId);
    }
  }, [selectedProjectId]);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const [clientMessage, setClientMessage] = useState<string>(DEMO_CLIENT_MESSAGE);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);

  const [currentAnalysis, setCurrentAnalysis] = useState<ScopeAnalysis | null>(() => {
    if (activeProject) {
      return runScopeCreepComparison(
        activeProject, 
        DEMO_CLIENT_MESSAGE, 
        ollamaConfig.isConnected ? ollamaConfig.model : 'Deterministic AI Engine (Sample Mode)', 
        isDemoMode
      );
    }
    return null;
  });

  // Client Response Studio state
  const [selectedTone, setSelectedTone] = useState<'professional' | 'friendly' | 'formal'>('professional');
  const [isEditingResponse, setIsEditingResponse] = useState<boolean>(false);
  const [customResponseText, setCustomResponseText] = useState<string>('');

  const analysisSteps = [
    'Reading original agreement clauses...',
    'Extracting request requirements from client message...',
    'Matching deliverables against contract boundaries...',
    'Evaluating scope differences & timeline impact...',
    'Preparing verified intelligence report...'
  ];

  // Presets
  const samplePrompts = [
    {
      label: 'Add Checkout + 3 Extra Pages (Out of Scope)',
      text: 'The website looks good. Could you also add Razorpay checkout, three additional pages, and another round of revisions before Friday? We assumed these were included.'
    },
    {
      label: 'Minor Styling & Typo Polish (In Scope)',
      text: 'Could you please adjust the primary button color to dark navy and correct the spelling of "Services" in the navigation bar? Thanks!'
    },
    {
      label: 'Unplanned Rush Deadline (Needs Clarification)',
      text: 'Our launch party got moved up. Can we deploy everything by tomorrow afternoon instead of next month?'
    }
  ];

  // Run Animated Analysis Sequence
  const handleAnalyze = () => {
    if (!activeProject || !clientMessage.trim()) {
      toast.warning('Input required', 'Please select a project and enter a client request.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(0);

    const stepInterval = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev < analysisSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 280);

    setTimeout(() => {
      clearInterval(stepInterval);
      const result = runScopeCreepComparison(
        activeProject, 
        clientMessage, 
        ollamaConfig.isConnected ? ollamaConfig.model : 'ScopeShield Deterministic AI Engine (Sample Mode)', 
        isDemoMode
      );
      setCurrentAnalysis(result);
      setCustomResponseText(result.generatedResponseText);
      onSaveAnalysis(result);
      setIsAnalyzing(false);

      if (result.overallClassification === 'OUT_OF_SCOPE') {
        toast.warning('Scope Creep Identified', `Flagged items outside the baseline of ${activeProject.name}`);
      } else if (result.overallClassification === 'NEEDS_CLARIFICATION') {
        toast.info('Clarification Required', 'Uncertain specifications detected; clarify with client.');
      } else {
        toast.success('In Scope', 'Request is covered under existing contract deliverables.');
      }
    }, 1500);
  };

  // Adjust item hours
  const handleHoursChange = (changeId: string, hours: number) => {
    if (!currentAnalysis || !activeProject) return;
    const safeHours = Math.max(0, hours);

    const updatedChanges = currentAnalysis.changes.map(item => {
      if (item.id === changeId) {
        return { ...item, userAdjustedHours: safeHours };
      }
      return item;
    });

    const totalAdjustedHours = updatedChanges.reduce(
      (acc, c) => acc + (c.userApproved ? c.userAdjustedHours : 0),
      0
    );
    const totalCost = totalAdjustedHours * activeProject.hourlyRate;

    const updatedAnalysis: ScopeAnalysis = {
      ...currentAnalysis,
      changes: updatedChanges,
      totalAdjustedHours,
      totalCost
    };

    const newCopy = generateChangeRequestCopy(activeProject, updatedAnalysis, selectedTone);
    updatedAnalysis.generatedResponseText = newCopy;
    setCustomResponseText(newCopy);

    setCurrentAnalysis(updatedAnalysis);
    onSaveAnalysis(updatedAnalysis);
  };

  // Toggle item approval
  const handleToggleApprove = (changeId: string) => {
    if (!currentAnalysis || !activeProject) return;

    const updatedChanges = currentAnalysis.changes.map(item => {
      if (item.id === changeId) {
        return { ...item, userApproved: !item.userApproved };
      }
      return item;
    });

    const totalAdjustedHours = updatedChanges.reduce(
      (acc, c) => acc + (c.userApproved ? c.userAdjustedHours : 0),
      0
    );
    const totalCost = totalAdjustedHours * activeProject.hourlyRate;

    const updatedAnalysis: ScopeAnalysis = {
      ...currentAnalysis,
      changes: updatedChanges,
      totalAdjustedHours,
      totalCost
    };

    const newCopy = generateChangeRequestCopy(activeProject, updatedAnalysis, selectedTone);
    updatedAnalysis.generatedResponseText = newCopy;
    setCustomResponseText(newCopy);

    setCurrentAnalysis(updatedAnalysis);
    onSaveAnalysis(updatedAnalysis);
  };

  // Tone Change
  const handleToneChange = (tone: 'professional' | 'friendly' | 'formal') => {
    setSelectedTone(tone);
    if (!activeProject || !currentAnalysis) return;
    const newCopy = generateChangeRequestCopy(activeProject, currentAnalysis, tone);
    setCustomResponseText(newCopy);
    setCurrentAnalysis({
      ...currentAnalysis,
      tone,
      generatedResponseText: newCopy
    });
  };

  // Copy response
  const handleCopyResponse = () => {
    const textToCopy = isEditingResponse ? customResponseText : (currentAnalysis?.generatedResponseText || customResponseText);
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    toast.success('Response Copied', 'Paste directly into your client communication.');
  };

  // Create Change Request from analysis
  const handleCreateProposalFromAnalysis = () => {
    if (!activeProject || !currentAnalysis) return;
    
    if (onGenerateProposal) {
      onGenerateProposal({
        projectId: activeProject.id,
        projectName: activeProject.name,
        clientName: activeProject.clientName,
        title: `Scope Addendum: ${currentAnalysis.changes[0]?.requestedItem || 'Additional Deliverables'}`,
        originalReference: currentAnalysis.evidenceOriginalScope?.[0] || 'Base contract deliverables & exclusions',
        additionalWork: currentAnalysis.changes.map(c => c.requestedItem).join('; '),
        reasonForChange: currentAnalysis.aiExplanation || 'Additional requirements requested during review.',
        estimatedHours: currentAnalysis.totalAdjustedHours,
        hourlyRate: activeProject.hourlyRate,
        additionalCost: currentAnalysis.totalCost,
        currency: activeProject.currency,
        revisedDeadline: '',
        status: 'Draft'
      });
      toast.success('Proposal Draft Prepared', 'Transferred analysis into Change Request Studio.');
    }
  };

  if (!activeProject) {
    return (
      <div className="p-16 text-center bg-white border border-[#E9E7E2] rounded-2xl">
        <Radar className="w-10 h-10 text-[#777887] mx-auto mb-2 opacity-50" />
        <h3 className="font-bold text-sm text-[#171A2B]">No project selected</h3>
        <p className="text-xs text-[#777887] mt-1">Please create or select a project first to analyze incoming requests.</p>
      </div>
    );
  }

  const overallClass = currentAnalysis?.overallClassification || 'OUT_OF_SCOPE';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. EDITORIAL PAGE HEADING */}
      <div className="pb-4 border-b border-[#E9E7E2] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7255E8]" />
            <span className="eyebrow text-[#171A2B]">SCOPE INTELLIGENCE WORKSPACE</span>
          </div>
          <h1 className="editorial-title text-3xl sm:text-4xl font-extrabold text-[#171A2B] tracking-tight">
            Every request has a boundary.
          </h1>
          <p className="text-xs sm:text-sm text-[#777887] mt-1 font-normal">
            Compare what was promised with what is being requested.
          </p>
        </div>

        {/* Project Selector pill */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#777887]">Agreement:</span>
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#E9E7E2] rounded-xl text-[#171A2B] focus:outline-none focus:border-[#7255E8]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.clientName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. IMMERSIVE SPLIT-SCREEN ANALYSIS WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ================= LEFT SIDE — ORIGINAL AGREEMENT (6 cols) ================= */}
        <div className="lg:col-span-6 bg-white border border-[#E9E7E2] rounded-2xl p-6 shadow-[0_2px_12px_rgba(23,26,43,0.02)] flex flex-col justify-between space-y-5">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E7E2]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#42B9A8]" />
                <span className="eyebrow text-[#171A2B]">ORIGINAL SIGNED AGREEMENT</span>
              </div>
              <span className="text-[10px] font-mono text-[#777887]">LOCKED DOCUMENT</span>
            </div>

            <div>
              <h3 className="font-display font-bold text-base text-[#171A2B]">{activeProject.name}</h3>
              <p className="text-xs text-[#777887] mt-0.5">Party: {activeProject.clientName}</p>
            </div>

            {/* Included Deliverables Section */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#42B9A8] block">
                Section 1: Contracted Deliverables ({activeProject.includedDeliverables.length})
              </span>
              <div className="space-y-1.5 bg-[#F8F7F4] p-3 rounded-xl border border-[#E9E7E2]">
                {activeProject.includedDeliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#171A2B]">
                    <span className="text-[#42B9A8] font-bold">✓</span>
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Excluded Section */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#7255E8] block">
                Section 2: Explicit Exclusions ({activeProject.excludedDeliverables.length})
              </span>
              <div className="space-y-1.5 bg-[#F8F7F4] p-3 rounded-xl border border-[#E9E7E2]">
                {activeProject.excludedDeliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#171A2B]">
                    <span className="text-[#7255E8] font-bold">✕</span>
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms Summary */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-2.5 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] text-xs">
                <span className="text-[10px] font-mono text-[#777887] uppercase block">Revision Cap</span>
                <span className="font-bold text-[#171A2B] font-mono mt-0.5 block">
                  {activeProject.revisionsUsed}/{activeProject.revisionLimit || 2} rounds used
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] text-xs">
                <span className="text-[10px] font-mono text-[#777887] uppercase block">Scope Addition Rate</span>
                <span className="font-bold text-[#171A2B] font-mono mt-0.5 block">
                  {activeProject.currency}{activeProject.hourlyRate}/hr
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E9E7E2] text-[11px] text-[#777887] font-mono flex items-center justify-between">
            <span>Base Value: {activeProject.currency}{activeProject.budget.toLocaleString()}</span>
            <span>Target: {activeProject.deadline || 'Flexible'}</span>
          </div>

        </div>

        {/* ================= RIGHT SIDE — NEW REQUEST (6 cols) ================= */}
        <div className="lg:col-span-6 bg-white border border-[#E9E7E2] rounded-2xl p-6 shadow-[0_2px_12px_rgba(23,26,43,0.02)] flex flex-col justify-between space-y-5">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E7E2]">
              <div className="flex items-center gap-2">
                <Radar className="w-4 h-4 text-[#7255E8]" />
                <span className="eyebrow text-[#171A2B]">INCOMING CLIENT REQUEST</span>
              </div>
              <span className="text-[10px] font-mono text-[#777887]">LIVE INPUT</span>
            </div>

            {/* Quick Test Presets */}
            <div>
              <span className="text-[10px] font-mono uppercase text-[#777887] block mb-1.5">
                Load Test Inquiry Preset
              </span>
              <div className="flex flex-col gap-1.5">
                {samplePrompts.map((sp, idx) => (
                  <button
                    key={idx}
                    onClick={() => setClientMessage(sp.text)}
                    className="text-left text-xs p-2 rounded-xl bg-[#F8F7F4] hover:bg-[#F0EDFF] hover:text-[#7255E8] border border-[#E9E7E2] transition-colors"
                  >
                    <span className="font-semibold block text-[11px]">{sp.label}</span>
                    <span className="text-[10px] text-[#777887] line-clamp-1 mt-0.5">"{sp.text}"</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Editor */}
            <div>
              <label className="block text-xs font-bold text-[#171A2B] mb-1.5">
                Paste Client Message (Email, WhatsApp, or Slack)
              </label>
              <textarea
                rows={6}
                value={clientMessage}
                onChange={(e) => setClientMessage(e.target.value)}
                placeholder="Paste latest client communication here..."
                className="w-full p-3.5 text-xs bg-[#F8F7F4] border border-[#E9E7E2] rounded-xl text-[#171A2B] focus:outline-none focus:border-[#7255E8] focus:bg-white transition-all leading-relaxed resize-none font-sans"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-[#E9E7E2]">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !clientMessage.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#171A2B] hover:bg-[#7255E8] text-white text-xs font-bold shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Contract Boundaries...</span>
                </>
              ) : (
                <>
                  <Radar className="w-4 h-4" />
                  <span>Analyze Request Boundary</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* 3. ANIMATED ANALYSIS SEQUENCE (Visual Stepper during analysis) */}
      {isAnalyzing && (
        <div className="p-6 bg-white border border-[#E9E7E2] rounded-2xl shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-[#7255E8]">DETERMINISTIC EVALUATION SEQUENCE</span>
            <span className="text-[10px] font-mono text-[#777887]">STEP {analysisStep + 1} OF {analysisSteps.length}</span>
          </div>

          <div className="space-y-2">
            {analysisSteps.map((stepText, idx) => {
              const isPast = analysisStep > idx;
              const isCurrent = analysisStep === idx;
              return (
                <div 
                  key={idx}
                  className={`flex items-center gap-3 p-2.5 rounded-xl text-xs font-mono transition-all ${
                    isCurrent 
                      ? 'bg-[#F0EDFF] text-[#7255E8] font-bold border border-[#7255E8]/30' 
                      : isPast 
                      ? 'text-[#42B9A8] opacity-80' 
                      : 'text-[#777887] opacity-40'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                    isCurrent ? 'bg-[#7255E8] text-white animate-pulse' : isPast ? 'bg-[#42B9A8] text-white' : 'border border-[#E9E7E2]'
                  }`}>
                    {isPast ? '✓' : idx + 1}
                  </span>
                  <span>{stepText}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. RESULT EXPERIENCE: PREMIUM INTELLIGENCE REPORT */}
      {!isAnalyzing && currentAnalysis && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="bg-white border border-[#E9E7E2] rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(23,26,43,0.02)] space-y-6">
            
            {/* Header: Large Editorial Classification */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E9E7E2]">
              <div>
                <span className="eyebrow block mb-1">INTELLIGENCE CLASSIFICATION</span>
                <div className="flex items-center gap-3">
                  {overallClass === 'IN_SCOPE' && (
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-[#42B9A8]" />
                      <span>IN SCOPE</span>
                    </span>
                  )}

                  {overallClass === 'NEEDS_CLARIFICATION' && (
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>NEEDS CLARIFICATION</span>
                    </span>
                  )}

                  {overallClass === 'OUT_OF_SCOPE' && (
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-extrabold bg-[#F0EDFF] text-[#7255E8] border border-[#7255E8]/30">
                      <AlertCircle className="w-4 h-4 text-[#7255E8]" />
                      <span>OUT OF SCOPE</span>
                    </span>
                  )}

                  <span className="text-xs text-[#777887] font-mono">
                    Deterministic Scope Match • 100% Contract Clause Grounded
                  </span>
                </div>
              </div>

              {overallClass === 'OUT_OF_SCOPE' && (
                <div className="text-left sm:text-right">
                  <span className="text-lg font-bold text-[#171A2B] font-mono">
                    +{activeProject.currency}{currentAnalysis.totalCost.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-[#777887] font-mono">
                    Estimated Delta: +{currentAnalysis.totalAdjustedHours} billable hours
                  </p>
                </div>
              )}
            </div>

            {/* AI Explanation & Objective Basis */}
            <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] space-y-1">
              <span className="eyebrow block">OBJECTIVE EXPLANATION</span>
              <p className="text-xs text-[#171A2B] leading-relaxed">
                {currentAnalysis.aiExplanation}
              </p>
            </div>

            {/* Visual Evidence Comparison Matrix (Connecting lines & clauses) */}
            <div className="space-y-3">
              <span className="eyebrow block">
                EVIDENCE MATRIX: CONTRACT CLAUSES VS INCOMING REQUIREMENTS
              </span>

              <div className="space-y-2.5">
                {currentAnalysis.changes.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E9E7E2] text-xs space-y-3 hover:border-[#7255E8]/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.userApproved}
                            onChange={() => handleToggleApprove(item.id)}
                            className="rounded text-[#7255E8] focus:ring-[#7255E8]"
                          />
                          <span className="font-bold text-[#171A2B] text-sm">{item.requestedItem}</span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            item.classification === 'OUT_OF_SCOPE' ? 'bg-[#F0EDFF] text-[#7255E8]' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {item.classification}
                          </span>
                        </div>

                        <p className="text-[#777887] leading-relaxed">{item.reason}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-[#777887]">Effort:</span>
                        <input
                          type="number"
                          min={0}
                          value={item.userAdjustedHours}
                          onChange={(e) => handleHoursChange(item.id, parseInt(e.target.value, 10) || 0)}
                          className="w-14 px-2 py-1 text-xs bg-[#F8F7F4] border border-[#E9E7E2] rounded-lg text-center font-bold text-[#171A2B] font-mono"
                        />
                        <span className="text-[11px] font-mono text-[#777887]">hrs</span>
                      </div>
                    </div>

                    {/* Connecting Evidence Footnote */}
                    {item.contractEvidence && (
                      <div className="pt-2 border-t border-[#E9E7E2] flex items-start gap-2 text-[11px] text-[#7255E8] font-mono">
                        <CornerDownRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Contract Evidence: "{item.contractEvidence}"</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Information / Boundary Caveats */}
            {currentAnalysis.missingInformation && currentAnalysis.missingInformation.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Boundary Ambiguities & Missing Client Details</span>
                </span>
                <ul className="list-disc list-inside text-[11px] space-y-0.5 pt-0.5">
                  {currentAnalysis.missingInformation.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Next Step */}
            {currentAnalysis.suggestedAction && (
              <div className="p-4 rounded-xl bg-[#F0EDFF] border border-[#7255E8]/20 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#7255E8] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="eyebrow text-[#7255E8]">RECOMMENDED STRATEGIC ACTION</span>
                  <p className="text-xs text-[#171A2B] leading-relaxed font-medium">
                    {currentAnalysis.suggestedAction}
                  </p>
                </div>
              </div>
            )}

            {/* Transition Action to Change Request Studio */}
            {overallClass === 'OUT_OF_SCOPE' && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleCreateProposalFromAnalysis}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#171A2B] hover:bg-[#7255E8] text-white text-xs font-bold shadow-xs transition-all active:scale-[0.99]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Draft Formal Change Request Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

          {/* Integrated Scope Map */}
          <ScopeMap project={activeProject} analysis={currentAnalysis} />

          {/* ================= 5. CLIENT RESPONSE STUDIO ================= */}
          <div className="bg-white border border-[#E9E7E2] rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(23,26,43,0.02)] space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E9E7E2]">
              <div>
                <span className="eyebrow">CLIENT RESPONSE STUDIO</span>
                <h3 className="editorial-title text-xl font-bold text-[#171A2B] mt-0.5">Say it professionally.</h3>
                <p className="text-xs text-[#777887]">Contextual response generated from contract clauses. Never dispatched automatically.</p>
              </div>

              {/* Tone Selector: Friendly / Professional / Firm but polite */}
              <div className="flex items-center gap-1 bg-[#F8F7F4] p-1 rounded-xl border border-[#E9E7E2]">
                {[
                  { id: 'friendly', label: 'Friendly' },
                  { id: 'professional', label: 'Professional' },
                  { id: 'formal', label: 'Firm but polite' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleToneChange(t.id as any)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      selectedTone === t.id
                        ? 'bg-white text-[#7255E8] shadow-xs'
                        : 'text-[#777887] hover:text-[#171A2B]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Response Canvas */}
            <div>
              {isEditingResponse ? (
                <textarea
                  rows={10}
                  value={customResponseText}
                  onChange={(e) => setCustomResponseText(e.target.value)}
                  className="w-full p-4 text-xs font-mono bg-[#F8F7F4] border border-[#E9E7E2] rounded-xl text-[#171A2B] focus:outline-none focus:border-[#7255E8] leading-relaxed resize-none"
                />
              ) : (
                <div className="p-5 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] text-xs text-[#171A2B] whitespace-pre-line leading-relaxed font-sans max-h-96 overflow-y-auto">
                  {customResponseText || currentAnalysis.generatedResponseText}
                </div>
              )}
            </div>

            {/* Actions: Copy response / Regenerate / Edit */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingResponse(!isEditingResponse)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E9E7E2] bg-white hover:bg-[#F8F7F4] text-xs font-semibold text-[#171A2B] transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#777887]" />
                  <span>{isEditingResponse ? 'Done Editing' : 'Edit Response'}</span>
                </button>

                <button
                  onClick={() => handleToneChange(selectedTone)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E9E7E2] bg-white hover:bg-[#F8F7F4] text-xs font-semibold text-[#777887] hover:text-[#171A2B] transition-colors"
                  title="Regenerate from contract clauses"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>

              <button
                onClick={handleCopyResponse}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#171A2B] hover:bg-[#7255E8] text-white text-xs font-bold transition-all shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Response</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
