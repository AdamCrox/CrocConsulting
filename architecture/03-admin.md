# Admin Dashboard SOP — CrocConsulting

## Access Control
- URL: `/admin`
- Protected by middleware: checks `app_metadata.role === 'admin'`
- Only Adam Croxton should have admin access

## Pages

### `/admin` — Admin Login
- Simple email + password form
- Uses `supabase.auth.signInWithPassword()`
- On success → redirect to `/admin/submissions`

### `/admin/submissions` — Submission Queue
**Displays**: All submissions ordered by `created_at DESC`
**Columns**: Date, Company, Contact, Email, Equipment Type, Voltage, Status, Actions
**Actions per row**:
- View Details (modal with all fields + file links)
- Accept → calls `POST /api/admin/approve`
- Reject → calls `POST /api/admin/reject`

**Filters**: All | Pending | Accepted | Rejected

### `/admin/quotes` — Active Quote Management
**Displays**: All quotes with client info and current stage
**Per quote**:
- Client name, company, email
- Current stage badge (1–7)
- Stage timeline (which stages are complete)
- "Mark Next Stage Complete" button → calls `POST /api/admin/stage`
- Add note to stage (textarea per stage)

### `/admin/clients` — Client Accounts
**Displays**: All clients with their quote count and status
**Actions**:
- View client details
- Reset password (calls Supabase Admin API to send reset email)

## Data Flow
All admin pages use server-side data fetching with the service role client.
Never use the anon client in admin routes — always use `createServiceClient()`.
