/**
 * aiChatEngine.js
 * Context-aware AI Co-Pilot that incorporates the user's active startup idea,
 * execution roadmap, tasks completed, decisions logged, and budget status.
 */

export async function askAIAssistant({ userMessage, projectState, apiKey }) {
  // If user provided a Groq API key, call Groq with full project context injected
  if (apiKey && apiKey.trim().startsWith('gsk_')) {
    try {
      const response = await callGroqChat({ userMessage, projectState, apiKey });
      if (response) return response;
    } catch (e) {
      console.warn("Groq chat failed, falling back to contextual assistant engine:", e);
    }
  }

  // Built-in intelligent response generator:
  await new Promise((r) => setTimeout(r, 700));

  const text = userMessage.toLowerCase();
  const idea = projectState.selectedIdea;
  const tasks = projectState.tasks || [];
  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const decisions = projectState.decisions || [];
  const budget = projectState.budget || {};

  // Context-aware query classification:

  // 1. Next action query
  if (text.includes('next') || text.includes('priority') || text.includes('what should i do') || text.includes('start')) {
    if (!idea) {
      return "Your immediate first step is to visit the **Problem Discovery** tab. Define the real-world problem you want to solve, and let VISION synthesize 3 viable startup opportunities for you to choose from.";
    }
    if (pendingTasks.length > 0) {
      const nextTask = pendingTasks[0];
      return `Based on your active project **${idea.name}**, your immediate next priority is:\n\n` +
        `🎯 **${nextTask.title}** (${nextTask.category})\n` +
        `*${nextTask.desc}*\n\n` +
        `Estimated time: ~${nextTask.estimatedDays || 2} days. Once you finish this, tick it off on your **Journey Dashboard** to log your verified progress.`;
    }
    return `For **${idea.name}**, all current roadmap tasks are completed! Your next strategic move is to run a **Decision Simulation** on your growth channels or plan Phase 4 expansion.`;
  }

  // 2. Budget / cost query
  if (text.includes('budget') || text.includes('money') || text.includes('cost') || text.includes('expense') || text.includes('runway')) {
    const avail = budget.availableBudget || 1500;
    const burn = budget.monthlyBurnCapacity || Math.round(avail / 3);
    return `Looking at your financial envelope for **${idea?.name || 'your startup'}**:\n\n` +
      `• **Available Budget:** $${avail}\n` +
      `• **Monthly Burn Capacity:** ~$${burn}/month\n` +
      `• **Key Lean Rule:** In this stage, do not pay for enterprise analytics or premium branding agencies. Use the free tiers of **Supabase** (database), **Vercel** (hosting), and **Tally.so** (user surveys) to keep your fixed burn under $20/month.`;
  }

  // 3. Validation / customer discovery query
  if (text.includes('validat') || text.includes('interview') || text.includes('customer') || text.includes('user')) {
    return `To validate **${idea?.name || 'your startup'}** without spending money on ads:\n\n` +
      `1. **Target Group:** Focus exclusively on *${idea?.targetAudience || 'your target audience'}*.\n` +
      `2. **Discovery Rules:** Never ask *"Would you like an app that does X?"* (people are polite and will say yes). Instead, ask:\n` +
      `   - *"When was the last time you encountered this problem?"*\n` +
      `   - *"What did you do to solve it, and what did that workaround cost you?"*\n` +
      `   - *"Why haven't you looked for an alternative yet?"*\n` +
      `3. **Validation Threshold:** If 8 out of 15 people have actively spent time or money trying to solve this in the past 60 days, your problem is validated.`;
  }

  // 4. Progress / status summary query
  if (text.includes('progress') || text.includes('status') || text.includes('summary') || text.includes('how am i doing')) {
    return `📊 **Current Project Status for ${idea?.name || 'Unassigned Venture'}:**\n\n` +
      `• **Overall Progress:** ${progressPercent}% complete (${completedTasks.length} of ${tasks.length} tasks finished).\n` +
      `• **Recorded Decisions:** ${decisions.length} strategic decisions saved.\n` +
      `• **Active Milestones:** ${pendingTasks.slice(0, 2).map((t) => t.title).join(' • ') || 'All caught up'}.\n\n` +
      `Keep logging completed actions in your workspace dashboard to preserve verifiable progress telemetry!`;
  }

  // 5. General guidance fallback tailored to project state
  return `I have your active context loaded for **${idea?.name || 'VISION'}**.\n\n` +
    `Your unique value proposition is: *"${idea?.uniqueValueProp || 'Turning real-world problems into startup possibilities'}"*.\n\n` +
    `You currently have **${pendingTasks.length} pending tasks** and **$${budget.availableBudget || 1500}** in budgeted runway. Feel free to ask me:\n` +
    `• *"What is my next priority?"*\n` +
    `• *"How can I cut my MVP tech stack costs?"*\n` +
    `• *"Help me evaluate my latest decision tradeoff."*`;
}

async function callGroqChat({ userMessage, projectState, apiKey }) {
  const idea = projectState.selectedIdea;
  const completedTasks = (projectState.tasks || []).filter((t) => t.completed).map((t) => t.title);
  const pendingTasks = (projectState.tasks || []).filter((t) => !t.completed).map((t) => t.title);
  const decisions = (projectState.decisions || []).map((d) => `${d.title}: chose ${d.chosenOption}`);

  const systemPrompt = `You are VISION AI Co-Pilot, an elite startup mentor and software architect.
You give sharp, actionable, realistic advice to early-stage founders.
Founder Project Context:
- Active Startup Idea: ${idea ? `${idea.name} (${idea.category})` : 'Not selected yet'}
- Problem Addressed: ${idea ? idea.problemAddressed : 'N/A'}
- Unique Value Prop: ${idea ? idea.uniqueValueProp : 'N/A'}
- Target Audience: ${idea ? idea.targetAudience : 'N/A'}
- Completed Tasks: ${completedTasks.length > 0 ? completedTasks.join(', ') : 'None yet'}
- Pending Next Tasks: ${pendingTasks.slice(0, 3).join(', ')}
- Budget Available: $${projectState.budget?.availableBudget || 1500}
- Saved Decisions: ${decisions.join(' | ') || 'None yet'}

Always reference the founder's specific project context when relevant. Be concise, tactical, honest about uncertainty, and prioritize practical next steps over generic buzzwords.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.6,
      max_tokens: 600
    })
  });

  if (!response.ok) throw new Error(`Groq HTTP ${response.status}`);
  const data = await response.json();
  return data.choices[0]?.message?.content;
}
