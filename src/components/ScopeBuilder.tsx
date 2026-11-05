import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  Shield,
  ArrowRight
} from 'lucide-react';
import { ProjectScope, Currency, OllamaConfig } from '../types';
import { extractScopeHeuristics, extractScopeWithOllama } from '../services/ollama';
import { extractBriefWithGemini } from '../services/gemini';
import { useToast } from './Toast';

interface ScopeBuilderProps {
  onSaveProject: (project: ProjectScope) => void;
  onCancel?: () => void;
  initialProject?: ProjectScope;
  isDemoMode: boolean;
  ollamaConfig: OllamaConfig;
  isGeminiConfigured: boolean;
}

export const ScopeBuilder: React.FC<ScopeBuilderProps> = ({
  onSaveProject,
  onCancel,
  initialProject,
  isDemoMode,
  ollamaConfig,
  isGeminiConfigured
}) => {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Project Details
  const [name, setName] = useState<string>(initialProject?.name || '');
  const [clientName, setClientName] = useState<string>(initialProject?.clientName || '');
  const [description, setDescription] = useState<string>(initialProject?.description || '');
  const [currency, setCurrency] = useState<Currency>(initialProject?.currency || '₹');
  const [budget, setBudget] = useState<number | ''>(initialProject?.budget || (initialProject ? 0 : 30000));
  const [hourlyRate, setHourlyRate] = useState<number>(initialProject?.hourlyRate || (currency === '₹' ? 1000 : 75));

  // Step 2: Define Scope
  const [originalBrief, setOriginalBrief] = useState<string>(initialProject?.originalBrief || '');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [missingTerms, setMissingTerms] = useState<string[]>([]);
  const [extractedConditions, setExtractedConditions] = useState<string[]>([]);
  const [extractedRequirements, setExtractedRequirements] = useState<string[]>([]);
  const [projectRequirements, setProjectRequirements] = useState<string[]>(initialProject?.requirements || []);
  const [projectConditions, setProjectConditions] = useState<string[]>(initialProject?.conditions || []);

  const [includedDeliverables, setIncludedDeliverables] = useState<string[]>(
    initialProject?.includedDeliverables || [
      'Up to 5 custom responsive pages (Home, Shop, Product Detail, About Us, Contact)',
      'Responsive design optimized for desktop, tablet, and mobile browsers',
      'Contact form with email dispatch and inquiry validation'
    ]
  );
  const [newDeliverable, setNewDeliverable] = useState<string>('');

  const [excludedDeliverables, setExcludedDeliverables] = useState<string[]>(
    initialProject?.excludedDeliverables || [
      'Payment gateway integration (e.g., Razorpay, Stripe, PayU, bank transfers)',
      'Additional pages beyond the agreed initial 5 pages',
      'Ongoing server maintenance, hosting management, and DNS configuration'
    ]
  );
  const [newExclusion, setNewExclusion] = useState<string>('');

  const [deadline, setDeadline] = useState<string>(initialProject?.deadline || '');
  const [revisionLimit, setRevisionLimit] = useState<number | ''>(
    initialProject?.revisionLimit !== undefined ? initialProject.revisionLimit : 2
  );
  const [revisionsUsed, setRevisionsUsed] = useState<number>(initialProject?.revisionsUsed || 0);

  // AI Extraction Action: Generate Structured Scope from Brief
  const handleGenerateStructuredScope = async () => {
    if (!originalBrief.trim()) {
      toast.warning('Brief is empty', 'Paste your client brief or project email first.');
      return;
    }

    setIsExtracting(true);
    try {
      let extracted;
      if (isGeminiConfigured && !isDemoMode) {
        try {
          extracted = await extractBriefWithGemini(originalBrief);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          toast.warning('Gemini extraction unavailable', `Trying the local AI or verified brief parser. ${message}`);
          if (ollamaConfig.isConnected) {
            try {
              extracted = await extractScopeWithOllama(originalBrief, ollamaConfig);
            } catch (ollamaError: unknown) {
              const ollamaMessage = ollamaError instanceof Error ? ollamaError.message : String(ollamaError);
              toast.warning('Local AI extraction unavailable', `Using verified brief parsing instead. ${ollamaMessage}`);
              extracted = extractScopeHeuristics(originalBrief);
            }
          } else {
            extracted = extractScopeHeuristics(originalBrief);
          }
        }
      } else if (ollamaConfig.isConnected && !isDemoMode) {
        try {
          extracted = await extractScopeWithOllama(originalBrief, ollamaConfig);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          toast.warning('AI extraction unavailable', `Using verified brief parsing instead. ${message}`);
          extracted = extractScopeHeuristics(originalBrief);
        }
      } else {
        extracted = extractScopeHeuristics(originalBrief);
      }

      // Auto-fill extracted values without overwriting what user already typed
      if (!name && extracted.name) setName(extracted.name);
      if (!clientName && extracted.clientName && extracted.clientName !== 'Client (To be confirmed)') {
        setClientName(extracted.clientName);
      }
      if (extracted.currency) setCurrency(extracted.currency);
      if (extracted.budget && extracted.budget > 0) setBudget(extracted.budget);
      if (extracted.hourlyRate && extracted.hourlyRate > 0) setHourlyRate(extracted.hourlyRate);
      if (extracted.deadline) setDeadline(extracted.deadline);
      if (extracted.revisionLimit && extracted.revisionLimit > 0) setRevisionLimit(extracted.revisionLimit);

      if (extracted.includedDeliverables && extracted.includedDeliverables.length > 0) {
        setIncludedDeliverables(extracted.includedDeliverables);
      }
      if (extracted.excludedDeliverables && extracted.excludedDeliverables.length > 0) {
        setExcludedDeliverables(extracted.excludedDeliverables);
      }
      if (extracted.conditions && extracted.conditions.length > 0) {
        setExtractedConditions(extracted.conditions);
        setProjectConditions(extracted.conditions);
      }
      if (extracted.requirements && extracted.requirements.length > 0) {
        setExtractedRequirements(extracted.requirements);
        setProjectRequirements(extracted.requirements);
      }

      setMissingTerms(extracted.missingTerms || []);
      toast.success(
        'Structured Scope Generated',
        `Extracted ${extracted.includedDeliverables?.length || 0} deliverables and ${extracted.excludedDeliverables?.length || 0} boundary exclusions.`
      );
    } finally {
      setIsExtracting(false);
    }
  };

  // Add / Remove Deliverables
  const handleAddDeliverable = () => {
    if (newDeliverable.trim()) {
      setIncludedDeliverables([...includedDeliverables, newDeliverable.trim()]);
      setNewDeliverable('');
    }
  };

  const handleRemoveDeliverable = (idx: number) => {
    setIncludedDeliverables(includedDeliverables.filter((_, i) => i !== idx));
  };

  // Add / Remove Exclusions
  const handleAddExclusion = () => {
    if (newExclusion.trim()) {
      setExcludedDeliverables([...excludedDeliverables, newExclusion.trim()]);
      setNewExclusion('');
    }
  };

  const handleRemoveExclusion = (idx: number) => {
    setExcludedDeliverables(excludedDeliverables.filter((_, i) => i !== idx));
  };

  // Save Project
  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Project Name Required', 'Please enter a name for your project in Step 1.');
      setCurrentStep(1);
      return;
    }

    const finalProject: ProjectScope = {
      id: initialProject?.id || `proj-${Date.now()}`,
      name: name.trim(),
      clientName: clientName.trim() || 'Direct Client',
      description: description.trim(),
      originalBrief: originalBrief.trim(),
      currency,
      budget: typeof budget === 'number' ? budget : 0,
      hourlyRate,
      deadline: deadline.trim(),
      status: initialProject?.status || 'Active',
      includedDeliverables: includedDeliverables.length > 0 ? includedDeliverables : ['Custom project deliverables'],
      excludedDeliverables: excludedDeliverables,
      requirements: projectRequirements,
      conditions: projectConditions,
      revisionLimit: typeof revisionLimit === 'number' ? revisionLimit : 2,
      revisionsUsed,
      paymentMilestones: initialProject?.paymentMilestones || [
        `50% upfront deposit (${currency}${typeof budget === 'number' && budget > 0 ? (budget * 0.5).toLocaleString() : 'TBD'})`,
        `50% upon final delivery & signoff (${currency}${typeof budget === 'number' && budget > 0 ? (budget * 0.5).toLocaleString() : 'TBD'})`
      ],
      createdAt: initialProject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveProject(finalProject);
    toast.success('Project Saved Successfully', `Boundaries for ${finalProject.name} are locked in.`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#ECEAF0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17213A]">
            {initialProject ? 'Edit Project Scope' : 'Create New Project'}
          </h1>
          <p className="text-xs text-[#85899A] mt-0.5">
            Define deliverables, exclusions, and bounds to protect against unpaid scope expansion.
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-[#85899A] hover:text-[#17213A] px-3 py-1.5 rounded-lg border border-[#ECEAF0] hover:bg-[#FAF9F6]"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { step: 1, title: 'Step 1', desc: 'Project Details' },
          { step: 2, title: 'Step 2', desc: 'Define Scope' },
          { step: 3, title: 'Step 3', desc: 'Review & Save' }
        ].map((s) => {
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step;
          return (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step as 1 | 2 | 3)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-white border-[#6946D8] shadow-xs'
                  : isDone
                  ? 'bg-white border-[#18A999]/40'
                  : 'bg-[#FAF9F6] border-[#ECEAF0] opacity-70'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? 'bg-[#6946D8] text-white' : isDone ? 'bg-[#18A999] text-white' : 'bg-[#ECEAF0] text-[#85899A]'
                }`}>
                  {isDone ? <Check className="w-3 h-3" /> : s.step}
                </span>
                <span className="text-[10px] font-semibold text-[#85899A] uppercase tracking-wider">{s.title}</span>
              </div>
              <p className="text-xs font-bold text-[#17213A] mt-1 ml-7">{s.desc}</p>
            </button>
          );
        })}
      </div>

      {/* STEP 1: Project Details */}
      {currentStep === 1 && (
        <div className="bg-white border border-[#ECEAF0] rounded-2xl p-6 shadow-xs space-y-5 animate-in fade-in">
          <div>
            <h2 className="text-sm font-bold text-[#17213A]">Project Information</h2>
            <p className="text-xs text-[#85899A] mt-0.5">Basic agreement identity and financial parameters.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Project Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#17213A] mb-1">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. E-commerce Website Redesign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8] focus:bg-white transition-all"
              />
            </div>

            {/* Client Name (optional) */}
            <div>
              <label className="block text-xs font-semibold text-[#17213A] mb-1">
                Client Name <span className="text-[#85899A] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Modern Goods Ltd."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8] focus:bg-white transition-all"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-semibold text-[#17213A] mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full px-3.5 py-2 text-xs bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8] focus:bg-white transition-all"
              >
                <option value="₹">₹ (INR - Indian Rupee)</option>
                <option value="$">$ (USD - US Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - British Pound)</option>
              </select>
            </div>

            {/* Project Budget */}
            <div>
              <label className="block text-xs font-semibold text-[#17213A] mb-1">
                Project Budget ({currency}) <span className="text-[#85899A] font-normal">(optional)</span>
              </label>
              <input
                type="number"
                placeholder="30000"
                value={budget}
                onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8] focus:bg-white transition-all"
              />
            </div>

            {/* Hourly Rate for Out-of-Scope Additions */}
            <div>
              <label className="block text-xs font-semibold text-[#17213A] mb-1">
                Hourly Rate for Scope Additions ({currency}/hr)
              </label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8] focus:bg-white transition-all"
              />
            </div>

            {/* Project Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#17213A] mb-1">
                Project Description
              </label>
              <textarea
                rows={3}
                placeholder="High-level overview of the contract and goals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8] focus:bg-white transition-all resize-none"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-[#ECEAF0] flex justify-end">
            <button
              onClick={() => {
                if (!name.trim()) {
                  toast.error('Project Name Required', 'Please enter a name for your project.');
                  return;
                }
                setCurrentStep(2);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6946D8] hover:bg-[#5b3bc2] text-white text-xs font-semibold transition-all shadow-xs"
            >
              <span>Continue to Scope</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Define Scope */}
      {currentStep === 2 && (
        <div className="bg-white border border-[#ECEAF0] rounded-2xl p-6 shadow-xs space-y-6 animate-in fade-in">
          
          {/* AI Extraction Section */}
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#F0EBFF] text-[#6946D8] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#17213A]">Original Client Brief (Optional)</span>
                  <p className="text-[10px] text-[#85899A]">
                    {isGeminiConfigured && !isDemoMode
                      ? 'Gemini extracts the agreement terms, deliverables, exclusions, and unclear items.'
                      : 'Paste raw client emails, Slack messages, or RFP text to auto-structure deliverables.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateStructuredScope}
                disabled={isExtracting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6946D8] hover:bg-[#5b3bc2] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isExtracting ? 'Analyzing...' : isGeminiConfigured && !isDemoMode ? 'Extract with Gemini' : 'Generate Structured Scope'}</span>
              </button>
            </div>

            <textarea
              rows={3}
              placeholder="Paste raw agreement or client brief here. For example: 'We need 5 pages for our new shop, delivery by Nov 20. Budget is ₹30,000. Revisions limited to 2 rounds. Exclude payment gateway setup.'"
              value={originalBrief}
              onChange={(e) => setOriginalBrief(e.target.value)}
              className="w-full p-3 text-xs bg-white border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8] transition-all resize-none"
            />

            {/* Missing terms notice if any */}
            {missingTerms.length > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Unspecified in Brief: </span>
                  <span>{missingTerms.join(' • ')}. (Please set below if applicable).</span>
                </div>
              </div>
            )}
            {(extractedRequirements.length > 0 || extractedConditions.length > 0) && (
              <div className="p-2.5 rounded-lg bg-violet-50 border border-violet-200 text-violet-900 text-[11px] space-y-1">
                {extractedRequirements.length > 0 && (
                  <p><span className="font-semibold">Requirements:</span> {extractedRequirements.join(' • ')}</p>
                )}
                {extractedConditions.length > 0 && (
                  <p><span className="font-semibold">Conditions / unclear terms:</span> {extractedConditions.join(' • ')}</p>
                )}
              </div>
            )}
          </div>

          {/* Included Deliverables */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#17213A] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#18A999]" />
                <span>Included Deliverables (What You Will Build)</span>
              </label>
              <span className="text-[10px] text-[#85899A]">{includedDeliverables.length} items</span>
            </div>

            <div className="space-y-1.5">
              {includedDeliverables.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] text-xs">
                  <span className="text-[#17213A] font-medium leading-relaxed">{item}</span>
                  <button
                    onClick={() => handleRemoveDeliverable(idx)}
                    className="text-[#85899A] hover:text-rose-500 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add deliverable input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add another deliverable (e.g. Up to 5 custom responsive pages)..."
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDeliverable()}
                className="flex-1 px-3 py-2 text-xs bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8] focus:bg-white"
              />
              <button
                onClick={handleAddDeliverable}
                className="px-3.5 py-2 bg-white border border-[#ECEAF0] hover:bg-[#FAF9F6] text-[#17213A] text-xs font-semibold rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Excluded Deliverables */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#17213A] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6946D8]" />
                <span>Exclusions & Boundaries (Explicitly Out of Scope)</span>
              </label>
              <span className="text-[10px] text-[#85899A]">{excludedDeliverables.length} items</span>
            </div>

            <div className="space-y-1.5">
              {excludedDeliverables.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] text-xs">
                  <span className="text-[#17213A] font-medium leading-relaxed">{item}</span>
                  <button
                    onClick={() => handleRemoveExclusion(idx)}
                    className="text-[#85899A] hover:text-rose-500 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add exclusion input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add an exclusion (e.g. Payment gateway integration, additional pages beyond 5)..."
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddExclusion()}
                className="flex-1 px-3 py-2 text-xs bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8] focus:bg-white"
              />
              <button
                onClick={handleAddExclusion}
                className="px-3.5 py-2 bg-white border border-[#ECEAF0] hover:bg-[#FAF9F6] text-[#17213A] text-xs font-semibold rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Deadlines and Revision Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#ECEAF0]">
            <div>
              <label className="block text-xs font-semibold text-[#17213A] mb-1">
                Project Deadline <span className="text-[#85899A] font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17213A] mb-1">
                Revision Limit (Rounds) <span className="text-[#85899A] font-normal">(optional)</span>
              </label>
              <input
                type="number"
                placeholder="2"
                value={revisionLimit}
                onChange={(e) => setRevisionLimit(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] focus:outline-none focus:border-[#6946D8] focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#ECEAF0] flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#ECEAF0] bg-white hover:bg-[#FAF9F6] text-[#17213A] text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6946D8] hover:bg-[#5b3bc2] text-white text-xs font-semibold transition-all shadow-xs"
            >
              <span>Review Agreement</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Save */}
      {currentStep === 3 && (
        <div className="bg-white border border-[#ECEAF0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          
          <div className="border-b border-[#ECEAF0] pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#6946D8] uppercase tracking-wider">Formal Scope Summary</span>
              <h2 className="text-lg font-bold text-[#17213A] mt-0.5">{name || 'Untitled Project'}</h2>
              <p className="text-xs text-[#85899A]">Client: {clientName || 'Direct Client'}</p>
            </div>
            
            <div className="text-right">
              <span className="text-xs font-bold text-[#17213A]">
                {typeof budget === 'number' && budget > 0 ? `${currency}${budget.toLocaleString()}` : 'Custom Scope'}
              </span>
              <p className="text-[10px] text-[#85899A]">{currency}{hourlyRate}/hr scope addition rate</p>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div>
              <span className="text-[10px] font-semibold text-[#85899A] uppercase tracking-wider">Overview</span>
              <p className="text-xs text-[#17213A] mt-1 leading-relaxed">{description}</p>
            </div>
          )}

          {/* Deliverables summary */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold text-[#85899A] uppercase tracking-wider">Included Deliverables ({includedDeliverables.length})</span>
            <div className="bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl p-3 space-y-1.5">
              {includedDeliverables.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#17213A]">
                  <span className="text-[#18A999] font-bold">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exclusions summary */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold text-[#85899A] uppercase tracking-wider">Explicit Exclusions & Boundaries ({excludedDeliverables.length})</span>
            <div className="bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl p-3 space-y-1.5">
              {excludedDeliverables.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#17213A]">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Terms grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0]">
              <span className="text-[10px] text-[#85899A] font-semibold uppercase">Deadline</span>
              <p className="text-xs font-bold text-[#17213A] mt-0.5">{deadline || 'Flexible / To be confirmed'}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0]">
              <span className="text-[10px] text-[#85899A] font-semibold uppercase">Revision Policy</span>
              <p className="text-xs font-bold text-[#17213A] mt-0.5">
                {typeof revisionLimit === 'number' && revisionLimit > 0 ? `${revisionLimit} rounds capped` : 'Not capped'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0]">
              <span className="text-[10px] text-[#85899A] font-semibold uppercase">Out-of-Scope Rate</span>
              <p className="text-xs font-bold text-[#17213A] mt-0.5">{currency}{hourlyRate} / hour</p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#ECEAF0] flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#ECEAF0] bg-white hover:bg-[#FAF9F6] text-[#17213A] text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Edit</span>
            </button>
            
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6946D8] hover:bg-[#5b3bc2] text-white text-xs font-bold transition-all shadow-[0_2px_8px_rgba(105,70,216,0.3)] active:scale-[0.99]"
            >
              <Check className="w-4 h-4" />
              <span>Save & Lock Scope</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
