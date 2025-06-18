// src/components/wizard/ProgressBar.jsx
import React from 'react';

function ProgressBar({ currentStep, totalSteps }) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px', height: '10px', marginBottom: '20px' }}>
      <div
        style={{
          width: `${progress}%`,
          backgroundColor: '#4CAF50',
          height: '100%',
          borderRadius: '5px',
          transition: 'width 0.3s ease-in-out',
        }}
      ></div>
      <p style={{ textAlign: 'center', fontSize: '0.9em', color: '#555', marginTop: '5px' }}>
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}

export default ProgressBar;