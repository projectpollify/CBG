import { PrismaClient as SqliteClient } from '@prisma/client';
import { PrismaClient as PostgresClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// SQLite client (current database)
const sqliteClient = new SqliteClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

// PostgreSQL client (target database from Railway)
const postgresClient = new PostgresClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function migrateData() {
  try {
    console.log('🚀 Starting migration from SQLite to PostgreSQL...');
    
    // Check PostgreSQL connection
    await postgresClient.$connect();
    console.log('✅ Connected to PostgreSQL');

    // 1. Migrate Customers
    console.log('\n📦 Migrating customers...');
    const customers = await sqliteClient.customer.findMany();
    console.log(`Found ${customers.length} customers to migrate`);

    for (const customer of customers) {
      try {
        await postgresClient.customer.upsert({
          where: { id: customer.id },
          update: customer,
          create: customer
        });
      } catch (error) {
        console.error(`Failed to migrate customer ${customer.businessName}:`, error);
      }
    }
    console.log(`✅ Migrated ${customers.length} customers`);

    // 2. Migrate Users
    console.log('\n👥 Migrating users...');
    const users = await sqliteClient.user.findMany();
    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      try {
        await postgresClient.user.upsert({
          where: { id: user.id },
          update: user,
          create: user
        });
      } catch (error) {
        console.error(`Failed to migrate user ${user.email}:`, error);
      }
    }
    console.log(`✅ Migrated ${users.length} users`);

    // 3. Migrate Invoices
    console.log('\n📄 Migrating invoices...');
    const invoices = await sqliteClient.invoice.findMany();
    console.log(`Found ${invoices.length} invoices to migrate`);

    for (const invoice of invoices) {
      try {
        await postgresClient.invoice.upsert({
          where: { id: invoice.id },
          update: invoice,
          create: invoice
        });
      } catch (error) {
        console.error(`Failed to migrate invoice ${invoice.invoiceNumber}:`, error);
      }
    }
    console.log(`✅ Migrated ${invoices.length} invoices`);

    // 4. Migrate Invoice Sequences
    console.log('\n🔢 Migrating invoice sequences...');
    const sequences = await sqliteClient.invoiceSequence.findMany();
    
    for (const sequence of sequences) {
      try {
        await postgresClient.invoiceSequence.upsert({
          where: { id: sequence.id },
          update: sequence,
          create: sequence
        });
      } catch (error) {
        console.error(`Failed to migrate sequence:`, error);
      }
    }
    console.log(`✅ Migrated ${sequences.length} invoice sequences`);

    // 5. Migrate Appointments
    console.log('\n📅 Migrating appointments...');
    const appointments = await sqliteClient.appointment.findMany();
    console.log(`Found ${appointments.length} appointments to migrate`);

    for (const appointment of appointments) {
      try {
        await postgresClient.appointment.upsert({
          where: { id: appointment.id },
          update: appointment,
          create: appointment
        });
      } catch (error) {
        console.error(`Failed to migrate appointment ${appointment.title}:`, error);
      }
    }
    console.log(`✅ Migrated ${appointments.length} appointments`);

    // 6. Migrate Settings
    console.log('\n⚙️  Migrating settings...');
    const settings = await sqliteClient.settings.findMany();
    
    for (const setting of settings) {
      try {
        await postgresClient.settings.upsert({
          where: { 
            category_key_regionId: {
              category: setting.category,
              key: setting.key,
              regionId: setting.regionId
            }
          },
          update: setting,
          create: setting
        });
      } catch (error) {
        console.error(`Failed to migrate setting ${setting.key}:`, error);
      }
    }
    console.log(`✅ Migrated ${settings.length} settings`);

    console.log('\n🎉 Migration completed successfully!');
    
    // Create summary report
    const summary = {
      timestamp: new Date().toISOString(),
      customers: customers.length,
      users: users.length,
      invoices: invoices.length,
      appointments: appointments.length,
      settings: settings.length,
      sequences: sequences.length
    };

    // Save summary to file
    const summaryPath = path.join(__dirname, '..', 'migration-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`\n📊 Migration summary saved to: ${summaryPath}`);
    console.log(summary);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

// Run migration
migrateData();