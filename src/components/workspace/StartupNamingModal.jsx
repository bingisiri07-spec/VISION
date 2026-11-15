import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Edit3,
  CheckCircle2,
  X,
  RotateCcw,
  ArrowRight,
  Lightbulb,
  Building2,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { generateStartupNameSuggestions } from '../../services/ideaEngine';

export default function StartupNamingModal({
  isOpen,
  selectedIdea,
  problemStatement,
  currentName,
  apiKey,
  onConfirmName,
  onClose,
  isEditingExisting = false,
}) {
  const [startupName, setStartupName] = useState('');
  const [activeMode, setActiveMode] = useState('suggest'); // 'suggest' | 'custom'
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);

  // Initialize name when modal opens
  useEffect(() => {
    if (isOpen) {
      const initial = currentName || selectedIdea?.name || '';
      setStartupName(initial);
      setError('');
      if (!isEditingExisting && !hasGeneratedOnce) {
        handleGenerateSuggestions();
      }
    }
  }, [isOpen, selectedIdea, currentName, isEditingExisting]);

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const results = await generateStartupNameSuggestions({
        idea: selectedIdea,
        problemStatement,
        apiKey,
      });
      setSuggestions(results || []);
      setHasGeneratedOnce(true);
    } catch (err) {
      console.warn('Failed to generate suggestions:', err);
      setError('Could not generate automatic suggestions. You can type your own startup name directly.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectSuggestion = (name) => {
    setStartupName(name);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = startupName.trim();
    if (!trimmed) {
      setError('Startup name cannot be blank.');
      return;
    }
    if (trimmed.length < 2) {
      setError('Startup name must be at least 2 characters long.');
      return;
    }
    if (trimmed.length > 60) {
      setError('Startup name must be 60 characters or fewer.');
      return;
    }

    onConfirmName(trimmed);
  };

  if (!isOpen) return null;

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
          maxWidth: '680px',
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
            <Building2 size={14} />
            <span>{isEditingExisting ? 'Venture Identity' : 'Step 02 // Venture Identity'}</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
            {isEditingExisting ? 'Edit Startup Name' : 'Name Your Startup Venture'}
          </h2>
          <p style={{ color: 'var(--text-silver)', fontSize: '0.925rem', lineHeight: 1.5 }}>
            {isEditingExisting
              ? 'Update the formal name for this venture. All roadmap tasks, analytics telemetry, and reports will reflect the new name.'
              : `Give your startup a memorable, market-ready brand. Choose an AI-synthesized recommendation or enter your own custom name.`}
          </p>
        </div>

        {/* Selected Idea Context Pill */}
        {selectedIdea && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: 'rgba(29, 114, 254, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Lightbulb size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Selected Concept: </span>
              <strong style={{ color: '#ffffff' }}>{selectedIdea.name}</strong>
              <span style={{ color: 'var(--text-dim)' }}> ({selectedIdea.category || 'Venture'})</span>
            </div>
          </div>
        )}

        {/* Option Mode Selector */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            padding: '0.25rem',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '10px',
            border: '1px solid rgba(56, 189, 248, 0.15)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveMode('suggest')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeMode === 'suggest' ? 'linear-gradient(135deg, #1d72fe, #2563eb)' : 'transparent',
              color: activeMode === 'suggest' ? '#ffffff' : 'var(--text-silver)',
              boxShadow: activeMode === 'suggest' ? '0 0 14px rgba(29, 114, 254, 0.45)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={15} />
            <span>Option B: Let VISION Suggest Names</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('custom')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeMode === 'custom' ? 'linear-gradient(135deg, #1d72fe, #2563eb)' : 'transparent',
              color: activeMode === 'custom' ? '#ffffff' : 'var(--text-silver)',
              boxShadow: activeMode === 'custom' ? '0 0 14px rgba(29, 114, 254, 0.45)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Edit3 size={15} />
            <span>Option A: Name My Startup (Custom)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          {/* Active Input Field (Visible in both modes so user sees what is selected and can tweak) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>
                Confirmed Startup Name <span style={{ color: '#fca5a5' }}>*</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {startupName.length}/60 chars
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={startupName}
                onChange={(e) => {
                  setStartupName(e.target.value);
                  setError('');
                }}
                placeholder="e.g. AgriFlow, KisanPulse, Solara Labs..."
                maxLength={60}
                autoFocus={activeMode === 'custom'}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.1rem',
                  paddingRight: '2.5rem',
                  background: 'rgba(2, 6, 18, 0.7)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {startupName.trim().length >= 2 && (
                <div style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#10b981' }}>
                  <CheckCircle2 size={18} />
                </div>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.35rem', display: 'block' }}>
              This name will be uniquely assigned to this startup venture and displayed across Overview, Roadmap, Analytics, and Collaborations.
            </span>
          </div>

          {/* AI Suggestions View (Option B) */}
          {activeMode === 'suggest' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={14} color="#38bdf8" />
                  <span>Curated Suggestions</span>
                </span>
                <button
                  type="button"
                  onClick={handleGenerateSuggestions}
                  disabled={isGenerating}
                  className="btn-secondary-pill"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
                >
                  <RotateCcw size={12} className={isGenerating ? 'spin' : ''} />
                  <span>{isGenerating ? 'Synthesizing...' : 'Regenerate Names'}</span>
                </button>
              </div>

              {isGenerating ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-silver)', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '10px' }}>
                  <div className="spin" style={{ display: 'inline-block', marginBottom: '0.5rem', color: '#38bdf8' }}>
                    <Sparkles size={24} />
                  </div>
                  <p style={{ fontSize: '0.85rem' }}>Generating creative, market-ready names with meaning...</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {suggestions.map((sug, idx) => {
                    const isSelected = startupName.trim().toLowerCase() === sug.name.toLowerCase();
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectSuggestion(sug.name)}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          background: isSelected ? 'rgba(29, 114, 254, 0.22)' : 'rgba(15, 23, 42, 0.45)',
                          border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.07)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <strong style={{ fontSize: '1rem', color: isSelected ? '#38bdf8' : '#ffffff' }}>
                              {sug.name}
                            </strong>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: 'rgba(56, 189, 248, 0.12)',
                                color: 'var(--cyan-glow)',
                                fontWeight: 600,
                              }}
                            >
                              {sug.style}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-silver)', margin: 0, lineHeight: 1.45 }}>
                            {sug.rationale}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSuggestion(sug.name);
                          }}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: isSelected ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                            color: '#ffffff',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            flexShrink: 0,
                          }}
                        >
                          {isSelected ? (
                            <>
                              <Check size={12} />
                              <span>Selected</span>
                            </>
                          ) : (
                            <span>Use Name</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div
              style={{
                padding: '0.65rem 0.9rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              className="btn-primary-glow"
              style={{ flex: 1, justifyContent: 'center', padding: '0.85rem' }}
            >
              <span>{isEditingExisting ? 'Save Startup Name' : 'Confirm Startup Name & Enter Workspace'}</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary-pill"
              style={{ padding: '0.85rem 1.25rem' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
