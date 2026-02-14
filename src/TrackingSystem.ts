import { MatterService } from './services/MatterService';
import { DeadlineService } from './services/DeadlineService';
import { NotificationService } from './services/NotificationService';
import { LicenceRegistrationService } from './services/LicenceRegistrationService';
import { DeadlineAnalyzer } from './utils/DeadlineAnalyzer';
import { ReminderScheduler } from './utils/ReminderScheduler';
import {
  Client,
  Lawyer,
  Matter,
  Deadline,
  Licence,
  Registration,
  DeadlineType,
  Priority,
  NotificationChannel
} from './models/types';

/**
 * Legal Hub Tracking System
 * Main class that orchestrates all tracking services
 */
export class TrackingSystem {
  private matterService: MatterService;
  private deadlineService: DeadlineService;
  private notificationService: NotificationService;
  private licenceService: LicenceRegistrationService;
  private deadlineAnalyzer: DeadlineAnalyzer;
  private reminderScheduler: ReminderScheduler;

  constructor() {
    // Initialize services
    this.matterService = new MatterService();
    this.deadlineService = new DeadlineService(this.matterService);
    this.notificationService = new NotificationService();
    this.licenceService = new LicenceRegistrationService(this.deadlineService);
    this.deadlineAnalyzer = new DeadlineAnalyzer(this.deadlineService);
    this.reminderScheduler = new ReminderScheduler(
      this.deadlineService,
      this.notificationService,
      this.matterService,
      this.licenceService
    );
  }

  // ==================== Matter Management ====================

  /**
   * Register a new client
   */
  registerClient(client: Client): void {
    this.matterService.registerClient(client);
  }

  /**
   * Register a new lawyer
   */
  registerLawyer(lawyer: Lawyer): void {
    this.matterService.registerLawyer(lawyer);
  }

  /**
   * Create a new matter
   */
  createMatter(
    title: string,
    description: string,
    clientId: string,
    lawyerId: string
  ): Matter {
    return this.matterService.createMatter(title, description, clientId, lawyerId);
  }

  /**
   * Get matter by ID
   */
  getMatter(id: string): Matter | undefined {
    return this.matterService.getMatter(id);
  }

  /**
   * Get all active matters
   */
  getActiveMatters(): Matter[] {
    return this.matterService.getActiveMatters();
  }

  // ==================== Deadline Management ====================

  /**
   * Create a deadline manually
   */
  createDeadline(
    matterId: string,
    type: DeadlineType,
    title: string,
    description: string,
    dueDate: Date,
    priority: Priority,
    reminderDaysBefore?: number[]
  ): Deadline {
    return this.deadlineService.createDeadline(
      matterId,
      type,
      title,
      description,
      dueDate,
      priority,
      reminderDaysBefore
    );
  }

  /**
   * Analyze matter file and auto-create deadlines
   */
  analyzeMatterFile(
    matterId: string,
    fileContent: string,
    fileName: string
  ): number {
    return this.deadlineAnalyzer.autoCreateDeadlines(matterId, fileContent, fileName);
  }

  /**
   * Get upcoming deadlines
   */
  getUpcomingDeadlines(): Deadline[] {
    return this.deadlineService.getUpcomingDeadlines();
  }

  /**
   * Get overdue deadlines
   */
  getOverdueDeadlines(): Deadline[] {
    return this.deadlineService.getOverdueDeadlines();
  }

  /**
   * Mark deadline as completed
   */
  completeDeadline(id: string): Deadline | undefined {
    return this.deadlineService.completeDeadline(id);
  }

  // ==================== Licence Management ====================

  /**
   * Register a business licence
   */
  registerLicence(
    clientId: string,
    licenceType: string,
    licenceNumber: string,
    issueDate: Date,
    expiryDate: Date,
    issuingAuthority: string,
    matterId?: string
  ): Licence {
    return this.licenceService.registerLicence(
      clientId,
      licenceType,
      licenceNumber,
      issueDate,
      expiryDate,
      issuingAuthority,
      matterId
    );
  }

  /**
   * Analyze licence document and extract information
   */
  analyzeLicenceDocument(content: string): {
    licenceNumber?: string;
    issueDate?: Date;
    expiryDate?: Date;
    licenceType?: string;
  } {
    return this.deadlineAnalyzer.analyzeLicenceDocument(content);
  }

  /**
   * Get licences expiring soon
   */
  getLicencesExpiringWithinDays(days: number): Licence[] {
    return this.licenceService.getLicencesExpiringWithinDays(days);
  }

  // ==================== Registration Management ====================

  /**
   * Register a business registration
   */
  registerRegistration(
    clientId: string,
    registrationType: string,
    registrationNumber: string,
    registrationDate: Date,
    authority: string,
    expiryDate?: Date,
    matterId?: string
  ): Registration {
    return this.licenceService.registerRegistration(
      clientId,
      registrationType,
      registrationNumber,
      registrationDate,
      authority,
      expiryDate,
      matterId
    );
  }

  /**
   * Analyze registration document and extract information
   */
  analyzeRegistrationDocument(content: string): {
    registrationNumber?: string;
    registrationDate?: Date;
    expiryDate?: Date;
    registrationType?: string;
  } {
    return this.deadlineAnalyzer.analyzeRegistrationDocument(content);
  }

  /**
   * Get registrations expiring soon
   */
  getRegistrationsExpiringWithinDays(days: number): Registration[] {
    return this.licenceService.getRegistrationsExpiringWithinDays(days);
  }

  // ==================== Reminder & Notification Management ====================

  /**
   * Start the automated reminder scheduler
   */
  startReminderScheduler(): void {
    this.reminderScheduler.start();
  }

  /**
   * Stop the reminder scheduler
   */
  stopReminderScheduler(): void {
    this.reminderScheduler.stop();
  }

  /**
   * Manually trigger reminder check
   */
  async checkReminders(): Promise<void> {
    await this.reminderScheduler.checkAndSendReminders();
  }

  // ==================== Reporting & Analytics ====================

  /**
   * Get caseload summary
   */
  getCaseloadSummary() {
    return this.deadlineService.getCaseloadSummary();
  }

  /**
   * Get licence and registration summary
   */
  getLicenceRegistrationSummary() {
    return this.licenceService.getSummary();
  }

  /**
   * Get comprehensive dashboard data
   */
  getDashboard() {
    const caseload = this.getCaseloadSummary();
    const licenceReg = this.getLicenceRegistrationSummary();
    const upcomingDeadlines = this.getUpcomingDeadlines().slice(0, 10);
    const overdueDeadlines = this.getOverdueDeadlines();

    return {
      caseload,
      licenceReg,
      upcomingDeadlines: upcomingDeadlines.map(d => ({
        id: d.id,
        title: d.title,
        type: d.type,
        dueDate: d.dueDate,
        priority: d.priority
      })),
      overdueDeadlines: overdueDeadlines.map(d => ({
        id: d.id,
        title: d.title,
        type: d.type,
        dueDate: d.dueDate,
        priority: d.priority
      })),
      alerts: {
        criticalDeadlines: caseload.criticalDeadlines,
        overdueDeadlines: caseload.totalOverdueDeadlines,
        expiringLicences: licenceReg.expiringLicences,
        expiringRegistrations: licenceReg.expiringRegistrations
      }
    };
  }
}

// Export types for external use
export {
  Client,
  Lawyer,
  Matter,
  Deadline,
  Licence,
  Registration,
  DeadlineType,
  Priority,
  NotificationChannel
};
