import React, { ReactNode } from 'react'; // Added React import
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider'; // Adjust the path if needed

interface ProtectedRouteProps {
    children: ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
    const { session, loading, isApproved, isAdmin, isVerified } = useAuth();

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!session) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    if (!isVerified) {
        return (
            <div>
                <p>Please verify your email to access this page.</p>
            </div>
        );
    }

    if (!isApproved) {
        // Optionally redirect or display a message for pending/declined users
        return (
            <div>
                <p>Your account is pending approval.</p>
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