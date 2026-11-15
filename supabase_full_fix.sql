-- ============================================================
-- 1. CLEANUP ALL EXISTING DATA IN SUPABASE (RUN THIS TO WIPE)
-- ============================================================
TRUNCATE TABLE public.brand_invitations CASCADE;
TRUNCATE TABLE public.brand_members CASCADE;
TRUNCATE TABLE public.brands CASCADE;
TRUNCATE TABLE public.organizations CASCADE;
TRUNCATE TABLE public.users CASCADE;

-- Clear Supabase Auth users so all emails can be registered cleanly again
DELETE FROM auth.users;

-- ============================================================
-- 2. DROP ALL RESTRICTIVE OLD POLICIES
-- ============================================================
DROP POLICY IF EXISTS "allow_all_users" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_select_all_authenticated" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

DROP POLICY IF EXISTS "allow_all_organizations" ON public.organizations;
DROP POLICY IF EXISTS "orgs_insert_authenticated" ON public.organizations;
DROP POLICY IF EXISTS "orgs_select_authenticated" ON public.organizations;
DROP POLICY IF EXISTS "orgs_update_authenticated" ON public.organizations;
DROP POLICY IF EXISTS "orgs_update_owner" ON public.organizations;

DROP POLICY IF EXISTS "allow_all_brands" ON public.brands;
DROP POLICY IF EXISTS "brands_insert_authenticated" ON public.brands;
DROP POLICY IF EXISTS "brands_select_all" ON public.brands;
DROP POLICY IF EXISTS "brands_update_authenticated" ON public.brands;

DROP POLICY IF EXISTS "allow_all_brand_members" ON public.brand_members;
DROP POLICY IF EXISTS "brand_members_insert_authenticated" ON public.brand_members;
DROP POLICY IF EXISTS "brand_members_select_authenticated" ON public.brand_members;
DROP POLICY IF EXISTS "brand_members_update_authenticated" ON public.brand_members;

DROP POLICY IF EXISTS "allow_all_brand_invitations" ON public.brand_invitations;
DROP POLICY IF EXISTS "invitations_insert_authenticated" ON public.brand_invitations;
DROP POLICY IF EXISTS "invitations_select_all" ON public.brand_invitations;
DROP POLICY IF EXISTS "invitations_update_authenticated" ON public.brand_invitations;

-- ============================================================
-- 3. PERMISSIVE RLS POLICIES FOR TEST & PRODUCTION (TO PUBLIC)
--    Allows both logged-in users AND publishable API key clients
--    to Insert, Select, and Update without 403 Forbidden errors!
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_users" ON public.users
FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_organizations" ON public.organizations
FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_brands" ON public.brands
FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.brand_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_brand_members" ON public.brand_members
FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.brand_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_brand_invitations" ON public.brand_invitations
FOR ALL TO public USING (true) WITH CHECK (true);

-- ============================================================
-- 4. FIX FOREIGN KEY CONSTRAINT ON BRAND_INVITATIONS (invited_by)
--    Make invited_by nullable and reference public.users with ON DELETE SET NULL
--    so invitations can be created by demo users or without strict auth.users link.
-- ============================================================
ALTER TABLE public.brand_invitations ALTER COLUMN invited_by DROP NOT NULL;
ALTER TABLE public.brand_invitations DROP CONSTRAINT IF EXISTS brand_invitations_invited_by_fkey;
ALTER TABLE public.brand_invitations 
  ADD CONSTRAINT brand_invitations_invited_by_fkey 
  FOREIGN KEY (invited_by) REFERENCES public.users(id) ON DELETE SET NULL;
