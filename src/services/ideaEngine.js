/**
 * ideaEngine.js
 * Generates tailored, realistic startup ideas based on user problem submissions.
 *
 * Primary path  : Calls the Supabase Edge Function `generate-ideas`, which
 *                 securely invokes Groq on the server side using a stored secret.
 *                 The Groq API key is NEVER present in this file or any frontend code.
 *
 * Fallback path : If the Edge Function is unavailable (network error, secret not
 *                 configured, Groq outage), the static template engine below is used.
 *                 Fallback results are marked with _isFallback: true so the UI can
 *                 display a clear "AI unavailable" notice instead of presenting
 *                 hardcoded ideas as real AI output.
 */

import { supabase } from './supabaseClient.js';

export const DOMAIN_CATEGORIES = [
  { id: 'agriculture', name: 'Agriculture & Food Supply', icon: 'Sprout', hint: 'Cold storage, yield loss, supply chain, farmer income' },
  { id: 'healthcare', name: 'Healthcare & Wellness', icon: 'Activity', hint: 'Rural clinics, chronic disease tracking, mental health access' },
  { id: 'education', name: 'Education & Upskilling', icon: 'GraduationCap', hint: 'Vocational training, personalized tutoring, student dropout' },
  { id: 'climate', name: 'Climate & Environment', icon: 'Globe', hint: 'Plastic waste, renewable energy access, urban emissions' },
  { id: 'transportation', name: 'Transportation & Logistics', icon: 'Truck', hint: 'Last-mile freight, public transit bottlenecks, EV charging' },
  { id: 'technology', name: 'AI & Enterprise Tech', icon: 'Cpu', hint: 'Workflow automation, data compliance, developer tooling' },
];

/**
 * Deterministic generation engine tailored to category & user problem inputs
 */
export async function generateStartupIdeas({ domain, problemStatement, affectedAudience, constraints, goals }) {
  // ---------------------------------------------------------------------------
  // PRIMARY PATH: Call the Supabase Edge Function (server-side Groq, key secure)
  // ---------------------------------------------------------------------------
  try {
    const { data, error } = await supabase.functions.invoke('generate-ideas', {
      body: { domain, problemStatement, affectedAudience, constraints, goals },
    });

    if (error) {
      // supabase-js wraps HTTP errors — log for debugging, do not expose to UI
      console.warn('[ideaEngine] Edge Function returned an error, activating fallback:', error?.message);
    } else if (data?.ideas && Array.isArray(data.ideas) && data.ideas.length > 0) {
      // SUCCESS: return genuine AI-generated ideas — no _isFallback flag
      return data.ideas;
    } else if (data?.error) {
      // The Edge Function returned a structured error message (e.g. secret not set)
      console.warn('[ideaEngine] Edge Function error response:', data.error);
    }
  } catch (networkErr) {
    // Fetch-level failure (offline, CORS issue, etc.)
    console.warn('[ideaEngine] Could not reach Edge Function, activating fallback:', networkErr?.message);
  }

  // ---------------------------------------------------------------------------
  // FALLBACK PATH: Static template engine
  // Results are marked _isFallback = true so ProblemDiscovery.jsx can show a
  // clear "AI unavailable" notice instead of presenting these as AI output.
  // ---------------------------------------------------------------------------

  // Simulate a brief thinking delay for UX consistency
  await new Promise((r) => setTimeout(r, 1400));

  const pLower = problemStatement.toLowerCase();
  const aud = affectedAudience || "Early adopters & underserved users";

  // Category-specific fallback templates with dynamic user problem injection.
  // NOTE: These are illustrative examples, NOT AI-generated output.
  //       The _isFallback flag on each returned array tells the UI to show an
  //       "AI unavailable" notice so users are never misled.

  if (domain === 'agriculture' || pLower.includes('farm') || pLower.includes('crop') || pLower.includes('food')) {
    const ideas = [
      {
        id: 'idea_agri_1',
        name: 'AgriFreeze Hubs',
        tagline: 'Decentralized pay-as-you-store solar cold storage for micro-farmers.',
        category: 'Agriculture & CleanTech',
        problemAddressed: problemStatement,
        targetAudience: affectedAudience || 'Smallholder farmers and rural grower cooperatives',
        solution: 'Modular shipping container cold hubs powered by solar panels, placed at rural market junctions. Farmers book storage crates via simple SMS or WhatsApp without upfront capital investment.',
        uniqueValueProp: 'Zero upfront CAPEX for farmers; reduces post-harvest spoilage by up to 40% while doubling shelf life.',
        feasibility: 'High',
        feasibilityScore: 84,
        majorChallenges: ['High initial solar-battery hardware procurement', 'Educating rural cooperatives on digital booking', 'Seasonal crop harvesting fluctuations'],
        revenueModels: [
          'Pay-as-you-chill daily crate fee ($0.40 - $0.80/crate/day)',
          '5% marketplace fee connecting stored produce directly to wholesale buyers',
          'Subscription tiers for commercial farm cooperatives'
        ],
        validationSteps: [
          'Interview 20 local farmers within a 15km radius regarding exact storage losses',
          'Deploy a manual WhatsApp pilot reserving space in an existing commercial chiller',
          'Secure 5 letters of intent from local restaurants/grocers willing to buy certified cold-preserved crops'
        ]
      },
      {
        id: 'idea_agri_2',
        name: 'CropDirect Exchange',
        tagline: 'Disintermediating middlemen with algorithmic bulk pooling for fair price discovery.',
        category: 'AgriTech & Supply Chain',
        problemAddressed: problemStatement,
        targetAudience: affectedAudience || 'Perishable produce growers and urban restaurant consortiums',
        solution: 'A lightweight mobile order-pooling protocol that aggregates yields from 50+ local growers to fulfill high-volume corporate food service contracts with guaranteed 48-hour delivery.',
        uniqueValueProp: 'Guarantees 25% higher profit margins to growers while lowering wholesale purchase costs by 15% through consolidated logistics.',
        feasibility: 'Medium-High',
        feasibilityScore: 78,
        majorChallenges: ['Cold-chain logistics coordination', 'Quality standardization across disparate small farms', 'Enforcing contract compliance during market price spikes'],
        revenueModels: [
          '8-12% commission on completed aggregate bulk orders',
          'Premium analytics dashboard for institutional food buyers'
        ],
        validationSteps: [
          'Form a WhatsApp trade group with 10 local farms and 3 restaurant buyers',
          'Manually broker 3 test deliveries to calculate transport friction and margin leakage',
          'Determine the minimum order volume needed to achieve break-even on third-party refrigerated vans'
        ]
      },
      {
        id: 'idea_agri_3',
        name: 'SoilPulse IoT',
        tagline: 'Low-cost solar telemetry for predictive irrigation and soil nutrient replenishment.',
        category: 'Hardware IoT & Precision Agriculture',
        problemAddressed: problemStatement,
        targetAudience: affectedAudience || 'Commercial horticulture & high-value cash crop growers',
        solution: 'Sub-$25 solar-recharged soil probe stakes transmitting moisture and NPK telemetry via LoRaWAN to deliver actionable irrigation alerts via SMS in native dialects.',
        uniqueValueProp: 'Saves 35% of irrigation water and prevents fertilizer overspending without needing 4G smartphones.',
        feasibility: 'Medium',
        feasibilityScore: 72,
        majorChallenges: ['Ruggedizing hardware against monsoon weathering and pests', 'Local distribution partner network recruitment'],
        revenueModels: [
          'Hardware sale at cost ($30) + annual analytics advisory subscription ($4/month)',
          'Subsidized rollout through regional agricultural NGOs and micro-credit institutions'
        ],
        validationSteps: [
          'Build 3 prototypes using off-the-shelf ESP32 and capacitive moisture sensors',
          'Install on 2 test farms and log yield differences against control fields over 30 days',
          'Collect founder feedback on willingness to pay for SMS alerts'
        ]
      }
    ];
    ideas._isFallback = true;
    return ideas;
  }

  if (domain === 'healthcare' || pLower.includes('health') || pLower.includes('doctor') || pLower.includes('clinic') || pLower.includes('patient')) {
    const ideas = [
      {
        id: 'idea_health_1',
        name: 'ClinicRoute',
        tagline: 'Async rural clinic triaging and diagnostic escalation platform.',
        category: 'HealthTech & Telemedicine',
        problemAddressed: problemStatement,
        targetAudience: affectedAudience || 'Peripheral primary health centers, rural nurses, and under-resourced patients',
        solution: 'A low-bandwidth offline-first tablet app that guides community health workers through structured clinical triage, automatically generating AI-assisted patient summaries for remote specialist review.',
        uniqueValueProp: 'Reduces specialist review time by 60% and eliminates unnecessary 50-mile travels for basic consultations.',
        feasibility: 'High',
        feasibilityScore: 82,
        majorChallenges: ['Healthcare compliance & patient data protection regulations', 'Offline synchronization reliability in zero-connectivity villages', 'Doctor credentialing'],
        revenueModels: [
          'Per-consultation micro-billing ($1 - $3 shared with medical specialist)',
          'SaaS subscription for private hospital chains extending outreach'
        ],
        validationSteps: [
          'Shadow 5 community health workers for two full shifts to map triage workflow bottlenecks',
          'Test a paper or low-code triage checklist on 30 non-critical cases',
          'Partner with 2 volunteer physicians to validate clinical summary quality'
        ]
      },
      {
        id: 'idea_health_2',
        name: 'AdherePulse',
        tagline: 'Automated conversational voice check-ins for chronic illness care.',
        category: 'Digital Health & AI Voice',
        problemAddressed: problemStatement,
        targetAudience: affectedAudience || 'Elderly and chronic disease patients (Hypertension, Diabetes)',
        solution: 'Automated 60-second daily telephone calls in native dialects that check symptoms, medication adherence, and vitals, flagging anomalies immediately to family or clinics.',
        uniqueValueProp: 'No smartphone app required; zero behavioral friction for seniors; 40% reduction in preventable emergency re-admissions.',
        feasibility: 'High',
        feasibilityScore: 86,
        majorChallenges: ['Telephony carriage costs at scale', 'Dialect & accent nuance comprehension', 'Medical liability disclaimers'],
        revenueModels: [
          'B2B monthly patient monitoring subscription paid by clinics/insurers ($12/patient/month)',
          'Direct-to-consumer family peace-of-mind plan ($19/month)'
        ],
        validationSteps: [
          'Conduct manual daily check-in calls for 10 elderly family acquaintances for 14 days',
          'Measure response rate and customer retention across non-tech-savvy users',
          'Draft terms of service with legal counsel specializing in telemedicine'
        ]
      },
      {
        id: 'idea_health_3',
        name: 'MedStock Sentinel',
        tagline: 'Predictive pharmacy stockout prevention for essential medications.',
        category: 'Health Supply Chain & Analytics',
        problemAddressed: problemStatement,
        targetAudience: affectedAudience || 'Independent pharmacies and rural dispensary networks',
        solution: 'Lightweight POS integration that predicts stockouts of life-saving medicines 14 days in advance and facilitates automated peer-to-peer stock balancing between nearby pharmacies.',
        uniqueValueProp: 'Prevents 85% of critical drug stockouts while decreasing dead inventory holding costs by 22%.',
        feasibility: 'Medium',
        feasibilityScore: 75,
        majorChallenges: ['Integrating with fragmented, legacy desktop pharmacy software', 'Pharmacy owner reluctance to share stock data'],
        revenueModels: [
          'Flat SaaS tier ($35/month per pharmacy)',
          'Wholesale pharmaceutical distributor commission on automated restock orders'
        ],
        validationSteps: [
          'Audit inventory logs of 5 local independent pharmacies to identify top 10 recurring stockout medicines',
          'Create a shared inventory Google Sheet with 3 cooperating pharmacies to test peer-rebalancing'
        ]
      }
    ];
    ideas._isFallback = true;
    return ideas;
  }

  if (domain === 'education' || pLower.includes('student') || pLower.includes('school') || pLower.includes('learn') || pLower.includes('skill')) {
    const ideas = [
      {
        id: 'idea_edu_1',
        name: 'SkillForge Lab',
        tagline: 'Micro-apprenticeships and real-world project portfolios for non-traditional students.',
        category: 'EdTech & Workforce Development',
        problemAddressed: problemStatement,
        targetAudience: affectedAudience || 'Undergraduate engineering & vocational students lacking practical work experience',
        solution: 'A platform pairing student teams with real open-source and small-business software backlogs, providing automated AI code reviews and verified employer-endorsed credentials.',
        uniqueValueProp: 'Students graduate with tangible proof-of-work instead of empty certificates; companies get qualified junior talent with zero recruiting risk.',
        feasibility: 'High',
        feasibilityScore: 88,
        majorChallenges: ['Scoping business projects to be manageable for junior learners', 'Maintaining high mentor review quality', 'Student motivation completion rates'],
        revenueModels: [
          'Recruiting success fee ($1,000 - $2,500) when a partner company hires a graduate',
          'Premium subscription for students wanting accelerated 1-on-1 industry mentor guidance ($29/month)'
        ],
        validationSteps: [
          'Curate 5 real open-source or local business issues suitable for students',
          'Recruit 15 student candidates and run a 2-week sprint',
          'Evaluate if company partners would interview top performers based on submitted work'
        ]
      },
      {
        id: 'idea_edu_2',
        name: 'SyllabusAI',
        tagline: 'Personalized adaptive exam prep tuned specifically to local university curricula.',
        category: 'EdTech & Adaptive Learning',
        problemAddressed: problemStatement,
        targetAudience: affectedAudience || 'College students preparing for high-stakes university semester finals',
        solution: 'Students upload their specific professor slides and previous 5 years of exam question papers. The engine creates customized spaced-repetition flashcards, diagnostic mock quizzes, and audio summaries.',
        uniqueValueProp: 'Hyper-localized to the student\'s exact course syllabus rather than generic textbook content.',
        feasibility: 'High',
        feasibilityScore: 90,
        majorChallenges: ['Copyright handling of university course materials', 'Preventing student churn between exam seasons'],
        revenueModels: [
          'Semester pass ($14.99 per course) or campus-wide multi-subject bundle ($39/semester)',
          'Peer student tutor marketplace revenue share'
        ],
        validationSteps: [
          'Manually digest 1 university subject syllabus into a study pack and share in student Telegram groups',
          'Track conversion from free chapter summaries to paid full-exam prep pack',
          'Survey 50 students on their single biggest exam prep headache'
        ]
      },
      {
        id: 'idea_edu_3',
        name: 'VocationalVR / MobileSim',
        tagline: 'Interactive tactile simulations for practical trade skills on budget mobile devices.',
        category: 'Mobile EdTech & Trades',
        problemAddressed: problemStatement,
        targetAudience: affectedAudience || 'Vocational apprentices (electricians, mechanics, plumbing trainees)',
        solution: 'Gamified interactive mobile 3D diagnostics allowing trade students to troubleshoot electrical faults, HVAC wiring, and mechanical assemblies before touching expensive physical equipment.',
        uniqueValueProp: 'Cuts training equipment damage by 70% and enables 10x more repetition cycles for trade certifications.',
        feasibility: 'Medium',
        feasibilityScore: 71,
        majorChallenges: ['3D mobile rendering optimization on budget devices', 'Curriculum accreditation partnerships with trade boards'],
        revenueModels: [
          'Institutional licensing to vocational schools ($500 - $2,000/year per school)',
          'Direct apprentice certification prep in-app purchase'
        ],
        validationSteps: [
          'Build a single interactive 2D/3D fault-finding puzzle in WebGL',
          'Have 10 trade trainees test the tool and benchmark diagnostic retention against paper diagrams'
        ]
      }
    ];
    ideas._isFallback = true;
    return ideas;
  }

  // General / Technology / Climate / Transport fallback
  const ideas = [
    {
      id: 'idea_gen_1',
      name: 'OmniFlow AI',
      tagline: `Automated intelligent workflow orchestrator solving: "${problemStatement.slice(0, 60)}..."`,
      category: 'B2B Workflow Automation & AI',
      problemAddressed: problemStatement,
      targetAudience: affectedAudience || 'Operational managers, small businesses, and affected specialists',
      solution: `A focused, modular software assistant designed specifically to eliminate manual friction around ${problemStatement.slice(0, 80)}. Integrates into existing user channels (Email/Slack/WhatsApp) to trigger immediate resolution workflows.`,
      uniqueValueProp: 'Deploys in under 15 minutes without IT overhaul; saves 12+ hours per week per user on repetitive coordination.',
      feasibility: 'High',
      feasibilityScore: 85,
      majorChallenges: ['User onboarding friction', 'Building high-trust integrations with existing messy software systems', 'Clear ROI demonstration in the first 7 days'],
      revenueModels: [
        'Tiered monthly SaaS ($29 - $149/month per team)',
        'Usage-based pricing per automated workflow completed ($0.10/task)'
      ],
      validationSteps: [
        'Set up a 1-page landing page explaining the specific pain and solution workflow',
        'Collect 25 email signups or pre-orders through targeted founder/operator outreach',
        'Deliver the workflow manually (Concierge MVP) for 3 test customers to document exact time savings'
      ]
    },
    {
      id: 'idea_gen_2',
      name: 'PulseMesh Network',
      tagline: 'Decentralized peer-to-peer resource exchange eliminating intermediary costs.',
      category: 'Platform & Marketplace',
      problemAddressed: problemStatement,
      targetAudience: affectedAudience || 'Independent operators and end-consumers facing excessive brokerage costs',
      solution: `A community-driven marketplace with algorithmic matching that pools demand and directly connects ${affectedAudience || 'users'} to verified suppliers, cutting out layers of predatory middle agents.`,
      uniqueValueProp: 'Direct price discovery and escrow transparency; reduces transaction overhead by 30%.',
      feasibility: 'Medium-High',
      feasibilityScore: 79,
      majorChallenges: ['Solving the classic chicken-and-egg marketplace liquidity problem', 'Establishing trust and dispute resolution mechanisms early'],
      revenueModels: [
        'Transaction take rate (5-8% on fulfilled orders)',
        'Optional priority listing and verification subscription for suppliers'
      ],
      validationSteps: [
        'Launch a curated directory or WhatsApp community connecting supply and demand manually',
        'Facilitate the first 10 transactions by hand to calculate churn and user delight',
        'Identify the exact metric that triggers word-of-mouth referral'
      ]
    },
    {
      id: 'idea_gen_3',
      name: 'Veritas Sentinel',
      tagline: 'Continuous monitoring, audit, and early warning analytics for high-risk operations.',
      category: 'Compliance & Predictive Intelligence',
      problemAddressed: problemStatement,
      targetAudience: affectedAudience || 'Organizations facing legal, regulatory, or operational safety risks',
      solution: `An automated auditing and verification engine that continuously monitors operational logs, cross-referencing activity against safety and efficiency benchmarks to prevent costly failures before they occur.`,
      uniqueValueProp: 'Replaces stressful post-mortem retrospectives with real-time proactive preventative alerts.',
      feasibility: 'Medium',
      feasibilityScore: 74,
      majorChallenges: ['High sales cycles if targeting large enterprises', 'Data security and compliance auditing'],
      revenueModels: [
        'Annual recurring enterprise contract ($3,000 - $12,000/year)',
        'Audit-on-demand single assessment fee ($250/report)'
      ],
      validationSteps: [
        'Interview 10 operations leads to discover the exact cost of their last compliance or operational failure',
        'Offer a free manual one-time audit report in exchange for detailed process feedback'
      ]
    }
  ];
  ideas._isFallback = true;
  return ideas;
}

// ---------------------------------------------------------------------------
// The callGroqForIdeas function below is intentionally retained for the case
// where a user supplies their own Groq key via the UI. It is NOT the primary
// path — the Edge Function is. This function is never invoked by default.
// ---------------------------------------------------------------------------
async function callGroqForIdeas({ domain, problemStatement, affectedAudience, constraints, goals, apiKey }) {
  const prompt = `You are a world-class startup builder and product strategist. Analyze this real-world problem and return EXACTLY 3 innovative, viable, realistic startup opportunities as JSON.
Domain: ${domain}
Problem: ${problemStatement}
Affected Audience: ${affectedAudience}
Constraints: ${constraints}
Goals: ${goals}

Return ONLY valid JSON matching this schema:
[
  {
    "id": "idea_1",
    "name": "Startup Name",
    "tagline": "Punchy one-line value statement",
    "category": "Specific Industry Vertical",
    "problemAddressed": "Exact problem description",
    "targetAudience": "Specific early adopters",
    "solution": "Clear explanation of how the product works",
    "uniqueValueProp": "Why it outperforms existing workarounds",
    "feasibility": "High" or "Medium",
    "feasibilityScore": 85,
    "majorChallenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
    "revenueModels": ["Model 1", "Model 2"],
    "validationSteps": ["Step 1", "Step 2", "Step 3"]
  }
]`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`Groq HTTP ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  const parsed = JSON.parse(content);
  return Array.isArray(parsed) ? parsed : (parsed.ideas || parsed.startup_ideas || Object.values(parsed)[0]);
}
