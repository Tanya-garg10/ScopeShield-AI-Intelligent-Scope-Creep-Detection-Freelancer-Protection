import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
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
  FileText,
  ChevronRight,
  ExternalLink,
  Save
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
  const [isEditing, setIsEditing] = useState<boolean>(!!initialProposalDraft);

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

  // Selected Proposal for Preview
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
    setIsEditing(false);
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
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!title.trim() || !additionalWork.trim()) {
      toast.error('Required fields missing', 'Please enter a proposal title and describe the additional work.');
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
    setIsEditing(false);
    setIsCreatingNew(false);
    toast.success('Proposal Saved', `Change Request ${proposalToSave.id} has been recorded.`);
  };

  // Copy Proposal as Formatted Text
  const handleCopyProposal = () => {
    const p = isEditing ? {
      id: proposalId,
      projectName: activeProject?.name || 'Project',
      clientName: activeProject?.clientName || 'Client',
      title,
      originalReference,
      additionalWork,
      reasonForChange,
      estimatedHours,
      hourlyRate,
      additionalCost,
      currency: activeProject?.currency || '₹',
      revisedDeadline,
      status
    } : selectedProposal;

    if (!p) return;

    const copyText = `
CHANGE REQUEST ADDENDUM (${p.id})
========================================
Project: ${p.projectName}
Client: ${p.clientName}
Date: ${new Date().toLocaleDateString()}
Status: ${p.status}

1. ORIGINAL REFERENCE:
${p.originalReference}

2. ADDITIONAL WORK SPECIFICATION:
${p.additionalWork}

3. REASON FOR CHANGE:
${p.reasonForChange}

4. FINANCIAL & RESOURCE ESTIMATE:
- Additional Hours: ${p.estimatedHours} hrs
- Agreed Rate: ${p.currency}${p.hourlyRate}/hr
- Total Additional Fee: ${p.currency}${p.additionalCost.toLocaleString()}

5. TIMELINE IMPACT:
${p.revisedDeadline ? `Revised Target Date: ${p.revisedDeadline}` : 'No deadline adjustment requested.'}

========================================
ScopeShield AI • Freelancer Scope Protection
`;

    navigator.clipboard.writeText(copyText.trim());
    toast.success('Proposal Copied to Clipboard', 'Ready to paste into an email or client document.');
  };

  // Download PDF / Print
  const handlePrintPdf = () => {
    window.print();
    toast.info('Opening Print Dialog', 'Select "Save as PDF" to export the document.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ECEAF0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17213A] tracking-tight">Change Requests</h1>
          <p className="text-xs text-[#85899A] mt-0.5">
            Polished, document-grade proposals and addendums for out-of-scope client work.
          </p>
        </div>

        <button
          onClick={handleStartNewProposal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6946D8] hover:bg-[#5b3bc2] text-white text-xs font-semibold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Proposal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: List of Proposals (4 cols) */}
        <div className="lg:col-span-4 space-y-3 no-print">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-[#85899A] uppercase tracking-wider">
              Change Proposals ({proposals.length})
            </span>
          </div>

          <div className="space-y-2">
            {proposals.map((prop) => {
              const isSelected = !isCreatingNew && selectedProposalId === prop.id;
              return (
                <div
                  key={prop.id}
                  onClick={() => handleSelectProposal(prop)}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-[#6946D8] shadow-xs'
                      : 'bg-white border-[#ECEAF0] hover:border-[#6946D8]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17213A] text-xs font-mono">{prop.id}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      prop.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                      prop.status === 'Sent' ? 'bg-blue-50 text-blue-700' :
                      prop.status === 'Declined' ? 'bg-rose-50 text-rose-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {prop.status}
                    </span>
                  </div>

                  <p className="font-semibold text-[#17213A] mt-1 line-clamp-1">{prop.title}</p>
                  <p className="text-[11px] text-[#85899A] line-clamp-1">{prop.projectName}</p>

                  <div className="mt-2.5 pt-2 border-t border-[#ECEAF0] flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#17213A]">
                      {prop.currency}{prop.additionalCost.toLocaleString()}
                    </span>
                    <span className="text-[#85899A]">{prop.estimatedHours} hrs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Document-Like Proposal Editor & Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Actions toolbar */}
          <div className="flex items-center justify-between bg-white border border-[#ECEAF0] rounded-2xl p-3 shadow-xs no-print">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  isEditing
                    ? 'bg-[#F0EBFF] text-[#6946D8] border-[#6946D8]/30'
                    : 'bg-white text-[#17213A] border-[#ECEAF0] hover:bg-[#FAF9F6]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'View Preview' : 'Edit Proposal'}</span>
              </button>

              <button
                onClick={handleCopyProposal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#ECEAF0] bg-white hover:bg-[#FAF9F6] text-[#17213A] transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-[#85899A]" />
                <span>Copy Proposal</span>
              </button>

              <button
                onClick={handlePrintPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#ECEAF0] bg-white hover:bg-[#FAF9F6] text-[#17213A] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#85899A]" />
                <span>Download PDF</span>
              </button>
            </div>

            {selectedProposal && !isCreatingNew && (
              <button
                onClick={() => {
                  onDeleteProposal(selectedProposal.id);
                  toast.info('Proposal Deleted', `Removed ${selectedProposal.id}`);
                }}
                className="p-1.5 text-[#85899A] hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                title="Delete Proposal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* EDIT MODE FORM */}
          {isEditing ? (
            <div className="bg-white border border-[#ECEAF0] rounded-2xl p-6 shadow-xs space-y-4 animate-in fade-in no-print">
              <div className="flex items-center justify-between pb-3 border-b border-[#ECEAF0]">
                <div>
                  <h3 className="text-sm font-bold text-[#17213A]">
                    {isCreatingNew ? 'Create Change Request' : `Edit ${proposalId}`}
                  </h3>
                  <p className="text-[11px] text-[#85899A]">Define scope additions with verifiable numbers.</p>
                </div>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#6946D8] hover:bg-[#5b3bc2] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Proposal</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#17213A] mb-1">Select Project</label>
                  <select
                    value={projectId}
                    onChange={(e) => {
                      setProjectId(e.target.value);
                      const p = projects.find(proj => proj.id === e.target.value);
                      if (p) setHourlyRate(p.hourlyRate);
                    }}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8]"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.clientName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#17213A] mb-1">Proposal ID</label>
                  <input
                    type="text"
                    value={proposalId}
                    onChange={(e) => setProposalId(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#17213A] mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Payment Gateway Integration & Extra Landing Pages"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#17213A] mb-1">Original Project Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. Contract Section 2: Excluded Work & Deliverable Limits"
                    value={originalReference}
                    onChange={(e) => setOriginalReference(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#17213A] mb-1">Additional Requested Work</label>
                  <textarea
                    rows={3}
                    placeholder="Describe specific items requested by client (e.g. Razorpay payment integration, 3 extra pages)..."
                    value={additionalWork}
                    onChange={(e) => setAdditionalWork(e.target.value)}
                    className="w-full p-3 bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8] resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#17213A] mb-1">Reason for Change</label>
                  <textarea
                    rows={2}
                    placeholder="Why this constitutes additional work (e.g. Client requested direct checkout functionality)..."
                    value={reasonForChange}
                    onChange={(e) => setReasonForChange(e.target.value)}
                    className="w-full p-3 bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8] resize-none"
                  />
                </div>

                {/* User Input: Hours, Rate, Cost */}
                <div>
                  <label className="block font-semibold text-[#17213A] mb-1">Estimated Additional Hours</label>
                  <input
                    type="number"
                    value={estimatedHours}
                    onChange={(e) => {
                      const hrs = Number(e.target.value);
                      setEstimatedHours(hrs);
                      setAdditionalCost(hrs * hourlyRate);
                    }}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#17213A] mb-1">
                    Additional Cost ({activeProject?.currency || '₹'})
                  </label>
                  <input
                    type="number"
                    value={additionalCost}
                    onChange={(e) => setAdditionalCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] font-bold text-[#17213A] focus:outline-none focus:border-[#6946D8]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#17213A] mb-1">
                    Revised Deadline <span className="text-[#85899A] font-normal">(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={revisedDeadline}
                    onChange={(e) => setRevisedDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#17213A] mb-1">Approval Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8]"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent to Client</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              </div>
            </div>
          ) : null}

          {/* DOCUMENT PREVIEW CARD (Clean Stripe / Linear Style Addendum) */}
          <div className="bg-white border border-[#ECEAF0] rounded-2xl p-8 sm:p-10 shadow-[0_4px_20px_rgba(23,33,58,0.04)] space-y-8 print:p-0 print:border-none print:shadow-none">
            
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#ECEAF0]">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#6946D8] text-white flex items-center justify-center font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm tracking-tight text-[#17213A]">ScopeShield AI</span>
                </div>
                <h2 className="text-xl font-bold text-[#17213A] mt-3">Change Request Order</h2>
                <p className="text-xs text-[#85899A] mt-0.5">Formal Scope & Fee Addendum</p>
              </div>

              <div className="text-left sm:text-right text-xs space-y-1">
                <div className="inline-block px-2.5 py-1 rounded-md bg-[#FAF9F6] border border-[#ECEAF0] font-mono text-[11px] font-bold text-[#17213A]">
                  ID: {selectedProposal?.id || proposalId}
                </div>
                <p className="text-[11px] text-[#85899A]">
                  Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                    (selectedProposal?.status || status) === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                    (selectedProposal?.status || status) === 'Sent' ? 'bg-blue-50 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    Status: {selectedProposal?.status || status}
                  </span>
                </div>
              </div>
            </div>

            {/* Project & Client reference block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0]">
                <span className="text-[10px] font-bold text-[#85899A] uppercase tracking-wider block">Project Reference</span>
                <p className="font-bold text-[#17213A] mt-1">{selectedProposal?.projectName || activeProject?.name}</p>
                <p className="text-[11px] text-[#85899A] mt-0.5">
                  Ref: {selectedProposal?.originalReference || originalReference}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0]">
                <span className="text-[10px] font-bold text-[#85899A] uppercase tracking-wider block">Client / Party</span>
                <p className="font-bold text-[#17213A] mt-1">{selectedProposal?.clientName || activeProject?.clientName || 'Direct Client'}</p>
                <p className="text-[11px] text-[#85899A] mt-0.5">Authorized Client Contact</p>
              </div>
            </div>

            {/* Description & Work Breakdown */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#85899A] uppercase tracking-wider block">
                  Proposal Subject
                </span>
                <p className="text-sm font-bold text-[#17213A] mt-1">
                  {selectedProposal?.title || title}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#85899A] uppercase tracking-wider block">
                  Detailed Scope Specification
                </span>
                <div className="mt-1.5 p-4 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] text-[#17213A] leading-relaxed whitespace-pre-line">
                  {selectedProposal?.additionalWork || additionalWork || 'No specific deliverables entered.'}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#85899A] uppercase tracking-wider block">
                  Justification & Reason for Modification
                </span>
                <p className="mt-1 text-[#17213A] leading-relaxed">
                  {selectedProposal?.reasonForChange || reasonForChange || 'Contractual boundary exceeded.'}
                </p>
              </div>
            </div>

            {/* Cost Breakdown Table */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#85899A] uppercase tracking-wider block">
                Resource & Fee Breakdown
              </span>

              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#ECEAF0] text-[11px] font-semibold text-[#85899A]">
                    <th className="py-2.5">Item Description</th>
                    <th className="py-2.5 text-center">Allocated Hours</th>
                    <th className="py-2.5 text-right">Agreed Rate</th>
                    <th className="py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECEAF0]">
                  <tr>
                    <td className="py-3 font-medium text-[#17213A]">
                      {selectedProposal?.title || title}
                    </td>
                    <td className="py-3 text-center text-[#17213A]">
                      {selectedProposal?.estimatedHours || estimatedHours} hrs
                    </td>
                    <td className="py-3 text-right text-[#85899A]">
                      {selectedProposal?.currency || activeProject?.currency}{selectedProposal?.hourlyRate || hourlyRate}/hr
                    </td>
                    <td className="py-3 text-right font-bold text-[#17213A]">
                      {selectedProposal?.currency || activeProject?.currency}{(selectedProposal?.additionalCost || additionalCost).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#17213A] font-bold text-xs text-[#17213A]">
                    <td colSpan={3} className="py-3 text-right">Total Additional Investment:</td>
                    <td className="py-3 text-right text-sm text-[#6946D8]">
                      {selectedProposal?.currency || activeProject?.currency}{(selectedProposal?.additionalCost || additionalCost).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Timeline Impact */}
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#6946D8]" />
                <span className="font-semibold text-[#17213A]">Delivery Milestone Adjustment:</span>
              </div>
              <span className="font-bold text-[#17213A]">
                {(selectedProposal?.revisedDeadline || revisedDeadline) ? (selectedProposal?.revisedDeadline || revisedDeadline) : 'Calculated Upon Client Approval (+3 to 5 business days)'}
              </span>
            </div>

            {/* Authorization Sign-off block */}
            <div className="pt-6 border-t border-[#ECEAF0] grid grid-cols-2 gap-8 text-[11px] text-[#85899A]">
              <div>
                <p className="font-semibold text-[#17213A]">Prepared & Submitted By:</p>
                <div className="h-10 border-b border-[#ECEAF0] mt-2" />
                <p className="mt-1">Freelance Contractor (Tanya Garg)</p>
              </div>

              <div>
                <p className="font-semibold text-[#17213A]">Client Approval & Signoff:</p>
                <div className="h-10 border-b border-[#ECEAF0] mt-2" />
                <p className="mt-1">Authorized Signature / Written Email Confirmation</p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
