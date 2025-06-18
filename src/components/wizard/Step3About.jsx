// src/components/wizard/Step3About.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { aboutSchema } from './ValidationSchemas';
import WizardNavigation from './WizardNavigation';

function Step3About({ formData, updateFormData, onNext, onBack }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(aboutSchema),
    defaultValues: formData,
  });

  const onSubmit = (data) => {
    updateFormData(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Step 3: About Yourself & Lifestyle</h2>

      <div style={{ marginBottom: '15px' }}>
        <label>About Me:</label>
        <textarea {...register('aboutMe')} rows="6" style={{ width: '100%', padding: '8px', marginTop: '5px' }}></textarea>
        {errors.aboutMe && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.aboutMe.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Education:</label>
        <input type="text" {...register('education')} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        {errors.education && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.education.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Occupation:</label>
        <input type="text" {...register('occupation')} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        {errors.occupation && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.occupation.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Annual Income (Lakhs INR):</label>
        <input type="number" {...register('annualIncome')} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        {errors.annualIncome && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.annualIncome.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Diet:</label>
        <select {...register('diet')} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
          <option value="">Select Diet</option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Non-Vegetarian">Non-Vegetarian</option>
          <option value="Eggetarian">Eggetarian</option>
          <option value="Vegan">Vegan</option>
        </select>
        {errors.diet && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.diet.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Hobbies (comma-separated):</label>
        <input
          type="text"
          {...register('hobbies', {
            setValueAs: (value) => {
              // If the value is a string (from user input), split it.
              if (typeof value === 'string') {
                return value.split(',').map(item => item.trim()).filter(item => item);
              }
              // If the value is already an array (e.g., from defaultValues), return it.
              // This handles the initialization case where react-hook-form might pass the array.
              if (Array.isArray(value)) {
                return value;
              }
              // Fallback for other types, return an empty array.
              return [];
            },
          })}
          defaultValue={formData.hobbies ? formData.hobbies.join(', ') : ''}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          placeholder="e.g., Reading, Cooking, Traveling"
        />
        {errors.hobbies && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.hobbies.message}</p>}
      </div>

      <WizardNavigation currentStep={3} totalSteps={4} onBack={onBack} onNext={handleSubmit(onSubmit)} />
    </form>
  );
}

export default Step3About;