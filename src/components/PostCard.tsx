import { useEffect, useState } from "react";
import { ThumbsUp, MessageSquare, Share2, Code2, MoreHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag, getTagVariant } from "@/components/ui/tag";
import UserAvatar from "@/components/Avatar";
import CodeBlock from "@/components/CodeBlock";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PostCardProps {
  id?: string;
  author: { name: string; avatar?: string; field: string };
  timeAgo: string;
  title: string;
  content: string;
  tags: string[];
  image?: string;
  code?: { content: string; language: string; filename?: string };
  likes: number;
  comments: number;
  isCodePost?: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

interface Review {
  id: string;
  reviewed_code: string;
  message: string | null;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

const PostCard = ({ id, author, timeAgo, title, content, tags, image, code, likes, comments: initialComments, isCodePost = false }: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [commentCount, setCommentCount] = useState(initialComments);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState("");
  const [reviewCode, setReviewCode] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const checkIfLiked = async () => {
    if (!id || !user) return;
    const { data } = await supabase.from("post_likes").select("id").eq("post_id", id).eq("user_id", user.id).maybeSingle();
    setLiked(!!data);
  };

  const fetchLikeCount = async () => {
    if (!id) return;
    const { count } = await supabase.from("post_likes").select("id", { count: "exact", head: true }).eq("post_id", id);
    setLikeCount(count || 0);
  };

  const fetchComments = async () => {
    if (!id) return;
    const { data } = await supabase.from("comments").select("id, content, created_at, user_id").eq("post_id", id).order("created_at", { ascending: true });
    const comments = data ?? [];

    const userIds = [...new Set(comments.map((comment) => comment.user_id))];
    let profileMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", userIds);
      profileMap = new Map((profiles ?? []).map((profile) => [profile.user_id, { full_name: profile.full_name, avatar_url: profile.avatar_url }]));
    }

    setCommentsList(comments.map((comment) => ({ ...comment, profiles: profileMap.get(comment.user_id) || null })) as Comment[]);
    setCommentCount(comments.length);
  };

  const fetchReviews = async () => {
    // code_reviews table removed — no-op
    setReviews([]);
  };

  useEffect(() => {
    checkIfLiked();
    fetchLikeCount();
    fetchReviews();
  }, [id, user]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`post-card-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "post_likes", filter: `post_id=eq.${id}` }, () => {
        fetchLikeCount();
        checkIfLiked();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${id}` }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user]);

  const handleLike = async () => {
    if (!user || !id) {
      toast({ title: "Please log in", description: "You must be logged in to like posts", variant: "destructive" });
      return;
    }

    const { data: existingLike } = await supabase.from("post_likes").select("id").eq("post_id", id).eq("user_id", user.id).maybeSingle();

    if (existingLike) {
      const { error } = await supabase.from("post_likes").delete().eq("post_id", id).eq("user_id", user.id);
      if (!error) setLiked(false);
    } else {
      const { error } = await supabase.from("post_likes").insert({ post_id: id, user_id: user.id });
      if (!error) setLiked(true);
    }
  };

  const handleAddComment = async () => {
    if (!user || !id || !newComment.trim()) return;
    const { error } = await supabase.from("comments").insert({ content: newComment.trim(), post_id: id, user_id: user.id });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setNewComment("");
    fetchComments();
  };

  const handleAddReview = async () => {
    if (!user || !id || !reviewCode.trim()) return;
    toast({ title: "Coming soon", description: "Code reviews feature is being rebuilt." });
    setReviewCode("");
    setReviewMessage("");
    setIsReviewsOpen(false);
  };

  const handleShare = async () => {
    const shareUrl = window.location.origin + (id ? `/post/${id}` : "/home");
    await navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied", description: "Post link copied to clipboard" });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <UserAvatar name={author.name} src={author.avatar} size="md" />
          <div>
            <h4 className="font-semibold text-foreground">{author.name}</h4>
            <p className="text-sm text-muted-foreground">{author.field} • {timeAgo}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 leading-relaxed">{content}</p>

      <div className="flex flex-wrap gap-2 mb-4">{tags.map((tag) => <Tag key={tag} variant={getTagVariant(tag)}>#{tag}</Tag>)}</div>

      {image && <div className="mb-4 rounded-lg overflow-hidden"><img src={image} alt="Post content" className="w-full h-auto" /></div>}

      {code && (
        <div className="mb-4 space-y-3">
          <CodeBlock code={code.content} language={code.language} filename={code.filename} showRunButton={isCodePost} />

          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-3 bg-muted/40">
              <p className="text-sm font-medium mb-2">Review by {review.profiles?.full_name || "Reviewer"} • {getTimeAgo(review.created_at)}</p>
              {review.message && <p className="text-sm text-muted-foreground mb-2">{review.message}</p>}
              <CodeBlock code={review.reviewed_code} language={code.language} showRunButton />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleLike} className={`gap-2 ${liked ? "text-primary" : "text-muted-foreground"}`}>
            <ThumbsUp className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            <span>{likeCount}</span>
          </Button>

          <Dialog open={isCommentsOpen} onOpenChange={(open) => { setIsCommentsOpen(open); if (open) fetchComments(); }}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground"><MessageSquare className="h-4 w-4" /><span>{commentCount}</span></Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Comments</DialogTitle></DialogHeader>
              <ScrollArea className="max-h-[360px] pr-4">
                {commentsList.length === 0 ? <p className="text-muted-foreground text-center py-4">No comments yet.</p> : (
                  <div className="space-y-4">
                    {commentsList.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <UserAvatar name={comment.profiles?.full_name || "User"} src={comment.profiles?.avatar_url || undefined} size="sm" />
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
                  <Textarea placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="min-h-[60px]" />
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>Post</Button>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleShare}><Share2 className="h-4 w-4" /></Button>
        </div>

        <Dialog open={isReviewsOpen} onOpenChange={setIsReviewsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary-soft">
              {isCodePost ? <><Code2 className="h-4 w-4" /><span>Review Code</span></> : <><Users className="h-4 w-4" /><span>Collaborate</span></>}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Submit code review</DialogTitle></DialogHeader>
            <Textarea value={reviewMessage} onChange={(e) => setReviewMessage(e.target.value)} placeholder="Feedback message" />
            <Textarea value={reviewCode} onChange={(e) => setReviewCode(e.target.value)} placeholder="Paste improved code" className="min-h-[220px] font-mono" />
            <Button onClick={handleAddReview} disabled={!reviewCode.trim()}>Submit Review</Button>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};

export default PostCard;
