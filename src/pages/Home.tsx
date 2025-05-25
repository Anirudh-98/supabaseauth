import { useAuthStore } from '../store/authStore';
import ResearchForm from '../components/research/ResearchForm';
import { Scale } from 'lucide-react';

const Home = () => {
  const { user, hasAccess } = useAuthStore();

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <Scale className="h-16 w-16 mx-auto text-primary-800" />
          <h1 className="mt-6 text-3xl font-serif font-bold text-primary-800">
            Account Pending Approval
          </h1>
          <div className="mt-6 card">
            <p className="text-lg text-gray-700">
              Thank you for signing up, {user?.full_name || 'valued user'}!
            </p>
            <p className="mt-4 text-gray-600">
              Your account is currently awaiting approval from an administrator. Once approved, you'll have full access to our legal research tools.
            </p>
            <p className="mt-4 text-gray-600">
              Please check back soon or contact support if you need immediate assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-primary-800 mb-2">
          Welcome, {user?.full_name || 'Researcher'}
        </h1>
        <p className="text-gray-600 mb-8">
          What legal questions can I help you with today?
        </p>
        
        <ResearchForm />
      </div>
    </div>
  );
};

export default Home;