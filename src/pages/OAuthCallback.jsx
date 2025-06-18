// src/pages/OAuthCallback.jsx
import React, { useEffect, useState } from 'react';
import { account, databases } from '../lib/appwrite'; // Adjust path
import { db } from '../lib/database';
import { useNavigate } from 'react-router-dom';
import { Query } from 'appwrite'; // Import Query for database checks
// import useTitle from '../hooks/useTitle'; // Your custom hook

// Replace with your actual Database and Collection IDs
const PROFILES_DATABASE_ID = 'YOUR_PROFILES_DATABASE_ID';
const PROFILES_COLLECTION_ID = 'YOUR_PROFILES_COLLECTION_ID';

function OAuthCallback() {
//   useTitle('Processing Authentication...');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Appwrite automatically handles the session creation/recovery
        // when the user lands on this page after an OAuth redirect.
        // We just need to fetch the current user's session to confirm.
        const user = await account.get(); // Get currently logged-in user

        if (user) {
          console.log("User successfully logged in/registered:", user);

          // --- IMPORTANT LOGIC: Check if user has a complete profile ---
          try {
            const response = await db.profiles.list(
              [Query.equal('userId', user.$id)] // Check if a profile exists for this user ID
            );

            if (response.documents.length > 0) {
              // User has a profile, redirect to dashboard
              console.log("User has existing profile. Redirecting to dashboard.");
              navigate('/dashboard'); // Or '/home', etc.
            } else {
              // User is new or doesn't have a profile yet, redirect to profile setup
              console.log("User is new or profile is incomplete. Redirecting to profile setup.");
              navigate('/profile-setup'); // Your multi-step profile wizard page
            }
          } catch (profileError) {
            console.error("Error checking user profile:", profileError);
            // Even if profile check fails, user is logged in. Redirect to profile setup to be safe.
            navigate('/profile-setup');
          }
        } else {
          // This case theoretically shouldn't happen if Appwrite redirected here on success
          setError('Authentication failed. No user found.');
          navigate('/auth?error=auth_failed');
        }
      } catch (err) {
        console.error('Error during OAuth callback:', err);
        setError('Authentication failed. Please try again.');
        navigate('/auth?error=' + err.code || 'unknown_error'); // Redirect back to login with error
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Authenticating... Please wait.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>
        <p>{error}</p>
        <button onClick={() => navigate('/auth')}>Go back to login</button>
      </div>
    );
  }

  return null; // Component will navigate away
}

export default OAuthCallback;