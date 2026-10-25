/**
 * generate-ideas/index.ts
 * Supabase Edge Function — VISION AI Startup Idea Generator
 *
 * Securely calls the Groq API using a server-side secret (GROQ_API_KEY).
 * The API key is NEVER sent to the client or logged.
 *
 * Deployed with: supabase functions deploy generate-ideas --no-verify-jwt
 * Secret set with: supabase secrets set GROQ_API_KEY=gsk_...
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
  // 1. Parse and validate the request body
  // -------------------------------------------------------------------------
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON in request body." }, 400);
  }

  const { domain, problemStatement, affectedAudience, constraints, goals } =
    body as Record<string, string>;

  if (
    !problemStatement ||
    typeof problemStatement !== "string" ||
    problemStatement.trim().length < 15
  ) {
    return jsonResponse(
      { error: "problemStatement must be at least 15 characters." },
      400
    );
  }

  // Sanitise inputs — truncate to prevent excessively long prompts
  const safeProblem = problemStatement.trim().slice(0, 1500);
  const safeDomain = (typeof domain === "string" ? domain : "technology").slice(0, 100);
  const safeAudience = (typeof affectedAudience === "string" ? affectedAudience : "").slice(0, 300);
  const safeConstraints = (typeof constraints === "string" ? constraints : "").slice(0, 300);
  const safeGoals = (typeof goals === "string" ? goals : "").slice(0, 300);

  // -------------------------------------------------------------------------
  // 2. Read the Groq API key from Supabase Secrets — server-side only
  // -------------------------------------------------------------------------
  const groqApiKey = Deno.env.get("GROQ_API_KEY");
  if (!groqApiKey) {
    // Log internally; never reveal key status to the client
    console.error("[generate-ideas] GROQ_API_KEY secret is not configured.");
    return jsonResponse(
      { error: "AI service is not configured. Please contact the administrator." },
      503
    );
  }

  // -------------------------------------------------------------------------
  // 3. Build the Groq prompt
  // -------------------------------------------------------------------------
  const prompt = `You are a world-class startup strategist and product builder.
Analyze the real-world problem below and return EXACTLY 3 innovative, realistic, viable startup opportunities tailored specifically to this problem.

Domain: ${safeDomain}
Problem Statement: ${safeProblem}
Affected Audience: ${safeAudience || "Not specified"}
Constraints: ${safeConstraints || "None provided"}
Goals: ${safeGoals || "None provided"}

CRITICAL RULES:
- Every idea must be specifically designed to solve THIS exact problem, not a generic startup template.
- The three ideas must be meaningfully different from each other (different business models, technology approaches, or target segments).
- Revenue models, challenges, and validation steps must be realistic and specific to this problem context and domain.
- Reference the stated audience and constraints explicitly in solutions where relevant.
- Feasibility scores must reflect the real complexity given the stated constraints.

Return ONLY a raw JSON array with exactly 3 objects. Do NOT wrap it in markdown, code fences, or a parent object. Use this exact schema:
[
  {
    "id": "idea_1",
    "name": "Startup Name",
    "tagline": "Punchy one-line value statement specific to this exact problem",
    "category": "Specific Industry Vertical",
    "problemAddressed": "One sentence restating the core problem this idea solves",
    "targetAudience": "Specific early adopter group from the stated audience",
    "solution": "Clear 2-3 sentence explanation of exactly how the product or service works",
    "uniqueValueProp": "Why this outperforms existing workarounds for this specific audience",
    "feasibility": "High",
    "feasibilityScore": 85,
    "majorChallenges": ["Specific challenge 1", "Specific challenge 2", "Specific challenge 3"],
    "revenueModels": ["Specific revenue model 1 with example pricing", "Specific revenue model 2"],
    "validationSteps": ["Concrete first action step", "Concrete second action step", "Concrete third action step"]
  }
]`;

  // -------------------------------------------------------------------------
  // 4. Call the Groq API
  // -------------------------------------------------------------------------
  let groqResponse: Response;
  try {
    groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
         model: "openai/gpt-oss-120b",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.72,  // Creative but coherent
          max_tokens: 3200,   // Enough for 3 detailed idea objects
        }),
      }
    );
  } catch (networkErr) {
    console.error("[generate-ideas] Network error reaching Groq:", networkErr);
    return jsonResponse(
      { error: "Could not reach the AI provider. Please check your connection and try again." },
      502
    );
  }

  if (!groqResponse.ok) {
    // Log status but not the response body (may contain key-adjacent info)
    console.error(`[generate-ideas] Groq returned HTTP ${groqResponse.status}`);
    return jsonResponse(
      { error: "AI provider returned an error. Please try again in a moment." },
      502
    );
  }

  // -------------------------------------------------------------------------
  // 5. Parse and validate the model response
  // -------------------------------------------------------------------------
  let groqData: { choices?: { message?: { content?: string } }[] };
  try {
    groqData = await groqResponse.json();
  } catch {
    console.error("[generate-ideas] Failed to parse Groq response as JSON.");
    return jsonResponse(
      { error: "AI returned an unreadable response. Please try again." },
      422
    );
  }

  const rawContent = groqData.choices?.[0]?.message?.content ?? "";

  // Strip any accidental markdown code fences the model may add
  const jsonString = rawContent
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  let ideas: unknown[];
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      ideas = parsed;
    } else if (parsed && typeof parsed === "object") {
      // Handle cases where the model wraps the array in a key
      const firstArray = Object.values(parsed).find((v) => Array.isArray(v));
      ideas = (firstArray as unknown[]) ?? [];
    } else {
      ideas = [];
    }
  } catch (parseErr) {
    console.error(
      "[generate-ideas] JSON parse error:",
      parseErr,
      "| Raw preview:",
      rawContent.slice(0, 300)
    );
    return jsonResponse(
      { error: "AI returned an unexpected response format. Please try again." },
      422
    );
  }

  if (!Array.isArray(ideas) || ideas.length === 0) {
    console.error("[generate-ideas] Parsed ideas array is empty.");
    return jsonResponse(
      { error: "AI did not return any ideas. Please try again." },
      422
    );
  }

  // -------------------------------------------------------------------------
  // 6. Return the AI-generated ideas to the client
  // -------------------------------------------------------------------------
  return jsonResponse({ ideas });
});
