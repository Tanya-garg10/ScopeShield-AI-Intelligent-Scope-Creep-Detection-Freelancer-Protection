import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Copy, 
  Download, 
  Edit3, 
  Trash2, 
  Check, 
  Printer, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  Calendar, 
  Save, 
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ProjectScope, ChangeProposal } from '../types';
import { useToast } from './Toast';

interface ChangeRequestBuilderProps {
  projects: ProjectScope[];
  proposals: ChangeProposal[];
  onSaveProposal: (proposal: ChangeProposal) => void;
  onDeleteProposal: (id: string) => void;
  initialProposalDraft?: Partial<ChangeProposal>;
}

export const ChangeRequestBuilder: React.FC<ChangeRequestBuilderProps> = ({
  projects,
  proposals,
  onSaveProposal,
  onDeleteProposal,
  initialProposalDraft
}) => {
  const toast = useToast();

  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(!!initialProposalDraft);
  const [selectedProposalId, setSelectedProposalId] = useState<string>(
    initialProposalDraft?.id || proposals[0]?.id || ''
  );

  // Editor form state
  const [projectId, setProjectId] = useState<string>(
    initialProposalDraft?.projectId || projects[0]?.id || ''
  );
  const activeProject = projects.find(p => p.id === projectId) || projects[0];

  const [proposalId, setProposalId] = useState<string>(
    initialProposalDraft?.id || `CR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [title, setTitle] = useState<string>(
    initialProposalDraft?.title || 'Scope Addendum: Additional Deliverables'
  );
  const [originalReference, setOriginalReference] = useState<string>(
    initialProposalDraft?.originalReference || 'Contract Section 2: Deliverables & Exclusions'
  );
  const [additionalWork, setAdditionalWork] = useState<string>(
    initialProposalDraft?.additionalWork || ''
  );
  const [reasonForChange, setReasonForChange] = useState<string>(
    initialProposalDraft?.reasonForChange || 'Client requested additions beyond the baseline scope.'
  );
  const [estimatedHours, setEstimatedHours] = useState<number>(
    initialProposalDraft?.estimatedHours || 10
  );
  const [hourlyRate, setHourlyRate] = useState<number>(
    initialProposalDraft?.hourlyRate || activeProject?.hourlyRate || 1000
  );
  const [additionalCost, setAdditionalCost] = useState<number>(
    initialProposalDraft?.additionalCost !== undefined 
      ? initialProposalDraft.additionalCost 
      : (estimatedHours * (hourlyRate || 1000))
  );
  const [revisedDeadline, setRevisedDeadline] = useState<string>(
    initialProposalDraft?.revisedDeadline || ''
  );
  const [status, setStatus] = useState<'Draft' | 'Sent' | 'Approved' | 'Declined'>(
    initialProposalDraft?.status || 'Draft'
  );

  const selectedProposal = proposals.find(p => p.id === selectedProposalId) || proposals[0];

  const handleSelectProposal = (prop: ChangeProposal) => {
    setSelectedProposalId(prop.id);
    setProjectId(prop.projectId);
    setProposalId(prop.id);
    setTitle(prop.title);
    setOriginalReference(prop.originalReference);
    setAdditionalWork(prop.additionalWork);
    setReasonForChange(prop.reasonForChange);
    setEstimatedHours(prop.estimatedHours);
    setHourlyRate(prop.hourlyRate);
    setAdditionalCost(prop.additionalCost);
    setRevisedDeadline(prop.revisedDeadline || '');
    setStatus(prop.status);
    setIsCreatingNew(false);
  };

  const handleStartNewProposal = () => {
    const newId = `CR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    setProposalId(newId);
    setTitle('Scope Addendum: Additional Deliverables');
    setOriginalReference(activeProject ? `Project Agreement: ${activeProject.name}` : '');
    setAdditionalWork('');
    setReasonForChange('');
    setEstimatedHours(0);
    setHourlyRate(activeProject?.hourlyRate || 1000);
    setAdditionalCost(0);
    setRevisedDeadline('');
    setStatus('Draft');
    setIsCreatingNew(true);
  };

  const handleSave = () => {
    if (!title.trim() || !additionalWork.trim()) {
      toast.error('Required fields missing', 'Please enter a proposal title and additional work description.');
      return;
    }

    const proposalToSave: ChangeProposal = {
      id: proposalId,
      projectId: activeProject?.id || projectId,
      projectName: activeProject?.name || 'Project Scope',
      clientName: activeProject?.clientName || 'Client',
      title: title.trim(),
      originalReference: originalReference.trim(),
      additionalWork: additionalWork.trim(),
      reasonForChange: reasonForChange.trim(),
      estimatedHours: Number(estimatedHours) || 0,
      hourlyRate: Number(hourlyRate) || 0,
      additionalCost: Number(additionalCost) || 0,
      currency: activeProject?.currency || '₹',
      revisedDeadline: revisedDeadline.trim() || undefined,
      status,
      createdAt: selectedProposal?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveProposal(proposalToSave);
    setSelectedProposalId(proposalToSave.id);
    setIsCreatingNew(false);
    toast.success('Proposal Saved', `Change Request ${proposalToSave.id} has been saved.`);
  };

  const handleCopyProposal = () => {
    const copyText = `
CHANGE REQUEST ADDENDUM (${proposalId})
========================================
Project: ${activeProject?.name || 'Project'}
Client: ${activeProject?.clientName || 'Client'}
Date: ${new Date().toLocaleDateString()}
Status: ${status}

1. ORIGINAL REFERENCE:
${originalReference}

2. ADDITIONAL WORK SPECIFICATION:
${additionalWork}

3. REASON FOR CHANGE:
${reasonForChange}

4. FINANCIAL & RESOURCE ESTIMATE:
- Additional Hours: ${estimatedHours} hrs
- Agreed Rate: ${activeProject?.currency || '₹'}${hourlyRate}/hr
- Total Additional Fee: ${activeProject?.currency || '₹'}${additionalCost.toLocaleString()}

5. TIMELINE IMPACT:
${revisedDeadline ? `Revised Target Date: ${revisedDeadline}` : 'No deadline adjustment requested.'}

========================================
ScopeShield AI • Freelancer Scope Protection
`;

    navigator.clipboard.writeText(copyText.trim());
    toast.success('Proposal Copied', 'Ready to paste into an email or client document.');
  };

  const handlePrintPdf = () => {
    window.print();
    toast.info('Opening Print Dialog', 'Select "Save as PDF" to export the formatted document.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E9E7E2]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7255E8]" />
            <span className="eyebrow text-[#171A2B]">CHANGE REQUEST STUDIO</span>
          </div>
          <h1 className="editorial-title text-3xl sm:text-4xl font-extrabold text-[#171A2B] tracking-tight">
            Document Design Studio.
          </h1>
          <p className="text-xs sm:text-sm text-[#777887] mt-1 font-normal">
            Generate formal, verifiable scope change orders and price addendums.
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handleStartNewProposal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#171A2B] hover:bg-[#7255E8] text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Addendum</span>
          </button>
        </div>
      </div>

      {/* Existing Proposals Selector Rail (Quick horizontal pills) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-print">
        <span className="eyebrow shrink-0 mr-1">EXISTING ADDENDUMS:</span>
        {proposals.map(p => (
          <button
            key={p.id}
            onClick={() => handleSelectProposal(p)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono shrink-0 transition-all ${
              selectedProposalId === p.id && !isCreatingNew
                ? 'bg-white border-[#7255E8] text-[#7255E8] font-bold shadow-xs'
                : 'bg-white border-[#E9E7E2] text-[#777887] hover:text-[#171A2B]'
            }`}
          >
            {p.id} • {p.projectName.slice(0, 16)}..
          </button>
        ))}
      </div>

      {/* TWO-COLUMN INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT: EDITABLE PROPOSAL INFORMATION (5 cols) ================= */}
        <div className="lg:col-span-5 bg-white border border-[#E9E7E2] rounded-2xl p-6 shadow-[0_2px_12px_rgba(23,26,43,0.02)] space-y-4 no-print">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#E9E7E2]">
            <span className="eyebrow">EDITABLE SPECIFICATION</span>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#171A2B] hover:bg-[#7255E8] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Addendum</span>
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            
            {/* Project Selection */}
            <div>
              <label className="block font-semibold text-[#171A2B] mb-1">Project Agreement</label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  const p = projects.find(proj => proj.id === e.target.value);
                  if (p) {
                    setHourlyRate(p.hourlyRate);
                    setAdditionalCost(estimatedHours * p.hourlyRate);
                  }
                }}
                className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#E9E7E2] rounded-xl text-[#171A2B] focus:outline-none focus:border-[#7255E8]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.clientName})
                  </option>
                ))}
              </select>
            </div>

            {/* Proposal ID & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#171A2B] mb-1">Proposal ID</label>
                <input
                  type="text"
                  value={proposalId}
                  onChange={(e) => setProposalId(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-xs bg-[#F8F7F4] border border-[#E9E7E2] rounded-xl text-[#171A2B] focus:outline-none focus:border-[#7255E8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#171A2B] mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#F8F7F4] border border-[#E9E7E2] rounded-xl text-[#171A2B] focus:outline-none focus:border-[#7255E8]"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent to Client</option>
                  <option value="Approved">Approved</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block font-semibold text-[#171A2B] mb-1">Subject / Title</label>
              <input
                type="text"
                placeholder="e.g. Payment Gateway Integration & Extra Landing Pages"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#E9E7E2] rounded-xl text-[#171A2B] focus:outline-none focus:border-[#7255E8]"
              />
            </div>

            {/* Original Project Reference */}
            <div>
              <label className="block font-semibold text-[#171A2B] mb-1">Original Agreement Reference</label>
              <input
                type="text"
                placeholder="e.g. Section 2: Excluded Work (Payment Gateway) & 5-Page Cap"
                value={originalReference}
                onChange={(e) => setOriginalReference(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#E9E7E2] rounded-xl text-[#171A2B] focus:outline-none focus:border-[#7255E8]"
              />
            </div>

            {/* Additional Deliverables */}
            <div>
              <label className="block font-semibold text-[#171A2B] mb-1">Additional Requested Deliverables</label>
              <textarea
                rows={3}
                placeholder="List the exact new deliverables requested by the client..."
                value={additionalWork}
                onChange={(e) => setAdditionalWork(e.target.value)}
                className="w-full p-3 bg-[#F8F7F4] border border-[#E9E7E2] rounded-xl text-[#171A2B] focus:outline-none focus:border-[#7255E8] resize-none"
              />
            </div>

            {/* Reason for Change */}
            <div>
              <label className="block font-semibold text-[#171A2B] mb-1">Reason for Change Order</label>
              <textarea
                rows={2}
                placeholder="Why this constitutes additional work outside original baseline..."
                value={reasonForChange}
                onChange={(e) => setReasonForChange(e.target.value)}
                className="w-full p-3 bg-[#F8F7F4] border border-[#E9E7E2] rounded-xl text-[#171A2B] focus:outline-none focus:border-[#7255E8] resize-none"
              />
            </div>

            {/* User Input: Hours & Additional Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#171A2B] mb-1">Estimated Hours</label>
                <input
                  type="number"
                  min={0}
                  value={estimatedHours}
                  onChange={(e) => {
                    const hrs = Number(e.target.value);
                    setEstimatedHours(hrs);
                    setAdditionalCost(hrs * hourlyRate);
                  }}
                  className="w-full px-3 py-2 font-mono text-xs bg-[#F8F7F4] border border-[#E9E7E2] rounded-xl text-[#171A2B] focus:outline-none focus:border-[#7255E8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#171A2B] mb-1">
                  Additional Price ({activeProject?.currency || '₹'})
                </label>
                <input
                  type="number"
                  min={0}
                  value={additionalCost}
                  onChange={(e) => setAdditionalCost(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono font-bold text-xs bg-[#F8F7F4] border border-[#E9E7E2] rounded-xl text-[#171A2B] focus:outline-none focus:border-[#7255E8]"
                />
              </div>
            </div>

            {/* Revised Deadline */}
            <div>
              <label className="block font-semibold text-[#171A2B] mb-1">
                Revised Deadline <span className="text-[#777887] font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={revisedDeadline}
                onChange={(e) => setRevisedDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8F7F4] border border-[#E9E7E2] rounded-xl text-[#171A2B] focus:outline-none focus:border-[#7255E8]"
              />
            </div>

          </div>

          <div className="pt-3 border-t border-[#E9E7E2] flex items-center justify-between">
            <button
              onClick={handleCopyProposal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9E7E2] bg-white hover:bg-[#F8F7F4] text-xs font-semibold text-[#171A2B]"
            >
              <Copy className="w-3.5 h-3.5 text-[#777887]" />
              <span>Copy Text</span>
            </button>

            <button
              onClick={handlePrintPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9E7E2] bg-white hover:bg-[#F8F7F4] text-xs font-semibold text-[#171A2B]"
            >
              <Download className="w-3.5 h-3.5 text-[#777887]" />
              <span>Export PDF</span>
            </button>
          </div>

        </div>

        {/* ================= RIGHT: LIVE PROPOSAL PREVIEW (7 cols) ================= */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E9E7E2] rounded-2xl p-8 sm:p-10 shadow-[0_4px_24px_rgba(23,26,43,0.03)] space-y-8 print:p-0 print:border-none print:shadow-none">
          
          {/* Header of Business Document */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#171A2B]">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#171A2B] text-white flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#42B9A8]" />
                </div>
                <span className="font-display font-bold text-xs tracking-tight text-[#171A2B]">ScopeShield Verified Addendum</span>
              </div>
              <h2 className="editorial-title text-2xl font-bold text-[#171A2B] mt-3">CHANGE ORDER ADDENDUM</h2>
              <p className="text-[11px] text-[#777887] font-mono mt-0.5">CONTRACT MODIFICATION DOCUMENT</p>
            </div>

            <div className="text-left sm:text-right text-xs font-mono space-y-1">
              <span className="inline-block px-2 py-0.5 rounded bg-[#F8F7F4] border border-[#E9E7E2] font-bold text-[#171A2B]">
                {proposalId}
              </span>
              <p className="text-[10px] text-[#777887]">
                Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  status === 'Approved' ? 'bg-emerald-50 text-emerald-800' :
                  status === 'Sent' ? 'bg-blue-50 text-blue-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  Status: {status}
                </span>
              </div>
            </div>
          </div>

          {/* Reference Block */}
          <div className="grid grid-cols-2 gap-6 text-xs font-mono">
            <div>
              <span className="eyebrow block mb-1">PARTY A — CONTRACTOR</span>
              <p className="font-bold text-[#171A2B]">Tanya Garg</p>
              <p className="text-[#777887] text-[11px]">Independent Software Consultant</p>
            </div>

            <div>
              <span className="eyebrow block mb-1">PARTY B — CLIENT</span>
              <p className="font-bold text-[#171A2B]">{activeProject?.clientName || 'Client'}</p>
              <p className="text-[#777887] text-[11px]">Project: {activeProject?.name}</p>
            </div>
          </div>

          {/* Scope Subject & Reference */}
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2]">
              <span className="eyebrow block mb-1">1. ORIGINAL MASTER AGREEMENT REFERENCE</span>
              <p className="font-mono text-[#171A2B] text-[11px] leading-relaxed">
                {originalReference || 'Master Services Agreement & Baseline Contract Deliverables'}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="eyebrow block">2. SPECIFICATION OF REQUESTED MODIFICATIONS</span>
              <p className="font-bold text-[#171A2B] text-sm">{title}</p>
              <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] text-[#171A2B] leading-relaxed whitespace-pre-line text-xs font-sans">
                {additionalWork || 'No specific deliverables entered.'}
              </div>
            </div>

            <div className="space-y-1">
              <span className="eyebrow block">3. REASON & CONTRACTUAL GROUNDING</span>
              <p className="text-[#777887] text-xs leading-relaxed">
                {reasonForChange || 'Requested functionality expands beyond the baseline scope.'}
              </p>
            </div>
          </div>

          {/* Resource & Cost Breakdown Table */}
          <div className="space-y-2">
            <span className="eyebrow block">4. FINANCIAL & RESOURCE ALLOCATION</span>
            
            <table className="w-full text-xs text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-[#171A2B] text-[10px] text-[#777887]">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Allocated Hours</th>
                  <th className="py-2 text-right">Agreed Rate</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E7E2]">
                <tr>
                  <td className="py-3 font-sans font-semibold text-[#171A2B]">
                    {title}
                  </td>
                  <td className="py-3 text-center text-[#171A2B]">
                    {estimatedHours} hrs
                  </td>
                  <td className="py-3 text-right text-[#777887]">
                    {activeProject?.currency || '₹'}{hourlyRate}/hr
                  </td>
                  <td className="py-3 text-right font-bold text-[#171A2B]">
                    {activeProject?.currency || '₹'}{additionalCost.toLocaleString()}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#171A2B] font-bold text-xs text-[#171A2B]">
                  <td colSpan={3} className="py-3 text-right font-sans">Total Additional Investment:</td>
                  <td className="py-3 text-right text-sm text-[#7255E8]">
                    {activeProject?.currency || '₹'}{additionalCost.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Timeline Impact */}
          <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] flex items-center justify-between text-xs font-mono">
            <span className="text-[#777887]">5. DELIVERY MILESTONE SCHEDULE:</span>
            <span className="font-bold text-[#171A2B]">
              {revisedDeadline ? `Revised Target: ${revisedDeadline}` : 'No deadline adjustment requested'}
            </span>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-[#E9E7E2] grid grid-cols-2 gap-8 text-[11px] text-[#777887] font-mono">
            <div>
              <p className="font-bold text-[#171A2B]">Contractor Authorization:</p>
              <div className="h-10 border-b border-[#E9E7E2] mt-2" />
              <p className="mt-1">Tanya Garg (Consultant)</p>
            </div>

            <div>
              <p className="font-bold text-[#171A2B]">Client Signoff / Acceptance:</p>
              <div className="h-10 border-b border-[#E9E7E2] mt-2" />
              <p className="mt-1">{activeProject?.clientName || 'Authorized Signatory'}</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
