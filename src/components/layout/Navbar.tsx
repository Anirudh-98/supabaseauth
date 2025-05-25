import { useState, useEffect } from 'react'; // Added useEffect
import { Link, NavLink, useNavigate } from 'react-router-dom'; // Changed Link to NavLink where appropriate
import { useAuthStore } from '../../store/authStore';
import { Scale, Menu, X, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // State for scroll tracking
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Effect for scroll handling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out text-gray-700 hover:text-teal-600 hover:bg-teal-50 ${
      isActive ? 'text-teal-600 font-semibold bg-teal-50' : ''
    }`;

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ease-in-out text-gray-700 hover:text-teal-600 hover:bg-teal-50 ${
      isActive ? 'text-teal-600 font-semibold bg-teal-50' : ''
    }`;


  return (
    <nav className={`sticky top-0 z-50 transition-shadow duration-300 ease-in-out ${isScrolled ? 'shadow-lg bg-white' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Scale className="h-8 w-8 text-teal-600" /> {/* Updated color */}
              <span className="ml-2 text-xl font-serif font-bold text-teal-700"> {/* Updated color */}
                Advocate AI
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                <NavLink to="/home" className={navLinkClasses}>
                  Research
                </NavLink>
                <NavLink to="/dashboard" className={navLinkClasses}>
                  Dashboard
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={navLinkClasses}>
                    Admin Panel
                  </NavLink>
                )}
                <div className="relative ml-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 truncate max-w-xs" title={user.advocate_full_name || user.email}>
                      {user.advocate_full_name || user.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-150 ease-in-out"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 transition-colors duration-150 ease-in-out"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors duration-150 ease-in-out"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-teal-600 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-colors duration-150 ease-in-out"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className={`md:hidden ${isScrolled ? 'bg-white' : 'bg-white'}`}> {/* Ensure mobile menu background matches */}
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <NavLink to="/home" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  Research
                </NavLink>
                <NavLink to="/dashboard" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                    Admin Panel
                  </NavLink>
                )}
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <User className="h-10 w-10 rounded-full bg-gray-100 p-2 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800 truncate" title={user.advocate_full_name || 'User'}>
                        {user.advocate_full_name || 'User'}
                      </div>
                      <div className="text-sm font-medium text-gray-500 truncate" title={user.email}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 px-2 space-y-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 transition-colors duration-150 ease-in-out"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 transition-colors duration-150 ease-in-out"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 transition-colors duration-150 ease-in-out"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;