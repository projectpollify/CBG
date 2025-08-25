# Cutting Board Guys - Calendar Integration Project Brief

## Project Context
I'm building a business management system for Cutting Board Guys, a franchise business that resurfaces cutting boards. The project is located at `/Users/shawn/Desktop/CBG/CBG-new/` and uses a modern tech stack.

## Current Tech Stack
### Frontend
- **Next.js 14.0.4** with TypeScript
- **React 18.2.0**
- **TailwindCSS 3.4.0** for styling
- **Zustand 4.4.7** for state management
- **Lucide React** for icons
- **date-fns 2.30.0** for date utilities (already installed!)

### Backend
- **Express** with TypeScript
- **Prisma ORM** with PostgreSQL
- **Node.js** runtime
- Port 3001 for API

## Completed Features ✅
1. **Customer Management** 
   - Full CRUD operations
   - 791 customers imported
   - Optional address fields

2. **Invoice System**
   - Create, edit, view invoices
   - Auto-numbering (starts at 10001)
   - Service types: RESURFACING ($0.065/sqin), NEW_BOARD ($0.10/sqin), etc.
   - Tax calculations (GST 5% + PST 7%)
   - Status workflow: DRAFT → SENT → PAID → OVERDUE

3. **Reports Module**
   - Sales summaries
   - Tax reports
   - CSV export functionality

4. **Settings**
   - Business configuration
   - Service pricing
   - Tax rates

## Project Structure
```
/Users/shawn/Desktop/CBG/CBG-new/
├── frontend/
│   └── src/app/
│       ├── page.tsx (Dashboard - needs calendar)
│       ├── customers/
│       ├── invoices/
│       ├── reports/
│       └── settings/
├── backend/
│   └── src/
│       ├── routes/
│       │   ├── customers.ts
│       │   └── invoices.ts
│       └── services/
└── shared/
    └── src/types/
```

## Calendar Requirements

### Vision
"I always envisioned the monthly calendar window as the main feature of our dashboard"

### Core Features Needed
1. **Monthly Calendar View** (Primary)
   - Display as main dashboard component
   - Show appointments/scheduled services
   - Visual indicators for different service types

2. **Appointment Management**
   - Schedule cutting board pickups
   - Schedule deliveries
   - Recurring appointments for regular clients
   - Service reminders

3. **Standard Calendar Features**
   - Create/edit/delete appointments
   - Drag and drop rescheduling
   - Day/week/month views
   - Color coding by service type or status
   - Quick appointment creation
   - Search and filter capabilities

4. **Business-Specific Features**
   - Link appointments to customers
   - Link appointments to invoices
   - Route optimization for pickups/deliveries
   - Capacity planning (how many boards can be processed)
   - Service time estimates

### Database Considerations
The Prisma schema will need:
- Appointment/Event model
- Recurring appointment support
- Customer relationship
- Invoice relationship
- Service type tracking

## Startup Commands
```bash
# Simple startup script created
./start.sh  # Starts both frontend and backend
./stop.sh   # Stops all servers

# Or manually:
cd backend && npm run dev  # Port 3001
cd frontend && npm run dev # Port 3000
```

## Recent Cleanup
We just removed over-engineered features:
- ❌ ScheduledTasks (automated snapshots)
- ❌ Historical tracking system
- ❌ Complex analytics service

The codebase is now clean and focused on core business needs.

## Calendar Integration Approach

### Recommended Libraries to Consider
Given our stack (Next.js 14, React 18, TypeScript, TailwindCSS):

1. **FullCalendar** (@fullcalendar/react)
   - Most feature-complete
   - Great for business scheduling
   - Supports drag-drop, recurring events
   - Can integrate with TailwindCSS

2. **React Big Calendar**
   - Good for custom styling
   - Works well with date-fns (already installed!)
   - More lightweight than FullCalendar

3. **Custom with date-fns**
   - We already have date-fns
   - Full control over UI/UX
   - Can perfectly match our TailwindCSS design

### Integration Tasks
1. Install chosen calendar library
2. Create Calendar component for dashboard
3. Design appointment/event schema in Prisma
4. Create API endpoints for appointments
5. Implement CRUD operations
6. Add calendar to main dashboard
7. Link with existing customer/invoice systems
8. Add business logic (capacity, routing, etc.)

## Current State
- ✅ Servers running and stable
- ✅ Core business features working
- ✅ Clean, maintainable codebase
- ✅ Ready for calendar integration

## Next Steps Priority
1. Choose calendar library
2. Create database schema for appointments
3. Build calendar UI component
4. Integrate into dashboard as primary feature
5. Connect to customer/invoice workflow

## Important Notes
- Frontend uses `/api` proxy to backend (port 3001)
- Authentication not yet implemented
- Email service ready but needs provider configuration
- The dashboard (frontend/src/app/page.tsx) is where the calendar should be prominently featured

## Question for Implementation
Should the calendar:
1. Be the entire dashboard (replacing current stats)?
2. Be the main feature with stats on the side?
3. Have its own dedicated page with a widget on dashboard?

This is a working system with real customers and invoices. The calendar should integrate smoothly with existing features.