-- ============================================
-- Fix Missing Profiles - For Existing Users
-- 
-- This script creates profiles for users who exist in auth.users
-- but don't have a corresponding entry in public.profiles
-- 
-- Run this in Supabase SQL Editor if you're getting:
-- "violates foreign key constraint responses_user_id_fkey"
-- ============================================

-- Create profiles for all auth users who don't have one
INSERT INTO public.profiles (id, email, full_name, created_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', NULL) as full_name,
    COALESCE(au.created_at, NOW()) as created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Also ensure all auth users have a role assigned
INSERT INTO public.user_roles (user_id, role_id)
SELECT 
    au.id,
    r.id
FROM auth.users au
CROSS JOIN public.roles r
WHERE r.name = 'user'
AND NOT EXISTS (
    SELECT 1 
    FROM public.user_roles ur 
    WHERE ur.user_id = au.id
);

-- ============================================
-- Verification Query
-- Run this to check if all users have profiles
-- ============================================

SELECT 
    au.id,
    au.email,
    CASE 
        WHEN p.id IS NOT NULL THEN '✅ Has Profile'
        ELSE '❌ Missing Profile'
    END as profile_status,
    CASE 
        WHEN ur.user_id IS NOT NULL THEN '✅ Has Role'
        ELSE '❌ Missing Role'
    END as role_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
LEFT JOIN public.user_roles ur ON au.id = ur.user_id
ORDER BY au.created_at DESC;

-- ============================================
-- ✅ Done!
-- ============================================
-- All existing users should now have profiles and roles
-- ============================================

