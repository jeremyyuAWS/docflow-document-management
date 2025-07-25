import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'document' | 'interaction' | 'followup';
  title: string;
  status: 'pending' | 'completed' | 'overdue';
  description: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

function TimelineView({ events }: TimelineProps) {
  const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'document': return <Calendar className="h-5 w-5" />;
      case 'interaction': return <Clock className="h-5 w-5" />;
      case 'followup': return <AlertCircle className="h-5 w-5" />;
      default: return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getEventColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Activity Timeline</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Timeline events */}
        <div className="space-y-8">
          {sortedEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-12"
            >
              {/* Event dot */}
              <div className={`absolute left-0 p-2 rounded-full ${getEventColor(event.status)}`}>
                {getEventIcon(event.type)}
              </div>

              {/* Event content */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{event.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventColor(event.status)}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                <p className="text-sm text-gray-500">
                  {format(event.date, 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TimelineView;