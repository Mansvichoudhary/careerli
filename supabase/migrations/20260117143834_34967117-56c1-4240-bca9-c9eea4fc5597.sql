-- Fix notifications: Remove overly permissive INSERT policy, create triggers for automatic notifications
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create triggers to auto-generate notifications for likes
CREATE OR REPLACE FUNCTION public.notify_post_like()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, related_post_id, related_user_id)
  SELECT p.user_id, 'like', 'New like on your post', 'Someone liked your post', NEW.post_id, NEW.user_id
  FROM public.posts p 
  WHERE p.id = NEW.post_id AND p.user_id != NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_post_like_notify
AFTER INSERT ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION public.notify_post_like();

-- Create trigger for comment notifications
CREATE OR REPLACE FUNCTION public.notify_post_comment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, related_post_id, related_user_id)
  SELECT p.user_id, 'comment', 'New comment on your post', 'Someone commented on your post', NEW.post_id, NEW.user_id
  FROM public.posts p 
  WHERE p.id = NEW.post_id AND p.user_id != NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_post_comment_notify
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_post_comment();

-- Create trigger for follow notifications
CREATE OR REPLACE FUNCTION public.notify_new_follower()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, related_user_id)
  VALUES (NEW.following_id, 'follow', 'New follower', 'Someone started following you', NEW.follower_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_new_follower_notify
AFTER INSERT ON public.user_connections
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_follower();

-- Fix chat_channels: Add UPDATE and DELETE policies for channel creators
CREATE POLICY "Creators can update channels" 
ON public.chat_channels 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete channels" 
ON public.chat_channels 
FOR DELETE 
USING (auth.uid() = created_by);

-- Fix messages: Add UPDATE and DELETE policies
CREATE POLICY "Users can update own messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" 
ON public.messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix profiles: Restrict to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Add validation to SECURITY DEFINER functions for defense in depth
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Verify the like is by the authenticated user
    IF NEW.user_id != auth.uid() THEN
      RAISE EXCEPTION 'Invalid like operation';
    END IF;
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Verify deletion is by the original liker
    IF OLD.user_id != auth.uid() THEN
      RAISE EXCEPTION 'Invalid unlike operation';
    END IF;
    UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Verify the comment is by the authenticated user
    IF NEW.user_id != auth.uid() THEN
      RAISE EXCEPTION 'Invalid comment operation';
    END IF;
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Verify deletion is by the comment owner
    IF OLD.user_id != auth.uid() THEN
      RAISE EXCEPTION 'Invalid comment deletion';
    END IF;
    UPDATE public.posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;