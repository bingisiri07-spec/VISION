import React, { useState } from 'react';
import { calculateBudgetBreakdown } from '../../services/budgetEngine';
import {
  DollarSign,
  TrendingDown,
  ShieldAlert,
  Sparkles,
  Sliders,
  CheckCircle,
  XCircle,
  ArrowRight,
  Info,
  Clock,
  Users
} from 'lucide-react';

export default function BudgetAdvisor({ budgetState, onUpdateBudget, onProceedToDecisions }) {
  const [availableBudget, setAvailableBudget] = useState(budgetState.availableBudget || 1500);
  const [runwayMonths, setRunwayMonths] = useState(budgetState.runwayMonths || 3);
  const [teamSize, setTeamSize] = useState(budgetState.teamSize || 1);
  const [timeAvailable, setTimeAvailable] = useState(budgetState.timeAvailableHoursPerWeek || 20);

  // Recalculate dynamic budget breakdown
  const breakdown = calculateBudgetBreakdown({
    availableBudget,
    teamSize,
    timeAvailableHoursPerWeek: timeAvailable,
    runwayMonths,
  });

  const handleApplyChanges = () => {
    onUpdateBudget({
      availableBudget,
      runwayMonths,
      teamSize,
      timeAvailableHoursPerWeek: timeAvailable,
      ...breakdown,
    });
  };

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
          <DollarSign size={16} />
          <span>Feature 03 // Budget & Resource Advisor</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
          Lean Financial Architecture
        </h1>
        <p style={{ color: 'var(--text-silver)', fontSize: '1.05rem', maxWidth: '780px' }}>
          Model your capital, runway, and time allocation. Differentiate mission-critical infrastructure
          from optional expenses to maximize your survival odds.
        </p>
      </div>

      {/* Top Interactive Configuration Panel */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={20} color="#38bdf8" />
          <span>Adjust Founder Constraints & Runway Parameters</span>
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          {/* Total Budget Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>Available Capital</label>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--cyan-glow)' }}>${availableBudget}</span>
            </div>
            <input
              type="range"
              min={200}
              max={10000}
              step={100}
              value={availableBudget}
              onChange={(e) => setAvailableBudget(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#1d72fe', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              <span>$200 (Micro)</span>
              <span>$10,000 (Seed)</span>
            </div>
          </div>

          {/* Runway Months */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>Runway Target</label>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--cyan-glow)' }}>{runwayMonths} Months</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={runwayMonths}
              onChange={(e) => setRunwayMonths(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#1d72fe', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              <span>1 Month</span>
              <span>12 Months</span>
            </div>
          </div>

          {/* Weekly Available Hours */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>Time Commitment</label>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--cyan-glow)' }}>{timeAvailable} hrs/wk</span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={timeAvailable}
              onChange={(e) => setTimeAvailable(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#1d72fe', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              <span>5h (Side project)</span>
              <span>60h (Full time)</span>
            </div>
          </div>

          {/* Team Size */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>Active Team Size</label>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--cyan-glow)' }}>{teamSize} {teamSize === 1 ? 'Founder' : 'Founders'}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#1d72fe', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              <span>1 (Solo)</span>
              <span>5 (Core Team)</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            onClick={handleApplyChanges}
            className="btn-primary-glow"
            style={{ padding: '0.75rem 1.75rem' }}
          >
            <span>Lock In Budget Model</span>
          </button>
        </div>
      </div>

      {/* Suggested Budget Allocations */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>
          Suggested Capital Allocation Envelope
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {breakdown.allocations.map((alloc, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: alloc.priority === 'Essential' ? '#38bdf8' : '#facc15', textTransform: 'uppercase' }}>
                    {alloc.priority} ({alloc.percentage}%)
                  </span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                    ${alloc.amount}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                  {alloc.category}
                </h3>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.55 }}>
                  {alloc.description}
                </p>
              </div>

              {/* Progress visual bar */}
              <div style={{ marginTop: '1.25rem', height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${alloc.percentage}%`, background: 'linear-gradient(90deg, #1d72fe, #38bdf8)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column: Essential vs. Optional Expenses Table */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem',
        }}
      >
        {/* Essential Expenses */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <CheckCircle size={20} color="#4ade80" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff' }}>
              Essential Expenses (Keep These)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {breakdown.essentialExpenses.map((exp, i) => (
              <div
                key={i}
                style={{
                  padding: '1rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.95rem' }}>{exp.name}</div>
                  <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.9rem' }}>{exp.cost}</span>
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{exp.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional / Deferrable Expenses */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <XCircle size={20} color="#f87171" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff' }}>
              Optional / Skip for Now (Save Runway)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {breakdown.optionalExpenses.map((exp, i) => (
              <div
                key={i}
                style={{
                  padding: '1rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.95rem' }}>{exp.name}</div>
                  <span style={{ color: '#f87171', fontWeight: 700, fontSize: '0.85rem' }}>{exp.verdict}</span>
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--cyan-glow)' }}>Lean Alternative: </span>
                  {exp.alternative}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Free Tool Alternatives Table */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Sparkles size={20} color="#38bdf8" />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff' }}>
            Recommended Free / Open-Source Tech Stack
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Costly Default Tool</th>
                <th style={{ padding: '0.75rem 1rem' }}>Free / Open-Source Alternative</th>
                <th style={{ padding: '0.75rem 1rem' }}>Monthly Savings</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.freeToolAlternatives.map((alt, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '0.85rem 1rem', color: '#ffffff', fontWeight: 600 }}>{alt.category}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#fca5a5' }}>{alt.paidTool}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#67e8f9', fontWeight: 600 }}>{alt.freeAlternative}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#4ade80', fontWeight: 700 }}>{alt.savings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Risks & Disclaimers */}
      <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(234, 179, 8, 0.25)', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#facc15' }}>
          <ShieldAlert size={20} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Runway Risk & Constraint Assessment</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {breakdown.financialRisks.map((risk, i) => (
            <div key={i} style={{ padding: '0.85rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px' }}>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                [{risk.level}] {risk.title}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-silver)', lineHeight: 1.5 }}>
                {risk.detail}
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={14} />
          <span>{breakdown.disclaimer}</span>
        </div>
      </div>

      {/* Bottom Transition */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button
          onClick={onProceedToDecisions}
          className="btn-primary-glow"
          style={{ padding: '0.95rem 2.2rem' }}
        >
          <span>Explore Decision Simulator</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
