// Upload page - receipt/invoice upload interface
// Handles file upload, drag-and-drop, and batch processing

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [preview, setPreview] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please upload a JPEG, PNG, WEBP, or PDF file');
        return;
      }
      
      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setOcrResult(null);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // Simulate file input change
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        handleFileChange({ target: { files: [droppedFile] } });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setProcessingStage('Uploading file...');
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      // Simulate progress (since we can't track actual upload progress easily)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 30) return prev + 5;
          return prev;
        });
      }, 200);

      setProcessingStage('Processing image...');
      
      const response = await api.post('/receipts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: abortControllerRef.current.signal,
        timeout: 60000 // 60 second timeout
      });

      clearInterval(progressInterval);
      setUploadProgress(50);
      setProcessingStage('Analyzing receipt...');
      
      // Simulate analysis progress
      setTimeout(() => {
        setUploadProgress(100);
        setProcessingStage('Complete!');
      }, 500);

      setOcrResult(response.data);
      toast.success('Receipt uploaded and processed successfully!');
      
      // Reset after 2 seconds
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setOcrResult(null);
        setUploadProgress(0);
        setProcessingStage('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        toast.error('Upload timed out. Please try again.');
        setError('Upload timed out. Please try a smaller file or check your connection.');
      } else if (error.response?.status === 403) {
        const errorData = error.response.data;
        toast.error(errorData.error || 'Upload limit reached');
        setError(errorData);
      } else {
        const errorMessage = error.response?.data?.error || 'Upload failed. Please try again.';
        toast.error(errorMessage);
        setError(errorMessage);
      }
      setUploadProgress(0);
      setProcessingStage('');
    } finally {
      setUploading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setUploading(false);
    setUploadProgress(0);
    setProcessingStage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Receipt</h1>
          <p className="text-base text-gray-600">Upload a receipt or invoice to analyze with AI-powered risk assessment</p>
        </div>

        {/* Step Indicator */}
        {uploading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  uploadProgress < 30 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                } transition-colors`}>
                  {uploadProgress >= 30 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">1</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Uploading</p>
                  <p className="text-xs text-gray-500">Sending file to server</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  uploadProgress >= 30 && uploadProgress < 80 ? 'bg-blue-600 text-white' : 
                  uploadProgress >= 80 ? 'bg-gray-200 text-gray-600' : 'bg-gray-200 text-gray-400'
                } transition-colors`}>
                  {uploadProgress >= 80 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">2</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Processing</p>
                  <p className="text-xs text-gray-500">OCR & AI analysis</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  uploadProgress >= 80 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                } transition-colors`}>
                  <span className="text-sm font-semibold">3</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Complete</p>
                  <p className="text-xs text-gray-500">Results ready</p>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-3 text-center">{processingStage}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            uploading 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label htmlFor="file-upload" className={`cursor-pointer ${uploading ? 'pointer-events-none' : ''}`}>
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-base font-medium text-gray-700 mb-1">
              {uploading ? 'Processing...' : 'Drag and drop a receipt here'}
            </p>
            <p className="text-sm text-gray-500">
              {uploading ? 'Please wait while we process your file' : 'or click to browse (JPEG, PNG, WEBP, PDF up to 10MB)'}
            </p>
          </label>
        </div>

        {preview && !uploading && (
          <div className="mt-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setError(null);
                    setOcrResult(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>
              <img src={preview} alt="Receipt preview" className="max-w-full h-auto rounded-lg border border-gray-200" />
            </div>
          </div>
        )}

        {file && !uploading && (
          <div className="mt-6">
            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
            >
              Upload & Process Receipt
            </button>
          </div>
        )}
            
        {/* Error messages */}
        {error && typeof error === 'string' && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Upload Failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Limit reached error with upgrade prompt */}
        {error && typeof error === 'object' && error.limitReached && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 mb-1">{error.error}</p>
                <p className="text-sm text-yellow-700 mb-3">
                  You've used {error.currentCount} of {error.limit} receipts on your {error.currentPlan} plan.
                </p>
                <button
                  onClick={() => navigate('/settings/billing')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                >
                  Upgrade to {error.suggestedPlan}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {ocrResult && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 border-t-4 border-green-500">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Analysis Complete</h2>
              <p className="text-sm text-gray-600">Your receipt has been processed and analyzed</p>
            </div>
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-800">Success</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Risk Assessment</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  ocrResult.analysis.risk_score > 60 ? 'bg-red-100 text-red-800' :
                  ocrResult.analysis.risk_score > 30 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {ocrResult.analysis.risk_score}/100 ({ocrResult.analysis.risk_level})
                </span>
              </div>
            </div>
            
            {ocrResult.analysis.alerts?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Alerts
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {ocrResult.analysis.alerts.map((alert, i) => (
                    <li key={i} className="text-sm text-yellow-800">{alert}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {ocrResult.receipt && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Receipt Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-blue-700">Vendor:</span>
                    <span className="ml-2 text-blue-900 font-medium">{ocrResult.receipt.vendor}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Amount:</span>
                    <span className="ml-2 text-blue-900 font-medium">
                      {ocrResult.receipt.currency || 'USD'} {ocrResult.receipt.total?.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Date:</span>
                    <span className="ml-2 text-blue-900 font-medium">
                      {new Date(ocrResult.receipt.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Status:</span>
                    <span className="ml-2 text-blue-900 font-medium capitalize">{ocrResult.receipt.status}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
              >
                View Dashboard
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setOcrResult(null);
                  setError(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors shadow-sm"
              >
                Upload Another
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Upload;
