import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import UserCard from './UserCard';
import UserCardSkeleton from './UserCardSkeleton'; // Import UserCardSkeleton
import type { Profile, AccountStatus } from '../../lib/types';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const UserList = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'All'>('All'); // Existing filter state

  useEffect(() => {
    fetchUsers();
    
    const subscription = supabase
      .channel('public:profiles') // Subscribe to profiles table
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchUsers(); 
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUsers = async () => {
    // setIsLoading(true); // Already set initially, and on error retry
    try {
      const { data, error: fetchError } = await supabase // Renamed error to fetchError
        .from('profiles') // Fetch from profiles table
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      setUsers(data || []);
    } catch (err: any) { // Typed err
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Refactored handler from previous tasks
  const handleSetAccountStatus = async (userId: string, status: AccountStatus) => {
    setActionInProgress(userId);
    setError('');
    
    try {
      const { error: updateError } = await supabase // Renamed error to updateError
        .from('profiles')
        .update({ account_status: status })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      // Update local state optimistically or re-fetch
      const userToUpdate = users.find(u => u.id === userId);
      
      // Update local state optimistically
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, account_status: status } : user
        )
      );
      
      if (userToUpdate) {
        toast.success(`User ${userToUpdate.advocate_full_name || userToUpdate.email} status set to ${status}.`);
      } else {
        toast.success(`User status updated to ${status}.`); // Fallback if user not found
      }
      // Note: The Edge function 'send-status-email' and in-app notification trigger
      // are handled by backend triggers.
    } catch (err: any) {
      console.error(`Error setting account status to ${status}:`, err);
      setError(err.message || `Failed to set account status to ${status}.`);
      toast.error(err.message || 'Failed to update user status.');
    } finally {
      setActionInProgress(null);
    }
  };
  
  // Existing filter options and logic (from task 01HY3M91S4Q7J4K8X0A4GZ3T7E)
  const filterOptions: { label: string; value: AccountStatus | 'All' }[] = [
    { label: 'All Users', value: 'All' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Declined', value: 'declined' },
  ];

  const filteredUsers = users.filter(user => {
    if (statusFilter === 'All') {
      return true;
    }
    return user.account_status === statusFilter;
  });

  // Framer Motion variants (from task 01HY3MFM1X6A2M8Y4X8KJZS8S7)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };


  if (isLoading) {
    return (
      <div>
        {/* Filter UI should ideally be visible even during loading, or hidden if preferred */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          {filterOptions.map(option => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? 'primary' : 'outline'}
              onClick={() => setStatusFilter(option.value)}
              size="sm"
              disabled // Disable filter buttons during initial load
            >
              {option.label}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(3)].map((_, index) => (
            <UserCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-md shadow text-center">
        <p className="font-semibold">Error loading users:</p>
        <p className="mb-4">{error}</p>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => {
            setError('');
            setIsLoading(true); 
            fetchUsers();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Filter UI */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        {filterOptions.map(option => (
          <Button
            key={option.value}
            variant={statusFilter === option.value ? 'primary' : 'outline'}
            onClick={() => setStatusFilter(option.value)}
            size="sm"
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* User Cards Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">
            {statusFilter === 'All' ? 'No users found.' : `No users found with status: ${statusFilter}.`}
          </p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredUsers.map((user) => (
            <motion.div key={user.id} variants={itemVariants}>
              <UserCard
                key={user.id} // key on UserCard itself is also fine
                user={user}
                onSetAccountStatus={handleSetAccountStatus}
                actionInProgress={actionInProgress}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default UserList;