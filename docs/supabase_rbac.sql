-- RBAC Schema for FriendLens
-- Run this after the main supabase_setup.sql

-- ============================================
-- STEP 1: ROLES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 2: USER-ROLE JUNCTION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- ============================================
-- STEP 3: SEED DEFAULT ROLES
-- ============================================

INSERT INTO public.roles (name) VALUES ('admin'), ('user')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- STEP 4: AUTO-ASSIGN USER ROLE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role_id)
  SELECT NEW.id, id FROM public.roles WHERE name = 'user';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_user_created_assign_role ON auth.users;

-- Create trigger
CREATE TRIGGER on_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- ============================================
-- STEP 5: RLS POLICIES
-- ============================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Anyone can view roles (needed for lookups)
DROP POLICY IF EXISTS "Anyone can view roles" ON public.roles;
CREATE POLICY "Anyone can view roles" ON public.roles 
  FOR SELECT USING (true);

-- Users can view their own roles
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles 
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage all user roles
DROP POLICY IF EXISTS "Admins manage all roles" ON public.user_roles;
CREATE POLICY "Admins manage all roles" ON public.user_roles 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- ============================================
-- STEP 6: HELPER FUNCTION TO GET USER ROLE
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
-- MANUAL: PROMOTE FIRST ADMIN
-- Run this with your user ID after signing up:
-- 
-- INSERT INTO user_roles (user_id, role_id)
-- SELECT 'YOUR_USER_UUID_HERE', id FROM roles WHERE name = 'admin';
-- ============================================
