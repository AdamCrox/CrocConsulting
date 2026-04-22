-- CrocConsulting — Supabase Schema Migration
-- Run this in the Supabase SQL Editor
-- Updated: 2026-04-22

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  company TEXT,
  contact_name TEXT,
  phone TEXT,
  equipment_type TEXT,
  voltage_level TEXT,
  quantity INTEGER,
  details JSONB DEFAULT '{}',
  files TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'complete', 'cancelled')),
  current_stage INTEGER DEFAULT 1 CHECK (current_stage BETWEEN 1 AND 7),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quote_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL CHECK (stage_number BETWEEN 1 AND 7),
  stage_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(quote_id, stage_number)
);

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quotes_updated_at ON quotes;
CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---- submissions ----
-- Public can insert (no auth needed for quote submission)
CREATE POLICY "public_insert_submissions" ON submissions
  FOR INSERT WITH CHECK (true);

-- Admin can read all
CREATE POLICY "admin_select_submissions" ON submissions
  FOR SELECT USING (is_admin());

-- Admin can update (accept/reject)
CREATE POLICY "admin_update_submissions" ON submissions
  FOR UPDATE USING (is_admin());

-- ---- clients ----
-- Admin only for all operations
CREATE POLICY "admin_all_clients" ON clients
  FOR ALL USING (is_admin());

-- ---- quotes ----
-- Client can read their own quotes (match by email via clients table)
CREATE POLICY "client_select_own_quotes" ON quotes
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE email = auth.email()
    )
  );

-- Admin can do anything
CREATE POLICY "admin_all_quotes" ON quotes
  FOR ALL USING (is_admin());

-- ---- quote_stages ----
-- Client can read stages for their quotes
CREATE POLICY "client_select_own_stages" ON quote_stages
  FOR SELECT USING (
    quote_id IN (
      SELECT q.id FROM quotes q
      JOIN clients c ON c.id = q.client_id
      WHERE c.email = auth.email()
    )
  );

-- Admin can do anything
CREATE POLICY "admin_all_stages" ON quote_stages
  FOR ALL USING (is_admin());

-- ---- contacts ----
-- Public can insert
CREATE POLICY "public_insert_contacts" ON contacts
  FOR INSERT WITH CHECK (true);

-- Admin can read
CREATE POLICY "admin_select_contacts" ON contacts
  FOR SELECT USING (is_admin());

-- ============================================================
-- SEED: Stage Names (used when creating quotes)
-- This is reference data — actual rows created per quote
-- ============================================================

-- Stage names in order:
-- 1: Quote Received
-- 2: Initial Review
-- 3: Supplier Outreach
-- 4: Quotes Gathered
-- 5: Engineering Review
-- 6: Quote Prepared
-- 7: Quote Delivered
