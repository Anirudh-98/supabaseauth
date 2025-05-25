-- SQL statements for Row Level Security (RLS) policies and
-- column-level permissions on the public.user_notifications table.

-- 1. Enable Row Level Security on the 'user_notifications' table.
-- This is the first step before any policies can take effect.
-- By default, if RLS is enabled and no policies match, access is denied.
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

COMMENT ON STATEMENT 'ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;'
  IS 'Enables Row Level Security on the user_notifications table. This is a prerequisite for all RLS policies.';

-- 2. SELECT Policy for Users: Allow users to read their own notifications.
-- This policy grants SELECT access to a user for their own rows in the 'user_notifications' table.
-- The `auth.uid()` function returns the ID of the currently authenticated user.
CREATE POLICY "Users can read their own notifications"
ON public.user_notifications
FOR SELECT
TO authenticated -- Applies to any logged-in user
USING (auth.uid() = user_id);

COMMENT ON POLICY "Users can read their own notifications" ON public.user_notifications
  IS 'Allows authenticated users to select (read) their own notifications. Access is checked using auth.uid() against the notification''s user_id.';

-- 3. UPDATE Policy for Users: Allow users to update the 'is_read' status of their own notifications.
-- This policy grants UPDATE access to a user for their own notifications.
-- The `USING` clause ensures they can only target their own rows.
-- The `WITH CHECK` clause re-validates the condition (auth.uid() = user_id), ensuring
-- that a user cannot attempt to change the `user_id` of a notification to make it someone else's.
CREATE POLICY "Users can update 'is_read' status on their own notifications"
ON public.user_notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "Users can update 'is_read' status on their own notifications" ON public.user_notifications
  IS 'Allows authenticated users to update notifications belonging to them. The primary use case is updating the ''is_read'' status. Column-level grants will restrict which columns can be updated.';

-- 4. Column-Level Permissions for Users
-- These GRANT statements work in conjunction with RLS policies.
-- RLS determines *which rows* a user can access, while column-level permissions
-- determine *what operations* (SELECT, INSERT, UPDATE, DELETE) they can perform on *which columns* of those rows.

-- Grant SELECT on all columns of the rows they are permitted to see by RLS.
GRANT SELECT ON public.user_notifications TO authenticated;
COMMENT ON STATEMENT 'GRANT SELECT ON public.user_notifications TO authenticated;'
  IS 'Grants general SELECT permission on all columns of user_notifications to authenticated users. RLS policies will restrict row access.';

-- Grant UPDATE permission specifically on the 'is_read' column for rows they are permitted to update by RLS.
-- This prevents users from updating other fields like 'message', 'type', 'link_to', or 'user_id' (which is also covered by WITH CHECK).
GRANT UPDATE (is_read) ON public.user_notifications TO authenticated;
COMMENT ON STATEMENT 'GRANT UPDATE (is_read) ON public.user_notifications TO authenticated;'
  IS 'Grants specific UPDATE permission on the ''is_read'' column of user_notifications to authenticated users. RLS policies will restrict row access and ensure user_id integrity.';

-- By default, the 'authenticated' role does not have INSERT or DELETE permissions on new tables
-- unless explicitly granted. Therefore, explicit REVOKE statements for INSERT or DELETE are usually not needed
-- if they were never granted in the first place.
-- If broader UPDATE permissions were somehow granted earlier (e.g., `GRANT UPDATE ON public.user_notifications TO authenticated;`),
-- you might first revoke that and then apply the specific column grant:
-- REVOKE UPDATE ON public.user_notifications FROM authenticated;
-- GRANT UPDATE (is_read) ON public.user_notifications TO authenticated;

-- Operations like INSERT and DELETE are implicitly denied for the 'authenticated' role
-- because no corresponding RLS policies granting these operations are defined for them,
-- and no broad INSERT/DELETE grants are made at the table level to this role.
-- Notifications are typically created by the system (e.g., via triggers or backend logic using service_role).

-- 5. Admin Access Policy (Optional but Recommended)
-- This policy allows users who have the 'admin' role in their 'public.profiles'
-- to perform any operation (SELECT, INSERT, UPDATE, DELETE) on any row in the 'user_notifications' table.
CREATE POLICY "Admins can manage all notifications"
ON public.user_notifications
FOR ALL -- Applies to SELECT, INSERT, UPDATE, DELETE
TO authenticated -- This policy applies to any authenticated user
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

COMMENT ON POLICY "Admins can manage all notifications" ON public.user_notifications
  IS 'Grants full CRUD (SELECT, INSERT, UPDATE, DELETE) access on the user_notifications table to users whose own profile has role = ''admin''.';

-- If using the admin policy above for authenticated admin users, they will be able to use their
-- regular session to manage notifications.
-- For operations performed by backend processes or the system itself (e.g., a trigger creating a notification),
-- those operations typically use the `service_role` which bypasses RLS policies by default.
-- If you need to explicitly grant permissions to `service_role` (though often not necessary if it bypasses RLS):
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_notifications TO service_role;
-- COMMENT ON STATEMENT 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_notifications TO service_role;'
--  IS 'Grants full CRUD permissions on user_notifications to the service_role, which typically bypasses RLS.';


-- Important Considerations:
-- a. Test Thoroughly: After applying these policies and grants, test them with different
--    user roles (regular authenticated user, admin user) to ensure they behave as expected.
-- b. Security of 'profiles.role': The admin policy relies on the 'role' column in the
--    'public.profiles' table. Ensure this column is properly managed and secured.
-- c. `service_role`: Remember that operations performed using the `service_role` key
--    (typically from trusted backend environments or Supabase dashboard) bypass RLS by default.
--    This is often how system-generated notifications would be inserted.

-- To apply these statements, execute them in the Supabase SQL Editor for your project.
