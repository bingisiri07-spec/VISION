import React, { useState } from 'react';
import { DOMAIN_CATEGORIES, generateStartupIdeas } from '../../services/ideaEngine';
import {
  Lightbulb,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Layers,
  ChevronRight,
  Check,
  RotateCcw,
  Sliders,
  DollarSign,
  Activity,
  Globe,
  GraduationCap,
  Truck,
  Cpu,
  Sprout
} from 'lucide-react';

const CATEGORY_ICONS = {
  agriculture: <Sprout size={18} />,
  healthcare: <Activity size={18} />,
  education: <GraduationCap size={18} />,
  climate: <Globe size={18} />,
  transportation: <Truck size={18} />,
  technology: <Cpu size={18} />,
};

export default function ProblemDiscovery({ projectState, onIdeasGenerated, onSelectIdea, apiKey }) {
  const [domain, setDomain] = useState(projectState.problem?.domain || 'agriculture');
  const [problemStatement, setProblemStatement] = useState(projectState.problem?.problemStatement || '');
  const [affectedAudience, setAffectedAudience] = useState(projectState.problem?.affectedAudience || '');
  const [constraints, setConstraints] = useState(projectState.problem?.constraints || '');
  const [goals, setGoals] = useState(projectState.problem?.goals || '');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');
  const [isFallback, setIsFallback] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problemStatement.trim() || problemStatement.length < 15) {
      setError("Please describe the problem in at least 15 characters so VISION has adequate context to analyze.");
      return;
    }
    setError('');
    setIsFallback(false);
    setIsGenerating(true);

    const steps = [
      "Connecting to AI service...",
      "Analyzing problem root causes...",
      "Mapping affected stakeholder incentives...",
      "Synthesizing 3 differentiated startup solutions..."
    ];

    let stepIndex = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setLoadingStep(steps[stepIndex]);
      }
    }, 700);

    try {
      const generatedIdeas = await generateStartupIdeas({
        domain,
        problemStatement,
        affectedAudience,
        constraints,
        goals,
        apiKey
      });

      clearInterval(stepInterval);
      setIsGenerating(false);

      // Detect whether the Edge Function succeeded or the static fallback was used
      setIsFallback(Boolean(generatedIdeas._isFallback));

      onIdeasGenerated({
        problem: { domain, problemStatement, affectedAudience, constraints, goals },
        ideas: generatedIdeas
      });
    } catch (err) {
      clearInterval(stepInterval);
      setIsGenerating(false);
      setError("An unexpected error occurred while analyzing the problem. Please try again.");
    }
  };

  const handlePreFillSample = (sampleDomain, statement, audience, constraint) => {
    setDomain(sampleDomain);
    setProblemStatement(statement);
    setAffectedAudience(audience);
    setConstraints(constraint);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Step Header */}
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
          <Lightbulb size={16} />
          <span>Feature 01 // Problem Discovery Engine</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
          Deconstruct a Real-World Problem
        </h1>
        <p style={{ color: 'var(--text-silver)', fontSize: '1.05rem', maxWidth: '780px' }}>
          Describe a genuine friction point in your community, work, or industry.
          VISION will evaluate the root friction and synthesize tailored, viable startup opportunities.
        </p>
      </div>

      {/* Main Intake Form */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
        
        {/* Category Selector */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.75rem' }}>
            1. Select Problem Domain / Category
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {DOMAIN_CATEGORIES.map((cat) => {
              const isSelected = domain === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setDomain(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    textAlign: 'left',
                    background: isSelected ? 'rgba(29, 114, 254, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#ffffff' : 'var(--text-silver)',
                    transition: 'var(--transition-fast)',
                    boxShadow: isSelected ? '0 0 15px rgba(56, 189, 248, 0.25)' : 'none',
                  }}
                >
                  <span style={{ color: isSelected ? '#38bdf8' : 'var(--text-muted)' }}>
                    {CATEGORY_ICONS[cat.id]}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Problem Statement */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
              2. Describe the Real-World Problem in Your Own Words
            </label>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              {problemStatement.length} chars
            </span>
          </div>
          <textarea
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            placeholder="e.g. Smallholder tomato farmers in our region lose up to 35% of their crop before reaching city markets because cold storage is either nonexistent or unaffordable for micro-batches..."
            rows={4}
            style={{
              width: '100%',
              background: 'rgba(2, 6, 18, 0.6)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '12px',
              padding: '1rem',
              color: '#ffffff',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        {/* 2-Column Grid: Affected Audience & Constraints */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
              3. Who is Directly Affected? (Audience / Stakeholders)
            </label>
            <input
              type="text"
              value={affectedAudience}
              onChange={(e) => setAffectedAudience(e.target.value)}
              placeholder="e.g. 10,000+ local small farmers & independent wholesale buyers"
              style={{
                width: '100%',
                background: 'rgba(2, 6, 18, 0.6)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
              4. Key Constraints (Budget, Tech, Regulations)
            </label>
            <input
              type="text"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="e.g. Limited electricity grid in rural hubs; sub-$2,000 bootstrap budget"
              style={{
                width: '100%',
                background: 'rgba(2, 6, 18, 0.6)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Quick Sample Prompts */}
        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Quick Real-World Starter Examples (Click to Auto-Fill):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handlePreFillSample(
                'agriculture',
                'Smallholder fruit farmers face 35% crop spoilage due to lack of accessible cold storage and volatile local spot pricing.',
                'Rural micro-farmers earning under $3,000/year',
                'Intermittent rural electricity, bootstrap budget'
              )}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--cyan-bright)', border: '1px solid rgba(56, 189, 248, 0.25)' }}
            >
              🌱 Agricultural Spoilage
            </button>

            <button
              type="button"
              onClick={() => handlePreFillSample(
                'healthcare',
                'Rural primary healthcare clinics cannot get timely specialist diagnosis for chronic cardiac and diabetic patients, causing 50-mile travel delays.',
                'Rural clinic nurses and 45,000 elderly villagers',
                'Low cellular bandwidth, strict medical privacy'
              )}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--cyan-bright)', border: '1px solid rgba(56, 189, 248, 0.25)' }}
            >
              🩺 Rural Clinic Triage
            </button>

            <button
              type="button"
              onClick={() => handlePreFillSample(
                'education',
                'College engineering students graduate with theoretical knowledge but zero real-world codebase experience, leading to 60% rejection rates in junior software interviews.',
                'Undergraduate engineering students and local tech employers',
                'Students have zero spare income; limited time during semesters'
              )}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--cyan-bright)', border: '1px solid rgba(56, 189, 248, 0.25)' }}
            >
              🎓 Student Proof-of-Work Gap
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="submit"
            disabled={isGenerating}
            className="btn-primary-glow"
            style={{ padding: '0.95rem 2.2rem', fontSize: '1rem' }}
          >
            {isGenerating ? (
              <>
                <div style={{ width: '18px', height: '18px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span>{loadingStep}</span>
              </>
            ) : (
              <>
                <span>Synthesize Startup Opportunities</span>
                <Sparkles size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Ideas Presentation */}
      {projectState.ideas && projectState.ideas.length > 0 && (
        <div style={{ marginTop: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--cyan-glow)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700 }}>
                Analysis Results
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
                Generated Startup Opportunities ({projectState.ideas.length})
              </h2>
            </div>
            <p style={{ color: 'var(--text-silver)', fontSize: '0.95rem' }}>
              Compare feasibility, revenue mechanics, and select one idea to build your roadmap.
            </p>
          </div>

          {/* Fallback notice — only shown when AI service was unavailable */}
          {isFallback && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              marginBottom: '1.75rem',
              background: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              borderRadius: '10px',
              color: '#fde68a',
              fontSize: '0.875rem',
              lineHeight: 1.6,
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#facc15' }} />
              <span>
                <strong>AI service is currently unavailable.</strong> The ideas below are illustrative examples, not tailored to your specific problem.
                Your problem statement has been saved. Once the AI service is configured, regenerate to receive genuinely problem-specific startup opportunities.
              </span>
            </div>
          )}

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            {projectState.ideas.map((idea) => {
              const isSelected = projectState.selectedIdea?.id === idea.id;

              return (
                <div
                  key={idea.id}
                  className="glass-card"
                  style={{
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(56, 189, 248, 0.15)',
                    boxShadow: isSelected ? '0 0 30px rgba(56, 189, 248, 0.35)' : 'none',
                    background: isSelected ? 'rgba(7, 24, 60, 0.8)' : 'var(--bg-space-card)',
                  }}
                >
                  <div>
                    {/* Card Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan-glow)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          {idea.category}
                        </span>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                          {idea.name}
                        </h3>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '9999px',
                          background: idea.feasibilityScore > 80 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                          border: idea.feasibilityScore > 80 ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(234, 179, 8, 0.4)',
                          color: idea.feasibilityScore > 80 ? '#4ade80' : '#facc15',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        <TrendingUp size={12} />
                        <span>{idea.feasibilityScore}% Feasibility</span>
                      </div>
                    </div>

                    {/* Tagline */}
                    <p style={{ color: 'var(--text-silver)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                      "{idea.tagline}"
                    </p>

                    {/* Solution Description */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.35rem' }}>
                        Proposed Solution & Workflow
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        {idea.solution}
                      </p>
                    </div>

                    {/* Unique Value Prop */}
                    <div style={{ marginBottom: '1.25rem', padding: '0.85rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '10px', borderLeft: '3px solid #38bdf8' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cyan-bright)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Unique Value Proposition
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#ffffff' }}>
                        {idea.uniqueValueProp}
                      </div>
                    </div>

                    {/* Revenue Models */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <DollarSign size={13} color="#38bdf8" />
                        <span>Potential Revenue Models</span>
                      </div>
                      <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-silver)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                        {idea.revenueModels.map((rev, i) => (
                          <li key={i}>{rev}</li>
                        ))}
                      </ul>
                    </div>

                    {/* 14-Day Validation Steps */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
                        Initial 14-Day Validation Steps
                      </div>
                      <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                        {idea.validationSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Selection Button */}
                  <div style={{ paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <button
                      type="button"
                      onClick={() => onSelectIdea(idea)}
                      className={isSelected ? "btn-primary-glow" : "btn-secondary-pill"}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      {isSelected ? (
                        <>
                          <Check size={18} />
                          <span>Active Idea (Roadmap Ready)</span>
                        </>
                      ) : (
                        <>
                          <span>Select This Idea & Generate Roadmap</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
