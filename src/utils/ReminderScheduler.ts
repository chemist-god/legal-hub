import * as cron from 'node-cron';
import { DeadlineService } from '../services/DeadlineService';
import { NotificationService } from '../services/NotificationService';
import { MatterService } from '../services/MatterService';
import { LicenceRegistrationService } from '../services/LicenceRegistrationService';

/**
 * Reminder Scheduler
 * Automated system that checks for upcoming deadlines and sends reminders
 */
export class ReminderScheduler {
  private deadlineService: DeadlineService;
  private notificationService: NotificationService;
  private matterService: MatterService;
  private licenceService: LicenceRegistrationService;
  private scheduledTasks: cron.ScheduledTask[] = [];
  private isRunning: boolean = false;

  constructor(
    deadlineService: DeadlineService,
    notificationService: NotificationService,
    matterService: MatterService,
    licenceService: LicenceRegistrationService
  ) {
    this.deadlineService = deadlineService;
    this.notificationService = notificationService;
    this.matterService = matterService;
    this.licenceService = licenceService;
  }

  /**
   * Start the reminder scheduler
   * Runs daily at 9 AM to check for deadlines
   */
  start(): void {
    if (this.isRunning) {
      console.log('Reminder scheduler is already running');
      return;
    }

    // Schedule daily reminder check at 9 AM
    const dailyTask = cron.schedule('0 9 * * *', () => {
      this.checkAndSendReminders();
    });

    this.scheduledTasks.push(dailyTask);
    this.isRunning = true;
    console.log('✅ Reminder scheduler started - will run daily at 9 AM');
  }

  /**
   * Start with custom schedule (for testing)
   */
  startWithSchedule(cronExpression: string): void {
    if (this.isRunning) {
      console.log('Reminder scheduler is already running');
      return;
    }

    const task = cron.schedule(cronExpression, () => {
      this.checkAndSendReminders();
    });

    this.scheduledTasks.push(task);
    this.isRunning = true;
    console.log(`✅ Reminder scheduler started with custom schedule: ${cronExpression}`);
  }

  /**
   * Stop the reminder scheduler
   */
  stop(): void {
    this.scheduledTasks.forEach(task => task.stop());
    this.scheduledTasks = [];
    this.isRunning = false;
    console.log('⏹️  Reminder scheduler stopped');
  }

  /**
   * Manually trigger reminder check (useful for testing)
   */
  async checkAndSendReminders(): Promise<void> {
    console.log('\n🔍 Checking for upcoming deadlines...');
    console.log('═'.repeat(60));

    try {
      // Update licence and registration statuses
      this.licenceService.updateLicenceStatuses();
      this.licenceService.updateRegistrationStatuses();

      // Get deadlines that need reminders
      const deadlinesNeedingReminders = this.deadlineService.getDeadlinesNeedingReminders();
      console.log(`Found ${deadlinesNeedingReminders.length} deadline(s) requiring reminders`);

      // Send reminders for each deadline
      for (const deadline of deadlinesNeedingReminders) {
        await this.sendDeadlineReminders(deadline);
      }

      // Check for expiring licences
      await this.checkExpiringLicences();

      // Check for expiring registrations
      await this.checkExpiringRegistrations();

      console.log('═'.repeat(60));
      console.log('✅ Reminder check completed\n');
    } catch (error) {
      console.error('❌ Error during reminder check:', error);
    }
  }

  /**
   * Send reminders for a specific deadline
   */
  private async sendDeadlineReminders(deadline: any): Promise<void> {
    const matter = this.matterService.getMatter(deadline.matterId);
    if (!matter) {
      console.warn(`Matter ${deadline.matterId} not found for deadline ${deadline.id}`);
      return;
    }

    const client = this.matterService.getClient(matter.clientId);
    const lawyer = this.matterService.getLawyer(matter.lawyerId);

    // Send to client
    if (client) {
      await this.notificationService.sendDeadlineReminderToClient(client, deadline, matter);
      console.log(`✉️  Sent reminder to client ${client.name} for deadline: ${deadline.title}`);
    }

    // Send to lawyer
    if (lawyer) {
      await this.notificationService.sendDeadlineReminderToLawyer(lawyer, deadline, matter);
      console.log(`✉️  Sent reminder to lawyer ${lawyer.name} for deadline: ${deadline.title}`);
    }

    // Record that notification was sent
    this.deadlineService.recordNotificationSent(deadline.id);
  }

  /**
   * Check for expiring licences and send alerts
   */
  private async checkExpiringLicences(): Promise<void> {
    const expiringLicences = this.licenceService.getLicencesExpiringWithinDays(30);
    
    if (expiringLicences.length > 0) {
      console.log(`\n📋 Found ${expiringLicences.length} licence(s) expiring within 30 days`);
      
      for (const licence of expiringLicences) {
        const client = this.matterService.getClient(licence.clientId);
        if (client) {
          await this.notificationService.sendLicenceExpiryAlert(client, licence);
          console.log(`✉️  Sent licence expiry alert to ${client.name}: ${licence.licenceType}`);
        }
      }
    }
  }

  /**
   * Check for expiring registrations and send alerts
   */
  private async checkExpiringRegistrations(): Promise<void> {
    const expiringRegistrations = this.licenceService.getRegistrationsExpiringWithinDays(30);
    
    if (expiringRegistrations.length > 0) {
      console.log(`\n📋 Found ${expiringRegistrations.length} registration(s) expiring within 30 days`);
      
      for (const registration of expiringRegistrations) {
        const client = this.matterService.getClient(registration.clientId);
        if (client) {
          await this.notificationService.sendRegistrationExpiryAlert(client, registration);
          console.log(`✉️  Sent registration expiry alert to ${client.name}: ${registration.registrationType}`);
        }
      }
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isRunning: boolean; activeTasks: number } {
    return {
      isRunning: this.isRunning,
      activeTasks: this.scheduledTasks.length
    };
  }
}
