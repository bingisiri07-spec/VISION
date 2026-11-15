-- ==============================================================================
-- VISION Migration 002: Collaborations System + Profile Field Expansion
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- A. EXPAND PROFILES TABLE
-- Add contact_number and linkedin_url columns if they don't already exist
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS contact_number TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Ensure profiles can be read by authenticated users for collaboration listings
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);


-- ------------------------------------------------------------------------------
-- B. COLLABORATION OPPORTUNITIES
-- A founder posts an opportunity linked to one of their ventures/projects
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collaboration_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  venture_summary TEXT,
  collab_type TEXT NOT NULL DEFAULT 'teammate', -- 'teammate' | 'technical' | 'mentor' | 'other'
  skills_needed JSONB DEFAULT '[]'::jsonb,
  commitment_level TEXT DEFAULT 'part-time',  -- 'part-time' | 'full-time' | 'flexible'
  is_open BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT fk_collab_opp_profile FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS set_collab_opp_updated_at ON public.collaboration_opportunities;
CREATE TRIGGER set_collab_opp_updated_at
  BEFORE UPDATE ON public.collaboration_opportunities
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_collab_opp_user_id ON public.collaboration_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_collab_opp_project_id ON public.collaboration_opportunities(project_id);


-- ------------------------------------------------------------------------------
-- C. COLLABORATION APPLICATIONS (Invitations & Inquiries)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collaboration_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.collaboration_opportunities(id) ON DELETE CASCADE,
  applicant_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  introduction TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- 'pending' | 'accepted' | 'declined'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (opportunity_id, applicant_user_id),
  CONSTRAINT fk_collab_app_profile FOREIGN KEY (applicant_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_collab_apps_opportunity_id ON public.collaboration_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_collab_apps_applicant_id ON public.collaboration_applications(applicant_user_id);


-- ------------------------------------------------------------------------------
-- D. SPONSORSHIP REQUESTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sponsorship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  venture_title TEXT NOT NULL,
  venture_description TEXT NOT NULL,
  support_types JSONB DEFAULT '[]'::jsonb,
  ask_details TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT fk_sponsorship_profile FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
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

-- Allow reading open opportunities
DROP POLICY IF EXISTS "Anyone can view open opportunities" ON public.collaboration_opportunities;
DROP POLICY IF EXISTS "Authenticated users can view open opportunities" ON public.collaboration_opportunities;
CREATE POLICY "Anyone can view open opportunities"
  ON public.collaboration_opportunities FOR SELECT
  USING (is_open = true OR auth.uid() = user_id);

-- Only the creator can INSERT
DROP POLICY IF EXISTS "Users can create own opportunities" ON public.collaboration_opportunities;
CREATE POLICY "Users can create own opportunities"
  ON public.collaboration_opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only the creator can UPDATE
DROP POLICY IF EXISTS "Users can update own opportunities" ON public.collaboration_opportunities;
CREATE POLICY "Users can update own opportunities"
  ON public.collaboration_opportunities FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only the creator can DELETE
DROP POLICY IF EXISTS "Users can delete own opportunities" ON public.collaboration_opportunities;
CREATE POLICY "Users can delete own opportunities"
  ON public.collaboration_opportunities FOR DELETE
  USING (auth.uid() = user_id);


-- ---- COLLABORATION_APPLICATIONS ----
ALTER TABLE public.collaboration_applications ENABLE ROW LEVEL SECURITY;

-- Applicants can see their own applications, opportunity creators can see applications to their opportunities
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

-- Authenticated users can apply, but only as themselves
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
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.collaboration_opportunities
      WHERE id = opportunity_id
    )
  );


-- ---- SPONSORSHIP_REQUESTS ----
ALTER TABLE public.sponsorship_requests ENABLE ROW LEVEL SECURITY;

-- Allow reading active sponsorships
DROP POLICY IF EXISTS "Anyone can view active sponsorship requests" ON public.sponsorship_requests;
DROP POLICY IF EXISTS "Authenticated users can view sponsorship requests" ON public.sponsorship_requests;
CREATE POLICY "Anyone can view active sponsorship requests"
  ON public.sponsorship_requests FOR SELECT
  USING (is_active = true OR auth.uid() = user_id);

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


-- ---- ALLOW READING LINKED PROJECT TITLES ----
DROP POLICY IF EXISTS "Allow reading project titles for opportunities" ON public.projects;
CREATE POLICY "Allow reading project titles for opportunities"
  ON public.projects FOR SELECT
  USING (
    auth.uid() = user_id
    OR id IN (
      SELECT project_id FROM public.collaboration_opportunities WHERE project_id IS NOT NULL
    )
    OR id IN (
      SELECT project_id FROM public.sponsorship_requests WHERE project_id IS NOT NULL
    )
  );
