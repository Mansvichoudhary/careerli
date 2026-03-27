import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';

export interface Comment { id: string; content: string; post_id: string; user_id: string; created_at: string }

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchComments = async () => {
    setLoading(true);
    try { setComments(await apiRequest<Comment[]>(`/comments/${postId}`)); } finally { setLoading(false); }
  };
  const addComment = async (content: string) => { await apiRequest('/comments', 'POST', { post_id: postId, content }); await fetchComments(); };
  useEffect(() => { if (postId) fetchComments(); }, [postId]);
  return { comments, loading, fetchComments, addComment };
};
