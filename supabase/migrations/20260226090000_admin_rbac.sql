-- Admin RBAC hardening and moderation capabilities

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'student';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'role'
      AND udt_name = 'user_role'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';
  END IF;
END $$;

ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'email'
  ) THEN
    EXECUTE $$
      UPDATE public.profiles
      SET role = 'admin'
      WHERE email = 'REPLACE_WITH_ADMIN_EMAIL@gmail.com'
    $$;
  ELSE
    UPDATE public.profiles p
    SET role = 'admin'
    FROM auth.users u
    WHERE p.user_id = u.id
      AND u.email = 'REPLACE_WITH_ADMIN_EMAIL@gmail.com';
  END IF;
END $$;

CREATE POLICY "Admin can update any post"
ON public.posts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role::text = 'admin'
  )
);

CREATE POLICY "Admin can delete any post"
ON public.posts
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role::text = 'admin'
  )
);

CREATE POLICY "Admin can update any profile"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role::text = 'admin'
  )
);
