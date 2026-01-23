import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'student' | 'mentor';
  university: string | null;
  skills: string[];
}

export interface Post {
  id: string;
  title: string | null;
  content: string;
  post_type: string;
  code_content: string | null;
  code_language: string | null;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_anonymous: boolean;
  user_id: string;
  profiles: Profile | null;
}

export const usePosts = (category?: string, roleFilter?: 'all' | 'student' | 'mentor') => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_user_id_fkey (
          id, username, full_name, avatar_url, role, university, skills
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (category && category !== 'all') {
      query = query.eq('post_type', category);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: 'Error fetching posts', description: error.message, variant: 'destructive' });
    } else if (data) {
      let filteredPosts = data as unknown as Post[];
      if (roleFilter && roleFilter !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.profiles?.role === roleFilter);
      }
      setPosts(filteredPosts);
    }
    setLoading(false);
  }, [category, roleFilter, toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (postData: {
    title: string;
    content: string;
    post_type: string;
    code_content?: string;
    code_language?: string;
    tags: string[];
    is_anonymous: boolean;
  }) => {
    if (!user) {
      toast({ title: 'Please log in', description: 'You must be logged in to create a post', variant: 'destructive' });
      return null;
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...postData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error creating post', description: error.message, variant: 'destructive' });
      return null;
    }

    toast({ title: 'Post created!', description: 'Your post has been published successfully.' });
    await fetchPosts();
    return data;
  };

  const likePost = async (postId: string) => {
    if (!user) {
      toast({ title: 'Please log in', description: 'You must be logged in to like a post', variant: 'destructive' });
      return false;
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return false;
      }
      return false; // Indicates unliked
    } else {
      // Like
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: user.id });

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return false;
      }
      return true; // Indicates liked
    }
  };

  const checkIfLiked = async (postId: string) => {
    if (!user) return false;

    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    return !!data;
  };

  return {
    posts,
    loading,
    createPost,
    likePost,
    checkIfLiked,
    refreshPosts: fetchPosts,
  };
};
