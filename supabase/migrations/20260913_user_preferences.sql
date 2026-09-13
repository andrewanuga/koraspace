-- ============================================================
-- Migration: User Preferences & Personalization Architecture
-- Version: 1.76
-- Author: Koraspace Platform Team
-- Description: Stores user personalization choices for analytics style,
--              font typography, theme appearance, and dashboard density.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  analytics_style TEXT NOT NULL DEFAULT 'auto'
    CHECK (analytics_style IN ('auto', 'line', 'bar', 'area', 'donut', 'scatter', 'funnel', 'radar')),
  font_family TEXT NOT NULL DEFAULT 'inter'
    CHECK (font_family IN ('inter', 'geist', 'dm-sans', 'manrope', 'plus-jakarta', 'space-grotesk', 'ibm-plex')),
  theme_mode TEXT NOT NULL DEFAULT 'dark'
    CHECK (theme_mode IN ('dark', 'light', 'system')),
  dashboard_density TEXT NOT NULL DEFAULT 'balanced'
    CHECK (dashboard_density IN ('minimal', 'balanced', 'detailed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for speedy lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;

-- RLS Policies
CREATE POLICY "Users can read own preferences"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER trigger_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_preferences_updated_at();