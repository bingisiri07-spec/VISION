-- ==============================================================================
-- VISION Migration 002: Collaborations System + Profile Field Expansion
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- A. EXPAND PROFILES TABLE
-- Add contact_number and linkedin_url columns if they don't already exist
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS contact_number TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT;


-- ------------------------------------------------------------------------------
-- B. COLLABORATION OPPORTUNITIES
-- A founder posts an opportunity linked to one of their ventures/projects
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collaboration_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  -- Core content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  venture_summary TEXT,                       -- brief one-liner about the venture
  collab_type TEXT NOT NULL DEFAULT 'teammate', -- 'teammate' | 'technical' | 'mentor' | 'other'
  skills_needed JSONB DEFAULT '[]'::jsonb,    -- e.g. ["AI/ML", "Frontend", "Marketing"]
  commitment_level TEXT DEFAULT 'part-time',  -- 'part-time' | 'full-time' | 'flexible'
  is_open BOOLEAN DEFAULT TRUE NOT NULL,      -- can be closed by the creator
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DROP TRIGGER IF EXISTS set_collab_opp_updated_at ON public.collaboration_opportunities;
CREATE TRIGGER set_collab_opp_updated_at
  BEFORE UPDATE ON public.collaboration_opportunities
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_collab_opp_user_id ON public.collaboration_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_collab_opp_project_id ON public.collaboration_opportunities(project_id);


-- ------------------------------------------------------------------------------
-- C. COLLABORATION APPLICATIONS
-- An authenticated user expresses interest in an opportunity
-- Unique constraint prevents duplicate applications from the same user
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collaboration_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.collaboration_opportunities(id) ON DELETE CASCADE,
  applicant_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  introduction TEXT NOT NULL,                -- short pitch from the applicant
  status TEXT DEFAULT 'pending' NOT NULL,    -- 'pending' | 'accepted' | 'declined'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (opportunity_id, applicant_user_id) -- prevents duplicate applications
);

CREATE INDEX IF NOT EXISTS idx_collab_apps_opportunity_id ON public.collaboration_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_collab_apps_applicant_id ON public.collaboration_applications(applicant_user_id);


-- ------------------------------------------------------------------------------
-- D. SPONSORSHIP REQUESTS
-- A founder posts their sponsorship/resource needs — clearly user-generated,
-- NOT a directory of verified sponsors
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sponsorship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  venture_title TEXT NOT NULL,
  venture_description TEXT NOT NULL,
  support_types JSONB DEFAULT '[]'::jsonb,  -- e.g. ["Funding", "Cloud Credits", "Mentorship"]
  ask_details TEXT,                          -- what exactly they need
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DROP TRIGGER IF EXISTS set_sponsorship_updated_at ON public.sponsorship_requests;
CREATE TRIGGER set_sponsorship_updated_at
  BEFORE UPDATE ON public.sponsorship_requests
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_sponsorship_user_id ON public.sponsorship_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_project_id ON public.sponsorship_requests(project_id);


-- ==============================================================================
-- E. ROW LEVEL SECURITY POLICIES
-- ==============================================================================

-- ---- COLLABORATION_OPPORTUNITIES ----
ALTER TABLE public.collaboration_opportunities ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can VIEW open opportunities (community board)
DROP POLICY IF EXISTS "Authenticated users can view open opportunities" ON public.collaboration_opportunities;
CREATE POLICY "Authenticated users can view open opportunities"
  ON public.collaboration_opportunities FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only the creator can INSERT
DROP POLICY IF EXISTS "Users can create own opportunities" ON public.collaboration_opportunities;
CREATE POLICY "Users can create own opportunities"
  ON public.collaboration_opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only the creator can UPDATE (e.g. close the opportunity)
DROP POLICY IF EXISTS "Users can update own opportunities" ON public.collaboration_opportunities;
CREATE POLICY "Users can update own opportunities"
  ON public.collaboration_opportunities FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only the creator can DELETE their opportunity
DROP POLICY IF EXISTS "Users can delete own opportunities" ON public.collaboration_opportunities;
CREATE POLICY "Users can delete own opportunities"
  ON public.collaboration_opportunities FOR DELETE
  USING (auth.uid() = user_id);


-- ---- COLLABORATION_APPLICATIONS ----
ALTER TABLE public.collaboration_applications ENABLE ROW LEVEL SECURITY;

-- Applicants can see their own applications
-- Opportunity creators can see applications to their opportunities
DROP POLICY IF EXISTS "Applicants and creators can view applications" ON public.collaboration_applications;
CREATE POLICY "Applicants and creators can view applications"
  ON public.collaboration_applications FOR SELECT
  USING (
    auth.uid() = applicant_user_id
    OR auth.uid() IN (
      SELECT user_id FROM public.collaboration_opportunities
      WHERE id = opportunity_id
    )
  );

-- Authenticated users can apply (INSERT), but only as themselves
DROP POLICY IF EXISTS "Users can apply to opportunities" ON public.collaboration_applications;
CREATE POLICY "Users can apply to opportunities"
  ON public.collaboration_applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_user_id);

-- Applicants can delete (withdraw) their own application
DROP POLICY IF EXISTS "Applicants can withdraw own application" ON public.collaboration_applications;
CREATE POLICY "Applicants can withdraw own application"
  ON public.collaboration_applications FOR DELETE
  USING (auth.uid() = applicant_user_id);

-- Opportunity creators can update status (accept/decline)
DROP POLICY IF EXISTS "Creators can update application status" ON public.collaboration_applications;
CREATE POLICY "Creators can update application status"
  ON public.collaboration_applications FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.collaboration_opportunities
      WHERE id = opportunity_id
    )
  );


-- ---- SPONSORSHIP_REQUESTS ----
ALTER TABLE public.sponsorship_requests ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active sponsorship requests (community board)
DROP POLICY IF EXISTS "Authenticated users can view sponsorship requests" ON public.sponsorship_requests;
CREATE POLICY "Authenticated users can view sponsorship requests"
  ON public.sponsorship_requests FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can create own sponsorship requests" ON public.sponsorship_requests;
CREATE POLICY "Users can create own sponsorship requests"
  ON public.sponsorship_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sponsorship requests" ON public.sponsorship_requests;
CREATE POLICY "Users can update own sponsorship requests"
  ON public.sponsorship_requests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sponsorship requests" ON public.sponsorship_requests;
CREATE POLICY "Users can delete own sponsorship requests"
  ON public.sponsorship_requests FOR DELETE
  USING (auth.uid() = user_id);
