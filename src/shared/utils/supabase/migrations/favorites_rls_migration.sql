ALTER TABLE public.tweaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view tweaks" ON public.tweaks;
CREATE POLICY "Authenticated users can view tweaks"
ON public.tweaks
FOR SELECT
TO authenticated
USING (true);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
CREATE POLICY "Users can view own favorites"
ON public.favorites
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
CREATE POLICY "Users can insert own favorites"
ON public.favorites
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
CREATE POLICY "Users can delete own favorites"
ON public.favorites
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
