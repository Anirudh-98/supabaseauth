import React from 'react';

const UserCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 md:p-6 flex flex-col space-y-4 animate-pulse">
      {/* User Info Section Placeholders */}
      <div>
        <div className="bg-gray-300 rounded-md h-6 w-3/4 mb-2"></div> {/* Name placeholder */}
        <div className="bg-gray-300 rounded-md h-4 w-1/2"></div>    {/* Email placeholder */}
        <div className="bg-gray-200 rounded-md h-3 w-2/3 mt-2"></div> {/* Bar Council No. placeholder */}
        <div className="bg-gray-200 rounded-md h-3 w-1/2 mt-1"></div>    {/* Phone No. placeholder */}
      </div>

      {/* Status Section Placeholders */}
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="bg-gray-300 rounded-md h-4 w-24"></div> {/* "Account Status:" label placeholder */}
          <div className="bg-gray-300 rounded-full h-5 w-20 ml-2"></div> {/* Status badge placeholder */}
        </div>
        <div className="flex items-center">
          <div className="bg-gray-300 rounded-md h-4 w-24"></div> {/* "Email Verified:" label placeholder */}
          <div className="bg-gray-300 rounded-md h-4 w-16 ml-2"></div>   {/* "Yes/No" placeholder */}
        </div>
      </div>
      
      {/* Role Display Placeholder */}
       <div className="flex items-center">
          <div className="bg-gray-300 rounded-md h-4 w-12"></div> {/* "Role:" label placeholder */}
          <div className="bg-gray-300 rounded-full h-5 w-16 ml-2"></div>   {/* Role badge placeholder */}
        </div>


      {/* Date Placeholder */}
      <div className="bg-gray-200 rounded-md h-3 w-1/3 mt-1"></div>

      {/* Button Placeholders Section */}
      <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0 mt-auto pt-4 border-t border-gray-200">
        <div className="bg-gray-300 rounded-md h-8 w-full sm:w-20"></div>
        <div className="bg-gray-300 rounded-md h-8 w-full sm:w-20"></div>
      </div>
    </div>
  );
};

export default UserCardSkeleton;
