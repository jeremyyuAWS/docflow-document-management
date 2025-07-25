import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, RefreshCw, PlayCircle, AlertCircle, Send, MessageSquare } from 'lucide-react';
import { templateOptimizer } from '../lib/templateOptimization';
import type { MessageTemplate } from '../types';

interface FormData {
  name: string;
  content: string;
  tone: 'formal' | 'casual' | 'urgent';
  channel: 'email' | 'whatsapp';
  useCase: 'reminder' | 'followup' | 'urgent' | 'final';
}

function SmartTemplateBuilder() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    content: '',
    tone: 'formal',
    channel: 'email',
    useCase: 'reminder'
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  const [abTestActive, setAbTestActive] = useState(false);

  const optimizeTemplate = async () => {
    setIsOptimizing(true);
    try {
      const results = await templateOptimizer.optimizeTemplate(
        {
          id: crypto.randomUUID(),
          name: formData.name,
          content: formData.content,
          tone: formData.tone,
          channel: formData.channel,
          useCase: formData.useCase,
          sentiment: 'neutral'
        },
        {
          minResponseRate: 0.6,
          maxResponseTime: 24,
          minPositiveSentiment: 0.7
        }
      );
      
      setOptimizationResults(results);
      if (results.optimization_suggestions?.length > 0) {
        setFormData(prev => ({
          ...prev,
          content: results.content
        }));
      }
    } catch (error) {
      console.error('Error optimizing template:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const startABTest = async () => {
    try {
      const variations = [
        {
          content: formData.content.replace(
            /(deadline|due date)/gi,
            'target date'
          ),
          tone: 'casual'
        },
        {
          content: `I hope this finds you well. ${formData.content}`,
          tone: 'formal'
        }
      ];

      const testVariants = await templateOptimizer.createABTest(
        {
          id: crypto.randomUUID(),
          name: formData.name,
          content: formData.content,
          tone: formData.tone,
          channel: formData.channel,
          useCase: formData.useCase,
          sentiment: 'neutral'
        },
        variations
      );

      setAbTestActive(true);
    } catch (error) {
      console.error('Error starting A/B test:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Message Template Builder</h2>
        <div className="flex items-center">
          <Brain className="h-5 w-5 text-purple-600 mr-2" />
          <span className="text-sm text-gray-600">AI-Powered Templates</span>
        </div>
      </div>

      <form className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Template Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full rounded-lg"
            placeholder="e.g., Friendly Reminder"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Message Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={4}
            className="w-full rounded-lg"
            placeholder="Enter your message template here. Use {customer_name}, {document_name}, etc. for variables."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
              Tone
            </label>
            <select
              id="tone"
              name="tone"
              value={formData.tone}
              onChange={handleInputChange}
              className="w-full rounded-lg"
            >
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label htmlFor="channel" className="block text-sm font-medium text-gray-700 mb-2">
              Channel
            </label>
            <select
              id="channel"
              name="channel"
              value={formData.channel}
              onChange={handleInputChange}
              className="w-full rounded-lg"
            >
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="useCase" className="block text-sm font-medium text-gray-700 mb-2">
            Use Case
          </label>
          <select
            id="useCase"
            name="useCase"
            value={formData.useCase}
            onChange={handleInputChange}
            className="w-full rounded-lg"
          >
            <option value="reminder">General Reminder</option>
            <option value="followup">Follow-up</option>
            <option value="urgent">Urgent Notice</option>
            <option value="final">Final Notice</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={optimizeTemplate}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            disabled={isOptimizing}
          >
            {isOptimizing ? (
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Brain className="h-5 w-5 mr-2" />
            )}
            Optimize Template
          </button>
          <button
            type="button"
            onClick={startABTest}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={abTestActive}
          >
            <PlayCircle className="h-5 w-5 mr-2" />
            Start A/B Test
          </button>
        </div>

        {optimizationResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100"
          >
            <h4 className="text-sm font-medium text-purple-900 mb-2">
              Optimization Results
            </h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-sm text-purple-800 font-medium mr-2">
                  Sentiment Score:
                </span>
                <span className="text-sm text-purple-600">
                  {(optimizationResults.sentiment_analysis.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-purple-800 font-medium mr-2">
                  Empathy Level:
                </span>
                <span className="text-sm text-purple-600">
                  {(optimizationResults.sentiment_analysis.language_tone.empathy * 100).toFixed(1)}%
                </span>
              </div>
              {optimizationResults.optimization_suggestions?.length > 0 && (
                <div>
                  <span className="text-sm text-purple-800 font-medium">Suggestions:</span>
                  <ul className="mt-1 space-y-1">
                    {optimizationResults.optimization_suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="text-sm text-purple-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
}

export default SmartTemplateBuilder;