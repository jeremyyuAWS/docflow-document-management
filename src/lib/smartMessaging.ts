import { z } from 'zod';
import type { Customer, CustomerDocument, SmartFollowUp } from '../types';

// Schema for message template variables
const templateVariablesSchema = z.object({
  customer_name: z.string(),
  document_name: z.string(),
  due_date: z.string(),
  company: z.string().optional(),
  custom_fields: z.record(z.string()).optional(),
});

type TemplateVariables = z.infer<typeof templateVariablesSchema>;

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  tone: 'formal' | 'casual' | 'urgent';
  channel: 'email' | 'whatsapp';
  useCase: 'reminder' | 'followup' | 'urgent' | 'final';
  variables: string[];
  sentiment: 'neutral' | 'positive' | 'negative';
  performance_metrics?: {
    response_rate: number;
    average_response_time: number;
    positive_sentiment_rate: number;
  };
}

interface MessagePersonalizationContext {
  previousInteractions: Array<{
    date: Date;
    channel: string;
    sentiment: number;
    wasReplied: boolean;
    responseTime?: number;
    messageTemplate?: string;
  }>;
  documentHistory: Array<{
    date: Date;
    action: string;
    status: string;
  }>;
  customerPreferences: {
    preferredChannel: string;
    preferredLanguage: string;
    responseRate: number;
    typicalResponseTime: number;
    doNotDisturbTimes?: {
      start: string;
      end: string;
      timezone: string;
    };
  };
  aiInsights?: {
    bestTimeToSend: string;
    recommendedTone: 'formal' | 'casual' | 'urgent';
    languagePreference: string;
    engagementPrediction: number;
  };
}

export class SmartMessagingEngine {
  private templates: MessageTemplate[] = [
    {
      id: 'friendly-reminder',
      name: 'Friendly Reminder',
      content: "Hi {customer_name}, I hope you're doing well! This is a gentle reminder about the {document_name}. Would you be able to provide this at your earliest convenience?",
      tone: 'casual',
      channel: 'email',
      useCase: 'reminder',
      variables: ['customer_name', 'document_name'],
      sentiment: 'positive',
      performance_metrics: {
        response_rate: 75,
        average_response_time: 8,
        positive_sentiment_rate: 85
      }
    },
    {
      id: 'urgent-followup',
      name: 'Urgent Follow-up',
      content: "Hi {customer_name}, I noticed that the {document_name} is still pending. This is time-sensitive - could you please submit it by {due_date}?",
      tone: 'urgent',
      channel: 'whatsapp',
      useCase: 'urgent',
      variables: ['customer_name', 'document_name', 'due_date'],
      sentiment: 'neutral',
      performance_metrics: {
        response_rate: 90,
        average_response_time: 4,
        positive_sentiment_rate: 65
      }
    },
    {
      id: 'final-notice',
      name: 'Final Notice',
      content: "Dear {customer_name}, This is a final reminder regarding the {document_name}. Please note that we need this document by {due_date} to proceed further.",
      tone: 'formal',
      channel: 'email',
      useCase: 'final',
      variables: ['customer_name', 'document_name', 'due_date'],
      sentiment: 'negative',
      performance_metrics: {
        response_rate: 95,
        average_response_time: 2,
        positive_sentiment_rate: 45
      }
    }
  ];

  async generateSmartMessage(
    customer: Customer,
    document: CustomerDocument,
    context: MessagePersonalizationContext
  ): Promise<SmartFollowUp> {
    const template = await this.selectBestTemplate(customer, document, context);
    const variables = this.prepareTemplateVariables(customer, document);
    const message = this.personalizeMessage(template, variables, context);
    const optimizedMessage = await this.optimizeMessageWithAI(message, context);
    const scheduledTime = await this.predictOptimalSendTime(customer, context);

    return {
      id: crypto.randomUUID(),
      customer_id: customer.id,
      document_id: document.id,
      scheduled_time: scheduledTime.toISOString(),
      channel: template.channel,
      template_id: template.id,
      status: 'pending',
      ai_confidence: this.calculateAIConfidence(context),
      personalization_context: {
        customer_sentiment: this.calculateCustomerSentiment(context),
        engagement_level: this.calculateEngagementLevel(context),
        optimal_time_confidence: this.calculateTimeConfidence(scheduledTime, context),
        channel_effectiveness: this.analyzeChannelEffectiveness(context)
      }
    };
  }

  private async selectBestTemplate(
    customer: Customer,
    document: CustomerDocument,
    context: MessagePersonalizationContext
  ): Promise<MessageTemplate> {
    const urgencyScore = this.calculateUrgencyScore(document);
    const customerEngagement = this.calculateEngagementLevel(context);
    const previousResponses = context.previousInteractions.slice(-3);
    
    // Calculate template scores based on multiple factors
    const templateScores = this.templates.map(template => {
      let score = 0;
      
      // Match tone with urgency
      if (urgencyScore > 80 && template.tone === 'urgent') score += 30;
      else if (urgencyScore > 50 && template.tone === 'formal') score += 20;
      else if (urgencyScore <= 50 && template.tone === 'casual') score += 20;
      
      // Consider previous template performance
      const templateUsage = previousResponses.filter(r => r.messageTemplate === template.id);
      if (templateUsage.length > 0) {
        const successRate = templateUsage.filter(r => r.wasReplied).length / templateUsage.length;
        score += successRate * 25;
      }
      
      // Channel preference matching
      if (template.channel === context.customerPreferences.preferredChannel) {
        score += 20;
      }
      
      // Performance metrics impact
      if (template.performance_metrics) {
        score += (template.performance_metrics.response_rate / 100) * 15;
        score += (template.performance_metrics.positive_sentiment_rate / 100) * 10;
      }
      
      return { template, score };
    });
    
    // Select the template with the highest score
    const bestTemplate = templateScores.reduce((prev, current) => 
      current.score > prev.score ? current : prev
    );
    
    return bestTemplate.template;
  }

  private prepareTemplateVariables(
    customer: Customer,
    document: CustomerDocument
  ): TemplateVariables {
    return {
      customer_name: customer.full_name,
      document_name: document.name,
      due_date: document.due_date,
      company: customer.company,
      custom_fields: {}
    };
  }

  private personalizeMessage(
    template: MessageTemplate,
    variables: TemplateVariables,
    context: MessagePersonalizationContext
  ): string {
    let message = template.content;

    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      if (value) {
        const regex = new RegExp(`{${key}}`, 'g');
        message = message.replace(regex, value);
      }
    });

    return message;
  }

  private async optimizeMessageWithAI(
    message: string,
    context: MessagePersonalizationContext
  ): Promise<string> {
    const customerSentiment = this.calculateCustomerSentiment(context);
    const engagementLevel = this.calculateEngagementLevel(context);

    if (customerSentiment < 0.3) {
      message = await this.addEmpathy(message);
    }

    if (engagementLevel < 0.5) {
      message = await this.increaseUrgency(message);
    }

    if (context.customerPreferences.preferredLanguage !== 'en') {
      message = await this.translateMessage(message, context.customerPreferences.preferredLanguage);
    }

    return message;
  }

  private async predictOptimalSendTime(
    customer: Customer,
    context: MessagePersonalizationContext
  ): Promise<Date> {
    const now = new Date();
    const customerTimezone = context.customerPreferences.doNotDisturbTimes?.timezone || 'UTC';
    const recentInteractions = context.previousInteractions
      .filter(i => i.wasReplied)
      .slice(-5);

    // Calculate average response time per hour
    const hourlyResponseRates = new Map<number, number>();
    recentInteractions.forEach(interaction => {
      const hour = new Date(interaction.date).getHours();
      const currentRate = hourlyResponseRates.get(hour) || 0;
      hourlyResponseRates.set(hour, currentRate + 1);
    });

    // Find best hour
    let bestHour = 9; // Default to 9 AM
    let bestResponseRate = 0;
    hourlyResponseRates.forEach((rate, hour) => {
      if (rate > bestResponseRate) {
        bestHour = hour;
        bestResponseRate = rate;
      }
    });

    // Adjust for do-not-disturb times
    if (context.customerPreferences.doNotDisturbTimes) {
      const { start, end } = context.customerPreferences.doNotDisturbTimes;
      const dndStart = parseInt(start.split(':')[0]);
      const dndEnd = parseInt(end.split(':')[0]);

      if (bestHour >= dndStart && bestHour <= dndEnd) {
        bestHour = dndEnd + 1;
      }
    }

    // Set the predicted time
    const predictedTime = new Date();
    predictedTime.setHours(bestHour, 0, 0, 0);

    // If the predicted time is in the past, move to next day
    if (predictedTime < now) {
      predictedTime.setDate(predictedTime.getDate() + 1);
    }

    return predictedTime;
  }

  private calculateUrgencyScore(document: CustomerDocument): number {
    const dueDate = new Date(document.due_date);
    const now = new Date();
    const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let urgencyScore = 0;
    
    // Due date proximity
    if (daysUntilDue < 0) urgencyScore += 100;
    else if (daysUntilDue < 2) urgencyScore += 80;
    else if (daysUntilDue < 5) urgencyScore += 60;
    else if (daysUntilDue < 10) urgencyScore += 40;
    else urgencyScore += 20;
    
    // Document type importance
    if (document.type === 'Legal') urgencyScore += 20;
    if (document.type === 'Financial') urgencyScore += 15;
    
    // Previous reminders impact
    if (document.reminder_count) {
      urgencyScore += Math.min(20, document.reminder_count * 5);
    }
    
    return Math.min(100, urgencyScore);
  }

  private async addEmpathy(message: string): Promise<string> {
    const empathyPhrases = [
      "I understand this might be a busy time for you. ",
      "We're here to help make this process easier. ",
      "I appreciate your attention to this matter. "
    ];
    return empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)] + message;
  }

  private async increaseUrgency(message: string): Promise<string> {
    const urgencyPhrases = [
      "This requires your immediate attention. ",
      "This is a time-sensitive matter. ",
      "Your quick response would be greatly appreciated. "
    ];
    return urgencyPhrases[Math.floor(Math.random() * urgencyPhrases.length)] + message;
  }

  private async translateMessage(message: string, targetLanguage: string): Promise<string> {
    // Simulate translation
    // In production, this would call a translation API
    return message;
  }

  private calculateAIConfidence(context: MessagePersonalizationContext): number {
    const baseConfidence = 70;
    let confidenceScore = baseConfidence;

    // Adjust based on historical data quality
    if (context.previousInteractions.length > 5) confidenceScore += 10;
    if (context.customerPreferences.responseRate > 0.7) confidenceScore += 10;
    if (context.aiInsights?.engagementPrediction > 0.8) confidenceScore += 10;

    return Math.min(100, confidenceScore);
  }

  private calculateCustomerSentiment(context: MessagePersonalizationContext): number {
    const recentInteractions = context.previousInteractions.slice(-5);
    return recentInteractions.reduce((acc, curr) => acc + curr.sentiment, 0) / recentInteractions.length;
  }

  private calculateEngagementLevel(context: MessagePersonalizationContext): number {
    const recentInteractions = context.previousInteractions.slice(-5);
    const responseRate = recentInteractions.filter(i => i.wasReplied).length / recentInteractions.length;
    const averageSentiment = this.calculateCustomerSentiment(context);
    
    return (responseRate * 0.6 + averageSentiment * 0.4);
  }

  private calculateTimeConfidence(
    predictedTime: Date,
    context: MessagePersonalizationContext
  ): number {
    let confidence = 70; // Base confidence

    // Adjust based on historical data
    if (context.previousInteractions.length > 10) confidence += 10;
    if (context.customerPreferences.responseRate > 0.8) confidence += 10;
    if (context.aiInsights?.bestTimeToSend) confidence += 10;

    return Math.min(100, confidence);
  }

  private analyzeChannelEffectiveness(context: MessagePersonalizationContext) {
    const emailInteractions = context.previousInteractions.filter(i => i.channel === 'email');
    const whatsappInteractions = context.previousInteractions.filter(i => i.channel === 'whatsapp');

    const calculateEffectiveness = (interactions: typeof emailInteractions) => {
      if (interactions.length === 0) return 50; // Default score
      
      const responseRate = interactions.filter(i => i.wasReplied).length / interactions.length;
      const averageResponseTime = interactions.reduce((acc, curr) => acc + (curr.responseTime || 24), 0) / interactions.length;
      
      // Score based on response rate (70% weight) and response time (30% weight)
      return (responseRate * 70) + (Math.min(1, 24 / averageResponseTime) * 30);
    };

    return {
      email: calculateEffectiveness(emailInteractions),
      whatsapp: calculateEffectiveness(whatsappInteractions)
    };
  }
}

export const smartMessaging = new SmartMessagingEngine();