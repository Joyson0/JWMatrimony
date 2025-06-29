import React from 'react';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';

/**
 * Delete Confirmation Modal Component
 * 
 * A beautiful modal for confirming photo deletion with smooth animations
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onConfirm - Callback when user confirms deletion
 * @param {Function} onCancel - Callback when user cancels deletion
 * @param {string} title - Modal title
 * @param {string} message - Confirmation message
 * @param {number} photoIndex - Index of the photo being deleted (for display)
 */
function DeleteConfirmationModal({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = "Delete Photo", 
  message = "Are you sure to delete?",
  photoIndex = null
}) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-2">
            {message}
          </p>
          {photoIndex !== null && (
            <p className="text-sm text-gray-500">
              Photo {photoIndex + 1} will be permanently removed.
            </p>
          )}
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ This action cannot be undone
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
          >
            <FiTrash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default DeleteConfirmationModal;