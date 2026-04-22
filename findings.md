# CrocConsulting — Findings & Research

> Updated: 2026-04-22

---

## Existing Codebase Analysis

### Frontend (frontend/)
- **Framework**: React 19 with Create React App + Craco
- **Styling**: Tailwind CSS 3.4.17, shadcn/ui (new-york preset), Radix UI primitives
- **Components**: 53 shadcn/ui components in `frontend/src/components/ui/`
- **All styles are inline in App.js** — no separate stylesheet (noted in App.css)
- **Font stack**: SF Pro Display, Helvetica Neue (already Apple-aligned)
- **Primary color**: #0071E3 (system blue — matches Apple)
- **Existing flows**: QuoteSubmitPortal, QuotePortal (login), ProgressTracker (7 stages), appointment booking modal

### Backend (backend/server.py)
- **Framework**: FastAPI with async/await
- **Database**: MongoDB via Motor (async driver)
- **Auth**: Custom JWT (bcrypt password hashing)
- **AI**: OpenAI GPT-4o for RFQ document generation
- **Email**: Not implemented (was planned)
- **Stripe**: Dependency present but not implemented

### Migration Decisions
| Old | New | Reason |
|-----|-----|--------|
| MongoDB | Supabase PostgreSQL | Vercel-native, relational, built-in auth |
| FastAPI | Next.js API routes | Single deployment unit, serverless |
| Custom JWT | Supabase Auth | Magic link support, better security |
| Zeabur/Docker | Vercel | Client requested |
| nodemailer (missing) | Resend | Modern transactional email API |

### shadcn/ui Reuse
All 53 existing components can be copied directly — they are framework-agnostic (Radix UI + Tailwind). No changes needed for Next.js compatibility.

---

## Apple Design System
- Philosophy: "Premium white space, SF Pro, cinematic imagery"
- SF Pro is a system font on macOS/iOS — falls back to Helvetica Neue on other platforms
- Existing frontend already uses SF Pro in font stack — minimal design migration needed
- Key differentiators from current design: more white space, larger typography hierarchy, pill buttons

---

## Auth Flow Research
- Supabase magic link: sends OTP via email, user redirected to `/auth/callback` with token
- Next.js: use `@supabase/auth-helpers-nextjs` for server components + middleware
- Admin role: set via `supabase.auth.admin.updateUserById()` with `app_metadata: { role: 'admin' }`
- RLS: use `auth.uid()` and `auth.jwt() ->> 'app_metadata' ->> 'role'` in policies

---

## Email Strategy (Resend)
- Resend supports React Email templates — can send HTML emails programmatically
- Free tier: 3,000 emails/month (sufficient for early stage)
- Required emails:
  1. Magic link (handled by Supabase Auth SMTP integration)
  2. Admin notification on new submission
  3. Client credentials after approval
  4. Optional: rejection notification

---

## Constraints & Watchpoints
- **Supabase magic link redirect**: Must configure `Site URL` and `Redirect URLs` in Supabase dashboard
- **Vercel serverless**: API routes have 10s default timeout — file uploads must go direct to Supabase Storage from client
- **RLS service role**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to client — only use in Next.js API routes
- **File uploads**: Use Supabase client-side storage upload (signed URLs), not through API routes, to avoid timeout
