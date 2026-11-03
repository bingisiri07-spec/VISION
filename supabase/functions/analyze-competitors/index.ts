/**
 * analyze-competitors/index.ts
 * Supabase Edge Function — VISION Competitor & Market Landscape Analyzer
 *
 * Securely calls the Groq API using a server-side secret (GROQ_API_KEY).
 * The API key is NEVER sent to the client or logged.
 *
 * Deployed with: supabase functions deploy analyze-competitors --no-verify-jwt
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ---------------------------------------------------------------------------
// CORS headers — required for browser requests from localhost and production
// ---------------------------------------------------------------------------
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ---------------------------------------------------------------------------
// Helper: return a JSON response with CORS headers
// ---------------------------------------------------------------------------
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
serve(async (req: Request) => {
  // Browser preflight check
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  // -------------------------------------------------------------------------
  // 1. Authorization check
  // -------------------------------------------------------------------------
  const authHeader = req.headers.get("authorization") || req.headers.get("apikey");
  if (!authHeader) {
    return jsonResponse({ error: "Missing authorization credentials." }, 401);
  }

  // -------------------------------------------------------------------------
  // 2. Parse and validate request body
  // -------------------------------------------------------------------------
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON in request body." }, 400);
  }

  const { idea, domain, problemStatement, constraints } = body as {
    idea?: {
      name?: string;
      category?: string;
      problemAddressed?: string;
      uniqueValueProp?: string;
      targetAudience?: string;
      solution?: string;
    };
    domain?: string;
    problemStatement?: string;
    constraints?: string;
  };

  if (!idea || typeof idea !== "object" || !idea.name || typeof idea.name !== "string") {
    return jsonResponse(
      { error: "Valid startup idea with a name is required for competitor analysis." },
      400
    );
  }

  // Sanitize and bound inputs
  const safeName = idea.name.trim().slice(0, 150);
  const safeCategory = (idea.category || domain || "Technology").slice(0, 100);
  const safeProblem = (idea.problemAddressed || problemStatement || "").slice(0, 800);
  const safeUVP = (idea.uniqueValueProp || "").slice(0, 500);
  const safeAudience = (idea.targetAudience || "").slice(0, 300);
  const safeConstraints = (constraints || "").slice(0, 300);

  // -------------------------------------------------------------------------
  // 3. Read Groq API key from Supabase Secrets
  // -------------------------------------------------------------------------
  const groqApiKey = Deno.env.get("GROQ_API_KEY");
  if (!groqApiKey) {
    console.error("[analyze-competitors] GROQ_API_KEY secret is not configured.");
    return jsonResponse(
      { error: "AI service is not configured. Please contact the administrator." },
      503
    );
  }

  // -------------------------------------------------------------------------
  // 4. Construct prompt for structured competitive landscape
  // -------------------------------------------------------------------------
  const prompt = `You are a principal market analyst and venture capital diligence partner.
Analyze the competitive landscape and market alternatives for the following early-stage startup venture:

Startup Name: ${safeName}
Industry / Domain: ${safeCategory}
Problem Addressed: ${safeProblem || "Not specified"}
Unique Value Proposition: ${safeUVP || "Not specified"}
Target Customer Audience: ${safeAudience || "Not specified"}
Constraints: ${safeConstraints || "None provided"}

CRITICAL RULES:
1. Identify 2-3 DIRECT COMPETITORS (real or representative companies/products tackling this specific problem).
2. Identify 2-3 INDIRECT COMPETITORS (adjacent tools or services users might substitute).
3. Identify 2-3 STATUS-QUO ALTERNATIVES (manual workarounds, spreadsheets, pen-and-paper, or doing nothing).
4. Provide a COMPARISON MATRIX comparing 4 key operational dimensions across:
   - Your Venture (${safeName})
   - Direct Competitor Approach
   - Status-Quo / Manual Workaround
5. Identify 2-3 clear MARKET GAPS / UNMET NEEDS currently neglected by incumbents.
6. Identify 2-3 DIFFERENTIATION WEDGES (unfair advantages or focus areas where this venture can win).
7. Label all items with source "AI Hypothesis".

Return ONLY a raw JSON object with NO markdown code fences, NO introductory text, and NO trailing explanation. Use this exact schema:
{
  "directCompetitors": [
    {
      "name": "Competitor Name",
      "description": "Clear 1-2 sentence description of what they do",
      "targetCustomer": "Specific customer segment they target",
      "pricing": "Estimated pricing model or pricing tier",
      "strengths": ["Key strength 1", "Key strength 2"],
      "weaknesses": ["Key weakness or limitation 1", "Key weakness 2"],
      "source": "AI Hypothesis"
    }
  ],
  "indirectCompetitors": [
    {
      "name": "Tool or Service Name",
      "category": "Category of tool",
      "howItCompetes": "Why users might use this as a substitute",
      "limitations": "Why it falls short of solving the core friction",
      "source": "AI Hypothesis"
    }
  ],
  "statusQuoAlternatives": [
    {
      "alternative": "Manual Workaround Name (e.g. Excel / Manual Audits)",
      "whyUsersTolerateIt": "Why people currently stick with this workaround",
      "hiddenCosts": "Financial loss, time sink, or human error involved",
      "source": "AI Hypothesis"
    }
  ],
  "comparisonMatrix": [
    {
      "dimension": "Dimension Name (e.g. Speed / Deployment / Cost / Complexity)",
      "founderVenture": "How ${safeName} delivers this",
      "directCompetitor": "How direct incumbents typically handle this",
      "statusQuo": "How the manual status-quo handles this"
    }
  ],
  "marketGaps": [
    "Specific gap or underserved segment in the current market",
    "Specific blind spot of incumbent solutions"
  ],
  "differentiationWedges": [
    "Specific tactical wedge ${safeName} should use to enter the market",
    "Moat or defensible angle"
  ],
  "isAiHypothesis": true
}`;

  // -------------------------------------------------------------------------
  // 5. Call Groq API
  // -------------------------------------------------------------------------
  let groqResponse: Response;
  const modelsToTry = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile"];

  for (const model of modelsToTry) {
    try {
      groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.65,
          max_tokens: 2800,
        }),
      });

      if (groqResponse.ok) {
        break;
      }
      console.warn(`[analyze-competitors] Model ${model} returned ${groqResponse.status}. Trying alternative model.`);
    } catch (networkErr) {
      console.error(`[analyze-competitors] Error calling Groq with ${model}:`, networkErr);
    }
  }

  if (!groqResponse! || !groqResponse.ok) {
    const status = groqResponse ? groqResponse.status : 502;
    console.error(`[analyze-competitors] Groq returned error status ${status}`);
    return jsonResponse(
      { error: "AI provider is currently unavailable. Please try again in a moment." },
      status === 429 ? 429 : 502
    );
  }

  // -------------------------------------------------------------------------
  // 6. Parse and validate JSON structure
  // -------------------------------------------------------------------------
  let groqData: { choices?: { message?: { content?: string } }[] };
  try {
    groqData = await groqResponse.json();
  } catch {
    console.error("[analyze-competitors] Failed to parse Groq response as JSON.");
    return jsonResponse({ error: "AI returned an unreadable response." }, 422);
  }

  const rawContent = groqData.choices?.[0]?.message?.content ?? "";
  const cleanedJson = rawContent
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  let analysis: Record<string, unknown>;
  try {
    analysis = JSON.parse(cleanedJson);
  } catch (parseErr) {
    console.error("[analyze-competitors] JSON parse error:", parseErr, "| Raw preview:", rawContent.slice(0, 300));
    return jsonResponse({ error: "AI returned an unexpected format. Please try again." }, 422);
  }

  if (!analysis || typeof analysis !== "object") {
    return jsonResponse({ error: "Invalid analysis payload returned." }, 422);
  }

  analysis.isAiHypothesis = true;

  return jsonResponse({ analysis });
});
