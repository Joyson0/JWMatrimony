import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { aboutSchema } from './ValidationSchemas';
import WizardNavigation from './WizardNavigation';
import { FiUser, FiBook, FiBriefcase, FiDollarSign, FiHeart } from 'react-icons/fi';
import {FaUtensils} from 'react-icons/fa'

/**
 * Step 3: About Yourself & Lifestyle Form
 * Modern design with rich text areas and lifestyle preferences
 */
function Step3About({ formData, updateFormData, onNext, onBack, currentStep, totalSteps }) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(aboutSchema),
    defaultValues: formData,
  });

  const aboutMeText = watch('aboutMe', '');
  const hobbiesText = watch('hobbies', '');

  const onSubmit = (data) => {
    updateFormData(data);
    onNext();
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

              {/* Annual Income */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FiDollarSign className="w-4 h-4" />
                  Annual Income (Lakhs INR)
                </label>
                <input
                  type="number"
                  {...register('annualIncome')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 5, 10, 15"
                  min="0"
                  step="0.1"
                />
                {errors.annualIncome && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4">⚠️</span>
                    {errors.annualIncome.message}
                  </p>
                )}
              </div>

              {/* Diet */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FaUtensils className="w-4 h-4" />
                  Diet Preference
                </label>
                <select
                  {...register('diet')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Diet</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Eggetarian">Eggetarian</option>
                  <option value="Vegan">Vegan</option>
                </select>
                {errors.diet && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4">⚠️</span>
                    {errors.diet.message}
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
                {...register('hobbies', {
                  setValueAs: (value) => {
                    if (typeof value === 'string') {
                      return value.split(',').map(item => item.trim()).filter(item => item);
                    }
                    if (Array.isArray(value)) {
                      return value;
                    }
                    return [];
                  },
                })}
                defaultValue={formData.hobbies ? formData.hobbies.join(', ') : ''}
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
          />
        </form>
      </div>
    </div>
  );
}

export default Step3About;