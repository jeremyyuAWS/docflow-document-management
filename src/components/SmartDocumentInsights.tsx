import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  CheckCircle,
  FileText,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import type { CustomerDocument } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SmartDocumentInsightsProps {
  document: CustomerDocument;
  onInsightAction?: (action: string, data: any) => void;
}

interface InsightMetrics {
  processingTime: number[];
  completionRate: number[];
  accuracy: number[];
}

interface AIRecommendation {
  type: 'action' | 'warning' | 'info';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    handler: () => void;
  };
}

function SmartDocumentInsights({ document, onInsightAction }: SmartDocumentInsightsProps) {
  const [metrics, setMetrics] = useState<InsightMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    metrics: true,
    trends: true,
    recommendations: true
  });

  useEffect(() => {
    analyzeDocument();
  }, [document]);

  const analyzeDocument = async () => {
    setIsLoading(true);
    try {
      // Simulate API call for metrics
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock metrics
      const mockMetrics: InsightMetrics = {
        processingTime: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 20),
        completionRate: Array.from({ length: 7 }, () => Math.floor(Math.random() * 30) + 70),
        accuracy: Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 80)
      };

      // Generate mock recommendations
      const mockRecommendations: AIRecommendation[] = [
        {
          type: 'action',
          title: 'Schedule Follow-up',
          description: 'Based on historical patterns, scheduling a follow-up now would increase response rate by 35%',
          priority: 'high',
          action: {
            label: 'Schedule Now',
            handler: () => onInsightAction?.('schedule_followup', { documentId: document.id })
          }
        },
        {
          type: 'warning',
          title: 'Approaching Deadline',
          description: 'Document due date is approaching with low engagement',
          priority: 'high'
        },
        {
          type: 'info',
          title: 'Processing Optimization',
          description: 'Similar documents have 25% faster processing time when submitted before 2 PM',
          priority: 'medium'
        }
      ];

      setMetrics(mockMetrics);
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error analyzing document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getChartData = () => {
    if (!metrics) return [];
    return Array.from({ length: 7 }, (_, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      processingTime: metrics.processingTime[i],
      completionRate: metrics.completionRate[i],
      accuracy: metrics.accuracy[i]
    }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-purple-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Document Insights</h3>
        </div>
        <div className="flex items-center">
          <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
            AI Confidence: {Math.round(document.ai_analysis?.category_confidence || 0)}%
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <Brain className="h-8 w-8 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Analyzing document...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Document Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">Processing Time</h4>
              </div>
              <p className="text-3xl font-bold text-blue-700">
                {metrics?.processingTime[metrics.processingTime.length - 1]}min
              </p>
              <p className="text-sm text-blue-600 mt-1">
                ↓ 15% from average
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-medium text-green-900">Completion Rate</h4>
              </div>
              <p className="text-3xl font-bold text-green-700">
                {metrics?.completionRate[metrics.completionRate.length - 1]}%
              </p>
              <p className="text-sm text-green-600 mt-1">
                ↑ 8% this week
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Brain className="h-5 w-5 text-purple-600 mr-2" />
                <h4 className="font-medium text-purple-900">AI Accuracy</h4>
              </div>
              <p className="text-3xl font-bold text-purple-700">
                {metrics?.accuracy[metrics.accuracy.length - 1]}%
              </p>
              <p className="text-sm text-purple-600 mt-1">
                Based on historical data
              </p>
            </div>
          </div>

          {/* Metrics Section */}
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('metrics')}
              className="w-full px-6 py-4 bg-gray-50 flex items-center justify-between"
            >
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-gray-600 mr-2" />
                <h4 className="font-medium text-gray-900">Performance Metrics</h4>
              </div>
              {expandedSections.metrics ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {expandedSections.metrics && (
              <div className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="completionRate"
                        name="Completion Rate"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        name="Accuracy"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* AI Recommendations */}
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('recommendations')}
              className="w-full px-6 py-4 bg-gray-50 flex items-center justify-between"
            >
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-gray-600 mr-2" />
                <h4 className="font-medium text-gray-900">AI Recommendations</h4>
              </div>
              {expandedSections.recommendations ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {expandedSections.recommendations && (
              <div className="p-6">
                <div className="space-y-4">
                  {recommendations.map((recommendation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${
                        recommendation.type === 'action'
                          ? 'border-blue-200 bg-blue-50'
                          : recommendation.type === 'warning'
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {recommendation.type === 'action' && (
                            <Zap className="h-5 w-5 text-blue-600 mr-2" />
                          )}
                          {recommendation.type === 'warning' && (
                            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                          )}
                          {recommendation.type === 'info' && (
                            <Brain className="h-5 w-5 text-purple-600 mr-2" />
                          )}
                          <h5 className="font-medium text-gray-900">
                            {recommendation.title}
                          </h5>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          recommendation.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : recommendation.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {recommendation.priority} priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {recommendation.description}
                      </p>
                      {recommendation.action && (
                        <button
                          onClick={recommendation.action.handler}
                          className="text-sm bg-white px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          {recommendation.action.label}
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartDocumentInsights;