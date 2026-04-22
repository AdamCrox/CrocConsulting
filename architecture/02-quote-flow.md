# Quote Flow SOP — CrocConsulting

## End-to-End Quote Submission

### Step 1: Email Entry (`/quote`)
- User enters email address
- Client calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: '/auth/callback' } })`
- UI shows "Check your email" confirmation
- No database writes at this stage

### Step 2: Magic Link Click → Auth Callback
- User clicks link in email
- Next.js route `/auth/callback/route.js` handles the redirect
- Exchanges `code` param for a Supabase session
- Redirects to `/quote/details`

### Step 3: Quote Form (`/quote/details`)
**Fields** (all stored in `submissions` table):
- Company name
- Contact name
- Phone number
- Equipment type (dropdown: Circuit Breaker, Switchgear, Transformer, Cable, Other)
- Voltage level (dropdown: LV <1kV, MV 1–36kV, HV >36kV)
- Quantity
- Project description / special requirements (textarea)
- File attachments (Excel, PDF, Word — optional)

**File Upload Logic**:
1. User selects files in browser
2. Client uploads directly to Supabase Storage: `quote-files/{submission_id}/{filename}`
3. Returns array of public URLs
4. These URLs are stored in `submissions.files[]`

### Step 4: Submit
- Client calls `POST /api/quote/submit` with form data + file URLs
- API route (server-side):
  1. Validates required fields
  2. Inserts row into `submissions` table (status: 'pending')
  3. Sends email to `adam.croxton@outlook.com` via Resend with submission details
  4. Returns `{ success: true, submissionId }`
- User redirected to `/quote/confirmation`

## Admin Approval Flow

### Admin Reviews (`/admin/submissions`)
- Lists all submissions with status 'pending'
- Admin clicks "Accept" or "Reject"

### Approve (`POST /api/admin/approve`)
Using service role (server-side only):
1. Update `submissions.status` → 'accepted'
2. Create Supabase Auth user: `supabase.auth.admin.createUser({ email, password, email_confirm: true })`
3. Insert row into `clients` table
4. Insert row into `quotes` table (current_stage: 1)
5. Insert 7 rows into `quote_stages` (all completed: false)
6. Send email to client with login credentials via Resend

### Reject (`POST /api/admin/reject`)
1. Update `submissions.status` → 'rejected'
2. Optionally send rejection email to submitter

## Stage Update Flow (`/admin/quotes`)
- Admin selects a quote and marks a stage complete
- `POST /api/admin/stage` updates `quote_stages` row (completed: true, completed_at: now())
- Also updates `quotes.current_stage` to the next incomplete stage
- Client will see update on next portal visit (no real-time push required v1)
