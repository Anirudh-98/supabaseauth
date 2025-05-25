import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Input from '../ui/Input';
import Button from '../ui/Button';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    advocate_full_name: '',
    bar_council_enrollment_number: '',
    phone_number: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signup } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
    
    try {
      const { error: signupError } = await signup(formData);
      
      if (signupError) {
        setError(signupError.message || 'Signup failed. Please try again.');
        return;
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/auth/verify-email');
      }, 2000);
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-error-50 text-error-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-50 text-green-700 rounded-md">
            Account created successfully! Please check your email for verification.
          </div>
        )}

        <Input
          label="Full Name"
          name="advocate_full_name"
          type="text"
          required
          value={formData.advocate_full_name}
          onChange={handleChange}
          placeholder="Enter your full name as registered with Bar Council"
        />

        <Input
          label="Bar Council Enrollment Number"
          name="bar_council_enrollment_number"
          type="text"
          required
          value={formData.bar_council_enrollment_number}
          onChange={handleChange}
          placeholder="e.g., MAH/1234/2020"
        />

        <Input
          label="Phone Number"
          name="phone_number"
          type="tel"
          required
          value={formData.phone_number}
          onChange={handleChange}
          placeholder="Enter your phone number"
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email address"
        />

        <Input
          label="Password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a strong password"
          error={formData.password.length > 0 && formData.password.length < 6 ? 'Password must be at least 6 characters' : ''}
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading || Object.values(formData).some(val => !val.trim())}
        >
          Create Account
        </Button>
      </form>
    </div>
  );
};

export default SignupForm;