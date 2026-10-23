import React, { useState } from 'react';
import {
  Map,
  CheckCircle2,
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
  Award
} from 'lucide-react';

export default function ExecutionPlan({
  roadmapData,
  selectedIdea,
  onProceedToBudget,
  onStartJourney,
  journeyStarted
}) {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [expandedTasks, setExpandedTasks] = useState({});

  if (!roadmapData || !selectedIdea) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
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

  const currentPhase = roadmapData.phases[activePhaseIndex];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Banner */}
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
              Feature 02 // Phased Execution Roadmap
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Execution Roadmap: {selectedIdea.name}
            </h1>
            <p style={{ color: 'var(--text-silver)', fontSize: '1.05rem', maxWidth: '780px' }}>
              Structured implementation roadmap divided into sequential phases.
              Follow this to move from early customer discovery to a lean launch without wasted capital.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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
                <span>Start My Journey</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Quick Highlights Metrics Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600 }}>Estimated Runway</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>{roadmapData.overview.estimatedTimelineWeeks} Weeks</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600 }}>Estimated Lean Budget</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--cyan-bright)' }}>{roadmapData.overview.estimatedBudgetRange}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600 }}>Target Early Adopters</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-silver)' }}>{roadmapData.overview.targetAudience}</div>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Info size={16} color="#38bdf8" />
          <span>{roadmapData.overview.disclaimer}</span>
        </div>
      </div>

      {/* Phase Navigator Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {roadmapData.phases.map((phase, idx) => {
          const isActive = idx === activePhaseIndex;
          return (
            <button
              key={phase.id}
              onClick={() => setActivePhaseIndex(idx)}
              style={{
                textAlign: 'left',
                padding: '1.25rem',
                borderRadius: '14px',
                background: isActive ? 'rgba(29, 114, 254, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                border: isActive ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isActive ? '0 0 20px rgba(56, 189, 248, 0.25)' : 'none',
                transition: 'var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? 'var(--cyan-glow)' : 'var(--text-dim)', textTransform: 'uppercase' }}>
                  {phase.timeframe}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {phase.tasks.length} Tasks
                </span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                {phase.title.split(':')[1] || phase.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Phase Deep Dive */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--cyan-glow)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
              Active Stage Focus // {currentPhase.timeframe}
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
              {currentPhase.title}
            </h2>
            <p style={{ color: 'var(--text-silver)', fontSize: '1rem', marginTop: '0.35rem' }}>
              {currentPhase.objective}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ padding: '0.5rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>Estimated Stage Cost: </span>
              <span style={{ color: 'var(--cyan-bright)', fontWeight: 700 }}>{currentPhase.estimatedCost}</span>
            </div>
          </div>
        </div>

        {/* Skills & Recommended Tools */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            padding: '1.25rem',
            background: 'rgba(10, 25, 60, 0.4)',
            borderRadius: '12px',
            marginBottom: '2rem',
            border: '1px solid rgba(56, 189, 248, 0.15)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--cyan-glow)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <Users size={14} />
              <span>Required Founder Skills / Roles</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {currentPhase.skillsNeeded.map((skill, i) => (
                <span key={i} style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(29, 114, 254, 0.15)', color: '#ffffff', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--cyan-glow)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <Wrench size={14} />
              <span>Recommended Tools (Lean / Free)</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {currentPhase.toolsRecommended.map((tool, i) => (
                <span key={i} style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(30, 41, 59, 0.6)', color: 'var(--text-silver)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Task List */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
            Action Items & Verification Milestones
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {currentPhase.tasks.map((task) => {
              const isExpanded = expandedTasks[task.id];
              return (
                <div
                  key={task.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.55)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <div
                    onClick={() => toggleTask(task.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: 'rgba(56, 189, 248, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#38bdf8',
                        }}
                      >
                        <Layers size={14} />
                      </div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
                          {task.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', gap: '0.75rem', marginTop: '0.15rem' }}>
                          <span>Category: {task.category}</span>
                          <span>•</span>
                          <span>Estimated time: ~{task.estimatedDays} days</span>
                        </div>
                      </div>
                    </div>

                    <button style={{ color: 'var(--text-dim)' }}>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', color: 'var(--text-silver)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      <p>{task.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Funding Options Matrix */}
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--cyan-glow)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
            Capital & Financing Strategy
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
            Realistic Funding Pathways for {selectedIdea.name}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.25rem' }}>
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
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.55, marginBottom: '1rem' }}>
                  {f.desc}
                </p>
              </div>

              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div><span style={{ color: '#4ade80', fontWeight: 600 }}>Pros: </span><span style={{ color: 'var(--text-silver)' }}>{f.pros}</span></div>
                <div><span style={{ color: '#f87171', fontWeight: 600 }}>Cons: </span><span style={{ color: 'var(--text-silver)' }}>{f.cons}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
