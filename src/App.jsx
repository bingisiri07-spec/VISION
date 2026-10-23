import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import SpaceBackdrop from './components/landing/SpaceBackdrop';
import HeroSection from './components/landing/HeroSection';
import AboutSection from './components/landing/AboutSection';
import FeaturesSection from './components/landing/FeaturesSection';
import ContactSection from './components/landing/ContactSection';
import Footer from './components/landing/Footer';
import HowItWorksModal from './components/landing/HowItWorksModal';

import WorkspaceShell from './components/workspace/WorkspaceShell';
import ProblemDiscovery from './components/workspace/ProblemDiscovery';
import ExecutionPlan from './components/workspace/ExecutionPlan';
import BudgetAdvisor from './components/workspace/BudgetAdvisor';
import DecisionSimulator from './components/workspace/DecisionSimulator';
import JourneyDashboard from './components/workspace/JourneyDashboard';
import AIAssistantDrawer from './components/workspace/AIAssistantDrawer';

import { loadSavedState, saveState } from './services/storage';
import { generateExecutionPlan } from './services/roadmapEngine';
import { calculateBudgetBreakdown } from './services/budgetEngine';

export default function App() {
  const [projectState, setProjectState] = useState(() => loadSavedState());
  const [activeView, setActiveView] = useState('landing');
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Automatically synchronize state to localStorage whenever modified
  useEffect(() => {
    saveState(projectState);
  }, [projectState]);

  // Handler when ideas are generated from Problem Discovery
  const handleIdeasGenerated = ({ problem, ideas }) => {
    setProjectState((prev) => ({
      ...prev,
      problem,
      ideas,
    }));
  };

  // Handler when user selects a startup idea to build
  const handleSelectIdea = (idea) => {
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
  const handleStartJourneyOfficial = () => {
    setProjectState((prev) => ({
      ...prev,
      journeyStarted: true,
      journeyStartedAt: prev.journeyStartedAt || new Date().toISOString(),
    }));
    setActiveView('journey-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Task checklist toggling
  const handleToggleTask = (taskId) => {
    setProjectState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
    }));
  };

  // Add custom founder task
  const handleAddTask = (newTask) => {
    setProjectState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  };

  // Add founder note / update
  const handleAddNote = (newNote) => {
    setProjectState((prev) => ({
      ...prev,
      notes: [newNote, ...(prev.notes || [])],
    }));
  };

  // Save strategic decision from Decision Simulator
  const handleSaveDecision = (decisionRecord) => {
    setProjectState((prev) => {
      const existing = prev.decisions || [];
      const filtered = existing.filter((d) => d.scenarioId !== decisionRecord.scenarioId);
      return {
        ...prev,
        decisions: [decisionRecord, ...filtered],
      };
    });
  };

  // Budget configuration update
  const handleUpdateBudget = (updatedBudget) => {
    setProjectState((prev) => ({
      ...prev,
      budget: updatedBudget,
    }));
  };

  // AI chat append
  const handleAddChatMessage = (newMsg) => {
    setProjectState((prev) => ({
      ...prev,
      chatHistory: [...(prev.chatHistory || []), newMsg],
    }));
  };

  // Update optional Groq API Key
  const handleUpdateApiKey = (newKey) => {
    setProjectState((prev) => ({
      ...prev,
      apiKey: newKey,
    }));
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-space-dark)' }}>
      {/* Universal Space Backdrop */}
      <SpaceBackdrop />

      {/* Global Glass Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        hasActiveProject={Boolean(projectState.selectedIdea)}
      />

      {/* View Controller */}
      {activeView === 'landing' ? (
        <main>
          <HeroSection
            onStartJourney={() => {
              setActiveView('problem-discovery');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onWatchDemo={() => setIsHowItWorksOpen(true)}
          />
          <AboutSection
            onExplore={() => {
              setActiveView('problem-discovery');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <FeaturesSection
            onSelectFeature={(view) => {
              setActiveView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <ContactSection
            onStartJourney={() => {
              setActiveView('problem-discovery');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <Footer onNavigate={(view) => setActiveView(view)} />
        </main>
      ) : (
        <WorkspaceShell
          activeView={activeView}
          setActiveView={setActiveView}
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
                setActiveView('budget-advisor');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onStartJourney={handleStartJourneyOfficial}
            />
          )}

          {activeView === 'budget-advisor' && (
            <BudgetAdvisor
              budgetState={projectState.budget || {}}
              onUpdateBudget={handleUpdateBudget}
              onProceedToDecisions={() => {
                setActiveView('decision-simulator');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {activeView === 'decision-simulator' && (
            <DecisionSimulator
              selectedIdea={projectState.selectedIdea}
              savedDecisions={projectState.decisions || []}
              onSaveDecision={handleSaveDecision}
              onProceedToDashboard={() => {
                setActiveView('journey-dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
                setActiveView(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
          setActiveView('problem-discovery');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
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
