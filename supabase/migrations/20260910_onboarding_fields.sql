-- ============================================================
-- Version 1.74: Onboarding & Workspace Personalization Schema
-- Adds complete onboarding fields to public.profiles
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_goals text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_platforms text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS content_formats text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_audience text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS automation_level text;

-- Ensure RLS allows users to update their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'users can update own profile'
  ) THEN
    CREATE POLICY "users can update own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
