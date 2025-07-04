import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { basicInfoSchema } from './ValidationSchemas';
import { storage } from '../../lib/appwrite';
import { ID } from 'appwrite';
import WizardNavigation from './WizardNavigation';
import ImageCropper from './ImageCropper';
import { FiUpload, FiUser, FiCalendar, FiMapPin, FiChevronDown, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import { GetCountries, GetState, GetCity } from 'react-country-state-city';
import { languages } from '../../data/languages';

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
 * Strict AutoSuggest Component for location fields
 * Only allows selection from dropdown, prevents custom input
 */
const StrictAutoSuggestField = ({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder, 
  disabled, 
  error,
  icon: Icon,
  validationError
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isValidSelection, setIsValidSelection] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  useEffect(() => {
    // Set display value when value prop changes
    if (value) {
      const selectedOption = options.find(option => option.id === value || option.name === value);
      if (selectedOption) {
        setSearchTerm(selectedOption.name);
        setIsValidSelection(true);
      } else {
        // Don't clear if we have a value but haven't loaded options yet
        if (options.length > 0) {
          setIsValidSelection(false);
        }
      }
    } else {
      setSearchTerm('');
      setIsValidSelection(false);
    }
  }, [value, options]);

  const handleSelect = (option) => {
    setSearchTerm(option.name);
    setIsValidSelection(true);
    setIsOpen(false);
    // Call onChange immediately with the selected option
    onChange(option);
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);
    setIsOpen(true);
    
    // Check if the input matches any option exactly
    const exactMatch = options.find(option => 
      option.name.toLowerCase() === inputValue.toLowerCase()
    );
    
    if (exactMatch) {
      setIsValidSelection(true);
      onChange(exactMatch);
    } else {
      setIsValidSelection(false);
      // Don't clear the selection immediately while typing
    }
  };

  const handleBlur = () => {
    // Use a longer timeout to allow for dropdown selection
    setTimeout(() => {
      setIsOpen(false);
      
      // Only validate and potentially clear after blur if the field is not empty
      if (searchTerm && searchTerm.length > 0) {
        const exactMatch = options.find(option => 
          option.name.toLowerCase() === searchTerm.toLowerCase()
        );
        
        if (!exactMatch) {
          // Clear invalid input only if it doesn't match any option
          setSearchTerm('');
          setIsValidSelection(false);
          onChange(null);
        } else {
          // Ensure the selection is properly set
          setIsValidSelection(true);
          onChange(exactMatch);
        }
      }
    }, 300); // Increased timeout to allow dropdown selection
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const hasValidationError = !isValidSelection && searchTerm && searchTerm.length > 0;

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 transition-all duration-200 ${
            disabled 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
              : hasValidationError
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                : isValidSelection && searchTerm
                  ? 'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white'
          }`}
          placeholder={disabled ? 'Select previous field first' : placeholder}
          autoComplete="off"
        />
        
        {/* Status Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {hasValidationError && (
            <FiAlertCircle className="w-4 h-4 text-red-500" />
          )}
          {isValidSelection && searchTerm && (
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          } ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
        
        {/* Dropdown */}
        {isOpen && !disabled && filteredOptions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onMouseDown={(e) => {
                  // Prevent blur event from firing before click
                  e.preventDefault();
                  handleSelect(option);
                }}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-150 border-b border-gray-100 last:border-b-0"
              >
                <span className="text-gray-900">{option.name}</span>
              </button>
            ))}
          </div>
        )}
        
        {/* No results */}
        {isOpen && !disabled && searchTerm && filteredOptions.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="px-4 py-3 text-gray-500 text-center">
              <FiAlertCircle className="w-5 h-5 mx-auto mb-2 text-red-500" />
              <p className="text-sm">No results found</p>
              <p className="text-xs text-red-600 mt-1">Please select from available options only</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Validation Error Messages */}
      {hasValidationError && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          <FiAlertCircle className="w-4 h-4" />
          Please select a valid option from the dropdown
        </p>
      )}
      
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          <span className="w-4 h-4">⚠️</span>
          {error.message}
        </p>
      )}
      
      {validationError && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          <FiAlertCircle className="w-4 h-4" />
          {validationError.message}
        </p>
      )}
    </div>
  );
};

/**
 * Step 1: Basic Information Form
 * Modern, card-based design with icons and smooth animations
 */
function Step1BasicInfo({ formData, updateFormData, onNext, currentStep, totalSteps, isLoading }) {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset, trigger } = useForm({
    resolver: yupResolver(basicInfoSchema),
    defaultValues: {
      ...formData
    },
  });

  const profilePicFileId = watch('profilePicFileId');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState(null);
  const [imageKey, setImageKey] = useState(0); // Force re-render of image
  
  // Location state management
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    // When formData prop updates (e.g., after async load from parent),
    // reset the form with new default values, formatting dateOfBirth for the input.
    reset({
      ...formData,
    });
  }, [formData, reset]);

  // Update profile image URL when profilePicFileId changes
  useEffect(() => {
    const updateProfileImageUrl = async () => {
      if (profilePicFileId && ProfilePicBucketId) {
        try {
          console.log('Generating image URL for file ID:', profilePicFileId);
          console.log('Using bucket ID:', ProfilePicBucketId);
          
          // Use simple getFileView without any query parameters
          const viewUrl = storage.getFileView(ProfilePicBucketId, profilePicFileId);
          const imageUrl = viewUrl.toString();
          
          console.log('Generated image URL:', imageUrl);
          
          setProfileImageUrl(imageUrl);
          setImageLoadError(false);
        } catch (error) {
          console.error('Error generating profile image URL:', error);
          setProfileImageUrl(null);
          setImageLoadError(true);
        }
      } else {
        console.log('No profilePicFileId or bucket ID available');
        console.log('profilePicFileId:', profilePicFileId);
        console.log('ProfilePicBucketId:', ProfilePicBucketId);
        setProfileImageUrl(null);
        setImageLoadError(false);
      }
    };

    updateProfileImageUrl();
  }, [profilePicFileId, imageKey]); // Include imageKey to force refresh

  // Initialize countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesData = await GetCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    };
    loadCountries();
  }, []);

  // Initialize location selections based on formData
  useEffect(() => {
    const initializeLocationData = async () => {
      if (formData.country && countries.length > 0) {
        // Find and set selected country
        const country = countries.find(c => c.name === formData.country);
        if (country) {
          setSelectedCountry(country);
          setValue('countryValid', true);
          
          // Load states for the selected country
          try {
            const statesData = await GetState(country.id);
            setStates(statesData);
            
            // If state is also selected, find and set it
            if (formData.state) {
              const state = statesData.find(s => s.name === formData.state);
              if (state) {
                setSelectedState(state);
                setValue('stateValid', true);
                
                // Load cities for the selected state
                try {
                  const citiesData = await GetCity(country.id, state.id);
                  setCities(citiesData);
                  
                  // If city is also selected, find and set it
                  if (formData.district) {
                    const city = citiesData.find(c => c.name === formData.district);
                    if (city) {
                      setSelectedCity(city);
                      setValue('districtValid', true);
                    }
                  }
                } catch (error) {
                  console.error('Error loading cities:', error);
                }
              }
            }
          } catch (error) {
            console.error('Error loading states:', error);
          }
        }
      }
    };

    initializeLocationData();
  }, [formData.country, formData.state, formData.district, countries, setValue]);

  const handleFileChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Validate file type - include WebP format
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a JPEG, PNG, or WebP image file.');
        return;
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('File size must be less than 5MB.');
        return;
      }
      
      // Create object URL for cropping
      const imageUrl = URL.createObjectURL(file);
      setSelectedImageForCrop(imageUrl);
      setShowCropper(true);
    }
  };

  const handleCropComplete = async (croppedFile) => {
    setUploadingImage(true);
    setShowCropper(false);
    
    // Clean up the object URL
    if (selectedImageForCrop) {
      URL.revokeObjectURL(selectedImageForCrop);
      setSelectedImageForCrop(null);
    }
    
    try {
      // Store the previous file ID for deletion
      const previousFileId = profilePicFileId;
      
      // Upload the new cropped image
      const uploadedFile = await storage.createFile(
        ProfilePicBucketId,
        ID.unique(),
        croppedFile
      );
      
      console.log('New profile picture uploaded successfully:', uploadedFile);
      
      // Update the form with the new file ID immediately
      setValue('profilePicFileId', uploadedFile.$id);
      
      // Update the parent component's form data immediately
      updateFormData({ profilePicFileId: uploadedFile.$id });
      
      // Delete the previous image if it exists
      if (previousFileId) {
        try {
          await storage.deleteFile(ProfilePicBucketId, previousFileId);
          console.log('Previous profile picture deleted:', previousFileId);
        } catch (deleteError) {
          console.warn('Could not delete previous profile picture:', deleteError);
          // Don't throw error here as the new upload was successful
        }
      }
      
      // Force image refresh by incrementing the key
      setImageKey(prev => prev + 1);
      
      // Immediately save to database if we have a user profile document ID
      try {
        const { db } = await import('../../lib/database');
        const { account } = await import('../../lib/appwrite');
        
        // Get current user
        const currentUser = await account.get();
        
        // Check if user has existing profile
        const { Query } = await import('appwrite');
        const response = await db.profiles.list([
          Query.equal('userId', currentUser.$id)
        ]);
        
        if (response.documents.length > 0) {
          // Update existing profile with new image ID
          const profileDoc = response.documents[0];
          await db.profiles.update(profileDoc.$id, {
            profilePicFileId: uploadedFile.$id
          });
          console.log('Database updated with new profile picture ID');
        }
      } catch (dbError) {
        console.warn('Could not immediately update database:', dbError);
        // Don't throw error as the upload was successful
      }
      
      // Trigger immediate navbar update with a slight delay to ensure database is updated
      setTimeout(() => {
        console.log('Triggering navbar profile update');
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      }, 500);
      
      // Show success notification
      showNotification('Profile picture updated successfully! ✓', 'success');
      
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Failed to upload profile picture. Please try again.');
      setValue('profilePicFileId', profilePicFileId); // Revert to previous value
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    
    // Clean up the object URL
    if (selectedImageForCrop) {
      URL.revokeObjectURL(selectedImageForCrop);
      setSelectedImageForCrop(null);
    }
  };

  /**
   * Handle removing the current profile picture
   */
  const handleRemoveProfilePicture = async () => {
    if (!profilePicFileId) return;
    
    // Confirm removal
    if (!confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }
    
    setRemovingImage(true);
    
    try {
      // Delete from storage
      await storage.deleteFile(ProfilePicBucketId, profilePicFileId);
      console.log('Profile picture deleted from storage:', profilePicFileId);
      
      // Update form state
      setValue('profilePicFileId', null);
      updateFormData({ profilePicFileId: null });
      
      // Force image refresh
      setImageKey(prev => prev + 1);
      
      // Update database immediately
      try {
        const { db } = await import('../../lib/database');
        const { account } = await import('../../lib/appwrite');
        
        // Get current user
        const currentUser = await account.get();
        
        // Check if user has existing profile
        const { Query } = await import('appwrite');
        const response = await db.profiles.list([
          Query.equal('userId', currentUser.$id)
        ]);
        
        if (response.documents.length > 0) {
          // Update existing profile to remove image ID
          const profileDoc = response.documents[0];
          await db.profiles.update(profileDoc.$id, {
            profilePicFileId: null
          });
          console.log('Database updated - profile picture removed');
        }
      } catch (dbError) {
        console.warn('Could not immediately update database:', dbError);
      }
      
      // Trigger navbar update
      setTimeout(() => {
        console.log('Triggering navbar profile update after removal');
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      }, 500);
      
      // Show success notification
      showNotification('Profile picture removed successfully', 'success');
      
    } catch (error) {
      console.error('Failed to remove profile picture:', error);
      alert('Failed to remove profile picture. Please try again.');
    } finally {
      setRemovingImage(false);
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

  const handleCountryChange = async (country) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCity(null);
    setStates([]);
    setCities([]);
    
    setValue('country', country ? country.name : '');
    setValue('state', '');
    setValue('district', '');
    setValue('countryValid', !!country);
    setValue('stateValid', true); // Reset state validation
    setValue('districtValid', true); // Reset district validation
    
    if (country) {
      try {
        const statesData = await GetState(country.id);
        setStates(statesData);
      } catch (error) {
        console.error('Error loading states:', error);
      }
    }
    
    // Trigger validation
    trigger(['countryValid', 'stateValid', 'districtValid']);
  };

  const handleStateChange = async (state) => {
    setSelectedState(state);
    setSelectedCity(null);
    setCities([]);
    
    setValue('state', state ? state.name : '');
    setValue('district', '');
    setValue('stateValid', !!state);
    setValue('districtValid', true); // Reset district validation
    
    if (state && selectedCountry) {
      try {
        const citiesData = await GetCity(selectedCountry.id, state.id);
        setCities(citiesData);
      } catch (error) {
        console.error('Error loading cities:', error);
      }
    }
    
    // Trigger validation
    trigger(['stateValid', 'districtValid']);
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setValue('district', city ? city.name : '');
    setValue('districtValid', !!city);
    
    // Trigger validation
    trigger('districtValid');
  };

  const handleImageError = () => {
    console.log('Image failed to load');
    setImageLoadError(true);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setImageLoadError(false);
  };

  const onSubmit = (dataFromForm) => {
    // Remove validation helper fields before submitting
    const { countryValid, stateValid, districtValid, ...cleanData } = dataFromForm;
    
    // dataFromForm.dateOfBirth is YYYY-MM-DD from the input
    const dataToUpdate = {
      ...cleanData,
      dateOfBirth: formatInputDateToISOUTC(cleanData.dateOfBirth), // Convert to ISO UTC string
    };
    
    // Call onNext with the data to save
    onNext(dataToUpdate);
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
          {/* Hidden validation fields */}
          <input type="hidden" {...register('countryValid')} />
          <input type="hidden" {...register('stateValid')} />
          <input type="hidden" {...register('districtValid')} />

          {/* Profile Picture Section */}
          <div className="mb-8 text-center">
            <div className="relative inline-block">
              {profileImageUrl && !imageLoadError ? (
                <div className="relative group">
                  <img
                    key={imageKey} // Force re-render when key changes
                    src={profileImageUrl}
                    alt="Profile Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    crossOrigin="anonymous"
                  />
                  {(uploadingImage || removingImage) && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
                    </div>
                  )}
                  
                  {/* Remove button - appears on hover */}
                  {!uploadingImage && !removingImage && (
                    <button
                      type="button"
                      onClick={handleRemoveProfilePicture}
                      className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110 shadow-lg"
                      title="Remove profile picture"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-4 border-white shadow-lg">
                  {(uploadingImage || removingImage) ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-400 border-t-transparent" />
                  ) : (
                    <FiUser className="w-12 h-12 text-gray-400" />
                  )}
                </div>
              )}
              
              {/* Upload button */}
              {!removingImage && (
                <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg">
                  <FiUpload className="w-4 h-4" />
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={uploadingImage || removingImage}
                  />
                </label>
              )}
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500">Click the upload icon to add your photo</p>
              <p className="text-xs text-gray-400 mt-1">Supported: JPEG, PNG, WebP (Max 5MB)</p>
              {profileImageUrl && !uploadingImage && !removingImage && (
                <p className="text-xs text-gray-500 mt-1">Hover over image to remove</p>
              )}
              {imageLoadError && (
                <p className="text-xs text-red-500 mt-1">Failed to load image. Please try uploading again.</p>
              )}
            </div>
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
              <select
                {...register('motherTongue')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Mother Tongue</option>
                {languages.map(language => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
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
              
              {/* Important Notice */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Location Selection Guidelines</h4>
                    <p className="text-sm text-blue-700">
                      Please type to search and select from the dropdown options only. 
                      Custom entries are not allowed to ensure data consistency.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Country */}
                <StrictAutoSuggestField
                  label="Country *"
                  options={countries}
                  value={selectedCountry?.name || ''}
                  onChange={handleCountryChange}
                  placeholder="Search and select country"
                  disabled={false}
                  error={errors.country}
                  validationError={errors.countryValid}
                  icon={FiMapPin}
                />

                {/* State */}
                <StrictAutoSuggestField
                  label="State"
                  options={states}
                  value={selectedState?.name || ''}
                  onChange={handleStateChange}
                  placeholder="Search and select state"
                  disabled={!selectedCountry}
                  error={errors.state}
                  validationError={errors.stateValid}
                />

                {/* District/City */}
                <StrictAutoSuggestField
                  label="District/City"
                  options={cities}
                  value={selectedCity?.name || ''}
                  onChange={handleCityChange}
                  placeholder="Search and select city"
                  disabled={!selectedState}
                  error={errors.district}
                  validationError={errors.districtValid}
                />
              </div>
            </div>
          </div>

          <WizardNavigation 
            currentStep={currentStep} 
            totalSteps={totalSteps} 
            onNext={handleSubmit(onSubmit)}
            isFirstStep={true}
            isLoading={isLoading}
          />
        </form>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && selectedImageForCrop && (
        <ImageCropper
          imageSrc={selectedImageForCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}

export default Step1BasicInfo;