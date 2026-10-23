import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, Lightbulb, MapPin, DollarSign, GitBranch, LayoutDashboard, Bot } from 'lucide-react';

export default function HowItWorksModal({ isOpen, onClose, onStartJourney }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "1. Problem Discovery",
      badge: "Real-World Context",
      icon: <Lightbulb size={24} color="#38bdf8" />,
      desc: "Describe a genuine friction point in your community, work, or industry. Specify who is affected, constraints, and current broken workarounds.",
      preview: {
        domain: "Agriculture & Food Supply",
        problem: "Smallholder farmers lose 35% of harvested perishable produce due to fragmented cold storage access and volatile spot market pricing.",
        impact: "Over 40,000 local farmers experience 30% annual revenue loss."
      }
    },
    {
      title: "2. Startup Opportunity Generation",
      badge: "Algorithmic Analysis",
      icon: <CheckCircle2 size={24} color="#67e8f9" />,
      desc: "VISION analyzes root causes and presents 3 distinct, actionable startup concepts complete with UVP, revenue models, feasibility scores, and validation tests.",
      preview: {
        concept: "SolarChill — Decentralized Micro Cold-Hubs",
        model: "Pay-as-you-store micro-subscription + logistics aggregation fee",
        feasibility: "High | Initial validation: 10 pilot cold locker deployments"
      }
    },
    {
      title: "3. Structured Execution Roadmap",
      badge: "Actionable Milestones",
      icon: <MapPin size={24} color="#1d72fe" />,
      desc: "Turn your chosen idea into a multi-phase implementation roadmap. Know what to validate first, what tools to use, and when to launch your MVP.",
      preview: {
        phase1: "Phase 1: 14-Day Validation (Customer Discovery Interviews)",
        phase2: "Phase 2: MVP Prototype (IoT sensor + WhatsApp booking bot)",
        phase3: "Phase 3: Pilot Traction (First 50 recurring farming cooperatives)"
      }
    },
    {
      title: "4. Budget & Resource Advisor",
      badge: "Financial Transparency",
      icon: <DollarSign size={24} color="#38bdf8" />,
      desc: "Enter your real budget and team capacity. VISION categorizes expenses into essential vs. optional, suggesting free/open-source tools to maximize your runway.",
      preview: {
        allocation: "Runway: $1,200 | Hardware & Sensors: 45% | Logistics: 25% | Ops: 15% | Buffer: 15%",
        leanAlternative: "Replace custom mobile app with Telegram/WhatsApp bot to save $3,500 upfront"
      }
    },
    {
      title: "5. Decision Simulator",
      badge: "Scenario Intelligence",
      icon: <GitBranch size={24} color="#60a5fa" />,
      desc: "Simulate major startup crossroads before spending money. Compare Solo vs. Co-founder, No-Code vs. Custom Tech, or Paid Ads vs. Organic Partnerships.",
      preview: {
        scenario: "Custom IoT Hardware vs. Off-The-Shelf BLE Loggers",
        tradeoff: "Off-the-shelf saves 8 weeks of time and $4,000, reducing early hardware iteration risk"
      }
    },
    {
      title: "6. Project Dashboard & AI Co-Pilot",
      badge: "Continuous Progress",
      icon: <Bot size={24} color="#38bdf8" />,
      desc: "Start your journey in a dedicated workspace. Track milestone completion, log real decisions, and consult your project-aware AI assistant anytime.",
      preview: {
        workspace: "Live Task Checklist | Milestones Progress Bar | Decision Log",
        assistant: "AI Co-pilot with active memory of your problem, roadmap, and budget"
      }
    }
  ];

  const current = steps[currentStep];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
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
        style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: '#050c22',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 0 50px rgba(29, 114, 254, 0.3)',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {current.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--cyan-glow)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
                {current.badge}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                {current.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              color: 'var(--text-muted)',
              padding: '0.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '2rem' }}>
          <p style={{ color: 'var(--text-silver)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            {current.desc}
          </p>

          {/* Interactive Preview Box */}
          <div
            style={{
              background: 'rgba(7, 18, 43, 0.85)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'var(--text-dim)',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
              Live Platform Preview // Step {currentStep + 1} of {steps.length}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {Object.entries(current.preview).map(([key, val]) => (
                <div key={key} style={{ fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--cyan-glow)', fontWeight: 600, textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1')}:{' '}
                  </span>
                  <span style={{ color: 'var(--text-silver)' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Dots */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                style={{
                  width: idx === currentStep ? '28px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: idx === currentStep ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="btn-secondary-pill"
              style={{ opacity: currentStep === 0 ? 0.3 : 1, padding: '0.6rem 1.25rem' }}
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="btn-primary-glow"
                style={{ padding: '0.65rem 1.5rem' }}
              >
                <span>Next Step</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onStartJourney();
                }}
                className="btn-primary-glow"
                style={{ padding: '0.65rem 1.75rem' }}
              >
                <span>Ready: Start My Journey</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
