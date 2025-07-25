import { Customer, CustomerDocument } from '../types';
import { smartMessaging } from './smartMessaging';
import { sentimentAnalyzer } from './sentimentAnalysis';
import { documentProcessor } from './documentProcessing';

interface ChannelConfig {
  type: 'email' | 'whatsapp' | 'phone' | 'sms' | 'portal';
  priority: number;
  waitTime: number;
  templates: string[];
  fallbackChannel?: string;
  thresholds: {
    urgency: number;
    sentiment: number;
    engagement: number;
  };
}

interface CommunicationFlow {
  channels: ChannelConfig[];
  maxAttempts: number;
  escalationRules: Array<{
    condition: (context: EscalationContext) => boolean;
    action: string;
    priority: number;
    cooldown?: number;
    requiredApproval?: boolean;
  }>;
  autoAdjustment: {
    enabled: boolean;
    factors: string[];
    learningRate: number;
  };
}

interface EscalationContext {
  customer: Customer;
  document: CustomerDocument;
  attempts: number;
  lastResponse?: {
    time: number;
    sentiment: number;
    channel: string;
  };
  urgencyScore: number;
  engagementScore: number;
  channelEffectiveness: Record<string, number>;
}

interface ResponseMetrics {
  channel: string;
  responseTime: number;
  sentiment: number;
  wasSuccessful: boolean;
  engagementScore: number;
  followUpRequired: boolean;
}

class CommunicationCoordinator {
  private flows: Map<string, CommunicationFlow> = new Map([
    ['default', {
      channels: [
        {
          type: 'email',
          priority: 1,
          waitTime: 48,
          templates: ['friendly_reminder', 'follow_up'],
          thresholds: {
            urgency: 0.5,
            sentiment: 0.3,
            engagement: 0.4
          }
        },
        {
          type: 'whatsapp',
          priority: 2,
          waitTime: 24,
          templates: ['urgent_reminder', 'quick_check'],
          fallbackChannel: 'sms',
          thresholds: {
            urgency: 0.7,
            sentiment: 0.2,
            engagement: 0.6
          }
        },
        {
          type: 'phone',
          priority: 3,
          waitTime: 12,
          templates: ['final_notice'],
          thresholds: {
            urgency: 0.9,
            sentiment: 0.1,
            engagement: 0.8
          }
        },
        {
          type: 'sms',
          priority: 2,
          waitTime: 24,
          templates: ['brief_reminder'],
          thresholds: {
            urgency: 0.6,
            sentiment: 0.3,
            engagement: 0.5
          }
        },
        {
          type: 'portal',
          priority: 1,
          waitTime: 72,
          templates: ['portal_notification'],
          thresholds: {
            urgency: 0.4,
            sentiment: 0.4,
            engagement: 0.3
          }
        }
      ],
      maxAttempts: 5,
      escalationRules: [
        {
          condition: (ctx) => ctx.attempts >= 2 && ctx.urgencyScore > 0.8,
          action: 'escalate_to_manager',
          priority: 1,
          requiredApproval: true
        },
        {
          condition: (ctx) => ctx.sentiment < -0.5 && ctx.attempts > 1,
          action: 'human_intervention',
          priority: 2,
          cooldown: 24
        },
        {
          condition: (ctx) => 
            ctx.document.due_date && 
            new Date(ctx.document.due_date).getTime() - Date.now() < 48 * 60 * 60 * 1000,
          action: 'urgent_escalation',
          priority: 3
        },
        {
          condition: (ctx) => 
            ctx.engagementScore < 0.3 && 
            ctx.attempts > 3,
          action: 'switch_channel',
          priority: 4
        },
        {
          condition: (ctx) => {
            const channelEffectiveness = Object.values(ctx.channelEffectiveness);
            return Math.max(...channelEffectiveness) < 0.4;
          },
          action: 'try_alternative_channel',
          priority: 5
        }
      ],
      autoAdjustment: {
        enabled: true,
        factors: ['response_time', 'sentiment', 'engagement'],
        learningRate: 0.1
      }
    }]
  ]);

  private responseHistory: Map<string, ResponseMetrics[]> = new Map();
  private channelEffectiveness: Map<string, Map<string, number>> = new Map();
  private escalationHistory: Map<string, Set<string>> = new Map();

  async initiateFlow(
    customer: Customer,
    document: CustomerDocument,
    flowType: string = 'default'
  ) {
    const flow = this.flows.get(flowType);
    if (!flow) throw new Error(`Flow type ${flowType} not found`);

    const customerHistory = this.getCustomerHistory(customer.id);
    const context = await this.buildEscalationContext(customer, document, customerHistory);
    const initialChannel = await this.selectOptimalChannel(context, flow);

    return this.executeChannelStrategy(customer, document, initialChannel, flow, context);
  }

  private async buildEscalationContext(
    customer: Customer,
    document: CustomerDocument,
    history: ResponseMetrics[]
  ): Promise<EscalationContext> {
    const attempts = history.length;
    const lastResponse = history[history.length - 1];
    const urgencyScore = await this.calculateUrgencyScore(document);
    const engagementScore = await this.calculateEngagementScore(customer, history);
    const channelEffectiveness = await this.getChannelEffectiveness(customer.id);

    return {
      customer,
      document,
      attempts,
      lastResponse,
      urgencyScore,
      engagementScore,
      channelEffectiveness
    };
  }

  private async selectOptimalChannel(
    context: EscalationContext,
    flow: CommunicationFlow
  ): Promise<ChannelConfig> {
    const scores = await Promise.all(
      flow.channels.map(async (channel) => {
        const baseScore = await this.calculateChannelScore(channel, context);
        const effectivenessBonus = context.channelEffectiveness[channel.type] || 0;
        return {
          channel,
          score: baseScore + effectivenessBonus
        };
      })
    );

    return scores.sort((a, b) => b.score - a.score)[0].channel;
  }

  private async calculateChannelScore(
    channel: ChannelConfig,
    context: EscalationContext
  ): Promise<number> {
    let score = 0;

    // Urgency alignment
    if (context.urgencyScore >= channel.thresholds.urgency) {
      score += 0.3;
    }

    // Sentiment consideration
    if (context.lastResponse && context.lastResponse.sentiment >= channel.thresholds.sentiment) {
      score += 0.2;
    }

    // Engagement alignment
    if (context.engagementScore >= channel.thresholds.engagement) {
      score += 0.2;
    }

    // Channel history effectiveness
    const channelHistory = await this.getChannelHistory(context.customer.id, channel.type);
    if (channelHistory && channelHistory.length > 0) {
      const successRate = channelHistory.filter(r => r.wasSuccessful).length / channelHistory.length;
      score += successRate * 0.3;
    }

    return score;
  }

  private async executeChannelStrategy(
    customer: Customer,
    document: CustomerDocument,
    channel: ChannelConfig,
    flow: CommunicationFlow,
    context: EscalationContext
  ) {
    // Check for active escalations
    const activeEscalations = this.escalationHistory.get(customer.id) || new Set();
    if (activeEscalations.size > 0) {
      return this.handleActiveEscalations(customer, document, activeEscalations);
    }

    // Check escalation rules
    const applicableRules = flow.escalationRules
      .filter(rule => rule.condition(context))
      .sort((a, b) => a.priority - b.priority);

    if (applicableRules.length > 0) {
      const rule = applicableRules[0];
      return this.handleEscalation(rule, customer, document, context);
    }

    // Generate and send message
    const message = await this.generateMessage(customer, document, channel, context);
    const response = await this.sendMessage(channel.type, message);

    // Track response and update effectiveness
    await this.trackResponse(customer.id, {
      channel: channel.type,
      responseTime: response.time,
      sentiment: response.sentiment,
      wasSuccessful: response.success,
      engagementScore: context.engagementScore,
      followUpRequired: !response.success
    });

    // Update channel effectiveness
    await this.updateChannelEffectiveness(
      customer.id,
      channel.type,
      response.success ? 0.1 : -0.1
    );

    // Schedule follow-up if needed
    if (!response.success) {
      await this.scheduleFollowUp(customer, document, flow, channel, context);
    }

    // Auto-adjust flow if enabled
    if (flow.autoAdjustment.enabled) {
      await this.adjustFlow(flow, context, response);
    }

    return response;
  }

  private async handleEscalation(
    rule: CommunicationFlow['escalationRules'][0],
    customer: Customer,
    document: CustomerDocument,
    context: EscalationContext
  ) {
    const escalationId = `${rule.action}_${Date.now()}`;
    const customerEscalations = this.escalationHistory.get(customer.id) || new Set();
    customerEscalations.add(escalationId);
    this.escalationHistory.set(customer.id, customerEscalations);

    // Implement specific escalation actions
    switch (rule.action) {
      case 'escalate_to_manager':
        return this.handleManagerEscalation(customer, document, context);
      case 'human_intervention':
        return this.handleHumanIntervention(customer, document, context);
      case 'urgent_escalation':
        return this.handleUrgentEscalation(customer, document, context);
      case 'switch_channel':
        return this.handleChannelSwitch(customer, document, context);
      default:
        return this.handleDefaultEscalation(customer, document, context);
    }
  }

  private async generateMessage(
    customer: Customer,
    document: CustomerDocument,
    channel: ChannelConfig,
    context: EscalationContext
  ) {
    const messageContext = {
      previousInteractions: await this.getInteractionHistory(customer.id),
      customerPreferences: {
        preferredChannel: channel.type,
        preferredLanguage: customer.language || 'en',
        responseRate: await this.calculateResponseRate(customer.id),
        typicalResponseTime: await this.calculateAverageResponseTime(customer.id)
      },
      escalationContext: context,
      documentContext: await documentProcessor.analyze(document)
    };

    return smartMessaging.generateSmartMessage(customer, document, messageContext);
  }

  private async scheduleFollowUp(
    customer: Customer,
    document: CustomerDocument,
    flow: CommunicationFlow,
    currentChannel: ChannelConfig,
    context: EscalationContext
  ) {
    const nextChannel = await this.determineNextChannel(flow, currentChannel, context);
    const waitTime = this.calculateWaitTime(currentChannel, customer, context);

    return {
      scheduledTime: new Date(Date.now() + waitTime * 60 * 60 * 1000),
      channel: nextChannel,
      message: await this.generateMessage(customer, document, nextChannel, context)
    };
  }

  private async determineNextChannel(
    flow: CommunicationFlow,
    currentChannel: ChannelConfig,
    context: EscalationContext
  ): Promise<ChannelConfig> {
    if (currentChannel.fallbackChannel) {
      const fallbackConfig = flow.channels.find(c => c.type === currentChannel.fallbackChannel);
      if (fallbackConfig) return fallbackConfig;
    }

    const nextChannelIndex = flow.channels.findIndex(c => c.type === currentChannel.type) + 1;
    return flow.channels[nextChannelIndex] || flow.channels[0];
  }

  private calculateWaitTime(
    channel: ChannelConfig,
    customer: Customer,
    context: EscalationContext
  ): number {
    const baseWaitTime = channel.waitTime;
    const urgencyFactor = Math.max(0, 1 - context.urgencyScore);
    const engagementFactor = Math.max(0.5, context.engagementScore);
    
    return Math.max(
      baseWaitTime * urgencyFactor * engagementFactor,
      baseWaitTime * 0.25
    );
  }

  private async getInteractionHistory(customerId: string) {
    return this.responseHistory.get(customerId) || [];
  }

  private async trackResponse(customerId: string, metrics: ResponseMetrics) {
    const history = this.responseHistory.get(customerId) || [];
    history.push(metrics);
    this.responseHistory.set(customerId, history);
  }

  private getCustomerHistory(customerId: string): ResponseMetrics[] {
    return this.responseHistory.get(customerId) || [];
  }

  private async getChannelHistory(
    customerId: string,
    channelType: string
  ): Promise<ResponseMetrics[]> {
    const history = await this.getInteractionHistory(customerId);
    return history.filter(m => m.channel === channelType);
  }

  private async getChannelEffectiveness(customerId: string): Promise<Record<string, number>> {
    const effectiveness = this.channelEffectiveness.get(customerId) || new Map();
    return Object.fromEntries(effectiveness);
  }

  private async updateChannelEffectiveness(
    customerId: string,
    channelType: string,
    adjustment: number
  ) {
    const customerEffectiveness = this.channelEffectiveness.get(customerId) || new Map();
    const currentEffectiveness = customerEffectiveness.get(channelType) || 0.5;
    customerEffectiveness.set(
      channelType,
      Math.max(0, Math.min(1, currentEffectiveness + adjustment))
    );
    this.channelEffectiveness.set(customerId, customerEffectiveness);
  }

  private async calculateResponseRate(customerId: string): Promise<number> {
    const history = await this.getInteractionHistory(customerId);
    if (history.length === 0) return 0.5;

    return history.filter(h => h.wasSuccessful).length / history.length;
  }

  private async calculateAverageResponseTime(customerId: string): Promise<number> {
    const history = await this.getInteractionHistory(customerId);
    if (history.length === 0) return 24;

    const totalTime = history.reduce((sum, h) => sum + h.responseTime, 0);
    return totalTime / history.length;
  }

  private async calculateUrgencyScore(document: CustomerDocument): Promise<number> {
    // Implement urgency calculation based on document properties
    return 0.5;
  }

  private async calculateEngagementScore(
    customer: Customer,
    history: ResponseMetrics[]
  ): Promise<number> {
    if (history.length === 0) return 0.5;

    const recentHistory = history.slice(-5);
    const engagementScore = recentHistory.reduce(
      (score, metrics) => score + metrics.engagementScore,
      0
    ) / recentHistory.length;

    return engagementScore;
  }

  private async adjustFlow(
    flow: CommunicationFlow,
    context: EscalationContext,
    response: any
  ) {
    // Implement flow adjustment logic
    return flow;
  }

  private async handleActiveEscalations(
    customer: Customer,
    document: CustomerDocument,
    activeEscalations: Set<string>
  ) {
    // Implement active escalations handling
    return {
      status: 'escalated',
      activeEscalations: Array.from(activeEscalations)
    };
  }

  private async handleManagerEscalation(
    customer: Customer,
    document: CustomerDocument,
    context: EscalationContext
  ) {
    // Implement manager escalation
    return {
      status: 'escalated_to_manager',
      context
    };
  }

  private async handleHumanIntervention(
    customer: Customer,
    document: CustomerDocument,
    context: EscalationContext
  ) {
    // Implement human intervention
    return {
      status: 'human_intervention_required',
      context
    };
  }

  private async handleUrgentEscalation(
    customer: Customer,
    document: CustomerDocument,
    context: EscalationContext
  ) {
    // Implement urgent escalation
    return {
      status: 'urgent_escalation',
      context
    };
  }

  private async handleChannelSwitch(
    customer: Customer,
    document: CustomerDocument,
    context: EscalationContext
  ) {
    // Implement channel switch
    return {
      status: 'channel_switch_required',
      context
    };
  }

  private async handleDefaultEscalation(
    customer: Customer,
    document: CustomerDocument,
    context: EscalationContext
  ) {
    // Implement default escalation
    return {
      status: 'default_escalation',
      context
    };
  }

  private async sendMessage(channel: string, message: any) {
    // Simulate message sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: Math.random() > 0.2,
      time: Math.random() * 24,
      sentiment: Math.random() * 2 - 1
    };
  }
}

export const communicationCoordinator = new CommunicationCoordinator();