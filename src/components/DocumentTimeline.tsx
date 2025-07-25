import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, AlertCircle, CheckCircle, FileText, Brain, TrendingUp, BarChart2, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { CustomerDocument } from '../types';

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'document' | 'reminder' | 'status';
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'overdue';
  document: CustomerDocument;
}

interface DocumentTimelineProps {
  documents: CustomerDocument[];
}

function DocumentTimeline({ documents }: DocumentTimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const generateTimelineEvents = (docs: CustomerDocument[]): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    docs.forEach(doc => {
      // Add document creation event
      events.push({
        id: `creation-${doc.id}`,
        date: new Date(doc.created_at || new Date()),
        type: 'document',
        title: `Document Created: ${doc.name}`,
        description: `New document ${doc.name} added to the system`,
        status: doc.status,
        document: doc
      });

      // Add due date event
      events.push({
        id: `due-${doc.id}`,
        date: new Date(doc.due_date),
        type: 'status',
        title: `Due Date: ${doc.name}`,
        description: `Document ${doc.name} is due`,
        status: doc.status,
        document: doc
      });

      // Add reminder events
      if (doc.last_reminder) {
        events.push({
          id: `reminder-${doc.id}`,
          date: new Date(doc.last_reminder),
          type: 'reminder',
          title: `Reminder Sent: ${doc.name}`,
          description: `Follow-up reminder sent for ${doc.name}`,
          status: doc.status,
          document: doc
        });
      }
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-5 w-5" />;
      case 'reminder': return <Clock className="h-5 w-5" />;
      case 'status': return <Calendar className="h-5 w-5" />;
      default: return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getEventColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const generateAnalyticsData = () => {
    return Array.from({ length: 7 }, (_, i) => ({
      day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
      progress: Math.floor(Math.random() * 40) + 60,
      risk: Math.floor(Math.random() * 30) + 20,
      efficiency: Math.floor(Math.random() * 25) + 75
    }));
  };

  const generateProcessingTimeData = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      processingTime: Math.sin(i / 4) * 20 + 30 + Math.random() * 10,
      accuracy: Math.cos(i / 4) * 15 + 75 + Math.random() * 5
    }));
  };

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

  const timelineEvents = generateTimelineEvents(documents);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Calendar className="h-6 w-6 text-gray-600 mr-2" />
        <h3 className="text-xl font-semibold text-gray-900">Document Timeline</h3>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {timelineEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-12"
              onClick={() => setSelectedEvent(event)}
            >
              <div className={`absolute left-0 p-2 rounded-full ${getEventColor(event.status)} cursor-pointer hover:scale-110 transition-transform`}>
                {getEventIcon(event.type)}
              </div>

              <div className={`rounded-lg p-4 border ${getEventColor(event.status)} cursor-pointer hover:shadow-md transition-shadow`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-medium">{event.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventColor(event.status)}`}>
                    {event.document.status.charAt(0).toUpperCase() + event.document.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{format(event.date, 'MMM d, yyyy')}</span>
                  {event.document.ai_analysis && (
                    <span className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Risk Level: {event.document.ai_analysis.risk_level}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog 
        open={selectedEvent !== null} 
        onClose={() => setSelectedEvent(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {selectedEvent && (
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center">
                    <Brain className="h-6 w-6 text-purple-600 mr-2" />
                    <div>
                      <Dialog.Title className="text-2xl font-semibold text-gray-900">
                        {selectedEvent.document.name}
                      </Dialog.Title>
                      <p className="text-gray-500">{selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)} Event</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Target className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-blue-900">AI Confidence</h4>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">
                      {selectedEvent.document.ai_analysis?.category_confidence.toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="font-medium text-green-900">Processing Time</h4>
                    </div>
                    <p className="text-3xl font-bold text-green-700">2.4 days</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="h-5 w-5 text-purple-600 mr-2" />
                      <h4 className="font-medium text-purple-900">Risk Score</h4>
                    </div>
                    <p className="text-3xl font-bold text-purple-700">
                      {selectedEvent.document.ai_urgency_score.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Processing Progress</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={generateAnalyticsData()} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="day" 
                            tick={{ fontSize: 12 }}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            label={{ 
                              value: 'Percentage (%)', 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { fontSize: 12 }
                            }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar 
                            dataKey="progress" 
                            name="Progress"
                            fill="#3b82f6" 
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar 
                            dataKey="risk" 
                            name="Risk Level"
                            fill="#ef4444" 
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar 
                            dataKey="efficiency" 
                            name="Efficiency"
                            fill="#10b981" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Processing Time Analysis</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={generateProcessingTimeData()}
                          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="hour"
                            tick={{ fontSize: 12 }}
                            label={{ 
                              value: 'Hour of Day', 
                              position: 'insideBottom', 
                              offset: -5,
                              style: { fontSize: 12 }
                            }}
                          />
                          <YAxis 
                            yAxisId="left"
                            tick={{ fontSize: 12 }}
                            label={{ 
                              value: 'Processing Time (min)', 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { fontSize: 12 }
                            }}
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 12 }}
                            label={{ 
                              value: 'Accuracy (%)', 
                              angle: 90, 
                              position: 'insideRight',
                              style: { fontSize: 12 }
                            }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="processingTime" 
                            name="Processing Time"
                            stroke="#8b5cf6" 
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="accuracy" 
                            name="Accuracy"
                            stroke="#f59e0b" 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <Brain className="h-6 w-6 text-indigo-600 mr-2" />
                    <h4 className="text-xl font-semibold text-indigo-900">AI Insights</h4>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Key Insights</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedEvent.document.ai_analysis?.key_insights.map((insight, index) => (
                          <li key={index} className="text-gray-600">{insight}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Suggested Actions</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedEvent.document.ai_analysis?.suggested_actions.map((action, index) => (
                          <li key={index} className="text-gray-600">{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => setSelectedEvent(null)}
                  >
                    Close
                  </button>
                  <button
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Take Action
                  </button>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

export default DocumentTimeline;