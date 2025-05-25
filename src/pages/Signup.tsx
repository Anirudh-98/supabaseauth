import React, { useState } from 'react'; // Ensure React is imported
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Scale } from 'lucide-react';
import AnimatedPage from '../components/animation/AnimatedPage';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signup } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
    
    try {
      const { error: signupError } = await signup(email, password, fullName);
      
      if (signupError) {
        setError(signupError.message || 'Signup failed. Please try again.');
        return;
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (err) {
      console.error('Signup error:', err);
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
            Create a new account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-teal-600 hover:text-teal-700"> {/* Updated color */}
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md"> {/* Replaced card with explicit styling */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md"> {/* Updated status color */}
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md"> {/* Updated status color */}
              Account created successfully! Redirecting to dashboard...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                id="fullName"
                type="text"
                label="Full Name"
                required
                fullWidth
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={password.length > 0 && password.length < 6 ? 'Password must be at least 6 characters' : ''}
              />
            </div>

            <div>
              <Button 
                type="submit" 
                fullWidth 
                isLoading={isLoading}
                disabled={!email || !password || !fullName || password.length < 6 || isLoading}
              >
                Create Account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;