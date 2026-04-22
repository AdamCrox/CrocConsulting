# CrocConsulting — Project Constitution

> B.L.A.S.T. Protocol | A.N.T. 3-Layer Architecture
> Last Updated: 2026-04-22

---

## 🏢 Project Identity
**Company**: CrocConsulting
**Mission**: Outsourced procurement for medium and high-voltage (MV/HV) electrical equipment. One call gets you three engineer-backed quotes. Commission-based — no cost to clients.
**Owner**: Adam Croxton (adam.croxton@outlook.com)

---

## 🏗️ Tech Stack (Source of Truth)
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router, JavaScript) |
| Styling | Tailwind CSS + shadcn/ui components |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (magic link + email/password) |
| Storage | Supabase Storage (bucket: `quote-files`) |
| Email | Resend API |
| Hosting | Vercel (region: syd1) |
| Design | Apple-inspired (SF Pro, white space, #0071E3 blue) |

---

## 📐 Data Schemas

### `submissions` table
```
id            UUID PK
email         TEXT NOT NULL
company       TEXT
contact_name  TEXT
phone         TEXT
equipment_type TEXT
voltage_level  TEXT
quantity      INTEGER
details       JSONB
files         TEXT[]       -- Supabase Storage URLs
status        TEXT         -- 'pending' | 'accepted' | 'rejected'
created_at    TIMESTAMPTZ
```

### `clients` table
```
id         UUID PK
email      TEXT UNIQUE NOT NULL
name       TEXT
company    TEXT
created_at TIMESTAMPTZ
```

### `quotes` table
```
id            UUID PK
client_id     UUID FK → clients.id
submission_id UUID FK → submissions.id
status        TEXT        -- 'stage_1' through 'stage_7' | 'complete'
current_stage INTEGER     -- 1–7
details       JSONB
created_at    TIMESTAMPTZ
updated_at    TIMESTAMPTZ
```

### `quote_stages` table
```
id           UUID PK
quote_id     UUID FK → quotes.id
stage_number INTEGER     -- 1–7
stage_name   TEXT
completed    BOOLEAN
completed_at TIMESTAMPTZ
notes        TEXT
```

### `contacts` table
```
id         UUID PK
name       TEXT
email      TEXT NOT NULL
message    TEXT
created_at TIMESTAMPTZ
```

---

## 🔐 Auth Rules (Invariants — Do Not Break)
1. **Quote submission**: Email magic link only — no password required to submit a quote
2. **Client portal**: Email + password — credentials are created by admin only, never self-registered
3. **Admin**: Supabase Auth user with `app_metadata.role = 'admin'`
4. **RLS**: All tables enforce Row Level Security — never bypass with service role in client-side code

---

## 🎨 Design System (Apple-Inspired)
```
Background:       #FFFFFF
Surface:          #F5F5F7
Text Primary:     #1D1D1F
Text Secondary:   #6E6E73
Accent (CTA):     #0071E3
Accent Hover:     #0077ED
Success:          #30D158
Danger:           #FF3B30
Border:           #D2D2D7

Font:  SF Pro Display / SF Pro Text / Helvetica Neue / Arial
Hero:  56px bold
H2:    32px semibold
Body:  17px regular
Small: 13px regular

Cards:   border-radius: 18px, shadow: 0 2px 12px rgba(0,0,0,0.08)
Buttons: pill-shaped, 48px height, #0071E3 fill
Nav:     sticky, backdrop-filter: blur(20px)
```

---

## ⚙️ Behavioral Rules
- Blue (`#0071E3`) is reserved for primary CTAs only — never decorative
- Admin email for all notifications: `adam.croxton@outlook.com`
- Quote stages are always 7 — never skip or reorder
- A client account is ONLY created after admin explicitly approves a submission
- Files uploaded during quote submission go to Supabase Storage `quote-files` bucket
- All API routes use the Supabase service role key (server-side only, never exposed to client)

---

## 🗂️ Stage Names (7-Stage Progress Tracker)
1. Quote Received
2. Initial Review
3. Supplier Outreach
4. Quotes Gathered
5. Engineering Review
6. Quote Prepared
7. Quote Delivered

---

## 📁 Project Structure
```
CrocConsulting/
├── claude.md              ← This file (Project Constitution)
├── task_plan.md           ← Blueprint phases & checklists
├── findings.md            ← Research & discoveries
├── progress.md            ← Progress log
├── architecture/          ← Layer 1: SOPs
├── tools/                 ← Layer 3: Scripts & migrations
├── .tmp/                  ← Temporary workbench
├── nextjs-app/            ← Production Next.js application
├── frontend/              ← Original React app (reference only)
└── backend/               ← Original FastAPI (reference only)
```
