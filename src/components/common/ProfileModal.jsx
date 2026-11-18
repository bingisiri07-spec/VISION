import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  User,
  Mail,
  Lock,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Calendar,
  KeyRound,
  Phone,
  Link
} from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, profile, updateProfile, updatePassword, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'
  
  // Profile tab state
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Security tab state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');

  // Sync state whenever modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      setFullName(profile?.full_name || user?.user_metadata?.full_name || '');
      setContactNumber(profile?.contact_number || '');
      setLinkedinUrl(profile?.linkedin_url || '');
      setProfileSuccess('');
      setProfileError('');
      setNewPassword('');
      setConfirmPassword('');
      setSecuritySuccess('');
      setSecurityError('');
    }
  }, [isOpen, profile, user]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  // Handle profile update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    const trimmed = fullName.trim();
    if (!trimmed) {
      setProfileError('Full name cannot be blank.');
      return;
    }

    // Validate LinkedIn URL format if provided
    const trimmedLinkedin = linkedinUrl.trim();
    if (trimmedLinkedin && !trimmedLinkedin.match(/^https?:\/\/(www\.)?linkedin\.com\/.+/i)) {
      setProfileError('LinkedIn URL must start with https://linkedin.com/ or https://www.linkedin.com/');
      return;
    }

    // Basic phone validation if provided
    const trimmedPhone = contactNumber.trim();
    if (trimmedPhone && !trimmedPhone.match(/^[+\d\s\-().]{7,20}$/)) {
      setProfileError('Please enter a valid contact number (7-20 digits, may include +, spaces, dashes).');
      return;
    }

    setProfileLoading(true);
    try {
      await updateProfile({ fullName: trimmed, contactNumber: trimmedPhone || null, linkedinUrl: trimmedLinkedin || null });
      setProfileSuccess('Profile updated successfully.');
      setTimeout(() => setProfileSuccess(''), 3500);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password update
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (newPassword.length < 6) {
      setSecurityError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('Passwords do not match. Please re-enter.');
      return;
    }

    setSecurityLoading(true);
    try {
      await updatePassword(newPassword);
      setSecuritySuccess('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecuritySuccess(''), 3500);
    } catch (err) {
      setSecurityError(err.message || 'Failed to update password. Please verify requirements.');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        backgroundColor: 'rgba(2, 6, 18, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1rem',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: 'min(90vh, 760px)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: 0,
          margin: 'auto',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 0 50px rgba(29, 114, 254, 0.35)',
          overflow: 'hidden',
          borderRadius: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Modal Header & Navigation */}
        <div
          style={{
            padding: '1.75rem 2rem 1.25rem 2rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative',
            flexShrink: 0,
            background: 'rgba(7, 18, 43, 0.95)',
          }}
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              transition: 'var(--transition-fast)',
            }}
            title="Close"
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-silver)')}
          >
            <X size={20} />
          </button>

          {/* Modal Header */}
          <div style={{ marginBottom: '1.25rem', paddingRight: '2rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--cyan-glow)',
                marginBottom: '0.35rem',
              }}
            >
              <Sparkles size={14} />
              <span>VISION Founder Account</span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Account Settings
            </h2>
            <p style={{ color: 'var(--text-silver)', fontSize: '0.85rem', marginTop: '0.25rem', marginBottom: 0 }}>
              Manage your founder profile credentials and security.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '0.25rem',
              background: 'rgba(15, 23, 42, 0.65)',
              borderRadius: '10px',
              border: '1px solid rgba(56, 189, 248, 0.15)',
            }}
          >
            <button
              onClick={() => setActiveTab('profile')}
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
                background: activeTab === 'profile' ? 'rgba(29, 114, 254, 0.3)' : 'transparent',
                color: activeTab === 'profile' ? '#ffffff' : 'var(--text-muted)',
                border: activeTab === 'profile' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                transition: 'var(--transition-fast)',
              }}
            >
              <User size={15} />
              <span>Profile Details</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
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
                background: activeTab === 'security' ? 'rgba(29, 114, 254, 0.3)' : 'transparent',
                color: activeTab === 'security' ? '#ffffff' : 'var(--text-muted)',
                border: activeTab === 'security' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                transition: 'var(--transition-fast)',
              }}
            >
              <ShieldCheck size={15} />
              <span>Security & Password</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem 2rem 2rem 2rem',
          }}
        >
          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile}>
            {/* Feedback Banners */}
            {profileError && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#fca5a5',
                  fontSize: '0.825rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '8px',
                  color: '#86efac',
                  fontSize: '0.825rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{profileSuccess}</span>
              </div>
            )}

            {/* Account Email (Read-Only) */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Account Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  readOnly
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    background: 'rgba(15, 23, 42, 0.45)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    cursor: 'not-allowed',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'block' }}>
                Verified authentication email address.
              </span>
            </div>

            {/* Full Name */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
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

            {/* Contact Number */}
            <div style={{ marginBottom: '1.15rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                Contact Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
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

            {/* LinkedIn URL */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                LinkedIn Profile URL
              </label>
              <div style={{ position: 'relative' }}>
                <Link size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/your-profile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
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
              <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'block' }}>
                Format: https://linkedin.com/in/username
              </span>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={profileLoading}
              className="btn-primary-glow"
              style={{
                width: '100%',
                padding: '0.8rem',
                fontSize: '0.925rem',
                justifyContent: 'center',
                opacity: profileLoading ? 0.7 : 1,
                cursor: profileLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {profileLoading ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </form>
        )}

        {/* TAB 2: SECURITY & PASSWORD */}
        {activeTab === 'security' && (
          <div>
            <form onSubmit={handleSavePassword}>
              {/* Feedback Banners */}
              {securityError && (
                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#fca5a5',
                    fontSize: '0.825rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{securityError}</span>
                </div>
              )}

              {securitySuccess && (
                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    color: '#86efac',
                    fontSize: '0.825rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                  <span>{securitySuccess}</span>
                </div>
              )}

              {/* New Password */}
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              {/* Confirm Password */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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

              {/* Update Password Button */}
              <button
                type="submit"
                disabled={securityLoading}
                className="btn-primary-glow"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  fontSize: '0.925rem',
                  justifyContent: 'center',
                  opacity: securityLoading ? 0.7 : 1,
                  cursor: securityLoading ? 'not-allowed' : 'pointer',
                  marginBottom: '1.5rem',
                }}
              >
                {securityLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>

            {/* Sign Out Card */}
            <div
              style={{
                padding: '1rem 1.25rem',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                  Active Founder Session
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Sign out on this device.
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="btn-secondary-pill"
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.8rem',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                  e.currentTarget.style.color = '#fca5a5';
                }}
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
