import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeftRight, 
  FileText, 
  Brain, 
  AlertCircle, 
  CheckCircle,
  Maximize2,
  Minimize2,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { CustomerDocument } from '../types';
import { format } from 'date-fns';

interface DocumentComparisonProps {
  documents: CustomerDocument[];
  onComparisonComplete?: (insights: ComparisonInsights) => void;
}

interface ComparisonInsights {
  differences: Array<{
    field: string;
    doc1Value: any;
    doc2Value: any;
    significance: number;
    recommendation?: string;
  }>;
  summary: {
    totalDifferences: number;
    significantChanges: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
  aiAnalysis: {
    confidence: number;
    keyInsights: string[];
    suggestedActions: string[];
  };
}

function DocumentComparison({ documents, onComparisonComplete }: DocumentComparisonProps) {
  const [selectedDocs, setSelectedDocs] = useState<[CustomerDocument?, CustomerDocument?]>([]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonInsights | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    aiAnalysis: true,
    differences: false,
    summary: false
  });

  const compareDocuments = async () => {
    if (selectedDocs.length !== 2 || !selectedDocs[0] || !selectedDocs[1]) return;
    
    setIsComparing(true);
    
    try {
      // Simulate AI-powered comparison
      await new Promise(resolve => setTimeout(resolve, 1500));

      const insights: ComparisonInsights = {
        differences: [
          {
            field: 'status',
            doc1Value: selectedDocs[0].status,
            doc2Value: selectedDocs[1].status,
            significance: 0.8,
            recommendation: 'Consider updating status to maintain consistency'
          },
          {
            field: 'due_date',
            doc1Value: selectedDocs[0].due_date,
            doc2Value: selectedDocs[1].due_date,
            significance: 0.9,
            recommendation: 'Align due dates to prevent confusion'
          }
        ],
        summary: {
          totalDifferences: 2,
          significantChanges: 1,
          riskLevel: 'medium',
          recommendations: [
            'Synchronize document statuses',
            'Review due dates for consistency'
          ]
        },
        aiAnalysis: {
          confidence: 85,
          keyInsights: [
            'Status mismatch detected',
            'Due date discrepancy found'
          ],
          suggestedActions: [
            'Update document statuses',
            'Align due dates',
            'Review metadata'
          ]
        }
      };

      setComparisonResult(insights);
      if (onComparisonComplete) {
        onComparisonComplete(insights);
      }
    } catch (error) {
      console.error('Comparison error:', error);
    } finally {
      setIsComparing(false);
    }
  };

  const handleDocumentSelect = (doc: CustomerDocument, index: 0 | 1) => {
    setSelectedDocs(prev => {
      const newDocs = [...prev] as [CustomerDocument?, CustomerDocument?];
      newDocs[index] = doc;
      return newDocs;
    });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    if (selectedDocs[0] && selectedDocs[1]) {
      compareDocuments();
    }
  }, [selectedDocs]);

  return (
    <div className={`bg-white rounded-lg shadow-lg transition-all ${
      isExpanded ? 'fixed inset-4 z-50 overflow-auto' : ''
    }`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <ArrowLeftRight className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">Document Comparison</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <Minimize2 className="h-5 w-5 text-gray-600" />
            ) : (
              <Maximize2 className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Document Selection - Now in a scrollable container */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {[0, 1].map((index) => (
            <div key={index} className="space-y-2">
              <h4 className="font-medium text-gray-700">
                Document {index + 1}
              </h4>
              <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleDocumentSelect(doc, index as 0 | 1)}
                    className={`w-full p-3 rounded-lg border transition-colors ${
                      selectedDocs[index]?.id === doc.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-gray-400 mt-1 mr-2" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900 text-sm">{doc.name}</div>
                        <div className="text-xs text-gray-500">
                          {doc.type} • Due: {format(new Date(doc.due_date), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Results with Collapsible Sections */}
        {isComparing ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Analyzing documents...</p>
          </div>
        ) : comparisonResult && (
          <div className="space-y-4">
            {/* AI Analysis Section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('aiAnalysis')}
                className="w-full px-6 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-gray-900">AI Analysis</h4>
                  <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {comparisonResult.aiAnalysis.confidence}% Confidence
                  </span>
                </div>
                {expandedSections.aiAnalysis ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedSections.aiAnalysis && (
                <div className="p-6 space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Key Insights</h5>
                    <div className="space-y-2">
                      {comparisonResult.aiAnalysis.keyInsights.map((insight, index) => (
                        <div
                          key={index}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <AlertCircle className="h-4 w-4 text-blue-500 mr-2" />
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Suggested Actions</h5>
                    <div className="space-y-2">
                      {comparisonResult.aiAnalysis.suggestedActions.map((action, index) => (
                        <div
                          key={index}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Differences Section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('differences')}
                className="w-full px-6 py-4 bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <ArrowLeftRight className="h-5 w-5 text-gray-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Detailed Comparison</h4>
                </div>
                {expandedSections.differences ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedSections.differences && (
                <div className="p-6">
                  <div className="space-y-4">
                    {comparisonResult.differences.map((diff, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg border border-gray-200 p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 capitalize">
                            {diff.field}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            diff.significance > 0.7
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {Math.round(diff.significance * 100)}% Significant
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div>
                            <div className="text-sm text-gray-500">Document 1</div>
                            <div className="text-sm font-medium text-gray-900">
                              {diff.doc1Value}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Document 2</div>
                            <div className="text-sm font-medium text-gray-900">
                              {diff.doc2Value}
                            </div>
                          </div>
                        </div>
                        {diff.recommendation && (
                          <div className="mt-2 text-sm text-blue-600 flex items-center">
                            <Brain className="h-4 w-4 mr-1" />
                            {diff.recommendation}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Summary Section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('summary')}
                className="w-full px-6 py-4 bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-gray-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Summary</h4>
                </div>
                {expandedSections.summary ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedSections.summary && (
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {comparisonResult.summary.totalDifferences}
                      </div>
                      <div className="text-sm text-gray-500">Total Differences</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {comparisonResult.summary.significantChanges}
                      </div>
                      <div className="text-sm text-gray-500">Significant Changes</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className={`text-2xl font-bold ${
                        comparisonResult.summary.riskLevel === 'high'
                          ? 'text-red-600'
                          : comparisonResult.summary.riskLevel === 'medium'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}>
                        {comparisonResult.summary.riskLevel.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500">Risk Level</div>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h5>
                    <div className="space-y-2">
                      {comparisonResult.summary.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentComparison;