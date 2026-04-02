# Croc Consulting - Product Requirements Document

## Original Problem Statement
Build a React single-page application for Croc Consulting - a procurement consultancy website with quote management portal. Three main views: marketing landing page, quote submission portal, and quote viewing/management portal. All inline styles, FastAPI backend with MongoDB persistence.

## Architecture
- **Frontend**: React SPA (monolithic App.js) with inline styles
- **Backend**: FastAPI with MongoDB
- **Database**: MongoDB with collections for quotes, submissions, clients, contacts
- **AI Integration**: OpenAI GPT-4o via Emergent LLM Key for RFQ generation

## User Personas
1. **Prospective Client**: Views marketing site, submits quote requests
2. **Existing Client (Ergon Energy)**: Logs in to view quotes, approve quotes, respond to RFIs
3. **Adam Croxton (Admin)**: Receives contact forms, manages quotes (future admin panel)

## Core Requirements (Static)
- Marketing landing page with Hero, Services, How it works, About, Suppliers, CTA, Footer
- Booking modal for appointment requests
- Quote Submit Portal (upload documents or fill out line items)
- Quote View Portal with authentication
- Quote detail view with progress tracking, line items, RFI management
- AI-powered RFQ document generation
- Data persistence in MongoDB

## What's Been Implemented (April 2, 2026)
- [x] Complete marketing landing page with all sections
- [x] Booking modal with form submission
- [x] Quote Submit Portal (upload and fillout tabs)
- [x] Quote View Portal with login
- [x] Quote detail view with Progress, Line items, RFI tabs
- [x] RFI response functionality
- [x] Quote approval functionality
- [x] AI quote generation using OpenAI GPT-4o
- [x] Database seeding with demo client and 3 quotes
- [x] All inline styles as per specification
- [x] No em dashes in codebase

## API Endpoints
- `GET /api/` - Health check
- `POST /api/auth/login` - Client authentication
- `GET /api/quotes/{client_id}` - Get client quotes
- `GET /api/quote/{quote_id}` - Get single quote
- `POST /api/quote/{quote_id}/approve` - Approve quote
- `POST /api/quote/{quote_id}/rfi/{rfi_index}/respond` - Respond to RFI
- `GET /api/submissions/{client_id}` - Get client submissions
- `POST /api/submissions` - Create submission
- `POST /api/contact` - Submit contact form
- `POST /api/ai/generate` - Generate AI quote
- `POST /api/upload` - Upload files

## Prioritized Backlog
### P0 (Critical)
- All core features implemented

### P1 (High)
- Email notifications for form submissions (SendGrid integration ready)
- Admin panel for Adam to manage quotes
- File upload storage (currently on disk, could move to S3)

### P2 (Medium)
- Password reset functionality
- Multiple client support
- Quote revision history
- PDF export of quotes

## Next Tasks
1. Add email notifications when forms are submitted
2. Build admin dashboard for quote management
3. Implement file storage on cloud (S3/GCS)
4. Add more client accounts
