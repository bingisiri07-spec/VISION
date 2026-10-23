import React from 'react';
import { ArrowRight, Play, Sparkles, Zap, Sprout, ArrowDown } from 'lucide-react';

export default function HeroSection({ onStartJourney, onWatchDemo }) {
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
        <div style={{ maxWidth: '820px' }}>
          
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
              marginBottom: '1.75rem',
            }}
          >
            <span>IDEAS</span>
            <span style={{ opacity: 0.6 }}>+</span>
            <span>ANALYSIS</span>
            <span style={{ opacity: 0.6 }}>+</span>
            <span>SOLUTIONS</span>
            <span style={{ opacity: 0.6 }}>+</span>
            <span>IMPACT</span>
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

          {/* Headline */}
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

          {/* Action Buttons */}
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
