import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  FileText,
  MessageSquare,
  Calendar,
  BarChart2,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Target,
  Clock,
  Send,
  Check
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface WelcomeGuideProps {
  onClose: () => void;
}

function WelcomeGuide({ onClose }: WelcomeGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const features = [
    {
      title: 'Smart Document Processing',
      Icon: Brain,
      description: 'Our AI automatically analyzes and categorizes your documents, extracting key information and deadlines.',
      benefits: [
        'Automatic document classification',
        'Key information extraction',
        'Deadline tracking',
        'Risk assessment'
      ],
      color: 'bg-blue-500'
    },
    {
      title: 'Intelligent Follow-ups',
      Icon: Calendar,
      description: 'AI-powered follow-up scheduling that learns from customer behavior and response patterns.',
      benefits: [
        'Smart scheduling based on customer behavior',
        'Multi-channel coordination',
        'Automated reminders',
        'Response tracking'
      ],
      color: 'bg-green-500'
    },
    {
      title: 'Smart Communication',
      Icon: MessageSquare,
      description: 'Personalized message templates that adapt based on customer engagement and sentiment.',
      benefits: [
        'Dynamic message personalization',
        'Sentiment analysis',
        'Channel optimization',
        'Response prediction'
      ],
      color: 'bg-purple-500'
    },
    {
      title: 'AI Analytics Dashboard',
      Icon: BarChart2,
      description: 'Real-time insights and analytics powered by AI to help you make data-driven decisions.',
      benefits: [
        'Performance metrics',
        'Engagement analytics',
        'Trend analysis',
        'Smart recommendations'
      ],
      color: 'bg-orange-500'
    }
  ];

  const handleNext = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentIcon = features[currentStep].Icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header - Fixed */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-8">
          <div className="flex items-center mb-4">
            <Sparkles className="h-8 w-8 mr-3" />
            <h2 className="text-3xl font-bold">Welcome to DocFlow</h2>
          </div>
          <p className="text-lg text-purple-100">
            Your smart document management solution powered by AI
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Feature Showcase */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm text-gray-600">
                  Step {currentStep + 1} of {features.length}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentStep === features.length - 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Feature Description */}
                <div className="space-y-6">
                  <div className={`inline-flex items-center justify-center p-3 rounded-xl ${features[currentStep].color} text-white`}>
                    <CurrentIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {features[currentStep].title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {features[currentStep].description}
                  </p>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Key Benefits:</h4>
                    <ul className="space-y-2">
                      {features[currentStep].benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Feature Preview */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <FeaturePreview feature={features[currentStep]} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              Skip tutorial
            </button>
            <button
              onClick={currentStep === features.length - 1 ? onClose : handleNext}
              className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {currentStep === features.length - 1 ? (
                <>
                  Get Started
                  <Send className="h-5 w-5 ml-2" />
                </>
              ) : (
                <>
                  Next Feature
                  <ChevronRight className="h-5 w-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FeaturePreview({ feature }: { feature: typeof features[0] }) {
  // Simulated feature previews
  switch (feature.title) {
    case 'Smart Document Processing':
      return (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-medium">Invoice.pdf</span>
              </div>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Processing
              </span>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-100 rounded">
                <motion.div
                  className="h-2 bg-blue-500 rounded"
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Extracting data...</span>
                <span>75%</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-2">Extracted Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Due Date:</span>
                <span className="text-gray-900">March 25, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="text-gray-900">$1,250.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category:</span>
                <span className="text-gray-900">Financial</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'Intelligent Follow-ups':
      return (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-green-500 mr-2" />
                <span className="font-medium">Follow-up Schedule</span>
              </div>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                AI Optimized
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-blue-500 mr-1" />
                  <span>Initial Email</span>
                </div>
                <span className="text-gray-500">March 20, 10:00 AM</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 text-green-500 mr-1" />
                  <span>WhatsApp Reminder</span>
                </div>
                <span className="text-gray-500">March 22, 2:00 PM</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-2">AI Suggestions</h4>
            <div className="text-sm text-gray-600">
              Best time to send: Morning (9-11 AM)
              <br />
              Preferred channel: Email
              <br />
              Response probability: 85%
            </div>
          </div>
        </div>
      );

    case 'Smart Communication':
      return (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-purple-500 mr-2" />
                <span className="font-medium">Message Template</span>
              </div>
              <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                AI Enhanced
              </span>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                Hi {'{customer_name}'}, 
                <br />
                This is a friendly reminder about your {'{document_type}'}.
                <br />
                Would you be able to provide this by {'{due_date}'}?
              </div>
              <div className="flex items-center mt-2">
                <Brain className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-xs text-purple-600">
                  Tone: Professional & Friendly (90% match)
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-2">Sentiment Analysis</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Positivity</span>
                <span className="text-green-600">85%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Urgency</span>
                <span className="text-blue-600">Medium</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'AI Analytics Dashboard':
      return (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <BarChart2 className="h-5 w-5 text-orange-500 mr-2" />
                <span className="font-medium">Performance Metrics</span>
              </div>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { name: 'Mon', value: 65 },
                  { name: 'Tue', value: 75 },
                  { name: 'Wed', value: 85 },
                  { name: 'Thu', value: 80 },
                  { name: 'Fri', value: 90 }
                ]}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-2">AI Insights</h4>
            <div className="text-sm text-gray-600">
              Response rate trending up (+15%)
              <br />
              Customer engagement score: 85/100
              <br />
              Suggested action: Increase follow-up frequency
            </div>
          </div>
        </div>
      );
  }
}

export default WelcomeGuide;