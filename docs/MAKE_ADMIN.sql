-- ============================================
-- Make User Admin - Quick Reference
-- ============================================
-- 
-- INSTRUCTIONS:
-- 1. Go to Supabase → Authentication → Users
-- 2. Find your user and copy the UUID (the long string)
-- 3. Replace 'YOUR_USER_UUID_HERE' below with your UUID
-- 4. Run this query in Supabase SQL Editor
-- ============================================

INSERT INTO public.user_roles (user_id, role_id)
SELECT 'YOUR_USER_UUID_HERE', id FROM public.roles WHERE name = 'admin';

-- ============================================
-- Example:
-- If your UUID is: 123e4567-e89b-12d3-a456-426614174000
-- Then run:
-- ============================================

-- INSERT INTO public.user_roles (user_id, role_id)
-- SELECT '123e4567-e89b-12d3-a456-426614174000', id FROM public.roles WHERE name = 'admin';

-- ============================================
-- Verify it worked:
-- ============================================

-- SELECT 
--     au.email,
--     r.name as role
-- FROM auth.users au
-- JOIN public.user_roles ur ON au.id = ur.user_id
-- JOIN public.roles r ON ur.role_id = r.id
-- WHERE au.id = 'YOUR_USER_UUID_HERE';

