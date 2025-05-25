import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import LoadingScreen from '../ui/LoadingScreen'; // Import LoadingScreen

interface ProtectedRouteProps {
    children: ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
    const { session, loading, isApproved, isAdmin, isVerified } = useAuth();

    if (loading) {
        return <LoadingScreen />; // Use LoadingScreen component
    }

    if (!session) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    if (!isVerified) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="p-8 bg-white shadow-md rounded-lg text-center max-w-md">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Email Verification Required</h2>
                    <p className="text-gray-600">
                        Please verify your email address to continue. Check your inbox for a verification link.
                    </p>
                    {/* Optional: Add a button to resend verification or logout */}
                </div>
            </div>
        );
    }

    if (!isApproved) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="p-8 bg-white shadow-md rounded-lg text-center max-w-md">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Account Pending Approval</h2>
                    <p className="text-gray-600">
                        Your account is currently awaiting approval from an administrator. 
                        You will be notified once your account is approved.
                    </p>
                     {/* Optional: Add a contact support link */}
                </div>
            </div>
        );
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/home" replace />;
    }

    // Use userProfile here (e.g., to display a user-specific message)
    return (
        <>
            {children}
        </>
    );
};