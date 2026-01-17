import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, TrendingUp, Globe, Cpu, Brain, Server, Users, Code2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PostCard from "@/components/PostCard";
import UserAvatar from "@/components/Avatar";
import RoleBadge from "@/components/RoleBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'student' | 'mentor';
  university: string | null;
  skills: string[];
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
  created_at: string;
  is_anonymous: boolean;
  user_id: string;
  profiles: Profile | null;
}

const categories = [
  { id: "all", label: "All Posts", icon: Globe },
  { id: "code", label: "Code Snippets", icon: Code2 },
  { id: "project", label: "Projects", icon: Cpu },
  { id: "text", label: "Discussions", icon: Brain },
];

const Explore = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "mentor">("all");
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
    fetchUsers();
  }, [activeCategory, roleFilter]);

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

    if (activeCategory !== "all") {
      query = query.eq('post_type', activeCategory);
    }

    const { data, error } = await query;
    
    if (!error && data) {
      let filteredPosts = data as unknown as Post[];
      
      if (roleFilter !== "all") {
        filteredPosts = filteredPosts.filter(post => 
          post.profiles?.role === roleFilter
        );
      }
      
      setPosts(filteredPosts);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    let query = supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (roleFilter !== "all") {
      query = query.eq('role', roleFilter);
    }

    const { data, error } = await query;
    if (!error && data) {
      setUsers(data as Profile[]);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query)) ||
      post.profiles?.full_name?.toLowerCase().includes(query)
    );
  });

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
    <div className="max-w-7xl mx-auto">
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Explore
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover projects, code snippets, and talented individuals.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts, users, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Role Filter */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={roleFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter("all")}
            >
              All Roles
            </Button>
            <Button
              variant={roleFilter === "student" ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter("student")}
            >
              Students
            </Button>
            <Button
              variant={roleFilter === "mentor" ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter("mentor")}
            >
              Mentors
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                className="gap-2 whitespace-nowrap"
                onClick={() => setActiveCategory(cat.id)}
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Posts */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts found. Be the first to share something!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PostCard
                    author={{
                      name: post.is_anonymous ? "Anonymous" : (post.profiles?.full_name || "Unknown User"),
                      avatar: post.profiles?.avatar_url || undefined,
                      field: post.profiles?.university || "Student",
                    }}
                    timeAgo={getTimeAgo(post.created_at)}
                    title={post.title || ""}
                    content={post.content}
                    tags={post.tags}
                    likes={post.likes_count}
                    comments={post.comments_count}
                    isCodePost={post.post_type === 'code'}
                    code={post.code_content ? {
                      content: post.code_content,
                      language: post.code_language || 'javascript',
                      filename: `snippet.${post.code_language || 'js'}`
                    } : undefined}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar - Suggested Users */}
        <aside className="w-80 hidden xl:block space-y-6">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Discover People
            </h3>
            <div className="space-y-4">
              {users.map((profile) => (
                <div key={profile.id} className="flex items-center gap-3">
                  <UserAvatar name={profile.full_name || "User"} src={profile.avatar_url || undefined} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {profile.full_name || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {profile.university || "Student"}
                    </p>
                    <RoleBadge role={profile.role} size="sm" className="mt-1" />
                  </div>
                  <Button variant="outline" size="sm">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Tags */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'Python', 'MachineLearning', 'WebDev', 'IoT', 'TypeScript', 'Rust', 'Docker'].map(tag => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setSearchQuery(tag)}
                >
                  #{tag}
                </Button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Explore;
