import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';

interface Profile { id: string; user_id: string; username: string | null; full_name: string | null; avatar_url: string | null; role: 'student' | 'mentor' | 'admin'; university: string | null; skills: string[] | null; }
export interface FeedPost { id: string; title: string | null; content: string; post_type: string; tags: string[] | null; created_at: string; is_pinned: boolean | null; user_id: string; profiles: Profile | null; }

interface FeedContextValue {
  posts: FeedPost[];
  loading: boolean;
  refreshPosts: (category?: string) => Promise<void>;
  createPost: (payload: { title: string; content: string; post_type: string; code_content?: string; code_language?: string; tags: string[]; is_anonymous: boolean }) => Promise<boolean>;
  updatePost: (postId: string, payload: { title?: string; content?: string }) => Promise<boolean>;
  deletePost: (postId: string) => Promise<boolean>;
  togglePin: (postId: string, isPinned: boolean) => Promise<boolean>;
}

const FeedContext = createContext<FeedContextValue | null>(null);

export const FeedProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshPosts = useCallback(async (category?: string) => {
    setLoading(true);
    try {
      const suffix = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
      const data = await apiRequest<FeedPost[]>(`/posts${suffix}`);
      setPosts(data ?? []);
    } catch (error) {
      toast({ title: 'Could not load feed', description: (error as Error).message, variant: 'destructive' });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { refreshPosts(); }, [refreshPosts]);

  const createPost = useCallback(async (payload: { title: string; content: string; post_type: string; code_content?: string; code_language?: string; tags: string[]; is_anonymous: boolean }) => {
    if (!user) return false;
    try { await apiRequest('/posts', 'POST', payload); await refreshPosts(); return true; } catch (error) { toast({ title: 'Error creating post', description: (error as Error).message, variant: 'destructive' }); return false; }
  }, [refreshPosts, toast, user]);

  const updatePost = useCallback(async (postId: string, payload: { title?: string; content?: string }) => {
    try { await apiRequest(`/posts/${postId}`, 'PUT', payload); await refreshPosts(); return true; } catch (error) { toast({ title: 'Unable to update post', description: (error as Error).message, variant: 'destructive' }); return false; }
  }, [refreshPosts, toast]);

  const deletePost = useCallback(async (postId: string) => {
    try { await apiRequest(`/posts/${postId}`, 'DELETE'); await refreshPosts(); return true; } catch (error) { toast({ title: 'Unable to delete post', description: (error as Error).message, variant: 'destructive' }); return false; }
  }, [refreshPosts, toast]);

  const togglePin = useCallback(async (postId: string, isPinned: boolean) => {
    try { await apiRequest(`/posts/${postId}`, 'PUT', { is_pinned: !isPinned }); await refreshPosts(); return true; } catch (error) { toast({ title: 'Unable to toggle pin', description: (error as Error).message, variant: 'destructive' }); return false; }
  }, [refreshPosts, toast]);

  const value = useMemo(() => ({ posts, loading, refreshPosts, createPost, updatePost, deletePost, togglePin }), [posts, loading, refreshPosts, createPost, updatePost, deletePost, togglePin]);
  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
};

export const useFeed = () => {
  const context = useContext(FeedContext);
  if (!context) throw new Error('useFeed must be used inside FeedProvider');
  return context;
};
