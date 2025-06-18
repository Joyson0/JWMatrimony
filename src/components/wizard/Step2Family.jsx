// src/components/wizard/Step2Family.jsx
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { familySchema } from './ValidationSchemas';
import WizardNavigation from './WizardNavigation'; // Reusable navigation buttons

function Step2Family({ formData, updateFormData, onNext, onBack }) {
  const { register, handleSubmit, formState: { errors }, control } = useForm({
    resolver: yupResolver(familySchema),
    defaultValues: formData, // Pre-fill
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "familyDetails.siblings",
  });

  const onSubmit = (data) => {
    updateFormData(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Step 2: Family Information</h2>

      <div style={{ marginBottom: '15px' }}>
        <label>Father's Occupation:</label>
        <input type="text" {...register('familyDetails.fatherOccupation')} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        {errors.fatherOccupation && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.fatherOccupation.message}</p>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Mother's Occupation:</label>
        <input type="text" {...register('familyDetails.motherOccupation')} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        {errors.motherOccupation && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.motherOccupation.message}</p>}
      </div>

      <h3>Siblings</h3>
      {fields.map((item, index) => (
        <div key={item.id} style={{ border: '1px dashed #eee', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
          <label>Sibling {index + 1} Name:</label>
          <input type="text" {...register(`familyDetails.siblings.${index}.name`)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          {errors.siblings?.[index]?.name && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.siblings[index].name.message}</p>}

          <label>Sibling {index + 1} Relation:</label>
          <input type="text" {...register(`familyDetails.siblings.${index}.relation`)} placeholder="e.g., Brother, Sister" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          {errors.siblings?.[index]?.relation && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.siblings[index].relation.message}</p>}

          <label>Sibling {index + 1} Age (Optional):</label>
          <input type="number" {...register(`familyDetails.siblings.${index}.age`)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          {errors.siblings?.[index]?.age && <p style={{ color: 'red', fontSize: '0.8em' }}>{errors.siblings[index].age.message}</p>}

          <button type="button" onClick={() => remove(index)} style={{ marginTop: '10px', padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
            Remove Sibling
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: '', relation: '', age: '' })} style={{ padding: '8px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>
        Add Sibling
      </button>


      <WizardNavigation currentStep={2} totalSteps={4} onBack={onBack} onNext={handleSubmit(onSubmit)} />
    </form>
  );
}

export default Step2Family;