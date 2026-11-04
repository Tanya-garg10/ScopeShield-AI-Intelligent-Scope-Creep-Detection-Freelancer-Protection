import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './components/Dashboard';
import { ProjectsView } from './components/ProjectsView';
import { ScopeCreepDetector } from './components/ScopeCreepDetector';
import { ScopeBuilder } from './components/ScopeBuilder';
import { ChangeRequestBuilder } from './components/ChangeRequestBuilder';
import { ActivityHistoryView } from './components/ActivityHistoryView';
import { OllamaSettingsModal } from './components/OllamaSettingsModal';
import { HacktoberfestGuideModal } from './components/HacktoberfestGuideModal';

import { 
  ProjectScope, 
  ScopeAnalysis, 
  ChangeProposal, 
  ActivityLog, 
  OllamaConfig 
} from './types';
import { 
  getProjects, 
  saveProject, 
  deleteProject, 
  getAnalyses, 
  saveAnalysis,
  getProposals,
  saveProposal,
  deleteProposal,
  getActivityLogs,
  initializeStorage 
} from './services/storage';
import { 
  DEFAULT_OLLAMA_CONFIG, 
  checkOllamaConnection 
} from './services/ollama';
import { 
  HACKTOBERFEST_DEMO_PROJECT, 
  DEMO_CLIENT_MESSAGE 
} from './services/demoData';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [projects, setProjects] = useState<ProjectScope[]>([]);
  const [analyses, setAnalyses] = useState<ScopeAnalysis[]>([]);
  const [proposals, setProposals] = useState<ChangeProposal[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [editingProject, setEditingProject] = useState<ProjectScope | undefined>(undefined);
  const [proposalDraft, setProposalDraft] = useState<Partial<ChangeProposal> | undefined>(undefined);

  // Settings & Modals
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [ollamaConfig, setOllamaConfig] = useState<OllamaConfig>(DEFAULT_OLLAMA_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Initialize storage & detect Ollama in background
  useEffect(() => {
    initializeStorage();
    const storedProjects = getProjects();
    const storedAnalyses = getAnalyses();
    const storedProposals = getProposals();
    const storedActivities = getActivityLogs();

    setProjects(storedProjects);
    setAnalyses(storedAnalyses);
    setProposals(storedProposals);
    setActivities(storedActivities);

    if (storedProjects.length > 0) {
      setSelectedProjectId(storedProjects[0].id);
    }

    // Ping local Ollama in background
    checkOllamaConnection('http://localhost:11434').then(res => {
      if (res.isConnected) {
        setOllamaConfig(prev => ({
          ...prev,
          isConnected: true,
          latencyMs: res.latencyMs,
          installedModels: res.models,
          lastChecked: new Date().toISOString()
        }));
        setIsDemoMode(false);
      }
    });
  }, []);

  const refreshAllState = () => {
    setProjects(getProjects());
    setAnalyses(getAnalyses());
    setProposals(getProposals());
    setActivities(getActivityLogs());
  };

  // Save Project
  const handleSaveProject = (project: ProjectScope) => {
    const updated = saveProject(project);
    refreshAllState();
    setEditingProject(undefined);
    setSelectedProjectId(updated.id);
    setActiveTab('projects');
  };

  // Delete Project
  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    refreshAllState();
  };

  // Save Analysis
  const handleSaveAnalysis = (analysis: ScopeAnalysis) => {
    saveAnalysis(analysis);
    refreshAllState();
  };

  // Save Proposal
  const handleSaveProposal = (proposal: ChangeProposal) => {
    saveProposal(proposal);
    refreshAllState();
  };

  // Delete Proposal
  const handleDeleteProposal = (id: string) => {
    deleteProposal(id);
    refreshAllState();
  };

  // Transition from Analysis to Change Proposal
  const handleGenerateProposalFromAnalysis = (draft: Partial<ChangeProposal>) => {
    setProposalDraft(draft);
    setActiveTab('proposals');
  };

  // Trigger Demo Scenario
  const handleLoadDemoScenario = () => {
    const demoProj = projects.find(p => p.id === HACKTOBERFEST_DEMO_PROJECT.id) || HACKTOBERFEST_DEMO_PROJECT;
    setSelectedProjectId(demoProj.id);
    setActiveTab('detector');
  };

  // Breadcrumbs calculation
  const getBreadcrumbs = () => {
    if (activeTab === 'dashboard') return [];
    if (activeTab === 'projects') {
      const activeP = projects.find(p => p.id === selectedProjectId);
      return activeP ? [{ label: activeP.name }] : [];
    }
    if (activeTab === 'builder') {
      return [{ label: editingProject ? `Edit: ${editingProject.name}` : 'New Scope' }];
    }
    if (activeTab === 'detector') {
      const activeP = projects.find(p => p.id === selectedProjectId);
      return activeP ? [{ label: activeP.name }] : [];
    }
    return [];
  };

  return (
    <AppLayout
      currentTab={activeTab === 'settings' ? 'dashboard' : activeTab}
      setCurrentTab={(tab) => {
        if (tab === 'settings') {
          setIsSettingsOpen(true);
        } else {
          setEditingProject(undefined);
          setProposalDraft(undefined);
          setActiveTab(tab);
        }
      }}
      breadcrumbs={getBreadcrumbs()}
      projects={projects}
      onSelectProject={(id) => {
        setSelectedProjectId(id);
        setActiveTab('projects');
      }}
      onOpenNewProject={() => {
        setEditingProject(undefined);
        setActiveTab('builder');
      }}
      isDemoMode={isDemoMode}
      setIsDemoMode={setIsDemoMode}
      ollamaConfig={ollamaConfig}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onOpenGuide={() => setIsGuideOpen(true)}
    >
      {/* 1. DASHBOARD VIEW */}
      {activeTab === 'dashboard' && (
        <Dashboard
          projects={projects}
          analyses={analyses}
          proposals={proposals}
          activities={activities}
          onSelectProject={(id) => {
            setSelectedProjectId(id);
            setActiveTab('projects');
          }}
          onOpenDetector={(id) => {
            if (id) setSelectedProjectId(id);
            setActiveTab('detector');
          }}
          onOpenBuilder={() => {
            setEditingProject(undefined);
            setActiveTab('builder');
          }}
          onOpenProposals={() => setActiveTab('proposals')}
          onLoadDemoScenario={handleLoadDemoScenario}
        />
      )}

      {/* 2. MY PROJECTS VIEW */}
      {activeTab === 'projects' && (
        <ProjectsView
          projects={projects}
          analyses={analyses}
          proposals={proposals}
          activities={activities}
          onSelectProject={(id) => setSelectedProjectId(id)}
          onEditProject={(proj) => {
            setEditingProject(proj);
            setActiveTab('builder');
          }}
          onDeleteProject={handleDeleteProject}
          onNewProject={() => {
            setEditingProject(undefined);
            setActiveTab('builder');
          }}
          onDetectCreep={(id) => {
            setSelectedProjectId(id);
            setActiveTab('detector');
          }}
        />
      )}

      {/* 3. SCOPE ANALYZER & SMART CLIENT REPLY VIEW */}
      {activeTab === 'detector' && (
        <ScopeCreepDetector
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSaveAnalysis={handleSaveAnalysis}
          onGenerateProposal={handleGenerateProposalFromAnalysis}
          isDemoMode={isDemoMode}
          ollamaConfig={ollamaConfig}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* 4. PROJECT CREATION / SCOPE BUILDER */}
      {activeTab === 'builder' && (
        <ScopeBuilder
          onSaveProject={handleSaveProject}
          onCancel={() => {
            setEditingProject(undefined);
            setActiveTab('projects');
          }}
          initialProject={editingProject}
          isDemoMode={isDemoMode}
          ollamaConfig={ollamaConfig}
        />
      )}

      {/* 5. CHANGE REQUESTS VIEW */}
      {activeTab === 'proposals' && (
        <ChangeRequestBuilder
          projects={projects}
          proposals={proposals}
          onSaveProposal={handleSaveProposal}
          onDeleteProposal={handleDeleteProposal}
          initialProposalDraft={proposalDraft}
        />
      )}

      {/* 6. ACTIVITY HISTORY VIEW */}
      {activeTab === 'activity' && (
        <ActivityHistoryView
          activities={activities}
          onSelectProject={(id) => {
            setSelectedProjectId(id);
            setActiveTab('projects');
          }}
          onOpenDetector={(id) => {
            if (id) setSelectedProjectId(id);
            setActiveTab('detector');
          }}
        />
      )}

      {/* Settings Modal */}
      <OllamaSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={ollamaConfig}
        onUpdateConfig={setOllamaConfig}
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        onDataReset={refreshAllState}
      />

      {/* Documentation / Guide Modal */}
      <HacktoberfestGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </AppLayout>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
