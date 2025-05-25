import { create } from 'zustand';
import { supabase } from '../lib/supabase'; // Adjust path as needed
import { AuthUser } from '@supabase/supabase-js'; // Assuming AuthUser type is available or use any

// 1. Types
export interface ProfileNotification {
  id: string; // UUID
  user_id: string; // UUID, references auth.users
  type: string; // e.g., 'account_approved', 'new_message', 'system_alert'
  message: string;
  link_to?: string | null; // Optional URL path
  is_read: boolean;
  created_at: string; // TIMESTAMPTZ
}

interface NotificationState {
  notifications: ProfileNotification[];
  unreadCount: number;
  isLoading: boolean;
  hasFetchedInitialNotifications: boolean;

  // Actions
  fetchNotifications: (currentUser: AuthUser | null) => Promise<void>;
  markAsRead: (notificationId: string, currentUser: AuthUser | null) => Promise<void>;
  markAllAsRead: (currentUser: AuthUser | null) => Promise<void>;
  getUnreadApprovalNotification: () => ProfileNotification | null;
  markSpecificNotificationAsRead: (notificationId: string, currentUser: AuthUser | null) => Promise<void>;
  subscribeToNewNotifications: (currentUser: AuthUser | null) => () => void; // Returns unsubscribe function
  resetNotificationState: () => void; // For logout
}

// Max number of notifications to fetch initially
const NOTIFICATION_LIMIT = 20;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // 2. Initial State
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  hasFetchedInitialNotifications: false,

  // 3. Actions
  fetchNotifications: async (currentUser) => {
    if (!currentUser) {
      console.log('fetchNotifications: No current user, skipping fetch.');
      set({ isLoading: false, hasFetchedInitialNotifications: true }); // Mark as fetched to avoid re-fetch loops on auth pages
      return;
    }
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(NOTIFICATION_LIMIT);

      if (error) throw error;

      if (data) {
        const unread = data.filter(n => !n.is_read).length;
        set({
          notifications: data,
          unreadCount: unread,
          isLoading: false,
          hasFetchedInitialNotifications: true,
        });
      } else {
        set({
          notifications: [],
          unreadCount: 0,
          isLoading: false,
          hasFetchedInitialNotifications: true,
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ isLoading: false, hasFetchedInitialNotifications: true }); // Still mark as fetched to avoid loops
    }
  },

  markAsRead: async (notificationId, currentUser) => {
    if (!currentUser) return;

    const originalNotifications = get().notifications;
    const originalUnreadCount = get().unreadCount;

    // Optimistic update
    const updatedNotifications = originalNotifications.map(n =>
      n.id === notificationId && !n.is_read ? { ...n, is_read: true } : n
    );
    const notificationBeingMarked = originalNotifications.find(n => n.id === notificationId);
    const newUnreadCount = (notificationBeingMarked && !notificationBeingMarked.is_read) 
      ? Math.max(0, originalUnreadCount - 1) 
      : originalUnreadCount;

    set({ notifications: updatedNotifications, unreadCount: newUnreadCount });

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', currentUser.id); // Ensure user can only update their own

      if (error) {
        // Revert optimistic update on error
        set({ notifications: originalNotifications, unreadCount: originalUnreadCount });
        throw error;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Optionally re-fetch or provide other error handling
      set({ notifications: originalNotifications, unreadCount: originalUnreadCount });
    }
  },
  
  markSpecificNotificationAsRead: async (notificationId, currentUser) => {
    // This is the core DB update logic. UI updates are handled by calling functions.
    if (!currentUser) return;
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      // After successful DB update, refresh the notifications list to get consistent state
      // This avoids complex optimistic updates in multiple places if this function is called directly
      await get().fetchNotifications(currentUser);

    } catch (error) {
      console.error('Error in markSpecificNotificationAsRead:', error);
      // No rollback here as it's not doing optimistic UI updates itself.
      // The caller might handle UI or re-fetch.
    }
  },

  markAllAsRead: async (currentUser) => {
    if (!currentUser || get().unreadCount === 0) return;

    const originalNotifications = get().notifications;
    const originalUnreadCount = get().unreadCount;

    // Optimistic update
    const updatedNotifications = originalNotifications.map(n =>
      !n.is_read ? { ...n, is_read: true } : n
    );
    set({ notifications: updatedNotifications, unreadCount: 0 });

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', currentUser.id)
        .eq('is_read', false); // Only update those that are currently unread

      if (error) {
        // Revert optimistic update
        set({ notifications: originalNotifications, unreadCount: originalUnreadCount });
        throw error;
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Optionally re-fetch or provide other error handling
      set({ notifications: originalNotifications, unreadCount: originalUnreadCount });
    }
  },

  getUnreadApprovalNotification: () => {
    const { notifications, hasFetchedInitialNotifications } = get();
    
    // Optional: Trigger fetch if not yet done. Consider if this is desired UX.
    // For now, it expects notifications to be loaded.
    if (!hasFetchedInitialNotifications) {
      console.warn('getUnreadApprovalNotification called before initial fetch.');
      // Could call fetchNotifications here if store had access to current user,
      // but that might make this getter async or introduce complexities.
      // For now, it relies on prior loading.
      return null;
    }

    return notifications.find(n => n.type === 'account_approved' && !n.is_read) || null;
  },
  
  subscribeToNewNotifications: (currentUser) => {
    if (!currentUser) {
      console.log('subscribeToNewNotifications: No current user, skipping subscription.');
      return () => {}; // Return a no-op unsubscribe function
    }

    console.log('Attempting to subscribe to new notifications for user:', currentUser.id);
    const channel = supabase
      .channel(`user_notifications:${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          console.log('New notification received via subscription:', payload);
          const newNotification = payload.new as ProfileNotification;
          // Add to the beginning of the list and update unread count
          set((state) => ({
            notifications: [newNotification, ...state.notifications].slice(0, NOTIFICATION_LIMIT + 5), // Keep list size manageable
            unreadCount: state.unreadCount + 1,
          }));
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to new notifications channel for user:', currentUser.id);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Notification subscription error:', status, err);
        }
      });

    // Return an unsubscribe function
    return () => {
      if (channel) {
        console.log('Unsubscribing from new notifications channel for user:', currentUser.id);
        supabase.removeChannel(channel);
      }
    };
  },
  
  resetNotificationState: () => {
    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      hasFetchedInitialNotifications: false,
    });
  },
}));

// Example usage (conceptual, would be in a React component):
//
// import { useNotificationStore } from './notificationStore';
// import { useAuthStore } // to get current user
//
// const NotificationsDisplay = () => {
//   const { notifications, unreadCount, fetchNotifications, markAsRead, isLoading, getUnreadApprovalNotification, hasFetchedInitialNotifications } = useNotificationStore();
//   const { user: currentUser } = useAuthStore(); // Assuming user object from auth store
//
//   useEffect(() => {
//     // Fetch initial notifications if user is available and not yet fetched
//     if (currentUser && !hasFetchedInitialNotifications && !isLoading) {
//       fetchNotifications(currentUser);
//     }
//   }, [currentUser, fetchNotifications, hasFetchedInitialNotifications, isLoading]);
//
//   useEffect(() => {
//      if (currentUser && hasFetchedInitialNotifications) { // Ensure initial fetch is done before subscribing
//          const unsubscribe = useNotificationStore.getState().subscribeToNewNotifications(currentUser);
//          return unsubscribe; // Cleanup on component unmount
//      }
//   }, [currentUser, hasFetchedInitialNotifications]);
//
//   // Show loading state or notifications list
//   // Call markAsRead(id, currentUser) on click
//
//   const approvalNotification = getUnreadApprovalNotification();
//   useEffect(() => {
//     if (approvalNotification) {
//       // Display this specific notification prominently
//       // And then mark it as read:
//       // markSpecificNotificationAsRead(approvalNotification.id, currentUser);
//     }
//   }, [approvalNotification, currentUser]);
//
//   return (/* ... JSX ... */);
// };
//
// On Logout:
// useNotificationStore.getState().resetNotificationState();
//
// Make sure to manage the subscription lifecycle correctly, typically by calling
// `subscribeToNewNotifications` when a user logs in (and `hasFetchedInitialNotifications` becomes true)
// and unsubscribing when they log out or the relevant component unmounts.
// The `useAuthStore` should be used to get the `currentUser` object.
// The `resetNotificationState` should be called on user logout.
```
