-- ============================================================
-- STEP 1: Create a trigger function that auto-inserts into
--         public.users whenever a new Supabase Auth user is created.
--         SECURITY DEFINER means it runs as DB owner, bypasses RLS.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, is_org_admin, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    false,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 2: Attach the trigger to auth.users
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================
-- STEP 3: Fix RLS - allow authenticated users to UPDATE their
--         own row (trigger handles INSERT, so we only need UPDATE)
-- ============================================================
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_all_authenticated"
ON public.users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_update_own"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow insert only via trigger (service role) or by own auth
CREATE POLICY "users_insert_own"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================================
-- STEP 4: Fix organizations RLS
-- ============================================================
DROP POLICY IF EXISTS "orgs_insert_authenticated" ON public.organizations;
DROP POLICY IF EXISTS "orgs_select_authenticated" ON public.organizations;
DROP POLICY IF EXISTS "orgs_update_authenticated" ON public.organizations;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orgs_insert_authenticated"
ON public.organizations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "orgs_select_authenticated"
ON public.organizations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "orgs_update_owner"
ON public.organizations FOR UPDATE
TO authenticated
USING (owner_id = auth.uid());
