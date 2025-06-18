// src/components/wizard/Step1BasicInfo.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { basicInfoSchema } from './ValidationSchemas';
import { storage } from '../../lib/appwrite'; // Appwrite Storage for file upload
import { ID } from 'appwrite'; // For Appwrite's ID.unique()
import WizardNavigation from './WizardNavigation';

const ProfilePicBucketId = import.meta.env.VITE_BUCKET_ID; // TODO: Create this bucket in Appwrite Storage

function Step1BasicInfo({ formData, updateFormData, onNext, currentStep, totalSteps }) {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: yupResolver(basicInfoSchema),
    defaultValues: formData, // Pre-fill with existing data
  });

  //Use useEffect to reset form when formData prop changes
  // useEffect(() => {
  //   reset(formData);
  // }, [formData, reset]); // Depend on formData and the reset function


  const profilePicFileId = watch('profilePicFileId'); // Watch the file ID for display

  // Simulate fetching location data (as discussed previously, could be an Appwrite Function)
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    // FIXME: Dummy location data - replace with actual API calls
    const dummyLocations = {
      India: {
        Maharashtra: ['Mumbai', 'Pune', 'Nagpur'],
        Delhi: ['New Delhi'],
      },
    };
    setCountries(Object.keys(dummyLocations));
    // Set states/districts based on initial formData.country and .state
    if (formData.country && dummyLocations[formData.country]) {
      setStates(Object.keys(dummyLocations[formData.country]));
      if (formData.state && dummyLocations[formData.country][formData.state]) {
        setDistricts(dummyLocations[formData.country][formData.state]);
      }
    }
  }, [formData.country, formData.state]);


  const handleFileChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      try {
        // Upload file to Appwrite Storage
        const uploadedFile = await storage.createFile(
          ProfilePicBucketId,
          ID.unique(), // Use ID.unique() for file ID
          file
        );
        setValue('profilePicFileId', uploadedFile.$id); // Store the file ID in form data
        console.log('File uploaded:', uploadedFile);
      } catch (error) {
        console.error('File upload failed:', error);
        alert('Failed to upload profile picture. Please try again.');
        setValue('profilePicFileId', null); // Clear if upload fails
      }
    }
  };

  const onSubmit = (data) => {
    updateFormData(data); // Update parent's state
    onNext();             // Move to next step
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Step 1: Basic Information</h2>

      <div style={{ marginBottom: '15px' }}>
        <label>Name:</label>
        <input type="text" {...register('name')} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        {errors.name && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.name.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Gender:</label>
        <select {...register('gender')} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        {errors.gender && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.gender.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Date of Birth:</label>
        <input type="date" {...register('dateOfBirth')} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        {errors.dateOfBirth && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.dateOfBirth.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Height (cm):</label>
        <input type="number" {...register('height')} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        {errors.height && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.height.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Marital Status:</label>
        <select {...register('maritalStatus')} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
          <option value="">Select Status</option>
          <option value="Never Married">Never Married</option>
          <option value="Divorced">Divorced</option>
          <option value="Widowed">Widowed</option>
        </select>
        {errors.maritalStatus && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.maritalStatus.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Mother Tongue:</label>
        <input type="text" {...register('motherTongue')} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        {errors.motherTongue && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.motherTongue.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Congregation:</label>
        <input type="text" {...register('congregation')} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        {errors.congregation && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.congregation.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Country:</label>
        <select {...register('country')} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
          <option value="">Select Country</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.country && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.country.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>State:</label>
        <select {...register('state')} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
          <option value="">Select State</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {errors.state && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.state.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>District:</label>
        <select {...register('district')} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
          <option value="">Select District</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        {errors.district && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.district.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Profile Picture:</label>
        <input type="file" onChange={handleFileChange} accept="image/*" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        {profilePicFileId && (
            <img
                src={storage.getFilePreview(ProfilePicBucketId, profilePicFileId).href}
                alt="Profile Preview"
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', marginTop: '10px' }}
            />
        )}
        {errors.profilePicFileId && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.profilePicFileId.message}</p>}
      </div>

      <WizardNavigation currentStep={currentStep} totalSteps={totalSteps} onNext={handleSubmit(onSubmit)} />
    </form>
  );
}

export default Step1BasicInfo;