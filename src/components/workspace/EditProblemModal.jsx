import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Sparkles,
  Save,
  Compass,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  History,
  ArrowRight
} from 'lucide-react';
import { DOMAIN_CATEGORIES } from '../../services/ideaEngine';

export default function EditProblemModal({
  isOpen,
  problem,
  onSaveOnly,
  onRegenerate,
  onClose,
}) {
  const [domain, setDomain] = useState('agriculture');
  const [problemStatement, setProblemStatement] = useState('');
  const [affectedAudience, setAffectedAudience] = useState('');
  const [constraints, setConstraints] = useState('');
  const [goals, setGoals] = useState('');
  const [error, setError] = useState('');
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && problem) {
      setDomain(problem.domain || 'agriculture');
      setProblemStatement(problem.problemStatement || '');
      setAffectedAudience(problem.affectedAudience || '');
      setConstraints(problem.constraints || '');
      setGoals(problem.goals || '');
      setError('');
      setShowRegenConfirm(false);
    }
  }, [isOpen, problem]);

  if (!isOpen) return null;

  const handleSaveWithoutRegen = async (e) => {
    e.preventDefault();
    const trimmed = problemStatement.trim();
    if (!trimmed || trimmed.length < 15) {
      setError('Problem statement must be at least 15 characters long.');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveOnly({
        domain,
        problemStatement: trimmed,
        affectedAudience: affectedAudience.trim(),
        constraints: constraints.trim(),
        goals: goals.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update problem statement.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProceedToRegenerate = () => {
    const trimmed = problemStatement.trim();
    if (!trimmed || trimmed.length < 15) {
      setError('Problem statement must be at least 15 characters long.');
      return;
    }
    onRegenerate({
      domain,
      problemStatement: trimmed,
      affectedAudience: affectedAudience.trim(),
      constraints: constraints.trim(),
      goals: goals.trim(),
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3500,
        backgroundColor: 'rgba(2, 6, 18, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
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
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2.5rem',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(29, 114, 254, 0.25)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: '6px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--cyan-glow)',
              marginBottom: '0.4rem',
            }}
          >
            <Compass size={14} />
            <span>Problem Discovery & Strategy</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
            Edit Problem Statement / Direction
          </h2>
          <p style={{ color: 'var(--text-silver)', fontSize: '0.925rem', lineHeight: 1.5 }}>
            Refine your original problem definition, audience, or operational constraints. You can save your edits to the current venture or take this new direction to Discover for a fresh AI evaluation.
          </p>
        </div>

        {/* Domain Selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
            Problem Domain
          </label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'rgba(2, 6, 18, 0.7)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          >
            {DOMAIN_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id} style={{ background: '#020612', color: '#ffffff' }}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Problem Statement Area */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
              Problem Description <span style={{ color: '#fca5a5' }}>*</span>
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {problemStatement.length} chars
            </span>
          </div>
          <textarea
            value={problemStatement}
            onChange={(e) => {
              setProblemStatement(e.target.value);
              setError('');
            }}
            rows={4}
            placeholder="Describe the friction point in detail..."
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              background: 'rgba(2, 6, 18, 0.7)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.9rem',
              lineHeight: 1.55,
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Affected Audience & Constraints Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
              Affected Audience
            </label>
            <input
              type="text"
              value={affectedAudience}
              onChange={(e) => setAffectedAudience(e.target.value)}
              placeholder="e.g. Smallholder rural farmers, SMB accountants"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(2, 6, 18, 0.7)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
              Key Constraints
            </label>
            <input
              type="text"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="e.g. Bootstrap budget under ₹1.5L, intermittent power"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(2, 6, 18, 0.7)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Error notice */}
        {error && (
          <div
            style={{
              padding: '0.65rem 0.9rem',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.825rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertTriangle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Regeneration confirmation warning */}
        {showRegenConfirm && (
          <div
            style={{
              padding: '1rem',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={18} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#fbbf24', fontSize: '0.875rem' }}>
                  Explore a Different Direction?
                </strong>
                <p style={{ color: 'var(--text-silver)', fontSize: '0.825rem', marginTop: '0.25rem', lineHeight: 1.5 }}>
                  This will take you to the <strong>Discover</strong> studio with your updated problem description to synthesize a fresh batch of startup opportunities. Your current venture history is preserved, and you will explicitly choose whether to switch your active idea or create a new venture.
                </p>
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={handleProceedToRegenerate}
                    className="btn-primary-glow"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                  >
                    <span>Proceed to Discover Studio</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRegenConfirm(false)}
                    className="btn-secondary-pill"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Choice Buttons */}
        {!showRegenConfirm && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleSaveWithoutRegen}
              disabled={isSaving}
              className="btn-primary-glow"
              style={{ flex: 1, justifyContent: 'center', padding: '0.8rem 1.25rem' }}
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Problem Edits (Keep Current Ideas)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRegenConfirm(true)}
              className="btn-secondary-pill"
              style={{ padding: '0.8rem 1.25rem', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
            >
              <Sparkles size={15} />
              <span>Explore Different Direction</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-secondary-pill"
              style={{ padding: '0.8rem 1rem' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
