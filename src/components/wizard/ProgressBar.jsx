import React from 'react';

/**
 * Modern Progress Bar Component
 * 
 * Displays current step progress with animated transitions and step indicators
 * 
 * @param {number} currentStep - Current active step (1-based)
 * @param {number} totalSteps - Total number of steps
 */
function ProgressBar({ currentStep, totalSteps }) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full mb-8">
      {/* Step indicators */}
      <div className="flex justify-between items-center mb-4">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <div key={stepNumber} className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 transform
                  ${isCompleted 
                    ? 'bg-green-500 text-white scale-110 shadow-lg' 
                    : isActive 
                      ? 'bg-blue-600 text-white scale-110 shadow-lg ring-4 ring-blue-200' 
                      : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <span className={`mt-2 text-xs font-medium transition-colors duration-300 ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
              }`}>
                {stepNumber === 1 && 'Basic Info'}
                {stepNumber === 2 && 'Family'}
                {stepNumber === 3 && 'About Me'}
                {stepNumber === 4 && 'Preferences'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Animated progress indicator */}
        <div
          className="absolute top-0 h-2 w-8 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 rounded-full transition-all duration-500 ease-out"
          style={{ left: `${Math.max(0, progress - 8)}%` }}
        />
      </div>

      {/* Step counter */}
      <div className="text-center mt-4">
        <span className="text-sm text-gray-600 font-medium">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  );
}

export default ProgressBar;