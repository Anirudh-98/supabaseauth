import React from 'react';
import type { Profile, AccountStatus } from '../../lib/types'; // Adjust path if needed
import Button from '../ui/Button'; // Adjust path if needed
import { CheckCircle, XCircle, Clock } from 'lucide-react'; // Added Clock for registered date

interface UserCardProps {
  user: Profile;
  onSetAccountStatus: (userId: string, status: AccountStatus) => void;
  actionInProgress: string | null;
}

const UserCard: React.FC<UserCardProps> = ({ user, onSetAccountStatus, actionInProgress }) => {
  const isProcessingThisUser = actionInProgress === user.id;
  const isAnotherUserProcessing = actionInProgress !== null && actionInProgress !== user.id;

  return (
    <div className="bg-white shadow-md rounded-lg p-4 md:p-6 flex flex-col space-y-3 transition-all duration-300 ease-in-out hover:shadow-lg">
      {/* User Info Section */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate" title={user.advocate_full_name || 'N/A'}>
          {user.advocate_full_name || 'N/A'}
        </h3>
        <p className="text-sm text-gray-600 truncate" title={user.email}>
          {user.email}
        </p>
        {user.bar_council_enrollment_number && (
          <p className="text-xs text-gray-500 mt-1">
            Bar Council: {user.bar_council_enrollment_number}
          </p>
        )}
        {user.phone_number && (
          <p className="text-xs text-gray-500">
            Phone: {user.phone_number}
          </p>
        )}
      </div>

      {/* Status Section */}
      <div className="space-y-1.5">
        <div className="flex items-center text-sm">
          <span className="text-gray-600 w-28">Account Status:</span>
          {user.account_status === 'approved' && (
            <span className="ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 items-center capitalize">
              <CheckCircle className="h-3 w-3 mr-1" />
              {user.account_status}
            </span>
          )}
          {user.account_status === 'pending' && (
            <span className="ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 items-center capitalize">
              <XCircle className="h-3 w-3 mr-1" />
              {user.account_status}
            </span>
          )}
          {user.account_status === 'declined' && (
            <span className="ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 items-center capitalize">
              <XCircle className="h-3 w-3 mr-1" />
              {user.account_status}
            </span>
          )}
        </div>

        <div className="flex items-center text-sm">
          <span className="text-gray-600 w-28">Email Verified:</span>
          {user.email_verified ? (
            <span className="ml-2 inline-flex items-center text-green-700 text-xs font-medium">
              <CheckCircle className="h-3 w-3 mr-1" /> Yes
            </span>
          ) : (
            <span className="ml-2 inline-flex items-center text-red-700 text-xs font-medium">
              <XCircle className="h-3 w-3 mr-1" /> No
            </span>
          )}
        </div>
      </div>
      
      {/* Role Display */}
      <div className="text-sm">
         <span className="text-gray-600 w-28">Role:</span>
         <span className={`ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
         }`}>
            {user.role}
         </span>
      </div>


      {/* Date Section */}
      <div className="text-xs text-gray-500 flex items-center pt-2">
        <Clock className="h-3 w-3 mr-1.5 text-gray-400" />
        Registered: {new Date(user.created_at).toLocaleDateString()}
      </div>

      {/* Actions Section */}
      {user.role !== 'admin' && (
        <div className="mt-auto pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0">
          {user.account_status === 'pending' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSetAccountStatus(user.id, 'approved')}
                isLoading={isProcessingThisUser}
                disabled={isAnotherUserProcessing}
                fullWidth // Make buttons full width on small screens, stack vertically
                className="sm:w-auto" // Revert to auto width on larger screens
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onSetAccountStatus(user.id, 'declined')}
                isLoading={isProcessingThisUser}
                disabled={isAnotherUserProcessing}
                fullWidth
                className="sm:w-auto"
              >
                Decline
              </Button>
            </>
          )}
          {user.account_status === 'approved' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onSetAccountStatus(user.id, 'declined')}
              isLoading={isProcessingThisUser}
              disabled={isAnotherUserProcessing}
              fullWidth
              className="sm:w-auto"
            >
              Decline
            </Button>
          )}
          {user.account_status === 'declined' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onSetAccountStatus(user.id, 'approved')}
              isLoading={isProcessingThisUser}
              disabled={isAnotherUserProcessing}
              fullWidth
              className="sm:w-auto"
            >
              Approve
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserCard;
