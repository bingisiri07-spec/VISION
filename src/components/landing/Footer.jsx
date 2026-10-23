import React from 'react';

export default function Footer({ onNavigate }) {
  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 1,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(2, 6, 18, 0.95)',
        padding: '4rem 0 2.5rem 0',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '3rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand Info */}
          <div style={{ maxWidth: '380px' }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 800,
                letterSpacing: '0.25em',
                color: '#ffffff',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              VISION
            </div>
            <p
              style={{
                color: 'var(--cyan-glow)',
                fontWeight: 600,
                fontSize: '0.95rem',
                marginBottom: '0.75rem',
              }}
            >
              Problems to Possibilities.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              An interactive AI platform that transforms real-world challenges into startup opportunities,
              executable roadmaps, and tracked milestones.
            </p>
          </div>

          {/* Quick Links */}
          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
            <div>
              <div
                style={{
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '1.25rem',
                }}
              >
                Platform
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Problem Discovery', 'Execution Roadmap', 'Budget Advisor', 'Decision Simulator', 'Project Dashboard'].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => onNavigate(item.toLowerCase().replace(/\s+/g, '-'))}
                      style={{
                        color: 'var(--text-silver)',
                        fontSize: '0.9rem',
                        transition: 'var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cyan-glow)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-silver)')}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div
                style={{
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '1.25rem',
                }}
              >
                Project
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li>
                  <a
                    href="#about"
                    style={{ color: 'var(--text-silver)', fontSize: '0.9rem' }}
                  >
                    About VISION
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    style={{ color: 'var(--text-silver)', fontSize: '0.9rem' }}
                  >
                    Feature Suite
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--text-silver)', fontSize: '0.9rem' }}
                  >
                    GitHub Repository
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.825rem',
            color: 'var(--text-dim)',
          }}
        >
          <div>
            &copy; 2026 VISION. All rights reserved. Built with passion by Bingi Siri.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Turning Problems into Possibilities</span>
            <span>•</span>
            <span style={{ color: 'var(--cyan-glow)' }}>Space Atmospheric Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
