import React, { useState, useEffect } from 'react';
import { 
  ScanSearch, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Copy, 
  Check, 
  RefreshCw, 
  Edit3, 
  FileSpreadsheet, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Info,
  Sliders,
  DollarSign,
  AlertCircle,
  FileText
} from 'lucide-react';
import { ProjectScope, ScopeAnalysis, ScopeChangeItem, OllamaConfig, ChangeProposal } from '../types';
import { DEMO_CLIENT_MESSAGE } from '../services/demoData';
import { runScopeCreepComparison, generateChangeRequestCopy } from '../services/ollama';
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
  const [currentAnalysis, setCurrentAnalysis] = useState<ScopeAnalysis | null>(() => {
    if (activeProject) {
      return runScopeCreepComparison(
        activeProject, 
        DEMO_CLIENT_MESSAGE, 
        ollamaConfig.isConnected ? ollamaConfig.model : 'ScopeShield Deterministic AI Engine (Demo Mode)', 
        isDemoMode
      );
    }
    return null;
  });

  // Response Generator state
  const [selectedTone, setSelectedTone] = useState<'professional' | 'friendly' | 'formal'>('professional');
  const [isEditingResponse, setIsEditingResponse] = useState<boolean>(false);
  const [customResponseText, setCustomResponseText] = useState<string>('');

  // Sample quick scenarios for quick testing
  const samplePrompts = [
    {
      label: 'Add Checkout + 3 Pages',
      text: 'The website looks good. Could you also add Razorpay checkout, three additional pages, and another round of revisions before Friday? We assumed these were included.'
    },
    {
      label: 'Minor Button Color Tweak',
      text: 'Could you please change the primary button color from purple to dark navy and fix the typo in the contact page subtitle? Thanks!'
    },
    {
      label: 'Rush Delivery Inquiry',
      text: 'Can we launch the entire project by tomorrow afternoon instead of next month? We have an investor meeting.'
    }
  ];

  // Execute Analysis
  const handleAnalyze = () => {
    if (!activeProject || !clientMessage.trim()) {
      toast.warning('Input required', 'Select a project and enter the client message.');
      return;
    }

    setIsAnalyzing(true);
    setIsEditingResponse(false);

    setTimeout(() => {
      const result = runScopeCreepComparison(
        activeProject, 
        clientMessage, 
        ollamaConfig.isConnected ? ollamaConfig.model : 'ScopeShield AI Engine (Sample Mode)', 
        isDemoMode
      );
      setCurrentAnalysis(result);
      setCustomResponseText(result.generatedResponseText);
      onSaveAnalysis(result);
      setIsAnalyzing(false);

      if (result.overallClassification === 'OUT_OF_SCOPE') {
        toast.warning('Scope Creep Detected', 'Flagged out-of-scope items exceeding the baseline agreement.');
      } else if (result.overallClassification === 'NEEDS_CLARIFICATION') {
        toast.info('Clarification Needed', 'Found ambiguous specifications requiring confirmation.');
      } else {
        toast.success('In Scope', 'Request is covered under existing contract deliverables.');
      }
    }, isDemoMode ? 350 : 700);
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
    toast.success('Reply Copied to Clipboard', 'Paste it directly into your client communication.');
  };

  // Create Change Request from analysis
  const handleCreateProposalFromAnalysis = () => {
    if (!activeProject || !currentAnalysis) return;
    
    if (onGenerateProposal) {
      onGenerateProposal({
        projectId: activeProject.id,
        projectName: activeProject.name,
        clientName: activeProject.clientName,
        title: `Addendum: Scope additions for ${activeProject.name}`,
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
      toast.success('Proposal Created', 'Transferred analysis into Change Request Builder.');
    }
  };

  if (!activeProject) {
    return (
      <div className="p-12 text-center bg-white border border-[#ECEAF0] rounded-2xl">
        <h3 className="text-sm font-bold text-[#17213A]">No project selected</h3>
        <p className="text-xs text-[#85899A] mt-1">Please create or select a project first to analyze incoming requests.</p>
      </div>
    );
  }

  const overallClass = currentAnalysis?.overallClassification || 'OUT_OF_SCOPE';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="pb-3 border-b border-[#ECEAF0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17213A] tracking-tight">Scope Analyzer</h1>
          <p className="text-xs text-[#85899A] mt-0.5">
            Know whether a new request belongs to the original agreement.
          </p>
        </div>

        {/* Demo mode badge */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-[#ECEAF0] text-[#85899A]">
            Engine: <strong className="text-[#17213A] font-semibold">{ollamaConfig.isConnected ? ollamaConfig.model : 'Verified Heuristics (Sample Mode)'}</strong>
          </span>
        </div>
      </div>

      {/* TWO PANEL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT PANEL (5 cols) ================= */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="bg-white border border-[#ECEAF0] rounded-2xl p-5 shadow-[0_2px_10px_rgba(23,33,58,0.03)] space-y-4">
            
            {/* 1. Select Project */}
            <div>
              <label className="block text-xs font-bold text-[#17213A] mb-1.5">
                Select Active Agreement
              </label>
              <select
                value={activeProjectId}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] font-medium focus:outline-none focus:border-[#6946D8] focus:bg-white transition-all"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.clientName})
                  </option>
                ))}
              </select>

              {/* Quick Project Scope Chips */}
              <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px]">
                <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] border border-[#ECEAF0] text-[#17213A] font-medium">
                  {activeProject.currency}{activeProject.budget.toLocaleString()} base
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] border border-[#ECEAF0] text-[#17213A] font-medium">
                  {activeProject.currency}{activeProject.hourlyRate}/hr addition rate
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] border border-[#ECEAF0] text-[#17213A] font-medium">
                  {activeProject.revisionsUsed}/{activeProject.revisionLimit || 2} revs used
                </span>
              </div>
            </div>

            {/* Quick Test Prompt Pills */}
            <div>
              <span className="text-[10px] font-semibold text-[#85899A] uppercase tracking-wider block mb-1.5">
                Quick Test Prompts
              </span>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((sp, idx) => (
                  <button
                    key={idx}
                    onClick={() => setClientMessage(sp.text)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[#FAF9F6] hover:bg-[#F0EBFF] text-[#17213A] hover:text-[#6946D8] border border-[#ECEAF0] transition-colors font-medium text-left"
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Paste New Client Request */}
            <div>
              <label className="block text-xs font-bold text-[#17213A] mb-1.5">
                Client Request or Email Message
              </label>
              <textarea
                rows={5}
                placeholder="Paste the message from WhatsApp, Slack, email, or meeting notes..."
                value={clientMessage}
                onChange={(e) => setClientMessage(e.target.value)}
                className="w-full p-3 text-xs bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8] focus:bg-white transition-all resize-none leading-relaxed"
              />
            </div>

            {/* 3. Analyze Request Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !clientMessage.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#6946D8] hover:bg-[#5b3bc2] text-white text-xs font-bold shadow-[0_2px_8px_rgba(105,70,216,0.3)] transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Comparing Against Agreement...</span>
                </>
              ) : (
                <>
                  <ScanSearch className="w-4 h-4" />
                  <span>Analyze Request</span>
                </>
              )}
            </button>

          </div>

          {/* Reference Scope Card (Left bottom context) */}
          <div className="bg-white border border-[#ECEAF0] rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#ECEAF0]">
              <span className="text-xs font-bold text-[#17213A]">Current Agreement Baseline</span>
              <span className="text-[10px] text-[#85899A]">Locked Contract</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-[#85899A] uppercase tracking-wider block">Included Scope ({activeProject.includedDeliverables.length})</span>
                <ul className="mt-1 space-y-1">
                  {activeProject.includedDeliverables.slice(0, 3).map((d, i) => (
                    <li key={i} className="text-[#17213A] text-[11px] flex items-start gap-1.5">
                      <span className="text-[#18A999] font-bold">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                  {activeProject.includedDeliverables.length > 3 && (
                    <li className="text-[10px] text-[#85899A] italic">
                      + {activeProject.includedDeliverables.length - 3} more items in contract
                    </li>
                  )}
                </ul>
              </div>

              <div className="pt-2 border-t border-[#ECEAF0]">
                <span className="text-[10px] font-semibold text-[#85899A] uppercase tracking-wider block">Excluded Work ({activeProject.excludedDeliverables.length})</span>
                <ul className="mt-1 space-y-1">
                  {activeProject.excludedDeliverables.slice(0, 3).map((e, i) => (
                    <li key={i} className="text-[#17213A] text-[11px] flex items-start gap-1.5">
                      <span className="text-[#6946D8] font-bold">•</span>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT PANEL (7 cols) ================= */}
        <div className="lg:col-span-7 space-y-5">
          
          {isAnalyzing ? (
            /* Skeleton Loading State */
            <div className="bg-white border border-[#ECEAF0] rounded-2xl p-8 shadow-xs space-y-5 animate-pulse">
              <div className="h-6 bg-[#FAF9F6] rounded-md w-1/3" />
              <div className="h-16 bg-[#FAF9F6] rounded-xl w-full" />
              <div className="h-28 bg-[#FAF9F6] rounded-xl w-full" />
              <div className="h-36 bg-[#FAF9F6] rounded-xl w-full" />
            </div>
          ) : currentAnalysis ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              {/* Report Header Card */}
              <div className="bg-white border border-[#ECEAF0] rounded-2xl p-5 shadow-[0_2px_12px_rgba(23,33,58,0.03)] space-y-4">
                
                {/* 1. Classification Indicator */}
                <div className="flex items-center justify-between pb-3 border-b border-[#ECEAF0]">
                  <div>
                    <span className="text-[10px] font-semibold text-[#85899A] uppercase tracking-wider">Analysis Result</span>
                    <div className="flex items-center gap-2 mt-1">
                      {overallClass === 'IN_SCOPE' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-[#18A999]" />
                          <span>IN SCOPE</span>
                        </span>
                      )}

                      {overallClass === 'NEEDS_CLARIFICATION' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span>NEEDS CLARIFICATION</span>
                        </span>
                      )}

                      {overallClass === 'OUT_OF_SCOPE' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#F0EBFF] text-[#6946D8] border border-[#6946D8]/30">
                          <AlertCircle className="w-4 h-4 text-[#6946D8]" />
                          <span>OUT OF SCOPE</span>
                        </span>
                      )}

                      <span className="text-xs text-[#85899A] font-medium">
                        {currentAnalysis.changes.length} item(s) detected
                      </span>
                    </div>
                  </div>

                  {overallClass === 'OUT_OF_SCOPE' && (
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#17213A]">
                        {currentAnalysis.currency}{currentAnalysis.totalCost.toLocaleString()}
                      </span>
                      <p className="text-[10px] text-[#85899A]">
                        +{currentAnalysis.totalAdjustedHours} hrs • +{currentAnalysis.suggestedTimelineExtensionDays} days
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. AI Explanation */}
                <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0]">
                  <span className="text-[10px] font-bold text-[#17213A] uppercase tracking-wider block mb-1">
                    AI Explanation & Objective Basis
                  </span>
                  <p className="text-xs text-[#17213A] leading-relaxed">
                    {currentAnalysis.aiExplanation}
                  </p>
                </div>

                {/* 3. Matching Original Scope Evidence & Excerpts */}
                {currentAnalysis.evidenceOriginalScope && currentAnalysis.evidenceOriginalScope.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#85899A] uppercase tracking-wider block">
                      Contract Evidence & Excerpts
                    </span>
                    <div className="space-y-1.5">
                      {currentAnalysis.evidenceOriginalScope.map((ev, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white border border-[#ECEAF0] text-xs flex items-start gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#6946D8] shrink-0 mt-0.5" />
                          <span className="text-[#17213A] font-medium leading-relaxed">{ev}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Missing Information / Boundary Flags */}
                {currentAnalysis.missingInformation && currentAnalysis.missingInformation.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Missing Information & Caveats</span>
                    </span>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5 pt-0.5">
                      {currentAnalysis.missingInformation.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 5. Suggested Next Action */}
                {currentAnalysis.suggestedAction && (
                  <div className="p-3.5 rounded-xl bg-[#F0EBFF]/70 border border-[#6946D8]/20 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#6946D8] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-[#6946D8]">Recommended Strategic Action</span>
                      <p className="text-xs text-[#17213A] mt-0.5 leading-relaxed">{currentAnalysis.suggestedAction}</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Itemized Detected Work & Hour Adjustments (if out of scope) */}
              {currentAnalysis.changes.length > 0 && (
                <div className="bg-white border border-[#ECEAF0] rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#ECEAF0]">
                    <span className="text-xs font-bold text-[#17213A]">Itemized Scope Breakdown</span>
                    <span className="text-[10px] text-[#85899A]">Adjust hours & approval</span>
                  </div>

                  <div className="space-y-2.5">
                    {currentAnalysis.changes.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          item.userApproved 
                            ? 'bg-white border-[#ECEAF0]' 
                            : 'bg-[#FAF9F6] border-[#ECEAF0] opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={item.userApproved}
                              onChange={() => handleToggleApprove(item.id)}
                              className="mt-0.5 rounded text-[#6946D8] focus:ring-[#6946D8]"
                            />
                            <div>
                              <p className="font-bold text-[#17213A]">{item.requestedItem}</p>
                              <p className="text-[11px] text-[#85899A] mt-0.5 leading-relaxed">{item.reason}</p>
                              {item.contractEvidence && (
                                <p className="text-[10px] text-[#6946D8] font-medium mt-1">
                                  Ref: {item.contractEvidence}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-[#85899A] font-medium">Hours:</span>
                            <input
                              type="number"
                              min={0}
                              value={item.userAdjustedHours}
                              onChange={(e) => handleHoursChange(item.id, parseInt(e.target.value, 10) || 0)}
                              className="w-14 px-2 py-1 text-xs bg-[#FAF9F6] border border-[#ECEAF0] rounded-lg text-center font-bold text-[#17213A] focus:outline-none focus:border-[#6946D8]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {overallClass === 'OUT_OF_SCOPE' && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleCreateProposalFromAnalysis}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#FAF9F6] hover:bg-[#F0EBFF] text-[#6946D8] border border-[#6946D8]/20 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Build Change Request Proposal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ================= 6. SMART CLIENT REPLY ================= */}
              <div className="bg-white border border-[#ECEAF0] rounded-2xl p-5 shadow-xs space-y-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-[#ECEAF0]">
                  <div>
                    <h3 className="text-xs font-bold text-[#17213A] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#6946D8]" />
                      <span>Smart Client Reply</span>
                    </h3>
                    <p className="text-[10px] text-[#85899A]">
                      Contextual, transparent draft based on agreement boundaries. Messages are never sent automatically.
                    </p>
                  </div>

                  {/* Tone Options: Friendly | Professional | Firm but polite */}
                  <div className="flex items-center gap-1 bg-[#FAF9F6] p-1 rounded-xl border border-[#ECEAF0]">
                    {[
                      { id: 'friendly', label: 'Friendly' },
                      { id: 'professional', label: 'Professional' },
                      { id: 'formal', label: 'Firm but polite' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleToneChange(t.id as 'friendly' | 'professional' | 'formal')}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                          selectedTone === t.id
                            ? 'bg-white text-[#6946D8] shadow-xs'
                            : 'text-[#85899A] hover:text-[#17213A]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reply Display & In-line Editor */}
                <div>
                  {isEditingResponse ? (
                    <textarea
                      rows={9}
                      value={customResponseText}
                      onChange={(e) => setCustomResponseText(e.target.value)}
                      className="w-full p-3.5 text-xs font-mono bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8] leading-relaxed resize-none"
                    />
                  ) : (
                    <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] text-xs text-[#17213A] whitespace-pre-line leading-relaxed font-sans max-h-80 overflow-y-auto">
                      {customResponseText || currentAnalysis.generatedResponseText}
                    </div>
                  )}
                </div>

                {/* Response Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingResponse(!isEditingResponse)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ECEAF0] bg-white hover:bg-[#FAF9F6] text-xs font-semibold text-[#17213A] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#85899A]" />
                      <span>{isEditingResponse ? 'Done Editing' : 'Edit Response'}</span>
                    </button>

                    <button
                      onClick={() => handleToneChange(selectedTone)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ECEAF0] bg-white hover:bg-[#FAF9F6] text-xs font-semibold text-[#85899A] hover:text-[#17213A] transition-colors"
                      title="Regenerate reply from scope"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Regenerate</span>
                    </button>
                  </div>

                  <button
                    onClick={handleCopyResponse}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6946D8] hover:bg-[#5b3bc2] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Reply</span>
                  </button>
                </div>

              </div>

            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-[#ECEAF0] rounded-2xl shadow-xs">
              <ScanSearch className="w-10 h-10 text-[#85899A] mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-[#17213A]">No request analyzed yet</p>
              <p className="text-[11px] text-[#85899A] mt-1 max-w-xs mx-auto">
                Paste a client message on the left and click "Analyze Request" to compare against contract scope.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
