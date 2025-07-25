import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Mail, 
  Calendar, 
  Brain, 
  Send, 
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import type { Customer, CustomerDocument } from '../types';
import { smartMessaging } from '../lib/smartMessaging';
import { sentimentAnalyzer } from '../lib/sentimentAnalysis';
import type { MessageTone } from '../lib/sentimentAnalysis';
import { communicationCoordinator } from '../lib/communicationCoordinator';

interface SmartOutreachProps {
  customer: Customer;
  documents: CustomerDocument[];
  onClose?: () => void;
  onSend?: (message: any) => void;
}

function SmartOutreach({ customer, documents, onClose, onSend }: SmartOutreachProps) {
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'whatsapp'>('email');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [messageTone, setMessageTone] = useState<MessageTone | null>(null);
  const [customerSentiment, setCustomerSentiment] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    analyzeCustomer();
  }, [customer, documents]);

  useEffect(() => {
    if (customMessage) {
      const tone = sentimentAnalyzer.analyzeMessage(customMessage);
      setMessageTone(tone);
    }
  }, [customMessage]);

  const analyzeCustomer = async () => {
    setIsAnalyzing(true);
    try {
      // Analyze customer sentiment from interaction history
      const sentimentScores = customer.interaction_history?.map(interaction => interaction.sentiment) || [];
      const averageSentiment = sentimentScores.length > 0
        ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
        : 0;
      setCustomerSentiment(averageSentiment);

      const context = {
        previousInteractions: customer.interaction_history || [],
        documentHistory: documents.map(doc => ({
          date: new Date(doc.due_date),
          action: 'reminder',
          status: doc.status
        })),
        customerPreferences: {
          preferredChannel: customer.preferred_contact_method || 'email',
          preferredLanguage: 'en',
          responseRate: customer.engagement_score / 100,
          typicalResponseTime: 24
        }
      };

      const suggestions = await smartMessaging.generateSmartMessage(
        customer,
        documents[0],
        context
      );

      setAiSuggestions(suggestions);
      setSelectedChannel(suggestions.channel);
      setScheduledTime(format(new Date(suggestions.scheduled_time), "yyyy-MM-dd'T'HH:mm"));

      // Adapt initial message based on customer sentiment
      if (suggestions.template_id) {
        const adaptedMessage = sentimentAnalyzer.adaptMessage(
          customMessage || selectedTemplate?.content,
          averageSentiment
        );
        setCustomMessage(adaptedMessage);
      }
    } catch (error) {
      console.error('Error analyzing customer:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMessageChange = (text: string) => {
    setCustomMessage(text);
    const tone = sentimentAnalyzer.analyzeMessage(text);
    setMessageTone(tone);
  };

  const optimizeMessage = async () => {
    if (!customMessage) return;
    
    setIsOptimizing(true);
    try {
      const optimizedMessage = sentimentAnalyzer.adaptMessage(customMessage, customerSentiment);
      setCustomMessage(optimizedMessage);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSend = async () => {
    if (!customMessage && !selectedTemplate) return;

    try {
      const response = await communicationCoordinator.initiateFlow(
        customer,
        documents[0],
        'default'
      );

      if (response.success) {
        toast.success('Message sent successfully!');
      } else {
        toast.error('Failed to send message. Retrying through alternative channel.');
      }

      if (onSend) {
        onSend({
          channel: selectedChannel,
          message: customMessage || selectedTemplate?.content,
          scheduledTime,
          customer,
          documents,
          aiConfidence: aiSuggestions?.ai_confidence,
          sentiment: messageTone,
          response
        });
      }
      
      if (onClose) onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-purple-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Smart Outreach</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isAnalyzing ? (
        <div className="text-center py-8">
          <Brain className="h-8 w-8 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Analyzing customer data and generating suggestions...</p>
        </div>
      ) : (
        <>
          {/* Customer Sentiment Indicator */}
          <div className="mb-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
                <h4 className="font-medium text-purple-900">Customer Sentiment Analysis</h4>
              </div>
              <span className={`text-sm px-2 py-1 rounded ${
                customerSentiment > 0.3 ? 'bg-green-100 text-green-800' :
                customerSentiment < -0.3 ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {customerSentiment > 0.3 ? 'Positive' :
                 customerSentiment < -0.3 ? 'Negative' :
                 'Neutral'} Sentiment
              </span>
            </div>
            <p className="text-sm text-purple-800 mb-2">
              {sentimentAnalyzer.suggestNextAction(customerSentiment)}
            </p>
          </div>

          {/* Channel Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Communication Channel
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedChannel('email')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  selectedChannel === 'email'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Mail className="h-5 w-5 mr-2" />
                Email
              </button>
              <button
                onClick={() => setSelectedChannel('whatsapp')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  selectedChannel === 'whatsapp'
                    ? 'bg-[#25D366] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
            </div>
          </div>

          {/* Message Composition with Real-time Tone Analysis */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <div className="relative">
              <textarea
                value={customMessage}
                onChange={(e) => handleMessageChange(e.target.value)}
                rows={4}
                className="w-full rounded-lg"
                placeholder="Enter your message..."
              />
              {messageTone && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Message Tone Analysis</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      messageTone.tone === 'positive' ? 'bg-green-100 text-green-800' :
                      messageTone.tone === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {messageTone.tone.charAt(0).toUpperCase() + messageTone.tone.slice(1)}
                    </span>
                  </div>
                  {messageTone.suggestions.phrases.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">{messageTone.suggestions.tone}</p>
                      <div className="flex flex-wrap gap-2">
                        {messageTone.suggestions.phrases.map((phrase, index) => (
                          <button
                            key={index}
                            onClick={() => setCustomMessage(prev => prev + ' ' + phrase)}
                            className="text-xs bg-white px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            {phrase}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={optimizeMessage}
                      disabled={isOptimizing}
                      className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      {isOptimizing ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Brain className="h-4 w-4 mr-1" />
                      )}
                      Optimize Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scheduling */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule
            </label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full rounded-lg"
              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
            />
          </div>

          {/* Advanced Options */}
          <div className="mb-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              {showAdvanced ? (
                <ChevronUp className="h-5 w-5 mr-1" />
              ) : (
                <ChevronDown className="h-5 w-5 mr-1" />
              )}
              Advanced Options
            </button>
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Follow-up Preferences
                    </label>
                    <select className="w-full rounded-lg">
                      <option value="auto">Automatic follow-up</option>
                      <option value="manual">Manual follow-up</option>
                      <option value="none">No follow-up</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency Level
                    </label>
                    <select className="w-full rounded-lg">
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center"
            >
              <Send className="h-5 w-5 mr-2" />
              Send Message
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default SmartOutreach;