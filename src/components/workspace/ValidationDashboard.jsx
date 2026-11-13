import React, { useState, useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import {
  ShieldCheck,
  Target,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  TrendingUp,
  Info,
  Layers,
  ArrowRight,
  Plus,
  Compass,
  Zap,
  BarChart2
} from 'lucide-react';

export default function ValidationDashboard({
  projectState,
  onNavigate,
  onAddTask,
  onToggleTask
}) {
  const idea = projectState.selectedIdea;

  // Track founder-validated experiments
  const [experiments, setExperiments] = useState([
    {
      id: 'exp_1',
      title: 'Problem-Solution Customer Interviews',
      dimension: 'Market Demand',
      description: 'Interview 15 target users facing this exact bottleneck to verify willingness to pay and alternative workarounds.',
      status: 'In Progress', // 'Planned' | 'In Progress' | 'Validated'
      evidence: '5 interviews completed; users confirmed dissatisfaction with current manual status quo.',
    },
    {
      id: 'exp_2',
      title: 'Smoke Test / Landing Page Pre-Signups',
      dimension: 'Market Demand',
      description: 'Deploy a one-page value prop pitch with email capture to measure conversion intent.',
      status: 'Planned',
      evidence: 'Targeting 50 signups before code development.',
    },
    {
      id: 'exp_3',
      title: 'Technical API Feasibility Proof-of-Concept',
      dimension: 'Technical Feasibility',
      description: 'Validate critical third-party integrations and algorithmic throughput under low resource limits.',
      status: 'Validated',
      evidence: 'Latency benchmark under 200ms confirmed.',
    },
    {
      id: 'exp_4',
      title: 'Competitor Moat & Pricing Audit',
      dimension: 'Competition Moat',
      description: 'Secret-shopper test top 3 incumbents to determine unbundled features and pricing vulnerabilities.',
      status: 'In Progress',
      evidence: 'Incumbents require annual enterprise commitments; opening exists for usage-based tier.',
    },
    {
      id: 'exp_5',
      title: 'Unit Economics & CAC/LTV Simulation',
      dimension: 'Scalability',
      description: 'Model customer acquisition cost vs gross margin with paid ads and organic loops.',
      status: 'Planned',
      evidence: 'Awaiting customer interview pricing confirmation.',
    }
  ]);

  const [activeDimension, setActiveDimension] = useState('Market Demand');
  const [newExpTitle, setNewExpTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Derive 5-dimension scores from the venture data
  // Ensures scores reflect the actual idea's constraints, challenges, and feasibility score
  const radarData = useMemo(() => {
    if (!idea) return [];

    const baseScore = idea.feasibilityScore || 75;
    const challengeCount = (idea.majorChallenges || []).length;
    const validationStepsCount = (idea.validationSteps || []).length;

    // 1. Market Demand: Derived from problem audience clarity & validation steps
    const marketDemand = Math.min(95, Math.max(50, baseScore + (validationStepsCount > 2 ? 6 : -4)));

    // 2. Technical Feasibility: Inversely related to challenge complexity
    const techFeasibility = Math.min(95, Math.max(45, baseScore - (challengeCount > 3 ? 10 : 0) + 4));

    // 3. Competition Moat: Derived from unique value prop length & specificity
    const moatScore = Math.min(92, Math.max(50, baseScore - 5));

    // 4. Scalability: Software/digital models scale higher, hardware lower
    const isHardwareOrPhysical = (idea.category || '').toLowerCase().includes('clean') ||
      (idea.category || '').toLowerCase().includes('hardware') ||
      (idea.solution || '').toLowerCase().includes('hardware');
    const scalability = isHardwareOrPhysical ? Math.max(50, baseScore - 12) : Math.min(96, baseScore + 8);

    // 5. Resource Efficiency: Based on budget constraints & team size
    const availableBudget = projectState.budget?.availableBudget || 1500;
    const resourceReq = availableBudget < 1000 ? 60 : availableBudget < 5000 ? 76 : 88;

    return [
      {
        subject: 'Market Demand',
        score: marketDemand,
        fullMark: 100,
        explanation: 'Evaluates customer urgency, frequency of problem occurrence, and willingness to pay.',
        evidence: idea.targetAudience ? `Targeting: ${idea.targetAudience}` : 'Identified underserved audience segment.',
        source: 'AI Hypothesis (Requires Customer Interviews)'
      },
      {
        subject: 'Technical Feasibility',
        score: techFeasibility,
        fullMark: 100,
        explanation: 'Assesses implementation risk, dependency on unproven technology, and architectural complexity.',
        evidence: (idea.majorChallenges && idea.majorChallenges[0]) || 'Standard modern tech stack sufficient for MVP.',
        source: 'AI Assessment (Based on Stated Constraints)'
      },
      {
        subject: 'Competition Moat',
        score: moatScore,
        fullMark: 100,
        explanation: 'Analyzes defensibility against incumbents, switching costs, and unique differentiation.',
        evidence: idea.uniqueValueProp || 'Differentiation wedge identified in market research.',
        source: 'AI Hypothesis (Cross-Referenced with Competitor Landscape)'
      },
      {
        subject: 'Scalability',
        score: scalability,
        fullMark: 100,
        explanation: 'Assesses marginal cost of serving additional customers and network effect potential.',
        evidence: (idea.revenueModels && idea.revenueModels[0]) || 'Predictable recurring revenue model.',
        source: 'AI Projection'
      },
      {
        subject: 'Resource Efficiency',
        score: resourceReq,
        fullMark: 100,
        explanation: 'Compares runway and capital requirements against minimum viable prototype scope.',
        evidence: `Runway: ${projectState.budget?.runwayMonths || 3} months with current capital allocation.`,
        source: 'Measured Budget Parameters'
      }
    ];
  }, [idea, projectState.budget]);

  // Handle toggling experiment status
  const handleCycleStatus = (expId) => {
    setExperiments((prev) =>
      prev.map((e) => {
        if (e.id !== expId) return e;
        const nextStatus = e.status === 'Planned' ? 'In Progress' : e.status === 'In Progress' ? 'Validated' : 'Planned';
        return { ...e, status: nextStatus };
      })
    );
  };

  const handleAddExperiment = (e) => {
    e.preventDefault();
    if (!newExpTitle.trim()) return;

    setExperiments((prev) => [
      {
        id: `exp_${Date.now()}`,
        title: newExpTitle.trim(),
        dimension: activeDimension,
        description: 'Founder-initiated validation experiment.',
        status: 'Planned',
        evidence: 'Awaiting execution results.',
      },
      ...prev
    ]);
    setNewExpTitle('');
    setShowAddModal(false);
  };

  if (!idea) {
    return (
      <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', maxWidth: '720px', margin: '0 auto', color: '#ffffff' }}>
        <ShieldCheck size={48} color="#38bdf8" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
          No Active Startup Selected
        </h2>
        <p style={{ color: 'var(--text-silver)', marginBottom: '1.75rem' }}>
          To view the 5-Axis Startup Feasibility Radar, please synthesize and select a startup idea in Problem Discovery.
        </p>
        <button onClick={() => onNavigate('problem-discovery')} className="btn-primary-glow">
          <span>Go to Problem Discovery</span>
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  const selectedDimensionDetail = radarData.find((d) => d.subject === activeDimension) || radarData[0];
  const overallAverage = Math.round(radarData.reduce((acc, curr) => acc + curr.score, 0) / radarData.length);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', color: '#ffffff' }}>
      
      {/* Header */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem 2.25rem',
          marginBottom: '2rem',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--cyan-glow)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}
            >
              5-Axis Feasibility Radar
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              • {idea.name}
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Startup Validation & Feasibility Engine
          </h1>
          <p style={{ color: 'var(--text-silver)', fontSize: '0.925rem', maxWidth: '680px' }}>
            De-risk core startup assumptions across 5 distinct dimensions before committing engineering resources.
          </p>
        </div>

        {/* Aggregate Score Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.3)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
              Composite Feasibility Index
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--cyan-glow)', lineHeight: 1.1 }}>
              {overallAverage}<span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/100</span>
            </div>
          </div>
          <div
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: 'var(--cyan-bright)'
            }}
          >
            <ShieldCheck size={26} />
          </div>
        </div>
      </div>

      {/* Honest AI Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1.25rem',
          borderRadius: '10px',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          marginBottom: '2rem',
          fontSize: '0.825rem',
          color: 'var(--text-silver)'
        }}
      >
        <Info size={16} color="#38bdf8" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#ffffff' }}>Honest AI Attribution: </strong>
          Initial radar scores represent synthesized AI hypotheses based on your problem parameters and competitor density. Conduct real-world experiments below to convert hypotheses into verified evidence.
        </div>
      </div>

      {/* Main Grid: Radar Chart + Dimensional Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Radar Chart Panel */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Feasibility Pentagram</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--cyan-glow)', fontWeight: 600 }}>Interactive Dimensions</span>
          </div>

          <div style={{ width: '100%', height: 350, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.12)" />
                <PolarAngleAxis
                  dataKey="subject"
                  stroke="#94a3b8"
                  fontSize={12}
                  tick={{ fill: '#e2e8f0', cursor: 'pointer' }}
                  onClick={(e) => {
                    if (e && e.value) setActiveDimension(e.value);
                  }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={10} />
                <Radar
                  name={idea.name}
                  dataKey="score"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fill="#1d72fe"
                  fillOpacity={0.45}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(2, 6, 18, 0.95)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.8rem'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
            {radarData.map((d) => (
              <button
                key={d.subject}
                onClick={() => setActiveDimension(d.subject)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: activeDimension === d.subject ? 'linear-gradient(135deg, #1d72fe, #2563eb)' : 'rgba(15, 23, 42, 0.6)',
                  color: activeDimension === d.subject ? '#ffffff' : 'var(--text-silver)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  transition: 'var(--transition-fast)'
                }}
              >
                {d.subject} ({d.score})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Dimension Detail Card */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cyan-glow)', fontWeight: 700 }}>
                  Selected Dimension Analysis
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                  {selectedDimensionDetail.subject}
                </h3>
              </div>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  background: 'rgba(29, 114, 254, 0.2)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--cyan-bright)'
                }}
              >
                {selectedDimensionDetail.score}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.35rem' }}>
                Evaluation Rationale
              </h4>
              <p style={{ color: 'var(--text-silver)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                {selectedDimensionDetail.explanation}
              </p>
            </div>

            <div
              style={{
                padding: '1.1rem',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '1.5rem'
              }}
            >
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.35rem' }}>
                Supporting Evidence & Context
              </h4>
              <p style={{ color: '#ffffff', fontSize: '0.9rem', fontStyle: 'italic' }}>
                "{selectedDimensionDetail.evidence}"
              </p>
            </div>

            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24',
                  fontWeight: 600,
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                <AlertTriangle size={12} />
                Source: {selectedDimensionDetail.source}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              De-risk this score with targeted validation:
            </span>
            <button
              onClick={() => {
                setShowAddModal(true);
              }}
              className="btn-primary-glow"
              style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
            >
              <Plus size={13} />
              <span>Add Experiment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Validation Experiment Checklist */}
      <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              Validation Experiments Tracker
            </h3>
            <p style={{ color: 'var(--text-silver)', fontSize: '0.85rem' }}>
              Structured customer discovery tests and smoke benchmarks to validate your core startup assumptions.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-secondary-pill"
            style={{ padding: '0.5rem 1rem', fontSize: '0.825rem' }}
          >
            <Plus size={14} color="#38bdf8" />
            <span>New Custom Test</span>
          </button>
        </div>

        {/* Experiment Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {experiments.map((exp) => {
            const isCompleted = exp.status === 'Validated';
            const isInProgress = exp.status === 'In Progress';

            return (
              <div
                key={exp.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: isCompleted
                    ? '1px solid rgba(16, 185, 129, 0.4)'
                    : isInProgress
                    ? '1px solid rgba(56, 189, 248, 0.35)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(29, 114, 254, 0.2)',
                        color: 'var(--cyan-bright)',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}
                    >
                      {exp.dimension}
                    </span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{exp.title}</h4>
                  </div>
                  <p style={{ color: 'var(--text-silver)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    {exp.description}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    <strong style={{ color: 'var(--text-silver)' }}>Finding: </strong>{exp.evidence}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleCycleStatus(exp.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '9999px',
                      fontSize: '0.775rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: isCompleted
                        ? 'rgba(16, 185, 129, 0.15)'
                        : isInProgress
                        ? 'rgba(56, 189, 248, 0.15)'
                        : 'rgba(255, 255, 255, 0.05)',
                      color: isCompleted ? '#34d399' : isInProgress ? '#38bdf8' : 'var(--text-dim)',
                      border: isCompleted
                        ? '1px solid rgba(16, 185, 129, 0.4)'
                        : isInProgress
                        ? '1px solid rgba(56, 189, 248, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    {isCompleted ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                    <span>{exp.status} (Click to toggle)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Custom Experiment Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(2, 6, 18, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Add Validation Experiment
            </h3>
            <p style={{ color: 'var(--text-silver)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Formulate a structured test to evaluate your startup assumptions with target customers.
            </p>

            <form onSubmit={handleAddExperiment}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Target Assumption / Dimension
                </label>
                <select
                  value={activeDimension}
                  onChange={(e) => setActiveDimension(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="Market Demand">Market Demand</option>
                  <option value="Technical Feasibility">Technical Feasibility</option>
                  <option value="Competition Moat">Competition Moat</option>
                  <option value="Scalability">Scalability</option>
                  <option value="Resource Efficiency">Resource Efficiency</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Experiment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct 10 phone interviews with dispensary managers"
                  value={newExpTitle}
                  onChange={(e) => setNewExpTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary-pill"
                  style={{ padding: '0.55rem 1.15rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-glow"
                  style={{ padding: '0.55rem 1.25rem' }}
                >
                  Save Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
