import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Sparkles, Send } from 'lucide-react';

export default function ContactSection({ onStartJourney }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
    }, 4000);
  };

  return (
    <section
      id="contact"
      style={{
        position: 'relative',
        padding: '7rem 0 5rem 0',
        zIndex: 1,
      }}
    >
      <div className="container">
        <div
          className="glass-panel"
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '4.5rem 3rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            boxShadow: '0 0 60px rgba(29, 114, 254, 0.2)',
          }}
        >
          {/* Ambient Glows */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '400px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(29, 114, 254, 0.3) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--cyan-glow)',
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={16} />
            <span>Begin Your Transformation</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2.2rem, 3.8vw, 3.4rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '1.25rem',
              color: '#ffffff',
            }}
          >
            Ready to Build What Matters?
          </h2>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-silver)',
              lineHeight: 1.65,
              maxWidth: '640px',
              margin: '0 auto 2.5rem auto',
            }}
          >
            Enter your real-world problem and let VISION construct your startup possibilities,
            execution roadmap, and lean budget in minutes.
          </p>

          {/* Quick Start Buttons / Email Catch */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
              maxWidth: '520px',
              margin: '0 auto',
            }}
          >
            <button
              onClick={onStartJourney}
              className="btn-primary-glow"
              style={{ width: '100%', padding: '1.05rem 2rem', fontSize: '1.05rem' }}
            >
              <span>Launch Problem Discovery Now</span>
              <ArrowRight size={18} />
            </button>

            <form
              onSubmit={handleSubmit}
              style={{
                width: '100%',
                display: 'flex',
                gap: '0.5rem',
                marginTop: '1rem',
              }}
            >
              <input
                type="email"
                placeholder="Stay updated with early founder insights"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  flex: 1,
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '9999px',
                  padding: '0.8rem 1.4rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                className="btn-secondary-pill"
                style={{ padding: '0.8rem 1.4rem' }}
              >
                <Send size={16} />
              </button>
            </form>

            {submitted && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--cyan-bright)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                <CheckCircle2 size={16} />
                <span>Thank you! We've received your request.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
