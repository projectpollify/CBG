import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedInvoiceSettings() {
  console.log('Seeding invoice settings...');

  const settings = [
    {
      category: 'invoice',
      key: 'company_info',
      value: {
        name: 'Cutting Board Guys B.C inc.',
        address: '701 West Georgia suite 1400',
        city: 'Vancouver',
        province: 'B.C.',
        postalCode: 'V7Y1C6',
        email: 'info@cuttingboardguys.ca',
        phone: '604 468 8234',
        website: 'cuttingboardguys.ca',
        gstNumber: '756290169RT0001'
      },
      description: 'Company information for invoices',
      isSystem: true
    },
    {
      category: 'invoice',
      key: 'service_pricing',
      value: {
        RESURFACING: {
          unitPrice: 0.065,
          description: 'Board resurfacing service'
        },
        NEW_BOARD: {
          unitPrice: 0.10,
          description: 'New cutting board sales'
        },
        STAINLESS_INSERT: {
          unitPrice: 450.00,
          description: 'Stainless steel insert installation'
        },
        STAINLESS_CLAMPS: {
          unitPrice: 25.00,
          description: 'Stainless steel clamps'
        },
        BOARD_MODIFICATIONS: {
          unitPrice: 10.00,
          description: 'Board modifications and customization'
        },
        SPECIAL: {
          unitPrice: 25.00,
          description: 'Special services'
        }
      },
      description: 'Default pricing for services',
      isSystem: true
    },
    {
      category: 'invoice',
      key: 'tax_rates',
      value: {
        gst: 0.05,
        pst: 0.07
      },
      description: 'Tax rates for invoices',
      isSystem: true
    },
    {
      category: 'invoice',
      key: 'defaults',
      value: {
        paymentTermsDays: 30,
        defaultNotes: 'Thank you for your business!',
        emailSubject: 'Invoice #{invoiceNumber} from Cutting Board Guys',
        emailBody: 'Please find attached your invoice. Payment is due within {paymentTerms} days.'
      },
      description: 'Default invoice settings',
      isSystem: false
    }
  ];

  for (const setting of settings) {
    const existing = await prisma.settings.findFirst({
      where: {
        category: setting.category,
        key: setting.key,
        regionId: null
      }
    });

    if (existing) {
      await prisma.settings.update({
        where: { id: existing.id },
        data: {
          value: setting.value,
          description: setting.description,
          isSystem: setting.isSystem
        }
      });
    } else {
      await prisma.settings.create({
        data: {
          ...setting,
          regionId: null
        }
      });
    }
  }

  const regions = ['BC', 'AB', 'SK'];
  
  for (const regionId of regions) {
    await prisma.invoiceSequence.upsert({
      where: { regionId },
      update: {},
      create: {
        regionId,
        lastInvoiceNumber: 10000,
        prefix: null,
        suffix: null
      }
    });
  }

  console.log('Invoice settings seeded successfully!');
}

seedInvoiceSettings()
  .catch((e) => {
    console.error('Error seeding invoice settings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });