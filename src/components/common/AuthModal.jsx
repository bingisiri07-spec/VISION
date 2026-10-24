import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Sparkles, LogIn, UserPlus, AlertCircle, CheckCircle2, Lock, Mail, User } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        const data = await signUp({ email, password, fullName });
        if (data?.user && !data?.session) {
          setMessage('Account created! Please check your email inbox to confirm your account before logging in.');
        } else {
          setMessage('Account created successfully! Welcome to VISION.');
          setTimeout(() => {
            if (onSuccess) onSuccess();
            onClose();
          }, 1200);
        }
      } else {
        await signIn({ email, password });
        setMessage('Signed in successfully.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 800);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        backgroundColor: 'rgba(2, 6, 18, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem',
          position: 'relative',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 0 50px rgba(29, 114, 254, 0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            color: 'var(--text-silver)',
            padding: '0.4rem',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--cyan-glow)',
              marginBottom: '0.5rem',
            }}
          >
            <Sparkles size={14} />
            <span>VISION Cloud Access</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
            {isSignUp ? 'Create Founder Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: 'var(--text-silver)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            {isSignUp
              ? 'Save your ventures, track roadmaps, and sync across devices.'
              : 'Sign in to access your saved startup projects and history.'}
          </p>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              color: '#86efac',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {isSignUp && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="e.g. Bingi Siri"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    background: 'rgba(2, 6, 18, 0.6)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="founder@venture.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  background: 'rgba(2, 6, 18, 0.6)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  background: 'rgba(2, 6, 18, 0.6)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-glow"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.5rem', justifyContent: 'center' }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : isSignUp ? (
              <>
                <UserPlus size={16} />
                <span>Create Account</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In to VISION</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle between Sign In and Sign Up */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-silver)' }}>
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setError(''); setMessage(''); }}
                style={{ color: 'var(--cyan-glow)', fontWeight: 600, cursor: 'pointer' }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setError(''); setMessage(''); }}
                style={{ color: 'var(--cyan-glow)', fontWeight: 600, cursor: 'pointer' }}
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
