// src/components/auth/AuthProvider.tsx
// src/components/auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore'; // Import the authStore
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    signOut: () => Promise<void>;
    userProfile: any; // You'll want to define an interface for your profile data
    loading: boolean;
    isAdmin: boolean;
    isVerified: boolean;
    isApproved: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const {
        user,
        session,
        isLoading,
        isAdmin,
        isVerified,
        isApproved,
        checkSession,
        logout,
    } = useAuthStore(); // Get state and methods from the authStore

    useEffect(() => {
        checkSession(); // Check the session when the component mounts
    }, [checkSession]);

    const value: AuthContextType = {
        session,
        signOut: logout, // Pass the logout function
        userProfile: user, // Pass the user as the profile
        loading: isLoading,
        isAdmin,
        isVerified,
        isApproved,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
