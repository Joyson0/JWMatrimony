import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { account, storage } from '../lib/appwrite';
import { FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Listen for profile updates from localStorage or custom events
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user) {
        fetchUserProfile(user.$id);
      }
    };

    // Listen for custom profile update events
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    // Also check for updates when location changes (user navigates)
    if (user) {
      fetchUserProfile(user.$id);
    }

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user, location.pathname]);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
      await fetchUserProfile(currentUser.$id);
    } catch (error) {
      console.log('User not authenticated');
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const { db } = await import('../lib/database');
      const { Query } = await import('appwrite');
      const profileResponse = await db.profiles.list([
        Query.equal('userId', userId)
      ]);
      
      if (profileResponse.documents.length > 0) {
        setUserProfile(profileResponse.documents[0]);
      } else {
        setUserProfile(null);
      }
    } catch (profileError) {
      console.log('No profile found or error fetching profile:', profileError);
      setUserProfile(null);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setUserProfile(null);
      setDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getProfileImageUrl = () => {
    if (userProfile?.profilePicFileId) {
      try {
        const bucketId = import.meta.env.VITE_BUCKET_ID;
        return storage.getFilePreview(bucketId, userProfile.profilePicFileId).href;
      } catch (error) {
        console.error('Error getting profile image:', error);
        return null;
      }
    }
    return null;
  };

  const ProfileImage = () => {
    const imageUrl = getProfileImageUrl();
    
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
        {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 
         user?.name ? user.name.charAt(0).toUpperCase() : 
         user?.email?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                JW Matrimony
              </Link>
            </div>
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              JW Matrimony
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1 transition-colors"
                  >
                    <ProfileImage />
                    <span className="text-sm font-medium">
                      {userProfile?.name || user.name || 'Profile'}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <Link
                        to="/profile-setup"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiUser className="mr-3 h-4 w-4" />
                        Edit Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <FiLogOut className="mr-3 h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
              >
                Sign In / Sign Up
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2"
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <ProfileImage />
                  <span className="text-sm font-medium text-gray-900">
                    {userProfile?.name || user.name || 'Profile'}
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile-setup"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Edit Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="block mx-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In / Sign Up
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Backdrop for dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;