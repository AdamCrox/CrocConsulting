# Croc Consulting - Product Requirements Document

## Original Problem Statement
Build a React single-page application for Croc Consulting - a procurement consultancy website with quote management portal. Three main views: marketing landing page, quote submission portal, and quote viewing/management portal. All inline styles, FastAPI backend with MongoDB persistence.

## Architecture
- **Frontend**: React SPA (monolithic App.js) with inline styles
- **Backend**: FastAPI with MongoDB
- **Database**: MongoDB with collections for quotes, submissions, clients, contacts
- **AI Integration**: OpenAI GPT-4o for RFQ generation
- **Deployment**: Zeabur (Docker containers)

## User Personas
1. **Prospective Client**: Views marketing site, submits quote requests
2. **Existing Client (Ergon Energy)**: Logs in to view quotes, approve quotes, respond to RFIs
3. **Adam Croxton (Admin)**: Receives contact forms, manages quotes

## Core Requirements (Static)
- Marketing landing page with Hero, Services, How it works, About, Suppliers, CTA, Footer
- Booking modal for appointment requests
- Quote Submit Portal (upload documents or fill out line items)
- Quote View Portal with authentication
- Quote detail view with progress tracking, line items, RFI management
- AI-powered RFQ document generation
- Data persistence in MongoDB

## What's Been Implemented (April 3, 2026)
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
- [x] Zeabur deployment structure created

## API Endpoints (Zeabur)
- `GET /` - Health check
- `POST /auth/login` - Client authentication
- `GET /quotes/{client_id}` - Get client quotes
- `GET /quotes/detail/{quote_id}` - Get single quote
- `POST /quotes/{quote_id}/approve` - Approve quote
- `POST /quotes/{quote_id}/rfi/{rfi_index}/respond` - Respond to RFI
- `GET /submissions/{client_id}` - Get client submissions
- `POST /submissions` - Create submission
- `POST /submissions/upload` - Upload files
- `POST /submissions/{submission_id}/generate-ai` - Generate AI quote
- `PUT /submissions/{submission_id}/ai-output` - Save edited AI output
- `POST /contact` - Submit contact form

## MongoDB Collections
- `clients`: client_id, password, company, created_at
- `quotes`: id, client_id, project, type, date_raised, expiry_date, current_step, items, rfi, approved
- `submissions`: id, client_id, tab, contact, files, items, status, ai_output
- `contacts`: name, email, company, phone, message, created_at

## Zeabur Deployment Structure
```
croc-consulting/
  frontend/
    package.json
    src/App.js
    src/index.js
    public/index.html
    nginx.conf
    Dockerfile
  backend/
    requirements.txt
    main.py
    seed.py
    Dockerfile
  docker-compose.yml
  README.md
```

## Environment Variables (Zeabur)
**Backend:**
- MONGODB_URI (auto from Zeabur MongoDB add-on)
- DATABASE_NAME: croc_consulting
- OPENAI_API_KEY
- ALLOWED_ORIGINS

**Frontend:**
- REACT_APP_API_URL: /api

## Prioritized Backlog
### P0 (Critical) - DONE
- All core features implemented

### P1 (High)
- Email notifications for form submissions (SendGrid integration ready)
- Admin panel for Adam to manage quotes

### P2 (Medium)
- Password reset functionality
- Multiple client support
- Quote revision history
- PDF export of quotes

## Next Tasks
1. Push to GitHub (jaredcroxton/croc-consulting)
2. Deploy to Zeabur
3. Add email notifications
4. Build admin dashboard
