-- ============================================
-- FriendLens MVP - Supabase Database Setup
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase project: https://app.supabase.com
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New query"
-- 4. Copy and paste this ENTIRE file
-- 5. Click "Run" button (or press Ctrl+Enter)
-- 6. Wait for success message
-- 
-- After running:
-- 1. Sign up on your app
-- 2. Get your user UUID from Authentication → Users
-- 3. Run the "Make Admin" query at the bottom
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES (Extends Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 2. ASSESSMENT_CONFIGS (Optional - for future use)
-- ============================================
CREATE TABLE IF NOT EXISTS public.assessment_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  version TEXT NOT NULL DEFAULT 'NTI_V1', 
  active BOOLEAN DEFAULT true,
  questions JSONB NOT NULL, 
  dimensions JSONB NOT NULL,
  archetypes JSONB NOT NULL, 
  microtypes JSONB NOT NULL, 
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 3. RESPONSES (Raw User inputs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  config_version TEXT NOT NULL DEFAULT 'NTI_V1', 
  raw_answers JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 4. RESULTS (The Final Classified Output)
-- ============================================
CREATE TABLE IF NOT EXISTS public.results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  response_id UUID REFERENCES public.responses(id) NOT NULL,
  user_vector JSONB NOT NULL,
  microtype_id TEXT NOT NULL,
  archetype_id TEXT NOT NULL,
  microtype_tags TEXT[],
  distance_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 5. ROLES (RBAC System)
-- ============================================
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. USER-ROLE JUNCTION TABLE (RBAC)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- ============================================
-- SEED DEFAULT ROLES
-- ============================================
INSERT INTO public.roles (name) VALUES ('admin'), ('user')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Use INSERT ... ON CONFLICT to handle cases where profile might already exist
  INSERT INTO public.profiles (id, email, first_name, last_name, full_name, created_at)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      CASE 
        WHEN NEW.raw_user_meta_data->>'first_name' IS NOT NULL 
          AND NEW.raw_user_meta_data->>'last_name' IS NOT NULL
        THEN (NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name')
        ELSE COALESCE(
          NEW.raw_user_meta_data->>'first_name',
          NEW.raw_user_meta_data->>'last_name',
          ''
        )
      END
    ),
    COALESCE(NEW.created_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to assign default user role on signup
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role_id)
  SELECT NEW.id, id FROM public.roles WHERE name = 'user';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_assign_role ON auth.users;
CREATE TRIGGER on_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- ASSESSMENT_CONFIGS
ALTER TABLE public.assessment_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active configs" ON public.assessment_configs;
CREATE POLICY "Anyone can view active configs" ON public.assessment_configs 
  FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Anyone can insert configs" ON public.assessment_configs;
CREATE POLICY "Anyone can insert configs" ON public.assessment_configs 
  FOR INSERT WITH CHECK (true);

-- RESPONSES
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own responses" ON public.responses;
CREATE POLICY "Users can view own responses" ON public.responses 
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own responses" ON public.responses;
CREATE POLICY "Users can insert own responses" ON public.responses 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RESULTS
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own results" ON public.results;
CREATE POLICY "Users can view own results" ON public.results 
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own results" ON public.results;
CREATE POLICY "Users can insert own results" ON public.results 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ROLES
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view roles" ON public.roles;
CREATE POLICY "Anyone can view roles" ON public.roles 
  FOR SELECT USING (true);

-- USER_ROLES
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin_user BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = check_user_id AND r.name = 'admin'
  ) INTO is_admin_user;
  
  RETURN COALESCE(is_admin_user, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User roles policies
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins view all roles" ON public.user_roles;
CREATE POLICY "Admins view all roles" ON public.user_roles 
  FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles 
  FOR ALL USING (public.is_admin(auth.uid()));

-- ============================================
-- HELPER FUNCTION TO GET USER ROLE
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_role(target_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT r.name INTO user_role
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = target_user_id
  ORDER BY CASE r.name WHEN 'admin' THEN 1 ELSE 2 END
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ✅ SETUP COMPLETE!
-- ============================================
-- Next: Make yourself admin (see below)
-- ============================================

-- ============================================
-- MAKE YOURSELF ADMIN
-- ============================================
-- After signing up, run this query:
-- 1. Go to Authentication → Users in Supabase
-- 2. Copy your user UUID
-- 3. Replace 'YOUR_USER_UUID_HERE' below with your UUID
-- 4. Run this query:
-- ============================================

/*
INSERT INTO public.user_roles (user_id, role_id)
SELECT 'YOUR_USER_UUID_HERE', id FROM public.roles WHERE name = 'admin';
*/

