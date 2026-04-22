# Architecture Overview — CrocConsulting

## System Layers (A.N.T.)
1. **Architecture** (`architecture/`) — SOPs defining how each module works
2. **Navigation** — Next.js App Router + Supabase Auth middleware handles routing decisions
3. **Tools** (`tools/`) — SQL migrations, seed scripts, utility scripts

## Request Flow
```
Browser → Vercel Edge → Next.js App Router
                              ↓
                    Supabase Auth Middleware
                    (validates JWT, sets session)
                              ↓
              ┌───────────────────────────────┐
              │     Route Decision             │
              │  /            → HomePage       │
              │  /quote       → QuotePage      │
              │  /portal      → ClientPortal   │
              │  /admin       → AdminDashboard │
              │  /api/*       → API Routes     │
              └───────────────────────────────┘
                              ↓
                    Supabase PostgreSQL
                    (RLS enforced on all queries)
```

## Key Invariants
- RLS is ON for all tables — never disabled
- Service role key only used server-side in API routes
- Client portal credentials are admin-issued only
- File uploads go client → Supabase Storage (bypass API routes for speed)
