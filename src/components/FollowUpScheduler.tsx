import React, { useState } from 'react';
import { Calendar, Send, MessageSquare, Zap, BarChart2, RefreshCw } from 'lucide-react';
import { format, addDays, isWeekend, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
import type { EngagementData, MessageTemplate } from '../types';

const messageTemplates: MessageTemplate[] = [
  {
    id: '1',
    title: 'Friendly Reminder',
    content: "Hi {customer_name}, I hope you are doing well! This is a gentle reminder about the {document_name}. Would you be able to provide this at your earliest convenience?",
    aiScore: 85,
  },
  {
    id: '2',
    title: 'Urgent Follow-up',
    content: "Hi {customer_name}, I noticed that the {document_name} is still pending. This is time-sensitive - could you please submit it by {due_date}?",
    aiScore: 75,
  },
  {
    id: '3',
    title: 'Final Notice',
    content: "Hi {customer_name}, This is a final reminder regarding the {document_name}. Please note that we need this document by {due_date} to proceed further.",
    aiScore: 65,
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900">
          {typeof label === 'number' ? `${label}:00` : label}
        </p>
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

function FollowUpScheduler() {
  const [channel, setChannel] = useState('email');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState({
    bestTime: '10:00',
    confidence: 85,
    reasoning: 'Based on historical data, this customer shows highest engagement during morning hours.',
  });

  const responseRateData = [
    { day: 'Monday', rate: 75, engagement: 82 },
    { day: 'Tuesday', rate: 82, engagement: 78 },
    { day: 'Wednesday', rate: 68, engagement: 85 },
    { day: 'Thursday', rate: 79, engagement: 72 },
    { day: 'Friday', rate: 65, engagement: 68 },
    { day: 'Saturday', rate: 45, engagement: 42 },
    { day: 'Sunday', rate: 40, engagement: 38 },
  ];

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    responseRate: Math.sin(i / 4) * 20 + 70 + Math.random() * 10,
    engagement: Math.cos(i / 4) * 15 + 65 + Math.random() * 10,
  }));

  const getNextBestDate = () => {
    let date = new Date();
    date = addDays(date, 1);
    while (isWeekend(date)) {
      date = addDays(date, 1);
    }
    return format(date, 'yyyy-MM-dd');
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const isWeekend = isWeekend(parseISO(date));
    if (isWeekend) {
      setAiSuggestions(prev => ({
        ...prev,
        confidence: 40,
        reasoning: 'Weekend dates typically show lower engagement rates.',
      }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100">
      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Schedule Follow-up</h2>
          <div className="flex items-center">
            <Zap className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-sm text-gray-600">AI-Powered Scheduling</span>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Analytics Dashboard */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-gray-600" />
                Engagement Analytics
              </h3>
              <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Weekly Response Pattern</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={responseRateData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        label={{ 
                          value: 'Day of Week',
                          position: 'insideBottom',
                          offset: -10
                        }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        domain={[0, 100]}
                        label={{ 
                          value: 'Response Rate (%)', 
                          angle: -90, 
                          position: 'insideLeft',
                          offset: 10
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" height={36} />
                      <Bar 
                        dataKey="rate" 
                        name="Response Rate"
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="engagement" 
                        name="Engagement"
                        fill="#10b981" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">24-Hour Response Pattern</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="hour"
                        tick={{ fontSize: 12 }}
                        domain={[0, 23]}
                        label={{ 
                          value: 'Hour of Day (24h)', 
                          position: 'insideBottom',
                          offset: -10
                        }}
                        tickFormatter={(value) => `${value}:00`}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        domain={[0, 100]}
                        label={{ 
                          value: 'Response Rate (%)', 
                          angle: -90, 
                          position: 'insideLeft',
                          offset: 10
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" height={36} />
                      <Line 
                        type="monotone" 
                        dataKey="responseRate" 
                        name="Response Rate"
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="engagement" 
                        name="Engagement"
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* AI Suggestions Panel */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-blue-900">AI Recommendation</h3>
              </div>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {aiSuggestions.confidence}% Confidence
              </span>
            </div>
            <p className="text-sm text-blue-700 mb-2">{aiSuggestions.reasoning}</p>
            <button
              onClick={() => {
                setSelectedTime(aiSuggestions.bestTime);
                setSelectedDate(getNextBestDate());
              }}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply AI Suggestion
            </button>
          </div>

          {/* Channel Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Communication Channel
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setChannel('email')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  channel === 'email'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Send className="h-5 w-5 mr-2" />
                Email
              </button>
              <button
                onClick={() => setChannel('whatsapp')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  channel === 'whatsapp'
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

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Follow-up Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  name="time"
                  id="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Message Templates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              AI-Suggested Templates
            </label>
            <div className="space-y-3">
              {messageTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setMessage(template.content);
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{template.title}</h4>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {template.aiScore}% Match
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{template.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Customize Message
            </label>
            <div className="mt-1">
              <textarea
                id="message"
                name="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full"
                placeholder="Hi {customer_name}, this is a reminder about your pending documents..."
              ></textarea>
            </div>
          </div>

          {/* Schedule Button */}
          <button
            type="button"
            className="w-full btn-primary flex items-center justify-center"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Schedule Follow-up
          </button>
        </div>
      </div>
    </div>
  );
}

export default FollowUpScheduler;