-- ============================================
-- FIX: RLS Policy Error - "new row violates row-level security policy"
-- ============================================
-- This script adds the missing INSERT policy for the profiles table
-- ============================================

-- Add INSERT policy for profiles (allows users to create their own profile)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Verify the policy was created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname = 'Users can insert own profile';

-- Success message
SELECT '✅ RLS INSERT policy added successfully!' as status;

