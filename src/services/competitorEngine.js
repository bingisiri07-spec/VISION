/**
 * competitorEngine.js
 * Synthesizes direct competitors, indirect alternatives, status-quo workarounds,
 * and differentiation wedges for the active venture.
 *
 * Primary path  : Calls the Supabase Edge Function `analyze-competitors`, which
 *                 securely invokes Groq server-side with zero client secrets.
 *
 * Fallback path : If the Edge Function is unavailable (offline, rate limit, etc.),
 *                 deterministic templates are provided.
 *
 * HONEST AI LABELING:
 * - Edge Function results are labeled with `source: 'AI Hypothesis'`.
 * - Fallback templates are flagged with `_isFallback: true` and labeled
 *   `Illustrative Fallback Example (Not Live Research)`.
 * - Founder-entered entries are tagged with `source: 'User-Provided (Founder Input)'`.
 */

import { supabase } from './supabaseClient.js';

export async function generateCompetitorAnalysis({ idea, domain, problemStatement, constraints }) {
  if (!idea || !idea.name) {
    throw new Error('An active startup idea is required for competitor analysis.');
  }

  // ---------------------------------------------------------------------------
  // PRIMARY PATH: Secure Supabase Edge Function (server-side Groq)
  // ---------------------------------------------------------------------------
  try {
    const { data, error } = await supabase.functions.invoke('analyze-competitors', {
      body: {
        idea: {
          name: idea.name,
          category: idea.category,
          problemAddressed: idea.problemAddressed,
          uniqueValueProp: idea.uniqueValueProp,
          targetAudience: idea.targetAudience,
          solution: idea.solution,
        },
        domain,
        problemStatement,
        constraints,
      },
    });

    if (error) {
      console.warn('[competitorEngine] Edge Function returned error, activating fallback:', error.message);
    } else if (data?.analysis && typeof data.analysis === 'object') {
      return {
        ...data.analysis,
        _isFallback: false,
        analyzedAt: new Date().toISOString(),
      };
    }
  } catch (networkErr) {
    console.warn('[competitorEngine] Network failure reaching Edge Function, activating fallback:', networkErr);
  }

  // ---------------------------------------------------------------------------
  // FALLBACK PATH: Domain-specific illustrative templates
  // Explicitly flagged with _isFallback: true
  // ---------------------------------------------------------------------------
  await new Promise((r) => setTimeout(r, 900));

  const fallback = getDomainFallback({ idea, domain });
  return {
    ...fallback,
    _isFallback: true,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Creates a normalized founder-entered competitor entry
 */
export function createFounderCompetitor({
  name,
  type = 'direct', // 'direct' | 'indirect' | 'statusQuo'
  description,
  targetCustomer,
  pricing,
  strengths = [],
  weaknesses = [],
}) {
  return {
    id: `comp_founder_${Date.now()}`,
    name: name.trim(),
    type,
    description: description?.trim() || 'No description provided.',
    targetCustomer: targetCustomer?.trim() || 'General Market',
    pricing: pricing?.trim() || 'Custom / Unverified',
    strengths: Array.isArray(strengths) ? strengths : [strengths].filter(Boolean),
    weaknesses: Array.isArray(weaknesses) ? weaknesses : [weaknesses].filter(Boolean),
    source: 'User-Provided (Founder Input)',
    isFounderAdded: true,
    addedAt: new Date().toISOString(),
  };
}

/**
 * Domain-specific illustrative fallback templates
 */
function getDomainFallback({ idea, domain }) {
  const cat = (domain || idea.category || 'technology').toLowerCase();

  if (cat.includes('agri') || cat.includes('farm') || cat.includes('food')) {
    return {
      directCompetitors: [
        {
          name: 'ColdHubs (Representative)',
          description: 'Fixed solar-powered walk-in cold rooms placed at aggregation food markets.',
          targetCustomer: 'Market vendors and large farmer cooperatives',
          pricing: 'Fixed daily fee per crate (~$0.50/day)',
          strengths: ['Proven hardware reliability', 'Established market footprint'],
          weaknesses: ['Fixed locations require farmers to travel long distances', 'High initial capital expenditure'],
          source: 'Illustrative Example (Not Live Research)'
        },
        {
          name: 'Traditional Diesel Refrigerated Trucks',
          description: 'Long-haul refrigerated transport hired for commercial harvests.',
          targetCustomer: 'Commercial industrial farms and export brokers',
          pricing: 'High minimum charter fee ($400+ per trip)',
          strengths: ['High capacity', 'Nationwide highway transit'],
          weaknesses: ['Prohibitive cost for smallholder farmers', 'Requires full truckload minimums'],
          source: 'Illustrative Example (Not Live Research)'
        }
      ],
      indirectCompetitors: [
        {
          name: 'Evaporative Cooling Chambers (Zero-Electricity)',
          category: 'Low-tech rustic storage',
          howItCompetes: 'Farmers build brick-and-sand double walls soaked with water.',
          limitations: 'Only extends shelf life by 3–5 days; ineffective in humid climates.',
          source: 'Illustrative Example (Not Live Research)'
        }
      ],
      statusQuoAlternatives: [
        {
          alternative: 'Distress Selling to Middlemen',
          whyUsersTolerateIt: 'Immediate cash on harvest day with zero storage logistics.',
          hiddenCosts: 'Farmers lose up to 50% of fair market value due to desperation discounting.',
          source: 'Illustrative Example (Not Live Research)'
        },
        {
          alternative: 'Styrofoam Ice Boxes',
          whyUsersTolerateIt: 'Cheap upfront container available in local markets.',
          hiddenCosts: 'Ice melts in 6 hours; leaves produce waterlogged and rotting.',
          source: 'Illustrative Example (Not Live Research)'
        }
      ],
      comparisonMatrix: [
        {
          dimension: 'Upfront Capital Required',
          founderVenture: 'Zero CAPEX — Pay-as-you-use mobile hub at field gate',
          directCompetitor: 'High fixed subscription or long transit to centralized hub',
          statusQuo: 'Zero capital, but severe loss on selling price'
        },
        {
          dimension: 'Shelf-Life Extension',
          founderVenture: '14 – 21 days with controlled temperature & humidity',
          directCompetitor: '14 – 21 days in fixed warehouse',
          statusQuo: '1 – 3 days maximum before spoilage'
        },
        {
          dimension: 'Booking & Accessibility',
          founderVenture: 'On-demand SMS / WhatsApp reservation',
          directCompetitor: 'Manual queueing at central market hubs',
          statusQuo: 'Informal verbal agreements with opportunistic brokers'
        }
      ],
      marketGaps: [
        'Lack of micro-cold chain solutions within 5km of rural farm gates',
        'No transparent pricing mechanism connecting stored inventory directly to wholesale buyers'
      ],
      differentiationWedges: [
        'Decentralized mobile deployment bringing cooling directly to the farm edge',
        'SMS/USSD booking requiring no expensive smartphone or broadband access'
      ],
      isAiHypothesis: false,
    };
  }

  // Default fallback for Tech, Education, Healthcare, and other sectors
  return {
    directCompetitors: [
      {
        name: 'Legacy Enterprise Software Inc.',
        description: 'Traditional all-in-one platform built for large corporate teams.',
        targetCustomer: 'Mid-to-large enterprise departments',
        pricing: '$1,200 – $5,000/year annual contracts',
        strengths: ['Extensive feature checklist', 'Enterprise compliance certifications'],
        weaknesses: ['Bloated UI requiring weeks of staff onboarding', 'Expensive multi-seat minimums'],
        source: 'Illustrative Example (Not Live Research)'
      },
      {
        name: 'Niche Single-Utility Point Solution',
        description: 'Point solution solving a narrow slice of this workflow.',
        targetCustomer: 'Tech-savvy early adopters and boutique agencies',
        pricing: '$29 – $79/user/month',
        strengths: ['Modern clean UI', 'Fast self-serve signup'],
        weaknesses: ['Lacks end-to-end integration', 'Isolated data silo'],
        source: 'Illustrative Example (Not Live Research)'
      }
    ],
    indirectCompetitors: [
      {
        name: 'Generic No-Code Stacks (Airtable + Zapier + Slack)',
        category: 'Custom internal assemblies',
        howItCompetes: 'Teams assemble custom internal trackers using existing subscriptions.',
        limitations: 'Fragile automations break frequently; requires ongoing maintenance.',
        source: 'Illustrative Example (Not Live Research)'
      }
    ],
    statusQuoAlternatives: [
      {
        alternative: 'Manual Spreadsheets & Email Chains',
        whyUsersTolerateIt: 'Already paid for, familiar to everyone, zero learning curve.',
        hiddenCosts: 'Dozens of hours lost to data entry, zero real-time insights, version conflicts.',
        source: 'Illustrative Example (Not Live Research)'
      },
      {
        alternative: 'Doing Nothing / Postponing Resolution',
        whyUsersTolerateIt: 'The problem is painful but not yet classified as an emergency.',
        hiddenCosts: 'Gradual operational slowdown and employee frustration.',
        source: 'Illustrative Example (Not Live Research)'
      }
    ],
    comparisonMatrix: [
      {
        dimension: 'Time to First Value',
        founderVenture: 'Under 10 minutes self-serve setup',
        directCompetitor: '3 to 6 weeks guided sales onboarding',
        statusQuo: 'Immediate, but linear time sink forever'
      },
      {
        dimension: 'Total Cost of Ownership',
        founderVenture: 'Lean usage-based pricing with free trial',
        directCompetitor: 'Annual locked contracts with setup consulting fees',
        statusQuo: 'Hidden internal labor hours costing $1,000s/month'
      },
      {
        dimension: 'Workflow Automation',
        founderVenture: 'Built-in automated intelligence eliminating manual steps',
        directCompetitor: 'Complex rules engine requiring dedicated admin',
        statusQuo: '100% manual copy-paste'
      }
    ],
    marketGaps: [
      'Incumbents overlook underserved individuals and lean teams who cannot afford enterprise minimums',
      'High complexity barriers leave non-technical users dependent on broken manual workarounds'
    ],
    differentiationWedges: [
      'Radical simplicity: solve one acute friction point 10x faster with zero training',
      'Affordable pay-as-you-grow pricing that removes the budget approval roadblock'
    ],
    isAiHypothesis: false,
  };
}
