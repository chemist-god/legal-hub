import { Licence, Registration, DeadlineType, Priority } from '../models/types';
import { DeadlineService } from './DeadlineService';

/**
 * Licence and Registration Tracking Service
 * Manages business licences and registrations with automatic deadline creation
 */
export class LicenceRegistrationService {
  private licences: Map<string, Licence> = new Map();
  private registrations: Map<string, Registration> = new Map();
  private deadlineService: DeadlineService;

  constructor(deadlineService: DeadlineService) {
    this.deadlineService = deadlineService;
  }

  /**
   * Register a new licence
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
    const id = this.generateLicenceId();
    
    const licence: Licence = {
      id,
      clientId,
      licenceType,
      licenceNumber,
      issueDate,
      expiryDate,
      issuingAuthority,
      status: this.determineLicenceStatus(expiryDate)
    };

    this.licences.set(id, licence);

    // Auto-create renewal deadline if matter provided
    if (matterId) {
      const renewalDeadline = this.deadlineService.createDeadline(
        matterId,
        DeadlineType.LICENCE_EXPIRY,
        `Licence Renewal: ${licenceType}`,
        `${licenceType} licence #${licenceNumber} expires on ${expiryDate.toDateString()}`,
        expiryDate,
        Priority.HIGH,
        [90, 60, 30, 14, 7, 3, 1] // More frequent reminders for licences
      );
      licence.renewalDeadlineId = renewalDeadline.id;
    }

    return licence;
  }

  /**
   * Register a new registration
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
    const id = this.generateRegistrationId();
    
    const registration: Registration = {
      id,
      clientId,
      registrationType,
      registrationNumber,
      registrationDate,
      expiryDate,
      authority,
      status: expiryDate ? this.determineRegistrationStatus(expiryDate) : 'ACTIVE'
    };

    this.registrations.set(id, registration);

    // Auto-create renewal deadline if expiry date and matter provided
    if (expiryDate && matterId) {
      const renewalDeadline = this.deadlineService.createDeadline(
        matterId,
        DeadlineType.RENEWAL,
        `Registration Renewal: ${registrationType}`,
        `${registrationType} registration #${registrationNumber} expires on ${expiryDate.toDateString()}`,
        expiryDate,
        Priority.HIGH,
        [60, 30, 14, 7, 3, 1]
      );
      registration.deadlineId = renewalDeadline.id;
    }

    return registration;
  }

  /**
   * Get licence by ID
   */
  getLicence(id: string): Licence | undefined {
    return this.licences.get(id);
  }

  /**
   * Get registration by ID
   */
  getRegistration(id: string): Registration | undefined {
    return this.registrations.get(id);
  }

  /**
   * Get all licences for a client
   */
  getLicencesByClient(clientId: string): Licence[] {
    return Array.from(this.licences.values()).filter(
      l => l.clientId === clientId
    );
  }

  /**
   * Get all registrations for a client
   */
  getRegistrationsByClient(clientId: string): Registration[] {
    return Array.from(this.registrations.values()).filter(
      r => r.clientId === clientId
    );
  }

  /**
   * Get licences expiring within specified days
   */
  getLicencesExpiringWithinDays(days: number): Licence[] {
    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    return Array.from(this.licences.values()).filter(
      l => l.status !== 'EXPIRED' && l.expiryDate >= now && l.expiryDate <= targetDate
    );
  }

  /**
   * Get registrations expiring within specified days
   */
  getRegistrationsExpiringWithinDays(days: number): Registration[] {
    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    return Array.from(this.registrations.values()).filter(
      r => r.status !== 'EXPIRED' && r.expiryDate && r.expiryDate >= now && r.expiryDate <= targetDate
    );
  }

  /**
   * Update licence status based on expiry
   */
  updateLicenceStatuses(): void {
    for (const [id, licence] of this.licences.entries()) {
      const newStatus = this.determineLicenceStatus(licence.expiryDate);
      if (licence.status !== newStatus) {
        licence.status = newStatus;
        this.licences.set(id, licence);
      }
    }
  }

  /**
   * Update registration statuses based on expiry
   */
  updateRegistrationStatuses(): void {
    for (const [id, registration] of this.registrations.entries()) {
      if (registration.expiryDate) {
        const newStatus = this.determineRegistrationStatus(registration.expiryDate);
        if (registration.status !== newStatus) {
          registration.status = newStatus;
          this.registrations.set(id, registration);
        }
      }
    }
  }

  /**
   * Get summary of licences and registrations
   */
  getSummary() {
    const allLicences = Array.from(this.licences.values());
    const allRegistrations = Array.from(this.registrations.values());

    return {
      totalLicences: allLicences.length,
      activeLicences: allLicences.filter(l => l.status === 'ACTIVE').length,
      expiringLicences: this.getLicencesExpiringWithinDays(30).length,
      expiredLicences: allLicences.filter(l => l.status === 'EXPIRED').length,
      totalRegistrations: allRegistrations.length,
      activeRegistrations: allRegistrations.filter(r => r.status === 'ACTIVE').length,
      expiringRegistrations: this.getRegistrationsExpiringWithinDays(30).length,
      expiredRegistrations: allRegistrations.filter(r => r.status === 'EXPIRED').length
    };
  }

  private determineLicenceStatus(expiryDate: Date): 'ACTIVE' | 'EXPIRED' | 'PENDING_RENEWAL' {
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return 'EXPIRED';
    } else if (daysUntilExpiry <= 30) {
      return 'PENDING_RENEWAL';
    } else {
      return 'ACTIVE';
    }
  }

  private determineRegistrationStatus(expiryDate: Date): 'ACTIVE' | 'EXPIRED' | 'PENDING' {
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return 'EXPIRED';
    } else if (daysUntilExpiry <= 30) {
      return 'PENDING';
    } else {
      return 'ACTIVE';
    }
  }

  private generateLicenceId(): string {
    return `LIC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRegistrationId(): string {
    return `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
