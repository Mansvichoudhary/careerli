CREATE TABLE IF NOT EXISTS public.code_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_code TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.code_reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='code_reviews' AND policyname='Code reviews are readable by everyone'
  ) THEN
    CREATE POLICY "Code reviews are readable by everyone" ON public.code_reviews FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='code_reviews' AND policyname='Authenticated users can create own code reviews'
  ) THEN
    CREATE POLICY "Authenticated users can create own code reviews" ON public.code_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'code_reviews'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.code_reviews;
  END IF;
END
$$;
