/**
 * collaborationService.js
 * Supabase data layer for the Collaborations Hub.
 *
 * Tables used:
 *   - collaboration_opportunities  (create/list/close)
 *   - collaboration_applications   (apply/withdraw/list)
 *   - sponsorship_requests         (create/list/delete)
 *
 * RLS ensures users can only mutate their own rows.
 * Any authenticated user can view community-board data (open opportunities).
 */

import { supabase } from './supabaseClient.js';

// ─────────────────────────────────────────────────────────────────────────────
// COLLABORATION OPPORTUNITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all open collaboration opportunities (community board).
 * Includes basic profile info for the poster and their venture title.
 */
export async function getOpenOpportunities() {
  const { data, error } = await supabase
    .from('collaboration_opportunities')
    .select(`
      *,
      profiles ( full_name, email ),
      projects ( title )
    `)
    .eq('is_open', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[collabService] getOpenOpportunities error:', error.message);
    throw error;
  }
  return data || [];
}

/**
 * Fetch collaboration opportunities posted by the current user.
 */
export async function getMyOpportunities() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('collaboration_opportunities')
    .select(`*, projects ( title )`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[collabService] getMyOpportunities error:', error.message);
    throw error;
  }
  return data || [];
}

/**
 * Create a new collaboration opportunity.
 */
export async function createOpportunity({
  title,
  description,
  ventureSummary,
  collabType,
  skillsNeeded,
  commitmentLevel,
  projectId,
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be authenticated to post an opportunity.');

  const { data, error } = await supabase
    .from('collaboration_opportunities')
    .insert({
      user_id: user.id,
      project_id: projectId || null,
      title: title.trim(),
      description: description.trim(),
      venture_summary: ventureSummary?.trim() || '',
      collab_type: collabType || 'teammate',
      skills_needed: Array.isArray(skillsNeeded) ? skillsNeeded : [],
      commitment_level: commitmentLevel || 'part-time',
      is_open: true,
    })
    .select()
    .single();

  if (error) {
    console.error('[collabService] createOpportunity error:', error.message);
    throw error;
  }
  return data;
}

/**
 * Close/reopen an opportunity (toggle is_open).
 */
export async function toggleOpportunityStatus(opportunityId, isOpen) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be authenticated.');

  const { data, error } = await supabase
    .from('collaboration_opportunities')
    .update({ is_open: isOpen })
    .eq('id', opportunityId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete an opportunity (and cascades its applications).
 */
export async function deleteOpportunity(opportunityId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be authenticated.');

  const { error } = await supabase
    .from('collaboration_opportunities')
    .delete()
    .eq('id', opportunityId)
    .eq('user_id', user.id);

  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────────────────────
// COLLABORATION APPLICATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Submit an expression of interest / application for an opportunity.
 * Returns error if user already applied (unique constraint).
 */
export async function applyToOpportunity(opportunityId, introduction) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be authenticated to apply.');

  const { data, error } = await supabase
    .from('collaboration_applications')
    .insert({
      opportunity_id: opportunityId,
      applicant_user_id: user.id,
      introduction: introduction.trim(),
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already expressed interest in this opportunity.');
    }
    console.error('[collabService] applyToOpportunity error:', error.message);
    throw error;
  }
  return data;
}

/**
 * Get all applications submitted BY the current user (My Applications tab).
 */
export async function getMyApplications() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('collaboration_applications')
    .select(`
      *,
      collaboration_opportunities (
        id, title, venture_summary, collab_type, is_open,
        profiles ( full_name, email )
      )
    `)
    .eq('applicant_user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[collabService] getMyApplications error:', error.message);
    throw error;
  }
  return data || [];
}

/**
 * Get all applications received for opportunities posted by the current user.
 * Includes the applicant's profile.
 */
export async function getIncomingApplications() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // First get the user's opportunity IDs
  const { data: opps, error: oppsErr } = await supabase
    .from('collaboration_opportunities')
    .select('id, title')
    .eq('user_id', user.id);

  if (oppsErr || !opps?.length) return [];

  const oppIds = opps.map((o) => o.id);

  const { data, error } = await supabase
    .from('collaboration_applications')
    .select(`
      *,
      collaboration_opportunities ( id, title ),
      profiles!collaboration_applications_applicant_user_id_fkey ( full_name, email )
    `)
    .in('opportunity_id', oppIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[collabService] getIncomingApplications error:', error.message);
    throw error;
  }
  return data || [];
}

/**
 * Update status of an incoming application (accept / decline).
 */
export async function updateApplicationStatus(applicationId, status) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be authenticated.');

  const { data, error } = await supabase
    .from('collaboration_applications')
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Withdraw (delete) an application the current user submitted.
 */
export async function withdrawApplication(applicationId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be authenticated.');

  const { error } = await supabase
    .from('collaboration_applications')
    .delete()
    .eq('id', applicationId)
    .eq('applicant_user_id', user.id);

  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────────────────────
// SPONSORSHIP REQUESTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all active sponsorship requests (community board — user-generated only).
 */
export async function getSponsorshipRequests() {
  const { data, error } = await supabase
    .from('sponsorship_requests')
    .select(`
      *,
      profiles ( full_name, email ),
      projects ( title )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[collabService] getSponsorshipRequests error:', error.message);
    throw error;
  }
  return data || [];
}

/**
 * Post a new sponsorship request for the current user's venture.
 */
export async function createSponsorshipRequest({
  ventureTitle,
  ventureDescription,
  supportTypes,
  askDetails,
  projectId,
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be authenticated to post a sponsorship request.');

  const { data, error } = await supabase
    .from('sponsorship_requests')
    .insert({
      user_id: user.id,
      project_id: projectId || null,
      venture_title: ventureTitle.trim(),
      venture_description: ventureDescription.trim(),
      support_types: Array.isArray(supportTypes) ? supportTypes : [],
      ask_details: askDetails?.trim() || '',
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('[collabService] createSponsorshipRequest error:', error.message);
    throw error;
  }
  return data;
}

/**
 * Delete a sponsorship request created by the current user.
 */
export async function deleteSponsorshipRequest(requestId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be authenticated.');

  const { error } = await supabase
    .from('sponsorship_requests')
    .delete()
    .eq('id', requestId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Get the current user's own sponsorship requests.
 */
export async function getMySponsorshipRequests() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('sponsorship_requests')
    .select(`*, projects ( title )`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
