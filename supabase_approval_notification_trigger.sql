-- SQL for creating an in-app notification when a user's account is approved.

-- 1. Trigger Function: public.create_approval_notification_trigger_func()
-- This function is executed when the 'account_status' on 'public.profiles' is updated.
-- It creates an in-app notification if the account status changes to 'approved'.

CREATE OR REPLACE FUNCTION public.create_approval_notification_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    user_full_name TEXT;
    notification_message TEXT;
BEGIN
    -- Check if the account_status has just been changed to 'approved'.
    -- This ensures the notification is created only on the transition to 'approved'.
    IF NEW.account_status = 'approved' AND OLD.account_status IS DISTINCT FROM 'approved' THEN

        -- Get the user's full name for a personalized message.
        -- Fallback to 'User' if advocate_full_name is null or empty.
        user_full_name := COALESCE(NULLIF(TRIM(NEW.advocate_full_name), ''), 'User');

        -- Construct the notification message.
        notification_message := 'Congratulations, ' || user_full_name || '! Your account has been approved.';

        -- Attempt to insert the new notification into public.user_notifications.
        BEGIN
            INSERT INTO public.user_notifications (user_id, type, message, link_to)
            VALUES (NEW.id, 'account_approved', notification_message, '/dashboard');

            RAISE NOTICE 'In-app notification created for user % (ID: %) due to account approval.', user_full_name, NEW.id;
        EXCEPTION
            WHEN OTHERS THEN
                -- If an error occurs during the notification insertion,
                -- catch it and raise a notice. This prevents the failure of
                -- notification creation from rolling back the original UPDATE
                -- on the 'profiles' table.
                RAISE NOTICE 'Error creating in-app notification for user % (ID: %): %', user_full_name, NEW.id, SQLERRM;
                -- Consider logging this error to a dedicated error log table if robust tracking is needed.
        END;
    END IF;

    -- Return the NEW row to allow the original UPDATE operation to proceed.
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.create_approval_notification_trigger_func()
  IS 'Trigger function to create an in-app notification in ''user_notifications'' when a user''s ''account_status'' in ''profiles'' is changed to ''approved''.';


-- 2. Trigger: on_profile_approved_create_notification
-- This trigger fires after the 'account_status' column in 'public.profiles' is updated.
-- It executes the 'public.create_approval_notification_trigger_func' for each updated row.

CREATE TRIGGER on_profile_approved_create_notification
AFTER UPDATE OF account_status ON public.profiles -- Only fire if account_status is in the SET clause
FOR EACH ROW
EXECUTE FUNCTION public.create_approval_notification_trigger_func();

COMMENT ON TRIGGER on_profile_approved_create_notification ON public.profiles
  IS 'When the account_status of a profile is updated, executes create_approval_notification_trigger_func() to potentially create an in-app notification upon approval.';

-- Before applying:
-- 1. Ensure the 'public.user_notifications' table exists with the required columns (user_id, type, message, link_to).
-- 2. Test this trigger thoroughly in a development environment.
-- 3. The `AFTER UPDATE OF account_status` clause is an optimization. If your Postgres version doesn't support it well
--    or if you want to trigger on any update that might include an approval (even if other fields changed too),
--    you can simplify to `AFTER UPDATE ON public.profiles`. However, the current form is more specific.
