-- Safeguard migration for environments that missed the admin RBAC schema update.
-- Keeps feed ordering and pin/unpin operations compatible.
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;
