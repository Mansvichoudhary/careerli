import { useState, useEffect } from "react";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Filter, TrendingUp, Globe, Cpu, Brain, Server, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import UserAvatar from "@/components/Avatar";
import { Tag } from "@/components/ui/tag";
import RoleBadge from "@/components/RoleBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { demoPosts, demoUsers, demoEvents, trendingTech } from "@/lib/seedData";

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'student' | 'mentor';
  university: string | null;
  skills: string[];
  skills: string[] | null;
}

interface Post {
  id: string;
  title: string | null;
  content: string;
  post_type: string;
  code_content: string | null;
  code_language: string | null;
  tags: string[];
  likes_count: number;
  comments_count: number;
  tags: string[] | null;
  likes_count: number | null;
  comments_count: number | null;
  created_at: string;
  is_anonymous: boolean;
  is_anonymous: boolean | null;
  user_id: string;
  media_urls: string[];
  media_urls: string[] | null;
  profiles: Profile | null;
}

const categories = [
  { id: "all", label: "All Posts", icon: Globe },
  { id: "code", label: "Code", icon: Cpu },
  { id: "project", label: "Projects", icon: Brain },
  { id: "text", label: "Discussions", icon: Server },
];

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<Profile[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadPosts = useCallback(async () => {
    setLoading(true);

    try {
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (activeCategory !== 'all') {
        query = query.eq('post_type', activeCategory);
      }

      const { data, error } = await query;

      if (error) {
        setPosts([]);
        return;
      }

      if (!data || data.length === 0) {
        setPosts([]);
        return;
      }

      const userIds = [...new Set(data.map((post) => post.user_id).filter(Boolean))];
      let profilesByUserId = new Map<string, Profile>();

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, user_id, username, full_name, avatar_url, role, university, skills')
          .in('user_id', userIds);

        profilesByUserId = new Map((profilesData || []).map((profile) => [profile.user_id, profile as Profile]));
      }

      const postsWithProfiles = data.map((post) => ({
        ...post,
        tags: post.tags ?? [],
        likes_count: post.likes_count ?? 0,
        comments_count: post.comments_count ?? 0,
        media_urls: post.media_urls ?? [],
        is_anonymous: post.is_anonymous ?? false,
        profiles: profilesByUserId.get(post.user_id) || null,
      }));

      setPosts(postsWithProfiles as Post[]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchPosts();
    loadPosts();
    fetchSuggestedUsers();
    if (user) {
      fetchFollowing();
    }
  }, [activeCategory, user]);
  }, [loadPosts, user]);

  const fetchPosts = async () => {
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
      .limit(20);

    if (activeCategory !== 'all') {
      query = query.eq('post_type', activeCategory);
    }
  useEffect(() => {
    const channel = supabase
      .channel(`home-feed:${activeCategory}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, async () => {
        await loadPosts();
      })
      .subscribe();

    const { data, error } = await query;
    if (!error && data) {
      setPosts(data as unknown as Post[]);
    }
    setLoading(false);
  };
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeCategory, loadPosts]);

  const fetchSuggestedUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (data && data.length > 0) {
      setSuggestedUsers(data as Profile[]);
    }
  };

  const fetchFollowing = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_connections')
      .select('following_id')
      .eq('follower_id', user.id);
    
    if (data) {
      setFollowingIds(new Set(data.map(c => c.following_id)));
    }
  };

  const getTimeAgo = (dateString: string) => {
