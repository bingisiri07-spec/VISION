import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, Sparkles, Users, User, LogIn, LogOut, Layers, LayoutDashboard, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({
  activeView,
  setActiveView,
  hasActiveProject,
  onOpenAuthModal,
  onOpenProjectsModal,
  onOpenProfileModal,
}) {
  const { user, profile, signOut } = useAuth();
  const founderName = profile?.full_name?.trim() || user?.user_metadata?.full_name?.trim() || 'Profile';
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Determine which section is currently most visible in the viewport
      const sectionIds = ['hero', 'about', 'features'];
      let current = 'hero';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Section is "active" when its top edge has passed 40% of viewport height
          if (rect.top <= window.innerHeight * 0.4) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    setActiveSection(sectionId);
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
              setActiveSection('hero');
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
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: activeSection === link.id && activeView === 'landing'
                    ? '#ffffff'
                    : 'var(--text-muted)',
                  transition: 'var(--transition-fast)',
                  position: 'relative',
                  padding: '0.3rem 0',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => {
                  if (activeSection !== link.id || activeView !== 'landing') {
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
              >
                {link.label}
                {activeSection === link.id && activeView === 'landing' && (
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {user ? (
              <>
                <button
                  onClick={() => setActiveView('overview')}
                  className="btn-nav-outline"
                  title="Startup Overview Dashboard"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <LayoutDashboard size={14} color="#38bdf8" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setActiveView('analytics')}
                  className="btn-nav-outline"
                  title="Venture Analytics Telemetry"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <BarChart3 size={14} color="#38bdf8" />
                  <span>Analytics</span>
                </button>

                <button
                  onClick={onOpenProjectsModal}
                  className="btn-nav-outline"
                  title="View your cloud ventures"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Layers size={14} color="#38bdf8" />
                  <span>Ventures</span>
                </button>

                <button
                  onClick={() => setActiveView('collaborations')}
                  className="btn-nav-outline"
                  title="Collaboration Network"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Users size={14} color="#38bdf8" />
                  <span>Network</span>
                </button>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.25rem 0.4rem 0.25rem 0.75rem',
                    borderRadius: '9999px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    fontSize: '0.85rem',
                    color: '#ffffff',
                  }}
                >
                  <button
                    onClick={onOpenProfileModal}
                    title="Profile & Account Settings"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      color: '#ffffff',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cyan-bright)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff')}
                  >
                    <User size={13} color="#38bdf8" />
                    <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {founderName}
                    </span>
                  </button>

                  <button
                    onClick={signOut}
                    title="Sign Out"
                    style={{
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                      marginLeft: '0.25rem',
                      borderRadius: '4px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                  >
                    <LogOut size={13} />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="btn-nav-outline"
                style={{ padding: '0.45rem 1rem' }}
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
            )}

            <button
              onClick={() => setActiveView(activeView === 'landing' && hasActiveProject ? 'overview' : 'problem-discovery')}
              className="btn-primary-glow"
              style={{ padding: '0.5rem 1.15rem', fontSize: '0.85rem' }}
            >
              <span>{activeView === 'landing' ? (hasActiveProject ? 'Open Workspace' : 'Get Started') : 'New Problem'}</span>
              <ArrowRight size={14} />
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
          {['Home', 'About', 'Features'].map((item) => (
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

          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => { setMobileMenuOpen(false); setActiveView('overview'); }}
                className="btn-nav-outline"
                style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
              >
                <LayoutDashboard size={15} color="#38bdf8" />
                <span>Overview Dashboard</span>
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); setActiveView('analytics'); }}
                className="btn-nav-outline"
                style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
              >
                <BarChart3 size={15} color="#38bdf8" />
                <span>Venture Analytics</span>
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenProfileModal(); }}
                className="btn-nav-outline"
                style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
              >
                <User size={15} color="#38bdf8" />
                <span>Account Settings (Profile)</span>
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenProjectsModal(); }}
                className="btn-nav-outline"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Layers size={15} />
                <span>My Ventures</span>
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); signOut(); }}
                style={{ color: '#ef4444', textAlign: 'center', fontSize: '0.9rem', padding: '0.5rem' }}
              >
                Sign Out ({user.email})
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuthModal(); }}
              className="btn-nav-outline"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <LogIn size={15} />
              <span>Sign In / Create Account</span>
            </button>
          )}

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
