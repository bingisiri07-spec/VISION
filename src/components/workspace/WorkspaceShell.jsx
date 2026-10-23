import React from 'react';
import { ArrowLeft, Map, DollarSign, GitFork, LayoutDashboard, Lightbulb, Bot, Sparkles } from 'lucide-react';

export default function WorkspaceShell({
  activeView,
  setActiveView,
  projectState,
  onOpenAssistant,
  children
}) {
  const steps = [
    { id: 'problem-discovery', label: '1. Discovery & Ideas', icon: <Lightbulb size={15} /> },
    { id: 'execution-plan', label: '2. Execution Plan', icon: <Map size={15} />, disabled: !projectState.selectedIdea },
    { id: 'budget-advisor', label: '3. Budget Advisor', icon: <DollarSign size={15} />, disabled: !projectState.selectedIdea },
    { id: 'decision-simulator', label: '4. Decision Simulator', icon: <GitFork size={15} />, disabled: !projectState.selectedIdea },
    { id: 'journey-dashboard', label: '5. Progress Dashboard', icon: <LayoutDashboard size={15} />, disabled: !projectState.selectedIdea },
  ];

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        paddingTop: '6.5rem',
        paddingBottom: '5rem',
      }}
    >
      <div className="container">
        {/* Top Workspace Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2.5rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setActiveView('landing')}
              className="btn-secondary-pill"
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </button>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--cyan-glow)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
                VISION // {projectState.selectedIdea ? projectState.selectedIdea.category : 'Interactive Platform'}
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                {projectState.selectedIdea ? projectState.selectedIdea.name : 'From Problem to Possibility'}
              </h2>
            </div>
          </div>

          {/* Workflow Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              overflowX: 'auto',
              padding: '0.35rem',
              background: 'rgba(15, 23, 42, 0.65)',
              borderRadius: '9999px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
            }}
          >
            {steps.map((s) => {
              const isActive = activeView === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => !s.disabled && setActiveView(s.id)}
                  disabled={s.disabled}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: s.disabled ? 'not-allowed' : 'pointer',
                    opacity: s.disabled ? 0.35 : 1,
                    background: isActive ? 'linear-gradient(135deg, #1d72fe 0%, #2563eb 100%)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-silver)',
                    transition: 'var(--transition-fast)',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive ? '0 0 15px rgba(29, 114, 254, 0.5)' : 'none',
                  }}
                >
                  {s.icon}
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Injected Content for Active View */}
        {children}
      </div>

      {/* Floating AI Co-Pilot Toggle Button */}
      <button
        onClick={onOpenAssistant}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 1500,
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.85rem 1.4rem',
          borderRadius: '9999px',
          background: 'linear-gradient(135deg, #1d72fe, #2563eb)',
          border: '1px solid rgba(147, 197, 253, 0.4)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: '0 0 25px rgba(29, 114, 254, 0.6), 0 4px 12px rgba(0, 0, 0, 0.4)',
          cursor: 'pointer',
          transition: 'var(--transition-normal)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
      >
        <div style={{ position: 'relative' }}>
          <Bot size={20} />
          <span style={{ position: 'absolute', top: -2, right: -2, width: '8px', height: '8px', borderRadius: '50%', background: '#67e8f9', boxShadow: '0 0 6px #67e8f9' }} />
        </div>
        <span>AI Co-Pilot</span>
      </button>
    </div>
  );
}
