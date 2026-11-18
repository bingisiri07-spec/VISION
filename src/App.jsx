import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/common/Navbar';
import SpaceBackdrop from './components/landing/SpaceBackdrop';
import HeroSection from './components/landing/HeroSection';
import AboutSection from './components/landing/AboutSection';
import FeaturesSection from './components/landing/FeaturesSection';
import ContactSection from './components/landing/ContactSection';
import Footer from './components/landing/Footer';
import HowItWorksModal from './components/landing/HowItWorksModal';
import AuthModal from './components/common/AuthModal';
import ProjectsModal from './components/common/ProjectsModal';
import ProfileModal from './components/common/ProfileModal';
import { CheckCircle2 } from 'lucide-react';

import WorkspaceShell from './components/workspace/WorkspaceShell';
import OverviewDashboard from './components/workspace/OverviewDashboard';
import AnalyticsDashboard from './components/workspace/AnalyticsDashboard';
import ValidationDashboard from './components/workspace/ValidationDashboard';
import CollaborationsHub from './components/workspace/CollaborationsHub';
import ProblemDiscovery from './components/workspace/ProblemDiscovery';
import CompetitorAnalyzer from './components/workspace/CompetitorAnalyzer';
import ExecutionPlan from './components/workspace/ExecutionPlan';
import BudgetAdvisor from './components/workspace/BudgetAdvisor';
import DecisionSimulator from './components/workspace/DecisionSimulator';
import JourneyDashboard from './components/workspace/JourneyDashboard';
import AIAssistantDrawer from './components/workspace/AIAssistantDrawer';

import { AuthProvider, useAuth } from './context/AuthContext';
import { loadSavedState, saveState, clearGuestState, initialProjectState } from './services/storage';
import { generateExecutionPlan } from './services/roadmapEngine';
import { calculateBudgetBreakdown } from './services/budgetEngine';
import {
  getUserProjects,
  createCloudProject,
  saveCloudIdeas,
  selectCloudIdea,
  saveCloudRoadmap,
  syncCloudTasks,
  saveCloudBudget,
  saveCloudDecision,
  saveCloudNote,
  updateCloudJourneyStatus,
  getFullProject,
  getContinuousChatHistory,
  saveContinuousChatMessage,
  migrateLocalStateToSupabase,
  saveCloudCompetitorAnalysis,
  updateStartupName,
  updateCloudProjectProblem,
  updateVentureStage,
} from './services/projectService';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [projectState, setProjectState] = useState(() => loadSavedState(user?.id || null));
  const [activeView, setActiveView] = useState('landing');
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({
    isOpen: false,
    reasonTitle: '',
    reasonDescription: '',
    defaultIsSignUp: false,
  });
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [cloudProjects, setCloudProjects] = useState([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const pendingRestrictedAction = useRef(null);
  const initialSyncHandled = useRef(false);

  // Synchronize state to persistent storage (isolated by userId or guest storage)
  useEffect(() => {
    saveState(projectState, user?.id || null);
  }, [projectState, user?.id]);

  // Refresh user projects from Supabase
  const refreshProjects = async () => {
    if (!user) {
      setCloudProjects([]);
      setIsProjectsLoading(false);
      return [];
    }
    setIsProjectsLoading(true);
    try {
      const list = await getUserProjects();
      setCloudProjects(list || []);
      return list || [];
    } catch (err) {
      console.warn('Could not refresh projects list:', err);
      return [];
    } finally {
      setIsProjectsLoading(false);
    }
  };

  // Load continuous chat history on mount & user change (Do NOT restart chat across sessions)
  useEffect(() => {
    async function loadChat() {
      const history = await getContinuousChatHistory();
      if (history && history.length > 0) {
        setProjectState((prev) => ({
          ...prev,
          chatHistory: history,
        }));
      }
    }
    loadChat();
    refreshProjects();
  }, [user]);

  // Handle user authentication transitions without discarding in-progress guest workflows
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      initialSyncHandled.current = false;
      setCloudProjects([]);
      return;
    }

    if (initialSyncHandled.current) return;
    initialSyncHandled.current = true;

    async function handleUserLoginSync() {
      try {
        const fetched = await getUserProjects();
        setCloudProjects(fetched || []);

        // Requirement 4: Never discard guest's generated results after authentication.
        // If user already has an active local/guest draft (problem statement or selected idea),
        // preserve it and do NOT overwrite it with a previous cloud project!
        const hasUnsavedLocalDraft = Boolean(
          !projectState.projectId && (projectState.problem?.problemStatement || projectState.selectedIdea)
        );

        if (!hasUnsavedLocalDraft && fetched && fetched.length > 0 && !projectState.projectId) {
          // No unsaved draft: load user's latest cloud venture
          const latest = await getFullProject(fetched[0].id);
          if (latest) {
            setProjectState((prev) => ({
              ...prev,
              ...latest,
              projectId: latest.id,
              startupName: latest.startupName || latest.title,
              title: latest.startupName || latest.title,
              chatHistory: prev.chatHistory,
              apiKey: prev.apiKey,
            }));
          }
        }
      } catch (err) {
        console.warn('Cloud sync error after sign-in:', err);
      }
    }

    handleUserLoginSync();
  }, [user, authLoading]);

  // Save current venture permanently to Supabase cloud
  const handleSaveVenture = async () => {
    if (!projectState.problem?.problemStatement && !projectState.selectedIdea) {
      alert('Please start by describing a problem in Problem Discovery before saving.');
      return;
    }

    if (!user) {
      // Guest attempted to save: open Supabase auth modal with clear explanation
      pendingRestrictedAction.current = 'save_venture';
      setAuthModalConfig({
        isOpen: true,
        reasonTitle: 'Save Your Venture Permanently',
        reasonDescription: 'Sign in to your account or create a new founder account to permanently save your venture, AI-generated opportunities, competitor analysis, and execution roadmap to your VISION cloud account.',
        defaultIsSignUp: false,
      });
      return;
    }

    setIsSaving(true);
    try {
      const newProjectId = await migrateLocalStateToSupabase(projectState);
      if (newProjectId) {
        setProjectState((prev) => ({
          ...prev,
          projectId: newProjectId,
        }));
        clearGuestState();
        await refreshProjects();
        setSaveSuccessMessage('Venture successfully saved to your cloud account!');
        setTimeout(() => setSaveSuccessMessage(''), 5000);
        handleNavigateView('overview');
      }
    } catch (err) {
      console.error('Failed to save venture to Supabase:', err);
      alert('Failed to save venture. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for post-auth continuation
  const handleAuthSuccess = async () => {
    const action = pendingRestrictedAction.current;
    pendingRestrictedAction.current = null;

    if (action === 'save_venture') {
      setIsSaving(true);
      try {
        const newProjectId = await migrateLocalStateToSupabase(projectState);
        if (newProjectId) {
          setProjectState((prev) => ({
            ...prev,
            projectId: newProjectId,
          }));
          clearGuestState();
          await refreshProjects();
          setSaveSuccessMessage('Venture successfully saved to your cloud account!');
          setTimeout(() => setSaveSuccessMessage(''), 5000);
          handleNavigateView('overview');
        }
      } catch (err) {
        console.error('Failed to save venture after authentication:', err);
      } finally {
        setIsSaving(false);
      }
    } else if (action === 'my_ventures') {
      setIsProjectsModalOpen(true);
    } else if (action === 'collaborations') {
      setActiveView('collaborations');
    } else if (action === 'profile') {
      setIsProfileModalOpen(true);
    }
  };

  // Prompt authentication for restricted features
  const handleRequireAuth = (actionType, reasonDescription, defaultIsSignUp = false) => {
    pendingRestrictedAction.current = actionType;
    const titleMap = {
      save_venture: 'Save Your Venture Permanently',
      my_ventures: 'My Ventures Cloud Access',
      collaborations: 'Collaboration Network Access',
      profile: 'Founder Profile Settings',
    };
    setAuthModalConfig({
      isOpen: true,
      reasonTitle: titleMap[actionType] || 'Account Required',
      reasonDescription: reasonDescription || 'Sign in or create an account to access this feature.',
      defaultIsSignUp,
    });
  };

  // Handler when ideas are generated from Problem Discovery
  const handleIdeasGenerated = async ({ problem, ideas }) => {
    let cloudProjectId = projectState.projectId;

    // If user is authenticated, save the new project & ideas directly to Supabase
    if (user) {
      try {
        if (!cloudProjectId) {
          const created = await createCloudProject({
            title: ideas[0]?.name || 'New Venture Discovery',
            domain: problem.domain,
            problemStatement: problem.problemStatement,
            affectedAudience: problem.affectedAudience,
            constraints: problem.constraints,
            goals: problem.goals,
          });
          cloudProjectId = created.id;
        }

        const savedIdeas = await saveCloudIdeas(cloudProjectId, ideas);
        if (savedIdeas && savedIdeas.length) {
          ideas = ideas.map((idea, idx) => ({
            ...idea,
            id: savedIdeas[idx]?.id || idea.id,
          }));
        }
      } catch (err) {
        console.error('Failed to save problem/ideas to Supabase:', err);
      }
    }

    setProjectState((prev) => ({
      ...prev,
      projectId: cloudProjectId,
      problem,
      ideas,
    }));
  };

  // Handler when user selects a startup idea and confirms its startup name
  const handleSelectIdea = async (idea, confirmedStartupName) => {
    const finalStartupName = (confirmedStartupName || idea.name || 'My Startup').trim();
    const roadmap = generateExecutionPlan(idea, projectState.problem?.constraints);

    // Flatten all tasks from all phases into active checklist
    const initialTasks = [];
    roadmap.phases.forEach((phase) => {
      phase.tasks.forEach((task) => {
        initialTasks.push({
          ...task,
          phaseId: phase.id,
          completed: false,
        });
      });
    });

    const initialBudget = calculateBudgetBreakdown({
      availableBudget: projectState.budget?.availableBudget || 150000,
      runwayMonths: projectState.budget?.runwayMonths || 3,
      teamSize: projectState.budget?.teamSize || 1,
      timeAvailableHoursPerWeek: projectState.budget?.timeAvailableHoursPerWeek || 20,
    });

    let currentProjectId = projectState.projectId;

    // If connected to a Supabase project, sync the selections
    if (user) {
      try {
        if (!currentProjectId) {
          const created = await createCloudProject({
            startupName: finalStartupName,
            title: finalStartupName,
            domain: projectState.problem?.domain || 'technology',
            problemStatement: projectState.problem?.problemStatement,
            affectedAudience: projectState.problem?.affectedAudience,
            constraints: projectState.problem?.constraints,
            goals: projectState.problem?.goals,
          });
          currentProjectId = created.id;
        }

        await selectCloudIdea(currentProjectId, idea.id, finalStartupName);
        await saveCloudRoadmap(currentProjectId, idea.id, roadmap);
        await syncCloudTasks(currentProjectId, initialTasks);
        await saveCloudBudget(currentProjectId, initialBudget);
        await updateVentureStage(currentProjectId, 'Overview');
        refreshProjects();
      } catch (err) {
        console.error('Failed to sync idea selection to Supabase:', err);
      }
    }

    setProjectState((prev) => ({
      ...prev,
      projectId: currentProjectId,
      startupName: finalStartupName,
      title: finalStartupName,
      lastActiveStage: 'Overview',
      selectedIdea: {
        ...idea,
        startupName: finalStartupName,
      },
      roadmap,
      tasks: initialTasks,
      budget: initialBudget,
    }));

    // Selected idea & named startup -> Venture Overview as the main workspace!
    setActiveView('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update startup name
  const handleUpdateStartupName = async (newName) => {
    const trimmed = (newName || '').trim();
    if (!trimmed) return;

    if (user && projectState.projectId) {
      try {
        await updateStartupName(projectState.projectId, trimmed);
        refreshProjects();
      } catch (err) {
        console.error('Failed to update startup name in cloud:', err);
      }
    }

    setProjectState((prev) => ({
      ...prev,
      startupName: trimmed,
      title: trimmed,
      selectedIdea: prev.selectedIdea ? { ...prev.selectedIdea, startupName: trimmed } : null,
    }));
  };

  // Update problem statement without breaking venture analysis or wiping ideas
  const handleUpdateProblemOnly = async (updatedProblem) => {
    if (user && projectState.projectId) {
      try {
        await updateCloudProjectProblem(projectState.projectId, updatedProblem);
        refreshProjects();
      } catch (err) {
        console.error('Failed to update problem statement in cloud:', err);
      }
    }

    setProjectState((prev) => ({
      ...prev,
      problem: updatedProblem,
    }));
  };

  // Explore a different direction from Overview: takes updated problem to Discover Studio
  const handleExploreNewDirection = (updatedProblem) => {
    setProjectState((prev) => ({
      ...prev,
      problem: updatedProblem,
    }));
    setActiveView('problem-discovery');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save competitor analysis to local state and Supabase (called from CompetitorAnalyzer)
  const handleSaveCompetitorAnalysis = (competitorData) => {
    setProjectState((prev) => {
      if (user && prev.projectId) {
        saveCloudCompetitorAnalysis(prev.projectId, competitorData).catch((err) =>
          console.error('Failed to save competitor analysis to Supabase:', err)
        );
      }
      return {
        ...prev,
        competitorAnalysis: competitorData,
      };
    });
  };

  // Handler to lock in and officially start the startup journey
  const handleStartJourneyOfficial = async () => {
    const startedAt = new Date().toISOString();

    if (user && projectState.projectId) {
      try {
        await updateCloudJourneyStatus(projectState.projectId, true, startedAt);
      } catch (err) {
        console.error('Failed to update journey status in Supabase:', err);
      }
    }

    setProjectState((prev) => ({
      ...prev,
      journeyStarted: true,
      journeyStartedAt: prev.journeyStartedAt || startedAt,
    }));
    setActiveView('journey-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Task checklist toggling
  const handleToggleTask = (taskId) => {
    setProjectState((prev) => {
      const updatedTasks = prev.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );

      if (user && prev.projectId) {
        syncCloudTasks(prev.projectId, updatedTasks).catch(console.error);
      }

      return {
        ...prev,
        tasks: updatedTasks,
      };
    });
  };

  // Add custom founder task
  const handleAddTask = (newTask) => {
    setProjectState((prev) => {
      const updatedTasks = [newTask, ...prev.tasks];
      if (user && prev.projectId) {
        syncCloudTasks(prev.projectId, updatedTasks).catch(console.error);
      }
      return {
        ...prev,
        tasks: updatedTasks,
      };
    });
  };

  // Add founder note / update
  const handleAddNote = (newNote) => {
    setProjectState((prev) => {
      if (user && prev.projectId) {
        saveCloudNote(prev.projectId, newNote.text).catch(console.error);
      }
      return {
        ...prev,
        notes: [newNote, ...(prev.notes || [])],
      };
    });
  };

  // Save strategic decision from Decision Simulator
  const handleSaveDecision = (decisionRecord) => {
    setProjectState((prev) => {
      const existing = prev.decisions || [];
      const filtered = existing.filter((d) => d.scenarioId !== decisionRecord.scenarioId);
      const updated = [decisionRecord, ...filtered];

      if (user && prev.projectId) {
        saveCloudDecision(prev.projectId, decisionRecord).catch(console.error);
      }

      return {
        ...prev,
        decisions: updated,
      };
    });
  };

  // Budget configuration update
  const handleUpdateBudget = (updatedBudget) => {
    setProjectState((prev) => {
      if (user && prev.projectId) {
        saveCloudBudget(prev.projectId, updatedBudget).catch(console.error);
      }
      return {
        ...prev,
        budget: updatedBudget,
      };
    });
  };

  // AI chat append - CONTINUOUS: Never restarts conversation
  const handleAddChatMessage = (newMsg) => {
    setProjectState((prev) => ({
      ...prev,
      chatHistory: [...(prev.chatHistory || []), newMsg],
    }));

    saveContinuousChatMessage(newMsg, projectState.projectId);
  };

  // Update optional Groq API Key
  const handleUpdateApiKey = (newKey) => {
    setProjectState((prev) => ({
      ...prev,
      apiKey: newKey,
    }));
  };

  // Switch to a chosen venture from ProjectsModal or Homepage
  const handleSelectProject = async (projectId) => {
    try {
      const loaded = await getFullProject(projectId);
      if (loaded) {
        setProjectState((prev) => ({
          ...prev,
          ...loaded,
          projectId: loaded.id,
          startupName: loaded.startupName || loaded.title,
          title: loaded.startupName || loaded.title,
          chatHistory: prev.chatHistory,
          apiKey: prev.apiKey,
        }));

        setActiveView('overview');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (user) {
          updateVentureStage(loaded.id, 'Overview');
          refreshProjects();
        }
      }
    } catch (err) {
      console.error('Failed to switch project:', err);
    }
  };

  // Start fresh venture (clears project form, preserves co-pilot chat)
  const handleStartNewProject = () => {
    setProjectState((prev) => ({
      ...initialProjectState,
      chatHistory: prev.chatHistory,
      apiKey: prev.apiKey,
    }));
    setActiveView('problem-discovery');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Normalize view changes from anywhere in the app with conditional auth checks
  const handleNavigateView = (view) => {
    if (view === 'ai-assistant') {
      setIsAIOpen(true);
      return;
    }
    if (view === 'profile') {
      if (!user) {
        handleRequireAuth('profile', 'Sign in or create an account to view and update your founder profile.');
        return;
      }
      setIsProfileModalOpen(true);
      return;
    }
    if (view === 'projects' || view === 'my-ventures') {
      if (!user) {
        handleRequireAuth('my_ventures', 'Sign in or create an account to view and manage your saved cloud ventures.');
        return;
      }
      setIsProjectsModalOpen(true);
      return;
    }
    if (view === 'discover') {
      setActiveView('problem-discovery');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (view === 'market-research') {
      setActiveView('market-competitors');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (view === 'execution-roadmap' || view === 'roadmap') {
      setActiveView('execution-plan');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (view === 'project-dashboard' || view === 'dashboard') {
      setActiveView('overview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (user && projectState.projectId) {
      const stageNameMap = {
        overview: 'Overview',
        'problem-discovery': 'Discover',
        'market-competitors': 'Market Research',
        validation: 'Validation',
        'execution-plan': 'Roadmap',
        analytics: 'Analytics',
        collaborations: 'Collaborations',
        'budget-advisor': 'Budget Advisor',
        'decision-simulator': 'Decision Simulator',
        'journey-dashboard': 'Journey Dashboard',
      };
      if (stageNameMap[view]) {
        updateVentureStage(projectState.projectId, stageNameMap[view]);
      }
    }

    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-space-dark)' }}>
      {/* Universal Space Backdrop */}
      <SpaceBackdrop />

      {/* Global Success Notification Toast */}
      {saveSuccessMessage && (
        <div
          style={{
            position: 'fixed',
            top: '5.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 4000,
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
            color: '#ffffff',
            borderRadius: '9999px',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Global Glass Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={handleNavigateView}
        hasActiveProject={Boolean(projectState.selectedIdea || projectState.problem?.problemStatement)}
        onOpenAuthModal={() => handleRequireAuth('general', 'Sign in to access your saved ventures and cloud workspace.')}
        onOpenProjectsModal={() => handleNavigateView('projects')}
        onOpenProfileModal={() => handleNavigateView('profile')}
      />

      {/* View Controller */}
      {activeView === 'landing' ? (
        <main>
          <HeroSection
            onStartJourney={() => {
              handleNavigateView('problem-discovery');
            }}
            onContinueVenture={(pId) => {
              const targetId = pId || cloudProjects[0]?.id;
              if (targetId && targetId !== projectState.projectId) {
                handleSelectProject(targetId);
              } else {
                handleNavigateView('overview');
              }
            }}
            onStartNewVenture={handleStartNewProject}
            onSelectVenture={handleSelectProject}
            onWatchDemo={() => setIsHowItWorksOpen(true)}
            projectState={projectState}
            userProjects={cloudProjects}
            isProjectsLoading={isProjectsLoading}
          />
          <AboutSection
            onExplore={() => {
              handleNavigateView('problem-discovery');
            }}
          />
          <FeaturesSection
            onSelectFeature={(view) => {
              handleNavigateView(view);
            }}
          />
          <ContactSection
            onStartJourney={() => {
              handleNavigateView('problem-discovery');
            }}
          />
          <Footer onNavigate={(view) => handleNavigateView(view)} />
        </main>
      ) : (
        <WorkspaceShell
          activeView={activeView}
          setActiveView={handleNavigateView}
          projectState={projectState}
          onOpenAssistant={() => setIsAIOpen(true)}
          onOpenProfile={() => handleNavigateView('profile')}
          onSaveVenture={handleSaveVenture}
          isSaving={isSaving}
        >
          {activeView === 'overview' && (
            <OverviewDashboard
              projectState={projectState}
              onNavigate={handleNavigateView}
              onOpenAssistant={() => setIsAIOpen(true)}
              onOpenProjectsModal={() => handleNavigateView('projects')}
              onSelectIdea={handleSelectIdea}
              onUpdateStartupName={handleUpdateStartupName}
              onUpdateProblemOnly={handleUpdateProblemOnly}
              onExploreNewDirection={handleExploreNewDirection}
              userProjects={cloudProjects}
              onSelectProject={handleSelectProject}
              onStartNewProject={handleStartNewProject}
              onSaveVenture={handleSaveVenture}
              isSaving={isSaving}
            />
          )}

          {activeView === 'problem-discovery' && (
            <ProblemDiscovery
              projectState={projectState}
              onIdeasGenerated={handleIdeasGenerated}
              onSelectIdea={handleSelectIdea}
              apiKey={projectState.apiKey}
            />
          )}

          {activeView === 'market-competitors' && (
            <CompetitorAnalyzer
              selectedIdea={projectState.selectedIdea}
              domain={projectState.problem?.domain}
              problemStatement={projectState.problem?.problemStatement}
              constraints={projectState.problem?.constraints}
              analysisData={projectState.competitorAnalysis}
              onSaveAnalysis={handleSaveCompetitorAnalysis}
              onProceedToRoadmap={() => handleNavigateView('execution-plan')}
            />
          )}

          {activeView === 'validation' && (
            <ValidationDashboard
              projectState={projectState}
              onNavigate={handleNavigateView}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
            />
          )}

          {activeView === 'analytics' && (
            <AnalyticsDashboard
              projectState={projectState}
              onNavigate={handleNavigateView}
              onOpenProjectsModal={() => handleNavigateView('projects')}
            />
          )}

          {activeView === 'collaborations' && (
            <CollaborationsHub
              projectState={projectState}
              onRequireAuth={handleRequireAuth}
            />
          )}

          {activeView === 'execution-plan' && (
            <ExecutionPlan
              roadmapData={projectState.roadmap}
              selectedIdea={projectState.selectedIdea}
              tasks={projectState.tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              journeyStarted={projectState.journeyStarted}
              onProceedToBudget={() => {
                handleNavigateView('budget-advisor');
              }}
              onStartJourney={handleStartJourneyOfficial}
              onSaveVenture={handleSaveVenture}
              isSaving={isSaving}
              isCloudSaved={Boolean(user && projectState.projectId)}
            />
          )}

          {activeView === 'budget-advisor' && (
            <BudgetAdvisor
              budgetState={projectState.budget || {}}
              onUpdateBudget={handleUpdateBudget}
              onProceedToDecisions={() => {
                handleNavigateView('decision-simulator');
              }}
            />
          )}

          {activeView === 'decision-simulator' && (
            <DecisionSimulator
              selectedIdea={projectState.selectedIdea}
              savedDecisions={projectState.decisions || []}
              onSaveDecision={handleSaveDecision}
              onProceedToDashboard={() => {
                handleNavigateView('journey-dashboard');
              }}
            />
          )}

          {activeView === 'journey-dashboard' && (
            <JourneyDashboard
              projectState={projectState}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onAddNote={handleAddNote}
              onNavigateTab={(tab) => {
                handleNavigateView(tab);
              }}
              onOpenAssistant={() => setIsAIOpen(true)}
            />
          )}
        </WorkspaceShell>
      )}

      {/* Interactive Walkthrough Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onStartJourney={() => {
          setIsHowItWorksOpen(false);
          handleNavigateView('problem-discovery');
        }}
      />

      {/* Auth Modal (Sign In / Sign Up) with Conditional Explanation */}
      <AuthModal
        isOpen={authModalConfig.isOpen}
        onClose={() => setAuthModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={handleAuthSuccess}
        reasonTitle={authModalConfig.reasonTitle}
        reasonDescription={authModalConfig.reasonDescription}
        defaultIsSignUp={authModalConfig.defaultIsSignUp}
      />

      {/* Profile & Account Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Projects Modal (My Ventures Cloud Manager) */}
      <ProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        activeProjectId={projectState.projectId}
        onSelectProject={handleSelectProject}
        onStartNewProject={handleStartNewProject}
        onOpenAuthModal={(title, desc) => handleRequireAuth('my_ventures', desc)}
      />

      {/* Persistent Context-Aware AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        projectState={projectState}
        apiKey={projectState.apiKey}
        onUpdateApiKey={handleUpdateApiKey}
        onAddChatMessage={handleAddChatMessage}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
