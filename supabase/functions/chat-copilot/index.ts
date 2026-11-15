/**
 * chat-copilot/index.ts
 * Supabase Edge Function — VISION AI Co-Pilot Chat
 *
 * Securely calls the Groq API using a server-side secret (GROQ_API_KEY).
 * The API key is NEVER sent to the client or logged.
 *
 * Deployed with: supabase functions deploy chat-copilot --no-verify-jwt
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
  // 2. Parse and validate the request body
  // -------------------------------------------------------------------------
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON in request body." }, 400);
  }

  const { userMessage, projectContext, conversationHistory } = body as {
    userMessage?: string;
    projectContext?: Record<string, unknown>;
    conversationHistory?: Array<{ role?: string; content?: string }>;
  };

  if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
    return jsonResponse({ error: "userMessage is required." }, 400);
  }

  // Sanitize user message (cap length to prevent prompt exhaustion attacks)
  const safeUserMessage = userMessage.trim().slice(0, 2000);

  // -------------------------------------------------------------------------
  // 3. Read the Groq API key from Supabase Secrets — server-side only
  // -------------------------------------------------------------------------
  const groqApiKey = Deno.env.get("GROQ_API_KEY");
  if (!groqApiKey) {
    console.error("[chat-copilot] GROQ_API_KEY secret is not configured.");
    return jsonResponse(
      { error: "AI service is not configured. Please contact the administrator." },
      503
    );
  }

  // -------------------------------------------------------------------------
  // 4. Construct project context and system prompt
  // -------------------------------------------------------------------------
  const ctx = (projectContext && typeof projectContext === "object") ? projectContext : {};
  const idea = (ctx.idea && typeof ctx.idea === "object") ? (ctx.idea as Record<string, unknown>) : null;
  const completedTasks = Array.isArray(ctx.completedTasks) ? ctx.completedTasks.slice(0, 10).join(", ") : "None yet";
  const pendingTasks = Array.isArray(ctx.pendingTasks) ? ctx.pendingTasks.slice(0, 5).join(", ") : "None";
  const decisions = Array.isArray(ctx.decisions) ? ctx.decisions.slice(0, 5).join(" | ") : "None yet";
  const budget = (ctx.budget && typeof ctx.budget === "object") ? (ctx.budget as Record<string, unknown>) : null;
  const rawBudget = budget?.availableBudget;
  const availableBudget = typeof rawBudget === 'number' && rawBudget > 2000 ? rawBudget : 150000;
  const monthlyBurn = budget?.monthlyBurnCapacity ?? Math.round(availableBudget / 3);

  const systemPrompt = `You are VISION AI Co-Pilot, an elite startup mentor and software architect.
You give sharp, actionable, realistic advice to early-stage founders.
Founder Project Context:
- Active Startup Idea: ${idea?.name ? `${idea.name} (${idea.category || "General"})` : "Not selected yet"}
- Problem Addressed: ${idea?.problemAddressed || "N/A"}
- Unique Value Prop: ${idea?.uniqueValueProp || "N/A"}
- Target Audience: ${idea?.targetAudience || "N/A"}
- Completed Tasks: ${completedTasks}
- Pending Next Tasks: ${pendingTasks}
- Currency & Financial Standard: All budgets, expenses, and pricing calculations MUST be generated in Indian Rupees (INR – ₹) using the Indian numbering format (e.g. ₹25,000, ₹1,50,000, ₹10,00,000). Do NOT quote amounts in USD ($) or treat foreign currency as 1:1.
- Budget Available: ₹${Number(availableBudget).toLocaleString('en-IN')} (Monthly capacity: ~₹${Number(monthlyBurn).toLocaleString('en-IN')}/mo)
- Saved Decisions: ${decisions}

Always reference the founder's specific project context when relevant. Be concise, tactical, honest about uncertainty, and prioritize practical next steps over generic buzzwords.
Format your responses using clear Markdown.`;

  // -------------------------------------------------------------------------
  // 5. Construct conversation history (last 10 messages)
  // -------------------------------------------------------------------------
  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  if (Array.isArray(conversationHistory)) {
    const validHistory = conversationHistory
      .slice(-10)
      .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
      .map((m) => ({
        role: m.role as string,
        content: m.content!.slice(0, 1500),
      }));
    messages.push(...validHistory);
  }

  messages.push({ role: "user", content: safeUserMessage });

  // -------------------------------------------------------------------------
  // 6. Call Groq API
  // -------------------------------------------------------------------------
  let groqResponse: Response;
  const modelsToTry = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b"];

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
          messages,
          temperature: 0.65,
          max_tokens: 800,
        }),
      });

      if (groqResponse.ok) {
        break;
      }

      console.warn(`[chat-copilot] Model ${model} returned status ${groqResponse.status}. Attempting fallback model if available.`);
    } catch (networkErr) {
      console.error(`[chat-copilot] Network error calling Groq with model ${model}:`, networkErr);
    }
  }

  if (!groqResponse! || !groqResponse.ok) {
    const status = groqResponse ? groqResponse.status : 502;
    console.error(`[chat-copilot] Groq API returned failure status ${status}`);
    return jsonResponse(
      { error: "AI provider is currently unavailable. Please try again in a moment." },
      status === 429 ? 429 : 502
    );
  }

  // -------------------------------------------------------------------------
  // 7. Parse response and return text
  // -------------------------------------------------------------------------
  let groqData: { choices?: { message?: { content?: string } }[] };
  try {
    groqData = await groqResponse.json();
  } catch {
    console.error("[chat-copilot] Failed to parse Groq response as JSON.");
    return jsonResponse({ error: "Failed to parse AI response." }, 422);
  }

  const messageText = groqData.choices?.[0]?.message?.content?.trim();
  if (!messageText) {
    console.error("[chat-copilot] Empty content in Groq choice.");
    return jsonResponse({ error: "AI returned an empty response." }, 422);
  }

  return jsonResponse({ message: messageText });
});
