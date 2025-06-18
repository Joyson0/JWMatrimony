// src/pages/ProfileSetupPage.jsx
import React, { useState, useEffect } from 'react';
import { account } from '../lib/appwrite';
import { data, useNavigate } from 'react-router-dom';
import { Query } from 'appwrite'; // Query is still needed for listDocuments
import useTitle from '../hooks/useTitle'; // Your custom hook
import { db } from '../lib/database'; // Import the db object

import ProgressBar from '../components/wizard/ProgressBar';
import Step1BasicInfo from '../components/wizard/Step1BasicInfo';
import Step2Family from '../components/wizard/Step2Family';
import Step3About from '../components/wizard/Step3About';
import Step4PartnerPreferences from '../components/wizard/Step4PartnerPreferences';

function ProfileSetupPage() {
  useTitle('Profile Setup Wizard - MatrimonyMatch');
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    userId: '',
    email: '',
    // Initialize complex objects if they don't exist
    familyDetails: {},
    partnerPreferences: {},
    // Default values for other fields to prevent errors with React Hook Form
    name: '', gender: '', dateOfBirth: '', height: 0, maritalStatus: '', motherTongue: '',
    country: '', state: '', district: '', profilePicFileId: null,
    fatherOccupation: '', motherOccupation: '', siblings: [],
    aboutMe: '', education: '', occupation: '', hobbies: [],
    minAge: 0, maxAge: 0, minHeight: 0, maxHeight: 0,
    preferredMaritalStatuses: [],
  });
  const [loading, setLoading] = useState(true);
  const [userProfileDocumentId, setUserProfileDocumentId] = useState(null); // Appwrite document ID
  const [submitLoading, setSubmitLoading] = useState(false);


  // Effect to load existing profile data or initialize for a new user
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const currentUser = await account.get();
        setFormData(prev => ({ ...prev, userId: currentUser.$id, email: currentUser.email }));

        const response = await db.profiles.list([Query.equal('userId', currentUser.$id)]);

        if (response.documents.length > 0) {
          const existingProfile = response.documents[0];
          setUserProfileDocumentId(existingProfile.$id);

          let formattedDateOfBirth = '';
          if (existingProfile.dateOfBirth) {
            // Convert Appwrite's ISO string to YYYY-MM-DD for input type="date"
            formattedDateOfBirth = new Date(existingProfile.dateOfBirth).toISOString().split('T')[0];
          }

          // Deep merge existing data into formData state
          setFormData(prev => ({
            ...prev,
            ...existingProfile,
            dateOfBirth: formattedDateOfBirth,
            // Ensure nested JSON objects are correctly handled if they are stored as JSON strings in older Appwrite
            familyDetails: typeof existingProfile.familyDetails === 'string'
                ? JSON.parse(existingProfile.familyDetails) : existingProfile.familyDetails || {},
            partnerPreferences: typeof existingProfile.partnerPreferences === 'string'
                ? JSON.parse(existingProfile.partnerPreferences) : existingProfile.partnerPreferences || {},
          }));
          // console.log("Loaded existing profile:", existingProfile);
        } else {
          console.log("No existing profile found. Starting new setup.");
        }
      } catch (error) {
        console.error('Error loading profile or user:', error);
        alert('Could not load profile data. Please log in again.');
        navigate('/auth'); // Redirect to login if user not found/session expired
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [navigate]);

  const handleNext = () => {
    console.log("ProfileSetupPage: Moving to next step. Current:", currentStep, "Next:", currentStep + 1);
    setCurrentStep(prev => Math.min(prev + 1, 4)); // Max 4 steps
  };

  const handleBack = () => {
    console.log("ProfileSetupPage: Moving to previous step. Current:", currentStep, "Back:", currentStep - 1);
    setCurrentStep(prev => Math.max(prev - 1, 1)); // Min 1 step
  };

  const updateFormData = (newData) => {
    setFormData(prev => {
      console.log("--- ProfileSetupPage updateFormData ---");
        console.log("ProfileSetupPage updateFormData: 'prev' state (before merge):", prev);
        console.log("ProfileSetupPage updateFormData: 'newData' received from child:", newData);
      // 1. Start by shallow-merging all top-level properties from newData into prev.
      // This correctly updates fields like name, gender, education, etc.
      let updatedData = { ...prev, ...newData };

      // 2. Explicitly handle deep merging for nested JSON objects if they are present in newData.
      // We check for truthiness of newData.familyDetails (meaning it's an object from the child component).
      if (newData.familyDetails) {
          updatedData.familyDetails = { ...prev.familyDetails, ...newData.familyDetails };
          console.log("ProfileSetupPage updateFormData: familyDetails MERGED.");
      }
      if (newData.partnerPreferences) {
          updatedData.partnerPreferences = { ...prev.partnerPreferences, ...newData.partnerPreferences };
          console.log("ProfileSetupPage updateFormData: partnerPreferences MERGED.");
      } else {
        console.log("ProfileSetupPage updateFormData: newData.partnerPreferences was NOT present or truthy.");
      }
      // console.log("Updated data:", updatedData); // Debug
      console.log("ProfileSetupPage updateFormData: 'updatedData' (resulting formData) AFTER merge logic:", updatedData)
      return updatedData;
    });
  };

  const handleSubmitFinal = async (finalStepData) => {
    setSubmitLoading(true);
    console.log("finalSepData:", finalStepData)
      console.log("formData:", formData)
    try {
      
      const completeFormDataForSave = {
        
        ...formData, // This brings in all data from previous steps
        ...finalStepData, // This overlays the latest data from Step 4
        // Ensure nested objects are fully represented from finalStepData
        // familyDetails: { ...(formData.familyDetails || {}), ...(finalStepData.familyDetails || {}) },
        partnerPreferences: { ...(formData.partnerPreferences || {}), ...(finalStepData.partnerPreferences || {}) },
      };

      // Prepare data for Appwrite. Ensure JSON fields are objects.
      const dataToSave = {
        userId: completeFormDataForSave.userId,
        email: completeFormDataForSave.email,
        name: completeFormDataForSave.name,
        gender: completeFormDataForSave.gender,
        dateOfBirth: completeFormDataForSave.dateOfBirth, // Appwrite will handle ISO string from Date object
        height: completeFormDataForSave.height,
        maritalStatus: completeFormDataForSave.maritalStatus,
        congregation: completeFormDataForSave.congregation,
        motherTongue: completeFormDataForSave.motherTongue,
        country: completeFormDataForSave.country,
        state: completeFormDataForSave.state,
        district: completeFormDataForSave.district,
        profilePicFileId: completeFormDataForSave.profilePicFileId,
        aboutMe: completeFormDataForSave.aboutMe,
        education: completeFormDataForSave.education,
        occupation: completeFormDataForSave.occupation,
        hobbies: completeFormDataForSave.hobbies, // Array of strings is fine

        // These should be stringifyed JSON objects for Appwrite's string type
        familyDetails: JSON.stringify(completeFormDataForSave.familyDetails),
        partnerPreferences: JSON.stringify(completeFormDataForSave.partnerPreferences),

        // Add other fields from the schema as needed
        // isVerified: false, // Default to false, admin verifies later
        // lastOnline: new Date().toISOString(), // Current timestamp
      };

      console.log("--- ProfileSetupPage handleSubmitFinal ---");
      console.log("dataToSave: ", dataToSave)

      let response;
      if (userProfileDocumentId) {
        // Update existing profile document
        response = await db.profiles.update(
          userProfileDocumentId,
          dataToSave,
        );
        console.log('Profile updated successfully:', response);
      } else {
        // Create new profile document
        // ID.unique() is handled by default in db.profiles.create
        response = await db.profiles.create(dataToSave);
        console.log('Profile created successfully:', response);
        // Optionally, you might want to set userProfileDocumentId from response.$id here if needed for immediate further actions
      }

      // Dispatch custom event to notify navbar of profile update
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      
      alert('Profile setup complete!');
      navigate('/dashboard'); // Redirect to dashboard or home page
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading Profile Data...</p>
      </div>
    );
  }

  const renderStep = () => {
    const totalSteps = 4; // Define total steps here
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            currentStep={currentStep} // Pass currentStep
            totalSteps={totalSteps}   // Pass totalSteps
            onBack={handleBack}       // Add onBack here for consistency, though it won't be active on Step 1
          />
        );
      case 2:
        return (
          <Step2Family
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            currentStep={currentStep} // Pass currentStep
            totalSteps={totalSteps}   // Pass totalSteps
          />
        );
      case 3:
        return (
          <Step3About
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            currentStep={currentStep} // Pass currentStep
            totalSteps={totalSteps}   // Pass totalSteps
          />
        );
      case 4:
        return (
          <Step4PartnerPreferences
            formData={formData}
            updateFormData={updateFormData}
            onBack={handleBack}
            onSubmit={(step4Data) => handleSubmitFinal(step4Data)} // Final submission on this step
            currentStep={currentStep} // Pass currentStep
            totalSteps={totalSteps}   // Pass totalSteps
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <ProgressBar currentStep={currentStep} totalSteps={4} />
      {renderStep()}
    </div>
  );
}

export default ProfileSetupPage;