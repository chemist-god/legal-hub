# Legal Hub - Smart Tracking System

A comprehensive tracking system for legal matter deadlines, licence renewals, and registration timelines. This system helps lawyers and clients avoid missed deadlines and potential legal consequences through automated monitoring and notifications.

## Features

### 📋 Matter & Case Management
- Create and track legal matters with client and lawyer assignments
- Monitor caseload with real-time status updates
- Track active, pending, closed, and on-hold matters
- Link deadlines, licences, and registrations to specific matters

### ⏰ Deadline Tracking
- Manual deadline creation with customizable reminder schedules
- Automatic deadline extraction from matter documents
- Support for various deadline types:
  - Filing deadlines
  - Hearing dates
  - Response due dates
  - Renewal deadlines
  - Registration deadlines
  - Regulatory updates
  - Licence expiry dates
- Priority-based deadline management (Critical, High, Medium, Low)
- Overdue deadline detection and tracking
- Completion tracking and status updates

### 📜 Licence Management
- Register and track business licences
- Automatic expiry date monitoring
- Status tracking (Active, Pending Renewal, Expired)
- Auto-creation of renewal deadlines
- Document analysis to extract licence information
- Multi-day reminder schedules for expiring licences

### 📝 Registration Tracking
- Track business registrations and corporate filings
- Expiry date monitoring for time-sensitive registrations
- Status management (Active, Pending, Expired)
- Automatic renewal deadline creation
- Document parsing to extract registration details

### 🔔 Notification System
- Multi-channel notifications:
  - Email notifications
  - SMS alerts
  - In-app notifications
- Customizable notification preferences per user
- Automated reminders based on configurable schedules
- Separate notifications for clients and lawyers
- Detailed deadline information in each notification

### 🤖 Automated Reminder Scheduler
- Daily automated checks for upcoming deadlines
- Configurable reminder schedules (e.g., 90, 60, 30, 14, 7, 3, 1 days before)
- Smart notification timing to avoid duplicates
- Licence expiry alerts (30-day advance warning)
- Registration renewal reminders
- Manual trigger option for immediate checks

### 📊 Analytics & Dashboard
- Comprehensive caseload summary
- Upcoming deadline overview
- Overdue deadline tracking
- Critical deadline alerts
- Licence and registration statistics
- Visual dashboard with key metrics

### 🔍 Document Analysis
- Automatic deadline extraction from matter files
- Licence document parsing
- Registration document analysis
- Intelligent date recognition (multiple formats)
- Context extraction for better understanding

## Installation

```bash
# Clone the repository
git clone https://github.com/chemist-god/legal-hub.git
cd legal-hub

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Basic Example

```typescript
import { TrackingSystem, DeadlineType, Priority, NotificationChannel } from 'legal-hub';

// Initialize the tracking system
const system = new TrackingSystem();

// Register a client
system.registerClient({
  id: 'client-001',
  name: 'Acme Corporation',
  email: 'legal@acmecorp.com',
  notificationPreferences: [NotificationChannel.EMAIL]
});

// Register a lawyer
system.registerLawyer({
  id: 'lawyer-001',
  name: 'Sarah Johnson',
  email: 'sarah@lawfirm.com',
  notificationPreferences: [NotificationChannel.EMAIL, NotificationChannel.IN_APP]
});

// Create a matter
const matter = system.createMatter(
  'Corporate Merger',
  'Due diligence for corporate merger',
  'client-001',
  'lawyer-001'
);

// Add a deadline
const deadline = system.createDeadline(
  matter.id,
  DeadlineType.FILING,
  'SEC Filing Deadline',
  'Submit Form 8-K to SEC',
  new Date('2026-03-15'),
  Priority.CRITICAL,
  [7, 3, 1] // Remind 7, 3, and 1 day before
);

// Register a licence
const licence = system.registerLicence(
  'client-001',
  'Business Operating Licence',
  'BOL-2024-12345',
  new Date('2024-01-15'),
  new Date('2026-01-15'),
  'State Business Authority',
  matter.id // Optional: link to matter for automatic deadline creation
);

// Start the automated reminder system
system.startReminderScheduler();

// Get dashboard summary
const dashboard = system.getDashboard();
console.log(dashboard);
```

### Document Analysis

```typescript
// Analyze a matter document to extract deadlines
const matterDocument = `
  Important dates:
  - Filing deadline: 03/15/2026
  - Hearing scheduled: 04/20/2026
  - Response due: 03/01/2026
`;

const extractedCount = system.analyzeMatterFile(
  matter.id,
  matterDocument,
  'case-timeline.txt'
);
console.log(`Extracted ${extractedCount} deadlines`);

// Analyze a licence document
const licenceDoc = `
  Licence Number: LIC-123456
  Type: Business Operating Licence
  Expiry Date: 12/31/2026
`;

const licenceInfo = system.analyzeLicenceDocument(licenceDoc);
console.log(licenceInfo);
```

### Manual Reminder Check

```typescript
// Manually trigger a reminder check
await system.checkReminders();
```

## Running the Demo

```bash
# Run the interactive demo
npm run dev

# Or directly with ts-node
npx ts-node src/demo.ts
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## API Reference

### TrackingSystem

Main class that orchestrates all tracking services.

#### Client & Lawyer Management
- `registerClient(client: Client): void`
- `registerLawyer(lawyer: Lawyer): void`

#### Matter Management
- `createMatter(title, description, clientId, lawyerId): Matter`
- `getMatter(id): Matter | undefined`
- `getActiveMatters(): Matter[]`

#### Deadline Management
- `createDeadline(matterId, type, title, description, dueDate, priority, reminderDays?): Deadline`
- `analyzeMatterFile(matterId, fileContent, fileName): number`
- `getUpcomingDeadlines(): Deadline[]`
- `getOverdueDeadlines(): Deadline[]`
- `completeDeadline(id): Deadline | undefined`

#### Licence Management
- `registerLicence(clientId, licenceType, licenceNumber, issueDate, expiryDate, authority, matterId?): Licence`
- `analyzeLicenceDocument(content): LicenceInfo`
- `getLicencesExpiringWithinDays(days): Licence[]`

#### Registration Management
- `registerRegistration(clientId, type, number, date, authority, expiryDate?, matterId?): Registration`
- `analyzeRegistrationDocument(content): RegistrationInfo`
- `getRegistrationsExpiringWithinDays(days): Registration[]`

#### Reminder & Notification
- `startReminderScheduler(): void`
- `stopReminderScheduler(): void`
- `checkReminders(): Promise<void>`

#### Analytics
- `getCaseloadSummary(): CaseloadSummary`
- `getLicenceRegistrationSummary(): LicenceRegSummary`
- `getDashboard(): Dashboard`

## Architecture

```
legal-hub/
├── src/
│   ├── models/
│   │   └── types.ts           # Core type definitions
│   ├── services/
│   │   ├── MatterService.ts   # Matter management
│   │   ├── DeadlineService.ts # Deadline tracking
│   │   ├── NotificationService.ts # Notifications
│   │   └── LicenceRegistrationService.ts # Licence/registration tracking
│   ├── utils/
│   │   ├── DeadlineAnalyzer.ts # Document analysis
│   │   └── ReminderScheduler.ts # Automated reminders
│   ├── TrackingSystem.ts      # Main system class
│   ├── index.ts               # Public API exports
│   └── demo.ts                # Demo application
├── __tests__/
│   └── TrackingSystem.test.ts # Comprehensive tests
└── package.json
```

## Requirements Met

✅ **Analyze matter files, business licences and registrations**
- Document analysis with automatic deadline extraction
- Licence document parsing
- Registration document analysis
- Intelligent date recognition

✅ **Automatically notify both clients and lawyers**
- Multi-channel notifications (Email, SMS, In-App)
- Separate notifications for clients and lawyers
- Customizable notification preferences

✅ **Track caseload, live matters and deadlines**
- Complete matter lifecycle tracking
- Real-time deadline monitoring
- Caseload analytics and summaries

✅ **Provide reminders**
- Automated daily reminder checks
- Configurable reminder schedules
- Multiple reminders per deadline

✅ **Generate alerts for renewals, required filings and regulatory updates**
- Licence expiry alerts
- Registration renewal notifications
- Filing deadline reminders
- Regulatory update tracking

## License

Apache-2.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
