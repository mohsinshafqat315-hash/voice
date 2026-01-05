// Upload form component - file upload interface
// Handles file selection, drag-and-drop, validation

import { useState, useRef } from 'react';
import PrimaryButton from '../Buttons/PrimaryButton';

const UploadForm = ({ onUpload, accept = 'image/*,application/pdf', maxSize = 10 * 1024 * 1024 }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (selectedFile) => {
    setError('');
    
    if (!selectedFile) {
      return false;
    }

    // Check file size
    if (selectedFile.size > maxSize) {
      setError(`File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`);
      return false;
    }

    // Check file type
    const allowedTypes = accept.split(',').map(t => t.trim());
    const isValidType = allowedTypes.some(type => {
      if (type.includes('/*')) {
        const baseType = type.split('/')[0];
        return selectedFile.type.startsWith(baseType + '/');
      }
      return selectedFile.type === type;
    });

    if (!isValidType) {
      setError('Invalid file type. Please select an image or PDF file.');
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleUpload = () => {
    if (file && validateFile(file)) {
      onUpload(file);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center
          transition-colors duration-200
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${file ? 'border-green-300 bg-green-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        
        {!file ? (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-700">
                Click to upload
              </label>
              {' or drag and drop'}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {accept} (max {maxSize / 1024 / 1024}MB)
            </p>
          </>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {file && (
        <div className="flex justify-end">
          <PrimaryButton onClick={handleUpload}>
            Upload File
          </PrimaryButton>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
