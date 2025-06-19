import React from 'react';
import OAuthButtons from '../components/OAuthButtons';
import useTitle from '../hooks/useTitle';

/**
 * Login/Register Page Component
 * 
 * Provides OAuth authentication options for users.
 * Single page for both login and registration since OAuth handles both cases.
 */
function LoginRegister() {
  useTitle('Sign in to JW Matrimony');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to JW Matrimony
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in or create your account to get started
          </p>
        </div>
        
        {/* OAuth Buttons */}
        <OAuthButtons />
      </div>
    </div>
  );
}

export default LoginRegister;