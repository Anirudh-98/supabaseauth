-- SQL statement to create the 'public.user_notifications' table
-- This table is designed to store in-app notifications for users.

CREATE TABLE public.user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    link_to TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comments on the table and its columns
COMMENT ON TABLE public.user_notifications
  IS 'Stores in-app notifications for users.';

COMMENT ON COLUMN public.user_notifications.id
  IS 'Unique identifier for the notification.';
COMMENT ON COLUMN public.user_notifications.user_id
  IS 'The ID of the user who this notification is for. References auth.users(id).';
COMMENT ON COLUMN public.user_notifications.type
  IS 'Type of notification (e.g., ''account_approved'', ''new_message'', ''system_alert'').';
COMMENT ON COLUMN public.user_notifications.message
  IS 'The content of the notification message.';
COMMENT ON COLUMN public.user_notifications.link_to
  IS 'Optional URL path for the notification to link to (e.g., ''/orders/123'').';
COMMENT ON COLUMN public.user_notifications.is_read
  IS 'Indicates whether the user has read the notification. Defaults to false.';
COMMENT ON COLUMN public.user_notifications.created_at
  IS 'Timestamp of when the notification was created. Defaults to the current time.';

-- Optional: Consider an index on user_id and created_at for efficient querying of a user's notifications.
-- CREATE INDEX idx_user_notifications_user_id_created_at ON public.user_notifications(user_id, created_at DESC);

-- Optional: Consider an index on user_id and is_read for efficiently querying unread notifications.
-- CREATE INDEX idx_user_notifications_user_id_is_read ON public.user_notifications(user_id, is_read);
