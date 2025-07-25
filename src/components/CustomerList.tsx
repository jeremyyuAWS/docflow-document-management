import React, { useState } from 'react';
import { format } from 'date-fns';
import { Users, ChevronRight, AlertCircle, CheckCircle, Clock, TrendingUp, Brain, Target, Calendar, Mail, MessageSquare, Send } from 'lucide-react';
import { mockCustomers, mockDocuments } from '../data/mockData';
import type { Customer } from '../types';
import { Dialog } from '@headlessui/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import DocumentTimeline from './DocumentTimeline';
import DocumentCategories from './DocumentCategories';
import { motion, AnimatePresence } from 'framer-motion';
import SmartOutreach from './SmartOutreach';

function CustomerList() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showSmartOutreach, setShowSmartOutreach] = useState(false);

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Hubspot': return '🟠';
      case 'Salesforce': return '🔵';
      case 'Zoho': return '🟣';
      default: return '⚪';
    }
  };

  // Generate mock engagement data for visualization
  const generateEngagementData = () => {
    return Array.from({ length: 7 }, (_, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      engagement: Math.floor(Math.random() * 40) + 60
    }));
  };

  // Generate mock response time data
  const generateResponseTimeData = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      responseRate: Math.sin(i / 4) * 20 + 70 + Math.random() * 10
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100">
      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Customers
          </h2>
          <div className="flex space-x-2">
            <span className="text-sm text-gray-500">Sources:</span>
            <span title="Hubspot">🟠</span>
            <span title="Salesforce">🔵</span>
            <span title="Zoho">🟣</span>
          </div>
        </div>

        <div className="space-y-4">
          {mockCustomers.map(customer => (
            <div
              key={customer.id}
              className="border border-gray-100 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
              onClick={() => setSelectedCustomer(customer)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <span className="mr-2">{getSourceIcon(customer.source)}</span>
                    <h3 className="text-lg font-medium text-gray-900">{customer.full_name}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{customer.company} • {customer.role}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(customer.ai_suggestions.priority_level)}`}>
                  {customer.ai_suggestions.priority_level} Priority
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Documents Status</p>
                  <div className="flex items-center mt-1 space-x-4">
                    <span className="flex items-center text-sm">
                      <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                      {customer.documents_pending} Pending
                    </span>
                    <span className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      {customer.documents_completed} Completed
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Next Follow-up</p>
                  <p className="text-sm mt-1">
                    {customer.next_follow_up ? (
                      <>
                        <Clock className="h-4 w-4 text-blue-500 inline mr-1" />
                        {format(new Date(customer.next_follow_up), 'MMM d, yyyy')}
                      </>
                    ) : (
                      <span className="text-gray-400">Not scheduled</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 text-blue-500" />
                  AI Suggestion: {customer.ai_suggestions.engagement_tips}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog 
        open={selectedCustomer !== null} 
        onClose={() => setSelectedCustomer(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {selectedCustomer && (
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Dialog.Title className="text-2xl font-semibold text-gray-900">
                      {selectedCustomer.full_name}
                    </Dialog.Title>
                    <p className="text-gray-500">{selectedCustomer.company} • {selectedCustomer.role}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Enhanced AI Insights Section */}
                <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Brain className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="text-xl font-semibold text-blue-900">AI Engagement Insights</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Key Metrics */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-4">Key Metrics</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Engagement Score</span>
                            <span className="text-lg font-semibold text-blue-600">{selectedCustomer.engagement_score}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${selectedCustomer.engagement_score}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                          <div className="flex items-center">
                            <Target className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm">Priority Level</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedCustomer.ai_suggestions.priority_level)}`}>
                            {selectedCustomer.ai_suggestions.priority_level}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm">Best Contact Time</span>
                          </div>
                          <span className="text-sm font-medium text-green-600">
                            {selectedCustomer.ai_suggestions.best_contact_time}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 text-purple-600 mr-2" />
                            <span className="text-sm">Preferred Channel</span>
                          </div>
                          <span className="text-sm font-medium text-purple-600">
                            {selectedCustomer.email ? 'Email' : 'Phone'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Engagement Chart */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-4">Weekly Engagement Pattern</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={generateEngagementData()}>
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="engagement" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Response Time Chart */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-4">Response Time Analysis</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={generateResponseTimeData()}>
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="responseRate" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">AI Recommendations</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <TrendingUp className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Engagement Strategy</p>
                          <p className="text-sm text-gray-600">{selectedCustomer.ai_suggestions.engagement_tips}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Risk Assessment</p>
                          <p className="text-sm text-gray-600">
                            {selectedCustomer.documents_pending > 2 
                              ? 'High risk of delay. Immediate follow-up recommended.' 
                              : 'Low risk. Regular follow-up schedule advised.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Contact Information</p>
                    <p className="text-sm mt-1">{selectedCustomer.email}</p>
                    <p className="text-sm">{selectedCustomer.phone}</p>
                  </div>
                </div>

                {/* Add Document Categories before the Documents Section */}
                <div className="mb-6">
                  <DocumentCategories documents={mockDocuments[selectedCustomer.id]} />
                </div>

                {/* Documents Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
                  <div className="space-y-3">
                    {mockDocuments[selectedCustomer.id].map(doc => (
                      <div
                        key={doc.id}
                        className="border border-gray-100 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{doc.name}</h4>
                            <p className="text-sm text-gray-500">Due: {format(new Date(doc.due_date), 'MMM d, yyyy')}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              doc.status === 'received' ? 'bg-green-50 text-green-700' :
                              doc.status === 'overdue' ? 'bg-red-50 text-red-700' :
                              'bg-yellow-50 text-yellow-700'
                            }`}
                          >
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </span>
                        </div>
                        {doc.status !== 'received' && (
                          <div className="mt-3 text-sm">
                            <p className="text-gray-500">
                              Last reminder: {format(new Date(doc.last_reminder), 'MMM d, yyyy')}
                            </p>
                            <p className="text-blue-600 mt-1">
                              AI Urgency Score: {Math.round(doc.ai_urgency_score)}%
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Document Timeline */}
                <DocumentTimeline documents={mockDocuments[selectedCustomer.id]} />

                <div className="mt-6">
                  <button
                    onClick={() => setShowSmartOutreach(true)}
                    className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Take Smart Action
                  </button>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    Close
                  </button>
                  <button
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Schedule Follow-up
                  </button>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      <AnimatePresence>
        {showSmartOutreach && selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <SmartOutreach
                customer={selectedCustomer}
                documents={mockDocuments[selectedCustomer.id]}
                onClose={() => setShowSmartOutreach(false)}
                onSend={(message) => {
                  console.log('Sending message:', message);
                  setShowSmartOutreach(false);
                  // Implement message sending logic here
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CustomerList;