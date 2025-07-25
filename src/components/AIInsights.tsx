import React from 'react';
import { Brain, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface DocumentInsight {
  id: string;
  name: string;
  confidence: number;
  sentiment: number;
  priority: number;
  category: string;
  predictedDeadline: Date;
  riskFactors: string[];
}

interface AIInsightsProps {
  documents: DocumentInsight[];
}

function AIInsights({ documents }: AIInsightsProps) {
  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.7) return 'text-green-600';
    if (sentiment >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <Brain className="h-6 w-6 text-purple-600 mr-2" />
        <h3 className="text-xl font-semibold text-purple-900">AI Document Analysis</h3>
      </div>

      <div className="space-y-6">
        {documents.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-900">{doc.name}</h4>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {doc.confidence}% Confidence
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Sentiment Analysis</p>
                <div className="flex items-center">
                  <span className={`text-lg font-semibold ${getSentimentColor(doc.sentiment)}`}>
                    {(doc.sentiment * 100).toFixed(0)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-2">Positive</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Priority Score</p>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-blue-600">
                    {doc.priority}/10
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <Zap className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Smart Category</p>
                  <p className="text-sm text-gray-600">{doc.category}</p>
                </div>
              </div>

              <div className="flex items-start">
                <TrendingUp className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Predicted Deadline</p>
                  <p className="text-sm text-gray-600">
                    {doc.predictedDeadline.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Risk Factors</p>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {doc.riskFactors.map((factor, i) => (
                      <li key={i}>{factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default AIInsights;