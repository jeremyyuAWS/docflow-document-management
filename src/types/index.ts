export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  source: 'Hubspot' | 'Salesforce' | 'Zoho';
  company: string;
  role: string;
  last_contact: string;
  engagement_score: number;
  documents_pending: number;
  documents_completed: number;
  next_follow_up: string | null;
  ai_suggestions: {
    best_contact_time: string;
    engagement_tips: string;
    priority_level: 'High' | 'Medium' | 'Low';
  };
  communication_preferences?: {
    preferred_channel: 'email' | 'whatsapp';
    preferred_language: string;
    preferred_time: string;
    do_not_disturb: boolean;
  };
  interaction_history?: Array<{
    date: string;
    channel: 'email' | 'whatsapp';
    type: 'sent' | 'received';
    sentiment: number;
    response_time?: number;
  }>;
}

export interface CustomerDocument {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'received' | 'overdue';
  due_date: string;
  last_reminder: string;
  reminder_count?: number;
  ai_urgency_score: number;
  ai_analysis?: {
    sentiment_score: number;
    category_confidence: number;
    predicted_completion_date: string;
    risk_level: 'Low' | 'Medium' | 'High';
    key_insights: string[];
    suggested_actions: string[];
  };
  follow_up_history?: Array<{
    date: string;
    channel: 'email' | 'whatsapp';
    template_used: string;
    was_successful: boolean;
    response_time?: number;
  }>;
}

export interface EngagementData {
  hour: number;
  rate: number;
}

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  aiScore: number;
  tone?: 'formal' | 'casual' | 'urgent';
  channel?: 'email' | 'whatsapp';
  sentiment?: 'positive' | 'neutral' | 'negative';
  variables?: string[];
  performance_metrics?: {
    response_rate: number;
    average_response_time: number;
    positive_sentiment_rate: number;
  };
}

export interface DocumentAnalysis {
  id: string;
  document_id: string;
  content_summary: string;
  sentiment_score: number;
  priority_score: number;
  completion_prediction: string;
  risk_factors: string[];
  next_actions: string[];
  created_at: string;
  engagement_metrics: {
    response_rate: number;
    average_processing_time: number;
    completion_probability: number;
    interaction_quality: number;
  };
  optimal_followup_time: {
    predicted_time: string;
    confidence: number;
    factors: string[];
  };
  category_confidence: {
    confidence_score: number;
    matching_patterns: number;
    similar_documents: number;
  };
  processing_efficiency: {
    processing_time: number;
    automation_potential: number;
    error_rate: number;
    optimization_suggestions: string[];
  };
}

export interface SmartFollowUp {
  id: string;
  customer_id: string;
  document_id: string;
  scheduled_time: string;
  channel: 'email' | 'whatsapp';
  template_id: string;
  status: 'pending' | 'sent' | 'failed';
  ai_confidence: number;
  personalization_context: {
    customer_sentiment: number;
    engagement_level: number;
    optimal_time_confidence: number;
    channel_effectiveness: {
      email: number;
      whatsapp: number;
    };
  };
}