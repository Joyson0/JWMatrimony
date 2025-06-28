import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { aboutSchema } from './ValidationSchemas';
import WizardNavigation from './WizardNavigation';
import { storage } from '../../lib/appwrite';
import { ID } from 'appwrite';
import { FiUser, FiBook, FiBriefcase, FiHeart, FiGlobe, FiPlus, FiTrash2, FiUpload, FiX, FiStar } from 'react-icons/fi';

const AdditionalPhotosBucketId = import.meta.env.VITE_BUCKET_ID;

/**
 * Step 3: About Yourself & Lifestyle Form
 * Modern design with rich text areas and lifestyle preferences
 */
function Step3About({ formData, updateFormData, onNext, onBack, currentStep, totalSteps, isLoading }) {
  const { register, handleSubmit, formState: { errors }, watch, control, setValue } = useForm({
    resolver: yupResolver(aboutSchema),
    defaultValues: {
      ...formData,
      // Ensure hobbies is properly formatted for the input field
      hobbies: Array.isArray(formData.hobbies) ? formData.hobbies.join(', ') : (formData.hobbies || ''),
      // Initialize languages and additional photos arrays
      languages: formData.languages || [],
      additionalPhotos: formData.additionalPhotos || [],
      // Initialize spiritual status
      spiritualStatus: formData.spiritualStatus || {
        baptismStatus: 'Baptised Publisher',
        servicePosition: '',
        serviceType: ''
      }
    },
  });

  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control,
    name: "languages",
  });

  const aboutMeText = watch('aboutMe', '');
  const hobbiesText = watch('hobbies', '');
  const gender = watch('gender') || formData.gender;
  const additionalPhotos = watch('additionalPhotos', []);

  // Language options
  const languageOptions = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
    'Chinese (Mandarin)', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Bengali',
    'Urdu', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Punjabi', 'Malayalam',
    'Kannada', 'Oriya', 'Assamese', 'Nepali', 'Sinhala', 'Thai', 'Vietnamese',
    'Indonesian', 'Malay', 'Filipino', 'Dutch', 'Swedish', 'Norwegian', 'Danish',
    'Finnish', 'Polish', 'Czech', 'Hungarian', 'Romanian', 'Bulgarian', 'Croatian',
    'Serbian', 'Slovak', 'Slovenian', 'Estonian', 'Latvian', 'Lithuanian', 'Greek',
    'Turkish', 'Hebrew', 'Persian', 'Swahili', 'Amharic', 'Yoruba', 'Igbo', 'Hausa'
  ].sort();

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
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name}: Please select a JPG, JPEG, or PNG image file.`);
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
        setValue('additionalPhotos', [...currentPhotos, uploadedFile.$id]);
        
        console.log('Additional photo uploaded:', uploadedFile);
      } catch (error) {
        console.error('Photo upload failed:', error);
        alert(`Failed to upload ${file.name}. Please try again.`);
      }
    }
  };

  const removeAdditionalPhoto = async (index, fileId) => {
    try {
      // Remove from storage
      await storage.deleteFile(AdditionalPhotosBucketId, fileId);
      
      // Remove from form
      const currentPhotos = watch('additionalPhotos') || [];
      const updatedPhotos = currentPhotos.filter((_, i) => i !== index);
      setValue('additionalPhotos', updatedPhotos);
      
      console.log('Additional photo removed:', fileId);
    } catch (error) {
      console.error('Failed to remove photo:', error);
      alert('Failed to remove photo. Please try again.');
    }
  };

  const onSubmit = (data) => {
    // Process hobbies field to convert comma-separated string to array
    const processedData = {
      ...data,
      hobbies: typeof data.hobbies === 'string' 
        ? data.hobbies.split(',').map(item => item.trim()).filter(item => item)
        : Array.isArray(data.hobbies) 
          ? data.hobbies 
          : []
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
              <button
                type="button"
                onClick={() => appendLanguage({ language: '', fluency: '' })}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
              >
                <FiPlus className="w-4 h-4" />
                Add Language
              </button>
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
                          {languageOptions.map(lang => (
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
              </div>
            )}
          </div>

          {/* Hobbies Section */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FiHeart className="w-4 h-4" />
              Hobbies & Interests
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('hobbies')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Reading, Cooking, Traveling, Photography, Music"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Separate multiple hobbies with commas
            </p>
            {errors.hobbies && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <span className="w-4 h-4">⚠️</span>
                {errors.hobbies.message}
              </p>
            )}
          </div>

          {/* Additional Photos Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FiUpload className="w-5 h-5" />
              Additional Photos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {additionalPhotos.map((photoId, index) => (
                <div key={photoId} className="relative group">
                  <img
                    src={storage.getFilePreview(AdditionalPhotosBucketId, photoId).href}
                    alt={`Additional photo ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeAdditionalPhoto(index, photoId)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {additionalPhotos.length < 3 && (
                <label className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                  <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 text-center">
                    Upload Photo<br />
                    <span className="text-xs">JPG, JPEG, PNG (Max 5MB)</span>
                  </span>
                  <input
                    type="file"
                    onChange={handleAdditionalPhotoUpload}
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    multiple
                  />
                </label>
              )}
            </div>
            
            <p className="text-sm text-gray-500">
              You can upload up to 3 additional photos. Maximum 5MB each. Supported formats: JPG, JPEG, PNG.
            </p>
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