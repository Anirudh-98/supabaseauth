-- 1. Create the 'profiles' table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    advocate_full_name TEXT,
    bar_council_enrollment_number TEXT,
    phone_number TEXT,
    role TEXT NOT NULL DEFAULT 'User',
    account_status TEXT NOT NULL DEFAULT 'Pending',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comment on table and columns
COMMENT ON TABLE public.profiles IS 'Stores user profile information, extending auth.users.';
COMMENT ON COLUMN public.profiles.id IS 'References the user ID from auth.users.';
COMMENT ON COLUMN public.profiles.email IS 'User''s unique email address.';
COMMENT ON COLUMN public.profiles.advocate_full_name IS 'Full name of the advocate as registered with the Bar Council.';
COMMENT ON COLUMN public.profiles.bar_council_enrollment_number IS 'Bar Council enrollment number, e.g., MAH/1234/2020.';
COMMENT ON COLUMN public.profiles.phone_number IS 'User''s phone number.';
COMMENT ON COLUMN public.profiles.role IS 'User role, e.g., User, Admin.';
COMMENT ON COLUMN public.profiles.account_status IS 'Account status, e.g., Pending, Approved, Rejected.';
COMMENT ON COLUMN public.profiles.email_verified IS 'Indicates if the user''s email has been verified. Synced from auth.users.email_confirmed_at.';
COMMENT ON COLUMN public.profiles.created_at IS 'Timestamp of when the profile was created.';
COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp of when the profile was last updated.';

-- 2. Trigger function to automatically update 'updated_at' on row modification for 'profiles' table
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger to call 'handle_updated_at' before update on 'profiles'
CREATE TRIGGER on_profiles_update_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 4. Trigger function to sync 'email_verified' from 'auth.users'
CREATE OR REPLACE FUNCTION public.sync_profile_email_verification()
RETURNS TRIGGER AS $$
BEGIN
    -- This function is triggered when a row in auth.users is updated or inserted.
    -- It updates the 'profiles' table, setting 'email_verified' based on 'email_confirmed_at'.

    -- For INSERT operations on auth.users, the profile might not exist yet.
    -- The application logic is responsible for creating the profile row.
    -- This trigger will then fire on the subsequent UPDATE to auth.users when email is confirmed.
    -- Or, if the profile is created very quickly, this might catch it.
    -- We primarily care about the UPDATE case (email confirmation).

    UPDATE public.profiles
    SET email_verified = (NEW.email_confirmed_at IS NOT NULL)
    WHERE id = NEW.id;

    -- Also update the email in profiles table if it has changed in auth.users
    -- This is important if the user changes their email address.
    IF NEW.email IS DISTINCT FROM OLD.email THEN
        UPDATE public.profiles
        SET email = NEW.email
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger on 'auth.users' to call 'sync_profile_email_verification'
CREATE TRIGGER on_auth_user_update_sync_profile
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_email_verification();

-- Grant usage on the new functions to supabase_auth_admin_role or relevant roles if needed
-- This might be necessary depending on your Supabase setup and function security.
-- Example:
-- GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO supabase_auth_admin;
-- GRANT EXECUTE ON FUNCTION public.sync_profile_email_verification() TO supabase_auth_admin;

-- Note on initial data and existing users:
-- If you have existing users in 'auth.users' and 'profiles' when applying this,
-- you might need to run a one-time script to update the 'email_verified' status
-- for existing profiles based on the current 'auth.users.email_confirmed_at' values.
-- For example:
-- UPDATE public.profiles p
-- SET email_verified = (SELECT u.email_confirmed_at IS NOT NULL FROM auth.users u WHERE u.id = p.id)
-- WHERE EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);
--
-- Also, ensure existing profiles have their email field correctly populated from auth.users.
-- UPDATE public.profiles p
-- SET email = (SELECT u.email FROM auth.users u WHERE u.id = p.id)
-- WHERE EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id AND p.email IS DISTINCT FROM u.email);

-- Consider table RLS policies for 'profiles' table.
-- Ensure that users can only access/modify their own profiles as needed,
-- and admins have appropriate permissions.
-- e.g., enable RLS on profiles table
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (customize as needed):
-- CREATE POLICY "Users can view their own profile"
-- ON public.profiles FOR SELECT
-- USING (auth.uid() = id);

-- CREATE POLICY "Users can update their own profile (specific fields)"
-- ON public.profiles FOR UPDATE
-- USING (auth.uid() = id)
-- WITH CHECK (auth.uid() = id); -- Add specific columns to the policy if needed

-- CREATE POLICY "Admins can manage all profiles"
-- ON public.profiles FOR ALL
-- USING (public.is_admin(auth.uid())) -- Assuming you have an is_admin function
-- WITH CHECK (public.is_admin(auth.uid()));
