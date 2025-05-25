import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex items-center">
            <Scale className="h-6 w-6 text-primary-800" />
            <span className="ml-2 text-lg font-serif font-bold text-primary-800">
              Advocate AI
            </span>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} Advocate AI. All rights reserved.
            </p>
          </div>
        </div>
        <div className="mt-6 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700">
              Login
            </Link>
            <Link to="/signup" className="text-sm text-gray-500 hover:text-gray-700">
              Sign Up
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500 md:mt-0 md:order-1">
            Empowering legal professionals with AI-assisted research
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;