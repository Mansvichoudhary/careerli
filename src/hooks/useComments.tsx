import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'student' | 'mentor';
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  parent_id: string | null;
  likes_count: number;
  profiles: Profile | null;
}

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles!comments_user_id_fkey (
          id, full_name, avatar_url, role
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      toast({ title: 'Error fetching comments', description: error.message, variant: 'destructive' });
    } else if (data) {
      setComments(data as unknown as Comment[]);
    }
    setLoading(false);
  }, [postId, toast]);

  const addComment = async (content: string, parentId?: string) => {
    if (!user) {
      toast({ title: 'Please log in', description: 'You must be logged in to comment', variant: 'destructive' });
      return null;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        content,
        post_id: postId,
        user_id: user.id,
        parent_id: parentId || null,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error adding comment', description: error.message, variant: 'destructive' });
      return null;
    }

    toast({ title: 'Comment added!' });
    await fetchComments();
    return data;
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error deleting comment', description: error.message, variant: 'destructive' });
      return false;
    }

    await fetchComments();
    return true;
  };

  return {
    comments,
    loading,
    fetchComments,
    addComment,
    deleteComment,
  };
};
