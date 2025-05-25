-- Example RLS Policies for a Hypothetical 'user_articles' Table
--
-- These policies demonstrate how to grant typical CRUD (Create, Read, Update, Delete)
-- access to users for their own records in a data table, contingent on their
-- account status being 'Approved' and their role being 'User' in the 'public.profiles' table.
--
-- Assume 'user_articles' has at least the following columns:
--   id UUID PRIMARY KEY,
--   user_id UUID NOT NULL REFERENCES auth.users(id), -- Links to the user who owns the article
--   title TEXT,
--   content TEXT,
--   created_at TIMESTAMPTZ,
--   updated_at TIMESTAMPTZ
--
-- These policies should be adapted and applied by the user if they create
-- new tables that store user-specific data.

-- 0. (Prerequisite) Create the hypothetical table and ensure RLS is enabled.
--    This part is for context; users would have their own table definitions.
--
-- CREATE TABLE public.user_articles (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--   title TEXT NOT NULL,
--   content TEXT,
--   created_at TIMESTAMPTZ DEFAULT now(),
--   updated_at TIMESTAMPTZ DEFAULT now()
-- );
--
-- ALTER TABLE public.user_articles ENABLE ROW LEVEL SECURITY;
--
-- COMMENT ON TABLE public.user_articles IS 'Hypothetical table storing articles created by users.';
-- COMMENT ON COLUMN public.user_articles.user_id IS 'Owner of the article.';

-- Helper function to check if a user is approved and has the 'User' role.
-- This simplifies the policies and makes them more readable.
-- It's good practice to create such helper functions.
CREATE OR REPLACE FUNCTION public.is_approved_user(p_user_id uuid)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER -- Important for accessing 'profiles' table securely
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = p_user_id
      AND account_status = 'approved'
      AND role = 'User'
  );
$$;

COMMENT ON FUNCTION public.is_approved_user(uuid) IS 'Checks if a user is an approved user based on their profile status and role.';
-- Grant execute on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_approved_user(uuid) TO authenticated;


-- 1. SELECT Policy: Users can select (read) their own articles.
-- This policy allows users to fetch only the articles where their `auth.uid()`
-- matches the `user_id` column, and they are an 'Approved' 'User'.
CREATE POLICY "Users can select their own articles if approved"
ON public.user_articles
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id AND
    public.is_approved_user(auth.uid())
);

COMMENT ON POLICY "Users can select their own articles if approved" ON public.user_articles
  IS 'Allows authenticated users who are approved and have the ''User'' role to select (read) their own articles.';


-- 2. INSERT Policy: Users can insert (create) new articles for themselves.
-- This policy allows 'Approved' 'User's to insert new articles.
-- The `WITH CHECK` clause ensures that the `user_id` of the new article
-- is set to the ID of the currently authenticated user.
CREATE POLICY "Users can insert their own articles if approved"
ON public.user_articles
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id AND
    public.is_approved_user(auth.uid())
);

COMMENT ON POLICY "Users can insert their own articles if approved" ON public.user_articles
  IS 'Allows authenticated users who are approved and have the ''User'' role to insert new articles, ensuring user_id matches their own ID.';


-- 3. UPDATE Policy: Users can update their own articles.
-- This policy allows 'Approved' 'User's to update articles where their `auth.uid()`
-- matches the `user_id` column.
-- The `USING` clause restricts which rows can be targeted by an UPDATE.
-- The `WITH CHECK` clause ensures that the `user_id` cannot be changed to
-- another user's ID during the update (maintaining ownership).
CREATE POLICY "Users can update their own articles if approved"
ON public.user_articles
FOR UPDATE
TO authenticated
USING (
    auth.uid() = user_id AND
    public.is_approved_user(auth.uid())
)
WITH CHECK (
    auth.uid() = user_id -- Ensures ownership is maintained
    -- The check for is_approved_user is implicitly covered by the USING clause for existing rows.
    -- If an admin could change the status/role while an update is in flight,
    -- adding it to WITH CHECK could be beneficial: AND public.is_approved_user(auth.uid())
);

COMMENT ON POLICY "Users can update their own articles if approved" ON public.user_articles
  IS 'Allows authenticated users who are approved and have the ''User'' role to update their own articles. Ensures ownership is maintained.';


-- 4. DELETE Policy: Users can delete their own articles.
-- This policy allows 'Approved' 'User's to delete articles where their `auth.uid()`
-- matches the `user_id` column.
CREATE POLICY "Users can delete their own articles if approved"
ON public.user_articles
FOR DELETE
TO authenticated
USING (
    auth.uid() = user_id AND
    public.is_approved_user(auth.uid())
);

COMMENT ON POLICY "Users can delete their own articles if approved" ON public.user_articles
  IS 'Allows authenticated users who are approved and have the ''User'' role to delete their own articles.';

-- General Notes for Adapting These Policies:
--
-- a. Table and Column Names: Replace 'user_articles' with the actual table name.
--    Replace 'user_id' with the actual column name that stores the user's ID.
--
-- b. Helper Function: The `public.is_approved_user(auth.uid())` check relies on the
--    `profiles` table having `account_status` and `role` columns. Ensure this function
--    is created or adapt the logic directly into each policy if preferred (though less DRY).
--    Remember to grant EXECUTE on the helper function to the `authenticated` role.
--
-- c. Specific Needs: These are common CRUD policies. Your application might have
--    more complex requirements, such as allowing other users to read certain articles
--    (e.g., public articles) or collaborative editing, which would require
--    additional or different RLS policies.
--
-- d. Admin Access: These policies do not explicitly grant admins access to all articles.
--    If admins need to manage all user articles, a separate policy for admins would be required,
--    similar to the "Admins can manage all profiles" policy created earlier.
--    Example for admins on 'user_articles':
--
--    CREATE POLICY "Admins can manage all user_articles"
--    ON public.user_articles
--    FOR ALL
--    TO authenticated -- Or a specific admin role
--    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
--    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
--
-- e. Testing: Always test RLS policies thoroughly after applying them to ensure they
--    work as expected and don't inadvertently block or allow access.
--
-- To use these templates:
-- 1. Define your data table (e.g., `CREATE TABLE your_table_name (...)`).
-- 2. Enable RLS on it (`ALTER TABLE your_table_name ENABLE ROW LEVEL SECURITY;`).
-- 3. Adapt and apply the SELECT, INSERT, UPDATE, DELETE policies above,
--    changing 'user_articles' and 'user_id' as needed.
-- 4. Ensure the `public.is_approved_user` helper function is in place or integrate its logic.
-- 5. Add any necessary admin access policies.
-- 6. Test rigorously.
