import { api } from '@/lib/api';

export interface NotificationPayload {
  recipientId: string;
  type: 'manufacturer_approval' | 'document_approval' | 'dpc_approval';
  status: 'approved' | 'rejected' | 'pending';
  details?: Record<string, any>;
}

export class NotificationService {
  static async sendEmail(payload: NotificationPayload): Promise<void> {
    try {
      await api.post('/api/notifications/email', payload);
    } catch (error) {
      console.error('Failed to send email notification:', error);
      throw error;
    }
  }

  static async sendInApp(payload: NotificationPayload): Promise<void> {
    try {
      await api.post('/api/notifications/in-app', payload);
    } catch (error) {
      console.error('Failed to send in-app notification:', error);
      throw error;
    }
  }

  static async notify(payload: NotificationPayload): Promise<void> {
    await Promise.all([
      this.sendEmail(payload),
      this.sendInApp(payload)
    ]);
  }
}