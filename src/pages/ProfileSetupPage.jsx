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
 * Saves data at each step for better user experience.
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
    
    // Complex nested objects
    familyDetails: {},
    partnerPreferences: {},
  });

  // Load existing profile data or initialize for new user
  useEffect(() => {
    loadProfile();
  }, [navigate]);

  /**
   * Load existing profile data or initialize for new user
   */
  const loadProfile = async () => {
    setLoading(true);
    try {
      const currentUser = await account.get();
      setFormData(prev => ({ 
        ...prev, 
        userId: currentUser.$id, 
        email: currentUser.email 
      }));

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

        // Merge existing data with form structure
        setFormData(prev => ({
          ...prev,
          ...existingProfile,
          dateOfBirth: formattedDateOfBirth,
          // Handle nested JSON objects (parse if stored as strings)
          familyDetails: typeof existingProfile.familyDetails === 'string'
            ? JSON.parse(existingProfile.familyDetails) 
            : existingProfile.familyDetails || {},
          partnerPreferences: typeof existingProfile.partnerPreferences === 'string'
            ? JSON.parse(existingProfile.partnerPreferences) 
            : existingProfile.partnerPreferences || {},
        }));
        
        console.log("Loaded existing profile:", existingProfile);
      } else {
        console.log("No existing profile found. Starting new setup.");
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
        hobbies: dataToSave.hobbies || [],
        // Stringify nested objects for Appwrite storage
        familyDetails: JSON.stringify(dataToSave.familyDetails || {}),
        partnerPreferences: JSON.stringify(dataToSave.partnerPreferences || {}),
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
   * Navigation handlers with data saving
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
        };
        setFormData(updatedFormData);
      }

      // Save current data to database
      await saveCurrentData(updatedFormData);
      
      // Show success notification
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
      successDiv.textContent = 'Progress saved! ✓';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        successDiv.classList.remove('translate-x-full');
      }, 100);
      
      setTimeout(() => {
        successDiv.classList.add('translate-x-full');
        setTimeout(() => document.body.removeChild(successDiv), 300);
      }, 2000);

      // Move to next step
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
      
      return updatedData;
    });
  };

  /**
   * Handle final form submission (Step 4)
   * Saves complete profile data to database
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

      // Save final data
      await saveCurrentData(completeFormData);
      
      // Success notification with smooth transition
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
      successDiv.textContent = 'Profile setup complete! 🎉';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        successDiv.classList.remove('translate-x-full');
      }, 100);
      
      setTimeout(() => {
        successDiv.classList.add('translate-x-full');
        setTimeout(() => document.body.removeChild(successDiv), 300);
      }, 3000);
      
      navigate('/dashboard');
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