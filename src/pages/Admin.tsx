import React from 'react'; // Ensure React is imported
import UserList from '../components/admin/UserList';
import AnimatedPage from '../components/animation/AnimatedPage';

const Admin = () => {
  return (
    <AnimatedPage className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-teal-700 mb-2"> {/* Updated color */}
          Admin Panel
        </h1>
        <p className="text-gray-600 mb-8">
          Manage user accounts and permissions
        </p>
        
        <div className="bg-white p-6 rounded-lg shadow-md"> {/* Replaced card with explicit styling */}
          <h2 className="text-xl font-serif font-bold text-teal-700 mb-4"> {/* Updated color */}
            User Management
          </h2>
          <UserList />
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Admin;