/**
 * Core type definitions for the Legal Hub tracking system
 */

export enum DeadlineType {
  FILING = 'FILING',
  HEARING = 'HEARING',
  RENEWAL = 'RENEWAL',
  REGISTRATION = 'REGISTRATION',
  RESPONSE_DUE = 'RESPONSE_DUE',
  REGULATORY_UPDATE = 'REGULATORY_UPDATE',
  LICENCE_EXPIRY = 'LICENCE_EXPIRY',
  OTHER = 'OTHER'
}

export enum Priority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum MatterStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED',
  ON_HOLD = 'ON_HOLD'
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP'
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  notificationPreferences: NotificationChannel[];
}

export interface Lawyer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  notificationPreferences: NotificationChannel[];
}

export interface Matter {
  id: string;
  title: string;
  description: string;
  clientId: string;
  lawyerId: string;
  status: MatterStatus;
  createdAt: Date;
  updatedAt: Date;
  deadlines: Deadline[];
}

export interface Deadline {
  id: string;
  matterId: string;
  type: DeadlineType;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  completed: boolean;
  reminderDaysBefore: number[];
  notificationsSent: Date[];
  createdAt: Date;
}

export interface Licence {
  id: string;
  clientId: string;
  licenceType: string;
  licenceNumber: string;
  issueDate: Date;
  expiryDate: Date;
  issuingAuthority: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING_RENEWAL';
  renewalDeadlineId?: string;
}

export interface Registration {
  id: string;
  clientId: string;
  registrationType: string;
  registrationNumber: string;
  registrationDate: Date;
  expiryDate?: Date;
  authority: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  deadlineId?: string;
}

export interface NotificationPayload {
  recipientId: string;
  recipientType: 'CLIENT' | 'LAWYER';
  channel: NotificationChannel;
  subject: string;
  message: string;
  deadline: Deadline;
  matter?: Matter;
  licence?: Licence;
  registration?: Registration;
}

export interface AlertConfig {
  enabled: boolean;
  reminderDays: number[];
  channels: NotificationChannel[];
}
