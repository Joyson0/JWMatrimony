import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { account, storage } from '../lib/appwrite';
import { db } from '../lib/database';
import { Query } from 'appwrite';
import useTitle from '../hooks/useTitle';
import { 
  FiUser, 
  FiTrash2, 
  FiAlertTriangle, 
  FiShield, 
  FiSettings,
  FiLogOut,
  FiMail,
  FiCalendar,
  FiX,
  FiCheck,
  FiUserX
} from 'react-icons/fi';

/**
 * Delete Confirmation Modal Component
 */
const DeleteConfirmationModal = ({ isOpen, onConfirm, onCancel, isDeleting }) => {
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState(1);
  const requiredText = 'BLOCK MY ACCOUNT';

  const handleConfirm = () => {
    if (step === 1) {
      setStep(2);
    } else if (confirmText === requiredText) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    setStep(1);
    setConfirmText('');
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FiUserX className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Block Account</h3>
          </div>
          {!isDeleting && (
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <div>
              <h4 className="text-lg font-semibold text-red-600 mb-4">
                Are you sure you want to block your account?
              </h4>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <FiAlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Your account will be blocked</p>
                    <p className="text-sm text-orange-700 mt-1">
                      You won't be able to sign in, but your data will be preserved.
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="font-medium">This will:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Block your account access</li>
                    <li>Prevent you from signing in</li>
                    <li>Keep your profile data intact</li>
                    <li>Allow account recovery by contacting support</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-lg font-semibold text-red-600 mb-4">
                Final Confirmation
              </h4>
              <p className="text-gray-600 mb-4">
                To confirm blocking your account, please type <span className="font-mono font-bold text-red-600">{requiredText}</span> below:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono"
                placeholder="Type here..."
                disabled={isDeleting}
              />
              {confirmText && confirmText !== requiredText && (
                <p className="text-red-500 text-sm mt-2">
                  Text doesn't match. Please type exactly: {requiredText}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={handleCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded-lg font-medium transition-all duration-200"
          >
            Cancel
          </button>
          
          {step === 1 ? (
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-all duration-200"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={isDeleting || confirmText !== requiredText}
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Blocking...
                </>
              ) : (
                <>
                  <FiUserX className="w-4 h-4" />
                  Block Account
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

/**
 * Account Settings Page Component
 */
function AccountSettingsPage() {
  useTitle('Account Settings - JW Matrimony');
  const navigate = useNavigate();

  // State management
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  /**
   * Load current user and profile data
   */
  const loadUserData = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);

      // Fetch user profile
      const response = await db.profiles.list([
        Query.equal('userId', currentUser.$id)
      ]);

      if (response.documents.length > 0) {
        setUserProfile(response.documents[0]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user logout with proper state cleanup
   */
  const handleLogout = async () => {
    try {
      // Delete the current session
      await account.deleteSession('current');
      
      // Clear local state immediately
      setUser(null);
      setUserProfile(null);
      
      // Trigger a custom event to notify navbar to update immediately
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      
      // Navigate to home page
      navigate('/');
      
      // Show success notification
      showNotification('Successfully signed out', 'success');
      
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state and navigate
      setUser(null);
      setUserProfile(null);
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      navigate('/');
    }
  };

  /**
   * Delete all user photos from storage
   */
  const deleteUserPhotos = async (profile) => {
    const bucketId = import.meta.env.VITE_BUCKET_ID;
    const deletionPromises = [];

    try {
      // Delete profile picture
      if (profile.profilePicFileId) {
        console.log('Deleting profile picture:', profile.profilePicFileId);
        deletionPromises.push(
          storage.deleteFile(bucketId, profile.profilePicFileId).catch(error => {
            console.warn('Failed to delete profile picture:', error);
          })
        );
      }

      // Delete additional photos
      if (profile.additionalPhotos && Array.isArray(profile.additionalPhotos)) {
        profile.additionalPhotos.forEach(photoId => {
          if (photoId) {
            console.log('Deleting additional photo:', photoId);
            deletionPromises.push(
              storage.deleteFile(bucketId, photoId).catch(error => {
                console.warn('Failed to delete additional photo:', error);
              })
            );
          }
        });
      }

      // Wait for all photo deletions to complete
      await Promise.all(deletionPromises);
      console.log('All photos deleted successfully');
    } catch (error) {
      console.error('Error during photo deletion:', error);
      // Don't throw error here - continue with profile deletion even if some photos fail
    }
  };

  /**
   * Call the Appwrite Function to block the user account
   */
  const blockUserAccount = async () => {
    try {
      // Get current session token
      const session = await account.getSession('current');
      const sessionToken = session.secret;

      // Call the Appwrite Function to block the user
      const functionUrl = `${import.meta.env.VITE_APPWRITE_ENDPOINT}/functions/delete-user/executions`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
          'X-Appwrite-Project': import.meta.env.VITE_APPWRITE_PROJECT_ID,
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to block user account');
      }

      const result = await response.json();
      console.log('User account blocked successfully:', result);
      
      return result;
    } catch (error) {
      console.error('Error calling block-user function:', error);
      throw error;
    }
  };

  /**
   * Handle complete account blocking
   */
  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      console.log('Starting account blocking process...');

      // Step 1: Delete all photos from storage
      if (userProfile) {
        await deleteUserPhotos(userProfile);
      }

      // Step 2: Delete profile document from database
      if (userProfile) {
        console.log('Deleting profile document:', userProfile.$id);
        await db.profiles.delete(userProfile.$id);
        console.log('Profile document deleted successfully');
      }

      // Step 3: Clear local state and notify navbar
      setUser(null);
      setUserProfile(null);
      window.dispatchEvent(new CustomEvent('userLoggedOut'));

      // Step 4: Block user account from Appwrite using Function
      console.log('Blocking user account from Appwrite...');
      await blockUserAccount();
      console.log('User account blocked successfully');

      // Show success message and redirect
      showNotification('Account blocked successfully. Contact support to reactivate.', 'success');
      
      // Redirect to home page after a brief delay
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Error during account blocking:', error);
      
      // Show error message
      showNotification('Failed to block account. Please try again or contact support.', 'error');
      
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  /**
   * Show notification message
   */
  const showNotification = (message, type = 'success') => {
    const bgColor = type === 'success' ? 'bg-green-500' : 
                   type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
    notificationDiv.textContent = message;
    document.body.appendChild(notificationDiv);
    
    setTimeout(() => {
      notificationDiv.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
      notificationDiv.classList.add('translate-x-full');
      setTimeout(() => {
        if (document.body.contains(notificationDiv)) {
          document.body.removeChild(notificationDiv);
        }
      }, 300);
    }, 5000); // Show longer for blocking message
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading account settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FiSettings className="w-6 h-6" />
              Account Settings
            </h1>
            <p className="text-blue-100 mt-2">Manage your account preferences and data</p>
          </div>

          {/* Account Information */}
          <div className="p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FiUser className="w-5 h-5" />
              Account Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FiMail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Email Address</span>
                </div>
                <p className="text-gray-900 font-medium">{user?.email}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FiUser className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Profile Name</span>
                </div>
                <p className="text-gray-900 font-medium">{userProfile?.name || 'Not set'}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FiCalendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Account Created</span>
                </div>
                <p className="text-gray-900 font-medium">
                  {user?.$createdAt ? new Date(user.$createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FiShield className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Account Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-900 font-medium">Active</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FiSettings className="w-5 h-5" />
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => navigate('/profile-setup')}
                className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-left"
              >
                <FiUser className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Edit Profile</h3>
                  <p className="text-sm text-blue-700">Update your profile information</p>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-left"
              >
                <FiLogOut className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Sign Out</h3>
                  <p className="text-sm text-gray-700">Sign out of your account</p>
                </div>
              </button>
            </div>

            {/* Danger Zone */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-lg font-semibold text-red-600 mb-6 flex items-center gap-2">
                <FiAlertTriangle className="w-5 h-5" />
                Danger Zone
              </h2>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Block Account</h3>
                    <p className="text-red-700 text-sm mb-4">
                      Block your account access while preserving your data. You can contact support to reactivate.
                    </p>
                    <div className="text-sm text-red-600 space-y-1">
                      <p>• Your account will be blocked from signing in</p>
                      <p>• All profile information will be preserved</p>
                      <p>• All uploaded photos will be removed</p>
                      <p>• Contact support to reactivate your account</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isDeleting}
                    className="ml-6 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors shadow-sm"
                  >
                    <FiUserX className="w-4 h-4" />
                    Block Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default AccountSettingsPage;