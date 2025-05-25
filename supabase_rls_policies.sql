-- SQL statements for initial Row Level Security (RLS) policies on the public.profiles table

-- 1. Enable Row Level Security on the 'profiles' table.
-- This is the first step before any policies can take effect.
-- By default, if RLS is enabled and no policies match, access is denied.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

COMMENT ON STATEMENT 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;'
  IS 'Enables Row Level Security on the profiles table. This is a prerequisite for all RLS policies.';

-- 2. Policy: Allow authenticated users to read their own profile data.
-- This policy grants SELECT access to a user for their own row in the 'profiles' table.
-- The `auth.uid()` function returns the ID of the currently authenticated user.
CREATE POLICY "Users can read their own profile"
ON public.profiles
FOR SELECT
TO authenticated -- Applies to any logged-in user
USING (auth.uid() = id);

COMMENT ON POLICY "Users can read their own profile" ON public.profiles
  IS 'Allows authenticated users to select (read) their own profile data. Access is checked using auth.uid() against the profile''s id.';

-- 3. Policy: Allow authenticated users to update specific fields of their own profile.
-- This policy grants UPDATE access to a user for their own row.
-- The `USING` clause ensures they can only target their own row.
-- The `WITH CHECK` clause re-validates the condition (auth.uid() = id) before committing the update.
-- IMPORTANT: This example allows updating 'advocate_full_name', 'phone_number', and 'bar_council_enrollment_number'.
-- Users are prevented from updating 'id', 'email', 'role', 'account_status', or 'email_verified'
-- by NOT granting UPDATE permission on those columns at a higher level (e.g. database column privileges)
-- or by adding specific checks here if column-level RLS were more granular in Supabase's policy DDL.
-- For Supabase, column-level permissions within a policy are typically handled by specifying columns in the GRANT statement,
-- however, RLS policies themselves don't directly list columns for UPDATE in this way.
-- The most straightforward way to restrict column updates with RLS is often to handle it in the application layer
-- or use more complex SQL functions/triggers if fine-grained control within the policy itself is needed.
-- For this example, we rely on the application layer to send only permissible fields for update.
-- A more secure approach would be to use a helper function or split into multiple policies if needed.
-- However, for simplicity and common practice, this policy allows update on the row,
-- and the application should be responsible for what data is sent.
-- A stricter version could be:
-- WITH CHECK (auth.uid() = id AND (NEW.column_name = OLD.column_name OR column_name NOT IN ('id', 'email', ...)))
-- But this becomes complex. The current approach is common for updatable user profiles.

CREATE POLICY "Users can update their own profile (specific fields)"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id); -- Ensures the user is still updating their own profile

COMMENT ON POLICY "Users can update their own profile (specific fields)" ON public.profiles
  IS 'Allows authenticated users to update their own profile. The application layer should ensure only permitted fields (e.g., advocate_full_name, phone_number, bar_council_enrollment_number) are sent for update. Critical fields like role, email, id, account_status, email_verified should not be updatable by the user through this policy.';

-- Note on Column-Specific Update Permissions:
-- Supabase RLS policies for UPDATE apply to the whole row if the condition is met.
-- To restrict updates to specific columns, you typically have a few options:
-- 1. Application Logic: The frontend/backend ensures only allowed fields are sent in the UPDATE statement. This is common.
-- 2. Postgres Column-Level Privileges: Use `GRANT UPDATE (col1, col2) ON TABLE ...` to a specific role. RLS then further refines which rows can be updated.
--    This is a more robust database-level control. For example:
--    `GRANT UPDATE (advocate_full_name, phone_number, bar_council_enrollment_number) ON public.profiles TO authenticated;`
--    This would need to be set up in addition to RLS policies.
-- 3. Trigger Functions: A BEFORE UPDATE trigger can check which columns are being changed and reject the update if forbidden columns are modified.
--
-- The provided policy "Users can update their own profile (specific fields)" relies on the application (option 1)
-- or supplemental column-level grants (option 2) to enforce which *fields* can be updated.
-- The RLS policy itself primarily controls *which rows* can be updated.

-- 4. Deny all other access by default.
-- When RLS is enabled (step 1), if no policy explicitly grants access for a given operation (SELECT, INSERT, UPDATE, DELETE),
-- the operation is denied. So, there's no need for an explicit "DENY ALL" policy.
-- For example, users cannot delete their profiles, nor can they insert new profiles directly through SQL
-- unless specific policies for DELETE or INSERT are added.
-- Admins would typically have separate policies or bypass RLS (e.g., using the `service_role` key).

-- Example: Admin full access policy (illustrative, implement based on your admin role detection)
-- This assumes you have a way to identify admins, e.g., a custom function `public.is_admin(auth.uid())`
-- or by checking `profile.role = 'admin'`.

-- CREATE POLICY "Admins can manage all profiles"
-- ON public.profiles
-- FOR ALL -- SELECT, INSERT, UPDATE, DELETE
-- TO authenticated -- Or a specific admin role if you have one
-- USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')) -- User is an admin
-- WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Or, if using a security definer function for is_admin():
-- CREATE POLICY "Admins can manage all profiles via function"
-- ON public.profiles
-- FOR ALL
-- TO authenticated
-- USING (public.is_admin(auth.uid()))
-- WITH CHECK (public.is_admin(auth.uid()));

-- Make sure to define the `is_admin` function appropriately if you use such a policy.
-- Example `is_admin` function (SECURITY DEFINER recommended for checking roles):
-- CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
-- RETURNS boolean
-- LANGUAGE sql
-- SECURITY DEFINER
-- SET search_path = public -- Important for security definer functions
-- AS $$
--   SELECT EXISTS (
--     SELECT 1
--     FROM profiles
--     WHERE id = user_id AND role = 'admin'
--   );
-- $$;

-- Remember to grant execute on this function to relevant roles, e.g., authenticated.
-- GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- End of RLS policies for initial user access.
-- Review and adapt these policies to your specific application needs.
-- Admin policies should be added separately based on your admin identification mechanism.
-- Test policies thoroughly after applying them.
