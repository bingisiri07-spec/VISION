import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, Sparkles, LayoutDashboard } from 'lucide-react';

export default function Navbar({ activeView, setActiveView, hasActiveProject }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (activeView !== 'landing') {
      setActiveView('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        transition: 'all 0.3s ease',
        backgroundColor: isScrolled
          ? 'rgba(2, 6, 18, 0.85)'
          : 'transparent',
        backdropFilter: isScrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(16px)' : 'none',
        borderBottom: isScrolled
          ? '1px solid rgba(56, 189, 248, 0.12)'
          : '1px solid transparent',
        padding: isScrolled ? '1.25rem 0' : '2.25rem 0',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand Logo */}
          <button
            onClick={() => {
              setActiveView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                fontWeight: 800,
                letterSpacing: '0.3em',
                color: '#ffffff',
                textTransform: 'uppercase',
                textShadow: '0 0 20px rgba(56, 189, 248, 0.4)',
              }}
            >
              VISION
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2.5rem',
            }}
            className="desktop-nav"
          >
            {[
              { id: 'hero', label: 'Home' },
              { id: 'about', label: 'About' },
              { id: 'features', label: 'Features' },
              { id: 'contact', label: 'Contact' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: link.id === 'hero' && activeView === 'landing'
                    ? '#ffffff'
                    : 'var(--text-muted)',
                  transition: 'var(--transition-fast)',
                  position: 'relative',
                  padding: '0.3rem 0',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => {
                  if (link.id !== 'hero' || activeView !== 'landing') {
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
              >
                {link.label}
                {link.id === 'hero' && activeView === 'landing' && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '10%',
                      width: '80%',
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                      boxShadow: '0 0 8px #38bdf8',
                    }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Action Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {hasActiveProject && activeView !== 'journey-dashboard' && (
              <button
                onClick={() => setActiveView('journey-dashboard')}
                className="btn-nav-outline"
                title="Return to your saved project workspace"
              >
                <LayoutDashboard size={15} color="#38bdf8" />
                <span>My Project</span>
              </button>
            )}

            <button
              onClick={() => setActiveView('problem-discovery')}
              className="btn-nav-outline"
            >
              <span>{activeView === 'landing' ? 'Get Started' : 'New Problem'}</span>
              <ArrowRight size={15} />
            </button>

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                color: '#ffffff',
                padding: '0.5rem',
              }}
              className="mobile-toggle"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            background: 'rgba(2, 6, 18, 0.96)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
            padding: '1.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {['Home', 'About', 'Features', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() => handleNavClick(item.toLowerCase() === 'home' ? 'hero' : item.toLowerCase())}
              style={{
                textAlign: 'left',
                fontSize: '1.1rem',
                color: 'var(--text-silver)',
                padding: '0.5rem 0',
              }}
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setActiveView('problem-discovery');
            }}
            className="btn-primary-glow"
            style={{ marginTop: '0.5rem', width: '100%' }}
          >
            <span>Start Your Journey</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Inline styles for media query responsive behavior */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
