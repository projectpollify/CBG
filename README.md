# Cutting Board Guys Platform

**Status: COMPLETE & PRODUCTION-READY**

A comprehensive business management platform for Cutting Board Guys franchise operations, streamlining customer management, invoicing, and business operations across multiple regions.

## Project Overview

The Cutting Board Guys Platform is a full-stack business management system designed specifically for franchise operations in the food service industry. Built with modern technologies and enterprise-level architecture, this platform handles everything from customer relationships to financial reporting.

### Key Achievements
- **790+ Customers** successfully imported and managed
- **46 Regions** automatically detected and organized  
- **Complete Invoice System** with auto-numbering (starting at 10001)
- **Tax Compliance** with GST (5%) and PST (7%) calculations for BC
- **Professional Email Integration** using Resend for invoice delivery
- **Multi-Payment Support** (Cash, Cheque, E-Transfer, Credit Card, Debit)

## Features

### Dashboard
- Real-time business statistics
- Revenue tracking and summaries
- Customer activity monitoring
- Quick access to all modules

### Customer Management
- Complete CRUD operations
- Advanced search and filtering by name, region, status
- Bulk import capabilities
- Customer history tracking
- Regional organization

### Invoice Management  
- Professional invoice creation with line items
- Auto-incrementing invoice numbers
- 6 service types with configurable pricing:
  - Resurfacing ($0.065/sq inch)
  - New Board ($0.10/sq inch)
  - Stainless Insert ($450)
  - Stainless Clamps ($125)
  - Board Modifications (custom)
  - Special Services (custom)
- Email delivery with custom templates
- Payment tracking and status management
- Draft to Sent to Paid to Overdue workflow

### Appointment System
- Calendar integration
- Service scheduling
- Delivery and pickup coordination
- Customer appointment history

### Business Settings
- Company information management
- Tax rate configuration
- Service pricing controls
- Invoice defaults and templates
- Multi-region support for franchises

### Reports & Analytics
- Sales summaries by period
- Tax reports (GST/PST breakdown)
- Customer analytics
- Revenue forecasting
- CSV export functionality

### Authentication & Security
- JWT-based authentication
- Role-based access control (Owner, Manager, Franchisee, Employee, Viewer)
- Secure session management
- Audit logging for compliance

## Technical Stack

### Frontend
- **Framework:** Next.js 14.0.4
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom components with Lucide icons
- **Calendar:** FullCalendar integration
- **State Management:** React hooks

### Backend  
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Email:** Resend API
- **Authentication:** JWT

### Infrastructure
- **Monorepo Structure:** Frontend, Backend, and Shared packages
- **Type Safety:** Shared TypeScript definitions
- **Database Migrations:** Prisma migrations
- **Environment Managment:** dotenv

## Project Structure
```
cutting-board-guys/
├── frontend/              # Next.js web application
│   ├── src/app/          # App router pages
│   ├── src/components/   # Reusable components
│   └── src/styles/       # Global styles
├── backend/              # Express API server
│   ├── src/routes/       # API endpoints
│   ├── src/services/     # Business logic
│   ├── src/controllers/  # Request handlers
│   └── prisma/           # Database schema
├── shared/               # Shared TypeScript types
└── scripts/              # Utility scripts
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Resend API key for email functionality

### Installation

1. Clone the repository:
```bash
git clone https://github.com/[your-username]/cutting-board-guys.git
cd cutting-board-guys
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/cbg_db"
JWT_SECRET="your-secret-key"
RESEND_API_KEY="your-resend-api-key"

# Frontend (.env.local)
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

4. Set up the database:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

5. Import customer data (optional):
```bash
npm run import:customers
```

6. Start the development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Deployment

### Recommended Platforms (Next.js Optimized)
- **Vercel** - One-click deploy from GitHub
- **Netlify** - Drag-and-drop deployment
- **Railway** - Full-stack hosting with database

### Environment Variables for Production
```bash
NODE_ENV=production
DATABASE_URL=your_production_db_url
JWT_SECRET=strong_secret_key
RESEND_API_KEY=your_resend_key
```

## Database Schema

The platform uses a comprehensive database structure including:
- User management with role-based permissions
- Customer records with full contact information
- Invoice system with line items (JSON)
- Appointment scheduling
- Settings and configuration
- Audit logging and history tracking
- Archive system for data retention

## Brand Implementation

- **Primary Color:** Navy (#003F7F)
- **Accent Color:** Orange (#FF6B35)
- **Professional, clean interface**
- **Responsive design for all devices**
- **Consistent branding throughout**

## Project Statistics

- **Modules Completed:** 4 of 4 core modules
- **Total Customers:** 790+
- **Regions Supported:** 46
- **Service Types:** 6
- **Payment Methods:** 5
- **User Roles:** 5
- **API Endpoints:** 25+
- **Database Tables:** 15+

## Version History

- **v1.0.0** - Complete platform release
  - Full customer management system
  - Complete invoicing with email delivery
  - Business settings and configuration
  - Reports and analytics
  - Authentication and security

## Team

**Cutting Board Guys Development Team**
- Platform architecture and development
- Business logic implementation
- UI/UX design
- Database design and optimization

## License

Proprietary - Cutting Board Guys Franchise Operations

## Acknowledgments

Special thanks to:
- The franchise owners for their requirements and feedback
- All 790+ customers whose data helped shape the platform
- The development team for turning vision into reality

## Support

For platform support or questions:
- Email: support@cuttingboardguys.ca
- Documentation: [Internal Wiki]
- Issue Tracking: [GitHub Issues]

---

**Platform Status: COMPLETE and OPERATIONAL**

Built with dedication to help Cutting Board Guys franchisees run their businesses more efficiently. From customer management to invoice delivery, every feature has been crafted with the end user in mind.

*Ready for deployment. Ready for business. Ready to scale.*