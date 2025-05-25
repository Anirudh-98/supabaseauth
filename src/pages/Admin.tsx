import UserList from '../components/admin/UserList';

const Admin = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-primary-800 mb-2">
          Admin Panel
        </h1>
        <p className="text-gray-600 mb-8">
          Manage user accounts and permissions
        </p>
        
        <div className="card">
          <h2 className="text-xl font-serif font-bold text-primary-800 mb-4">
            User Management
          </h2>
          <UserList />
        </div>
      </div>
    </div>
  );
};

export default Admin;