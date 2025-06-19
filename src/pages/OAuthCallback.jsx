import React, { useEffect, useState } from 'react';
import { account } from '../lib/appwrite';
import { db } from '../lib/database';
import { useNavigate } from 'react-router-dom';
import { Query } from 'appwrite';

/**
 * OAuth Callback Page Component
 * 
 * Handles the OAuth redirect after successful authentication.
 * Determines whether to redirect to dashboard (existing user) or profile setup (new user).
 */
function OAuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleCallback();
  }, []);

  /**
   * Handle OAuth callback and determine user flow
   */
  const handleCallback = async () => {
    try {
      // Get the authenticated user
      const user = await account.get();

      if (user) {
        console.log("User successfully logged in/registered:", user);

        // Check if user has a complete profile
        try {
          const response = await db.profiles.list([
            Query.equal('userId', user.$id)
          ]);

          if (response.documents.length > 0) {
            // Existing user with profile - redirect to dashboard
            console.log("User has existing profile. Redirecting to dashboard.");
            navigate('/dashboard');
          } else {
            // New user or incomplete profile - redirect to profile setup
            console.log("User is new or profile is incomplete. Redirecting to profile setup.");
            navigate('/profile-setup');
          }
        } catch (profileError) {
          console.error("Error checking user profile:", profileError);
          // If profile check fails, redirect to profile setup to be safe
          navigate('/profile-setup');
        }
      } else {
        // This shouldn't happen if Appwrite redirected here on success
        setError('Authentication failed. No user found.');
        navigate('/auth?error=auth_failed');
      }
    } catch (err) {
      console.error('Error during OAuth callback:', err);
      setError('Authentication failed. Please try again.');
      navigate('/auth?error=' + (err.code || 'unknown_error'));
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Authenticating... Please wait.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/auth')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Go back to login
          </button>
        </div>
      </div>
    );
  }

  return null; // Component will navigate away
}

export default OAuthCallback;