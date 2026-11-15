import React from 'react';
import { ArrowRight, Play, Sparkles, Zap, Sprout, ArrowDown, Plus, Layers, Target, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function HeroSection({
  onStartJourney,
  onContinueVenture,
  onStartNewVenture,
  onWatchDemo,
  projectState,
  userProjects = [],
  onSelectVenture,
}) {
  const { user, profile } = useAuth();
  const founderName = profile?.full_name?.trim() || user?.user_metadata?.full_name?.trim() || 'Founder';

  // Check if returning user with active or cloud ventures
  const activeIdea = projectState?.selectedIdea;
  const activeStartupName = projectState?.startupName || projectState?.title || activeIdea?.name || userProjects?.[0]?.startup_name || userProjects?.[0]?.title || '';
  const hasSavedVenture = Boolean(activeStartupName || activeIdea || (userProjects && userProjects.length > 0));

  const totalTasks = projectState?.tasks || [];
  const completedTasks = totalTasks.filter((t) => t.completed);
  const progressPercent = totalTasks.length > 0 ? Math.round((completedTasks.length / totalTasks.length) * 100) : 0;
  const lastActiveStage = projectState?.lastActiveStage || 'Overview';
  const problemSnippet = projectState?.problem?.problemStatement
    ? (projectState.problem.problemStatement.length > 140
      ? `${projectState.problem.problemStatement.slice(0, 140)}...`
      : projectState.problem.problemStatement)
    : '';

  const scrollToAbout = () => {
    const el = document.getElementById('about');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingTop: '8rem',
        paddingBottom: '3rem',
        zIndex: 1,
      }}
    >
      <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: '840px' }}>
          
          {/* Eyebrow Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              letterSpacing: '0.28em',
              color: 'var(--text-eyebrow)',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            {hasSavedVenture ? (
              <>
                <Sparkles size={14} color="#38bdf8" />
                <span>ACTIVE WORKSPACE // WELCOME BACK, {founderName.toUpperCase()}</span>
              </>
            ) : (
              <>
                <span>IDEAS</span>
                <span style={{ opacity: 0.6 }}>+</span>
                <span>ANALYSIS</span>
                <span style={{ opacity: 0.6 }}>+</span>
                <span>SOLUTIONS</span>
                <span style={{ opacity: 0.6 }}>+</span>
                <span>IMPACT</span>
              </>
            )}
          </div>

          {/* Massive Display Title */}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3.5rem, 8vw, 6.75rem)',
              fontWeight: 800,
              letterSpacing: '0.08em',
              lineHeight: 1.05,
              textTransform: 'uppercase',
              marginBottom: '1rem',
              background: 'linear-gradient(180deg, #ffffff 25%, #cbd5e1 70%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(56, 189, 248, 0.25)',
            }}
          >
            VISION
          </h1>

          {/* Conditional: Returning User with Saved Venture vs New User */}
          {hasSavedVenture ? (
            <div style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'clamp(1.9rem, 4vw, 3rem)',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  marginBottom: '1.25rem',
                  color: '#ffffff',
                }}
              >
                Let's continue building,{' '}
                <span
                  style={{
                    color: 'var(--cyan-glow)',
                    textShadow: '0 0 28px rgba(56, 189, 248, 0.6)',
                  }}
                >
                  {founderName}.
                </span>
              </div>

              {/* Personalized Venture Continuation Card */}
              <div
                className="glass-panel"
                style={{
                  padding: '1.85rem 2rem',
                  marginBottom: '1.5rem',
                  background: 'linear-gradient(135deg, rgba(7, 18, 43, 0.95) 0%, rgba(15, 34, 78, 0.8) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '16px',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.65), 0 0 25px rgba(29, 114, 254, 0.2)',
                  maxWidth: '740px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          color: 'var(--cyan-glow)',
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(56, 189, 248, 0.15)',
                        }}
                      >
                        Active Venture
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        Stage: <strong style={{ color: '#ffffff' }}>{lastActiveStage}</strong>
                      </span>
                    </div>
                    <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      {activeStartupName || 'My Startup Venture'}
                    </h2>
                    {activeIdea && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-silver)', marginTop: '0.2rem' }}>
                        Concept: <strong style={{ color: '#ffffff' }}>{activeIdea.name}</strong> • {activeIdea.category || 'Tech'}
                      </div>
                    )}
                  </div>

                  {/* Progress Pill */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
                      {progressPercent}% Complete
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {completedTasks.length} of {totalTasks.length || 0} tasks verified
                    </div>
                  </div>
                </div>

                {/* Problem Statement Snippet */}
                {problemSnippet && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-silver)', lineHeight: 1.55, marginBottom: '1.25rem', fontStyle: 'italic' }}>
                    "{problemSnippet}"
                  </p>
                )}

                {/* Progress Bar */}
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      background: 'linear-gradient(90deg, #1d72fe, #38bdf8)',
                      borderRadius: '9999px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                {/* Prominent Action Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center' }}>
                  <button
                    onClick={() => onContinueVenture ? onContinueVenture(projectState?.projectId) : onStartJourney()}
                    className="btn-primary-glow"
                    style={{ padding: '0.85rem 1.8rem', fontSize: '0.975rem' }}
                  >
                    <span>Continue Your Venture</span>
                    <ArrowRight size={17} />
                  </button>

                  <button
                    onClick={onStartNewVenture}
                    className="btn-secondary-pill"
                    style={{ padding: '0.85rem 1.4rem', fontSize: '0.9rem' }}
                  >
                    <Plus size={15} />
                    <span>Create New Venture</span>
                  </button>

                  <button
                    onClick={onWatchDemo}
                    className="btn-secondary-pill"
                    style={{ padding: '0.85rem 1.3rem', fontSize: '0.9rem' }}
                  >
                    <Play size={13} fill="#38bdf8" color="#38bdf8" />
                    <span>Watch Demo</span>
                  </button>
                </div>
              </div>

              {/* Multi-venture switcher if user has 2 or more ventures */}
              {userProjects && userProjects.length > 1 && (
                <div style={{ maxWidth: '740px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Layers size={13} color="#38bdf8" />
                    <span>Switch to another saved venture ({userProjects.length} total):</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {userProjects.slice(0, 5).map((p) => {
                      const isCurrent = p.id === projectState?.projectId;
                      const name = p.startup_name || p.title || 'Untitled';
                      return (
                        <button
                          key={p.id}
                          onClick={() => onSelectVenture ? onSelectVenture(p.id) : onContinueVenture(p.id)}
                          style={{
                            padding: '0.35rem 0.8rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: isCurrent ? 'rgba(29, 114, 254, 0.3)' : 'rgba(15, 23, 42, 0.65)',
                            border: isCurrent ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                            color: isCurrent ? '#38bdf8' : 'var(--text-silver)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Headline for New Users */}
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'clamp(2.1rem, 4.5vw, 3.8rem)',
                  fontWeight: 700,
                  lineHeight: 1.18,
                  letterSpacing: '-0.02em',
                  marginBottom: '1.75rem',
                  color: '#ffffff',
                }}
              >
                Turning Problems into{' '}
                <span
                  style={{
                    color: 'var(--cyan-glow)',
                    textShadow: '0 0 28px rgba(56, 189, 248, 0.6)',
                  }}
                >
                  Possibilities.
                </span>
              </div>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: 'clamp(1rem, 1.25vw, 1.18rem)',
                  color: 'var(--text-silver)',
                  lineHeight: 1.65,
                  maxWidth: '650px',
                  marginBottom: '2.5rem',
                  fontWeight: 400,
                }}
              >
                Analyze. Plan. Build. VISION helps you understand real-world problems,
                explore solutions, and turn your ideas into actionable plans — with the power of AI.
              </p>

              {/* Action Buttons for New Users */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '1.25rem',
                  marginBottom: '3rem',
                }}
              >
                <button
                  onClick={onStartJourney}
                  className="btn-primary-glow"
                  style={{ padding: '0.95rem 2.2rem', fontSize: '1.025rem' }}
                >
                  <span>Start Your Journey</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={onWatchDemo}
                  className="btn-secondary-pill"
                  style={{ padding: '0.95rem 1.8rem', fontSize: '0.975rem' }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Play size={14} fill="#38bdf8" color="#38bdf8" style={{ marginLeft: '2px' }} />
                  </div>
                  <span>Watch How It Works</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Bar: Feature Highlights & Scroll Indicator */}
      <div className="container" style={{ marginTop: 'auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* Left Highlights Matching Reference Image */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '3rem',
            }}
          >
            {/* 1. AI-Powered */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(29, 114, 254, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cyan-glow)',
                }}
              >
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#ffffff' }}>
                  AI-Powered
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Smarter insights
                </div>
              </div>
            </div>

            {/* 2. Real-World Focus */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(29, 114, 254, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cyan-glow)',
                }}
              >
                <Zap size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#ffffff' }}>
                  Real-World Focus
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Actual solutions
                </div>
              </div>
            </div>

            {/* 3. Future Driven */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(29, 114, 254, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cyan-glow)',
                }}
              >
                <Sprout size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#ffffff' }}>
                  Future Driven
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Built for what's next
                </div>
              </div>
            </div>
          </div>

          {/* Right: Scroll Down indicator */}
          <button
            onClick={scrollToAbout}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-dim)',
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              fontWeight: 600,
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cyan-glow)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
          >
            <span>SCROLL DOWN</span>
            <div style={{ animation: 'bounceDown 2s infinite ease-in-out' }}>
              <ArrowDown size={14} />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
