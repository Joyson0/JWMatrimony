// src/components/wizard/WizardNavigation.jsx
import React from 'react';

function WizardNavigation({ currentStep, totalSteps, onNext, onBack, isLastStep = false, isFirstStep = false, isLoading = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstStep || isLoading}
        style={{
          padding: '10px 20px',
          fontSize: '1em',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          opacity: isFirstStep ? 0.5 : 1
        }}
      >
        Back
      </button>

      <button
        type="submit" // Use type="submit" for the Next/Submit button to trigger form validation
        onClick={onNext} // Pass handleSubmit() from the step component directly here
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          fontSize: '1em',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          opacity: isLoading ? 0.7 : 1
        }}
      >
        {isLoading ? 'Saving...' : (isLastStep ? 'Complete Profile' : 'Next')}
      </button>
    </div>
  );
}

export default WizardNavigation;