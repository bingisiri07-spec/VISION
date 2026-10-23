/**
 * decisionEngine.js
 * Interactive scenario simulation engine for startup crossroads.
 * Calculates comparative trade-offs across Cost, Time, Risk, and Upside.
 */

export const PRESET_DECISION_SCENARIOS = [
  {
    id: 'solo-vs-team',
    title: 'Founder Architecture: Solo Founder vs. Recruiting a Technical Co-founder',
    category: 'Team & Governance',
    description: 'Should you initiate execution alone to maximize speed and equity, or invest time finding a complementary co-founder before starting?',
    optionA: {
      name: 'Option A: Solo Founder Execution',
      summary: 'Build and validate alone using existing skills, freelance contractors, and AI tooling.',
      cost: 'Low upfront financial burn; 100% equity retained.',
      time: 'Faster early decision making (zero co-founder consensus friction).',
      risk: 'Founder burnout; skill blind spots; single point of failure.',
      assumptions: [
        'You have either enough coding ability or enough domain hustle to reach early traction.',
        'You can manage emotional stress without a partner in the trenches.'
      ],
      estimatedTimeWeeks: '2 – 4 weeks to prototype',
      estimatedCashBurn: '$300 – $800'
    },
    optionB: {
      name: 'Option B: Recruit a Complementary Co-Founder',
      summary: 'Pause solo building to recruit and vet an equal partner with complementary skills.',
      cost: 'High equity cost (typically 30% - 50% split).',
      time: 'Can delay kickoff by 6–12 weeks while vetting cultural alignment.',
      risk: 'Co-founder conflict is the #1 reason early startups dissolve.',
      assumptions: [
        'You have access to trusted candidate networks or technical hackathons.',
        'Both founders agree on long-term commitment and equity vesting cliff.'
      ],
      estimatedTimeWeeks: '8 – 14 weeks to assemble team',
      estimatedCashBurn: '$0 – $300 (Coffee & Networking)'
    },
    recommendation: {
      verdict: 'Recommend Option A for Phases 1-2, then recruit for Phase 3.',
      reasoning: 'In the earliest validation phase, momentum is paramount. Building an initial smoke test or clickable prototype makes you 10x more attractive to high-caliber potential co-founders than merely having an unvalidated idea.'
    }
  },
  {
    id: 'mvp-scope',
    title: 'Product Scope: Razor-Thin Single Feature vs. Multi-Feature Platform',
    category: 'Product Strategy',
    description: 'Should you ship an ultra-focused single-purpose utility or develop a multi-feature platform to appear established?',
    optionA: {
      name: 'Option A: Laser-Focused Single Workflow MVP',
      summary: 'Solve one painful friction point with zero bells and whistles.',
      cost: 'Extremely low ($100 - $300).',
      time: 'Ready to test with live users in 14 days.',
      risk: 'Users may request auxiliary features before seeing value.',
      assumptions: [
        'The core problem solved is acute enough that users overlook missing polish.',
        'Early adopters prioritize rapid speed over fancy dashboards.'
      ],
      estimatedTimeWeeks: '2 – 3 weeks',
      estimatedCashBurn: '$150'
    },
    optionB: {
      name: 'Option B: Comprehensive Multi-Feature Suite',
      summary: 'Build user profiles, notification systems, multi-tier billing, and companion mobile apps upfront.',
      cost: 'High development and server maintenance costs ($2,000 - $5,000+).',
      time: '3 to 6 months of silent building before user feedback.',
      risk: 'Severe risk of building features nobody wants or understands.',
      assumptions: [
        'Users will not take a simple tool seriously without full enterprise bells & whistles.'
      ],
      estimatedTimeWeeks: '12 – 18 weeks',
      estimatedCashBurn: '$2,500 – $6,000'
    },
    recommendation: {
      verdict: 'Strongly Recommend Option A (Single Workflow MVP).',
      reasoning: 'Complexity kills early startups. Every extra feature multiplies your debugging surface and dilutes your feedback. Launch the single core mechanism first.'
    }
  },
  {
    id: 'tech-stack',
    title: 'Technology Path: No-Code / Low-Code vs. Custom Full-Stack Codebase',
    category: 'Engineering & Scalability',
    description: 'Should you assemble the prototype using tools like Bubble/Airtable/Zapier, or write custom code (React/Node/Supabase)?',
    optionA: {
      name: 'Option A: No-Code / Low-Code Assembly',
      summary: 'String together forms, database tables, and automation webhooks without writing code.',
      cost: 'Low development cost; moderate recurring tool subscriptions ($50 - $150/mo).',
      time: 'Rapid assembly (3–7 days).',
      risk: 'Vendor lock-in; performance slowdowns as user data scales.',
      assumptions: [
        'Your user workflow does not require proprietary machine learning or custom WebGL/real-time logic.'
      ],
      estimatedTimeWeeks: '1 – 2 weeks',
      estimatedCashBurn: '$100/mo'
    },
    optionB: {
      name: 'Option B: Custom Full-Stack (React + Supabase/SQL)',
      summary: 'Build clean, version-controlled repository with custom components and scalable relational schemas.',
      cost: 'Zero software licensing; pure developer time.',
      time: 'Requires 2–4 weeks to build authentication, API endpoints, and UI state.',
      risk: 'Spending too much time tweaking CSS and architecture before proving demand.',
      assumptions: [
        'Founder or team has working familiarity with modern JS/TS and web frameworks.'
      ],
      estimatedTimeWeeks: '3 – 5 weeks',
      estimatedCashBurn: '$0 (Free Hosting Tiers)'
    },
    recommendation: {
      verdict: 'Recommend Option B if you have engineering background; Option A if purely business.',
      reasoning: 'As an engineering student or developer, custom React/Supabase gives you complete freedom, zero subscription fees on free tiers, and reusable architecture you can scale indefinitely.'
    }
  },
  {
    id: 'growth-strategy',
    title: 'Customer Acquisition: Paid Ads vs. Organic Community & Founder Outreach',
    category: 'Go-To-Market',
    description: 'Should you allocate limited budget to Facebook/Google ads or invest sweat equity into manual 1-on-1 outreach?',
    optionA: {
      name: 'Option A: Organic Direct Founder Outreach & Communities',
      summary: 'Send 20 personalized cold messages a day, engage in relevant subreddits, forums, and local meetups.',
      cost: '$0 cash outlay.',
      time: 'High time expenditure (10–15 hours/week).',
      risk: 'Slow linear growth; requires thick skin against non-responses.',
      assumptions: [
        'You can clearly articulate your value proposition in 2 sentences.',
        'Target customers congregate in identifiable online or offline hubs.'
      ],
      estimatedTimeWeeks: 'Continuous (Weeks 1–8)',
      estimatedCashBurn: '$0'
    },
    optionB: {
      name: 'Option B: Paid Social / Search Ads',
      summary: 'Run targeted pay-per-click ad campaigns directing traffic to a landing page.',
      cost: 'High cash burn ($300 – $1,500/month).',
      time: 'Fast quantitative feedback on click-through rates within 48 hours.',
      risk: 'Without dialed positioning, money is incinerated without qualitative insight into why users bounced.',
      assumptions: [
        'Your unit economics and pricing can support customer acquisition cost (CAC).'
      ],
      estimatedTimeWeeks: '1 – 2 weeks setup',
      estimatedCashBurn: '$500 – $1,500'
    },
    recommendation: {
      verdict: 'Strongly Recommend Option A for the first 50 users.',
      reasoning: 'Paid ads only show that someone clicked or did not click; they never tell you WHY. Direct manual outreach gives you rich conversational feedback that refines your product.'
    }
  }
];

export function evaluateCustomDecision({ decisionTitle, optionAName, optionBName, userContext }) {
  return {
    id: `custom_${Date.now()}`,
    title: decisionTitle,
    category: 'Custom Strategic Choice',
    description: `Analysis evaluating: "${optionAName}" versus "${optionBName}" for project ${userContext?.ideaName || 'your venture'}.`,
    optionA: {
      name: optionAName,
      summary: `Proceeding with ${optionAName}. Focuses on near-term simplicity.`,
      cost: 'Preserves immediate cash runway; shifts cost to execution diligence.',
      time: 'Allows immediate execution without external dependency.',
      risk: 'Potential rework if long-term requirements outgrow this choice.',
      assumptions: ['Key requirements remain stable over the next 60 days.'],
      estimatedTimeWeeks: '1 – 3 weeks',
      estimatedCashBurn: 'Low'
    },
    optionB: {
      name: optionBName,
      summary: `Proceeding with ${optionBName}. Focuses on higher upfront investment for broader capability.`,
      cost: 'Higher upfront commitment of either capital or time.',
      time: 'May push back initial launch timeline.',
      risk: 'Over-engineering before product-market validation.',
      assumptions: ['User demand is proven enough to justify extended investment.'],
      estimatedTimeWeeks: '4 – 8 weeks',
      estimatedCashBurn: 'Moderate to High'
    },
    recommendation: {
      verdict: `Lean toward whichever option delivers validated user feedback fastest.`,
      reasoning: `In pre-seed stages, the highest risk is building the wrong thing slowly. Pick the path that shortens your time to contact with real users.`
    }
  };
}
