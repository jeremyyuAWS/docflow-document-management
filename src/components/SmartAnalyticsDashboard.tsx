import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Users, Clock, MessageSquare, BarChart2, Mail, Phone } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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

function SmartAnalyticsDashboard() {
  // Mock data - In a real app, this would come from your backend
  const channelPerformance = [
    { name: 'Email', success: 75, engagement: 82, responseTime: 4.2 },
    { name: 'WhatsApp', success: 88, engagement: 90, responseTime: 2.1 },
  ];

  const timeOfDayData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    responseRate: Math.sin(i / 4) * 20 + 70 + Math.random() * 10,
    engagement: Math.cos(i / 4) * 15 + 65 + Math.random() * 10,
  }));

  const templatePerformance = [
    { name: 'Friendly Reminder', success: 72, sentiment: 85 },
    { name: 'Urgent Notice', success: 88, sentiment: 65 },
    { name: 'Final Reminder', success: 92, sentiment: 45 },
    { name: 'Follow-up', success: 78, sentiment: 75 },
  ];

  const customerSegments = [
    { name: 'High Engagement', value: 35 },
    { name: 'Medium Engagement', value: 40 },
    { name: 'Low Engagement', value: 25 },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Response Rate</p>
              <p className="text-2xl font-semibold text-gray-900">78.5%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">↑ 12% vs last month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Response Time</p>
              <p className="text-2xl font-semibold text-gray-900">3.2h</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-blue-600">↓ 0.8h improvement</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Customer Satisfaction</p>
              <p className="text-2xl font-semibold text-gray-900">92%</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-purple-600">↑ 5% increase</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">AI Confidence</p>
              <p className="text-2xl font-semibold text-gray-900">85%</p>
            </div>
            <Brain className="h-8 w-8 text-indigo-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-indigo-600">↑ 8% improvement</span>
          </div>
        </motion.div>
      </div>

      {/* Channel Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Channel Performance</h3>
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <MessageSquare className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="success" name="Success Rate" fill="#3B82F6" />
                <Bar dataKey="engagement" name="Engagement" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Response Time Analysis</h3>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeOfDayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="hour"
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="responseRate"
                  name="Response Rate"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  name="Engagement"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Template Performance and Customer Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Template Performance</h3>
            <BarChart2 className="h-5 w-5 text-blue-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={templatePerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="success" name="Success Rate" fill="#3B82F6" />
                <Bar dataKey="sentiment" name="Sentiment Score" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Customer Segments</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerSegments}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {customerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartAnalyticsDashboard;