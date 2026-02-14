# Quick Start Guide - Legal Hub

## Installation

```bash
npm install
npm run build
```

## Running the Demo

```bash
npm run dev
# or
npx ts-node src/demo.ts
```

## Running Tests

```bash
npm test
```

## Basic Usage

### 1. Initialize the System

```typescript
import { TrackingSystem, DeadlineType, Priority, NotificationChannel } from './src/index';

const system = new TrackingSystem();
```

### 2. Register Users

```typescript
// Register a client
system.registerClient({
  id: 'client-001',
  name: 'Acme Corporation',
  email: 'legal@acmecorp.com',
  phone: '+1-555-0100',
  notificationPreferences: [NotificationChannel.EMAIL, NotificationChannel.IN_APP]
});

// Register a lawyer
system.registerLawyer({
  id: 'lawyer-001',
  name: 'Sarah Johnson',
  email: 'sarah@lawfirm.com',
  phone: '+1-555-0200',
  notificationPreferences: [NotificationChannel.EMAIL]
});
```

### 3. Create a Matter

```typescript
const matter = system.createMatter(
  'Corporate Merger',
  'Due diligence for merger between Acme and TechStart',
  'client-001',
  'lawyer-001'
);

console.log(`Created matter: ${matter.title} (ID: ${matter.id})`);
```

### 4. Add Deadlines

```typescript
// Manual deadline creation
const deadline = system.createDeadline(
  matter.id,
  DeadlineType.FILING,
  'SEC Filing Deadline',
  'Submit Form 8-K to Securities and Exchange Commission',
  new Date('2026-03-15'),
  Priority.CRITICAL,
  [7, 3, 1] // Remind 7, 3, and 1 day before
);

console.log(`Added deadline: ${deadline.title}`);
```

### 5. Analyze Documents

```typescript
// Analyze a matter document to extract deadlines
const document = `
  Important dates for the merger:
  - Filing deadline: 03/15/2026
  - Hearing scheduled: 04/20/2026
  - Response due: 03/01/2026
`;

const count = system.analyzeMatterFile(matter.id, document, 'timeline.txt');
console.log(`Extracted ${count} deadlines from document`);
```

### 6. Register Licences

```typescript
const licence = system.registerLicence(
  'client-001',
  'Business Operating Licence',
  'BOL-2024-12345',
  new Date('2024-01-15'),
  new Date('2026-01-15'),
  'State Business Authority',
  matter.id // Optional: link to matter
);

console.log(`Registered licence: ${licence.licenceType}`);
```

### 7. Register Registrations

```typescript
const registration = system.registerRegistration(
  'client-001',
  'Corporate Registration',
  'CR-2024-ABC123',
  new Date('2024-01-10'),
  'State Corporate Registry',
  new Date('2026-01-10'), // Optional expiry date
  matter.id // Optional: link to matter
);

console.log(`Registered: ${registration.registrationType}`);
```

### 8. View Dashboard

```typescript
const dashboard = system.getDashboard();

console.log('CASELOAD SUMMARY:');
console.log(`  Active Matters: ${dashboard.caseload.totalActiveMatters}`);
console.log(`  Upcoming Deadlines: ${dashboard.caseload.totalUpcomingDeadlines}`);
console.log(`  Critical Priority: ${dashboard.caseload.criticalDeadlines}`);

console.log('\nALERTS:');
console.log(`  Critical Deadlines: ${dashboard.alerts.criticalDeadlines}`);
console.log(`  Overdue Items: ${dashboard.alerts.overdueDeadlines}`);
console.log(`  Licences Expiring: ${dashboard.alerts.expiringLicences}`);
```

### 9. Start Reminder Scheduler

```typescript
// Start automated reminders (runs daily at 9 AM)
system.startReminderScheduler();

// Or manually check reminders
await system.checkReminders();

// Stop the scheduler when done
system.stopReminderScheduler();
```

## Common Use Cases

### Track a New Matter

```typescript
// 1. Create the matter
const matter = system.createMatter(
  'Contract Dispute',
  'Client vs. Vendor contract dispute',
  'client-id',
  'lawyer-id'
);

// 2. Add key deadlines
system.createDeadline(
  matter.id,
  DeadlineType.RESPONSE_DUE,
  'Response to Complaint',
  'File response to vendor complaint',
  new Date('2026-03-30'),
  Priority.CRITICAL,
  [14, 7, 3, 1]
);

// 3. Analyze any documents
const document = 'Filing deadline: 03/30/2026';
system.analyzeMatterFile(matter.id, document, 'complaint.txt');
```

### Monitor Expiring Licences

```typescript
// Get licences expiring within 30 days
const expiring = system.getLicencesExpiringWithinDays(30);

console.log(`Found ${expiring.length} licences expiring soon:`);
expiring.forEach(licence => {
  console.log(`  - ${licence.licenceType} (#${licence.licenceNumber})`);
  console.log(`    Expires: ${licence.expiryDate.toDateString()}`);
});
```

### Check Upcoming Deadlines

```typescript
// Get all upcoming deadlines
const upcoming = system.getUpcomingDeadlines();

// Get overdue deadlines
const overdue = system.getOverdueDeadlines();

console.log(`Upcoming: ${upcoming.length}, Overdue: ${overdue.length}`);
```

### Complete a Deadline

```typescript
const deadline = system.getUpcomingDeadlines()[0];
system.completeDeadline(deadline.id);
console.log(`Completed: ${deadline.title}`);
```

## API Reference

See [README.md](README.md#api-reference) for complete API documentation.

## Need Help?

- See the [README.md](README.md) for detailed documentation
- Run the demo: `npx ts-node src/demo.ts`
- Check the tests: `src/__tests__/TrackingSystem.test.ts`
