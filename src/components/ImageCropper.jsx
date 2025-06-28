import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FiX, FiCheck, FiRotateCw } from 'react-icons/fi';

/**
 * Image Cropper Component
 * 
 * Provides an interactive cropping interface with 1:1 aspect ratio
 * for profile pictures with move and resize capabilities
 */
const ImageCropper = ({ 
  imageSrc, 
  onCropComplete, 
  onCancel, 
  isOpen 
}) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [rotation, setRotation] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Initialize crop when image loads
  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    
    // Create a centered square crop
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        1, // 1:1 aspect ratio
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(crop);
    setCompletedCrop(crop);
  }, []);

  // Update preview whenever crop or rotation changes
  useEffect(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    const updatePreview = async () => {
      const image = imgRef.current;
      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Set canvas size for preview (128x128 for circular preview)
      const previewSize = 128;
      canvas.width = previewSize;
      canvas.height = previewSize;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate crop dimensions
      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      // Apply rotation if any
      if (rotation !== 0) {
        ctx.save();
        ctx.translate(previewSize / 2, previewSize / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-previewSize / 2, -previewSize / 2);
      }

      // Draw the cropped image scaled to preview size
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        previewSize,
        previewSize
      );

      if (rotation !== 0) {
        ctx.restore();
      }

      // Convert canvas to data URL for preview
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreviewUrl(dataUrl);
    };

    updatePreview();
  }, [completedCrop, rotation]);

  // Generate final cropped image
  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to the crop size
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply rotation if any
    if (rotation !== 0) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Draw the cropped image
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    if (rotation !== 0) {
      ctx.restore();
    }

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });
  }, [completedCrop, rotation]);

  const handleCropComplete = async () => {
    try {
      const croppedImageBlob = await getCroppedImg();
      if (croppedImageBlob) {
        onCropComplete(croppedImageBlob);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Crop Your Profile Picture</h3>
            <button
              onClick={onCancel}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-1">
            Drag to move, resize corners to adjust the crop area
          </p>
        </div>

        {/* Cropping Area */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Crop Interface */}
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  minWidth={100}
                  minHeight={100}
                  keepSelection
                  className="max-w-full max-h-[400px]"
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    className="max-w-full max-h-[400px] object-contain"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </ReactCrop>
              </div>
            </div>

            {/* Preview and Controls */}
            <div className="lg:w-80">
              {/* Preview */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Preview</h4>
                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Cropped preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Preview</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <button
                  onClick={handleRotate}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  <FiRotateCw className="w-4 h-4" />
                  Rotate 90°
                </button>

                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Tips:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Drag the crop area to reposition</li>
                    <li>• Drag corners to resize</li>
                    <li>• Use rotate for better framing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCropComplete}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <FiCheck className="w-4 h-4" />
              Apply Crop
            </button>
          </div>
        </div>

        {/* Hidden canvas for preview generation */}
        <canvas
          ref={previewCanvasRef}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default ImageCropper;