import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FiCheck, FiX, FiRotateCw } from 'react-icons/fi';

/**
 * Image Cropper Component
 * 
 * Provides image cropping functionality with a 1:1 aspect ratio for profile pictures
 * 
 * @param {string} imageSrc - Source URL of the image to crop
 * @param {Function} onCropComplete - Callback when cropping is complete
 * @param {Function} onCancel - Callback when cropping is cancelled
 */
function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  /**
   * Initialize crop when image loads
   */
  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    
    // Create a centered square crop
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        1, // 1:1 aspect ratio for square crop
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(crop);
  }, []);

  /**
   * Rotate image by 90 degrees
   */
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  /**
   * Generate cropped image and call completion callback
   */
  const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const pixelCrop = convertToPixelCrop(
      completedCrop,
      image.naturalWidth,
      image.naturalHeight
    );

    // Set canvas size to the crop size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply rotation if needed
    if (rotation !== 0) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    if (rotation !== 0) {
      ctx.restore();
    }

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create a File object from the blob
        const croppedFile = new File([blob], 'cropped-profile.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        
        onCropComplete(croppedFile);
      }
    }, 'image/jpeg', 0.9);
  }, [completedCrop, rotation, onCropComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Crop Your Profile Picture</h3>
          <p className="text-blue-100 text-sm mt-1">Adjust the crop area to frame your photo perfectly</p>
        </div>

        {/* Cropper Content */}
        <div className="p-6">
          <div className="flex flex-col items-center">
            {/* Image Cropper */}
            <div className="mb-6 max-w-full max-h-96 overflow-auto border border-gray-300 rounded-lg">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop={true}
                keepSelection={true}
                minWidth={100}
                minHeight={100}
              >
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={imageSrc}
                  style={{ 
                    transform: `rotate(${rotation}deg)`,
                    maxWidth: '100%',
                    maxHeight: '400px'
                  }}
                  onLoad={onImageLoad}
                  crossOrigin="anonymous"
                />
              </ReactCrop>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mb-6">
              <button
                type="button"
                onClick={handleRotate}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                <FiRotateCw className="w-4 h-4" />
                Rotate
              </button>
              
              <div className="text-sm text-gray-600">
                Drag to reposition • Resize corners to adjust size
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
              >
                <FiX className="w-4 h-4" />
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleCropComplete}
                disabled={!completedCrop}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium shadow-lg"
              >
                <FiCheck className="w-4 h-4" />
                Apply Crop
              </button>
            </div>
          </div>
        </div>

        {/* Hidden canvas for generating cropped image */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

export default ImageCropper;