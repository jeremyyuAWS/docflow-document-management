import { z } from 'zod';
import type { Customer, CustomerDocument } from '../types';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  metadata: {
    documentId?: string;
    customerId?: string;
    actionRequired?: boolean;
    category?: string;
    expiresAt?: Date;
  };
  status: 'unread' | 'read' | 'archived';
}

interface NotificationPreferences {
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  frequency: 'immediate' | 'digest' | 'scheduled';
  quietHours?: {
    start: string;
    end: string;
    timezone: string;
  };
  categories: string[];
}

class NotificationSystem {
  private notifications: Map<string, Notification> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();

  async createNotification(
    type: Notification['type'],
    title: string,
    message: string,
    priority: Notification['priority'],
    metadata: Notification['metadata'] = {}
  ): Promise<Notification> {
    const notification: Notification = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      priority,
      timestamp: new Date(),
      metadata,
      status: 'unread'
    };

    this.notifications.set(notification.id, notification);
    await this.processNotification(notification);
    return notification;
  }

  private async processNotification(notification: Notification): Promise<void> {
    // Apply smart routing based on notification properties
    if (notification.priority === 'high') {
      await this.sendImmediateAlert(notification);
    }

    // Group similar notifications
    const similarNotifications = this.findSimilarNotifications(notification);
    if (similarNotifications.length > 0) {
      await this.groupNotifications(notification, similarNotifications);
    }

    // Clean up old notifications
    await this.cleanupOldNotifications();
  }

  private async sendImmediateAlert(notification: Notification): Promise<void> {
    if (notification.metadata.customerId) {
      const preferences = this.preferences.get(notification.metadata.customerId);
      if (preferences?.channels.inApp) {
        // Simulate in-app notification
        console.log('Sending in-app notification:', notification.title);
      }
      if (preferences?.channels.email) {
        // Simulate email notification
        console.log('Sending email notification:', notification.title);
      }
    }
  }

  private findSimilarNotifications(notification: Notification): Notification[] {
    const threshold = 5 * 60 * 1000; // 5 minutes
    const now = new Date();
    
    return Array.from(this.notifications.values()).filter(n => 
      n.id !== notification.id &&
      n.type === notification.type &&
      n.metadata.category === notification.metadata.category &&
      now.getTime() - n.timestamp.getTime() < threshold
    );
  }

  private async groupNotifications(
    notification: Notification,
    similarNotifications: Notification[]
  ): Promise<void> {
    if (similarNotifications.length >= 3) {
      const groupedNotification = await this.createNotification(
        notification.type,
        'Multiple Similar Updates',
        `${similarNotifications.length + 1} updates of type "${notification.metadata.category}"`,
        notification.priority,
        {
          ...notification.metadata,
          groupedIds: [notification.id, ...similarNotifications.map(n => n.id)]
        }
      );

      // Mark individual notifications as archived
      similarNotifications.forEach(n => {
        n.status = 'archived';
      });
      notification.status = 'archived';
    }
  }

  private async cleanupOldNotifications(): Promise<void> {
    const threshold = 7 * 24 * 60 * 60 * 1000; // 7 days
    const now = new Date();

    this.notifications.forEach((notification, id) => {
      if (now.getTime() - notification.timestamp.getTime() > threshold) {
        this.notifications.delete(id);
      }
    });
  }

  async setPreferences(
    customerId: string,
    preferences: NotificationPreferences
  ): Promise<void> {
    this.preferences.set(customerId, preferences);
  }

  async getNotifications(
    customerId: string,
    options: {
      status?: Notification['status'];
      type?: Notification['type'];
      limit?: number;
    } = {}
  ): Promise<Notification[]> {
    const notifications = Array.from(this.notifications.values())
      .filter(n => 
        n.metadata.customerId === customerId &&
        (!options.status || n.status === options.status) &&
        (!options.type || n.type === options.type)
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return options.limit ? notifications.slice(0, options.limit) : notifications;
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.status = 'read';
    }
  }

  async archiveNotification(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.status = 'archived';
    }
  }
}

export const notificationSystem = new NotificationSystem();