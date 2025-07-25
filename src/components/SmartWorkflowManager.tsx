import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Play, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { workflowAutomation } from '../lib/workflowAutomation';
import type { Customer, CustomerDocument } from '../types';

interface SmartWorkflowManagerProps {
  customer: Customer;
  document: CustomerDocument;
  onWorkflowComplete?: (execution: any) => void;
}

function SmartWorkflowManager({ customer, document, onWorkflowComplete }: SmartWorkflowManagerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [executions, setExecutions] = useState<any[]>([]);

  const executeWorkflow = async () => {
    setIsProcessing(true);
    try {
      const execution = await workflowAutomation.processDocument(document, customer);
      setExecutions(prev => [execution, ...prev]);
      if (onWorkflowComplete) {
        onWorkflowComplete(execution);
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Settings className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Workflow Automation</h3>
        </div>
        <button
          onClick={executeWorkflow}
          disabled={isProcessing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isProcessing ? (
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Play className="h-5 w-5 mr-2" />
          )}
          Execute Workflow
        </button>
      </div>

      {executions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Execution History</h4>
          {executions.map((execution) => (
            <motion.div
              key={execution.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {getStatusIcon(execution.status)}
                  <span className="ml-2 font-medium text-gray-900">
                    Workflow Execution
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(execution.startedAt).toLocaleString()}
                </span>
              </div>

              <div className="space-y-3">
                {execution.actions.map((action: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm bg-white p-2 rounded"
                  >
                    <span className="text-gray-700">{action.type}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      action.status === 'completed' ? 'bg-green-100 text-green-800' :
                      action.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {action.status}
                    </span>
                  </div>
                ))}
              </div>

              {execution.status === 'failed' && execution.error && (
                <div className="mt-3 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {execution.error}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SmartWorkflowManager;