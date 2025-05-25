-- SQL statement for an RLS policy granting full access to 'public.profiles' for admin users.

-- This policy allows users who have the 'admin' role in their own profile
-- to perform any operation (SELECT, INSERT, UPDATE, DELETE) on any row in the 'public.profiles' table.

-- It is crucial that the 'role' column in the 'profiles' table is properly managed
-- and can only be set to 'admin' by a trusted process (e.g., a superuser or a secure backend function).

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL -- Applies to SELECT, INSERT, UPDATE, DELETE
TO authenticated -- This policy applies to any authenticated user
USING (
    -- The USING clause defines which rows an operation can apply to (for SELECT, UPDATE, DELETE)
    -- or which rows can be returned (for SELECT).
    -- For INSERT, if the USING clause is true (or not present), the INSERT can proceed.
    -- This condition checks if the currently authenticated user has an 'admin' role.
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    -- The WITH CHECK clause is enforced for INSERT and UPDATE operations.
    -- It ensures that new or updated rows satisfy the condition.
    -- In this case, it re-validates that the user performing the action is indeed an admin.
    -- While somewhat redundant for an admin policy that grants access to all rows,
    -- it's good practice and aligns with how RLS policies are structured.
    -- For INSERTs by an admin, this check effectively means "an admin must be performing this insert".
    -- For UPDATEs by an admin, this check means "an admin must be performing this update".
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

COMMENT ON POLICY "Admins can manage all profiles" ON public.profiles
  IS 'Grants full CRUD (SELECT, INSERT, UPDATE, DELETE) access on the profiles table to users whose own profile has role = ''admin''. This allows admins to manage all user profiles.';

-- Important Considerations:
-- 1. Security of the 'role' column: Ensure that only authorized personnel or secure
--    server-side logic can assign the 'admin' role to a user in the 'profiles' table.
--    If any user can set their own role to 'admin', this policy would grant them full access.
--
-- 2. Coexistence with other policies: This policy is permissive. If a user is an admin,
--    they will be granted access by this policy, regardless of other more restrictive policies
--    (like "Users can read their own profile"). If a user is NOT an admin, this policy
--    will not apply to them, and other policies (e.g., for self-service) will be evaluated.
--
-- 3. Test Thoroughly: After applying this policy, test it with both admin and non-admin
--    users to ensure it behaves as expected and that non-admins cannot perform admin actions.
--
-- To apply this policy, execute this SQL statement in the Supabase SQL Editor
-- for your project.
