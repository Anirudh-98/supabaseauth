import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle } from 'lucide-react';
import Button from '../ui/Button';
import type { Profile, AccountStatus } from '../../lib/types';

const UserList = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'All'>('All');

  useEffect(() => {
    fetchUsers();
    
    // Set up real-time subscription for user updates
    const subscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, () => {
        fetchUsers();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetAccountStatus = async (userId: string, status: AccountStatus) => {
    setActionInProgress(userId);
    setError('');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_status: status })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, account_status: status } : user
        )
      );
    } catch (err) {
      console.error(`Error setting account status to ${status}:`, err);
      setError(`Failed to set account status to ${status}.`);
    } finally {
      setActionInProgress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error-50 text-error-700 rounded-md">
        <p>{error}</p>
        <Button 
          variant="primary" 
          size="sm" 
          className="mt-2" 
          onClick={() => {
            setError('');
            fetchUsers();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

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

  return (
    <div>
      <div className="mb-4 flex space-x-2">
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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email Verified
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bar Council No.
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone No.
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                {statusFilter === 'All' ? 'No users found' : `No users found with status: ${statusFilter}`}
              </td>
            </tr>
          ) : (
            filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.advocate_full_name || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.role === 'admin' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        Admin
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        User
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.account_status === 'approved' && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {user.account_status}
                    </span>
                  )}
                  {user.account_status === 'pending' && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 capitalize">
                      <XCircle className="h-4 w-4 mr-1" />
                      {user.account_status}
                    </span>
                  )}
                  {user.account_status === 'declined' && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 capitalize">
                      <XCircle className="h-4 w-4 mr-1" />
                      {user.account_status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email_verified ? (
                    <span className="inline-flex items-center text-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" /> Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-red-700">
                      <XCircle className="h-4 w-4 mr-1" /> No
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.bar_council_enrollment_number || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.phone_number || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user.role !== 'admin' && (
                    <div className="space-x-2">
                      {user.account_status === 'pending' && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSetAccountStatus(user.id, 'approved')}
                            isLoading={actionInProgress === user.id}
                            disabled={actionInProgress !== null}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleSetAccountStatus(user.id, 'declined')}
                            isLoading={actionInProgress === user.id}
                            disabled={actionInProgress !== null}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      {user.account_status === 'approved' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleSetAccountStatus(user.id, 'declined')}
                          isLoading={actionInProgress === user.id}
                          disabled={actionInProgress !== null}
                        >
                          Decline
                        </Button>
                      )}
                      {user.account_status === 'declined' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSetAccountStatus(user.id, 'approved')}
                          isLoading={actionInProgress === user.id}
                          disabled={actionInProgress !== null}
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;