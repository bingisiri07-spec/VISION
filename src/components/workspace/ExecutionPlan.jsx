import React, { useState, useMemo } from 'react';
import {
  Map,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Wrench,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Layers,
  Award,
  Filter,
  Plus,
  CheckSquare,
  ListTodo
} from 'lucide-react';

export default function ExecutionPlan({
  roadmapData,
  selectedIdea,
  tasks = [],
  onToggleTask,
  onAddTask,
  onProceedToBudget,
  onStartJourney,
  journeyStarted
}) {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [taskFilter, setTaskFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDays, setCustomDays] = useState(2);
  const [customCategory, setCustomCategory] = useState('Validation');

  if (!roadmapData || !selectedIdea) {
    return (
      <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', maxWidth: '720px', margin: '0 auto', color: '#ffffff' }}>
        <Map size={48} color="#38bdf8" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
          No Idea Selected Yet
        </h2>
        <p style={{ color: 'var(--text-silver)', marginBottom: '1.5rem' }}>
          Please go to Problem Discovery and select a startup idea to generate your tailored execution roadmap.
        </p>
      </div>
    );
  }

  const toggleTask = (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const currentPhase = roadmapData.phases[activePhaseIndex] || roadmapData.phases[0];

  // Map phase tasks and merge with active tasks status
  const phaseTasks = useMemo(() => {
    if (!currentPhase) return [];
    return currentPhase.tasks.map((task) => {
      const live = tasks.find((t) => t.id === task.id || t.title === task.title);
      return {
        ...task,
        completed: live ? live.completed : false,
        liveId: live ? live.id : task.id
      };
    });
  }, [currentPhase, tasks]);

  // Filter tasks based on selected filter
  const filteredTasks = useMemo(() => {
    if (taskFilter === 'pending') return phaseTasks.filter((t) => !t.completed);
    if (taskFilter === 'completed') return phaseTasks.filter((t) => t.completed);
    return phaseTasks;
  }, [phaseTasks, taskFilter]);

  // Overall Task Completion stats
  const totalTasks = tasks.length > 0 ? tasks.length : roadmapData.phases.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // Phase completion stats
  const phaseCompletedCount = phaseTasks.filter((t) => t.completed).length;
  const phaseProgress = phaseTasks.length > 0 ? Math.round((phaseCompletedCount / phaseTasks.length) * 100) : 0;

  const handleAddCustomTaskSubmit = (e) => {
    e.preventDefault();
    if (!customTitle.trim() || !onAddTask) return;

    onAddTask({
      id: `task_custom_${Date.now()}`,
      phaseId: currentPhase.id,
      title: customTitle.trim(),
      desc: 'Custom milestone created by founder.',
      category: customCategory,
      estimatedDays: Number(customDays) || 2,
      completed: false,
      isCustom: true
    });

    setCustomTitle('');
    setShowAddCustomModal(false);
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', color: '#ffffff' }}>
      
      {/* 1. Header Command Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(56, 189, 248, 0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--cyan-glow)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, marginBottom: '0.35rem' }}>
              Feature 03 // 2-Week Phased Execution Plan
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Execution Roadmap: {selectedIdea.name}
            </h1>
            <p style={{ color: 'var(--text-silver)', fontSize: '1.05rem', maxWidth: '780px' }}>
              Sequential two-week milestones to move from problem-solution validation to an MVP prototype without wasted capital.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setShowAddCustomModal(true)}
              className="btn-secondary-pill"
            >
              <Plus size={15} color="#38bdf8" />
              <span>Add Custom Milestone</span>
            </button>

            <button
              onClick={onProceedToBudget}
              className="btn-secondary-pill"
            >
              <DollarSign size={16} />
              <span>Configure Budget</span>
            </button>

            {!journeyStarted && (
              <button
                onClick={onStartJourney}
                className="btn-primary-glow"
              >
                <span>Commit to Venture Journey</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Global Progress Bar */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-silver)', fontWeight: 600 }}>
              Overall Roadmap Progress: <span style={{ color: 'var(--cyan-glow)', fontWeight: 700 }}>{completedTasksCount}/{totalTasks} Tasks Completed ({progressPercent}%)</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Target Window: {roadmapData.overview.estimatedTimelineWeeks} Weeks
            </span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #1d72fe, #38bdf8)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. Visual Milestone Timeline (Phases Ribbon) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        {roadmapData.phases.map((phase, idx) => {
          const isActive = idx === activePhaseIndex;
          const pTasks = tasks.filter((t) => t.phaseId === phase.id);
          const pCompleted = pTasks.filter((t) => t.completed).length;
          const pPercent = pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : 0;

          return (
            <div
              key={phase.id}
              onClick={() => setActivePhaseIndex(idx)}
              style={{
                textAlign: 'left',
                padding: '1.35rem',
                borderRadius: '14px',
                background: isActive ? 'rgba(29, 114, 254, 0.22)' : 'rgba(15, 23, 42, 0.55)',
                border: isActive ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isActive ? '0 0 20px rgba(56, 189, 248, 0.2)' : 'none',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      color: isActive ? 'var(--cyan-bright)' : 'var(--text-dim)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Phase 0{idx + 1} // {phase.timeframe}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: pPercent === 100 ? '#34d399' : 'var(--text-muted)', fontWeight: 600 }}>
                    {pPercent}%
                  </span>
                </div>

                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.65rem' }}>
                  {phase.title.split(':')[1] || phase.title}
                </div>
              </div>

              {/* Mini Phase Progress */}
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pPercent}%`, background: pPercent === 100 ? '#10b981' : '#38bdf8' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Active Phase Deep Dive */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--cyan-glow)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
              Active Stage Focus // {currentPhase.timeframe}
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
              {currentPhase.title}
            </h2>
            <p style={{ color: 'var(--text-silver)', fontSize: '0.975rem', marginTop: '0.35rem', maxWidth: '720px' }}>
              {currentPhase.objective}
            </p>
          </div>

          {/* Filter Tasks */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                display: 'flex',
                padding: '0.2rem',
                borderRadius: '9999px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {['all', 'pending', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTaskFilter(f)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    background: taskFilter === f ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: taskFilter === f ? 'var(--cyan-bright)' : 'var(--text-dim)',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Phase Meta Summary Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            padding: '1.25rem',
            background: 'rgba(10, 25, 60, 0.4)',
            borderRadius: '12px',
            marginBottom: '2rem',
            border: '1px solid rgba(56, 189, 248, 0.15)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--cyan-glow)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <Users size={14} />
              <span>Required Founder Capabilities</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {currentPhase.skillsNeeded.map((skill, i) => (
                <span key={i} style={{ fontSize: '0.775rem', padding: '0.2rem 0.55rem', borderRadius: '6px', background: 'rgba(29, 114, 254, 0.15)', color: '#ffffff', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--cyan-glow)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <Wrench size={14} />
              <span>Recommended Lean Tools</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {currentPhase.toolsRecommended.map((tool, i) => (
                <span key={i} style={{ fontSize: '0.775rem', padding: '0.2rem 0.55rem', borderRadius: '6px', background: 'rgba(30, 41, 59, 0.6)', color: 'var(--text-silver)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Task List with Direct Checklist Toggling */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
              Stage Action Checklist ({filteredTasks.length} Milestones)
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Check to record completion
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const isExpanded = expandedTasks[task.id];
                const isCompleted = task.completed;

                return (
                  <div
                    key={task.id}
                    style={{
                      background: isCompleted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 23, 42, 0.55)',
                      border: isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '1.2rem',
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                        {/* Interactive Checkbox */}
                        <button
                          onClick={() => onToggleTask && onToggleTask(task.liveId || task.id)}
                          style={{
                            color: isCompleted ? '#10b981' : 'var(--text-dim)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px'
                          }}
                          title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                        >
                          {isCompleted ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                        </button>

                        <div style={{ flex: 1 }}>
                          <div
                            onClick={() => toggleTask(task.id)}
                            style={{
                              fontSize: '0.975rem',
                              fontWeight: 600,
                              color: isCompleted ? 'var(--text-dim)' : '#ffffff',
                              textDecoration: isCompleted ? 'line-through' : 'none',
                              cursor: 'pointer'
                            }}
                          >
                            {task.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', gap: '0.75rem', marginTop: '0.15rem' }}>
                            <span style={{ color: task.category === 'Validation' ? '#fbbf24' : '#38bdf8' }}>
                              {task.category}
                            </span>
                            <span>•</span>
                            <span>Estimated ~{task.estimatedDays} days</span>
                            {task.isCustom && <span>• <strong style={{ color: '#93c5fd' }}>Custom Founder Task</strong></span>}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleTask(task.id)}
                        style={{ color: 'var(--text-dim)', padding: '4px' }}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', color: 'var(--text-silver)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                        <p>{task.desc}</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                No tasks match current filter.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Funding Options Pathways */}
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--cyan-glow)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
            Capital & Financing Pathways
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
            Financing Options for {selectedIdea.name}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {roadmapData.fundingOptions.map((f, i) => (
            <div
              key={i}
              className="glass-card"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                  {f.type}
                </h3>
                <p style={{ color: 'var(--text-silver)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {f.desc}
                </p>
              </div>

              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div><span style={{ color: '#34d399', fontWeight: 600 }}>Pros: </span><span style={{ color: 'var(--text-silver)' }}>{f.pros}</span></div>
                <div><span style={{ color: '#f87171', fontWeight: 600 }}>Cons: </span><span style={{ color: 'var(--text-silver)' }}>{f.cons}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Milestone Modal */}
      {showAddCustomModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(2, 6, 18, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Add Milestone to {currentPhase.title.split(':')[0]}
            </h3>
            <p style={{ color: 'var(--text-silver)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Insert a custom task directly into this phase's execution track.
            </p>

            <form onSubmit={handleAddCustomTaskSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Milestone Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deploy Stripe checkout on staging"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#ffffff',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="Validation">Validation</option>
                    <option value="Development">Development</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Estimated Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#ffffff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="btn-secondary-pill"
                  style={{ padding: '0.55rem 1.15rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-glow"
                  style={{ padding: '0.55rem 1.25rem' }}
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
