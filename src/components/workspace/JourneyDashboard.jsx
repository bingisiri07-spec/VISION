import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  TrendingUp,
  BookmarkCheck,
  Plus,
  Trash2,
  FileText,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Bot,
  AlertCircle
} from 'lucide-react';

export default function JourneyDashboard({
  projectState,
  onToggleTask,
  onAddTask,
  onAddNote,
  onNavigateTab,
  onOpenAssistant
}) {
  const [newNoteText, setNewNoteText] = useState('');
  const [customTaskTitle, setCustomTaskTitle] = useState('');
  const [customTaskCategory, setCustomTaskCategory] = useState('Validation');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  const idea = projectState.selectedIdea;
  const tasks = projectState.tasks || [];
  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const decisions = projectState.decisions || [];
  const notes = projectState.notes || [];
  const budget = projectState.budget || { availableBudget: 1500, runwayMonths: 3 };

  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote({
      id: `note_${Date.now()}`,
      text: newNoteText.trim(),
      timestamp: new Date().toISOString(),
    });
    setNewNoteText('');
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!customTaskTitle.trim()) return;
    onAddTask({
      id: `task_custom_${Date.now()}`,
      title: customTaskTitle.trim(),
      desc: 'Custom task created by founder.',
      category: customTaskCategory,
      estimatedDays: 2,
      completed: false,
    });
    setCustomTaskTitle('');
    setShowAddTaskModal(false);
  };

  if (!idea) {
    return (
      <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
        <LayoutDashboard size={48} color="#38bdf8" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
          No Active Startup Selected
        </h2>
        <p style={{ color: 'var(--text-silver)', marginBottom: '1.75rem' }}>
          To unlock the Unified Progress Dashboard, please explore Problem Discovery and select a startup opportunity.
        </p>
        <button onClick={() => onNavigateTab('problem-discovery')} className="btn-primary-glow">
          <span>Go to Problem Discovery</span>
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      
      {/* Top Project Command Bar */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Active Venture
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Started: {new Date(projectState.journeyStartedAt || Date.now()).toLocaleDateString()}
              </span>
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              {idea.name}
            </h1>
            <p style={{ color: 'var(--text-silver)', fontSize: '1.05rem', maxWidth: '780px' }}>
              "{idea.uniqueValueProp}"
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenAssistant}
              className="btn-primary-glow"
              style={{ padding: '0.75rem 1.4rem' }}
            >
              <Bot size={16} />
              <span>Ask AI Co-Pilot</span>
            </button>
            <button
              onClick={() => onNavigateTab('execution-plan')}
              className="btn-secondary-pill"
              style={{ padding: '0.75rem 1.4rem' }}
            >
              <span>View Roadmap</span>
            </button>
          </div>
        </div>

        {/* 4 Core Metric Widgets */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginTop: '2.5rem',
            paddingTop: '1.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Progress % */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Overall Roadmap Progress
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--cyan-glow)' }}>{progressPercent}%</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({completedTasks.length}/{tasks.length} tasks)</span>
            </div>
            <div style={{ height: '5px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', marginTop: '0.75rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, #1d72fe, #38bdf8)' }} />
            </div>
          </div>

          {/* Budget status */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Capital Runway
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>${budget.availableBudget || 1500}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({budget.runwayMonths || 3} mo)</span>
            </div>
            <button
              onClick={() => onNavigateTab('budget-advisor')}
              style={{ fontSize: '0.75rem', color: 'var(--cyan-glow)', marginTop: '0.75rem', fontWeight: 600, display: 'inline-block' }}
            >
              Adjust Allocations →
            </button>
          </div>

          {/* Recorded Decisions */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Saved Strategic Decisions
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>{decisions.length}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>logged</span>
            </div>
            <button
              onClick={() => onNavigateTab('decision-simulator')}
              style={{ fontSize: '0.75rem', color: 'var(--cyan-glow)', marginTop: '0.75rem', fontWeight: 600, display: 'inline-block' }}
            >
              Simulate Next Fork →
            </button>
          </div>

          {/* Next Immediate Action */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Next Up
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {pendingTasks[0]?.title || 'All Tasks Finished! 🎉'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {pendingTasks[0] ? `Est. ~${pendingTasks[0].estimatedDays || 2} days` : 'Celebrate your traction'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Task Checklist (Left) & Verified Telemetry (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}
      >
        {/* Left Column: Interactive Task Checklist */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} color="#38bdf8" />
              <span>Active Execution Checklist</span>
            </h2>

            <button
              onClick={() => setShowAddTaskModal(!showAddTaskModal)}
              className="btn-secondary-pill"
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
            >
              <Plus size={14} />
              <span>Add Custom Task</span>
            </button>
          </div>

          {/* Modal / Inline Add Task Form */}
          {showAddTaskModal && (
            <form onSubmit={handleCreateTask} className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>Add New Action Item</div>
              <input
                type="text"
                placeholder="What action needs to be executed next?"
                value={customTaskTitle}
                onChange={(e) => setCustomTaskTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(2, 6, 18, 0.6)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', marginBottom: '0.75rem' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <select
                  value={customTaskCategory}
                  onChange={(e) => setCustomTaskCategory(e.target.value)}
                  style={{ background: 'rgba(15, 23, 42, 0.8)', color: '#ffffff', padding: '0.45rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.8rem' }}
                >
                  <option value="Validation">Validation</option>
                  <option value="Product">Product</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Growth">Growth</option>
                  <option value="Operations">Operations</option>
                </select>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setShowAddTaskModal(false)} style={{ color: 'var(--text-dim)', fontSize: '0.8rem', padding: '0.4rem' }}>Cancel</button>
                  <button type="submit" className="btn-primary-glow" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Save Task</button>
                </div>
              </div>
            </form>
          )}

          {/* Task list container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.15rem',
                  borderRadius: '12px',
                  background: task.completed ? 'rgba(34, 197, 94, 0.08)' : 'rgba(15, 23, 42, 0.6)',
                  border: task.completed ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                <div style={{ color: task.completed ? '#4ade80' : 'var(--text-dim)' }}>
                  {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: task.completed ? 'var(--text-muted)' : '#ffffff',
                      textDecoration: task.completed ? 'line-through' : 'none',
                    }}
                  >
                    {task.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', gap: '0.75rem', marginTop: '0.15rem' }}>
                    <span style={{ color: 'var(--cyan-glow)' }}>{task.category}</span>
                    <span>•</span>
                    <span>~{task.estimatedDays || 2} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Verified Progress Report & Decision Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Real Generated Progress Summary */}
          <div className="glass-panel" style={{ padding: '2rem', borderLeft: '4px solid #38bdf8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cyan-glow)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
              <Sparkles size={16} />
              <span>Verified Progress Intelligence</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
              Weekly Venture Status Report
            </h3>
            
            <p style={{ color: 'var(--text-silver)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {completedTasks.length === 0 ? (
                "You are at the inception of your execution journey. Your priority for this week is to complete the first customer discovery interviews before committing any code."
              ) : (
                `You have completed ${completedTasks.length} verified tasks (${progressPercent}% of the roadmap). Recent completions include: "${completedTasks.slice(-2).map((t) => t.title).join('", "')}".`
              )}
            </p>

            <div style={{ padding: '0.85rem', background: 'rgba(2, 6, 18, 0.6)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.15)', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--cyan-bright)', fontWeight: 600 }}>Next Recommended Step: </span>
              <span style={{ color: 'var(--text-silver)' }}>
                {pendingTasks[0]?.desc || 'Continue to scale operations and prepare for pilot transactions.'}
              </span>
            </div>
          </div>

          {/* Recent Decisions Widget */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                Recorded Strategic Decisions
              </h3>
              <button
                onClick={() => onNavigateTab('decision-simulator')}
                style={{ fontSize: '0.8rem', color: 'var(--cyan-glow)', fontWeight: 600 }}
              >
                + New Decision
              </button>
            </div>

            {decisions.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                No decisions recorded yet. Visit the Decision Simulator to evaluate founder forks.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {decisions.map((d, i) => (
                  <div key={i} style={{ padding: '0.85rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>{d.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#4ade80', marginTop: '0.2rem' }}>Chose: {d.chosenOption}</div>
                    {d.userNotes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontStyle: 'italic' }}>
                        "{d.userNotes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Founder Notes & Activity Log */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
              Founder Work Log & Reflection
            </h3>

            <form onSubmit={handleCreateNote} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input
                type="text"
                placeholder="Log a customer interview takeaway or milestone..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                style={{ flex: 1, padding: '0.7rem 1rem', background: 'rgba(2, 6, 18, 0.6)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', color: '#fff', fontSize: '0.875rem' }}
              />
              <button type="submit" className="btn-secondary-pill" style={{ padding: '0.7rem 1.2rem', fontSize: '0.85rem' }}>
                Log Note
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
              {notes.length === 0 ? (
                <span style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>No log entries yet.</span>
              ) : (
                notes.map((n) => (
                  <div key={n.id} style={{ padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--text-silver)' }}>{n.text}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
