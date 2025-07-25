import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tags, FileText, Brain, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { documentClassifier } from '../lib/documentClassification';
import type { CustomerDocument } from '../types';

interface SmartDocumentClassifierProps {
  document: CustomerDocument;
  onClassificationComplete?: (tags: string[]) => void;
}

function SmartDocumentClassifier({ document, onClassificationComplete }: SmartDocumentClassifierProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const analyzeDocument = async () => {
    setIsAnalyzing(true);
    try {
      const [categories, tagResults] = await Promise.all([
        documentClassifier.classifyDocument(document),
        documentClassifier.generateTags(document)
      ]);

      setAnalysisResults({ categories, tagResults });
      setSelectedTags(new Set(tagResults.tags));

      if (onClassificationComplete) {
        onClassificationComplete(tagResults.tags);
      }
    } catch (error) {
      console.error('Error analyzing document:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Tags className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Smart Document Classification</h3>
        </div>
        <button
          onClick={analyzeDocument}
          disabled={isAnalyzing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isAnalyzing ? (
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Brain className="h-5 w-5 mr-2" />
          )}
          Analyze Document
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-1" />
            {document.name}
          </div>
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {document.type}
          </div>
        </div>
      </div>

      {analysisResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Categories */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Detected Categories</h4>
            <div className="space-y-3">
              {analysisResults.categories.map((category: any) => (
                <div
                  key={category.id}
                  className="bg-gray-50 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{category.name}</h5>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {(category.confidence * 100).toFixed(1)}% Confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Smart Tags</h4>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                {(analysisResults.tagResults.confidence * 100).toFixed(1)}% Confidence
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedTags).map((tag) => (
                <span
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200 transition-colors flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Suggested Tags */}
          {analysisResults.tagResults.suggestedTags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Suggested Tags</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResults.tagResults.suggestedTags.map((tag: string) => (
                  <span
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                      selectedTags.has(tag)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Extracted Metadata</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-1">Dates</h5>
                <div className="flex flex-wrap gap-2">
                  {analysisResults.tagResults.metadata.extractedDates.map((date: string) => (
                    <span key={date} className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {date}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-1">Entities</h5>
                <div className="flex flex-wrap gap-2">
                  {analysisResults.tagResults.metadata.entities.map((entity: string) => (
                    <span key={entity} className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-1">Key Phrases</h5>
                <div className="flex flex-wrap gap-2">
                  {analysisResults.tagResults.metadata.keyPhrases.map((phrase: string) => (
                    <span key={phrase} className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default SmartDocumentClassifier;