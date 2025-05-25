import React, { useState } from 'react'; // Ensure React is imported
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Scale } from 'lucide-react';
import AnimatedPage from '../components/animation/AnimatedPage';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const { error: loginError } = await login(email, password);
      
      if (loginError) {
        setError(loginError.message || 'Login failed. Please check your credentials.');
        return;
      }
      
      navigate('/home');
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage className="flex justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Scale className="mx-auto h-12 w-12 text-teal-600" /> {/* Updated color */}
          <h2 className="mt-6 text-3xl font-serif font-bold text-teal-700"> {/* Updated color */}
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-teal-600 hover:text-teal-700"> {/* Updated color */}
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md"> {/* Replaced card with explicit styling */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md"> {/* Updated status color */}
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                id="email"
                type="email"
                label="Email address"
                required
                fullWidth
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Input
                id="password"
                type="password"
                label="Password"
                required
                fullWidth
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <Button 
                type="submit" 
                fullWidth 
                isLoading={isLoading}
                disabled={!email || !password || isLoading}
              >
                Sign in
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;