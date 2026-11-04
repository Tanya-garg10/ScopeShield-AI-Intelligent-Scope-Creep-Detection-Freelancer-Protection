import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FolderKanban, 
  ScanSearch, 
  FileSpreadsheet, 
  History, 
  Settings, 
  HelpCircle, 
  Search, 
  Bell, 
  Plus, 
  Menu, 
  X, 
  ChevronRight, 
  Sparkles,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { ProjectScope, OllamaConfig } from '../types';

export interface AppLayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  breadcrumbs?: { label: string; tab?: string }[];
  projects: ProjectScope[];
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
  onSelectProject,
  onOpenNewProject,
  isDemoMode,
  ollamaConfig,
  onOpenSettings,
  onOpenGuide,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'My Projects', icon: FolderKanban, badge: projects.length },
    { id: 'detector', label: 'Scope Analyzer', icon: ScanSearch },
    { id: 'proposals', label: 'Change Requests', icon: FileSpreadsheet },
    { id: 'activity', label: 'Activity History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Quick search matching projects
  const filteredProjects = searchQuery.trim() 
    ? projects.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  const notifications = [
    {
      id: 'notif-1',
      title: 'Revision Cap Reached',
      desc: 'E-commerce Redesign has exhausted its 2 included revision rounds.',
      time: '1h ago',
      unread: true,
      type: 'warning'
    },
    {
      id: 'notif-2',
      title: 'CR-2026-081 Ready for Send',
      desc: '₹31,000 addendum draft prepared for Modern Goods Ltd.',
      time: '3h ago',
      unread: false,
      type: 'info'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#17213A] flex flex-col lg:flex-row antialiased">
      
      {/* Mobile Header Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#ECEAF0] sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#6946D8] flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm tracking-tight text-[#17213A]">ScopeShield AI</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenNewProject()}
            className="p-1.5 rounded-lg bg-[#6946D8] text-white text-xs flex items-center gap-1 font-medium"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#85899A] hover:text-[#17213A] rounded-lg hover:bg-[#FAF9F6]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* FIXED SIDEBAR */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#ECEAF0] flex flex-col justify-between transition-transform duration-200 ease-in-out
          lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top: Logo & Main Navigation */}
        <div className="p-4 flex flex-col gap-5">
          {/* Logo Brand */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
              <div className="w-8 h-8 rounded-xl bg-[#6946D8] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(105,70,216,0.3)]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[14px] text-[#17213A] tracking-tight">ScopeShield</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-[#F0EBFF] text-[#6946D8]">AI</span>
                </div>
                <p className="text-[10px] text-[#85899A] font-medium leading-none mt-0.5">Freelancer Protection</p>
              </div>
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-[#85899A] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Project Creation Button */}
          <div className="px-1">
            <button
              onClick={() => {
                onOpenNewProject();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#6946D8] hover:bg-[#5b3bc2] text-white text-xs font-semibold shadow-[0_2px_6px_rgba(105,70,216,0.2)] transition-all active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-0.5 px-1">
            <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-[#85899A] uppercase">
              Workspace
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group
                    ${isActive 
                      ? 'bg-[#F0EBFF] text-[#6946D8] font-semibold' 
                      : 'text-[#85899A] hover:text-[#17213A] hover:bg-[#FAF9F6]'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#6946D8]' : 'text-[#85899A] group-hover:text-[#17213A]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${isActive ? 'bg-white text-[#6946D8]' : 'bg-[#FAF9F6] text-[#85899A]'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: System Status & User Profile */}
        <div className="p-4 border-t border-[#ECEAF0] flex flex-col gap-3">
          {/* AI Status Pill */}
          <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${ollamaConfig.isConnected ? 'bg-[#18A999]' : 'bg-amber-400'}`} />
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-[#17213A] leading-tight">
                  {ollamaConfig.isConnected ? 'Local LLM Connected' : isDemoMode ? 'Sample Mode Active' : 'Offline Engine'}
                </span>
                <span className="text-[10px] text-[#85899A]">
                  {ollamaConfig.isConnected ? ollamaConfig.model : 'Verified Heuristics'}
                </span>
              </div>
            </div>
            <button
              onClick={onOpenSettings}
              className="text-[10px] font-medium text-[#6946D8] hover:underline"
            >
              Config
            </button>
          </div>

          {/* Help & Support */}
          <button
            onClick={() => {
              onOpenGuide();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#85899A] hover:text-[#17213A] hover:bg-[#FAF9F6] transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help & Documentation</span>
          </button>

          {/* User Profile */}
          <div className="pt-2 border-t border-[#ECEAF0] flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6946D8] to-[#18A999] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                TG
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-[#17213A] leading-tight">Tanya Garg</span>
                <span className="text-[10px] text-[#85899A]">Freelancer Pro Plan</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        
        {/* TOP HEADER */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-[#ECEAF0] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Breadcrumbs & Page Title */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#17213A] text-sm capitalize">
              {currentTab === 'dashboard' ? 'Overview' : 
               currentTab === 'projects' ? 'My Projects' :
               currentTab === 'detector' ? 'Scope Analyzer' :
               currentTab === 'proposals' ? 'Change Requests' :
               currentTab === 'activity' ? 'Activity History' :
               currentTab === 'settings' ? 'Settings' :
               currentTab === 'builder' ? 'Project Setup' : currentTab}
            </span>

            {breadcrumbs && breadcrumbs.length > 0 && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-[#85899A]" />
                {breadcrumbs.map((b, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <ChevronRight className="w-3 h-3 text-[#85899A]" />}
                    <span 
                      onClick={() => b.tab && setCurrentTab(b.tab)}
                      className={`${b.tab ? 'text-[#85899A] hover:text-[#17213A] cursor-pointer' : 'text-[#17213A] font-medium'}`}
                    >
                      {b.label}
                    </span>
                  </React.Fragment>
                ))}
              </>
            )}
          </div>

          {/* Right Header Actions: Search, Notifications, Primary Action */}
          <div className="flex items-center gap-3">
            
            {/* Quick Search Input */}
            <div className="relative hidden sm:block">
              <Search className="w-3.5 h-3.5 text-[#85899A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects & scope..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-56 lg:w-64 pl-8 pr-3 py-1.5 text-xs bg-[#FAF9F6] border border-[#ECEAF0] rounded-xl text-[#17213A] placeholder-[#85899A] focus:outline-none focus:border-[#6946D8] focus:bg-white transition-all"
              />

              {/* Quick Search Dropdown */}
              {isSearchFocused && searchQuery.trim() && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#ECEAF0] rounded-xl shadow-lg p-2 z-50">
                  <div className="text-[10px] font-semibold text-[#85899A] uppercase px-2 py-1">Matching Projects</div>
                  {filteredProjects.length === 0 ? (
                    <div className="text-xs text-[#85899A] p-2">No matching projects found</div>
                  ) : (
                    filteredProjects.map(p => (
                      <div
                        key={p.id}
                        onMouseDown={() => {
                          onSelectProject(p.id);
                          setCurrentTab('projects');
                        }}
                        className="p-2 rounded-lg hover:bg-[#FAF9F6] cursor-pointer text-xs"
                      >
                        <p className="font-semibold text-[#17213A]">{p.name}</p>
                        <p className="text-[10px] text-[#85899A]">{p.clientName} • {p.currency}{p.budget.toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Notification Bell with interactive popover */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-[#85899A] hover:text-[#17213A] hover:bg-[#FAF9F6] border border-[#ECEAF0] relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-[#6946D8] absolute top-1.5 right-1.5" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#ECEAF0] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[#ECEAF0] mb-2 px-1">
                    <span className="text-xs font-bold text-[#17213A]">Notifications</span>
                    <span className="text-[10px] text-[#6946D8] font-medium cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {notifications.map(n => (
                      <div key={n.id} className="p-2 rounded-xl bg-[#FAF9F6] border border-[#ECEAF0] text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#17213A]">{n.title}</span>
                          <span className="text-[9px] text-[#85899A]">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#85899A] mt-1 leading-snug">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Top Quick Analyze CTA */}
            <button
              onClick={() => setCurrentTab('detector')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#6946D8]/20 bg-[#F0EBFF] hover:bg-[#e4dbff] text-[#6946D8] text-xs font-semibold transition-colors"
            >
              <ScanSearch className="w-3.5 h-3.5" />
              <span>Scope Analyzer</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
};
