# CrocConsulting — Task Plan (B.L.A.S.T. Blueprint)

> Updated: 2026-04-22

---

## Phase 0: Initialization ✅
- [x] Clone CrocConsulting repo
- [x] Create claude.md (Project Constitution)
- [x] Create task_plan.md, findings.md, progress.md
- [x] Create architecture/ SOPs
- [x] Create tools/migrate_schema.sql

---

## Phase 1: Blueprint — Project Setup
- [ ] Scaffold Next.js 14 app (App Router, JS, Tailwind)
- [ ] Copy shadcn/ui components (53 components from frontend/src/components/ui/)
- [ ] Copy lib/utils.js and hooks/use-toast.js
- [ ] Install Supabase, Resend, and other dependencies
- [ ] Configure Tailwind with Apple design tokens

---

## Phase 2: Link — Supabase + Services
- [ ] Run migrate_schema.sql in Supabase SQL editor
- [ ] Configure Supabase Auth (magic link + email/password)
- [ ] Create Supabase Storage bucket `quote-files`
- [ ] Enable RLS on all tables
- [ ] Set up Resend API for transactional email
- [ ] Verify .env.local variables are set

---

## Phase 3: Architect — Build Pages
- [ ] Homepage (`/`) — marketing, hero, services, founder
- [ ] Quote step 1 (`/quote`) — email entry + magic link
- [ ] Quote step 2 (`/quote/details`) — full quote form + file upload
- [ ] Quote confirmation (`/quote/confirmation`) — success screen
- [ ] Client portal login (`/portal`)
- [ ] Client dashboard (`/portal/dashboard`) — 7-stage progress tracker
- [ ] Admin login (`/admin`)
- [ ] Admin submissions (`/admin/submissions`) — view/approve/reject
- [ ] Admin quotes (`/admin/quotes`) — manage stages
- [ ] Admin clients (`/admin/clients`) — manage accounts

---

## Phase 4: API Routes
- [ ] `POST /api/quote/submit` — store submission + notify admin
- [ ] `POST /api/admin/approve` — create Supabase Auth user + quote record
- [ ] `POST /api/admin/stage` — update quote stage
- [ ] `POST /api/contact` — handle contact form

---

## Phase 5: Stylize — Apple Design Polish
- [ ] Apply design tokens across all pages
- [ ] NavBar with frosted glass effect
- [ ] Hero section with large typography
- [ ] Service cards with rounded corners
- [ ] Responsive mobile layout
- [ ] Dark/light surface contrast

---

## Phase 6: Trigger — Deployment
- [ ] Create vercel.json with syd1 region
- [ ] Connect GitHub repo to Vercel
- [ ] Set environment variables in Vercel dashboard
- [ ] Configure Supabase production settings
- [ ] Deploy and test end-to-end flows
- [ ] Verify all RLS policies with test accounts
