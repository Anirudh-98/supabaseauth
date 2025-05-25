import { useAuthStore } from '../store/authStore';
import ResearchForm from '../components/research/ResearchForm';
import { Scale } from 'lucide-react';

const Home = () => {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-primary-800 mb-2">
          Welcome, {user?.advocate_full_name || 'Researcher'}
        </h1>
        {user?.account_status && (
          <div className="mb-4 text-sm">
            Account Status:
            <span className={`ml-2 font-semibold ${
              user.account_status === 'approved' ? 'text-green-600' :
              user.account_status === 'pending' ? 'text-yellow-600' :
              user.account_status === 'declined' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {user.account_status.charAt(0).toUpperCase() + user.account_status.slice(1)}
            </span>
          </div>
        )}
        <p className="text-gray-600 mb-8">
          What legal questions can I help you with today?
        </p>
        
        <ResearchForm />
      </div>
    </div>
  );
};

export default Home;