import { Deadline, DeadlineType, Priority, Matter } from '../models/types';
import { MatterService } from './MatterService';

/**
 * Deadline Tracking Service
 * Manages deadlines for matters and tracks upcoming due dates
 */
export class DeadlineService {
  private deadlines: Map<string, Deadline> = new Map();
  private matterService: MatterService;

  constructor(matterService: MatterService) {
    this.matterService = matterService;
  }

  /**
   * Create a new deadline
   */
  createDeadline(
    matterId: string,
    type: DeadlineType,
    title: string,
    description: string,
    dueDate: Date,
    priority: Priority,
    reminderDaysBefore: number[] = [7, 3, 1]
  ): Deadline {
    const id = this.generateId();
    const deadline: Deadline = {
      id,
      matterId,
      type,
      title,
      description,
      dueDate,
      priority,
      completed: false,
      reminderDaysBefore,
      notificationsSent: [],
      createdAt: new Date()
    };

    this.deadlines.set(id, deadline);
    
    // Add deadline to matter
    const matter = this.matterService.getMatter(matterId);
    if (matter) {
      matter.deadlines.push(deadline);
    }

    return deadline;
  }

  /**
   * Get deadline by ID
   */
  getDeadline(id: string): Deadline | undefined {
    return this.deadlines.get(id);
  }

  /**
   * Get all deadlines for a matter
   */
  getDeadlinesByMatter(matterId: string): Deadline[] {
    return Array.from(this.deadlines.values()).filter(
      d => d.matterId === matterId
    );
  }

  /**
   * Get all upcoming deadlines (not completed and due in the future)
   */
  getUpcomingDeadlines(): Deadline[] {
    const now = new Date();
    return Array.from(this.deadlines.values()).filter(
      d => !d.completed && d.dueDate >= now
    );
  }

  /**
   * Get deadlines due within specified days
   */
  getDeadlinesDueWithinDays(days: number): Deadline[] {
    const now = new Date();
    const targetDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return this.getUpcomingDeadlines().filter(
      d => d.dueDate <= targetDate
    );
  }

  /**
   * Get overdue deadlines
   */
  getOverdueDeadlines(): Deadline[] {
    const now = new Date();
    return Array.from(this.deadlines.values()).filter(
      d => !d.completed && d.dueDate < now
    );
  }

  /**
   * Mark deadline as completed
   */
  completeDeadline(id: string): Deadline | undefined {
    const deadline = this.deadlines.get(id);
    if (deadline) {
      deadline.completed = true;
      this.deadlines.set(id, deadline);
    }
    return deadline;
  }

  /**
   * Get deadlines that need reminders today
   */
  getDeadlinesNeedingReminders(): Deadline[] {
    const now = new Date();
    const reminders: Deadline[] = [];

    for (const deadline of this.deadlines.values()) {
      if (deadline.completed) continue;

      const daysUntilDue = this.getDaysUntilDeadline(deadline.dueDate);
      
      // Check if any reminder day matches
      for (const reminderDay of deadline.reminderDaysBefore) {
        if (daysUntilDue === reminderDay) {
          // Check if notification already sent today
          const lastSent = deadline.notificationsSent[deadline.notificationsSent.length - 1];
          if (!lastSent || !this.isSameDay(lastSent, now)) {
            reminders.push(deadline);
            break;
          }
        }
      }
    }

    return reminders;
  }

  /**
   * Record that a notification was sent for a deadline
   */
  recordNotificationSent(deadlineId: string): void {
    const deadline = this.deadlines.get(deadlineId);
    if (deadline) {
      deadline.notificationsSent.push(new Date());
      this.deadlines.set(deadlineId, deadline);
    }
  }

  /**
   * Get caseload summary
   */
  getCaseloadSummary() {
    const activeMatters = this.matterService.getActiveMatters();
    const upcomingDeadlines = this.getUpcomingDeadlines();
    const overdueDeadlines = this.getOverdueDeadlines();

    return {
      totalActiveMatters: activeMatters.length,
      totalUpcomingDeadlines: upcomingDeadlines.length,
      totalOverdueDeadlines: overdueDeadlines.length,
      deadlinesDueThisWeek: this.getDeadlinesDueWithinDays(7).length,
      criticalDeadlines: upcomingDeadlines.filter(d => d.priority === Priority.CRITICAL).length
    };
  }

  private getDaysUntilDeadline(dueDate: Date): number {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private generateId(): string {
    return `DL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
