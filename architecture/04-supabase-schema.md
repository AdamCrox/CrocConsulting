# Supabase Schema SOP — CrocConsulting

## Running the Migration
1. Go to your Supabase project → SQL Editor
2. Open `tools/migrate_schema.sql`
3. Paste and run the entire file
4. Verify all tables appear in Table Editor

## Storage Setup
1. Go to Storage → Create bucket: `quote-files`
2. Set to Public
3. Add policy: Allow authenticated users to INSERT (upload)
4. Allow anyone to SELECT (read file URLs)

## Auth Configuration
1. Go to Authentication → Settings
2. Set Site URL: `https://crocconsulting.vercel.app` (or your Vercel URL)
3. Add Redirect URLs: `https://crocconsulting.vercel.app/auth/callback`
4. Also add localhost for dev: `http://localhost:3000/auth/callback`
5. Configure SMTP (optional but recommended): Use Resend SMTP credentials

## Creating Admin User
```sql
-- After creating admin user in Supabase Auth dashboard, run:
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'adam.croxton@outlook.com';
```

## RLS Policies Summary
See `tools/migrate_schema.sql` for full policy definitions.

| Table | INSERT | SELECT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| submissions | Public | Admin only | Admin only | Admin only |
| clients | Admin only | Admin only | Admin only | Admin only |
| quotes | Admin only | Client (own) + Admin | Admin only | Admin only |
| quote_stages | Admin only | Client (via quote) + Admin | Admin only | Admin only |
| contacts | Public | Admin only | Admin only | Admin only |

## Invariant: Schema Change Process
1. Edit `tools/migrate_schema.sql`
2. Update the relevant SOP in `architecture/`
3. Update `claude.md` schema section
4. Run in Supabase SQL editor
5. Log in `progress.md`
