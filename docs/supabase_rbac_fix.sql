-- FIX: RBAC Infinite Recursion Fix
-- Run this in Supabase SQL Editor to fix the RLS policy issue

-- ============================================
-- STEP 1: Drop the problematic policy
-- ============================================

DROP POLICY IF EXISTS "Admins manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;

-- ============================================
-- STEP 2: Create a security definer function
-- This bypasses RLS to check if user is admin
-- ============================================

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

-- ============================================
-- STEP 3: Create fixed RLS policies
-- ============================================

-- Users can view their own roles (no recursion)
CREATE POLICY "Users view own roles" ON public.user_roles 
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all roles (uses security definer function)
CREATE POLICY "Admins view all roles" ON public.user_roles 
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Admins can insert/update/delete roles (uses security definer function)
CREATE POLICY "Admins manage roles" ON public.user_roles 
  FOR ALL USING (public.is_admin(auth.uid()));

-- ============================================
-- DONE! Refresh the page to test admin access
-- ============================================
