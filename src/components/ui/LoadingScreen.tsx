import { Scale } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Scale className="h-16 w-16 text-primary-800 animate-pulse" />
      <h2 className="mt-4 text-xl font-serif font-bold text-primary-800">
        Advocate AI
      </h2>
      <p className="mt-2 text-gray-600">Loading...</p>
    </div>
  );
};

export default LoadingScreen;