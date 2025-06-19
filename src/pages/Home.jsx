import React from 'react';
import useTitle from '../hooks/useTitle';

/**
 * Home Page Component
 * 
 * Landing page for the JW Matrimony application.
 * Accessible to all users (authenticated and non-authenticated).
 */
function Home() {
  useTitle('Welcome to JW Matrimony');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to JW Matrimony
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Find your perfect match within the Jehovah's Witness community
        </p>
        <div className="space-x-4">
          <a
            href="/auth"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors shadow-sm"
          >
            Get Started
          </a>
          <a
            href="/dashboard"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md text-lg font-medium transition-colors"
          >
            Browse Profiles
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;