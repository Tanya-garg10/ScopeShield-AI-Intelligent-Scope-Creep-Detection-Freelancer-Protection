import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LayoutGrid, 
  FolderKanban, 
  Radar, 
  FileText, 
  Activity, 
  SlidersHorizontal, 
  HelpCircle, 
  Search, 
  Bell, 
  Plus, 
  ChevronRight, 
  Sparkles,
  ExternalLink,
  Cpu,
  Lock,
  Layers,
  PanelRightClose,
  PanelRightOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { ProjectScope, OllamaConfig, ScopeAnalysis } from '../types';

export interface AppLayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  breadcrumbs?: { label: string; tab?: string }[];
  projects: ProjectScope[];
  analyses?: ScopeAnalysis[];
  onSelectProject: (id: string) => void;
  onOpenNewProject: () => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  ollamaConfig: OllamaConfig;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  setCurrentTab,
  breadcrumbs,
  projects,
  analyses = [],
  onSelectProject,
  onOpenNewProject,
  isDemoMode,
  ollamaConfig,
  onOpenSettings,
  onOpenGuide,
  children
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [contextPanelOpen, setContextPanelOpen] = useState(true);

  // Active Project Context
  const primaryProject = projects[0];

  const navItems = [
    { id: 'dashboard', label: 'Workspace', icon: LayoutGrid, sub: 'Control Center' },
    { id: 'projects', label: 'Projects', icon: FolderKanban, badge: projects.length, sub: 'Agreements' },
    { id: 'detector', label: 'Scope Intelligence', icon: Radar, sub: 'Boundary Analyzer' },
    { id: 'proposals', label: 'Proposals', icon: FileText, sub: 'Change Orders' },
    { id: 'activity', label: 'Activity', icon: Activity, sub: 'Audit Trail' },
    { id: 'settings', label: 'Settings', icon: SlidersHorizontal, sub: 'AI Engine' },
  ];

  const filteredProjects = searchQuery.trim() 
    ? projects.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#171A2B] flex flex-col antialiased selection:bg-[#F0EDFF] selection:text-[#4933A8]">
      
      {/* 3-PART APPLICATION SHELL */}
      <div className="flex-1 flex w-full">
        
        {/* ================= A. NARROW LEFT NAVIGATION RAIL ================= */}
        <aside className="w-16 sm:w-20 lg:w-60 shrink-0 bg-[#FFFFFF] border-r border-[#E9E7E2] flex flex-col justify-between py-5 px-2 sm:px-3 z-30 select-none">
          
          <div className="space-y-6">
            
            {/* Custom ScopeShield Monogram Brand */}
            <div 
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-3 px-2 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#171A2B] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(23,26,43,0.15)] group-hover:bg-[#7255E8] transition-colors shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#42B9A8]" />
              </div>
              <div className="hidden lg:flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-sm tracking-tight text-[#171A2B]">ScopeShield</span>
                  <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 bg-[#F0EDFF] text-[#7255E8] rounded">AI</span>
                </div>
                <span className="text-[10px] text-[#777887] font-medium leading-tight">Control Room</span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="px-1 hidden lg:block">
              <button
                onClick={onOpenNewProject}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#171A2B] hover:bg-[#7255E8] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.99]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
            </div>

            {/* Navigation Rails */}
            <nav className="space-y-1">
              <div className="hidden lg:block px-2 text-[10px] font-mono uppercase text-[#777887] tracking-wider mb-2">
                Navigation
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`
                      w-full flex items-center justify-center lg:justify-between p-2.5 lg:px-3 lg:py-2.5 rounded-xl text-xs font-medium transition-all group relative
                      ${isActive 
                        ? 'bg-[#F0EDFF] text-[#7255E8] font-semibold' 
                        : 'text-[#777887] hover:text-[#171A2B] hover:bg-[#F8F7F4]'
                      }
                    `}
                    title={item.label}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#7255E8]' : 'text-[#777887] group-hover:text-[#171A2B]'}`} />
                      <div className="hidden lg:flex flex-col text-left">
                        <span className="leading-tight">{item.label}</span>
                        <span className="text-[9px] text-[#777887] font-normal leading-none mt-0.5">{item.sub}</span>
                      </div>
                    </div>

                    {item.badge !== undefined && (
                      <span className={`hidden lg:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        isActive ? 'bg-[#FFFFFF] text-[#7255E8]' : 'bg-[#F8F7F4] text-[#777887]'
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {/* Active accent tick */}
                    {isActive && (
                      <span className="lg:hidden absolute left-0 top-2 bottom-2 w-1 bg-[#7255E8] rounded-r" />
                    )}
                  </button>
                );
              })}
            </nav>

          </div>

          {/* Bottom Rail: System Status & User Profile */}
          <div className="space-y-3 pt-4 border-t border-[#E9E7E2]">
            
            {/* System Status Pill */}
            <div 
              onClick={onOpenSettings}
              className="p-2 lg:p-2.5 rounded-xl bg-[#F8F7F4] hover:bg-[#F0EDFF]/50 border border-[#E9E7E2] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <span className={`w-2 h-2 rounded-full shrink-0 ${ollamaConfig.isConnected ? 'bg-[#42B9A8]' : 'bg-amber-400'}`} />
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[10px] font-bold text-[#171A2B] leading-none">
                    {ollamaConfig.isConnected ? 'Ollama Online' : 'Sample Mode'}
                  </span>
                  <span className="text-[9px] font-mono text-[#777887] mt-0.5">
                    {ollamaConfig.isConnected ? ollamaConfig.model : 'Verified Heuristics'}
                  </span>
                </div>
              </div>
            </div>

            {/* Help / Docs */}
            <button
              onClick={onOpenGuide}
              className="w-full flex items-center justify-center lg:justify-start gap-2 p-2 rounded-xl text-xs text-[#777887] hover:text-[#171A2B] hover:bg-[#F8F7F4] transition-colors"
              title="Documentation"
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline text-[11px] font-medium">Docs & Philosophy</span>
            </button>

            {/* User Profile */}
            <div className="flex items-center justify-center lg:justify-start gap-2.5 pt-2 border-t border-[#E9E7E2] px-1">
              <div className="w-8 h-8 rounded-lg bg-[#171A2B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                TG
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#171A2B] leading-none">Tanya Garg</span>
                <span className="text-[10px] text-[#777887] font-mono mt-0.5">Independent Pro</span>
              </div>
            </div>

          </div>

        </aside>

        {/* ================= B. MAIN WORKSPACE (Largest Area) ================= */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8F7F4]">
          
          {/* Top Sub-Header */}
          <header className="h-14 border-b border-[#E9E7E2] bg-[#FFFFFF]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
            
            {/* Breadcrumbs & Title */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-[11px] text-[#777887] uppercase tracking-wider">
                ScopeShield
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#777887]" />
              <span className="font-semibold text-[#171A2B]">
                {currentTab === 'dashboard' ? 'Workspace Overview' :
                 currentTab === 'projects' ? 'Active Project Environments' :
                 currentTab === 'detector' ? 'Scope Intelligence Workspace' :
                 currentTab === 'proposals' ? 'Change Request Studio' :
                 currentTab === 'activity' ? 'Audit Log & History' :
                 currentTab === 'settings' ? 'System & AI Engine' :
                 currentTab === 'builder' ? 'New Scope Definition' : currentTab}
              </span>
              {breadcrumbs && breadcrumbs.map((b, i) => (
                <React.Fragment key={i}>
                  <ChevronRight className="w-3.5 h-3.5 text-[#777887]" />
                  <span className="text-[#171A2B] font-medium">{b.label}</span>
                </React.Fragment>
              ))}
            </div>

            {/* Actions: Search, Notifications, Context Panel Toggle */}
            <div className="flex items-center gap-2.5">
              
              {/* Search input */}
              <div className="relative hidden md:block">
                <Search className="w-3.5 h-3.5 text-[#777887] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Quick lookup..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="w-48 pl-8 pr-2.5 py-1 text-xs bg-[#F8F7F4] border border-[#E9E7E2] rounded-lg text-[#171A2B] placeholder-[#777887] focus:outline-none focus:border-[#7255E8] focus:bg-white"
                />

                {isSearchFocused && searchQuery.trim() && (
                  <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-[#E9E7E2] rounded-xl shadow-xl p-2 z-50">
                    <span className="eyebrow px-2 py-1 block">Projects</span>
                    {filteredProjects.map(p => (
                      <div
                        key={p.id}
                        onMouseDown={() => {
                          onSelectProject(p.id);
                          setCurrentTab('projects');
                        }}
                        className="p-2 hover:bg-[#F8F7F4] rounded-lg cursor-pointer text-xs"
                      >
                        <p className="font-semibold text-[#171A2B]">{p.name}</p>
                        <p className="text-[10px] text-[#777887] font-mono">{p.clientName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scope Intelligence Shortcut CTA */}
              <button
                onClick={() => setCurrentTab('detector')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F0EDFF] text-[#7255E8] border border-[#7255E8]/20 text-xs font-semibold hover:bg-[#e4ddff] transition-colors"
              >
                <Radar className="w-3.5 h-3.5" />
                <span>Scope Intelligence</span>
              </button>

              {/* Context Panel Toggle */}
              <button
                onClick={() => setContextPanelOpen(!contextPanelOpen)}
                className="p-1.5 rounded-lg border border-[#E9E7E2] text-[#777887] hover:text-[#171A2B] hover:bg-[#FFFFFF]"
                title="Toggle Context Panel"
              >
                {contextPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              </button>
            </div>

          </header>

          {/* Spacious Editorial Workspace Area */}
          <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-6xl w-full mx-auto">
            {children}
          </main>

        </div>

        {/* ================= C. CONTEXT PANEL (Right-Side Panel) ================= */}
        {contextPanelOpen && (
          <aside className="w-72 xl:w-80 shrink-0 bg-[#FFFFFF] border-l border-[#E9E7E2] p-5 hidden xl:flex flex-col justify-between space-y-6 z-20 select-none animate-in slide-in-from-right-4 duration-200">
            
            <div className="space-y-6">
              
              {/* Context Panel Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E9E7E2]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#42B9A8]" />
                  <span className="eyebrow text-[#171A2B]">CONTEXT TELEMETRY</span>
                </div>
                <span className="text-[10px] font-mono text-[#777887]">LIVE</span>
              </div>

              {/* Active Project Card */}
              {primaryProject && (
                <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow">PRIMARY CONTRACT</span>
                    <span className="text-[10px] font-mono font-bold text-[#42B9A8]">ACTIVE</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs text-[#171A2B]">{primaryProject.name}</h4>
                    <p className="text-[11px] text-[#777887]">{primaryProject.clientName}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#E9E7E2] text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#777887]">Base Value:</span>
                      <span className="font-bold text-[#171A2B]">{primaryProject.currency}{primaryProject.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777887]">Hourly Rate:</span>
                      <span className="font-bold text-[#171A2B]">{primaryProject.currency}{primaryProject.hourlyRate}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777887]">Revision Cap:</span>
                      <span className="font-bold text-[#171A2B]">{primaryProject.revisionsUsed}/{primaryProject.revisionLimit || 2} used</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Boundary Radar Status */}
              <div className="space-y-2">
                <span className="eyebrow block">BOUNDARY INTEGRITY</span>
                <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E9E7E2] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#777887] text-[11px]">Clause Grounding:</span>
                    <span className="font-mono font-bold text-[#42B9A8]">100% Deterministic</span>
                  </div>
                  <div className="w-full bg-[#F8F7F4] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#42B9A8] h-full w-full" />
                  </div>
                  <p className="text-[10px] text-[#777887] leading-tight">
                    Every analysis matches against explicit contractual deliverables and exclusions.
                  </p>
                </div>
              </div>

              {/* Quick AI Diagnostics */}
              <div className="space-y-2">
                <span className="eyebrow block">INFERENCE TELEMETRY</span>
                <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E9E7E2] space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#777887]">Runtime:</span>
                    <span className="text-[#171A2B]">{ollamaConfig.isConnected ? 'Local GPU/CPU' : 'Browser Heuristic'}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#777887]">Model:</span>
                    <span className="text-[#7255E8] font-bold">{ollamaConfig.isConnected ? ollamaConfig.model : 'Deterministic'}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#777887]">Privacy Policy:</span>
                    <span className="text-[#42B9A8] font-bold">100% Zero-Cloud</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Context Panel Footer */}
            <div className="pt-4 border-t border-[#E9E7E2] text-center">
              <span className="text-[10px] font-mono text-[#777887]">
                ScopeShield AI System v2.5
              </span>
            </div>

          </aside>
        )}

      </div>

    </div>
  );
};
