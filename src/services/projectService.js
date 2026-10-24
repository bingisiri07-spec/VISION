import { supabase } from './supabaseClient';

/**
 * projectService.js
 * Bridges VISION's React state with Supabase PostgreSQL tables.
 * Handles Projects, Ideas, Roadmaps, Tasks, Budgets, Decisions, Notes, and Chat.
 */

// 1. Fetch all projects for the current user
export async function getUserProjects() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user projects:', error.message);
    throw error;
  }
  return data || [];
}

// 2. Create a new project row in Supabase
export async function createCloudProject({
  title,
  domain,
  problemStatement,
  affectedAudience,
  constraints,
  goals
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated to create a cloud project');

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      title: title || 'Untitled Venture',
      domain: domain || 'technology',
      problem_statement: problemStatement,
      affected_audience: affectedAudience || '',
      constraints: constraints || '',
      goals: goals || '',
      status: 'discovery',
      journey_started: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating cloud project:', error.message);
    throw error;
  }
  return data;
}

// 3. Save generated ideas for a project
export async function saveCloudIdeas(projectId, ideas = []) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !projectId || !ideas.length) return [];

  const rows = ideas.map((idea) => ({
    project_id: projectId,
    user_id: user.id,
    name: idea.name,
    tagline: idea.tagline || '',
    category: idea.category || '',
    problem_addressed: idea.problemAddressed || '',
    target_audience: idea.targetAudience || '',
    solution: idea.solution || '',
    unique_value_prop: idea.uniqueValueProp || '',
    feasibility: idea.feasibility || 'Medium',
    feasibility_score: idea.feasibilityScore || 75,
    major_challenges: idea.majorChallenges || [],
    revenue_models: idea.revenueModels || [],
    validation_steps: idea.validationSteps || [],
    is_selected: Boolean(idea.isSelected),
  }));

  const { data, error } = await supabase
    .from('ideas')
    .insert(rows)
    .select();

  if (error) {
    console.error('Error saving ideas:', error.message);
    throw error;
  }
  return data;
}

// 4. Mark an idea as selected and update project title
export async function selectCloudIdea(projectId, ideaId, ideaName) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !projectId) return;

  // Unselect all other ideas for this project
  await supabase
    .from('ideas')
    .update({ is_selected: false })
    .eq('project_id', projectId);

  // Set the chosen idea to selected
  if (ideaId) {
    await supabase
      .from('ideas')
      .update({ is_selected: true })
      .eq('id', ideaId);
  }

  // Update project title to match chosen startup name
  if (ideaName) {
    await supabase
      .from('projects')
      .update({ title: ideaName })
      .eq('id', projectId);
  }
}

// 5. Save or update the execution roadmap
export async function saveCloudRoadmap(projectId, ideaId, roadmapData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !projectId || !roadmapData) return;

  const payload = {
    project_id: projectId,
    user_id: user.id,
    idea_id: ideaId || null,
    overview: roadmapData.overview || {},
    funding_options: roadmapData.fundingOptions || [],
    phases_summary: roadmapData.phases || [],
  };

  const { data, error } = await supabase
    .from('roadmaps')
    .upsert(payload, { onConflict: 'project_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving roadmap:', error.message);
  }
  return data;
}

// 6. Save or update tasks
export async function syncCloudTasks(projectId, tasks = []) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !projectId) return;

  // Replace existing tasks for this project to maintain consistency
  await supabase.from('tasks').delete().eq('project_id', projectId);

  if (!tasks.length) return;

  const rows = tasks.map((t, idx) => ({
    project_id: projectId,
    user_id: user.id,
    phase_id: t.phaseId || 'phase_1',
    title: t.title,
    description: t.desc || '',
    category: t.category || 'Validation',
    estimated_days: t.estimatedDays || 2,
    completed: Boolean(t.completed),
    completed_at: t.completed ? new Date().toISOString() : null,
    is_custom: Boolean(t.isCustom || t.id?.toString().includes('custom')),
    sort_order: idx,
  }));

  const { error } = await supabase.from('tasks').insert(rows);
  if (error) console.error('Error syncing tasks:', error.message);
}

// 7. Save or update budget configuration
export async function saveCloudBudget(projectId, budgetState) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !projectId || !budgetState) return;

  const payload = {
    project_id: projectId,
    user_id: user.id,
    available_budget: budgetState.availableBudget || 1500,
    runway_months: budgetState.runwayMonths || 3,
    team_size: budgetState.teamSize || 1,
    hours_per_week: budgetState.timeAvailableHoursPerWeek || 20,
    monthly_burn: budgetState.monthlyBurnCapacity || 500,
    allocations: budgetState.allocations || [],
    essential_expenses: budgetState.essentialExpenses || [],
    optional_expenses: budgetState.optionalExpenses || [],
    free_alternatives: budgetState.freeToolAlternatives || [],
    financial_risks: budgetState.financialRisks || [],
  };

  const { data, error } = await supabase
    .from('budgets')
    .upsert(payload, { onConflict: 'project_id' })
    .select()
    .single();

  if (error) console.error('Error saving budget:', error.message);
  return data;
}

// 8. Log a strategic decision
export async function saveCloudDecision(projectId, decisionRecord) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !projectId || !decisionRecord) return;

  const { data, error } = await supabase
    .from('decisions')
    .insert({
      project_id: projectId,
      user_id: user.id,
      scenario_id: decisionRecord.scenarioId || 'custom',
      title: decisionRecord.title,
      chosen_option: decisionRecord.chosenOption,
      chosen_option_key: decisionRecord.chosenOptionKey || 'optionA',
      user_notes: decisionRecord.userNotes || '',
      recommendation: decisionRecord.recommendationVerdict || '',
    })
    .select()
    .single();

  if (error) console.error('Error logging decision:', error.message);
  return data;
}

// 9. Add a founder note
export async function saveCloudNote(projectId, noteText) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !projectId || !noteText) return;

  const { data, error } = await supabase
    .from('notes')
    .insert({
      project_id: projectId,
      user_id: user.id,
      text: noteText,
    })
    .select()
    .single();

  if (error) console.error('Error saving note:', error.message);
  return data;
}

// 10. Update journey status
export async function updateCloudJourneyStatus(projectId, started = true, startedAt = null) {
  const { error } = await supabase
    .from('projects')
    .update({
      journey_started: started,
      journey_started_at: startedAt || new Date().toISOString(),
      status: 'active',
    })
    .eq('id', projectId);

  if (error) console.error('Error updating journey status:', error.message);
}

// 11. Delete project (cascades to all related tables)
export async function deleteCloudProject(projectId) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    console.error('Error deleting project:', error.message);
    throw error;
  }
}

// 12. Load a full project and all its related relational records
export async function getFullProject(projectId) {
  if (!projectId) return null;

  // Fetch project row
  const { data: project, error: pErr } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (pErr || !project) {
    console.error('Error loading project:', pErr?.message);
    return null;
  }

  // Fetch related records in parallel
  const [
    { data: ideas },
    { data: roadmap },
    { data: tasks },
    { data: budget },
    { data: decisions },
    { data: notes }
  ] = await Promise.all([
    supabase.from('ideas').select('*').eq('project_id', projectId),
    supabase.from('roadmaps').select('*').eq('project_id', projectId).maybeSingle(),
    supabase.from('tasks').select('*').eq('project_id', projectId).order('sort_order', { ascending: true }),
    supabase.from('budgets').select('*').eq('project_id', projectId).maybeSingle(),
    supabase.from('decisions').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
    supabase.from('notes').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
  ]);

  // Find selected idea
  const selectedIdea = (ideas || []).find((i) => i.is_selected) || ideas?.[0] || null;

  return {
    id: project.id,
    problem: {
      domain: project.domain,
      problemStatement: project.problem_statement,
      affectedAudience: project.affected_audience,
      constraints: project.constraints,
      goals: project.goals,
    },
    ideas: (ideas || []).map((i) => ({
      id: i.id,
      name: i.name,
      tagline: i.tagline,
      category: i.category,
      problemAddressed: i.problem_addressed,
      targetAudience: i.target_audience,
      solution: i.solution,
      uniqueValueProp: i.unique_value_prop,
      feasibility: i.feasibility,
      feasibilityScore: i.feasibility_score,
      majorChallenges: i.major_challenges || [],
      revenueModels: i.revenue_models || [],
      validationSteps: i.validation_steps || [],
      isSelected: i.is_selected,
    })),
    selectedIdea: selectedIdea ? {
      id: selectedIdea.id,
      name: selectedIdea.name,
      tagline: selectedIdea.tagline,
      category: selectedIdea.category,
      problemAddressed: selectedIdea.problem_addressed,
      targetAudience: selectedIdea.target_audience,
      solution: selectedIdea.solution,
      uniqueValueProp: selectedIdea.unique_value_prop,
      feasibility: selectedIdea.feasibility,
      feasibilityScore: selectedIdea.feasibility_score,
      majorChallenges: selectedIdea.major_challenges || [],
      revenueModels: selectedIdea.revenue_models || [],
      validationSteps: selectedIdea.validation_steps || [],
    } : null,
    journeyStarted: project.journey_started,
    journeyStartedAt: project.journey_started_at,
    roadmap: roadmap ? {
      overview: roadmap.overview,
      fundingOptions: roadmap.funding_options,
      phases: roadmap.phases_summary,
    } : null,
    tasks: (tasks || []).map((t) => ({
      id: t.id,
      phaseId: t.phase_id,
      title: t.title,
      desc: t.description,
      category: t.category,
      estimatedDays: t.estimated_days,
      completed: t.completed,
      isCustom: t.is_custom,
    })),
    budget: budget ? {
      availableBudget: Number(budget.available_budget),
      runwayMonths: Number(budget.runway_months),
      teamSize: Number(budget.team_size),
      timeAvailableHoursPerWeek: Number(budget.hours_per_week),
      monthlyBurnCapacity: Number(budget.monthly_burn),
      allocations: budget.allocations || [],
      essentialExpenses: budget.essential_expenses || [],
      optionalExpenses: budget.optional_expenses || [],
      freeToolAlternatives: budget.free_alternatives || [],
      financialRisks: budget.financial_risks || [],
    } : null,
    decisions: (decisions || []).map((d) => ({
      id: d.id,
      scenarioId: d.scenario_id,
      title: d.title,
      chosenOption: d.chosen_option,
      chosenOptionKey: d.chosen_option_key,
      userNotes: d.user_notes,
      recommendationVerdict: d.recommendation,
      timestamp: d.created_at,
    })),
    notes: (notes || []).map((n) => ({
      id: n.id,
      text: n.text,
      timestamp: n.created_at,
    })),
  };
}

// ------------------------------------------------------------------------------
// CONTINUOUS CHAT HISTORY (Do NOT restart conversation across projects)
// ------------------------------------------------------------------------------

export async function getContinuousChatHistory() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // If not logged in, read from persistent local storage
    try {
      const raw = localStorage.getItem('vision_copilot_continuous_chat');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // If logged in, fetch full continuous history from Supabase
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) {
    // Fallback to local storage if remote is empty
    try {
      const raw = localStorage.getItem('vision_copilot_continuous_chat');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  return data.map((m) => ({
    id: m.id,
    sender: m.sender,
    text: m.text,
    timestamp: m.created_at,
  }));
}

export async function saveContinuousChatMessage(message, projectId = null) {
  // Always update local persistent storage so it survives offline/reloads
  try {
    const raw = localStorage.getItem('vision_copilot_continuous_chat');
    const existing = raw ? JSON.parse(raw) : [];
    const updated = [...existing, message];
    localStorage.setItem('vision_copilot_continuous_chat', JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not save chat to localStorage:', err);
  }

  // If user is authenticated, also sync to Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase.from('chat_messages').insert({
      user_id: user.id,
      project_id: projectId || null,
      sender: message.sender,
      text: message.text,
    });
  } catch (err) {
    console.warn('Could not sync chat message to Supabase:', err);
  }
}

// ------------------------------------------------------------------------------
// MIGRATION HELPER: LocalStorage -> Supabase
// ------------------------------------------------------------------------------

export async function migrateLocalStateToSupabase(localState) {
  if (!localState || !localState.problem || !localState.problem.problemStatement) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Create project
  const project = await createCloudProject({
    title: localState.selectedIdea?.name || 'My First Venture',
    domain: localState.problem.domain || 'technology',
    problemStatement: localState.problem.problemStatement,
    affectedAudience: localState.problem.affectedAudience || '',
    constraints: localState.problem.constraints || '',
    goals: localState.problem.goals || '',
  });

  const projectId = project.id;

  // 2. Save ideas if present
  let savedIdeas = [];
  if (localState.ideas && localState.ideas.length) {
    const ideasToSave = localState.ideas.map((i) => ({
      ...i,
      isSelected: localState.selectedIdea?.id === i.id || localState.selectedIdea?.name === i.name,
    }));
    savedIdeas = await saveCloudIdeas(projectId, ideasToSave);
  }

  const chosenIdeaId = savedIdeas.find((i) => i.is_selected)?.id || null;

  // 3. Save roadmap if present
  if (localState.roadmap && localState.roadmap.overview) {
    await saveCloudRoadmap(projectId, chosenIdeaId, localState.roadmap);
  }

  // 4. Save tasks if present
  if (localState.tasks && localState.tasks.length) {
    await syncCloudTasks(projectId, localState.tasks);
  }

  // 5. Save budget if present
  if (localState.budget) {
    await saveCloudBudget(projectId, localState.budget);
  }

  // 6. Save decisions if present
  if (localState.decisions && localState.decisions.length) {
    for (const d of localState.decisions) {
      await saveCloudDecision(projectId, d);
    }
  }

  // 7. Save notes if present
  if (localState.notes && localState.notes.length) {
    for (const n of localState.notes) {
      await saveCloudNote(projectId, n.text);
    }
  }

  // 8. If journey started, update status
  if (localState.journeyStarted) {
    await updateCloudJourneyStatus(projectId, true, localState.journeyStartedAt);
  }

  return projectId;
}
