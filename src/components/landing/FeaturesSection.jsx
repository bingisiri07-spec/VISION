import React from 'react';
import { Lightbulb, Map, DollarSign, GitFork, CheckSquare, Bot, ArrowRight } from 'lucide-react';

export default function FeaturesSection({ onSelectFeature }) {
  const features = [
    {
      id: 'problem-discovery',
      icon: <Lightbulb size={24} color="#38bdf8" />,
      tag: "Feature 01",
      title: "Real-World Problem to Startup Ideas",
      desc: "Turn messy real-world pain points across Education, Climate, Healthcare, and Tech into 3 sharply defined, viable startup opportunities with distinct UVPs and revenue models.",
      actionText: "Try Problem Discovery"
    },
    {
      id: 'execution-plan',
      icon: <Map size={24} color="#60a5fa" />,
      tag: "Feature 02",
      title: "Structured Execution Roadmap",
      desc: "Receive step-by-step phased milestones: from rapid problem validation and MVP scoping to required technical stacks, team roles, and initial go-to-market actions.",
      actionText: "View Sample Roadmap"
    },
    {
      id: 'budget-advisor',
      icon: <DollarSign size={24} color="#38bdf8" />,
      tag: "Feature 03",
      title: "Budget & Resource Advisor",
      desc: "Model your available capital and hours. See transparent breakdowns separating essential from optional costs, with zero-cost open-source tool recommendations.",
      actionText: "Plan Lean Budget"
    },
    {
      id: 'decision-simulator',
      icon: <GitFork size={24} color="#67e8f9" />,
      tag: "Feature 04",
      title: "Interactive Decision Simulator",
      desc: "Compare critical founder trade-offs: Solo vs. Co-founder, No-Code vs. Custom Code, Early Launch vs. Deep Validation, evaluating cost, risk, and speed.",
      actionText: "Simulate Decisions"
    },
    {
      id: 'journey-dashboard',
      icon: <CheckSquare size={24} color="#38bdf8" />,
      tag: "Feature 05",
      title: "Journey & Progress Tracking",
      desc: "A centralized command center tracking completed tasks, active milestones, recorded decisions, and actual verified progress metrics. No fabricated numbers.",
      actionText: "Open Dashboard"
    },
    {
      id: 'ai-assistant',
      icon: <Bot size={24} color="#60a5fa" />,
      tag: "Feature 06",
      title: "Context-Aware AI Co-Pilot",
      desc: "An intelligent advisor with persistent memory of your selected idea, execution roadmap, budget constraints, and logged milestones, ready to advise your next step.",
      actionText: "Consult AI Co-Pilot"
    }
  ];

  return (
    <section
      id="features"
      style={{
        position: 'relative',
        padding: '7rem 0',
        zIndex: 1,
        background: 'linear-gradient(180deg, transparent 0%, rgba(3, 10, 28, 0.7) 50%, transparent 100%)',
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 5rem auto' }}>
          <div
            style={{
              fontSize: '0.825rem',
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--cyan-glow)',
              marginBottom: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>Platform Capabilities</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.25rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '1.25rem',
              color: '#ffffff',
            }}
          >
            From First Observation to{' '}
            <span style={{ color: 'var(--cyan-glow)' }}>Thriving Venture</span>
          </h2>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-silver)',
              lineHeight: 1.7,
            }}
          >
            Six integrated engines designed to replace guesswork with clarity, discipline, and actionable execution.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2rem',
          }}
        >
          {features.map((f) => (
            <div
              key={f.id}
              className="glass-card"
              style={{
                padding: '2.5rem 2.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle top corner ambient glow */}
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(29, 114, 254, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {f.icon}
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-display)',
                      color: 'var(--text-dim)',
                      fontWeight: 600,
                      letterSpacing: '0.15em',
                    }}
                  >
                    {f.tag}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '0.9rem',
                    lineHeight: 1.3,
                  }}
                >
                  {f.title}
                </h3>

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.95rem',
                    lineHeight: 1.65,
                    marginBottom: '2rem',
                  }}
                >
                  {f.desc}
                </p>
              </div>

              <button
                onClick={() => onSelectFeature(f.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--cyan-glow)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--cyan-glow)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span>{f.actionText}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
