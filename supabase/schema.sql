-- ==============================================================================
-- VISION Platform: Complete Database Schema Migration
-- Compatible with Supabase PostgreSQL (Supports RLS, Auth Cascades & JSONB)
-- ==============================================================================

-- 1. UTILITY EXTENSIONS & FUNCTIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically update the 'updated_at' timestamp column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- A. PROFILES (Extends Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger to auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ------------------------------------------------------------------------------
-- B. PROJECTS (Founder Projects / Problem Statements)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Venture',
  domain TEXT NOT NULL DEFAULT 'technology',
  problem_statement TEXT NOT NULL,
  affected_audience TEXT,
  constraints TEXT,
  goals TEXT,
  journey_started BOOLEAN DEFAULT FALSE NOT NULL,
  journey_started_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ------------------------------------------------------------------------------
-- C. IDEAS (Synthesized Startup Opportunities)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tagline TEXT,
  category TEXT,
  problem_addressed TEXT,
  target_audience TEXT,
  solution TEXT,
  unique_value_prop TEXT,
  feasibility TEXT DEFAULT 'Medium',
  feasibility_score INTEGER DEFAULT 75,
  major_challenges JSONB DEFAULT '[]'::jsonb,
  revenue_models JSONB DEFAULT '[]'::jsonb,
  validation_steps JSONB DEFAULT '[]'::jsonb,
  is_selected BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ------------------------------------------------------------------------------
-- D. ROADMAPS (Phased Implementation Plan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID UNIQUE NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE SET NULL,
  overview JSONB DEFAULT '{}'::jsonb NOT NULL,
  funding_options JSONB DEFAULT '[]'::jsonb NOT NULL,
  phases_summary JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DROP TRIGGER IF EXISTS set_roadmaps_updated_at ON public.roadmaps;
CREATE TRIGGER set_roadmaps_updated_at
  BEFORE UPDATE ON public.roadmaps
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ------------------------------------------------------------------------------
-- E. TASKS (Execution Checklist & Milestones)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase_id TEXT DEFAULT 'phase_1' NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Validation' NOT NULL,
  estimated_days INTEGER DEFAULT 2 NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  completed_at TIMESTAMPTZ,
  is_custom BOOLEAN DEFAULT FALSE NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ------------------------------------------------------------------------------
-- F. BUDGETS (Financial Architecture & Allocations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID UNIQUE NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  available_budget NUMERIC DEFAULT 1500 NOT NULL,
  runway_months INTEGER DEFAULT 3 NOT NULL,
  team_size INTEGER DEFAULT 1 NOT NULL,
  hours_per_week INTEGER DEFAULT 20 NOT NULL,
  monthly_burn NUMERIC DEFAULT 500 NOT NULL,
  allocations JSONB DEFAULT '[]'::jsonb NOT NULL,
  essential_expenses JSONB DEFAULT '[]'::jsonb NOT NULL,
  optional_expenses JSONB DEFAULT '[]'::jsonb NOT NULL,
  free_alternatives JSONB DEFAULT '[]'::jsonb NOT NULL,
  financial_risks JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DROP TRIGGER IF EXISTS set_budgets_updated_at ON public.budgets;
CREATE TRIGGER set_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ------------------------------------------------------------------------------
-- G. DECISIONS (Simulator Forks & Strategic Trade-Offs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL,
  title TEXT NOT NULL,
  chosen_option TEXT NOT NULL,
  chosen_option_key TEXT NOT NULL,
  user_notes TEXT,
  recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ------------------------------------------------------------------------------
-- H. NOTES (Founder Work Log & Reflections)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ------------------------------------------------------------------------------
-- I. CHAT_MESSAGES (AI Co-Pilot Context History)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ==============================================================================
-- 3. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_project_id ON public.ideas(project_id);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON public.ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_project_id ON public.roadmaps(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_project_id ON public.budgets(project_id);
CREATE INDEX IF NOT EXISTS idx_decisions_project_id ON public.decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_project_id ON public.notes(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON public.chat_messages(project_id);


-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- PROJECTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- IDEAS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own ideas" ON public.ideas;
CREATE POLICY "Users can view own ideas"
  ON public.ideas FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own ideas" ON public.ideas;
CREATE POLICY "Users can insert own ideas"
  ON public.ideas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ideas" ON public.ideas;
CREATE POLICY "Users can update own ideas"
  ON public.ideas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own ideas" ON public.ideas;
CREATE POLICY "Users can delete own ideas"
  ON public.ideas FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- ROADMAPS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own roadmaps" ON public.roadmaps;
CREATE POLICY "Users can view own roadmaps"
  ON public.roadmaps FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own roadmaps" ON public.roadmaps;
CREATE POLICY "Users can insert own roadmaps"
  ON public.roadmaps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own roadmaps" ON public.roadmaps;
CREATE POLICY "Users can update own roadmaps"
  ON public.roadmaps FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own roadmaps" ON public.roadmaps;
CREATE POLICY "Users can delete own roadmaps"
  ON public.roadmaps FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- TASKS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- BUDGETS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
CREATE POLICY "Users can view own budgets"
  ON public.budgets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
CREATE POLICY "Users can insert own budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
CREATE POLICY "Users can update own budgets"
  ON public.budgets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
CREATE POLICY "Users can delete own budgets"
  ON public.budgets FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- DECISIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own decisions" ON public.decisions;
CREATE POLICY "Users can view own decisions"
  ON public.decisions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own decisions" ON public.decisions;
CREATE POLICY "Users can insert own decisions"
  ON public.decisions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own decisions" ON public.decisions;
CREATE POLICY "Users can update own decisions"
  ON public.decisions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own decisions" ON public.decisions;
CREATE POLICY "Users can delete own decisions"
  ON public.decisions FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- NOTES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own notes" ON public.notes;
CREATE POLICY "Users can view own notes"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
CREATE POLICY "Users can insert own notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
CREATE POLICY "Users can update own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;
CREATE POLICY "Users can delete own notes"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- CHAT_MESSAGES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view own chat messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_messages;
CREATE POLICY "Users can insert own chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own chat messages" ON public.chat_messages;
CREATE POLICY "Users can delete own chat messages"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = user_id);


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
