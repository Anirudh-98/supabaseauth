import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import LoadingScreen from '../ui/LoadingScreen';

interface AuthRequiredRouteProps {
  children: ReactNode;
}

const AuthRequiredRoute: React.FC<AuthRequiredRouteProps> = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the children
  return <>{children}</>;
};

export default AuthRequiredRoute;
