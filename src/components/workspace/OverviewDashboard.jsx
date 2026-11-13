import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Compass,
  Target,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  Layers,
  TrendingUp,
  Award,
  ListTodo,
  ShieldCheck,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Zap,
  BarChart3,
  Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllUserVenturesSummary, getUserProjects } from '../../services/projectService';

export default function OverviewDashboard({
  projectState,
  onNavigate,
  onOpenAssistant,
  onOpenProjectsModal,
  onSelectIdea
}) {
  const { user, profile } = useAuth();
  const [crossVentureData, setCrossVentureData] = useState(null);
  const [isLoadingCrossData, setIsLoadingCrossData] = useState(false);

  // Load cloud cross-venture data if authenticated
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!user) return;
      setIsLoadingCrossData(true);
      try {
        const summary = await getAllUserVenturesSummary();
        if (isMounted && summary) {
          setCrossVentureData(summary);
        }
      } catch (err) {
        console.warn('OverviewDashboard: failed to fetch cross-venture data', err);
      } finally {
        if (isMounted) setIsLoadingCrossData(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user, projectState.projectId, projectState.tasks]);

  // Aggregate authentic metrics from either cloud summary or local state
  const metrics = useMemo(() => {
    // Current active venture metrics
    const currentTasks = projectState.tasks || [];
    const currentCompletedTasks = currentTasks.filter((t) => t.completed);
    const currentPendingTasks = currentTasks.filter((t) => !t.completed);
    const currentIdeas = projectState.ideas || [];
    const currentDecisions = projectState.decisions || [];
    const currentNotes = projectState.notes || [];

    // If cloud data is loaded and has records, compute holistic user metrics
    if (crossVentureData && crossVentureData.projects && crossVentureData.projects.length > 0) {
      const allProjects = crossVentureData.projects;
      const allIdeas = crossVentureData.ideas || [];
      const allTasks = crossVentureData.tasks || [];
      const allDecisions = crossVentureData.decisions || [];
      const completedTasks = allTasks.filter((t) => t.completed);
      const pendingTasks = allTasks.filter((t) => !t.completed);
      const selectedOpportunities = allIdeas.filter((i) => i.is_selected);

      // Validation activities: completed validation tasks + logged decisions
      const validationTasksCompleted = completedTasks.filter(
        (t) => (t.category || '').toLowerCase().includes('validation') || (t.phase_id || '').includes('1')
      ).length;
      const totalValidationActivities = validationTasksCompleted + allDecisions.length;

      const overallProgress = allTasks.length > 0
        ? Math.round((completedTasks.length / allTasks.length) * 100)
        : currentTasks.length > 0
        ? Math.round((currentCompletedTasks.length / currentTasks.length) * 100)
        : 0;

      return {
        totalVentures: allProjects.length,
        totalIdeas: allIdeas.length || currentIdeas.length,
        savedOpportunities: selectedOpportunities.length || (projectState.selectedIdea ? 1 : 0),
        completedValidationActivities: totalValidationActivities || currentDecisions.length,
        pendingTasksCount: pendingTasks.length,
        completedTasksCount: completedTasks.length,
        totalTasksCount: allTasks.length,
        overallProgress,
        projectsList: allProjects,
      };
    }

    // Local / Guest Fallback (Authentic metrics from local state)
    const hasActiveVenture = Boolean(projectState.selectedIdea || projectState.problem?.problemStatement);
    const validationTasksCompleted = currentCompletedTasks.filter(
      (t) => (t.category || '').toLowerCase().includes('validation') || (t.phaseId || '').includes('1')
    ).length;
    const totalValidationActivities = validationTasksCompleted + currentDecisions.length;
    const overallProgress = currentTasks.length > 0
      ? Math.round((currentCompletedTasks.length / currentTasks.length) * 100)
      : 0;

    return {
      totalVentures: hasActiveVenture ? 1 : 0,
      totalIdeas: currentIdeas.length,
      savedOpportunities: projectState.selectedIdea ? 1 : 0,
      completedValidationActivities: totalValidationActivities,
      pendingTasksCount: currentPendingTasks.length,
      completedTasksCount: currentCompletedTasks.length,
      totalTasksCount: currentTasks.length,
      overallProgress,
      projectsList: hasActiveVenture ? [{
        id: projectState.projectId || 'local-draft',
        title: projectState.selectedIdea?.name || projectState.problem?.problemStatement?.slice(0, 30) || 'Active Venture',
        domain: projectState.problem?.domain || 'technology',
        journey_started: projectState.journeyStarted,
        created_at: projectState.journeyStartedAt || new Date().toISOString()
      }] : [],
    };
  }, [crossVentureData, projectState]);

  // Generate authentic chronological activity feed from real recorded timestamps
  const recentActivities = useMemo(() => {
    const list = [];

    // Cloud activities if available
    if (crossVentureData) {
      (crossVentureData.projects || []).forEach((p) => {
        list.push({
          id: `p_${p.id}`,
          type: 'venture_created',
          title: `Created venture: "${p.title}"`,
          subtitle: `Domain: ${p.domain || 'Technology'}`,
          timestamp: p.created_at || p.updated_at,
          icon: Compass,
          color: '#38bdf8',
        });
      });

      (crossVentureData.ideas || []).filter((i) => i.is_selected).forEach((i) => {
        list.push({
          id: `idea_${i.id}`,
          type: 'idea_selected',
          title: `Selected startup concept: "${i.name}"`,
          subtitle: i.tagline || i.category,
          timestamp: i.created_at,
          icon: Target,
          color: '#1d72fe',
        });
      });

      (crossVentureData.tasks || []).filter((t) => t.completed).slice(0, 5).forEach((t) => {
        list.push({
          id: `task_${t.id}`,
          type: 'task_completed',
          title: `Completed milestone task: "${t.title}"`,
          subtitle: `Category: ${t.category || 'Milestone'}`,
          timestamp: t.completed_at || t.created_at,
          icon: CheckCircle2,
          color: '#10b981',
        });
      });

      (crossVentureData.decisions || []).forEach((d) => {
        list.push({
          id: `dec_${d.id}`,
          type: 'decision_logged',
          title: `Strategic decision: "${d.title}"`,
          subtitle: `Selected: ${d.chosen_option}`,
          timestamp: d.created_at,
          icon: ShieldCheck,
          color: '#f59e0b',
        });
      });
    } else {
      // Local activities
      if (projectState.problem?.problemStatement) {
        list.push({
          id: 'local_discovery',
          type: 'discovery',
          title: 'Problem statement synthesized',
          subtitle: projectState.problem.domain || 'General domain',
          timestamp: new Date().toISOString(),
          icon: Compass,
          color: '#38bdf8',
        });
      }
      if (projectState.selectedIdea) {
        list.push({
          id: 'local_idea',
          type: 'idea_selected',
          title: `Selected opportunity: "${projectState.selectedIdea.name}"`,
          subtitle: projectState.selectedIdea.category,
          timestamp: new Date().toISOString(),
          icon: Target,
          color: '#1d72fe',
        });
      }
      (projectState.tasks || []).filter((t) => t.completed).forEach((t) => {
        list.push({
          id: `local_task_${t.id}`,
          type: 'task_completed',
          title: `Milestone completed: "${t.title}"`,
          subtitle: t.category,
          timestamp: new Date().toISOString(),
          icon: CheckCircle2,
          color: '#10b981',
        });
      });
      (projectState.decisions || []).forEach((d) => {
        list.push({
          id: `local_dec_${d.id || d.scenarioId}`,
          type: 'decision_logged',
          title: `Decision recorded: "${d.title}"`,
          subtitle: `Chosen: ${d.chosenOption}`,
          timestamp: d.timestamp || new Date().toISOString(),
          icon: ShieldCheck,
          color: '#f59e0b',
        });
      });
    }

    // Sort descending by timestamp
    return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 6);
  }, [crossVentureData, projectState]);

  // Upcoming milestones from pending tasks
  const upcomingMilestones = useMemo(() => {
    const tasks = projectState.tasks || [];
    return tasks
      .filter((t) => !t.completed)
      .slice(0, 4);
  }, [projectState.tasks]);

  const activeIdea = projectState.selectedIdea;
  const founderName = profile?.fullName || user?.email?.split('@')[0] || 'Founder';

  // Empty state when no venture or problem exists
  const hasNoVentures = metrics.totalVentures === 0 && !activeIdea && !projectState.problem?.problemStatement;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', color: '#ffffff' }}>
      {/* 1. Welcome Section */}
      <div
        className="glass-panel"
        style={{
          padding: '2.25rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(7, 18, 43, 0.9) 0%, rgba(15, 34, 78, 0.75) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: 'var(--cyan-glow)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                <Sparkles size={12} />
                Startup Intelligence Platform
              </span>
              {activeIdea && (
                <span
                  style={{
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    background: 'rgba(29, 114, 254, 0.2)',
                    color: '#93c5fd',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  Active: {activeIdea.name}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
              Welcome back, {founderName}
            </h1>
            <p style={{ color: 'var(--text-silver)', fontSize: '0.975rem', maxWidth: '680px', lineHeight: 1.5 }}>
              Monitor your venture trajectory, track validation milestones, and orchestrate execution from a single workspace.
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {activeIdea ? (
              <button
                onClick={() => onNavigate('execution-plan')}
                className="btn-primary-glow"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
              >
                <span>Continue "{activeIdea.name}"</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('problem-discovery')}
                className="btn-primary-glow"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
              >
                <Plus size={15} />
                <span>Discover New Opportunity</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('analytics')}
              className="btn-secondary-pill"
              style={{ padding: '0.65rem 1.15rem', fontSize: '0.875rem' }}
            >
              <BarChart3 size={15} color="#38bdf8" />
              <span>Full Analytics</span>
            </button>

            <button
              onClick={onOpenAssistant}
              className="btn-secondary-pill"
              style={{ padding: '0.65rem 1.15rem', fontSize: '0.875rem' }}
            >
              <Bot size={15} color="#38bdf8" />
              <span>AI Co-Pilot</span>
            </button>
          </div>
        </div>

        {/* Active Venture Progress Indicator */}
        {activeIdea && (
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(29, 114, 254, 0.25)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cyan-glow)',
                }}
              >
                <Target size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Focused Opportunity</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                  {activeIdea.name}
                  <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-dim)', marginLeft: '0.5rem' }}>
                    • {activeIdea.category || 'General'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ minWidth: '180px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Venture Execution</span>
                  <span style={{ color: 'var(--cyan-glow)', fontWeight: 700 }}>{metrics.overallProgress}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${metrics.overallProgress}%`,
                      background: 'linear-gradient(90deg, #1d72fe, #38bdf8)',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => onNavigate('validation')}
                className="btn-secondary-pill"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              >
                <span>Feasibility Radar</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Key Metrics Grid (All actual measured data) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Metric 1: Active Ventures */}
        <div className="glass-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em' }}>
              Active Ventures
            </span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--cyan-glow)' }}>
              <Layers size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
            {metrics.totalVentures}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {metrics.totalVentures > 0 ? (
              <span style={{ color: '#38bdf8', cursor: 'pointer' }} onClick={onOpenProjectsModal}>
                View all in manager →
              </span>
            ) : (
              'No active ventures'
            )}
          </div>
        </div>

        {/* Metric 2: Ideas Generated */}
        <div className="glass-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em' }}>
              Ideas Synthesized
            </span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(29, 114, 254, 0.15)', color: '#38bdf8' }}>
              <Compass size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
            {metrics.totalIdeas}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Across all discovery runs
          </div>
        </div>

        {/* Metric 3: Saved Opportunities */}
        <div className="glass-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em' }}>
              Saved Opportunities
            </span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Award size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
            {metrics.savedOpportunities}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Vetted for execution
          </div>
        </div>

        {/* Metric 4: Completed Validation Activities */}
        <div className="glass-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em' }}>
              Validation Activities
            </span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
            {metrics.completedValidationActivities}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Validated signals & decisions
          </div>
        </div>

        {/* Metric 5: Pending Tasks */}
        <div className="glass-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em' }}>
              Pending Tasks
            </span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <ListTodo size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
            {metrics.pendingTasksCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {metrics.completedTasksCount} completed ({metrics.overallProgress}%)
          </div>
        </div>
      </div>

      {/* 3. Empty State or Main Operational Grid */}
      {hasNoVentures ? (
        <div
          className="glass-panel"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            border: '1px dashed rgba(56, 189, 248, 0.3)',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(56, 189, 248, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              color: 'var(--cyan-glow)',
            }}
          >
            <Compass size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
            Begin Your Startup Journey
          </h2>
          <p style={{ color: 'var(--text-silver)', maxWidth: '540px', margin: '0 auto 1.75rem auto', fontSize: '0.95rem' }}>
            No ventures found in your profile yet. Submit a real-world problem statement to synthesize opportunities, analyze competitors, and build a 2-week execution roadmap.
          </p>
          <button
            onClick={() => onNavigate('problem-discovery')}
            className="btn-primary-glow"
            style={{ padding: '0.75rem 1.75rem' }}
          >
            <Plus size={16} />
            <span>Start Discovery Phase</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
          
          {/* Column A: Upcoming Milestones & Roadmap Quick Access */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Clock size={18} color="#38bdf8" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Upcoming Milestones</h3>
              </div>
              <button
                onClick={() => onNavigate('execution-plan')}
                style={{ fontSize: '0.8rem', color: 'var(--cyan-glow)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <span>Full Roadmap</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {upcomingMilestones.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {upcomingMilestones.map((t, idx) => (
                  <div
                    key={t.id || idx}
                    style={{
                      padding: '0.9rem 1rem',
                      borderRadius: '10px',
                      background: 'rgba(15, 23, 42, 0.55)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: t.category === 'Validation' ? '#f59e0b' : '#38bdf8',
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>{t.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {t.category || 'Milestone'} • {t.estimatedDays ? `${t.estimatedDays} days est.` : 'Pending'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('execution-plan')}
                      style={{
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        background: 'rgba(56, 189, 248, 0.1)',
                        color: 'var(--cyan-bright)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                      }}
                    >
                      Execute
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.75rem auto' }} />
                <div>All current milestones completed!</div>
                <button
                  onClick={() => onNavigate('execution-plan')}
                  className="btn-secondary-pill"
                  style={{ marginTop: '1rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                >
                  Add Next Sprint Tasks
                </button>
              </div>
            )}
          </div>

          {/* Column B: Recent Activity Log (Authentic Chronology) */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Calendar size={18} color="#38bdf8" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Recent Activity Feed</h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Audited Actions
              </span>
            </div>

            {recentActivities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentActivities.map((act) => {
                  const Icon = act.icon;
                  const timeFormatted = act.timestamp
                    ? new Date(act.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recent';

                  return (
                    <div
                      key={act.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.85rem',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: `${act.color}15`,
                          border: `1px solid ${act.color}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: act.color,
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <Icon size={16} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {act.title}
                        </div>
                        {act.subtitle && (
                          <div style={{ fontSize: '0.775rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {act.subtitle}
                          </div>
                        )}
                      </div>

                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                        {timeFormatted}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                No activity recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Journey Roadmap Stage Navigator */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem 2rem',
          border: '1px solid rgba(56, 189, 248, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Startup Lifecycle Stages</h3>
            <p style={{ color: 'var(--text-silver)', fontSize: '0.85rem' }}>
              Jump straight into any active module to continue refining your venture.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {[
            {
              id: 'problem-discovery',
              step: '01',
              title: 'Discover & Ideas',
              desc: 'Synthesize opportunities from real problems',
              icon: Compass,
              status: projectState.problem?.problemStatement ? 'Ready' : 'Pending',
            },
            {
              id: 'market-competitors',
              step: '02',
              title: 'Market & Competitors',
              desc: 'TAM/SAM/SOM & feature comparison matrix',
              icon: Target,
              status: projectState.competitorAnalysis ? 'Analyzed' : activeIdea ? 'Ready' : 'Locked',
            },
            {
              id: 'validation',
              step: '03',
              title: 'Feasibility Validation',
              desc: 'Interactive 5-axis feasibility radar chart',
              icon: ShieldCheck,
              status: activeIdea ? 'Ready' : 'Locked',
            },
            {
              id: 'execution-plan',
              step: '04',
              title: 'Execution Roadmap',
              desc: 'Two-week sprint milestones & task tracking',
              icon: Clock,
              status: activeIdea ? `${metrics.overallProgress}% Complete` : 'Locked',
            },
            {
              id: 'analytics',
              step: '05',
              title: 'Venture Analytics',
              desc: 'Trends, industry distribution & productivity',
              icon: BarChart3,
              status: 'Available',
            },
          ].map((stage) => {
            const Icon = stage.icon;
            const isLocked = stage.status === 'Locked';

            return (
              <div
                key={stage.id}
                onClick={() => !isLocked && onNavigate(stage.id)}
                className="glass-card"
                style={{
                  padding: '1.25rem',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.45 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--cyan-glow)' }}>{stage.step}</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        background: isLocked ? 'rgba(255,255,255,0.05)' : 'rgba(56, 189, 248, 0.15)',
                        color: isLocked ? 'var(--text-dim)' : 'var(--cyan-bright)',
                        fontWeight: 600,
                      }}
                    >
                      {stage.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <Icon size={16} color="#38bdf8" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{stage.title}</h4>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>{stage.desc}</p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: isLocked ? 'var(--text-dim)' : 'var(--cyan-glow)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginTop: '1rem',
                  }}
                >
                  <span>{isLocked ? 'Complete Previous' : 'Launch Stage'}</span>
                  {!isLocked && <ChevronRight size={13} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
