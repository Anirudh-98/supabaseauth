import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile, AccountStatus } from '../lib/types';
import toast from 'react-hot-toast'; // Import toast
  user: Profile | null;
  session: any | null;
  isLoading: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  isApproved: boolean;
  
  // Methods
  login: (email: string, password: string) => Promise<{ error: any | null }>;
  signup: (data: {
    email: string;
    password: string;
    advocate_full_name: string;
    bar_council_enrollment_number: string;
    phone_number: string;
  }) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateAccountStatus: (userId: string, status: AccountStatus) => Promise<{ error: any | null }>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  isVerified: false,
  isApproved: false,
  
  login: async (email, password) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error && data.user) {
      await get().refreshUserData();
      toast.success('Login successful!');
    } else if (error) {
      toast.error(error.message || 'Login failed.');
    }
    return { error };
  },
  
  signup: async ({ email, password, advocate_full_name, bar_council_enrollment_number, phone_number }) => {
    let signupError, profileErrorData; // To hold errors for later toast
    try {
      const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      signupError = error; // Store potential signup error

      if (!error && data.user) {
        // These fields should already be in the 'profiles' table definition
        // from previous tasks, including default values for role and account_status.
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          advocate_full_name,
          bar_council_enrollment_number,
          phone_number,
          // role: 'User', // This should be a default in the DB or set here if not
          // account_status: 'Pending', // This should be a default in the DB or set here if not
        });

        profileErrorData = profileError; // Store potential profile error

        if (profileError) {
          toast.error(profileError.message || 'Failed to create user profile.');
          return { error: profileError };
        }
        
        toast.success('Signup successful! Please check your email to verify.');
        return { error: null }; // Explicitly return null error on success
      } else if (error) {
        toast.error(error.message || 'Signup failed.');
        return { error };
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred during signup.');
      return { error: err };
    }
    // Fallback, should be covered by specific error returns above
    return { error: signupError || profileErrorData || new Error('Signup process failed.') };
  },
  
  logout: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      session: null,
      isAdmin: false,
      isVerified: false,
      isApproved: false,
    });
    toast.success('Logged out successfully.');
  },
  
  checkSession: async () => {
    set({ isLoading: true });
    
    const { data } = await supabase.auth.getSession();
    
    if (data.session) {
      set({ session: data.session });
      await get().refreshUserData();
    } else {
      set({
        user: null,
        isAdmin: false,
        isVerified: false,
        isApproved: false,
        isLoading: false,
      });
    }
  },
  
  refreshUserData: async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      set({
        user: null,
        isAdmin: false,
        isVerified: false,
        isApproved: false,
        isLoading: false,
      });
      return;
    }
    
    const userId = sessionData.session.user.id;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !profile) {
      console.error('Error fetching user profile:', error);
      set({ isLoading: false });
      return;
    }
    
    set({
      user: profile,
      isAdmin: profile.role === 'admin',
      isVerified: profile.email_verified,
      isApproved: profile.account_status === 'approved',
      isLoading: false,
    });
  },
  
  updateAccountStatus: async (userId: string, status: AccountStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ account_status: status })
      .eq('id', userId);
      
    if (!error) {
      await get().refreshUserData();
    }
    
    return { error };
  },
}));