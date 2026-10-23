import React, { useState } from 'react';
import { PRESET_DECISION_SCENARIOS, evaluateCustomDecision } from '../../services/decisionEngine';
import {
  GitFork,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Info,
  BookmarkCheck,
  PlusCircle,
  HelpCircle
} from 'lucide-react';

export default function DecisionSimulator({
  selectedIdea,
  savedDecisions = [],
  onSaveDecision,
  onProceedToDashboard
}) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(PRESET_DECISION_SCENARIOS[0].id);
  const [chosenOptionKey, setChosenOptionKey] = useState('optionA');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Custom scenario creation state
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customOptA, setCustomOptA] = useState('');
  const [customOptB, setCustomOptB] = useState('');
  const [customScenario, setCustomScenario] = useState(null);

  const activeScenario = isCustomMode && customScenario
    ? customScenario
    : (PRESET_DECISION_SCENARIOS.find((s) => s.id === selectedScenarioId) || PRESET_DECISION_SCENARIOS[0]);

  const handleCreateCustom = (e) => {
    e.preventDefault();
    if (!customTitle || !customOptA || !customOptB) return;
    const evaluated = evaluateCustomDecision({
      decisionTitle: customTitle,
      optionAName: customOptA,
      optionBName: customOptB,
      userContext: selectedIdea
    });
    setCustomScenario(evaluated);
    setChosenOptionKey('optionA');
  };

  const handleSaveCurrentDecision = () => {
    const chosenOptionData = chosenOptionKey === 'optionA' ? activeScenario.optionA : activeScenario.optionB;
    
    const decisionRecord = {
      id: `dec_${Date.now()}`,
      scenarioId: activeScenario.id,
      title: activeScenario.title,
      chosenOption: chosenOptionData.name,
      chosenOptionKey,
      userNotes: decisionNotes,
      recommendationVerdict: activeScenario.recommendation.verdict,
      timestamp: new Date().toISOString(),
    };

    onSaveDecision(decisionRecord);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const isAlreadySaved = savedDecisions.some((d) => d.scenarioId === activeScenario.id);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--cyan-glow)',
            marginBottom: '0.5rem',
          }}
        >
          <GitFork size={16} />
          <span>Feature 04 // Interactive Decision Simulator</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
          Simulate High-Stakes Startup Trade-Offs
        </h1>
        <p style={{ color: 'var(--text-silver)', fontSize: '1.05rem', maxWidth: '780px' }}>
          Evaluate critical forks in team structure, product scope, and tech architecture before burning capital.
          Review assumptions, evaluate comparative outcomes, and log your decisions.
        </p>
      </div>

      {/* Scenario Selector & Custom Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {PRESET_DECISION_SCENARIOS.map((sc) => {
            const isSelected = !isCustomMode && selectedScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setIsCustomMode(false);
                  setSelectedScenarioId(sc.id);
                  setChosenOptionKey('optionA');
                }}
                className={isSelected ? "btn-nav-outline" : "btn-secondary-pill"}
                style={{
                  padding: '0.55rem 1.1rem',
                  fontSize: '0.825rem',
                  borderColor: isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                  background: isSelected ? 'rgba(29, 114, 254, 0.2)' : 'rgba(15, 23, 42, 0.5)'
                }}
              >
                {sc.category}
              </button>
            );
          })}

          <button
            onClick={() => setIsCustomMode(true)}
            className={isCustomMode ? "btn-nav-outline" : "btn-secondary-pill"}
            style={{
              padding: '0.55rem 1.1rem',
              fontSize: '0.825rem',
              borderColor: isCustomMode ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
              background: isCustomMode ? 'rgba(29, 114, 254, 0.2)' : 'rgba(15, 23, 42, 0.5)'
            }}
          >
            <PlusCircle size={14} />
            <span>Custom Decision</span>
          </button>
        </div>

        {savedDecisions.length > 0 && (
          <div style={{ fontSize: '0.85rem', color: 'var(--cyan-bright)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BookmarkCheck size={16} />
            <span>{savedDecisions.length} Saved in Project Memory</span>
          </div>
        )}
      </div>

      {/* Custom Scenario Form if enabled */}
      {isCustomMode && !customScenario && (
        <form onSubmit={handleCreateCustom} className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
            Define a Custom Dilemma for {selectedIdea?.name || 'Your Project'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-silver)', marginBottom: '0.35rem' }}>Decision Title</label>
              <input
                type="text"
                placeholder="e.g. Build native iOS app vs. responsive Progressive Web App"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '0.8rem', background: 'rgba(2, 6, 18, 0.6)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', color: '#fff' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-silver)', marginBottom: '0.35rem' }}>Option A</label>
                <input
                  type="text"
                  placeholder="e.g. Responsive PWA with Web Push"
                  value={customOptA}
                  onChange={(e) => setCustomOptA(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(2, 6, 18, 0.6)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-silver)', marginBottom: '0.35rem' }}>Option B</label>
                <input
                  type="text"
                  placeholder="e.g. Native Swift / iOS App Store release"
                  value={customOptB}
                  onChange={(e) => setCustomOptB(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(2, 6, 18, 0.6)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', color: '#fff' }}
                />
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary-glow" style={{ padding: '0.75rem 1.75rem' }}>
            <span>Evaluate Custom Trade-Offs</span>
            <Sparkles size={16} />
          </button>
        </form>
      )}

      {/* Active Dilemma Banner */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan-glow)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          {activeScenario.category}
        </span>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0.35rem 0 0.75rem 0' }}>
          {activeScenario.title}
        </h2>
        <p style={{ color: 'var(--text-silver)', fontSize: '1rem', lineHeight: 1.6 }}>
          {activeScenario.description}
        </p>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Option A Card */}
        <div
          className="glass-card"
          onClick={() => setChosenOptionKey('optionA')}
          style={{
            padding: '2.25rem',
            cursor: 'pointer',
            border: chosenOptionKey === 'optionA' ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: chosenOptionKey === 'optionA' ? '0 0 30px rgba(56, 189, 248, 0.35)' : 'none',
            background: chosenOptionKey === 'optionA' ? 'rgba(7, 24, 60, 0.8)' : 'var(--bg-space-card)',
            position: 'relative',
          }}
        >
          {chosenOptionKey === 'optionA' && (
            <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#38bdf8', color: '#020612', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
              Your Selected Choice
            </div>
          )}

          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
            {activeScenario.optionA.name}
          </h3>

          <p style={{ color: 'var(--text-silver)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {activeScenario.optionA.summary}
          </p>

          {/* Metrics breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            <div style={{ padding: '0.65rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--cyan-bright)', fontWeight: 600 }}>Time Impact: </span>
              <span style={{ color: '#ffffff' }}>{activeScenario.optionA.estimatedTimeWeeks}</span>
            </div>
            <div style={{ padding: '0.65rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px' }}>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>Estimated Cash Burn: </span>
              <span style={{ color: '#ffffff' }}>{activeScenario.optionA.estimatedCashBurn}</span>
            </div>
            <div style={{ padding: '0.65rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px' }}>
              <span style={{ color: '#f87171', fontWeight: 600 }}>Primary Risk: </span>
              <span style={{ color: 'var(--text-silver)' }}>{activeScenario.optionA.risk}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Underlying Assumptions
            </div>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              {activeScenario.optionA.assumptions.map((ass, i) => (
                <li key={i}>{ass}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Option B Card */}
        <div
          className="glass-card"
          onClick={() => setChosenOptionKey('optionB')}
          style={{
            padding: '2.25rem',
            cursor: 'pointer',
            border: chosenOptionKey === 'optionB' ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: chosenOptionKey === 'optionB' ? '0 0 30px rgba(56, 189, 248, 0.35)' : 'none',
            background: chosenOptionKey === 'optionB' ? 'rgba(7, 24, 60, 0.8)' : 'var(--bg-space-card)',
            position: 'relative',
          }}
        >
          {chosenOptionKey === 'optionB' && (
            <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#38bdf8', color: '#020612', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
              Your Selected Choice
            </div>
          )}

          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
            {activeScenario.optionB.name}
          </h3>

          <p style={{ color: 'var(--text-silver)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {activeScenario.optionB.summary}
          </p>

          {/* Metrics breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            <div style={{ padding: '0.65rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--cyan-bright)', fontWeight: 600 }}>Time Impact: </span>
              <span style={{ color: '#ffffff' }}>{activeScenario.optionB.estimatedTimeWeeks}</span>
            </div>
            <div style={{ padding: '0.65rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px' }}>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>Estimated Cash Burn: </span>
              <span style={{ color: '#ffffff' }}>{activeScenario.optionB.estimatedCashBurn}</span>
            </div>
            <div style={{ padding: '0.65rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px' }}>
              <span style={{ color: '#f87171', fontWeight: 600 }}>Primary Risk: </span>
              <span style={{ color: 'var(--text-silver)' }}>{activeScenario.optionB.risk}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Underlying Assumptions
            </div>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              {activeScenario.optionB.assumptions.map((ass, i) => (
                <li key={i}>{ass}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <div className="glass-panel" style={{ padding: '2rem', borderLeft: '4px solid #38bdf8', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cyan-glow)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          <Sparkles size={16} />
          <span>VISION Strategic Synthesis</span>
        </div>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
          {activeScenario.recommendation.verdict}
        </div>
        <p style={{ color: 'var(--text-silver)', fontSize: '0.95rem', lineHeight: 1.65 }}>
          {activeScenario.recommendation.reasoning}
        </p>
      </div>

      {/* Decision Logger & Save Action */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
          Record Your Strategic Rationale
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Saving this decision commits it to your active project workspace, allowing your AI assistant to reference it during future check-ins.
        </p>

        <textarea
          value={decisionNotes}
          onChange={(e) => setDecisionNotes(e.target.value)}
          placeholder="Document why you chose this path, your risk mitigation plan, and when you will review this choice..."
          rows={3}
          style={{
            width: '100%',
            background: 'rgba(2, 6, 18, 0.6)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            color: '#ffffff',
            fontSize: '0.9rem',
            outline: 'none',
            fontFamily: 'inherit',
            marginBottom: '1.25rem',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Info size={14} />
            <span>Scenario estimates are directional models, not guaranteed future outcomes.</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {saveSuccess && (
              <span style={{ color: '#4ade80', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={16} /> Saved to Project!
              </span>
            )}

            <button
              onClick={handleSaveCurrentDecision}
              className="btn-primary-glow"
              style={{ padding: '0.85rem 1.8rem' }}
            >
              <BookmarkCheck size={16} />
              <span>{isAlreadySaved ? 'Update Saved Decision' : 'Save Decision to Workspace'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transition to Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button
          onClick={onProceedToDashboard}
          className="btn-primary-glow"
          style={{ padding: '0.95rem 2.2rem' }}
        >
          <span>Open Journey Command Center</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
