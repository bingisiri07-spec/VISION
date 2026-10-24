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

import WorkspaceShell from './components/workspace/WorkspaceShell';
import ProblemDiscovery from './components/workspace/ProblemDiscovery';
import ExecutionPlan from './components/workspace/ExecutionPlan';
import BudgetAdvisor from './components/workspace/BudgetAdvisor';
import DecisionSimulator from './components/workspace/DecisionSimulator';
import JourneyDashboard from './components/workspace/JourneyDashboard';
import AIAssistantDrawer from './components/workspace/AIAssistantDrawer';

import { AuthProvider, useAuth } from './context/AuthContext';
import { loadSavedState, saveState, initialProjectState } from './services/storage';
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
} from './services/projectService';

function AppContent() {
  const { user } = useAuth();
  const [projectState, setProjectState] = useState(() => loadSavedState());
  const [activeView, setActiveView] = useState('landing');
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const migrationAttempted = useRef(false);

  // Synchronize state to localStorage whenever modified
  useEffect(() => {
    saveState(projectState);
  }, [projectState]);

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
  }, [user]);

  // Handle automatic migration of draft localStorage project upon user sign-in
  useEffect(() => {
    if (!user || migrationAttempted.current) return;
    migrationAttempted.current = true;

    async function handleInitialCloudSync() {
      try {
        const cloudProjects = await getUserProjects();

        // If user already has cloud projects and local state has no unsaved project, load their latest
        if (cloudProjects.length > 0 && !projectState.projectId) {
          const latest = await getFullProject(cloudProjects[0].id);
          if (latest) {
            setProjectState((prev) => ({
              ...prev,
              ...latest,
              projectId: latest.id,
              // Keep continuous chat history intact
              chatHistory: prev.chatHistory,
              apiKey: prev.apiKey,
            }));
            return;
          }
        }

        // If user has a local draft in localStorage that isn't yet in Supabase, migrate it
        if (projectState.problem?.problemStatement && !projectState.projectId) {
          const newProjectId = await migrateLocalStateToSupabase(projectState);
          if (newProjectId) {
            setProjectState((prev) => ({
              ...prev,
              projectId: newProjectId,
            }));
          }
        }
      } catch (err) {
        console.warn('Initial cloud synchronization check note:', err);
      }
    }

    handleInitialCloudSync();
  }, [user]);

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

  // Handler when user selects a startup idea to build
  const handleSelectIdea = async (idea) => {
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
      availableBudget: projectState.budget?.availableBudget || 1500,
      runwayMonths: projectState.budget?.runwayMonths || 3,
      teamSize: projectState.budget?.teamSize || 1,
      timeAvailableHoursPerWeek: projectState.budget?.timeAvailableHoursPerWeek || 20,
    });

    // If connected to a Supabase project, sync the selections
    if (user && projectState.projectId) {
      try {
        await selectCloudIdea(projectState.projectId, idea.id, idea.name);
        await saveCloudRoadmap(projectState.projectId, idea.id, roadmap);
        await syncCloudTasks(projectState.projectId, initialTasks);
        await saveCloudBudget(projectState.projectId, initialBudget);
      } catch (err) {
        console.error('Failed to sync idea selection to Supabase:', err);
      }
    }

    setProjectState((prev) => ({
      ...prev,
      selectedIdea: idea,
      roadmap,
      tasks: initialTasks,
      budget: initialBudget,
    }));

    setActiveView('execution-plan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // Save continuously to persistent storage & Supabase
    saveContinuousChatMessage(newMsg, projectState.projectId);
  };

  // Update optional Groq API Key
  const handleUpdateApiKey = (newKey) => {
    setProjectState((prev) => ({
      ...prev,
      apiKey: newKey,
    }));
  };

  // Switch to a chosen venture from ProjectsModal
  const handleSelectProject = async (projectId) => {
    try {
      const loaded = await getFullProject(projectId);
      if (loaded) {
        setProjectState((prev) => ({
          ...prev,
          ...loaded,
          projectId: loaded.id,
          // CRITICAL: Retain continuous chat history so co-pilot memory is never wiped!
          chatHistory: prev.chatHistory,
          apiKey: prev.apiKey,
        }));

        if (loaded.journeyStarted) {
          setActiveView('journey-dashboard');
        } else if (loaded.selectedIdea) {
          setActiveView('execution-plan');
        } else {
          setActiveView('problem-discovery');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Failed to switch project:', err);
    }
  };

  // Start fresh venture (clears project form, preserves co-pilot chat)
  const handleStartNewProject = () => {
    setProjectState((prev) => ({
      ...initialProjectState,
      // Retain continuous chat history across projects
      chatHistory: prev.chatHistory,
      apiKey: prev.apiKey,
    }));
    setActiveView('problem-discovery');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Normalize view changes from anywhere in the app
  const handleNavigateView = (view) => {
    if (view === 'ai-assistant') {
      setIsAIOpen(true);
      return;
    }
    if (view === 'execution-roadmap') {
      setActiveView('execution-plan');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (view === 'project-dashboard') {
      setActiveView('journey-dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-space-dark)' }}>
      {/* Universal Space Backdrop */}
      <SpaceBackdrop />

      {/* Global Glass Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={handleNavigateView}
        hasActiveProject={Boolean(projectState.selectedIdea)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProjectsModal={() => setIsProjectsModalOpen(true)}
      />

      {/* View Controller */}
      {activeView === 'landing' ? (
        <main>
          <HeroSection
            onStartJourney={() => {
              handleNavigateView('problem-discovery');
            }}
            onWatchDemo={() => setIsHowItWorksOpen(true)}
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
        >
          {activeView === 'problem-discovery' && (
            <ProblemDiscovery
              projectState={projectState}
              onIdeasGenerated={handleIdeasGenerated}
              onSelectIdea={handleSelectIdea}
              apiKey={projectState.apiKey}
            />
          )}

          {activeView === 'execution-plan' && (
            <ExecutionPlan
              roadmapData={projectState.roadmap}
              selectedIdea={projectState.selectedIdea}
              journeyStarted={projectState.journeyStarted}
              onProceedToBudget={() => {
                handleNavigateView('budget-advisor');
              }}
              onStartJourney={handleStartJourneyOfficial}
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

      {/* Auth Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Projects Modal (My Ventures Cloud Manager) */}
      <ProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        activeProjectId={projectState.projectId}
        onSelectProject={handleSelectProject}
        onStartNewProject={handleStartNewProject}
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
