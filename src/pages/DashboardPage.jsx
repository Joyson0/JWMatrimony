import React from 'react';
import useTitle from '../hooks/useTitle';

/**
 * Dashboard Page Component
 * 
 * Main dashboard for authenticated users.
 * Protected route - only accessible to logged-in users.
 */
function DashboardPage() {
  useTitle('Dashboard - JW Matrimony');
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Welcome to your matrimony dashboard. Profile browsing and matching features coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;