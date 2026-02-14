import {
  NotificationPayload,
  NotificationChannel,
  Deadline,
  Matter,
  Client,
  Lawyer,
  Licence,
  Registration
} from '../models/types';

/**
 * Notification Service
 * Handles sending notifications to clients and lawyers
 */
export class NotificationService {
  private sentNotifications: NotificationPayload[] = [];

  /**
   * Send notification to a recipient
   */
  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      switch (payload.channel) {
        case NotificationChannel.EMAIL:
          return await this.sendEmail(payload);
        case NotificationChannel.SMS:
          return await this.sendSMS(payload);
        case NotificationChannel.IN_APP:
          return await this.sendInAppNotification(payload);
        default:
          console.warn(`Unknown notification channel: ${payload.channel}`);
          return false;
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  /**
   * Send deadline reminder to client
   */
  async sendDeadlineReminderToClient(
    client: Client,
    deadline: Deadline,
    matter?: Matter
  ): Promise<void> {
    const daysUntil = this.getDaysUntilDate(deadline.dueDate);
    const urgencyText = daysUntil === 0 ? 'TODAY' : 
                       daysUntil === 1 ? 'TOMORROW' : 
                       `in ${daysUntil} days`;

    const message = this.buildDeadlineMessage(deadline, matter, urgencyText);

    for (const channel of client.notificationPreferences) {
      const payload: NotificationPayload = {
        recipientId: client.id,
        recipientType: 'CLIENT',
        channel,
        subject: `Deadline Reminder: ${deadline.title}`,
        message,
        deadline,
        matter
      };

      await this.sendNotification(payload);
    }
  }

  /**
   * Send deadline reminder to lawyer
   */
  async sendDeadlineReminderToLawyer(
    lawyer: Lawyer,
    deadline: Deadline,
    matter?: Matter
  ): Promise<void> {
    const daysUntil = this.getDaysUntilDate(deadline.dueDate);
    const urgencyText = daysUntil === 0 ? 'TODAY' : 
                       daysUntil === 1 ? 'TOMORROW' : 
                       `in ${daysUntil} days`;

    const message = this.buildDeadlineMessage(deadline, matter, urgencyText);

    for (const channel of lawyer.notificationPreferences) {
      const payload: NotificationPayload = {
        recipientId: lawyer.id,
        recipientType: 'LAWYER',
        channel,
        subject: `Deadline Reminder: ${deadline.title}`,
        message,
        deadline,
        matter
      };

      await this.sendNotification(payload);
    }
  }

  /**
   * Send licence expiry alert
   */
  async sendLicenceExpiryAlert(
    client: Client,
    licence: Licence
  ): Promise<void> {
    const daysUntil = this.getDaysUntilDate(licence.expiryDate);
    const message = `
Your ${licence.licenceType} licence (#${licence.licenceNumber}) is expiring ${daysUntil === 0 ? 'TODAY' : `in ${daysUntil} days`}.

Licence Details:
- Type: ${licence.licenceType}
- Number: ${licence.licenceNumber}
- Expiry Date: ${licence.expiryDate.toDateString()}
- Issuing Authority: ${licence.issuingAuthority}

Please take immediate action to renew this licence to avoid any legal consequences.
    `.trim();

    for (const channel of client.notificationPreferences) {
      const payload: NotificationPayload = {
        recipientId: client.id,
        recipientType: 'CLIENT',
        channel,
        subject: `URGENT: Licence Expiry - ${licence.licenceType}`,
        message,
        licence
      };

      await this.sendNotification(payload);
    }
  }

  /**
   * Send registration expiry alert
   */
  async sendRegistrationExpiryAlert(
    client: Client,
    registration: Registration
  ): Promise<void> {
    if (!registration.expiryDate) return;

    const daysUntil = this.getDaysUntilDate(registration.expiryDate);
    const message = `
Your ${registration.registrationType} registration (#${registration.registrationNumber}) is expiring ${daysUntil === 0 ? 'TODAY' : `in ${daysUntil} days`}.

Registration Details:
- Type: ${registration.registrationType}
- Number: ${registration.registrationNumber}
- Expiry Date: ${registration.expiryDate.toDateString()}
- Authority: ${registration.authority}

Please take action to maintain your registration status.
    `.trim();

    for (const channel of client.notificationPreferences) {
      const payload: NotificationPayload = {
        recipientId: client.id,
        recipientType: 'CLIENT',
        channel,
        subject: `Registration Renewal Required - ${registration.registrationType}`,
        message,
        registration
      };

      await this.sendNotification(payload);
    }
  }

  /**
   * Get all sent notifications
   */
  getSentNotifications(): NotificationPayload[] {
    return this.sentNotifications;
  }

  /**
   * Get notifications for a specific recipient
   */
  getNotificationsForRecipient(recipientId: string): NotificationPayload[] {
    return this.sentNotifications.filter(n => n.recipientId === recipientId);
  }

  private async sendEmail(payload: NotificationPayload): Promise<boolean> {
    // In a real implementation, this would use an email service (SendGrid, SES, etc.)
    console.log('\n📧 EMAIL NOTIFICATION');
    console.log('═'.repeat(60));
    console.log(`To: ${payload.recipientType} (${payload.recipientId})`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`\n${payload.message}`);
    console.log('═'.repeat(60));
    
    this.sentNotifications.push(payload);
    return true;
  }

  private async sendSMS(payload: NotificationPayload): Promise<boolean> {
    // In a real implementation, this would use an SMS service (Twilio, AWS SNS, etc.)
    console.log('\n📱 SMS NOTIFICATION');
    console.log('═'.repeat(60));
    console.log(`To: ${payload.recipientType} (${payload.recipientId})`);
    console.log(`Message: ${payload.message.substring(0, 160)}...`);
    console.log('═'.repeat(60));
    
    this.sentNotifications.push(payload);
    return true;
  }

  private async sendInAppNotification(payload: NotificationPayload): Promise<boolean> {
    // In a real implementation, this would store in database for in-app display
    console.log('\n🔔 IN-APP NOTIFICATION');
    console.log('═'.repeat(60));
    console.log(`For: ${payload.recipientType} (${payload.recipientId})`);
    console.log(`Title: ${payload.subject}`);
    console.log(`\n${payload.message}`);
    console.log('═'.repeat(60));
    
    this.sentNotifications.push(payload);
    return true;
  }

  private buildDeadlineMessage(
    deadline: Deadline,
    matter: Matter | undefined,
    urgencyText: string
  ): string {
    return `
DEADLINE REMINDER: ${deadline.title}

This is a reminder that your deadline is due ${urgencyText}.

Deadline Details:
- Title: ${deadline.title}
- Type: ${deadline.type}
- Due Date: ${deadline.dueDate.toDateString()}
- Priority: ${deadline.priority}
${matter ? `- Matter: ${matter.title}` : ''}

Description:
${deadline.description}

Please ensure this deadline is met to avoid any legal consequences.
    `.trim();
  }

  private getDaysUntilDate(date: Date): number {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
