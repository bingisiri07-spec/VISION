/**
 * budgetEngine.js
 * Generates transparent financial breakdowns, essential vs optional categorization,
 * low-budget alternatives, and runway risk analysis in Indian Rupees (INR – ₹).
 *
 * All amounts use the Indian numbering system (e.g. ₹5,000, ₹25,000, ₹1,50,000, ₹10,00,000).
 */

// Exchange rate reference for transparent foreign currency conversions
export const USD_TO_INR_RATE = 83.5;

/**
 * Formats numeric values to Indian Rupee (INR) currency strings using the Indian numbering system.
 * e.g., 5000 -> ₹5,000; 150000 -> ₹1,50,000; 1000000 -> ₹10,00,000
 */
export function formatINR(amount) {
  const num = Math.round(Number(amount) || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Transparently converts USD amounts to INR with an explicit conversion label.
 */
export function convertUSDtoINR(usdAmount, rate = USD_TO_INR_RATE) {
  const inr = Math.round((Number(usdAmount) || 0) * rate);
  return {
    inr,
    formatted: formatINR(inr),
    rate,
    isConverted: true,
    conversionNote: `Converted from $${usdAmount} at reference rate ₹${rate}/USD`,
  };
}

/**
 * Calculates dynamic startup financial architecture tailored for Indian founders.
 */
export function calculateBudgetBreakdown(params = {}) {
  const options = typeof params === 'number' ? { availableBudget: params } : (params || {});
  const {
    availableBudget = 150000,
    teamSize = 1,
    timeAvailableHoursPerWeek = 20,
    runwayMonths = 3,
  } = options;

  // Graceful legacy migration: if budget is under 5000, it was stored in old USD scale (e.g. 1500)
  let rawBudget = Number(availableBudget) || 150000;
  if (rawBudget > 0 && rawBudget < 5000) {
    rawBudget = rawBudget === 1500 ? 150000 : Math.round(rawBudget * USD_TO_INR_RATE);
  }

  const budgetNum = Math.max(10000, rawBudget);
  const monthsNum = Math.max(1, Number(runwayMonths) || 3);
  const monthlyBurnCapacity = Math.round(budgetNum / monthsNum);

  // Suggested Allocation Percentages based on Lean Bootstrapping:
  // 35% Product & Tech Infrastructure, 25% Customer Discovery & Validation, 20% Operations & Legal, 20% Emergency Runway Buffer
  const allocations = [
    {
      category: 'Product & Tech Infrastructure',
      percentage: 35,
      amount: Math.round(budgetNum * 0.35),
      formattedAmount: formatINR(Math.round(budgetNum * 0.35)),
      description: 'Cloud hosting, database tiers, APIs, domain names (.in / .com), SSL, essential developer tooling.',
      priority: 'Essential',
    },
    {
      category: 'Customer Discovery & Validation',
      percentage: 25,
      amount: Math.round(budgetNum * 0.25),
      formattedAmount: formatINR(Math.round(budgetNum * 0.25)),
      description: 'Landing page tests, user interview incentives (UPI/Amazon vouchers), targeted pilot ads, outreach tools.',
      priority: 'Essential',
    },
    {
      category: 'Operations, Legal & Software',
      percentage: 20,
      amount: Math.round(budgetNum * 0.20),
      formattedAmount: formatINR(Math.round(budgetNum * 0.20)),
      description: 'Business email (Zoho/Google), accounting software, compliance filings, contract templates.',
      priority: 'Flexible',
    },
    {
      category: 'Emergency Runway Buffer',
      percentage: 20,
      amount: Math.round(budgetNum * 0.20),
      formattedAmount: formatINR(Math.round(budgetNum * 0.20)),
      description: 'Unplanned API usage spikes, test device acquisitions, and extended runway contingency.',
      priority: 'Essential',
    },
  ];

  const essentialExpenses = [
    {
      name: 'Custom Domain & DNS (.in or .com)',
      cost: '₹800 – ₹2,500/yr',
      importance: 'High',
      note: 'Provides instant credibility for customer discovery and enterprise outreach.',
    },
    {
      name: 'Micro-Database & Backend Hosting',
      cost: '₹0 – ₹2,000/mo',
      importance: 'High',
      note: 'Free tier on Supabase / Firebase hobby tiers (up to 500MB database, 50,000 monthly active users).',
    },
    {
      name: 'Frontend Hosting & Global CDN',
      cost: '₹0 (Free Tier)',
      importance: 'High',
      note: 'Free tier on Vercel / Netlify / Cloudflare Pages with SSL auto-provisioning.',
    },
    {
      name: 'User Discovery Interview Incentives',
      cost: '₹3,000 – ₹10,000 total',
      importance: 'Medium',
      note: 'UPI gift cards or Amazon India vouchers to thank 15 customer discovery interviewees.',
    },
    {
      name: 'Business Email & Workspace Suite',
      cost: '₹250/user/mo or Free',
      importance: 'Medium',
      note: 'Zoho Mail Free tier (up to 5 users) or Google Workspace India tier (~₹250/user/month).',
    },
  ];

  const optionalExpenses = [
    {
      name: 'Premium Logo & Branding Agencies',
      cost: '₹15,000 – ₹50,000',
      verdict: 'Skip for MVP',
      alternative: 'Use free tools like Canva, Figma community templates, or clean system typography.',
    },
    {
      name: 'Paid Social Ad Campaigns',
      cost: '₹10,000 – ₹40,000/mo',
      verdict: 'Defer to Phase 3',
      alternative: 'Direct founder outreach via LinkedIn, WhatsApp groups, niche communities, and Twitter/X.',
    },
    {
      name: 'Enterprise Analytics Suites (Mixpanel/Amplitude paid)',
      cost: '₹8,000+/mo',
      verdict: 'Skip',
      alternative: 'Use PostHog Cloud (free 1M events/month) or Umami self-hosted.',
    },
    {
      name: 'Pvt Ltd Company Incorporation (MCA / LegalZoom)',
      cost: '₹7,000 – ₹15,000 upfront',
      verdict: 'Defer until first ₹1 Lakh revenue',
      alternative: 'Operate as a sole proprietorship during the early validation phase.',
    },
  ];

  const freeToolAlternatives = [
    {
      category: 'Database & Auth',
      paidTool: 'AWS RDS + Auth0 (~₹6,500/mo)',
      freeAlternative: 'Supabase / Firebase (Generous Free Tier)',
      savings: '~₹6,500/month',
    },
    {
      category: 'Hosting & CI/CD',
      paidTool: 'Dedicated Cloud VPS (~₹2,000/mo)',
      freeAlternative: 'Vercel / Cloudflare Pages / Render (Free)',
      savings: '~₹2,000/month',
    },
    {
      category: 'Design & Mockups',
      paidTool: 'Adobe Creative Cloud (~₹4,500/mo)',
      freeAlternative: 'Figma Free + Penpot (Free Open Source)',
      savings: '~₹4,500/month',
    },
    {
      category: 'User Forms & Surveys',
      paidTool: 'Typeform Pro (~₹2,800/mo)',
      freeAlternative: 'Tally.so (100% Free Unlimited Forms)',
      savings: '~₹2,800/month',
    },
    {
      category: 'Transactional Email',
      paidTool: 'SendGrid Paid (~₹1,600/mo)',
      freeAlternative: 'Resend (Free 3,000 emails/month)',
      savings: '~₹1,600/month',
    },
  ];

  const financialRisks = [];
  if (budgetNum < 40000) {
    financialRisks.push({
      level: 'High Risk',
      title: 'Ultra-Lean Capital Runway',
      detail: `At ${formatINR(budgetNum)}, your financial margin for paid experiments is virtually zero. You must rely 100% on free-tier software and organic manual outreach.`,
    });
  } else if (budgetNum < 150000) {
    financialRisks.push({
      level: 'Moderate Risk',
      title: 'Disciplined Bootstrap Envelope',
      detail: `Your ${formatINR(budgetNum)} budget provides approximately ${formatINR(monthlyBurnCapacity)}/month over ${monthsNum} months. Avoid all recurring software subscriptions until revenue is verified.`,
    });
  } else {
    financialRisks.push({
      level: 'Healthy Bootstrap',
      title: 'Comfortable Seed Margin',
      detail: `At ${formatINR(budgetNum)}, you have adequate runway to test multiple prototype iterations, acquire specialized APIs/sensors, and hire specialized freelance micro-tasks if needed.`,
    });
  }

  if (timeAvailableHoursPerWeek < 15) {
    financialRisks.push({
      level: 'Time Constraint Risk',
      title: 'Part-Time Founder Velocity',
      detail: `${timeAvailableHoursPerWeek} hrs/week means progress will require laser focus. Avoid building multi-sided platforms; scope your MVP to a single user flow.`,
    });
  }

  return {
    availableBudget: budgetNum,
    runwayMonths: monthsNum,
    monthlyBurnCapacity,
    formattedAvailableBudget: formatINR(budgetNum),
    formattedMonthlyBurn: formatINR(monthlyBurnCapacity),
    allocations,
    essentialExpenses,
    optionalExpenses,
    freeToolAlternatives,
    financialRisks,
    currency: 'INR',
    currencySymbol: '₹',
    disclaimer:
      'All cost models, expense breakdowns, and tool recommendations are scenario simulations in Indian Rupees (INR – ₹) based on lean startup principles. Actual vendor pricing, cloud consumption, and legal fees vary based on usage and location.',
  };
}
