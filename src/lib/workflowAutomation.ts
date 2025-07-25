import { z } from 'zod';
import type { Customer, CustomerDocument, SmartFollowUp } from '../types';
import { documentClassifier } from './documentClassification';
import { smartMessaging } from './smartMessaging';

interface WorkflowRule {
  id: string;
  name: string;
  condition: (doc: CustomerDocument, customer: Customer) => boolean;
  actions: WorkflowAction[];
  priority: number;
  isActive: boolean;
}

interface WorkflowAction {
  type: 'notification' | 'followup' | 'escalation' | 'tag';
  params: Record<string, any>;
}

interface WorkflowExecution {
  id: string;
  ruleId: string;
  documentId: string;
  customerId: string;
  status: 'pending' | 'completed' | 'failed';
  actions: {
    type: string;
    status: 'pending' | 'completed' | 'failed';
    result?: any;
    error?: string;
  }[];
  startedAt: Date;
  completedAt?: Date;
}

export class WorkflowAutomation {
  private rules: WorkflowRule[] = [
    {
      id: 'urgent-document-reminder',
      name: 'Urgent Document Reminder',
      condition: (doc, customer) => doc.ai_urgency_score > 80,
      actions: [
        {
          type: 'followup',
          params: {
            template: 'urgent-followup',
            channel: 'email',
            priority: 'high'
          }
        },
        {
          type: 'notification',
          params: {
            message: 'Urgent document requires immediate attention',
            recipients: ['account_manager']
          }
        }
      ],
      priority: 1,
      isActive: true
    },
    {
      id: 'overdue-document-escalation',
      name: 'Overdue Document Escalation',
      condition: (doc) => doc.status === 'overdue',
      actions: [
        {
          type: 'escalation',
          params: {
            level: 'supervisor',
            message: 'Document is overdue and requires escalation'
          }
        },
        {
          type: 'tag',
          params: {
            tags: ['escalated', 'needs_attention']
          }
        }
      ],
      priority: 2,
      isActive: true
    }
  ];

  private executions: Map<string, WorkflowExecution> = new Map();

  async processDocument(doc: CustomerDocument, customer: Customer): Promise<WorkflowExecution> {
    // Create execution context
    const execution: WorkflowExecution = {
      id: crypto.randomUUID(),
      ruleId: '',
      documentId: doc.id,
      customerId: customer.id,
      status: 'pending',
      actions: [],
      startedAt: new Date()
    };

    try {
      // Find matching rules
      const matchingRules = this.rules
        .filter(rule => rule.isActive && rule.condition(doc, customer))
        .sort((a, b) => a.priority - b.priority);

      if (matchingRules.length === 0) {
        execution.status = 'completed';
        execution.completedAt = new Date();
        return execution;
      }

      // Execute highest priority rule
      const rule = matchingRules[0];
      execution.ruleId = rule.id;

      // Execute actions
      for (const action of rule.actions) {
        const actionExecution = {
          type: action.type,
          status: 'pending' as const
        };
        execution.actions.push(actionExecution);

        try {
          const result = await this.executeAction(action, doc, customer);
          actionExecution.status = 'completed';
          actionExecution.result = result;
        } catch (error) {
          actionExecution.status = 'failed';
          actionExecution.error = error instanceof Error ? error.message : 'Unknown error';
        }
      }

      execution.status = execution.actions.some(a => a.status === 'failed') ? 'failed' : 'completed';
      execution.completedAt = new Date();

      // Store execution
      this.executions.set(execution.id, execution);

      return execution;
    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      return execution;
    }
  }

  private async executeAction(
    action: WorkflowAction,
    doc: CustomerDocument,
    customer: Customer
  ): Promise<any> {
    switch (action.type) {
      case 'followup':
        return this.createFollowUp(action.params, doc, customer);
      case 'notification':
        return this.sendNotification(action.params, doc, customer);
      case 'escalation':
        return this.escalateDocument(action.params, doc, customer);
      case 'tag':
        return this.addTags(action.params, doc);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async createFollowUp(
    params: Record<string, any>,
    doc: CustomerDocument,
    customer: Customer
  ): Promise<SmartFollowUp> {
    const context = await this.buildFollowUpContext(customer, doc);
    return smartMessaging.generateSmartMessage(customer, doc, context);
  }

  private async sendNotification(
    params: Record<string, any>,
    doc: CustomerDocument,
    customer: Customer
  ): Promise<void> {
    // Simulate notification sending
    console.log('Sending notification:', params.message);
  }

  private async escalateDocument(
    params: Record<string, any>,
    doc: CustomerDocument,
    customer: Customer
  ): Promise<void> {
    // Simulate escalation
    console.log('Escalating document:', doc.id, 'to level:', params.level);
  }

  private async addTags(
    params: Record<string, any>,
    doc: CustomerDocument
  ): Promise<string[]> {
    const { tags } = params;
    // In a real app, this would update the document in the database
    return tags;
  }

  private async buildFollowUpContext(customer: Customer, doc: CustomerDocument): Promise<any> {
    return {
      previousInteractions: customer.interaction_history || [],
      documentHistory: doc.follow_up_history || [],
      customerPreferences: customer.communication_preferences || {
        preferredChannel: 'email',
        preferredLanguage: 'en',
        responseRate: 0.8
      }
    };
  }

  addRule(rule: WorkflowRule): void {
    this.rules.push(rule);
  }

  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  updateRule(ruleId: string, updates: Partial<WorkflowRule>): void {
    this.rules = this.rules.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
  }

  getExecutions(documentId: string): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .filter(e => e.documentId === documentId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }
}

export const workflowAutomation = new WorkflowAutomation();