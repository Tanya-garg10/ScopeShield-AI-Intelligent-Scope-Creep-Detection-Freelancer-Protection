import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Copy, 
  Check, 
  Video, 
  CheckSquare, 
  Square, 
  ExternalLink, 
  Sparkles,
  FileText,
  Clock,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { useToast } from './Toast';

interface HacktoberfestGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HacktoberfestGuideModal: React.FC<HacktoberfestGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'article' | 'guide' | 'checklist'>('guide');

  const [checklist, setChecklist] = useState({
    workingCore: true,
    localInference: true,
    demoMode: true,
    repoLicense: true,
    deployedUrl: true,
    proposalPdf: true
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist({ ...checklist, [key]: !checklist[key] });
  };

  if (!isOpen) return null;

  const handleCopyGuide = () => {
    const text = `ScopeShield AI Documentation & Setup Guide
1. Establish Project Baseline: Define deliverables, explicit exclusions, and revision rounds.
2. Scope Analyzer: Paste client emails or messages to immediately classify IN_SCOPE, NEEDS_CLARIFICATION, or OUT_OF_SCOPE.
3. Smart Client Reply: Generate transparent, courteous response copy in friendly, professional, or formal tones.
4. Change Request Builder: Formalize out-of-scope work into downloadable PDF addendums with estimated hours and pricing.`;
    navigator.clipboard.writeText(text);
    toast.success('Documentation Copied', 'Summary text copied to clipboard.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-[#ECEAF0] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 text-xs text-[#17213A]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ECEAF0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F0EBFF] text-[#6946D8] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#17213A]">ScopeShield AI Documentation & Guide</h2>
              <p className="text-[11px] text-[#85899A]">Protecting freelancers from unpaid scope creep</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#85899A] hover:text-[#17213A] hover:bg-[#FAF9F6]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-[#FAF9F6] p-1 rounded-xl border border-[#ECEAF0]">
          {[
            { id: 'guide', label: 'Feature Guide' },
            { id: 'checklist', label: 'Feature Checklist' },
            { id: 'article', label: 'Product Architecture' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
                activeTab === t.id
                  ? 'bg-white text-[#6946D8] shadow-xs'
                  : 'text-[#85899A] hover:text-[#17213A]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: FEATURE GUIDE */}
        {activeTab === 'guide' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] space-y-2">
              <h3 className="font-bold text-[#17213A] text-xs">1. Setting up a project scope</h3>
              <p className="text-[#85899A] leading-relaxed">
                When you kick off a project, enter your deliverables and define what is explicitly excluded (e.g. payment gateway integrations, extra pages, continuous maintenance). You can also use <strong>Generate Structured Scope</strong> to extract them from client emails.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] space-y-2">
              <h3 className="font-bold text-[#17213A] text-xs">2. Analyzing incoming requests</h3>
              <p className="text-[#85899A] leading-relaxed">
                Whenever a client sends a message asking for changes, paste it into the <strong>Scope Analyzer</strong>. ScopeShield checks the request against the signed agreement deliverables, revision limits, and exclusions to give you an objective classification:
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-center">
                  IN SCOPE
                </div>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-center">
                  NEEDS CLARIFICATION
                </div>
                <div className="p-2 rounded-lg bg-[#F0EBFF] text-[#6946D8] border border-[#6946D8]/20 font-semibold text-center">
                  OUT OF SCOPE
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] space-y-2">
              <h3 className="font-bold text-[#17213A] text-xs">3. Crafting the reply & proposal</h3>
              <p className="text-[#85899A] leading-relaxed">
                Use <strong>Smart Client Reply</strong> to generate courteous, transparent replies in Friendly, Professional, or Firm tones. For out-of-scope work, one click generates a polished <strong>Change Request Order</strong> that you can download as PDF.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: CHECKLIST */}
        {activeTab === 'checklist' && (
          <div className="space-y-3 animate-in fade-in">
            <p className="text-[11px] text-[#85899A]">
              Interactive checklist of ScopeShield AI system capabilities:
            </p>
            <div className="space-y-2">
              {[
                { key: 'workingCore', label: 'Deterministic Scope Creep Detection Algorithm' },
                { key: 'localInference', label: 'Local Ollama LLM Bridge with Fallback Heuristics' },
                { key: 'demoMode', label: 'Instant Sample Scenario with Pre-loaded E-Commerce Project' },
                { key: 'repoLicense', label: 'Open-Source MIT License & Apache 2.0 Local Models' },
                { key: 'deployedUrl', label: 'Clean SaaS App Shell with Fixed Sidebar & Top Header' },
                { key: 'proposalPdf', label: 'Document-like Change Request Proposal & PDF Export' }
              ].map((item) => (
                <div 
                  key={item.key}
                  onClick={() => toggleCheck(item.key as keyof typeof checklist)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] cursor-pointer hover:bg-white transition-colors"
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center ${
                    checklist[item.key as keyof typeof checklist] ? 'bg-[#18A999] text-white' : 'border border-[#85899A]'
                  }`}>
                    {checklist[item.key as keyof typeof checklist] && <Check className="w-3 h-3" />}
                  </div>
                  <span className="font-semibold text-xs text-[#17213A]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ARTICLE / ARCHITECTURE */}
        {activeTab === 'article' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#ECEAF0]">
              <span className="font-bold text-xs text-[#17213A]">Architecture & Privacy-First Philosophy</span>
              <button
                onClick={handleCopyGuide}
                className="text-[11px] text-[#6946D8] font-semibold flex items-center gap-1 hover:underline"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Summary</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] space-y-2 leading-relaxed text-xs text-[#17213A]">
              <p>
                <strong>Privacy-First AI:</strong> Client contracts and private Slack messages are sensitive. ScopeShield runs entirely in your browser using local storage or on your own machine via Ollama (<code className="font-mono text-[11px] text-[#6946D8]">qwen3:4b-instruct</code>). No client data is sent to external proprietary training clouds.
              </p>
              <p>
                <strong>Strict Truth Principle:</strong> ScopeShield never invents missing deadlines or prices. If a brief is missing timelines or fees, the system flags them for confirmation.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-[#ECEAF0] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#6946D8] hover:bg-[#5b3bc2] text-white text-xs font-semibold"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
