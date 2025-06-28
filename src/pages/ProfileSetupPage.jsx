import React, { useState, useEffect } from 'react';
import { account } from '../lib/appwrite';
import { useNavigate } from 'react-router-dom';
import { Query } from 'appwrite';
import useTitle from '../hooks/useTitle';
import { db } from '../lib/database';

// Wizard components
import ProgressBar from '../components/wizard/ProgressBar';
import Step1BasicInfo from '../components/wizard/Step1BasicInfo';
import Step2Family from '../components/wizard/Step2Family';
import Step3About from '../components/wizard/Step3About';
import Step4PartnerPreferences from '../components/wizard/Step4PartnerPreferences';

/**
 * Profile Setup Page Component
 * 
 * Modern multi-step wizard for creating/editing user profiles.
 * Features smooth animations, progress tracking, and responsive design.
 * Saves data only when changes are detected for optimal performance.
 */
function ProfileSetupPage() {
  useTitle('Profile Setup Wizard - JW Matrimony');
  const navigate = useNavigate();

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [userProfileDocumentId, setUserProfileDocumentId] = useState(null);
  
  // Form data with default structure
  const [formData, setFormData] = useState({
    // User identification
    userId: '',
    email: '',
    
    // Basic info
    name: '', 
    gender: '', 
    dateOfBirth: '', 
    height: 0, 
    maritalStatus: '', 
    motherTongue: '',
    congregation: '',
    country: '', 
    state: '', 
    district: '', 
    profilePicFileId: null,
    
    // About section
    aboutMe: '', 
    education: '', 
    occupation: '', 
    hobbies: [],
    spiritualStatus: {
      baptismStatus: 'Baptised Publisher',
      servicePosition: '',
      serviceType: ''
    },
    languages: [],
    additionalPhotos: [],
    
    // Complex nested objects
    familyDetails: {},
    partnerPreferences: {},
  });

  // Store original data for comparison
  const [originalData, setOriginalData] = useState({});

  // Load existing profile data or initialize for new user
  useEffect(() => {
    loadProfile();
  }, [navigate]);

  /**
   * Deep comparison function to check if objects are equal
   */
  const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;
    
    if (obj1 == null || obj2 == null) return obj1 === obj2;
    
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
    
    if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
    
    if (Array.isArray(obj1)) {
      if (obj1.length !== obj2.length) return false;
      for (let i = 0; i < obj1.length; i++) {
        if (!deepEqual(obj1[i], obj2[i])) return false;
      }
      return true;
    }
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (let key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }
    
    return true;
  };

  /**
   * Normalize data for comparison (handle type conversions and formatting)
   */
  const normalizeDataForComparison = (data) => {
    const normalized = { ...data };
    
    // Normalize hobbies - ensure it's always an array for comparison
    if (typeof normalized.hobbies === 'string') {
      normalized.hobbies = normalized.hobbies.split(',').map(item => item.trim()).filter(item => item);
    } else if (!Array.isArray(normalized.hobbies)) {
      normalized.hobbies = [];
    }
    
    // Normalize numeric fields
    if (normalized.height) {
      normalized.height = Number(normalized.height);
    }
    
    // Normalize spiritual status - ensure it's always an object
    if (typeof normalized.spiritualStatus === 'string') {
      try {
        normalized.spiritualStatus = JSON.parse(normalized.spiritualStatus);
      } catch (e) {
        normalized.spiritualStatus = {
          baptismStatus: 'Baptised Publisher',
          servicePosition: '',
          serviceType: ''
        };
      }
    } else if (!normalized.spiritualStatus || typeof normalized.spiritualStatus !== 'object') {
      normalized.spiritualStatus = {
        baptismStatus: 'Baptised Publisher',
        servicePosition: '',
        serviceType: ''
      };
    }
    
    // Normalize arrays
    if (!Array.isArray(normalized.languages)) {
      normalized.languages = [];
    }
    if (!Array.isArray(normalized.additionalPhotos)) {
      normalized.additionalPhotos = [];
    }
    
    // Remove validation helper fields that shouldn't be compared
    delete normalized.countryValid;
    delete normalized.stateValid;
    delete normalized.districtValid;
    
    return normalized;
  };

  /**
   * Check if form data has changed compared to original data
   */
  const hasDataChanged = (currentData, originalData) => {
    const normalizedCurrent = normalizeDataForComparison(currentData);
    const normalizedOriginal = normalizeDataForComparison(originalData);
    
    const changed = !deepEqual(normalizedCurrent, normalizedOriginal);
    
    // Debug logging
    if (changed) {
      console.log('Data has changed:');
      console.log('Current (normalized):', normalizedCurrent);
      console.log('Original (normalized):', normalizedOriginal);
    } else {
      console.log('No changes detected');
    }
    
    return changed;
  };

  /**
   * Load existing profile data or initialize for new user
   */
  const loadProfile = async () => {
    setLoading(true);
    try {
      const currentUser = await account.get();
      const baseData = { 
        userId: currentUser.$id, 
        email: currentUser.email 
      };
      
      setFormData(prev => ({ ...prev, ...baseData }));

      // Check for existing profile
      const response = await db.profiles.list([
        Query.equal('userId', currentUser.$id)
      ]);

      if (response.documents.length > 0) {
        const existingProfile = response.documents[0];
        setUserProfileDocumentId(existingProfile.$id);

        // Format date for HTML input
        let formattedDateOfBirth = '';
        if (existingProfile.dateOfBirth) {
          formattedDateOfBirth = new Date(existingProfile.dateOfBirth).toISOString().split('T')[0];
        }

        // Handle spiritual status - parse from string
        let spiritualStatus = {
          baptismStatus: 'Baptised Publisher',
          servicePosition: '',
          serviceType: ''
        };
        
        if (existingProfile.spiritualStatus) {
          if (typeof existingProfile.spiritualStatus === 'string') {
            try {
              spiritualStatus = JSON.parse(existingProfile.spiritualStatus);
            } catch (e) {
              console.warn('Failed to parse spiritualStatus:', e);
            }
          } else if (typeof existingProfile.spiritualStatus === 'object') {
            spiritualStatus = existingProfile.spiritualStatus;
          }
        }

        // Merge existing data with form structure
        const loadedData = {
          ...baseData,
          ...existingProfile,
          dateOfBirth: formattedDateOfBirth,
          // Handle nested JSON objects (parse if stored as strings)
          familyDetails: typeof existingProfile.familyDetails === 'string'
            ? JSON.parse(existingProfile.familyDetails) 
            : existingProfile.familyDetails || {},
          partnerPreferences: typeof existingProfile.partnerPreferences === 'string'
            ? JSON.parse(existingProfile.partnerPreferences) 
            : existingProfile.partnerPreferences || {},
          spiritualStatus: spiritualStatus,
          languages: Array.isArray(existingProfile.languages)
            ? existingProfile.languages
            : typeof existingProfile.languages === 'string'
              ? JSON.parse(existingProfile.languages)
              : [],
          additionalPhotos: Array.isArray(existingProfile.additionalPhotos)
            ? existingProfile.additionalPhotos
            : typeof existingProfile.additionalPhotos === 'string'
              ? JSON.parse(existingProfile.additionalPhotos)
              : [],
          // Ensure hobbies is always an array
          hobbies: Array.isArray(existingProfile.hobbies) 
            ? existingProfile.hobbies 
            : existingProfile.hobbies 
              ? [existingProfile.hobbies] 
              : []
        };

        setFormData(loadedData);
        setOriginalData(loadedData); // Store original data for comparison
        
        console.log("Loaded existing profile:", existingProfile);
      } else {
        console.log("No existing profile found. Starting new setup.");
        setOriginalData(baseData); // Store base data as original for new users
      }
    } catch (error) {
      console.error('Error loading profile or user:', error);
      alert('Could not load profile data. Please log in again.');
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save current form data to database
   * Used for incremental saves at each step
   */
  const saveCurrentData = async (dataToSave) => {
    try {
      // Prepare data for Appwrite (stringify JSON objects)
      const preparedData = {
        userId: dataToSave.userId,
        email: dataToSave.email,
        name: dataToSave.name || '',
        gender: dataToSave.gender || '',
        dateOfBirth: dataToSave.dateOfBirth || '',
        height: dataToSave.height || 0,
        maritalStatus: dataToSave.maritalStatus || '',
        congregation: dataToSave.congregation || '',
        motherTongue: dataToSave.motherTongue || '',
        country: dataToSave.country || '',
        state: dataToSave.state || '',
        district: dataToSave.district || '',
        profilePicFileId: dataToSave.profilePicFileId || null,
        aboutMe: dataToSave.aboutMe || '',
        education: dataToSave.education || '',
        occupation: dataToSave.occupation || '',
        hobbies: Array.isArray(dataToSave.hobbies) ? dataToSave.hobbies : [],
        // Keep arrays as native JavaScript arrays for Appwrite
        languages: Array.isArray(dataToSave.languages) ? dataToSave.languages : [],
        additionalPhotos: Array.isArray(dataToSave.additionalPhotos) ? dataToSave.additionalPhotos : [],
        // Stringify nested objects for Appwrite storage
        familyDetails: JSON.stringify(dataToSave.familyDetails || {}),
        partnerPreferences: JSON.stringify(dataToSave.partnerPreferences || {}),
        spiritualStatus: JSON.stringify(dataToSave.spiritualStatus || {
          baptismStatus: 'Baptised Publisher',
          servicePosition: '',
          serviceType: ''
        }),
      };

      let response;
      if (userProfileDocumentId) {
        // Update existing profile
        response = await db.profiles.update(userProfileDocumentId, preparedData);
        console.log('Profile updated successfully:', response);
      } else {
        // Create new profile
        response = await db.profiles.create(preparedData);
        setUserProfileDocumentId(response.$id);
        console.log('Profile created successfully:', response);
      }

      // Notify navbar of profile update
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      
      return response;
    } catch (error) {
      console.error('Error saving profile data:', error);
      throw error;
    }
  };

  /**
   * Show notification message
   */
  const showNotification = (message, type = 'success') => {
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'info' ? 'bg-blue-500' : 'bg-gray-500';
    
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
    }, 3000);
  };

  /**
   * Navigation handlers with change detection and conditional saving
   */
  const handleNext = async (stepData = null) => {
    setSubmitLoading(true);
    
    try {
      // Update form data with new step data
      let updatedFormData = formData;
      if (stepData) {
        updatedFormData = {
          ...formData,
          ...stepData,
          // Deep merge nested objects if present
          familyDetails: stepData.familyDetails 
            ? { ...formData.familyDetails, ...stepData.familyDetails }
            : formData.familyDetails,
          partnerPreferences: stepData.partnerPreferences
            ? { ...formData.partnerPreferences, ...stepData.partnerPreferences }
            : formData.partnerPreferences,
          // Handle spiritualStatus - keep as object
          spiritualStatus: stepData.spiritualStatus || formData.spiritualStatus,
          languages: stepData.languages || formData.languages,
          additionalPhotos: stepData.additionalPhotos || formData.additionalPhotos,
        };
        setFormData(updatedFormData);
      }

      // Check if data has actually changed
      const dataChanged = hasDataChanged(updatedFormData, originalData);
      
      if (dataChanged) {
        // Save current data to database
        await saveCurrentData(updatedFormData);
        
        // Update original data to reflect saved state
        setOriginalData(updatedFormData);
        
        // Show success notification
        showNotification('Progress saved! ✓', 'success');
      } else {
        // Show info notification that no changes were detected
        showNotification('No changes to save', 'info');
      }

      // Move to next step regardless of whether data was saved
      setCurrentStep(prev => Math.min(prev + 1, 4));
      
    } catch (error) {
      console.error('Error saving step data:', error);
      alert('Failed to save progress. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  /**
   * Update form data from child components
   * Handles both flat fields and nested objects
   * 
   * @param {Object} newData - New data from step components
   */
  const updateFormData = (newData) => {
    setFormData(prev => {
      console.log("--- ProfileSetupPage updateFormData ---");
      console.log("Previous state:", prev);
      console.log("New data from child:", newData);
      
      // Shallow merge all top-level properties
      let updatedData = { ...prev, ...newData };

      // Deep merge nested objects if present
      if (newData.familyDetails) {
        updatedData.familyDetails = { ...prev.familyDetails, ...newData.familyDetails };
      }
      
      if (newData.partnerPreferences) {
        updatedData.partnerPreferences = { ...prev.partnerPreferences, ...newData.partnerPreferences };
      }

      // Handle spiritualStatus - keep as object
      if (newData.spiritualStatus) {
        updatedData.spiritualStatus = newData.spiritualStatus;
      }

      if (newData.languages) {
        updatedData.languages = newData.languages;
      }

      if (newData.additionalPhotos) {
        updatedData.additionalPhotos = newData.additionalPhotos;
      }
      
      return updatedData;
    });
  };

  /**
   * Handle final form submission (Step 4)
   * Saves complete profile data to database only if changes detected
   * 
   * @param {Object} finalStepData - Data from the final step
   */
  const handleSubmitFinal = async (finalStepData) => {
    setSubmitLoading(true);
    
    try {
      // Combine all form data
      const completeFormData = {
        ...formData,
        ...finalStepData,
        // Ensure nested objects are properly merged
        partnerPreferences: { 
          ...(formData.partnerPreferences || {}), 
          ...(finalStepData.partnerPreferences || {}) 
        },
      };

      // Check if data has actually changed
      const dataChanged = hasDataChanged(completeFormData, originalData);
      
      if (dataChanged) {
        // Save final data
        await saveCurrentData(completeFormData);
        
        // Update original data to reflect saved state
        setOriginalData(completeFormData);
        
        // Success notification with completion message
        showNotification('Profile setup complete! 🎉', 'success');
      } else {
        // Show completion message even if no changes
        showNotification('Profile setup complete! 🎉', 'success');
      }
      
      // Navigate to dashboard after a brief delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Error saving final profile:', error);
      alert('Failed to complete profile setup. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * Render the appropriate step component
   */
  const renderStep = () => {
    const totalSteps = 4;
    const stepProps = {
      formData,
      updateFormData,
      currentStep,
      totalSteps,
      onNext: handleNext,
      onBack: handleBack,
      isLoading: submitLoading,
    };

    switch (currentStep) {
      case 1:
        return <Step1BasicInfo {...stepProps} />;
      case 2:
        return <Step2Family {...stepProps} />;
      case 3:
        return <Step3About {...stepProps} />;
      case 4:
        return (
          <Step4PartnerPreferences
            {...stepProps}
            onSubmit={handleSubmitFinal}
          />
        );
      default:
        return null;
    }
  };

  // Simple loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we prepare everything for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Setup</h1>
          <p className="text-gray-600">Complete your profile to find your perfect match</p>
        </div>
        
        <ProgressBar currentStep={currentStep} totalSteps={4} />
        
        {/* Step Content with Animation */}
        <div className="transition-all duration-500 ease-in-out transform">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

export default ProfileSetupPage;