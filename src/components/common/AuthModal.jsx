import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Sparkles, LogIn, UserPlus, AlertCircle, CheckCircle2, Lock, Mail, User } from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  reasonTitle,
  reasonDescription,
  defaultIsSignUp = false,
}) {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(defaultIsSignUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const isSubmittingRef = useRef(false);

  // Sync mode whenever modal opens or default mode changes
  useEffect(() => {
    if (isOpen) {
      setIsSignUp(defaultIsSignUp);
      setError(null);
      setMessage('');
      setLoading(false);
      isSubmittingRef.current = false;
    }
  }, [isOpen, defaultIsSignUp]);

  if (!isOpen) return null;

  const handleModeSwitch = (newIsSignUp) => {
    setIsSignUp(newIsSignUp);
    setError(null);
    setMessage('');
  };

  const handleAuthError = (err) => {
    const rawMsg = err?.message || '';
    const lower = rawMsg.toLowerCase();

    if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit')) {
      setError({
        title: 'Supabase Email Rate Limit Reached',
        description: isSignUp
          ? 'Supabase built-in mailer limit exceeded (3-4 emails/hour on free tier). If you already registered, please switch to Sign In (sign-in does not send emails and is never rate-limited). To enable unlimited signups, configure custom SMTP in your Supabase Dashboard.'
          : 'Too many authentication requests sent recently. Please wait a few moments and try again.',
        showSwitchToSignIn: isSignUp,
      });
    } else if (lower.includes('user already registered') || lower.includes('already exists')) {
      setError({
        title: 'Account Already Exists',
        description: 'A founder account with this email address already exists. Please switch to Sign In to log in.',
        showSwitchToSignIn: true,
      });
    } else if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
      setError({
        title: 'Invalid Login Credentials',
        description: 'The email or password you entered does not match our records. Please verify your details or create an account.',
        showSwitchToSignUp: !isSignUp,
      });
    } else if (lower.includes('email not confirmed')) {
      setError({
        title: 'Email Confirmation Required',
        description: 'Your account requires email confirmation before signing in. Please check your inbox (and spam folder). If confirmation emails are not arriving, disable "Confirm email" in Supabase Dashboard -> Authentication -> Providers -> Email.',
      });
    } else {
      setError({
        title: 'Authentication Failed',
        description: rawMsg || 'Unable to authenticate. Please verify your credentials and try again.',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current || loading) return;

    setError(null);
    setMessage('');

    const trimmedEmail = (email || '').trim().toLowerCase();
    if (!trimmedEmail) {
      setError({ title: 'Validation Error', description: 'Please enter a valid email address.' });
      return;
    }

    if (!password || password.length < 6) {
      setError({ title: 'Validation Error', description: 'Password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);
    isSubmittingRef.current = true;

    try {
      if (isSignUp) {
        const data = await signUp({ email: trimmedEmail, password, fullName: (fullName || '').trim() });
        if (data?.user && !data?.session) {
          setMessage('Account registration submitted! A confirmation email has been requested. If email confirmation is enabled on your Supabase project, check your inbox before logging in.');
        } else {
          setMessage('Account created successfully! Welcome to VISION.');
          setTimeout(() => {
            if (onSuccess) onSuccess();
            onClose();
          }, 1000);
        }
      } else {
        await signIn({ email: trimmedEmail, password });
        setMessage('Signed in successfully.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 800);
      }
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
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
        padding: '1.5rem 1rem',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.25rem',
          position: 'relative',
          margin: 'auto',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 0 50px rgba(29, 114, 254, 0.35)',
          borderRadius: '16px',
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
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
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
              marginBottom: '0.4rem',
            }}
          >
            <Sparkles size={14} />
            <span>VISION Cloud Access</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            {isSignUp ? 'Create Founder Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: 'var(--text-silver)', fontSize: '0.875rem', marginTop: '0.35rem', marginBottom: 0 }}>
            {isSignUp
              ? 'Register to save your ventures, roadmaps, and sync across devices.'
              : 'Sign in to access your saved startup projects and continuous workspace.'}
          </p>
        </div>

        {/* Prominent Tab Switcher between Sign In and Create Account */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            marginBottom: '1.35rem',
            padding: '0.25rem',
            background: 'rgba(15, 23, 42, 0.65)',
            borderRadius: '10px',
            border: '1px solid rgba(56, 189, 248, 0.15)',
          }}
        >
          <button
            type="button"
            onClick={() => handleModeSwitch(false)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: !isSignUp ? 'rgba(29, 114, 254, 0.3)' : 'transparent',
              color: !isSignUp ? '#ffffff' : 'var(--text-muted)',
              border: !isSignUp ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
              transition: 'var(--transition-fast)',
            }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch(true)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: isSignUp ? 'rgba(29, 114, 254, 0.3)' : 'transparent',
              color: isSignUp ? '#ffffff' : 'var(--text-muted)',
              border: isSignUp ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
              transition: 'var(--transition-fast)',
            }}
          >
            <UserPlus size={15} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Reason Explanation for Conditional Guest Auth */}
        {reasonDescription && (
          <div
            style={{
              padding: '0.85rem 1.1rem',
              background: 'linear-gradient(135deg, rgba(29, 114, 254, 0.2), rgba(56, 189, 248, 0.12))',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--cyan-glow)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.25rem',
              }}
            >
              <Lock size={13} />
              <span>{reasonTitle || 'Account Required'}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.45 }}>
              {reasonDescription}
            </p>
          </div>
        )}

        {/* Error Feedback with Actionable Advice */}
        {error && (
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#fecaca', marginBottom: '0.2rem' }}>
                  {typeof error === 'object' ? error.title : 'Authentication Notice'}
                </div>
                <p style={{ margin: 0, fontSize: '0.825rem', lineHeight: 1.45, color: '#fca5a5' }}>
                  {typeof error === 'object' ? error.description : error}
                </p>
                {typeof error === 'object' && error.showSwitchToSignIn && (
                  <button
                    type="button"
                    onClick={() => handleModeSwitch(false)}
                    style={{
                      marginTop: '0.6rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      background: 'rgba(56, 189, 248, 0.2)',
                      border: '1px solid #38bdf8',
                      color: '#38bdf8',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <LogIn size={13} />
                    <span>Switch to Sign In</span>
                  </button>
                )}
                {typeof error === 'object' && error.showSwitchToSignUp && (
                  <button
                    type="button"
                    onClick={() => handleModeSwitch(true)}
                    style={{
                      marginTop: '0.6rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      background: 'rgba(56, 189, 248, 0.2)',
                      border: '1px solid #38bdf8',
                      color: '#38bdf8',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <UserPlus size={13} />
                    <span>Switch to Create Account</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Feedback */}
        {message && (
          <div
            style={{
              padding: '0.85rem 1rem',
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
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span style={{ lineHeight: 1.45 }}>{message}</span>
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
                  disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '0.95rem',
              marginTop: '0.5rem',
              justifyContent: 'center',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
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

        {/* Subtle Bottom Link Alternative */}
        <div style={{ marginTop: '1.35rem', textAlign: 'center', fontSize: '0.825rem', color: 'var(--text-silver)' }}>
          {isSignUp ? (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => handleModeSwitch(false)}
                style={{ color: 'var(--cyan-glow)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
              >
                Sign In to existing account
              </button>
            </span>
          ) : (
            <span>
              Need a new account?{' '}
              <button
                type="button"
                onClick={() => handleModeSwitch(true)}
                style={{ color: 'var(--cyan-glow)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
              >
                Create a founder account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
