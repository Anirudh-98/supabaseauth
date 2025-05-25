import React from 'react';
import AnimatedPage from '../components/animation/AnimatedPage'; // Import AnimatedPage

const Dashboard: React.FC = () => {
  return (
    <AnimatedPage className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-teal-700 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Welcome to your dashboard. Only approved users can see this.
        </p>
        {/* Placeholder content for the dashboard */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>Your dashboard content goes here.</p>
          <p>This could include summaries, quick links, or user-specific information.</p>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Dashboard;
