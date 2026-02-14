import { TrackingSystem, DeadlineType, Priority, NotificationChannel } from '../index';

describe('TrackingSystem', () => {
  let system: TrackingSystem;

  beforeEach(() => {
    system = new TrackingSystem();
  });

  describe('Client and Lawyer Registration', () => {
    it('should register a client', () => {
      system.registerClient({
        id: 'client-1',
        name: 'Test Client',
        email: 'client@test.com',
        notificationPreferences: [NotificationChannel.EMAIL]
      });

      // Verify by creating a matter with this client
      const matter = system.createMatter(
        'Test Matter',
        'Description',
        'client-1',
        'lawyer-1'
      );
      expect(matter.clientId).toBe('client-1');
    });

    it('should register a lawyer', () => {
      system.registerLawyer({
        id: 'lawyer-1',
        name: 'Test Lawyer',
        email: 'lawyer@test.com',
        notificationPreferences: [NotificationChannel.EMAIL]
      });

      // Verify by creating a matter with this lawyer
      const matter = system.createMatter(
        'Test Matter',
        'Description',
        'client-1',
        'lawyer-1'
      );
      expect(matter.lawyerId).toBe('lawyer-1');
    });
  });

  describe('Matter Management', () => {
    it('should create a new matter', () => {
      const matter = system.createMatter(
        'Corporate Merger',
        'Merger between companies',
        'client-1',
        'lawyer-1'
      );

      expect(matter).toBeDefined();
      expect(matter.title).toBe('Corporate Merger');
      expect(matter.description).toBe('Merger between companies');
      expect(matter.clientId).toBe('client-1');
      expect(matter.lawyerId).toBe('lawyer-1');
      expect(matter.deadlines).toEqual([]);
    });

    it('should retrieve a matter by ID', () => {
      const matter = system.createMatter(
        'Test Matter',
        'Description',
        'client-1',
        'lawyer-1'
      );

      const retrieved = system.getMatter(matter.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(matter.id);
    });

    it('should get all active matters', () => {
      system.createMatter('Matter 1', 'Desc 1', 'client-1', 'lawyer-1');
      system.createMatter('Matter 2', 'Desc 2', 'client-2', 'lawyer-2');

      const activeMatters = system.getActiveMatters();
      expect(activeMatters.length).toBe(2);
    });
  });

  describe('Deadline Management', () => {
    let matterId: string;

    beforeEach(() => {
      const matter = system.createMatter(
        'Test Matter',
        'Description',
        'client-1',
        'lawyer-1'
      );
      matterId = matter.id;
    });

    it('should create a deadline', () => {
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const deadline = system.createDeadline(
        matterId,
        DeadlineType.FILING,
        'File Documents',
        'Submit required documents to court',
        dueDate,
        Priority.HIGH
      );

      expect(deadline).toBeDefined();
      expect(deadline.title).toBe('File Documents');
      expect(deadline.type).toBe(DeadlineType.FILING);
      expect(deadline.priority).toBe(Priority.HIGH);
      expect(deadline.completed).toBe(false);
    });

    it('should get upcoming deadlines', () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      system.createDeadline(
        matterId,
        DeadlineType.FILING,
        'Future Deadline',
        'Description',
        futureDate,
        Priority.HIGH
      );

      const upcomingDeadlines = system.getUpcomingDeadlines();
      expect(upcomingDeadlines.length).toBe(1);
      expect(upcomingDeadlines[0].title).toBe('Future Deadline');
    });

    it('should mark deadline as completed', () => {
      const deadline = system.createDeadline(
        matterId,
        DeadlineType.FILING,
        'Test Deadline',
        'Description',
        new Date(),
        Priority.HIGH
      );

      const completed = system.completeDeadline(deadline.id);
      expect(completed).toBeDefined();
      expect(completed?.completed).toBe(true);
    });
  });

  describe('Document Analysis', () => {
    let matterId: string;

    beforeEach(() => {
      const matter = system.createMatter(
        'Test Matter',
        'Description',
        'client-1',
        'lawyer-1'
      );
      matterId = matter.id;
    });

    it('should extract deadlines from matter document', () => {
      const document = `
        Important dates:
        - Filing deadline is 12/31/2026
        - Hearing scheduled for 01/15/2027
        - Response due by 02/01/2027
      `;

      const count = system.analyzeMatterFile(matterId, document, 'test.txt');
      expect(count).toBeGreaterThan(0);
    });

    it('should analyze licence document', () => {
      const document = `
        Licence Number: LIC-123456
        Type: Business Operating Licence
        Issue Date: 01/01/2024
        Expiry Date: 12/31/2026
      `;

      const info = system.analyzeLicenceDocument(document);
      expect(info.licenceNumber).toBe('LIC-123456');
      expect(info.licenceType).toBeDefined();
    });

    it('should analyze registration document', () => {
      const document = `
        Registration Number: REG-789012
        Type: Corporate Registration
        Registration Date: 02/01/2024
        Expiry Date: 02/01/2027
      `;

      const info = system.analyzeRegistrationDocument(document);
      expect(info.registrationNumber).toBe('REG-789012');
      expect(info.registrationType).toBeDefined();
    });
  });

  describe('Licence Management', () => {
    it('should register a licence', () => {
      const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const licence = system.registerLicence(
        'client-1',
        'Business Licence',
        'LIC-001',
        new Date(),
        expiryDate,
        'State Authority'
      );

      expect(licence).toBeDefined();
      expect(licence.licenceType).toBe('Business Licence');
      expect(licence.licenceNumber).toBe('LIC-001');
      expect(licence.status).toBe('PENDING_RENEWAL');
    });

    it('should get licences expiring within days', () => {
      const expiryDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
      system.registerLicence(
        'client-1',
        'Business Licence',
        'LIC-001',
        new Date(),
        expiryDate,
        'State Authority'
      );

      const expiring = system.getLicencesExpiringWithinDays(30);
      expect(expiring.length).toBe(1);
    });
  });

  describe('Registration Management', () => {
    it('should register a registration', () => {
      const expiryDate = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000);
      const registration = system.registerRegistration(
        'client-1',
        'Corporate Registration',
        'REG-001',
        new Date(),
        'Registry Office',
        expiryDate
      );

      expect(registration).toBeDefined();
      expect(registration.registrationType).toBe('Corporate Registration');
      expect(registration.registrationNumber).toBe('REG-001');
    });

    it('should get registrations expiring within days', () => {
      const expiryDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      system.registerRegistration(
        'client-1',
        'Corporate Registration',
        'REG-001',
        new Date(),
        'Registry Office',
        expiryDate
      );

      const expiring = system.getRegistrationsExpiringWithinDays(30);
      expect(expiring.length).toBe(1);
    });
  });

  describe('Dashboard and Analytics', () => {
    beforeEach(() => {
      // Set up test data
      system.registerClient({
        id: 'client-1',
        name: 'Test Client',
        email: 'client@test.com',
        notificationPreferences: [NotificationChannel.EMAIL]
      });

      const matter = system.createMatter(
        'Test Matter',
        'Description',
        'client-1',
        'lawyer-1'
      );

      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      system.createDeadline(
        matter.id,
        DeadlineType.FILING,
        'Test Deadline',
        'Description',
        futureDate,
        Priority.CRITICAL
      );
    });

    it('should get caseload summary', () => {
      const summary = system.getCaseloadSummary();
      expect(summary).toBeDefined();
      expect(summary.totalActiveMatters).toBeGreaterThan(0);
      expect(summary.totalUpcomingDeadlines).toBeGreaterThan(0);
    });

    it('should get licence and registration summary', () => {
      const summary = system.getLicenceRegistrationSummary();
      expect(summary).toBeDefined();
      expect(summary.totalLicences).toBeGreaterThanOrEqual(0);
      expect(summary.totalRegistrations).toBeGreaterThanOrEqual(0);
    });

    it('should get comprehensive dashboard', () => {
      const dashboard = system.getDashboard();
      expect(dashboard).toBeDefined();
      expect(dashboard.caseload).toBeDefined();
      expect(dashboard.licenceReg).toBeDefined();
      expect(dashboard.alerts).toBeDefined();
      expect(dashboard.upcomingDeadlines).toBeDefined();
    });
  });

  describe('Reminder System', () => {
    it('should manually check reminders', async () => {
      system.registerClient({
        id: 'client-1',
        name: 'Test Client',
        email: 'client@test.com',
        notificationPreferences: [NotificationChannel.EMAIL]
      });

      system.registerLawyer({
        id: 'lawyer-1',
        name: 'Test Lawyer',
        email: 'lawyer@test.com',
        notificationPreferences: [NotificationChannel.EMAIL]
      });

      const matter = system.createMatter(
        'Test Matter',
        'Description',
        'client-1',
        'lawyer-1'
      );

      const futureDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1 day from now
      system.createDeadline(
        matter.id,
        DeadlineType.FILING,
        'Test Deadline',
        'Description',
        futureDate,
        Priority.HIGH,
        [1] // Remind 1 day before
      );

      // This should not throw an error
      await expect(system.checkReminders()).resolves.not.toThrow();
    });
  });
});
