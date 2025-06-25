import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { aboutSchema } from './ValidationSchemas';
import WizardNavigation from './WizardNavigation';
import { FiUser, FiBook, FiBriefcase, FiHeart } from 'react-icons/fi';

/**
 * Step 3: About Yourself & Lifestyle Form
 * Modern design with rich text areas and lifestyle preferences
 */
function Step3About({ formData, updateFormData, onNext, onBack, currentStep, totalSteps, isLoading }) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(aboutSchema),
    defaultValues: {
      ...formData,
      // Ensure hobbies is properly formatted for the input field
      hobbies: Array.isArray(formData.hobbies) ? formData.hobbies.join(', ') : (formData.hobbies || '')
    },
  });

  const aboutMeText = watch('aboutMe', '');
  const hobbiesText = watch('hobbies', '');

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