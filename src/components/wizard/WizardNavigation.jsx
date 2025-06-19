import React from 'react';
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';

/**
 * Modern Wizard Navigation Component
 * 
 * Provides navigation buttons with icons and loading states
 * 
 * @param {number} currentStep - Current step number
 * @param {number} totalSteps - Total number of steps
 * @param {Function} onNext - Next button handler
 * @param {Function} onBack - Back button handler
 * @param {boolean} isLastStep - Whether this is the final step
 * @param {boolean} isFirstStep - Whether this is the first step
 * @param {boolean} isLoading - Loading state for submission
 */
function WizardNavigation({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onBack, 
  isLastStep = false, 
  isFirstStep = false, 
  isLoading = false 
}) {
  return (
    <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstStep || isLoading}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform
          ${isFirstStep || isLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md'
          }
        `}
      >
        <FiArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Step indicator */}
      <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
        <span className="font-medium text-blue-600">{currentStep}</span>
        <span>of</span>
        <span>{totalSteps}</span>
      </div>

      {/* Next/Submit Button */}
      <button
        type="submit"
        onClick={onNext}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform
          ${isLoading
            ? 'bg-blue-400 text-white cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Saving...
          </>
        ) : isLastStep ? (
          <>
            <FiCheck className="w-4 h-4" />
            Complete Profile
          </>
        ) : (
          <>
            Next
            <FiArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}

export default WizardNavigation;