import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { partnerPreferencesSchema } from './ValidationSchemas';
import WizardNavigation from './WizardNavigation';
import { FiHeart, FiUsers, FiCalendar, FiActivity } from 'react-icons/fi';

/**
 * Step 4: Partner Preferences Form
 * Final step with comprehensive partner criteria
 */
function Step4PartnerPreferences({ formData, updateFormData, onBack, onSubmit, currentStep, totalSteps, isLoading }) {
  const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm({
    resolver: yupResolver(partnerPreferencesSchema),
    defaultValues: formData,
  });

  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  const finalSubmit = (data) => {
    console.log("Step 4 finalSubmit: Data received FROM FORM:", data);
    onSubmit(data);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FiHeart className="w-6 h-6" />
            Partner Preferences
          </h2>
          <p className="text-rose-100 mt-2">Tell us about your ideal life partner</p>
        </div>

        <form onSubmit={handleSubmit(finalSubmit)} className="p-8">
          {/* Age Preferences */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FiCalendar className="w-5 h-5" />
              Age Preferences
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Age *
                </label>
                <input
                  type="number"
                  {...register('partnerPreferences.minAge')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 25"
                  min="18"
                  max="100"
                />
                {errors.partnerPreferences?.minAge && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4">⚠️</span>
                    {errors.partnerPreferences.minAge.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Age *
                </label>
                <input
                  type="number"
                  {...register('partnerPreferences.maxAge')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 35"
                  min="18"
                  max="100"
                />
                {errors.partnerPreferences?.maxAge && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4">⚠️</span>
                    {errors.partnerPreferences.maxAge.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Height Preferences */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FiActivity className="w-5 h-5" />
              Height Preferences
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Height (cm) *
                </label>
                <input
                  type="number"
                  {...register('partnerPreferences.minHeight')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 150"
                  min="100"
                  max="250"
                />
                {errors.partnerPreferences?.minHeight && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4">⚠️</span>
                    {errors.partnerPreferences.minHeight.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Height (cm) *
                </label>
                <input
                  type="number"
                  {...register('partnerPreferences.maxHeight')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 180"
                  min="100"
                  max="250"
                />
                {errors.partnerPreferences?.maxHeight && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4">⚠️</span>
                    {errors.partnerPreferences.maxHeight.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Marital Status Preferences */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FiUsers className="w-5 h-5" />
              Preferred Marital Status *
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Never Married', 'Divorced', 'Widowed'].map(status => (
                <label key={status} className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    value={status}
                    {...register('partnerPreferences.preferredMaritalStatuses')}
                    className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">{status}</span>
                </label>
              ))}
            </div>
            {errors.partnerPreferences?.preferredMaritalStatuses && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <span className="w-4 h-4">⚠️</span>
                {errors.partnerPreferences.preferredMaritalStatuses.message}
              </p>
            )}
          </div>

          {/* Completion Message */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <FiHeart className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Almost Done!</h4>
                <p className="text-gray-600 text-sm">
                  You're about to complete your profile setup. Click "Complete Profile" to finish.
                </p>
              </div>
            </div>
          </div>

          <WizardNavigation 
            currentStep={currentStep} 
            totalSteps={totalSteps} 
            onBack={onBack}
            onNext={handleSubmit(finalSubmit)}
            isLastStep={true}
            isLoading={isLoading}
          />
        </form>
      </div>
    </div>
  );
}

export default Step4PartnerPreferences;