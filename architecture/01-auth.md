# Auth SOP — CrocConsulting

## Three Auth Modes

### 1. Quote Submission (Magic Link)
**Who**: Any member of the public submitting a procurement quote request
**Flow**:
1. User visits `/quote` and enters their email
2. Call `supabase.auth.signInWithOtp({ email })` — Supabase sends magic link
3. User clicks link → browser redirected to `/auth/callback?token=...`
4. Next.js `/auth/callback/route.js` exchanges token for session via `supabase.auth.exchangeCodeForSession(code)`
5. User redirected to `/quote/details` with active session
6. On form submit, session JWT proves identity; email stored in submission record

**Important**: These users are NOT clients — they do not have portal access after submitting.

### 2. Client Portal (Email + Password)
**Who**: Clients whose quotes have been accepted by admin
**Flow**:
1. Admin approves submission → API creates Supabase Auth user via service role
2. Supabase sends auto-generated password or admin sets one
3. Client receives email with login credentials
4. Client visits `/portal` → logs in with `supabase.auth.signInWithPassword()`
5. Session JWT used for all portal queries — RLS limits to their own quotes

### 3. Admin (Email + Password + Role)
**Who**: Adam Croxton only
**Setup**:
1. Create admin user in Supabase dashboard
2. Set `app_metadata: { role: 'admin' }` via Supabase dashboard or service role API
3. Middleware checks `session.user.app_metadata.role === 'admin'` for `/admin/*` routes

## Middleware Protection
```
/portal/* → requires authenticated session (any role)
/admin/*  → requires role === 'admin'
/quote/details → requires authenticated session
```

## Session Handling
- Use `createServerClient` from `@supabase/ssr` in Server Components and API routes
- Use `createBrowserClient` from `@supabase/ssr` in Client Components
- Refresh session via middleware on every request
