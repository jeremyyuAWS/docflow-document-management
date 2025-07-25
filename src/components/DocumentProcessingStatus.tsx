import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, RefreshCw, FileText, Brain } from 'lucide-react';
import type { ProcessingStatus, ProcessingMetrics } from '../lib/documentProcessing';
import { documentProcessor } from '../lib/documentProcessing';
import type { CustomerDocument } from '../types';

interface DocumentProcessingStatusProps {
  document: CustomerDocument;
  onProcessingComplete?: (status: ProcessingStatus) => void;
}

function DocumentProcessingStatus({ document, onProcessingComplete }: DocumentProcessingStatusProps) {
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [metrics, setMetrics] = useState<ProcessingMetrics | null>(null);

  const startProcessing = async () => {
    const status = await documentProcessor.processDocument(document);
    setProcessingStatus(status);
    if (status.stage === 'completed' && onProcessingComplete) {
      onProcessingComplete(status);
    }
    updateMetrics();
  };

  const updateMetrics = () => {
    setMetrics(documentProcessor.getProcessingMetrics());
  };

  const getStepIcon = (status: 'pending' | 'completed' | 'failed') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-purple-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Document Processing</h3>
        </div>
        <button
          onClick={startProcessing}
          disabled={processingStatus?.stage === 'processing'}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {processingStatus?.stage === 'processing' ? (
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <FileText className="h-5 w-5 mr-2" />
          )}
          Process Document
        </button>
      </div>

      {processingStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Processing Progress</span>
              <span className="text-sm text-gray-500">{processingStatus.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${processingStatus.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Processing Steps */}
          <div className="space-y-3">
            {processingStatus.metadata.processingSteps.map((step, index) => (
              <motion.div
                key={step.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  {getStepIcon(step.status)}
                  <span className="ml-2 text-sm font-medium text-gray-700">{step.name}</span>
                </div>
                <span className={`text-sm ${
                  step.status === 'completed' ? 'text-green-600' :
                  step.status === 'failed' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {step.status}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Extracted Data */}
          {processingStatus.metadata.extractedData && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-900 mb-3">Extracted Information</h4>
              <div className="space-y-2">
                {Object.entries(processingStatus.metadata.extractedData).map(([key, value]) => (
                  <div key={key} className="flex items-start">
                    <span className="text-sm font-medium text-purple-800 mr-2">{key}:</span>
                    <span className="text-sm text-purple-600">
                      {Array.isArray(value) ? value.join(', ') : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Metrics */}
          {metrics && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Success Rate</div>
                <div className="text-2xl font-semibold text-green-600">
                  {metrics.successRate.toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Avg. Processing Time</div>
                <div className="text-2xl font-semibold text-blue-600">
                  {metrics.averageProcessingTime.toFixed(1)}s
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default DocumentProcessingStatus;