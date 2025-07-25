import React, { useCallback, useState } from 'react';
import { Upload, File, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateDocument } from '../lib/documentValidation';
import type { ValidationResult } from '../lib/documentValidation';

interface UploadStatus {
  id: string;
  name: string;
  progress: number;
  status: 'validating' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  validation?: ValidationResult;
}

function DocumentUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadStatus[]>([]);

  const processFile = async (file: File) => {
    const upload: UploadStatus = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      progress: 0,
      status: 'validating'
    };

    setUploads(prev => [...prev, upload]);

    // Validate file
    const validationResult = await validateDocument(file);
    
    if (!validationResult.passed) {
      setUploads(prev =>
        prev.map(u =>
          u.id === upload.id
            ? { ...u, status: 'error', error: 'Validation failed', validation: validationResult }
            : u
        )
      );
      return;
    }

    // Update with validation results
    setUploads(prev =>
      prev.map(u =>
        u.id === upload.id
          ? { ...u, status: 'uploading', validation: validationResult }
          : u
      )
    );

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploads(prev =>
        prev.map(u =>
          u.id === upload.id ? { ...u, progress: i } : u
        )
      );
    }

    // Simulate processing
    setUploads(prev =>
      prev.map(u =>
        u.id === upload.id ? { ...u, status: 'processing' } : u
      )
    );

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Complete
    setUploads(prev =>
      prev.map(u =>
        u.id === upload.id ? { ...u, status: 'complete' } : u
      )
    );
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(processFile);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(processFile);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Shield className="h-6 w-6 text-blue-500 mr-2" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Smart Document Upload</h3>
            <p className="text-sm text-gray-500">With automatic validation and data extraction</p>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
          Supports PDF, DOC, DOCX
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center
          transition-colors cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          accept=".pdf,.doc,.docx"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drag and drop your documents here
          </p>
          <p className="text-sm text-gray-500">
            or <span className="text-blue-500 hover:text-blue-600">browse files</span>
          </p>
        </label>
      </div>

      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 space-y-4"
          >
            <h4 className="font-medium text-gray-900">Upload Status</h4>
            {uploads.map(upload => (
              <motion.div
                key={upload.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <File className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">{upload.name}</span>
                  </div>
                  <div className="flex items-center">
                    {upload.status === 'validating' && (
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-blue-500 animate-pulse mr-2" />
                        <span className="text-sm text-blue-600">Validating</span>
                      </div>
                    )}
                    {upload.status === 'uploading' && (
                      <span className="text-sm text-blue-600">{upload.progress}%</span>
                    )}
                    {upload.status === 'processing' && (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    )}
                    {upload.status === 'complete' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {upload.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>

                {upload.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${upload.progress}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                )}

                {upload.validation && (
                  <div className="mt-2">
                    <div className="flex items-center">
                      <Shield className={`h-4 w-4 mr-1 ${
                        upload.validation.passed ? 'text-green-500' : 'text-red-500'
                      }`} />
                      <span className={`text-sm ${
                        upload.validation.passed ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {upload.validation.passed ? 'Validation passed' : 'Validation failed'}
                      </span>
                    </div>
                    {upload.validation.issues.length > 0 && (
                      <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                        {upload.validation.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    )}
                    {upload.validation.extractedData && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Category: {upload.validation.extractedData.category}</p>
                        <p>Date: {upload.validation.extractedData.date}</p>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-sm mt-1">
                  {upload.status === 'uploading' && 'Uploading...'}
                  {upload.status === 'processing' && 'Processing document...'}
                  {upload.status === 'complete' && 'Upload complete'}
                  {upload.status === 'error' && (
                    <span className="text-red-600">{upload.error}</span>
                  )}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DocumentUpload;