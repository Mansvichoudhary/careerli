import { useState, useEffect } from "react";
import { ThumbsUp, MessageSquare, Share2, Code2, MoreHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag, getTagVariant } from "@/components/ui/tag";
import UserAvatar from "@/components/Avatar";
import CodeBlock from "@/components/CodeBlock";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PostCardProps {
  id?: string;
  author: {
    name: string;
    avatar?: string;
    field: string;
  };
  timeAgo: string;
  title: string;
  content: string;
  tags: string[];
  image?: string;
  code?: {
    content: string;
    language: string;
    filename?: string;
  };
  likes: number;
  comments: number;
  isCodePost?: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const PostCard = ({
  id,
  author,
  timeAgo,
  title,
  content,
  tags,
  image,
  code,
  likes,
  comments: initialComments,
  isCodePost = false,
}: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [commentCount, setCommentCount] = useState(initialComments);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (id && user) {
      checkIfLiked();
    }
  }, [id, user]);

  const checkIfLiked = async () => {
    if (!id || !user) return;
    
    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .maybeSingle();
    
    setLiked(!!data);
  };

  const handleLike = async () => {
    if (!user) {
      toast({ title: 'Please log in', description: 'You must be logged in to like posts', variant: 'destructive' });
      return;
    }

    if (!id) {
      // For mock posts, just toggle locally
      if (liked) {
        setLikeCount((prev) => prev - 1);
      } else {
        setLikeCount((prev) => prev + 1);
      }
      setLiked(!liked);
      return;
    }

    try {
      if (liked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        setLikeCount((prev) => prev - 1);
        setLiked(false);
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: id, user_id: user.id });

        if (error) throw error;
        setLikeCount((prev) => prev + 1);
        setLiked(true);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const fetchComments = async () => {
    if (!id) return;
    
    setLoadingComments(true);
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles!comments_user_id_fkey (
          full_name, avatar_url
        )
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setCommentsList(data as unknown as Comment[]);
    }
    setLoadingComments(false);
  };

  const handleAddComment = async () => {
    if (!user) {
      toast({ title: 'Please log in', description: 'You must be logged in to comment', variant: 'destructive' });
      return;
    }

    if (!id || !newComment.trim()) return;

    const { error } = await supabase
      .from('comments')
      .insert({
        content: newComment.trim(),
        post_id: id,
        user_id: user.id,
      });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    setNewComment("");
    setCommentCount(prev => prev + 1);
    await fetchComments();
    toast({ title: 'Comment added!' });
  };

  const handleShare = async () => {
    const shareUrl = window.location.origin + (id ? `/post/${id}` : '/home');
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: content.substring(0, 100) + '...',
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: 'Link copied!', description: 'Post link has been copied to clipboard' });
    }
  };

  const handleCommentsOpen = (open: boolean) => {
    setIsCommentsOpen(open);
    if (open && id) {
      fetchComments();
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-5 card-hover"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <UserAvatar name={author.name} src={author.avatar} size="md" />
          <div>
            <h4 className="font-semibold text-foreground">{author.name}</h4>
            <p className="text-sm text-muted-foreground">
              {author.field} • {timeAgo}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

      {/* Content */}
      <p className="text-muted-foreground mb-4 leading-relaxed">{content}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <Tag key={tag} variant={getTagVariant(tag)}>
            #{tag}
          </Tag>
        ))}
      </div>

      {/* Image */}
      {image && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img src={image} alt="Post content" className="w-full h-auto" />
        </div>
      )}

      {/* Code Block */}
      {code && (
        <div className="mb-4">
          <CodeBlock
            code={code.content}
            language={code.language}
            filename={code.filename}
            showRunButton={isCodePost}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`gap-2 ${liked ? "text-primary" : "text-muted-foreground"}`}
          >
            <ThumbsUp className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            <span>{likeCount}</span>
          </Button>
          
          <Dialog open={isCommentsOpen} onOpenChange={handleCommentsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>{commentCount}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Comments</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[400px] pr-4">
                {loadingComments ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : commentsList.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No comments yet. Be the first!</p>
                ) : (
                  <div className="space-y-4">
                    {commentsList.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <UserAvatar 
                          name={comment.profiles?.full_name || "User"} 
                          src={comment.profiles?.avatar_url || undefined}
                          size="sm" 
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.profiles?.full_name || "User"}</span>
                            <span className="text-xs text-muted-foreground">{getTimeAgo(comment.created_at)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {user && id && (
                <div className="flex gap-2 mt-4">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    Post
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-primary hover:text-primary hover:bg-primary-soft"
        >
          {isCodePost ? (
            <>
              <Code2 className="h-4 w-4" />
              <span>Review Code</span>
            </>
          ) : (
            <>
              <Users className="h-4 w-4" />
              <span>Collaborate</span>
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default PostCard;
