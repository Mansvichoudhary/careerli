import { useState, useEffect } from "react";
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
  media_urls: string[];
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

  useEffect(() => {
    fetchPosts();
    fetchSuggestedUsers();
    if (user) {
      fetchFollowing();
    }
  }, [activeCategory, user]);

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

    const { data, error } = await query;
    if (!error && data) {
      setPosts(data as unknown as Post[]);
    }
    setLoading(false);
  };

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
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleFollow = async (userId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const isFollowing = followingIds.has(userId);
    
    if (isFollowing) {
      await supabase
        .from('user_connections')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);
      
      setFollowingIds(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    } else {
      await supabase
        .from('user_connections')
        .insert({ follower_id: user.id, following_id: userId });
      
      setFollowingIds(prev => new Set(prev).add(userId));
    }
  };

  // Combine real posts with demo posts if no real posts exist
  const displayPosts = posts.length > 0 ? posts : [];
  const displayUsers = suggestedUsers.length > 0 ? suggestedUsers : demoUsers.slice(0, 5) as unknown as Profile[];

  // Filter demo posts by category
  const filteredDemoPosts = activeCategory === 'all' 
    ? demoPosts 
    : demoPosts.filter(p => p.post_type === activeCategory);

  const upcomingEvent = demoEvents[0];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Workshop Feed</h1>
              <p className="text-muted-foreground">
                See what your peers are building today.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending
              </Button>
            </div>
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
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : displayPosts.length === 0 && filteredDemoPosts.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground mb-4">No posts yet. Be the first to share something!</p>
              <Button onClick={() => navigate('/create')}>Create Post</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Real posts first */}
              {displayPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PostCard
                    id={post.id}
                    author={{
                      name: post.is_anonymous ? "Anonymous" : (post.profiles?.full_name || "Unknown User"),
                      avatar: post.profiles?.avatar_url || undefined,
                      field: post.profiles?.university || "Student",
                    }}
                    timeAgo={getTimeAgo(post.created_at)}
                    title={post.title || ""}
                    content={post.content}
                    tags={post.tags}
                    image={post.media_urls?.[0]}
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
              
              {/* Demo posts if no real posts */}
              {displayPosts.length === 0 && filteredDemoPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PostCard
                    author={{
                      name: post.author.full_name,
                      avatar: post.author.avatar_url || undefined,
                      field: post.author.university || "Student",
                    }}
                    timeAgo={getTimeAgo(post.created_at)}
                    title={post.title}
                    content={post.content}
                    tags={post.tags}
                    likes={post.likes_count}
                    comments={post.comments_count}
                    isCodePost={post.post_type === 'code'}
                    code={post.code_content ? {
                      content: post.code_content,
                      language: post.code_language || 'python',
                      filename: `snippet.${post.code_language || 'py'}`
                    } : undefined}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Load More */}
          {(displayPosts.length > 0 || filteredDemoPosts.length > 0) && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" className="gap-2">
                Load More
              </Button>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 hidden xl:block space-y-6">
          {/* Trending Tech - Enhanced */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Trending Tech</h3>
              <Button variant="link" className="text-primary p-0 h-auto text-sm" asChild>
                <Link to="/explore">View all</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {trendingTech.slice(0, 4).map((tech) => (
                <div
                  key={tech.name}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/explore?tag=${tech.name}`)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg ${tech.color} flex items-center justify-center text-white text-xs font-bold`}
                      >
                        {tech.abbr}
                      </div>
                      <span className="font-medium text-foreground">{tech.name}</span>
                    </div>
                    <span className="text-sm text-success font-medium">
                      {tech.change}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-11">{tech.reason}</p>
                  <p className="text-xs text-muted-foreground ml-11">{tech.postCount} posts</p>
                </div>
              ))}
            </div>
          </div>

          {/* People to Follow - Enhanced */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">People to Follow</h3>
            </div>
            <div className="space-y-4">
              {displayUsers.map((profile) => {
                const isFollowing = followingIds.has(profile.id);
                return (
                  <div
                    key={profile.id}
                    className="flex items-start gap-3"
                  >
                    <Link to={`/profile/${profile.id}`}>
                      <UserAvatar 
                        name={profile.full_name || "User"} 
                        src={profile.avatar_url || undefined}
                        size="sm" 
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/profile/${profile.id}`} className="block hover:underline">
                        <p className="font-medium text-sm text-foreground truncate">
                          {profile.full_name || "User"}
                        </p>
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        {profile.university || profile.role}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <RoleBadge role={profile.role} size="sm" />
                        {profile.skills?.slice(0, 2).map(skill => (
                          <Tag key={skill} variant="default" className="text-xs py-0 px-1.5">
                            {skill}
                          </Tag>
                        ))}
                      </div>
                    </div>
                    <Button 
                      variant={isFollowing ? "outline" : "default"} 
                      size="sm"
                      className="shrink-0"
                      onClick={() => handleFollow(profile.id)}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  </div>
                );
              })}
            </div>
            <Button 
              variant="link" 
              className="text-primary p-0 h-auto text-sm mt-3"
              onClick={() => navigate('/connections')}
            >
              See More Suggestions
            </Button>
          </div>

          {/* Event Banner - Enhanced */}
          <Link to="/events" className="block">
            <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-xl p-5 text-white hover:opacity-95 transition-opacity">
              <Tag className="bg-white/20 text-white border-0 mb-3">
                UPCOMING EVENT
              </Tag>
              <h3 className="text-lg font-bold mb-2">{upcomingEvent.title}</h3>
              <p className="text-sm text-white/80 mb-2">
                {upcomingEvent.description?.substring(0, 80)}...
              </p>
              <div className="flex items-center gap-4 text-sm text-white/70 mb-4">
                <span>{upcomingEvent.is_online ? '🌐 Online' : `📍 ${upcomingEvent.location}`}</span>
                <span>👥 {upcomingEvent.participant_count} registered</span>
              </div>
              <Button
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 gap-2"
              >
                Register Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default Home;
