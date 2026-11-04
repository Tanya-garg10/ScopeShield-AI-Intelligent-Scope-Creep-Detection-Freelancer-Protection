import React from 'react';
import { 
  ShieldAlert, 
  Cpu, 
  Settings, 
  FolderGit2, 
  FileText, 
  Plus, 
  Sparkles, 
  HelpCircle,
  Wifi,
  WifiOff,
  LayoutDashboard
} from 'lucide-react';
import { OllamaConfig } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  ollamaConfig: OllamaConfig;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  ollamaConfig,
  isDemoMode,
  setIsDemoMode,
  onOpenSettings,
  onOpenGuide
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#090D16]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Identity */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-teal-400 p-[1.5px] shadow-md shadow-violet-500/20 group-hover:shadow-teal-500/25 transition-all">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-teal-400 group-hover:scale-105 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                  ScopeShield <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-teal-400">AI</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-teal-300 border border-slate-700/60 font-semibold">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
                Freelance Scope Creep Protection & Change Orders
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-[#0D1322]/90 border border-slate-800 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('detector')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'detector'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-teal-300" />
              <span>Scope Creep Detector</span>
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'builder'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Scope Builder</span>
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'projects'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Projects</span>
            </button>
          </nav>

          {/* Right Status Controls & Action CTA */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Mode Switcher Pill (Local AI vs Interactive Demo) */}
            <div className="hidden lg:flex items-center bg-[#0D1322] border border-slate-800 rounded-full p-1 text-xs">
              <button
                onClick={() => setIsDemoMode(false)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  !isDemoMode
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Process through local Ollama instance (qwen3:4b-instruct)"
              >
                <Cpu className="w-3 h-3 text-teal-400" />
                <span>Local AI</span>
                {ollamaConfig.isConnected ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
              <button
                onClick={() => setIsDemoMode(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  isDemoMode
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Instant deterministic demo mode without local weights"
              >
                <Sparkles className="w-3 h-3 text-violet-400" />
                <span>Demo Mode</span>
              </button>
            </div>

            {/* AI Engine & Settings Button */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                ollamaConfig.isConnected
                  ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/30'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              title="Configure local Ollama host & model"
            >
              {ollamaConfig.isConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xl:inline text-[11px]">Ollama: {ollamaConfig.model}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xl:inline text-[11px]">Model Setup</span>
                </>
              )}
              <Settings className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {/* Help / Docs Guide */}
            <button
              onClick={onOpenGuide}
              className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
              title="Documentation & Setup Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* CTA: Create New Scope */}
            <button
              onClick={() => setActiveTab('builder')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-teal-500/20 transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">New Scope</span>
            </button>

          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-1 px-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'dashboard' ? 'text-teal-400 bg-slate-800/70 font-bold' : 'text-slate-400'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('detector')}
            className={`py-1 px-2.5 rounded-lg font-medium flex items-center gap-1 transition-all ${
              activeTab === 'detector' ? 'text-teal-400 bg-slate-800/70 font-bold' : 'text-slate-400'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
            Detector
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`py-1 px-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'builder' ? 'text-teal-400 bg-slate-800/70 font-bold' : 'text-slate-400'
            }`}
          >
            Builder
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-1 px-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'projects' ? 'text-teal-400 bg-slate-800/70 font-bold' : 'text-slate-400'
            }`}
          >
            Projects
          </button>
        </div>

      </div>
    </header>
  );
};
