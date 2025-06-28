import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);

  /**
   * Initialize crop when image loads
   */
  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    setImageLoaded(true);
    
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
    setCompletedCrop(crop);
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
    if (!completedCrop || !imgRef.current || !imageLoaded) {
      console.error('Missing required elements for cropping');
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Get the natural (actual) dimensions of the image
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    // Convert percentage crop to pixel coordinates manually for accuracy
    const pixelCrop = {
      x: Math.round((completedCrop.x / 100) * naturalWidth),
      y: Math.round((completedCrop.y / 100) * naturalHeight),
      width: Math.round((completedCrop.width / 100) * naturalWidth),
      height: Math.round((completedCrop.height / 100) * naturalHeight)
    };

    console.log('Crop calculation:', {
      completedCrop,
      naturalDimensions: { width: naturalWidth, height: naturalHeight },
      pixelCrop,
      displayDimensions: { width: image.width, height: image.height }
    });

    // Ensure we have valid crop dimensions
    if (pixelCrop.width <= 0 || pixelCrop.height <= 0) {
      console.error('Invalid crop dimensions:', pixelCrop);
      return;
    }

    // Clamp crop coordinates to image boundaries
    pixelCrop.x = Math.max(0, Math.min(pixelCrop.x, naturalWidth - pixelCrop.width));
    pixelCrop.y = Math.max(0, Math.min(pixelCrop.y, naturalHeight - pixelCrop.height));
    pixelCrop.width = Math.min(pixelCrop.width, naturalWidth - pixelCrop.x);
    pixelCrop.height = Math.min(pixelCrop.height, naturalHeight - pixelCrop.y);

    // Set canvas size to a fixed output size (400x400 for good quality)
    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Handle rotation if needed
    if (rotation !== 0) {
      // Move to center of canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);
      // Rotate
      ctx.rotate((rotation * Math.PI) / 180);
      // Move back
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    try {
      // Draw the cropped portion of the image to fill the entire canvas
      ctx.drawImage(
        image,
        pixelCrop.x,      // Source x
        pixelCrop.y,      // Source y
        pixelCrop.width,  // Source width
        pixelCrop.height, // Source height
        0,                // Destination x
        0,                // Destination y
        outputSize,       // Destination width
        outputSize        // Destination height
      );

      console.log('Successfully drew image to canvas with parameters:', {
        sourceX: pixelCrop.x,
        sourceY: pixelCrop.y,
        sourceWidth: pixelCrop.width,
        sourceHeight: pixelCrop.height,
        destX: 0,
        destY: 0,
        destWidth: outputSize,
        destHeight: outputSize
      });

    } catch (error) {
      console.error('Error drawing image to canvas:', error);
      ctx.restore();
      return;
    }

    // Restore context state
    ctx.restore();

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create a File object from the blob
        const croppedFile = new File([blob], 'cropped-profile.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        
        console.log('Cropped file created:', {
          name: croppedFile.name,
          size: croppedFile.size,
          type: croppedFile.type
        });
        
        onCropComplete(croppedFile);
      } else {
        console.error('Failed to create blob from canvas');
      }
    }, 'image/jpeg', 0.95); // Increased quality to 0.95
  }, [completedCrop, rotation, onCropComplete, imageLoaded]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Crop Your Profile Picture</h3>
          <p className="text-blue-100 text-sm mt-1">The circular area shows exactly what your final image will look like</p>
        </div>

        {/* Cropper Content */}
        <div className="p-6">
          <div className="flex flex-col items-center">
            {/* Image Cropper */}
            <div className="mb-6 max-w-full max-h-96 overflow-auto border border-gray-300 rounded-lg bg-gray-50">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop={true}
                keepSelection={true}
                minWidth={50}
                minHeight={50}
                maxWidth={500}
                maxHeight={500}
              >
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={imageSrc}
                  style={{ 
                    transform: `rotate(${rotation}deg)`,
                    maxWidth: '100%',
                    maxHeight: '400px',
                    display: 'block'
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
              
              <div className="text-sm text-gray-600 text-center">
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
                disabled={!completedCrop || !imageLoaded}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium shadow-lg"
              >
                <FiCheck className="w-4 h-4" />
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageCropper;