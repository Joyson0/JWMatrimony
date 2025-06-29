import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { aboutSchema } from './ValidationSchemas';
import WizardNavigation from './WizardNavigation';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { storage } from '../../lib/appwrite';
import { ID } from 'appwrite';
import { FiUser, FiBook, FiBriefcase, FiHeart, FiGlobe, FiPlus, FiTrash2, FiUpload, FiX, FiStar } from 'react-icons/fi';
import { languages } from '../../data/languages';

const AdditionalPhotosBucketId = import.meta.env.VITE_BUCKET_ID;

/**
 * Chip Input Component for Hobbies
 * Creates chips when user types and presses comma
 */
const ChipInput = ({ value = [], onChange, placeholder, error }) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const chips = Array.isArray(value) ? value : [];

  const addChip = (chipText) => {
    const trimmedText = chipText.trim();
    if (trimmedText && !chips.includes(trimmedText)) {
      const newChips = [...chips, trimmedText];
      onChange(newChips);
    }
  };

  const removeChip = (indexToRemove) => {
    const newChips = chips.filter((_, index) => index !== indexToRemove);
    onChange(newChips);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Check if user typed a comma
    if (value.includes(',')) {
      const parts = value.split(',');
      const chipText = parts[0];
      const remainingText = parts.slice(1).join(',');
      
      // Add the chip if it has content
      if (chipText.trim()) {
        addChip(chipText);
      }
      
      // Set remaining text as input value
      setInputValue(remainingText);
    } else {
      setInputValue(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addChip(inputValue);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && chips.length > 0) {
      // Remove last chip if input is empty and backspace is pressed
      removeChip(chips.length - 1);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Add remaining input as chip when losing focus
    if (inputValue.trim()) {
      addChip(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`min-h-[3rem] w-full px-4 py-3 border rounded-lg transition-all duration-200 cursor-text ${
          isFocused
            ? 'border-purple-500 ring-2 ring-purple-500 ring-opacity-20'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => document.getElementById('hobbies-input')?.focus()}
      >
        {/* Chips Container */}
        <div className="flex flex-wrap gap-2 mb-2">
          {chips.map((chip, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200 hover:bg-purple-200 transition-colors group"
            >
              <span>{chip}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeChip(index);
                }}
                className="ml-1 text-purple-600 hover:text-purple-800 hover:bg-purple-300 rounded-full p-0.5 transition-colors opacity-70 group-hover:opacity-100"
                title="Remove hobby"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Input Field */}
        <input
          id="hobbies-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={handleInputBlur}
          className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
          placeholder={chips.length === 0 ? placeholder : "Add another hobby..."}
          autoComplete="off"
        />
      </div>

      {/* Helper Text */}
      <div className="flex items-center justify-between text-xs">
        <p className="text-gray-500">
          Type and press comma (,) or Enter to add • Click × to remove
        </p>
        <span className="text-gray-400">
          {chips.length} {chips.length === 1 ? 'hobby' : 'hobbies'}
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <span className="w-4 h-4">⚠️</span>
          {error.message}
        </p>
      )}
    </div>
  );
};

/**
 * Additional Photo Component
 * Displays individual photo with delete functionality
 */
const AdditionalPhoto = ({ photoId, index, onRemove }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    generateImageUrl();
  }, [photoId]);

  const generateImageUrl = async () => {
    if (!photoId || !AdditionalPhotosBucketId) {
      setImageError(true);
      setLoading(false);
      return;
    }

    try {
      console.log('Generating URL for additional photo:', photoId);
      
      // Use simple getFileView without any query parameters
      const viewUrl = storage.getFileView(AdditionalPhotosBucketId, photoId);
      const url = viewUrl.toString();
      
      console.log('Generated additional photo URL:', url);
      setImageUrl(url);
      setImageError(false);
    } catch (error) {
      console.error('Error generating additional photo URL:', error);
      setImageError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = () => {
    console.log('Additional photo loaded successfully:', photoId);
    setLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    console.error('Additional photo failed to load:', photoId);
    setLoading(false);
    setImageError(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    onRemove(index, photoId);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (imageError || !imageUrl) {
    return (
      <div className="w-full h-48 bg-red-50 rounded-lg border border-red-300 flex items-center justify-center relative group">
        <div className="text-center">
          <FiX className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-600">Failed to load image</p>
          <p className="text-xs text-red-500 mt-1">Photo ID: {photoId}</p>
        </div>
        
        {/* Delete button for failed images */}
        <button
          type="button"
          onClick={handleDeleteClick}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
          title="Remove this photo"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          title="Delete Failed Photo"
          message="This photo failed to load. Would you like to remove it from your profile?"
          photoIndex={index}
        />
      </div>
    );
  }

  return (
    <>
      <div className="relative group">
        <img
          src={imageUrl}
          alt={`Additional photo ${index + 1}`}
          className="w-full h-48 object-cover rounded-lg border border-gray-300 shadow-sm"
          onLoad={handleImageLoad}
          onError={handleImageError}
          crossOrigin="anonymous"
        />
        
        {/* Delete button - appears on hover */}
        <button
          type="button"
          onClick={handleDeleteClick}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110 shadow-lg"
          title="Remove this photo"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
        
        {/* Photo number indicator */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-medium">
          Photo {index + 1}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Delete Photo"
        message="Are you sure you want to delete this photo from your profile?"
        photoIndex={index}
      />
    </>
  );
};

/**
 * Step 3: About Yourself & Lifestyle Form
 * Modern design with rich text areas and lifestyle preferences
 */
function Step3About({ formData, updateFormData, onNext, onBack, currentStep, totalSteps, isLoading }) {
  // Extract spiritual status object for form usage
  const spiritualStatusObject = formData.spiritualStatus || {
    baptismStatus: 'Baptised Publisher',
    servicePosition: '',
    serviceType: ''
  };

  const { register, handleSubmit, formState: { errors }, watch, control, setValue } = useForm({
    resolver: yupResolver(aboutSchema),
    defaultValues: {
      ...formData,
      // Ensure hobbies is properly formatted as array for the chip input
      hobbies: Array.isArray(formData.hobbies) ? formData.hobbies : 
               typeof formData.hobbies === 'string' ? 
               formData.hobbies.split(',').map(item => item.trim()).filter(item => item) : [],
      // Initialize languages and additional photos arrays
      languages: formData.languages || [],
      additionalPhotos: formData.additionalPhotos || [],
      // Initialize spiritual status as object for form usage
      spiritualStatus: spiritualStatusObject
    },
  });

  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control,
    name: "languages",
  });

  const aboutMeText = watch('aboutMe', '');
  const hobbiesArray = watch('hobbies', []);
  const gender = watch('gender') || formData.gender;
  const additionalPhotos = watch('additionalPhotos', []);

  const fluencyLevels = ['Native', 'Fluent', 'Intermediate', 'Beginner'];

  // Spiritual status options based on gender
  const getSpiritualStatusOptions = () => {
    if (gender === 'Male') {
      return {
        servicePosition: ['Ministerial Servant', 'Elder'],
        serviceType: ['Regular Pioneer', 'Special Full-time Servant']
      };
    } else {
      return {
        servicePosition: [],
        serviceType: ['Regular Pioneer', 'Special Full-time Servant']
      };
    }
  };

  const spiritualOptions = getSpiritualStatusOptions();

  const handleAdditionalPhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (additionalPhotos.length + files.length > 3) {
      alert('You can upload a maximum of 3 additional photos.');
      return;
    }

    for (const file of files) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name}: Please select a JPEG, PNG, or WebP image file.`);
        continue;
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert(`${file.name}: File size must be less than 5MB.`);
        continue;
      }

      try {
        const uploadedFile = await storage.createFile(
          AdditionalPhotosBucketId,
          ID.unique(),
          file
        );
        
        const currentPhotos = watch('additionalPhotos') || [];
        const updatedPhotos = [...currentPhotos, uploadedFile.$id];
        setValue('additionalPhotos', updatedPhotos);
        
        console.log('Additional photo uploaded successfully:', uploadedFile);
        
        // Show success notification
        showNotification(`Photo uploaded successfully! (${updatedPhotos.length}/3)`, 'success');
        
      } catch (error) {
        console.error('Photo upload failed:', error);
        alert(`Failed to upload ${file.name}. Please try again.`);
      }
    }
    
    // Clear the input so the same file can be uploaded again if needed
    event.target.value = '';
  };

  const removeAdditionalPhoto = async (index, fileId) => {
    try {
      console.log('Removing additional photo:', fileId);
      
      // Remove from storage
      await storage.deleteFile(AdditionalPhotosBucketId, fileId);
      
      // Remove from form
      const currentPhotos = watch('additionalPhotos') || [];
      const updatedPhotos = currentPhotos.filter((_, i) => i !== index);
      setValue('additionalPhotos', updatedPhotos);
      
      console.log('Additional photo removed successfully:', fileId);
      
      // Show success notification
      showNotification('Photo removed successfully!', 'success');
      
    } catch (error) {
      console.error('Failed to remove photo:', error);
      alert('Failed to remove photo. Please try again.');
    }
  };

  // Handle hobbies change from chip input
  const handleHobbiesChange = (newHobbies) => {
    setValue('hobbies', newHobbies);
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

  const onSubmit = (data) => {
    // Hobbies are already in array format from the chip input
    const processedData = {
      ...data,
      hobbies: Array.isArray(data.hobbies) ? data.hobbies : []
    };

    // Call onNext with the processed data
    onNext(processedData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FiUser className="w-6 h-6" />
            About Yourself & Lifestyle
          </h2>
          <p className="text-purple-100 mt-2">Share your story and preferences</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8">
          {/* About Me Section */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              About Me
            </label>
            <div className="relative">
              <textarea
                {...register('aboutMe')}
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Tell us about yourself, your personality, interests, and what makes you unique..."
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {aboutMeText.length}/2000
              </div>
            </div>
            {errors.aboutMe && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <span className="w-4 h-4">⚠️</span>
                {errors.aboutMe.message}
              </p>
            )}
          </div>

          {/* Professional Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FiBriefcase className="w-5 h-5" />
              Professional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FiBook className="w-4 h-4" />
                  Education
                </label>
                <input
                  type="text"
                  {...register('education')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Bachelor's in Computer Science"
                />
                {errors.education && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4">⚠️</span>
                    {errors.education.message}
                  </p>
                )}
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FiBriefcase className="w-4 h-4" />
                  Occupation
                </label>
                <input
                  type="text"
                  {...register('occupation')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Software Engineer, Teacher, Doctor"
                />
                {errors.occupation && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4">⚠️</span>
                    {errors.occupation.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Spiritual Status Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FiStar className="w-5 h-5" />
              Spiritual Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Baptism Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Baptism Status *
                </label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-blue-800 font-medium">Baptised Publisher</span>
                  <p className="text-xs text-blue-600 mt-1">Default status</p>
                </div>
                <input type="hidden" {...register('spiritualStatus.baptismStatus')} value="Baptised Publisher" />
              </div>

              {/* Service Position (Male only) */}
              {gender === 'Male' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Position
                  </label>
                  <select
                    {...register('spiritualStatus.servicePosition')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select position</option>
                    {spiritualOptions.servicePosition.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                  {errors.spiritualStatus?.servicePosition && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span className="w-4 h-4">⚠️</span>
                      {errors.spiritualStatus.servicePosition.message}
                    </p>
                  )}
                </div>
              )}

              {/* Service Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Type
                </label>
                <select
                  {...register('spiritualStatus.serviceType')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select service type</option>
                  {spiritualOptions.serviceType.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.spiritualStatus?.serviceType && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4">⚠️</span>
                    {errors.spiritualStatus.serviceType.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Languages Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FiGlobe className="w-5 h-5" />
                Languages Known
              </h3>
            </div>

            {languageFields.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <FiGlobe className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No languages added yet</p>
                <button
                  type="button"
                  onClick={() => appendLanguage({ language: '', fluency: '' })}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Add First Language
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {languageFields.map((item, index) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-800">Language {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeLanguage(index)}
                        className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Language */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language *
                        </label>
                        <select
                          {...register(`languages.${index}.language`)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Select language</option>
                          {languages.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                        {errors.languages?.[index]?.language && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.languages[index].language.message}
                          </p>
                        )}
                      </div>

                      {/* Fluency */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fluency *
                        </label>
                        <select
                          {...register(`languages.${index}.fluency`)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Select fluency</option>
                          {fluencyLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                        {errors.languages?.[index]?.fluency && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.languages[index].fluency.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add Language Button - Positioned after the input fields */}
                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={() => appendLanguage({ language: '', fluency: '' })}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Another Language
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hobbies Section - Now with Chip Input */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FiHeart className="w-4 h-4" />
              Hobbies & Interests
            </label>
            
            <ChipInput
              value={hobbiesArray}
              onChange={handleHobbiesChange}
              placeholder="Type your hobbies and press comma or Enter to add (e.g., Reading, Cooking, Traveling)"
              error={errors.hobbies}
            />
            
            {/* Register the hobbies field for form validation */}
            <input type="hidden" {...register('hobbies')} />
          </div>

          {/* Additional Photos Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FiUpload className="w-5 h-5" />
              Additional Photos
              <span className="text-sm font-normal text-gray-500">
                ({additionalPhotos.length}/3)
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Display existing photos */}
              {additionalPhotos.map((photoId, index) => (
                <AdditionalPhoto
                  key={`${photoId}-${index}`}
                  photoId={photoId}
                  index={index}
                  onRemove={removeAdditionalPhoto}
                />
              ))}
              
              {/* Upload button - only show if less than 3 photos */}
              {additionalPhotos.length < 3 && (
                <label className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group">
                  <FiUpload className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mb-2 transition-colors" />
                  <span className="text-sm text-gray-500 group-hover:text-purple-600 text-center transition-colors">
                    Upload Photo<br />
                    <span className="text-xs">JPEG, PNG, WebP (Max 5MB)</span>
                  </span>
                  <input
                    type="file"
                    onChange={handleAdditionalPhotoUpload}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    multiple
                  />
                </label>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FiUpload className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Photo Guidelines</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Upload up to 3 additional photos</li>
                    <li>• Maximum 5MB each</li>
                    <li>• Supported formats: JPEG, PNG, WebP</li>
                    <li>• Hover over photos to delete them</li>
                    <li>• Beautiful confirmation modal for deletions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <WizardNavigation 
            currentStep={currentStep} 
            totalSteps={totalSteps} 
            onBack={onBack}
            onNext={handleSubmit(onSubmit)}
            isLoading={isLoading}
          />
        </form>
      </div>
    </div>
  );
}

export default Step3About;