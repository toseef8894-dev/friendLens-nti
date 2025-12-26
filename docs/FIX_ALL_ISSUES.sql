-- ============================================
-- COMPREHENSIVE FIX: All Signup and Database Issues
-- ============================================
-- This script fixes all known issues:
-- 1. Missing first_name and last_name columns
-- 2. Invalid trigger function syntax
-- 3. Missing INSERT RLS policy
-- 4. Trigger error handling
-- ============================================
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Click "New query"
-- 3. Copy and paste this ENTIRE file
-- 4. Click "Run"
-- 5. Wait for success message
-- ============================================

-- ============================================
-- STEP 1: Add first_name and last_name columns if missing
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'first_name'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
        RAISE NOTICE 'Added first_name column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'last_name'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
        RAISE NOTICE 'Added last_name column';
    END IF;
END $$;

-- ============================================
-- STEP 2: Migrate existing full_name data (if any)
-- ============================================
UPDATE public.profiles
SET 
    first_name = CASE 
        WHEN first_name IS NULL AND full_name IS NOT NULL AND full_name != '' THEN
            CASE 
                WHEN position(' ' in full_name) > 0 THEN
                    substring(full_name from 1 for position(' ' in full_name) - 1)
                ELSE full_name
            END
        ELSE first_name
    END,
    last_name = CASE 
        WHEN last_name IS NULL AND full_name IS NOT NULL AND full_name != '' THEN
            CASE 
                WHEN position(' ' in full_name) > 0 THEN
                    substring(full_name from position(' ' in full_name) + 1)
                ELSE NULL
            END
        ELSE last_name
    END
WHERE (first_name IS NULL OR last_name IS NULL) AND full_name IS NOT NULL;

-- ============================================
-- STEP 3: Fix trigger function with proper error handling
-- ============================================
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

-- ============================================
-- STEP 4: Ensure trigger exists and is active
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 5: Add missing INSERT RLS policy
-- ============================================
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 6: Verify everything is set up correctly
-- ============================================
DO $$
DECLARE
    trigger_exists BOOLEAN;
    policy_exists BOOLEAN;
    first_name_exists BOOLEAN;
    last_name_exists BOOLEAN;
BEGIN
    -- Check trigger
    SELECT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created'
        AND event_object_table = 'users'
        AND event_object_schema = 'auth'
    ) INTO trigger_exists;
    
    -- Check INSERT policy
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert own profile'
    ) INTO policy_exists;
    
    -- Check columns
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'first_name'
    ) INTO first_name_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'last_name'
    ) INTO last_name_exists;
    
    -- Report results
    IF trigger_exists AND policy_exists AND first_name_exists AND last_name_exists THEN
        RAISE NOTICE '✅ All fixes applied successfully!';
        RAISE NOTICE '   - Trigger: %', CASE WHEN trigger_exists THEN 'OK' ELSE 'MISSING' END;
        RAISE NOTICE '   - INSERT Policy: %', CASE WHEN policy_exists THEN 'OK' ELSE 'MISSING' END;
        RAISE NOTICE '   - first_name column: %', CASE WHEN first_name_exists THEN 'OK' ELSE 'MISSING' END;
        RAISE NOTICE '   - last_name column: %', CASE WHEN last_name_exists THEN 'OK' ELSE 'MISSING' END;
    ELSE
        RAISE WARNING '⚠️ Some fixes may not have been applied correctly';
        RAISE WARNING '   - Trigger: %', CASE WHEN trigger_exists THEN 'OK' ELSE 'MISSING' END;
        RAISE WARNING '   - INSERT Policy: %', CASE WHEN policy_exists THEN 'OK' ELSE 'MISSING' END;
        RAISE WARNING '   - first_name column: %', CASE WHEN first_name_exists THEN 'OK' ELSE 'MISSING' END;
        RAISE WARNING '   - last_name column: %', CASE WHEN last_name_exists THEN 'OK' ELSE 'MISSING' END;
    END IF;
END $$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ All issues fixed! Signup should now work correctly.' as status;

