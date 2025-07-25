import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Target, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { CustomerDocument } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AIRecommendationsProps {
  documents: CustomerDocument[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function AIRecommendations({ documents }: AIRecommendationsProps) {
  // Generate personalized insights
  const generateInsights = () => {
    const completionRates = Array.from({ length: 7 }, (_, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      rate: Math.floor(Math.random() * 30) + 70,
      accuracy: Math.floor(Math.random() * 20) + 80
    }));

    // Shortened names for better display
    const priorityScores = [
      { name: 'Registration', score: 85, confidence: 90 },
      { name: 'W-9', score: 92, confidence: 78 },
      { name: 'Statements', score: 88, confidence: 85 },
      { name: 'Address', score: 75, confidence: 82 },
      { name: 'Tax Returns', score: 95, confidence: 88 }
    ];

    return {
      completionRates,
      priorityScores,
      recommendedActions: [
        {
          title: 'High Priority Follow-ups',
          description: 'Schedule follow-ups for 3 overdue documents',
          impact: 'High',
          timeEstimate: '15 mins'
        },
        {
          title: 'Document Review',
          description: 'Review 2 pending legal documents',
          impact: 'Medium',
          timeEstimate: '30 mins'
        },
        {
          title: 'Update Categories',
          description: 'Recategorize 5 documents based on new patterns',
          impact: 'Low',
          timeEstimate: '10 mins'
        }
      ]
    };
  };

  const insights = generateInsights();

  // Custom legend renderer for consistent styling
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="flex justify-center items-center space-x-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 rounded-sm mr-1"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-purple-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">AI Recommendations</h3>
        </div>
        <span className="text-sm text-gray-500 flex items-center">
          <Sparkles className="h-4 w-4 text-yellow-500 mr-1" />
          Personalized Insights
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Completion Rate Chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Document Completion Patterns</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={insights.completionRates}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="day"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  content={renderLegend}
                  verticalAlign="top"
                  height={36}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Completion Rate"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  name="AI Accuracy"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Priority Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={insights.priorityScores}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ 
                    fontSize: 11,
                    fill: '#4B5563',
                    dy: 10
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  content={renderLegend}
                  verticalAlign="top"
                  height={36}
                />
                <Bar
                  dataKey="score"
                  name="Priority Score"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="confidence"
                  name="AI Confidence"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Recommended Actions</h4>
        {insights.recommendedActions.map((action, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {action.impact === 'High' && <AlertCircle className="h-5 w-5 text-red-500 mr-2" />}
                {action.impact === 'Medium' && <Target className="h-5 w-5 text-yellow-500 mr-2" />}
                {action.impact === 'Low' && <TrendingUp className="h-5 w-5 text-green-500 mr-2" />}
                <h5 className="font-medium text-gray-900">{action.title}</h5>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">{action.timeEstimate}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">{action.description}</p>
            <div className="mt-2 flex justify-between items-center">
              <span className={`text-sm px-2 py-1 rounded-full ${
                action.impact === 'High' ? 'bg-red-100 text-red-800' :
                action.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {action.impact} Impact
              </span>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                Take Action
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default AIRecommendations;