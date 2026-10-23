import React from 'react';
import { Target, Compass, LineChart, ShieldCheck } from 'lucide-react';

export default function AboutSection({ onExplore }) {
  const pillars = [
    {
      icon: <Target size={24} color="#38bdf8" />,
      title: "Root-Cause Discovery",
      desc: "Great startups aren't born from random brainstorming; they emerge from deeply felt real-world friction. VISION helps you dissect who is hurting, why existing solutions fail, and what constraints exist."
    },
    {
      icon: <Compass size={24} color="#60a5fa" />,
      title: "Actionable Roadmaps",
      desc: "Forget abstract 50-page business plans. VISION builds phased, realistic roadmaps focused on rapid validation, MVP scoping, lean tech stacks, and tangible early milestones."
    },
    {
      icon: <LineChart size={24} color="#38bdf8" />,
      title: "Uncompromising Transparency",
      desc: "No inflated projections or false promises. Financial breakdowns clearly differentiate essential vs. optional costs, suggest free alternatives, and label assumptions openly."
    },
    {
      icon: <ShieldCheck size={24} color="#67e8f9" />,
      title: "Continuous Progress Workspace",
      desc: "Once your journey begins, your workspace tracks real task completions, milestone dates, and decision tradeoffs—serving as live memory for your AI co-pilot."
    }
  ];

  return (
    <section
      id="about"
      style={{
        position: 'relative',
        padding: '7rem 0',
        zIndex: 1,
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '750px', marginBottom: '4rem' }}>
          <div
            style={{
              fontSize: '0.825rem',
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--cyan-glow)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span style={{ width: '18px', height: '2px', background: '#38bdf8', display: 'inline-block' }} />
            The VISION Philosophy
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '1.25rem',
              color: '#ffffff',
            }}
          >
            Every real-world challenge is an{' '}
            <span style={{ color: 'var(--cyan-glow)' }}>unlocked venture.</span>
          </h2>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-silver)',
              lineHeight: 1.7,
            }}
          >
            Most aspiring founders get stuck either ideating in a vacuum or building things nobody wants.
            VISION bridges this chasm by applying structured AI analysis to real problems, giving you
            the clarity, roadmap, and discipline to build with conviction.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: '2.25rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(29, 114, 254, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {p.icon}
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                {p.title}
              </h3>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.65 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
