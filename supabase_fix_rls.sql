-- ============================================
-- DROP old policies if they conflict
-- ============================================
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can read organizations" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can create brands" ON public.brands;
DROP POLICY IF EXISTS "Anyone can read active brands" ON public.brands;
DROP POLICY IF EXISTS "Authenticated users can insert brand members" ON public.brand_members;
DROP POLICY IF EXISTS "Authenticated users can read brand members" ON public.brand_members;
DROP POLICY IF EXISTS "Authenticated users can update brand members" ON public.brand_members;
DROP POLICY IF EXISTS "Authenticated users can insert invitations" ON public.brand_invitations;
DROP POLICY IF EXISTS "Anyone can read invitations by token" ON public.brand_invitations;
DROP POLICY IF EXISTS "Authenticated users can update invitations" ON public.brand_invitations;

-- ============================================
-- USERS table policies
-- ============================================
CREATE POLICY "users_insert_own"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_select_own"
ON public.users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_update_own"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- ============================================
-- ORGANIZATIONS table policies
-- ============================================
CREATE POLICY "orgs_insert_authenticated"
ON public.organizations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "orgs_select_authenticated"
ON public.organizations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "orgs_update_authenticated"
ON public.organizations FOR UPDATE
TO authenticated
USING (true);

-- ============================================
-- BRANDS table policies
-- ============================================
CREATE POLICY "brands_insert_authenticated"
ON public.brands FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "brands_select_all"
ON public.brands FOR SELECT
USING (true);

CREATE POLICY "brands_update_authenticated"
ON public.brands FOR UPDATE
TO authenticated
USING (true);

-- ============================================
-- BRAND_MEMBERS table policies
-- ============================================
CREATE POLICY "brand_members_insert_authenticated"
ON public.brand_members FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "brand_members_select_authenticated"
ON public.brand_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "brand_members_update_authenticated"
ON public.brand_members FOR UPDATE
TO authenticated
USING (true);

-- ============================================
-- BRAND_INVITATIONS table policies
-- ============================================
CREATE POLICY "invitations_insert_authenticated"
ON public.brand_invitations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "invitations_select_all"
ON public.brand_invitations FOR SELECT
USING (true);

CREATE POLICY "invitations_update_authenticated"
ON public.brand_invitations FOR UPDATE
TO authenticated
USING (true);
