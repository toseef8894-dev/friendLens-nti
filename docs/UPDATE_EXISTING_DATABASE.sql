-- ============================================
-- Update Existing Database - Add First/Last Name
-- 
-- Run this if you already have a database set up
-- and want to add first_name and last_name columns
-- ============================================

-- Add first_name and last_name columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Migrate existing full_name data (if any)
-- This splits full_name into first_name and last_name
UPDATE public.profiles
SET 
    first_name = CASE 
        WHEN full_name IS NOT NULL AND full_name != '' THEN
            CASE 
                WHEN position(' ' in full_name) > 0 THEN
                    substring(full_name from 1 for position(' ' in full_name) - 1)
                ELSE full_name
            END
        ELSE NULL
    END,
    last_name = CASE 
        WHEN full_name IS NOT NULL AND full_name != '' THEN
            CASE 
                WHEN position(' ' in full_name) > 0 THEN
                    substring(full_name from position(' ' in full_name) + 1)
                ELSE NULL
            END
        ELSE NULL
    END
WHERE (first_name IS NULL OR last_name IS NULL) 
  AND full_name IS NOT NULL 
  AND full_name != '';

-- Update the trigger function to handle first_name and last_name
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
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
        ELSE COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name')
      END
    ),
    timezone('utc'::text, now())
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ✅ Done!
-- ============================================
-- The profiles table now has first_name and last_name columns
-- Existing full_name data has been migrated
-- ============================================

