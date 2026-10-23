/**
 * roadmapEngine.js
 * Generates an end-to-end phased execution roadmap tailored to the selected idea.
 */

export function generateExecutionPlan(selectedIdea, userConstraints = {}) {
  const ideaName = selectedIdea?.name || 'Your Venture';
  const category = selectedIdea?.category || 'Tech & Services';

  return {
    overview: {
      ideaName,
      category,
      estimatedTimelineWeeks: 14,
      estimatedBudgetRange: '$800 - $3,500 (Lean Bootstrap)',
      targetAudience: selectedIdea?.targetAudience || 'Early adopters facing acute pain',
      mvpCoreScope: `A stripped-down, high-reliability prototype resolving the core bottleneck of: "${selectedIdea?.uniqueValueProp || 'the core solution'}"`,
      disclaimer: "All budgets, timelines, and market outcomes are scenario estimates based on lean startup benchmarks, not guaranteed financial results."
    },
    fundingOptions: [
      {
        type: 'Bootstrapping (Recommended for Phase 1-2)',
        desc: 'Self-funded micro-budget ($500 - $1,500) using free tools, personal savings, or founder sweat equity.',
        pros: 'Retain 100% equity; maintain absolute speed and autonomy.',
        cons: 'Requires personal financial discipline and lean tool selection.'
      },
      {
        type: 'Pre-Sales & Customer LOIs',
        desc: 'Securing paid pilot commitments or Letters of Intent from prospective users before full build.',
        pros: 'Strongest proof of validation; zero dilution.',
        cons: 'Requires high-conviction direct sales ability.'
      },
      {
        type: 'Micro-Grants & University Competitions',
        desc: 'Non-dilutive student grants ($1,000 - $15,000) from regional innovation hubs, climate/social impact funds.',
        pros: 'Free capital; institutional credibility.',
        cons: 'Application timelines can take 6-12 weeks.'
      },
      {
        type: 'Angel Investors & Pre-Seed Accelerators',
        desc: 'Once initial pilot traction is documented with 20+ active users or first revenue.',
        pros: 'Capital for team expansion and marketing.',
        cons: 'Equity dilution (typically 7-15%) and investor reporting obligations.'
      }
    ],
    phases: [
      {
        id: 'phase_1',
        title: 'Phase 1: Validation & Customer Discovery',
        timeframe: 'Weeks 1 – 2',
        objective: 'Confirm problem urgency, willingness to pay, and target audience workarounds before writing code.',
        estimatedCost: '$50 – $150',
        skillsNeeded: ['Customer Discovery Interviewing', 'Cold Outreach', 'Landing Page Copywriting'],
        toolsRecommended: ['Google Forms / Tally (Free)', 'Carrd / Typedream ($9 or Free tier)', 'WhatsApp / LinkedIn for outreach'],
        tasks: [
          {
            id: 't1_1',
            title: 'Define Customer Persona & Hypothesis Canvas',
            desc: 'Map out the specific demographic, their current broken workaround, and the financial/time cost of the problem.',
            completed: false,
            estimatedDays: 2,
            category: 'Research'
          },
          {
            id: 't1_2',
            title: 'Conduct 15 Problem Discovery Interviews',
            desc: 'Talk directly to affected users using Mom-Test principles (ask about their past behavior, never ask "Would you buy this?").',
            completed: false,
            estimatedDays: 5,
            category: 'Validation'
          },
          {
            id: 't1_3',
            title: 'Build Smoke-Test Landing Page & Waitlist',
            desc: 'A single high-converting landing page explaining the UVP with an email/WhatsApp waitlist trigger.',
            completed: false,
            estimatedDays: 3,
            category: 'Marketing'
          },
          {
            id: 't1_4',
            title: 'Synthesize Validation Gate Check',
            desc: 'Evaluate: Did at least 6 out of 10 interviewees exhibit desperate need and request to test the first release?',
            completed: false,
            estimatedDays: 2,
            category: 'Decision Gate'
          }
        ]
      },
      {
        id: 'phase_2',
        title: 'Phase 2: Lean MVP Prototyping',
        timeframe: 'Weeks 3 – 6',
        objective: 'Construct the simplest functional mechanism that delivers the core value proposition to initial test users.',
        estimatedCost: '$150 – $400',
        skillsNeeded: ['Frontend/Full-stack Development or No-Code workflow', 'Basic UI/UX in Figma', 'API integration'],
        toolsRecommended: ['React + Vite or Next.js (Free)', 'Supabase or Firebase (Free tiers)', 'Tailwind CSS', 'Vercel / Netlify (Free hosting)'],
        tasks: [
          {
            id: 't2_1',
            title: 'Scope the "Cut-in-Half" MVP Spec',
            desc: 'Write down every intended feature, then eliminate 50% until only the single mission-critical workflow remains.',
            completed: false,
            estimatedDays: 3,
            category: 'Product'
          },
          {
            id: 't2_2',
            title: 'Interactive Wireframes & User Journey Map',
            desc: 'Draft the 3 main screens in Figma (Mobile-friendly layout, clean typography, unambiguous CTA).',
            completed: false,
            estimatedDays: 4,
            category: 'Design'
          },
          {
            id: 't2_3',
            title: 'Develop Working Alpha Build',
            desc: 'Connect user authentication, data models, and the core algorithmic or operational workflow.',
            completed: false,
            estimatedDays: 14,
            category: 'Engineering'
          },
          {
            id: 't2_4',
            title: 'Internal End-to-End Stress Test',
            desc: 'Simulate real usage scenarios, verify error states, test network dropouts, and check responsive display.',
            completed: false,
            estimatedDays: 3,
            category: 'QA & Testing'
          }
        ]
      },
      {
        id: 'phase_3',
        title: 'Phase 3: Closed Pilot & Initial Traction',
        timeframe: 'Weeks 7 – 10',
        objective: 'Onboard the first 25–50 real users, observe actual retention, and measure core value delivery.',
        estimatedCost: '$200 – $600',
        skillsNeeded: ['Hands-on Customer Onboarding (Concierge)', 'Analytics Tracking', 'Rapid Bug Triage'],
        toolsRecommended: ['PostHog / Umami (Analytics - Free)', 'Crisp / Intercom Free Tier', 'Sentry (Error tracking)'],
        tasks: [
          {
            id: 't3_1',
            title: 'Onboard First 10 Beta Users Manually',
            desc: 'Walk each user through onboarding live over Zoom or in-person. Watch where they hesitate or get confused.',
            completed: false,
            estimatedDays: 4,
            category: 'Operations'
          },
          {
            id: 't3_2',
            title: 'Collect Net Promoter & Value Retention Metrics',
            desc: 'Ask users: "How would you feel if you could no longer use this product tomorrow?" (Aim for >40% "Very Disappointed").',
            completed: false,
            estimatedDays: 7,
            category: 'Customer Success'
          },
          {
            id: 't3_3',
            title: 'Execute First Commercial Micro-Transaction / Invoice',
            desc: 'Test pricing elasticity: ask pilot users to pay the first nominal subscription or transaction fee.',
            completed: false,
            estimatedDays: 5,
            category: 'Revenue'
          },
          {
            id: 't3_4',
            title: 'Product-Market Fit Iteration Sprint',
            desc: 'Refactor UX based on direct user quotes and fix the top 3 reported blockers.',
            completed: false,
            estimatedDays: 8,
            category: 'Engineering'
          }
        ]
      },
      {
        id: 'phase_4',
        title: 'Phase 4: Scalable Systems & Growth Distribution',
        timeframe: 'Weeks 11 – 14',
        objective: 'Formalize repeatable customer acquisition, legal/compliance groundwork, and prepare seed funding decks.',
        estimatedCost: '$300 – $1,200',
        skillsNeeded: ['Content & Distribution Strategy', 'Financial Modeling', 'Pitch Deck Creation'],
        toolsRecommended: ['Notion / Pitch.com', 'Stripe / Lemon Squeezy', 'Google Workspace'],
        tasks: [
          {
            id: 't4_1',
            title: 'Establish 2 Repeatable Distribution Channels',
            desc: 'Double down on the channel that delivered the lowest CAC in Phase 3 (e.g. Community partnerships, SEO, Direct B2B).',
            completed: false,
            estimatedDays: 10,
            category: 'Growth'
          },
          {
            id: 't4_2',
            title: 'Formal Business Entity & Banking Setup',
            desc: 'Incorporate legal structure (e.g. Delaware C-Corp or local private limited) and connect business payments.',
            completed: false,
            estimatedDays: 7,
            category: 'Legal & Finance'
          },
          {
            id: 't4_3',
            title: 'Assemble 10-Slide Investor / Grant Narrative',
            desc: 'Highlight: The acute problem, the traction evidence, unit economics, the visionary team, and use of funds.',
            completed: false,
            estimatedDays: 6,
            category: 'Fundraising'
          }
        ]
      }
    ]
  };
}
