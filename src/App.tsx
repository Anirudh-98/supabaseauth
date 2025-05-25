import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Admin from './pages/Admin';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthRequiredRoute from './components/auth/AuthRequiredRoute'; // Added in previous task
import Dashboard from './pages/Dashboard'; // Added in previous task
import LoadingScreen from './components/ui/LoadingScreen';
import { AuthProvider } from './components/auth/AuthProvider';
import { Toaster } from 'react-hot-toast'; // Import Toaster

function App() {
  const { checkSession, isLoading } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} /> {/* Add Toaster */}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Welcome />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="home" element={
            <AuthRequiredRoute> {/* Was updated to AuthRequiredRoute */}
              <Home />
            </AuthRequiredRoute>
          } />
           <Route path="dashboard" element={ /* Was added */
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="admin" element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;