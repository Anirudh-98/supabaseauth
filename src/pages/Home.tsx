import React, { useEffect, useState } from 'react'; // Added useEffect, useState
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import ResearchForm from '../components/research/ResearchForm';
import AnimatedPage from '../components/animation/AnimatedPage'; // Import AnimatedPage
import { X } from 'lucide-react';

const Home = () => {
  const { user } = useAuthStore();
  const {
    getUnreadApprovalNotification,
    markSpecificNotificationAsRead,
  } = useNotificationStore();

  const [showApprovalMessage, setShowApprovalMessage] = useState(false);
  const [approvalNotificationId, setApprovalNotificationId] = useState<string | null>(null);
  
  // Effect for checking approval notification (from previous task)
  useEffect(() => {
    if (user && user.account_status === 'approved') {
      const unreadApprovalNotif = getUnreadApprovalNotification();
      if (unreadApprovalNotif) {
        setShowApprovalMessage(true);
        setApprovalNotificationId(unreadApprovalNotif.id);
      } else {
        setShowApprovalMessage(false);
        setApprovalNotificationId(null);
      }
    } else {
      setShowApprovalMessage(false);
      setApprovalNotificationId(null);
    }
  }, [user, getUnreadApprovalNotification]);

  const handleDismissApprovalMessage = () => {
    setShowApprovalMessage(false);
    if (approvalNotificationId && user) {
      markSpecificNotificationAsRead(approvalNotificationId, user); // Assuming user is compatible with AuthUser for this
    }
  };
  
  // Assuming the structure that was in place after task 01HY3M050XYX7D6X88D9BFPF8J
  // where the !hasAccess block was removed.
  return (
    <AnimatedPage className="container mx-auto px-4 py-8">
      {showApprovalMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg shadow-md flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">Congratulations, {user?.advocate_full_name || 'User'}!</h3>
            <p>Your account has been approved. Welcome to Advocate AI!</p> 
          </div>
          <button
            onClick={handleDismissApprovalMessage}
            className="p-1.5 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Dismiss approval message"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-teal-700 mb-2"> {/* Updated color */}
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
    </AnimatedPage>
  );
};

export default Home;