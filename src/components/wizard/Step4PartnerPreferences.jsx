// src/components/wizard/Step4PartnerPreferences.jsx
import React, { useEffect } from 'react'; // Import useEffect
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { partnerPreferencesSchema } from './ValidationSchemas';
import WizardNavigation from './WizardNavigation';

// Add currentStep and totalSteps to props for consistency with other steps
function Step4PartnerPreferences({ formData, updateFormData, onBack, onSubmit, currentStep, totalSteps }) {
  // Destructure reset and getValues from useForm
  const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm({
    resolver: yupResolver(partnerPreferencesSchema),
    // Pass the entire formData for defaultValues, as the schema expects a top-level 'partnerPreferences' key
    defaultValues: formData,
  });

  // --- CRUCIAL CHANGE: Use useEffect to reset form when formData prop changes ---
  useEffect(() => {
    // console.log('Step4PartnerPreferences: useEffect triggered. Received formData prop:', formData); // Debug
    reset(formData); // Reset the form with the latest formData
    // console.log('Step4PartnerPreferences: Form values after reset():', getValues()); // Debug
  }, [formData, reset, getValues]); // Depend on formData and the reset/getValues functions


  const finalSubmit = (data) => {
    console.log("--- Step 4 finalSubmit ---");
  console.log("Step 4 finalSubmit: Data received FROM FORM (before updateFormData):", data);
  console.log("Step 4 finalSubmit: Value of data.partnerPreferences:", data.partnerPreferences);
  console.log("Step 4 finalSubmit: Type of data.partnerPreferences:", typeof data.partnerPreferences);


    // `data` from useForm's handleSubmit will already be structured like:
    // `{ partnerPreferences: { minAge: ..., maxHeight: ..., preferredMaritalStatuses: [...] } }`
    // So you can pass `data` directly to `updateFormData`.
    // The parent's updateFormData will then correctly merge `newData.partnerPreferences`.
    // updateFormData(data);

    // Trigger final submission in parent
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(finalSubmit)} style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Step 4: Partner Preferences</h2>

      <div style={{ marginBottom: '15px' }}>
        <label>Age Range (Min-Max):</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* These are correctly registered with dot notation */}
          <input type="number" {...register('partnerPreferences.minAge')} placeholder="Min Age" style={{ width: 'calc(50% - 5px)', padding: '8px' }} />
          <input type="number" {...register('partnerPreferences.maxAge')} placeholder="Max Age" style={{ width: 'calc(50% - 5px)', padding: '8px' }} />
        </div>
        {/* --- CRUCIAL CHANGE: Error paths must also be nested --- */}
        {errors.partnerPreferences?.minAge && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.partnerPreferences.minAge.message}</p>}
        {errors.partnerPreferences?.maxAge && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.partnerPreferences.maxAge.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Height Range (Min-Max cm):</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Correctly registered */}
          <input type="number" {...register('partnerPreferences.minHeight')} placeholder="Min Height" style={{ width: 'calc(50% - 5px)', padding: '8px' }} />
          <input type="number" {...register('partnerPreferences.maxHeight')} placeholder="Max Height" style={{ width: 'calc(50% - 5px)', padding: '8px' }} />
        </div>
        {/* --- CRUCIAL CHANGE: Error paths must also be nested --- */}
        {errors.partnerPreferences?.minHeight && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.partnerPreferences.minHeight.message}</p>}
        {errors.partnerPreferences?.maxHeight && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.partnerPreferences.maxHeight.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Preferred Marital Statuses:</label>
        {['Never Married', 'Divorced', 'Widowed', 'Annulled'].map(status => (
          <label key={status} style={{ marginRight: '15px', display: 'inline-block' }}>
            {/* Correctly registered */}
            <input type="checkbox" value={status} {...register('partnerPreferences.preferredMaritalStatuses')} /> {status}
          </label>
        ))}
        {/* --- CRUCIAL CHANGE: Error paths must also be nested --- */}
        {errors.partnerPreferences?.preferredMaritalStatuses && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.partnerPreferences.preferredMaritalStatuses.message}</p>}
      </div>

      {/* Add more partner preference fields (Castes, States, Occupations etc.) 
          Remember to use `partnerPreferences.fieldName` for register calls and 
          `errors.partnerPreferences?.fieldName` for displaying errors.
      */}

      {/* Pass currentStep and totalSteps from props, for consistency */}
      <WizardNavigation currentStep={currentStep} totalSteps={totalSteps} onBack={onBack} onNext={handleSubmit(finalSubmit)} isLastStep={true} />
    </form>
  );
}

export default Step4PartnerPreferences;