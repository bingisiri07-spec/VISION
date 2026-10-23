/**
 * budgetEngine.js
 * Generates transparent financial breakdowns, essential vs optional categorization,
 * low-budget alternatives, and runway risk analysis.
 */

export function calculateBudgetBreakdown({
  availableBudget = 1500,
  teamSize = 1,
  timeAvailableHoursPerWeek = 20,
  runwayMonths = 3,
}) {
  const budgetNum = Math.max(100, Number(availableBudget) || 1500);
  const monthsNum = Math.max(1, Number(runwayMonths) || 3);
  const monthlyBurnCapacity = Math.round(budgetNum / monthsNum);

  // Suggested Allocation Percentages based on Lean Bootstrapping:
  // 35% Product & Infrastructure, 25% Validation & Customer Acquisition, 20% Operations & Domain/Legal, 20% Contingency Buffer
  const allocations = [
    {
      category: 'Product & Tech Infrastructure',
      percentage: 35,
      amount: Math.round(budgetNum * 0.35),
      description: 'Cloud hosting, database tiers, APIs, domain names, SSL, essential developer tools.',
      priority: 'Essential'
    },
    {
      category: 'Customer Discovery & Validation',
      percentage: 25,
      amount: Math.round(budgetNum * 0.25),
      description: 'Landing page tests, user interview incentives, targeted pilot ads, outreach tools.',
      priority: 'Essential'
    },
    {
      category: 'Operations, Legal & Software',
      percentage: 20,
      amount: Math.round(budgetNum * 0.20),
      description: 'Basic business workspace email, accounting software, contract templates.',
      priority: 'Flexible'
    },
    {
      category: 'Emergency Runway Buffer',
      percentage: 20,
      amount: Math.round(budgetNum * 0.20),
      description: 'Unplanned API rate spikes, test device acquisitions, and extended runway margin.',
      priority: 'Essential'
    }
  ];

  const essentialExpenses = [
    { name: 'Custom Domain & DNS (.com or .io)', cost: '$12 - $35/yr', importance: 'High', note: 'Provides instant credibility for customer discovery outreach.' },
    { name: 'Micro-Database & Backend Hosting', cost: '$0 - $25/mo', importance: 'High', note: 'Free on Supabase / Firebase hobby tiers up to 500MB.' },
    { name: 'Frontend Hosting & CDN', cost: '$0 (Free)', importance: 'High', note: 'Free tier on Vercel / Netlify / Cloudflare Pages.' },
    { name: 'User Discovery Interview Incentives', cost: '$50 - $150 total', importance: 'Medium', note: 'Coffee cards or Amazon credits to thank 15 interviewees.' },
    { name: 'Basic Business Email & Collaboration', cost: '$6/mo or Free', importance: 'Medium', note: 'Google Workspace ($6/user) or Zoho Mail Free (5 users).' }
  ];

  const optionalExpenses = [
    { name: 'Premium Logo & Branding Agencies', cost: '$300 - $1,500', verdict: 'Skip for MVP', alternative: 'Use free tools like Canva or simple modern typography.' },
    { name: 'Paid Social Ad Campaigns', cost: '$250 - $1,000/mo', verdict: 'Defer to Phase 3', alternative: 'Direct founder outreach via LinkedIn, Reddit, and WhatsApp.' },
    { name: 'Enterprise Analytics (Mixpanel/Amplitude paid)', cost: '$100+/mo', verdict: 'Skip', alternative: 'Use PostHog Cloud (free 1M events/month) or Umami.' },
    { name: 'Full Delaware C-Corp Incorporation (Stripe Atlas)', cost: '$500 upfront', verdict: 'Defer until first $1k revenue', alternative: 'Operate as sole proprietorship during validation phase.' }
  ];

  const freeToolAlternatives = [
    { category: 'Database & Auth', paidTool: 'AWS RDS + Auth0 ($80+/mo)', freeAlternative: 'Supabase / Firebase (Generous Free Tier)', savings: '~$80/month' },
    { category: 'Hosting & CI/CD', paidTool: 'Dedicated VPS ($25/mo)', freeAlternative: 'Vercel / Cloudflare Pages / Render (Free)', savings: '~$25/month' },
    { category: 'Design & Mockups', paidTool: 'Adobe Creative Suite ($55/mo)', freeAlternative: 'Figma Free + Penpot (Free Open Source)', savings: '~$55/month' },
    { category: 'User Forms & Surveys', paidTool: 'Typeform Pro ($35/mo)', freeAlternative: 'Tally.so (100% Free Unlimited Forms)', savings: '~$35/month' },
    { category: 'Transactional Email', paidTool: 'SendGrid Paid ($20/mo)', freeAlternative: 'Resend (Free 3,000 emails/month)', savings: '~$20/month' }
  ];

  const financialRisks = [];
  if (budgetNum < 500) {
    financialRisks.push({
      level: 'High Risk',
      title: 'Ultra-Lean Capital Runway',
      detail: `At $${budgetNum}, your financial margin for paid experiments is virtually zero. You must rely 100% on free-tier software and organic manual outreach.`
    });
  } else if (budgetNum < 1500) {
    financialRisks.push({
      level: 'Moderate Risk',
      title: 'Disciplined Bootstrap Envelope',
      detail: `Your $${budgetNum} budget provides approximately $${monthlyBurnCapacity}/month over ${monthsNum} months. Avoid all recurring software subscriptions until revenue is verified.`
    });
  } else {
    financialRisks.push({
      level: 'Healthy Bootstrap',
      title: 'Comfortable Seed Margin',
      detail: `At $${budgetNum}, you have adequate runway to test multiple prototype iterations, acquire specialized sensors/APIs, and hire specialized freelance micro-tasks if needed.`
    });
  }

  if (timeAvailableHoursPerWeek < 15) {
    financialRisks.push({
      level: 'Time Constraint Risk',
      title: 'Part-Time Founder Velocity',
      detail: `${timeAvailableHoursPerWeek} hrs/week means progress will require laser focus. Avoid building multi-sided platforms; scope your MVP to a single user flow.`
    });
  }

  return {
    availableBudget: budgetNum,
    runwayMonths: monthsNum,
    monthlyBurnCapacity,
    allocations,
    essentialExpenses,
    optionalExpenses,
    freeToolAlternatives,
    financialRisks,
    disclaimer: "These cost models and tool recommendations are scenario simulations based on lean startup principles. Actual vendor pricing, cloud consumption, and legal fees vary by country and usage."
  };
}
