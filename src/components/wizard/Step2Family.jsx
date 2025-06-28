import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { familySchema } from './ValidationSchemas';
import WizardNavigation from './WizardNavigation';
import { FiUsers, FiPlus, FiTrash2, FiUser } from 'react-icons/fi';

/**
 * Step 2: Family Information Form
 * Modern design with dynamic sibling management
 */
function Step2Family({ formData, updateFormData, onNext, onBack, currentStep, totalSteps, isLoading }) {
  const { register, handleSubmit, formState: { errors }, control } = useForm({
    resolver: yupResolver(familySchema),
    defaultValues: formData,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "familyDetails.siblings",
  });

  const onSubmit = (data) => {
    // Call onNext with the data to save
    onNext(data);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FiUsers className="w-6 h-6" />
            Family Information
          </h2>
          <p className="text-green-100 mt-2">Tell us about your family background</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8">
          {/* Parents Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FiUser className="w-5 h-5" />
              Parents' Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Father's Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Father's Name
                </label>
                <input
                  type="text"
                  {...register('familyDetails.fatherName')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter father's full name"
                />
                {errors.familyDetails?.fatherName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4">⚠️</span>
                    {errors.familyDetails.fatherName.message}
                  </p>
                )}
              </div>

              {/* Mother's Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mother's Name
                </label>
                <input
                  type="text"
                  {...register('familyDetails.motherName')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter mother's full name"
                />
                {errors.familyDetails?.motherName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4">⚠️</span>
                    {errors.familyDetails.motherName.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Siblings Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FiUsers className="w-5 h-5" />
                Siblings Information
              </h3>
              <button
                type="button"
                onClick={() => append({ name: '', relation: '' })}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
              >
                <FiPlus className="w-4 h-4" />
                Add Sibling
              </button>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No siblings added yet</p>
                <button
                  type="button"
                  onClick={() => append({ name: '', relation: '' })}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Add First Sibling
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((item, index) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-800">Sibling {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          {...register(`familyDetails.siblings.${index}.name`)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          placeholder="Sibling's name"
                        />
                        {errors.familyDetails?.siblings?.[index]?.name && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.familyDetails.siblings[index].name.message}
                          </p>
                        )}
                      </div>

                      {/* Relation */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Relation *
                        </label>
                        <select
                          {...register(`familyDetails.siblings.${index}.relation`)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Select relation</option>
                          <option value="Brother">Brother</option>
                          <option value="Sister">Sister</option>
                        </select>
                        {errors.familyDetails?.siblings?.[index]?.relation && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.familyDetails.siblings[index].relation.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

export default Step2Family;