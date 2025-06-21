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
   * Navigation handlers with smooth transitions
   */
  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
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
        // console.log("familyDetails merged");
      }
      
      if (newData.partnerPreferences) {
        updatedData.partnerPreferences = { ...prev.partnerPreferences, ...newData.partnerPreferences };
        // console.log("partnerPreferences merged");
      }
      
      // console.log("Updated form data:", updatedData);
      return updatedData;
    });
  };

  /**
   * Handle final form submission
   * Saves complete profile data to database
   * 
   * @param {Object} finalStepData - Data from the final step
   */
  const handleSubmitFinal = async (finalStepData) => {
    setSubmitLoading(true);
    // console.log("Final step data:", finalStepData);
    console.log("Current form data:", formData);
    
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

      // Prepare data for Appwrite (stringify JSON objects)
      const dataToSave = {
        userId: completeFormData.userId,
        email: completeFormData.email,
        name: completeFormData.name,
        gender: completeFormData.gender,
        dateOfBirth: completeFormData.dateOfBirth,
        height: completeFormData.height,
        maritalStatus: completeFormData.maritalStatus,
        congregation: completeFormData.congregation,
        motherTongue: completeFormData.motherTongue,
        country: completeFormData.country,
        state: completeFormData.state,
        district: completeFormData.district,
        profilePicFileId: completeFormData.profilePicFileId,
        aboutMe: completeFormData.aboutMe,
        education: completeFormData.education,
        occupation: completeFormData.occupation,
        hobbies: completeFormData.hobbies,
        // Stringify nested objects for Appwrite storage
        familyDetails: JSON.stringify(completeFormData.familyDetails),
        partnerPreferences: JSON.stringify(completeFormData.partnerPreferences),
      };

      // console.log("Data to save:", dataToSave);

      // Save to database (create or update)
      let response;
      if (userProfileDocumentId) {
        response = await db.profiles.update(userProfileDocumentId, dataToSave);
        console.log('Profile updated successfully:', response);
      } else {
        response = await db.profiles.create(dataToSave);
        // console.log('Profile created successfully:', response);
      }

      // Notify navbar of profile update
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      
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
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
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

  // Simple loading state - removed the duplicate animation
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