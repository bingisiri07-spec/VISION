-- ==============================================================================
-- VISION Migration 003: Startup Naming & Venture Workflow Optimization
-- ==============================================================================

-- Add startup_name, last_active_stage, and last_active_at to projects table
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS startup_name TEXT,
  ADD COLUMN IF NOT EXISTS last_active_stage TEXT DEFAULT 'Overview',
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill startup_name with title if currently NULL
UPDATE public.projects
SET startup_name = title
WHERE startup_name IS NULL AND title IS NOT NULL;

-- Index for sorting ventures by last active time
CREATE INDEX IF NOT EXISTS idx_projects_last_active_at ON public.projects(last_active_at DESC);
