import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: "student" | "mentor";
  university: string | null;
  skills: string[] | null;
}

export interface FeedPost {
  id: string;
  title: string | null;
  content: string;
  post_type: string;
  code_content: string | null;
  code_language: string | null;
  tags: string[] | null;
  likes_count: number | null;
  comments_count: number | null;
  created_at: string;
  is_anonymous: boolean | null;
  user_id: string;
  profiles: Profile | null;
}

interface FeedContextValue {
  posts: FeedPost[];
  loading: boolean;
  refreshPosts: (category?: string) => Promise<void>;
  createPost: (payload: {
    title: string;
    content: string;
    post_type: string;
    code_content?: string;
    code_language?: string;
    tags: string[];
    is_anonymous: boolean;
  }) => Promise<boolean>;
}

const FeedContext = createContext<FeedContextValue | null>(null);

export const FeedProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshPosts = useCallback(async (category?: string) => {
    setLoading(true);

    let query = supabase.from("posts").select("*").order("created_at", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("post_type", category);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: "Could not load feed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const postsData = data ?? [];
    const userIds = [...new Set(postsData.map((post) => post.user_id))];
    let profilesByUserId = new Map<string, Profile>();

    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, user_id, username, full_name, avatar_url, role, university, skills")
        .in("user_id", userIds);

      profilesByUserId = new Map((profilesData ?? []).map((profile) => [profile.user_id, profile as Profile]));
    }

    setPosts(
      postsData.map((post) => ({
        ...post,
        profiles: profilesByUserId.get(post.user_id) || null,
      })) as FeedPost[],
    );

    setLoading(false);
  }, [toast]);

  useEffect(() => {
    refreshPosts();

    const postsChannel = supabase
      .channel("feed-posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => refreshPosts())
      .subscribe();

    const likesChannel = supabase
      .channel("feed-likes")
      .on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, () => refreshPosts())
      .subscribe();

    const commentsChannel = supabase
      .channel("feed-comments")
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => refreshPosts())
      .subscribe();

    const reviewsChannel = supabase
      .channel("feed-reviews")
      .on("postgres_changes", { event: "*", schema: "public", table: "code_reviews" }, () => refreshPosts())
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(reviewsChannel);
    };
  }, [refreshPosts]);

  const createPost = useCallback(async (payload: {
    title: string;
    content: string;
    post_type: string;
    code_content?: string;
    code_language?: string;
    tags: string[];
    is_anonymous: boolean;
  }) => {
    if (!user) {
      toast({ title: "Please log in", description: "You must be logged in to create a post", variant: "destructive" });
      return false;
    }

    const { error } = await supabase.from("posts").insert({ ...payload, user_id: user.id });

    if (error) {
      toast({ title: "Error creating post", description: error.message, variant: "destructive" });
      return false;
    }

    await refreshPosts();
    return true;
  }, [refreshPosts, toast, user]);

  const value = useMemo(() => ({ posts, loading, refreshPosts, createPost }), [posts, loading, refreshPosts, createPost]);

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
};

export const useFeed = () => {
  const context = useContext(FeedContext);
  if (!context) throw new Error("useFeed must be used inside FeedProvider");
  return context;
};
