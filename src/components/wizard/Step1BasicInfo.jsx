import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { basicInfoSchema } from './ValidationSchemas';
import { storage } from '../../lib/appwrite';
import { ID } from 'appwrite';
import WizardNavigation from './WizardNavigation';
import { FiUpload, FiUser, FiCalendar, FiMapPin, FiChevronDown } from 'react-icons/fi';
import { GetCountries, GetState, GetCity } from 'react-country-state-city';

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
 * AutoSuggest Component for location fields
 */
const AutoSuggestField = ({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder, 
  disabled, 
  error,
  icon: Icon 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);

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
      }
    } else {
      setSearchTerm('');
    }
  }, [value, options]);

  const handleSelect = (option) => {
    setSearchTerm(option.name);
    onChange(option);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    
    // If input is cleared, clear the selection
    if (!e.target.value) {
      onChange(null);
    }
  };

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
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
            disabled 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
              : 'border-gray-300 bg-white'
          }`}
          placeholder={disabled ? 'Select previous field first' : placeholder}
        />
        <FiChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        } ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
        
        {/* Dropdown */}
        {isOpen && !disabled && filteredOptions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option)}
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
              No results found
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          <span className="w-4 h-4">⚠️</span>
          {error.message}
        </p>
      )}
    </div>
  );
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
          
          // Load states for the selected country
          try {
            const statesData = await GetState(country.id);
            setStates(statesData);
            
            // If state is also selected, find and set it
            if (formData.state) {
              const state = statesData.find(s => s.name === formData.state);
              if (state) {
                setSelectedState(state);
                
                // Load cities for the selected state
                try {
                  const citiesData = await GetCity(country.id, state.id);
                  setCities(citiesData);
                  
                  // If city is also selected, find and set it
                  if (formData.district) {
                    const city = citiesData.find(c => c.name === formData.district);
                    if (city) {
                      setSelectedCity(city);
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
  }, [formData.country, formData.state, formData.district, countries]);

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

  const handleCountryChange = async (country) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCity(null);
    setStates([]);
    setCities([]);
    
    setValue('country', country ? country.name : '');
    setValue('state', '');
    setValue('district', '');
    
    if (country) {
      try {
        const statesData = await GetState(country.id);
        setStates(statesData);
      } catch (error) {
        console.error('Error loading states:', error);
      }
    }
  };

  const handleStateChange = async (state) => {
    setSelectedState(state);
    setSelectedCity(null);
    setCities([]);
    
    setValue('state', state ? state.name : '');
    setValue('district', '');
    
    if (state && selectedCountry) {
      try {
        const citiesData = await GetCity(selectedCountry.id, state.id);
        setCities(citiesData);
      } catch (error) {
        console.error('Error loading cities:', error);
      }
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setValue('district', city ? city.name : '');
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
                <AutoSuggestField
                  label="Country *"
                  options={countries}
                  value={selectedCountry?.name || ''}
                  onChange={handleCountryChange}
                  placeholder="Search and select country"
                  disabled={false}
                  error={errors.country}
                  icon={FiMapPin}
                />

                {/* State */}
                <AutoSuggestField
                  label="State"
                  options={states}
                  value={selectedState?.name || ''}
                  onChange={handleStateChange}
                  placeholder="Search and select state"
                  disabled={!selectedCountry}
                  error={errors.state}
                />

                {/* District/City */}
                <AutoSuggestField
                  label="District/City"
                  options={cities}
                  value={selectedCity?.name || ''}
                  onChange={handleCityChange}
                  placeholder="Search and select city"
                  disabled={!selectedState}
                  error={errors.district}
                />
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