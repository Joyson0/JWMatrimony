import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { basicInfoSchema } from './ValidationSchemas';
import { storage } from '../../lib/appwrite';
import { ID } from 'appwrite';
import WizardNavigation from './WizardNavigation';
import { FiUpload, FiUser, FiCalendar, FiMapPin } from 'react-icons/fi';

const ProfilePicBucketId = import.meta.env.VITE_BUCKET_ID;

// Helper to convert YYYY-MM-DD from input to an ISO UTC string (midnight UTC)
const formatInputDateToISOUTC = (dateObj) => {
  if (!dateObj) return null;
  try {
    // Extract the year, month, and day
    const year = dateObj.getFullYear();
    // getMonth() returns month from 0-11, so add 1
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    // getDate() returns day of the month
    const day = dateObj.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Error converting input date to ISO UTC:", e);
    return null;
  }
};

/**
 * Step 1: Basic Information Form
 * Modern, card-based design with icons and smooth animations
 */
function Step1BasicInfo({ formData, updateFormData, onNext, currentStep, totalSteps }) {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: yupResolver(basicInfoSchema),
    defaultValues: {
      ...formData
    },
  });

  const profilePicFileId = watch('profilePicFileId');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    // When formData prop updates (e.g., after async load from parent),
    // reset the form with new default values, formatting dateOfBirth for the input.
    reset({
      ...formData,
    });
  }, [formData, reset]);

  useEffect(() => {
    // Initialize location data
    const dummyLocations = {
      India: {
        Maharashtra: ['Mumbai', 'Pune', 'Nagpur'],
        Delhi: ['New Delhi'],
      },
    };
    setCountries(Object.keys(dummyLocations));
    
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
      setUploadingImage(true);
      
      try {
        const uploadedFile = await storage.createFile(
          ProfilePicBucketId,
          ID.unique(),
          file
        );
        setValue('profilePicFileId', uploadedFile.$id);
        console.log('File uploaded:', uploadedFile);
      } catch (error) {
        console.error('File upload failed:', error);
        alert('Failed to upload profile picture. Please try again.');
        setValue('profilePicFileId', null);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const onSubmit = (dataFromForm) => {
    // dataFromForm.dateOfBirth is YYYY-MM-DD from the input
    const dataToUpdate = {
      ...dataFromForm,
      dateOfBirth: formatInputDateToISOUTC(dataFromForm.dateOfBirth), // Convert to ISO UTC string
    };
    updateFormData(dataToUpdate);
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FiUser className="w-6 h-6" />
            Basic Information
          </h2>
          <p className="text-blue-100 mt-2">Let's start with your basic details</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8">
          {/* Profile Picture Section */}
          <div className="mb-8 text-center">
            <div className="relative inline-block">
              {profilePicFileId ? (
                <div className="relative">
                  <img
                    src={storage.getFilePreview(ProfilePicBucketId, profilePicFileId).href}
                    alt="Profile Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-4 border-white shadow-lg">
                  <FiUser className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg">
                <FiUpload className="w-4 h-4" />
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">Click the upload icon to add your photo</p>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="w-4 h-4">⚠️</span>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender *
              </label>
              <select
                {...register('gender')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="w-4 h-4">⚠️</span>
                  {errors.gender.message}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiCalendar className="w-4 h-4" />
                Date of Birth *
              </label>
              <input
                type="date"
                {...register('dateOfBirth')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="w-4 h-4">⚠️</span>
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Height (cm) *
              </label>
              <input
                type="number"
                {...register('height')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., 170"
              />
              {errors.height && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="w-4 h-4">⚠️</span>
                  {errors.height.message}
                </p>
              )}
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Marital Status *
              </label>
              <select
                {...register('maritalStatus')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Status</option>
                <option value="Never Married">Never Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
              {errors.maritalStatus && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="w-4 h-4">⚠️</span>
                  {errors.maritalStatus.message}
                </p>
              )}
            </div>

            {/* Mother Tongue */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mother Tongue *
              </label>
              <input
                type="text"
                {...register('motherTongue')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., English, Hindi, Spanish"
              />
              {errors.motherTongue && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="w-4 h-4">⚠️</span>
                  {errors.motherTongue.message}
                </p>
              )}
            </div>

            {/* Congregation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Congregation *
              </label>
              <input
                type="text"
                {...register('congregation')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Your congregation name"
              />
              {errors.congregation && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="w-4 h-4">⚠️</span>
                  {errors.congregation.message}
                </p>
              )}
            </div>

            {/* Location Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiMapPin className="w-5 h-5" />
                Location Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    {...register('country')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select Country</option>
                    {countries.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span className="w-4 h-4">⚠️</span>
                      {errors.country.message}
                    </p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    {...register('state')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select State</option>
                    {states.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span className="w-4 h-4">⚠️</span>
                      {errors.state.message}
                    </p>
                  )}
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    District
                  </label>
                  <select
                    {...register('district')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select District</option>
                    {districts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span className="w-4 h-4">⚠️</span>
                      {errors.district.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <WizardNavigation 
            currentStep={currentStep} 
            totalSteps={totalSteps} 
            onNext={handleSubmit(onSubmit)}
            isFirstStep={true}
          />
        </form>
      </div>
    </div>
  );
}

export default Step1BasicInfo;