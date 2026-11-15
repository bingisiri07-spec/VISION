import React, { useState } from 'react';
import {
  LayoutDashboard,
  Compass,
  Target,
  ShieldCheck,
  Clock,
  BarChart3,
  Users,
  DollarSign,
  GitFork,
  Bot,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Layers,
  ArrowLeft,
  User,
  Sparkles
} from 'lucide-react';

export default function WorkspaceShell({
  activeView,
  setActiveView,
  projectState,
  onOpenAssistant,
  onOpenProfile,
  children
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const hasIdea = Boolean(projectState.selectedIdea);

  // Core navigation sections matching Prompt Section 3
  const navSections = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
      disabled: false,
      desc: 'Startup health & milestones'
    },
    {
      id: 'problem-discovery',
      label: 'Discover',
      icon: Compass,
      badge: projectState.problem?.problemStatement ? 'Draft' : null,
      disabled: false,
      desc: 'Problems & idea synthesis'
    },
    {
      id: 'market-competitors',
      label: 'Market Research',
      icon: Target,
      badge: projectState.competitorAnalysis ? 'Ready' : null,
      disabled: !hasIdea,
      desc: 'TAM/SAM & competitors'
    },
    {
      id: 'validation',
      label: 'Validation',
      icon: ShieldCheck,
      badge: hasIdea ? `${projectState.selectedIdea?.feasibilityScore || 75}` : null,
      disabled: !hasIdea,
      desc: '5-Axis feasibility radar'
    },
    {
      id: 'execution-plan',
      label: 'Roadmap',
      icon: Clock,
      badge: null,
      disabled: !hasIdea,
      desc: 'Two-week sprint checklist'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
      disabled: false,
      desc: 'Trends & productivity'
    },
    {
      id: 'collaborations',
      label: 'Collaborations',
      icon: Users,
      badge: null,
      disabled: false,
      desc: 'Founder network & roles'
    }
  ];

  // Secondary tools (Budget Advisor, Decision Simulator)
  const secondaryTools = [
    { id: 'budget-advisor', label: 'Budget Advisor', icon: DollarSign, disabled: !hasIdea },
    { id: 'decision-simulator', label: 'Decision Simulator', icon: GitFork, disabled: !hasIdea }
  ];

  const handleNavClick = (viewId) => {
    setActiveView(viewId);
    setMobileDrawerOpen(false);
  };

  const activeVentureName = projectState.startupName || projectState.title || (projectState.selectedIdea
    ? projectState.selectedIdea.name
    : projectState.problem?.problemStatement
    ? 'Draft Discovery'
    : 'New Venture');

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--bg-space-dark)',
        position: 'relative',
        zIndex: 1,
        paddingTop: '4.75rem', // Space for global navbar
      }}
    >
      {/* 1. DESKTOP COLLAPSIBLE SIDEBAR */}
      <aside
        className="workspace-sidebar"
        style={{
          width: sidebarCollapsed ? '76px' : '260px',
          background: 'rgba(7, 18, 43, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRight: '1px solid rgba(56, 189, 248, 0.16)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'sticky',
          top: '4.75rem',
          height: 'calc(100vh - 4.75rem)',
          zIndex: 90,
          flexShrink: 0
        }}
      >
        {/* Top: Active Venture Card & Collapse Trigger */}
        <div>
          <div
            style={{
              padding: sidebarCollapsed ? '1rem 0.5rem' : '1.25rem 1.25rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'space-between',
              gap: '0.5rem'
            }}
          >
            {!sidebarCollapsed && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    color: 'var(--cyan-glow)',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    display: 'block',
                    marginBottom: '0.2rem'
                  }}
                >
                  Active Workspace
                </span>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={activeVentureName}
                >
                  {activeVentureName}
                </div>
              </div>
            )}

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                color: 'var(--text-silver)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navSections.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const isDisabled = item.disabled;

              return (
                <button
                  key={item.id}
                  onClick={() => !isDisabled && handleNavClick(item.id)}
                  disabled={isDisabled}
                  title={sidebarCollapsed ? `${item.label} - ${item.desc}` : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: sidebarCollapsed ? '0.7rem 0' : '0.65rem 0.9rem',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.35 : 1,
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(29, 114, 254, 0.25) 0%, rgba(37, 99, 235, 0.15) 100%)'
                      : 'transparent',
                    border: isActive ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                    color: isActive ? '#ffffff' : 'var(--text-silver)',
                    transition: 'var(--transition-fast)',
                    position: 'relative'
                  }}
                >
                  <Icon size={18} color={isActive ? '#38bdf8' : isDisabled ? '#64748b' : '#94a3b8'} />
                  
                  {!sidebarCollapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: '0.875rem' }}>{item.label}</span>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '9999px',
                            background: 'rgba(56, 189, 248, 0.2)',
                            color: 'var(--cyan-bright)',
                            fontWeight: 700
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Active Indicator Line */}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        left: '2px',
                        top: '15%',
                        height: '70%',
                        width: '3px',
                        background: '#38bdf8',
                        borderRadius: '2px'
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Secondary Tools Header */}
          {!sidebarCollapsed && (
            <div style={{ padding: '0.75rem 1.25rem 0.35rem 1.25rem', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
              Strategic Utilities
            </div>
          )}

          <div style={{ padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {secondaryTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeView === tool.id;
              const isDisabled = tool.disabled;

              return (
                <button
                  key={tool.id}
                  onClick={() => !isDisabled && handleNavClick(tool.id)}
                  disabled={isDisabled}
                  title={sidebarCollapsed ? tool.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: sidebarCollapsed ? '0.65rem 0' : '0.55rem 0.9rem',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.3 : 1,
                    background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    color: isActive ? 'var(--cyan-glow)' : 'var(--text-muted)',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <Icon size={16} />
                  {!sidebarCollapsed && <span>{tool.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom AI Co-Pilot Launcher */}
        <div
          style={{
            padding: sidebarCollapsed ? '0.75rem 0.5rem' : '1rem 1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(2, 6, 18, 0.5)'
          }}
        >
          <button
            onClick={onOpenAssistant}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              gap: '0.65rem',
              padding: sidebarCollapsed ? '0.65rem' : '0.65rem 0.9rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(29, 114, 254, 0.2), rgba(56, 189, 248, 0.15))',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Bot size={18} color="#38bdf8" />
            {!sidebarCollapsed && <span>AI Co-Pilot</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE VIEWPORT */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: '2rem 1.5rem 5rem 1.5rem',
          overflowX: 'hidden'
        }}
        className="workspace-viewport"
      >
        <div className="container" style={{ maxWidth: '1360px', padding: 0 }}>
          
          {/* Top Quick Action / Breadcrumb Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* Breadcrumb + Home link */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <button
                onClick={() => setActiveView('landing')}
                className="btn-secondary-pill"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
              >
                <ArrowLeft size={13} />
                <span>Home</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                <span>VISION</span>
                <span>/</span>
                <span style={{ color: 'var(--cyan-bright)', fontWeight: 600 }}>
                  {activeView.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="mobile-sidebar-toggle"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#ffffff',
                fontSize: '0.8rem'
              }}
            >
              <Menu size={16} />
              <span>Workspace Menu</span>
            </button>
          </div>

          {/* Render Active View Content */}
          {children}
        </div>
      </main>

      {/* 3. MOBILE WORKSPACE NAVIGATION DRAWER */}
      {mobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(2, 6, 18, 0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 3000,
            display: 'flex'
          }}
        >
          <div
            style={{
              width: '80%',
              maxWidth: '300px',
              height: '100%',
              background: 'rgba(7, 18, 43, 0.98)',
              borderRight: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: '#ffffff' }}>
                  WORKSPACE
                </span>
                <button onClick={() => setMobileDrawerOpen(false)} style={{ color: '#ffffff' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navSections.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => !item.disabled && handleNavClick(item.id)}
                      disabled={item.disabled}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: isActive ? 'rgba(29, 114, 254, 0.3)' : 'transparent',
                        color: isActive ? '#ffffff' : 'var(--text-silver)',
                        fontSize: '0.95rem',
                        opacity: item.disabled ? 0.4 : 1
                      }}
                    >
                      <Icon size={18} color={isActive ? '#38bdf8' : '#94a3b8'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                setMobileDrawerOpen(false);
                onOpenAssistant();
              }}
              className="btn-primary-glow"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Bot size={18} />
              <span>Ask AI Co-Pilot</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating AI Button (Fixed at bottom right) */}
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
          padding: '0.85rem 1.35rem',
          borderRadius: '9999px',
          background: 'linear-gradient(135deg, #1d72fe, #2563eb)',
          border: '1px solid rgba(147, 197, 253, 0.4)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.875rem',
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

      {/* Media Queries for responsive sidebar */}
      <style>{`
        @media (max-width: 900px) {
          .workspace-sidebar {
            display: none !important;
          }
          .mobile-sidebar-toggle {
            display: inline-flex !important;
          }
          .workspace-viewport {
            padding: 1.5rem 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
