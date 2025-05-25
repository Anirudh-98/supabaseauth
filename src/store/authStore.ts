import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile, AccountStatus } from '../lib/types';

type AuthState = {
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
    }
    
    return { error };
  },
  
  signup: async ({ email, password, advocate_full_name, bar_council_enrollment_number, phone_number }) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (!error && data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        advocate_full_name,
        bar_council_enrollment_number,
        phone_number,
        role: 'User',
        account_status: 'Pending',
      });
      
      if (profileError) {
        return { error: profileError };
      }
      
      await get().refreshUserData();
    }
    
    return { error };
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