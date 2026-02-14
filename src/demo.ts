/**
 * Demo: Legal Hub Tracking System
 * 
 * This example demonstrates the key features of the tracking system:
 * - Creating matters and deadlines
 * - Tracking licences and registrations
 * - Analyzing documents to extract deadlines
 * - Automated reminder notifications
 */

import { TrackingSystem, NotificationChannel, DeadlineType, Priority } from './index';

async function runDemo() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        Legal Hub - Smart Tracking System Demo             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Initialize the tracking system
  const system = new TrackingSystem();

  // ==================== Step 1: Register Users ====================
  console.log('📋 Step 1: Registering clients and lawyers...\n');

  system.registerClient({
    id: 'client-001',
    name: 'Acme Corporation',
    email: 'legal@acmecorp.com',
    phone: '+1-555-0100',
    organization: 'Acme Corporation',
    notificationPreferences: [NotificationChannel.EMAIL, NotificationChannel.IN_APP]
  });

  system.registerLawyer({
    id: 'lawyer-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@lawfirm.com',
    phone: '+1-555-0200',
    specialization: 'Corporate Law',
    notificationPreferences: [NotificationChannel.EMAIL, NotificationChannel.IN_APP]
  });

  console.log('✅ Registered client: Acme Corporation');
  console.log('✅ Registered lawyer: Sarah Johnson\n');

  // ==================== Step 2: Create Matter ====================
  console.log('📋 Step 2: Creating a legal matter...\n');

  const matter = system.createMatter(
    'Corporate Merger - Acme & TechStart',
    'Due diligence and regulatory filings for corporate merger',
    'client-001',
    'lawyer-001'
  );

  console.log(`✅ Created matter: ${matter.title} (ID: ${matter.id})\n`);

  // ==================== Step 3: Add Manual Deadlines ====================
  console.log('📋 Step 3: Adding deadlines to the matter...\n');

  const filingDeadline = system.createDeadline(
    matter.id,
    DeadlineType.FILING,
    'SEC Filing Deadline',
    'Submit Form 8-K to Securities and Exchange Commission',
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    Priority.CRITICAL,
    [7, 3, 1]
  );

  const hearingDate = system.createDeadline(
    matter.id,
    DeadlineType.HEARING,
    'Regulatory Hearing',
    'Attend regulatory approval hearing at state office',
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    Priority.HIGH,
    [7, 3, 1]
  );

  console.log(`✅ Added filing deadline: ${filingDeadline.title}`);
  console.log(`✅ Added hearing deadline: ${hearingDate.title}\n`);

  // ==================== Step 4: Analyze Document for Deadlines ====================
  console.log('📋 Step 4: Analyzing matter documents for deadlines...\n');

  const matterDocument = `
    LEGAL MATTER SUMMARY
    ====================
    
    This document outlines key dates for the Acme-TechStart merger:
    
    1. Response due for antitrust inquiry by 03/20/2026
    2. Financial disclosure filing deadline is 03/25/2026
    3. Board approval hearing scheduled for 04/10/2026
    4. Final contract renewal by 05/01/2026
  `;

  const extractedCount = system.analyzeMatterFile(
    matter.id,
    matterDocument,
    'merger-timeline.txt'
  );

  console.log(`✅ Analyzed document and auto-created ${extractedCount} deadline(s)\n`);

  // ==================== Step 5: Register Licence ====================
  console.log('📋 Step 5: Registering business licence...\n');

  const licence = system.registerLicence(
    'client-001',
    'Business Operating Licence',
    'BOL-2024-12345',
    new Date('2024-01-15'),
    new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // Expires in 25 days
    'State Business Authority',
    matter.id
  );

  console.log(`✅ Registered licence: ${licence.licenceType} (#${licence.licenceNumber})`);
  console.log(`   Expires: ${licence.expiryDate.toDateString()}\n`);

  // ==================== Step 6: Analyze Licence Document ====================
  console.log('📋 Step 6: Analyzing licence document...\n');

  const licenceDocument = `
    BUSINESS LICENCE CERTIFICATE
    ============================
    
    Licence Number: ENV-2024-67890
    Type: Environmental Compliance Licence
    Issued Date: 01/20/2024
    Expiry Date: 02/28/2026
    Issuing Authority: Environmental Protection Agency
  `;

  const licenceInfo = system.analyzeLicenceDocument(licenceDocument);
  console.log('✅ Extracted licence information:');
  console.log(`   Number: ${licenceInfo.licenceNumber}`);
  console.log(`   Type: ${licenceInfo.licenceType}`);
  console.log(`   Expiry: ${licenceInfo.expiryDate?.toDateString()}\n`);

  // ==================== Step 7: Register Registration ====================
  console.log('📋 Step 7: Registering business registration...\n');

  const registration = system.registerRegistration(
    'client-001',
    'Corporate Registration',
    'CR-2024-ABC123',
    new Date('2024-01-10'),
    'State Corporate Registry',
    new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // Expires in 20 days
    matter.id
  );

  console.log(`✅ Registered: ${registration.registrationType} (#${registration.registrationNumber})`);
  console.log(`   Expires: ${registration.expiryDate?.toDateString()}\n`);

  // ==================== Step 8: View Dashboard ====================
  console.log('📋 Step 8: Viewing dashboard summary...\n');

  const dashboard = system.getDashboard();
  
  console.log('═══════════════════════ DASHBOARD ═══════════════════════\n');
  console.log('📊 CASELOAD SUMMARY:');
  console.log(`   Active Matters: ${dashboard.caseload.totalActiveMatters}`);
  console.log(`   Upcoming Deadlines: ${dashboard.caseload.totalUpcomingDeadlines}`);
  console.log(`   Overdue Deadlines: ${dashboard.caseload.totalOverdueDeadlines}`);
  console.log(`   Due This Week: ${dashboard.caseload.deadlinesDueThisWeek}`);
  console.log(`   Critical Priority: ${dashboard.caseload.criticalDeadlines}\n`);

  console.log('📋 LICENCE & REGISTRATION:');
  console.log(`   Total Licences: ${dashboard.licenceReg.totalLicences}`);
  console.log(`   Active Licences: ${dashboard.licenceReg.activeLicences}`);
  console.log(`   Expiring Soon: ${dashboard.licenceReg.expiringLicences}`);
  console.log(`   Total Registrations: ${dashboard.licenceReg.totalRegistrations}`);
  console.log(`   Expiring Soon: ${dashboard.licenceReg.expiringRegistrations}\n`);

  console.log('⚠️  ALERTS:');
  console.log(`   Critical Deadlines: ${dashboard.alerts.criticalDeadlines}`);
  console.log(`   Overdue Items: ${dashboard.alerts.overdueDeadlines}`);
  console.log(`   Licences Expiring: ${dashboard.alerts.expiringLicences}`);
  console.log(`   Registrations Expiring: ${dashboard.alerts.expiringRegistrations}\n`);

  if (dashboard.upcomingDeadlines.length > 0) {
    console.log('📅 UPCOMING DEADLINES:');
    dashboard.upcomingDeadlines.forEach((d, i) => {
      console.log(`   ${i + 1}. ${d.title} (${d.type}) - Due: ${d.dueDate.toDateString()} [${d.priority}]`);
    });
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════\n');

  // ==================== Step 9: Test Reminder System ====================
  console.log('📋 Step 9: Testing automated reminder system...\n');

  console.log('Running manual reminder check...');
  await system.checkReminders();

  // ==================== Step 10: Show Results ====================
  console.log('\n📋 Step 10: Summary of system capabilities...\n');

  console.log('✅ IMPLEMENTED FEATURES:');
  console.log('   ✓ Matter and case management');
  console.log('   ✓ Client and lawyer registration');
  console.log('   ✓ Manual deadline creation');
  console.log('   ✓ Automatic deadline extraction from documents');
  console.log('   ✓ Licence tracking with auto-renewal deadlines');
  console.log('   ✓ Registration tracking with expiry monitoring');
  console.log('   ✓ Document analysis (licences, registrations, matter files)');
  console.log('   ✓ Automated reminder scheduler');
  console.log('   ✓ Multi-channel notifications (Email, SMS, In-App)');
  console.log('   ✓ Caseload and deadline analytics');
  console.log('   ✓ Dashboard with alerts and summaries');
  console.log('   ✓ Overdue deadline tracking');
  console.log('   ✓ Priority-based deadline management\n');

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              Demo completed successfully! ✅                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

// Run the demo
if (require.main === module) {
  runDemo().catch(console.error);
}

export { runDemo };
