import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { account, storage } from '../lib/appwrite';
import { FiUser, FiLogOut, FiMenu, FiX, FiSettings } from 'react-icons/fi';

const Navbar = () => {
  // State management
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Listen for profile updates, location changes, and logout events
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log('Profile update event received in navbar');
      if (user) {
        fetchUserProfile(user.$id);
      }
    };

    const handleUserLogout = () => {
      console.log('User logout event received in navbar');
      // Immediately clear all user state
      setUser(null);
      setUserProfile(null);
      setProfileImageUrl(null);
      setImageError(false);
      setDropdownOpen(false);
      setMobileMenuOpen(false);
    };

    // Listen for custom events
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('userLoggedOut', handleUserLogout);
    
    // Check for updates when location changes (user navigates)
    if (user) {
      fetchUserProfile(user.$id);
    }

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('userLoggedOut', handleUserLogout);
    };
  }, [user, location.pathname]);

  // Update profile image URL when userProfile changes
  useEffect(() => {
    updateProfileImageUrl();
  }, [userProfile]);

  /**
   * Check if user is authenticated and fetch their data
   */
  const checkAuthStatus = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
      await fetchUserProfile(currentUser.$id);
    } catch (error) {
      console.log('User not authenticated');
      setUser(null);
      setUserProfile(null);
      setProfileImageUrl(null);
      setImageError(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch user profile from database
   * @param {string} userId - The user's ID
   */
  const fetchUserProfile = async (userId) => {
    try {
      const { db } = await import('../lib/database');
      const { Query } = await import('appwrite');
      const profileResponse = await db.profiles.list([
        Query.equal('userId', userId)
      ]);
      
      if (profileResponse.documents.length > 0) {
        const profile = profileResponse.documents[0];
        console.log('Fetched user profile in navbar:', profile);
        setUserProfile(profile);
      } else {
        console.log('No profile found for user');
        setUserProfile(null);
      }
    } catch (profileError) {
      console.log('No profile found or error fetching profile:', profileError);
      setUserProfile(null);
    }
  };

  /**
   * Update profile image URL when profile changes
   */
  const updateProfileImageUrl = async () => {
    if (userProfile?.profilePicFileId) {
      try {
        const bucketId = import.meta.env.VITE_BUCKET_ID;
        console.log('Updating navbar profile image for fileId:', userProfile.profilePicFileId);
        console.log('Using bucket ID:', bucketId);
        
        // Use simple getFileView without any query parameters
        const viewUrl = storage.getFileView(bucketId, userProfile.profilePicFileId);
        const imageUrl = viewUrl.toString();
        
        console.log('Generated navbar profile image URL:', imageUrl);
        setProfileImageUrl(imageUrl);
        setImageError(false);
      } catch (error) {
        console.error('Error getting profile image URL:', error);
        setProfileImageUrl(null);
        setImageError(true);
      }
    } else {
      console.log('No profilePicFileId available');
      setProfileImageUrl(null);
      setImageError(false);
    }
  };

  /**
   * Handle user logout with immediate state update
   */
  const handleLogout = async () => {
    try {
      // Delete the session
      await account.deleteSession('current');
      
      // Immediately clear all state
      setUser(null);
      setUserProfile(null);
      setProfileImageUrl(null);
      setImageError(false);
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      
      // Navigate to home
      navigate('/');
      
    } catch (error) {
      console.error('Logout failed:', error);
      
      // Even if logout fails, clear the state and navigate
      // This handles cases where the session might already be invalid
      setUser(null);
      setUserProfile(null);
      setProfileImageUrl(null);
      setImageError(false);
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      navigate('/');
    }
  };

  /**
   * Profile image component with fallback to initials
   */
  const ProfileImage = () => {
    if (profileImageUrl && !imageError) {
      return (
        <img
          src={profileImageUrl}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
          onError={(e) => {
            console.log('Profile image failed to load in navbar:', profileImageUrl);
            setImageError(true);
          }}
          onLoad={() => {
            console.log('Profile image loaded successfully in navbar');
          }}
        />
      );
    }
    
    // Fallback to user initials
    const displayName = userProfile?.name || user?.name || user?.email || 'User';
    const initial = displayName.charAt(0).toUpperCase();
    
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
        {initial}
      </div>
    );
  };

  /**
   * Close mobile menu and dropdown
   */
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const closeDropdown = () => setDropdownOpen(false);

  // Loading state
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

  const displayName = userProfile?.name || user?.name || 'Profile';

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
                {/* Dashboard Link */}
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
                    <span className="text-sm font-medium">{displayName}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <Link
                        to="/profile-setup"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={closeDropdown}
                      >
                        <FiUser className="mr-3 h-4 w-4" />
                        Edit Profile
                      </Link>
                      <Link
                        to="/account-settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={closeDropdown}
                      >
                        <FiSettings className="mr-3 h-4 w-4" />
                        Account Settings
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
              /* Sign In Button for non-authenticated users */
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
              {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {user ? (
              <div className="space-y-2">
                {/* User Info */}
                <div className="flex items-center space-x-3 px-3 py-2">
                  <ProfileImage />
                  <span className="text-sm font-medium text-gray-900">{displayName}</span>
                </div>
                
                {/* Navigation Links */}
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile-setup"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={closeMobileMenu}
                >
                  Edit Profile
                </Link>
                <Link
                  to="/account-settings"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={closeMobileMenu}
                >
                  Account Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              /* Mobile Sign In Button */
              <Link
                to="/auth"
                className="block mx-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-center"
                onClick={closeMobileMenu}
              >
                Sign In / Sign Up
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Backdrop for dropdown - closes dropdown when clicked */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeDropdown}
        />
      )}
    </nav>
  );
};

export default Navbar;