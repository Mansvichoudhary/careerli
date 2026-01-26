import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  Folder,
  Users,
  MessageSquare,
  Code2,
  Linkedin,
  Link as LinkIcon,
  Star,
  GitFork,
  ExternalLink,
  Plus,
  CheckCircle2,
  Eye,
  UserPlus,
  UserCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import UserAvatar from "@/components/Avatar";
import RoleBadge from "@/components/RoleBadge";
import PostCard from "@/components/PostCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'student' | 'mentor';
  location: string | null;
  university: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
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
}

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile: currentUserProfile } = useAuth();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  
  const isOwnProfile = !id || (user && profileData?.user_id === user.id);

  useEffect(() => {
    if (id) {
      fetchProfile(id);
    } else if (user) {
      fetchOwnProfile();
    }
  }, [id, user]);

  const fetchProfile = async (profileId: string) => {
    setLoading(true);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .maybeSingle();

    if (error || !profile) {
      toast({ title: "Profile not found", variant: "destructive" });
      navigate('/home');
      return;
    }

    setProfileData(profile as Profile);
    await Promise.all([
      fetchUserPosts(profile.user_id),
      fetchFollowStatus(profile.id),
      fetchCounts(profile.user_id, profile.id)
    ]);
    setLoading(false);
  };

  const fetchOwnProfile = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profile) {
      setProfileData(profile as Profile);
      await Promise.all([
        fetchUserPosts(user.id),
        fetchCounts(user.id, profile.id)
      ]);
    }
    setLoading(false);
  };

  const fetchUserPosts = async (userId: string) => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setPosts(data as Post[]);
      setPostsCount(data.length);
    }
  };

  const fetchFollowStatus = async (profileId: string) => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_connections')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', profileId)
      .maybeSingle();

    setIsFollowing(!!data);
  };

  const fetchCounts = async (userId: string, profileId: string) => {
    // Followers count
    const { count: followers } = await supabase
      .from('user_connections')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profileId);

    // Following count  
    const { count: following } = await supabase
      .from('user_connections')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    setFollowersCount(followers || 0);
    setFollowingCount(following || 0);
  };

  const handleFollow = async () => {
    if (!user || !profileData) {
      navigate('/login');
      return;
    }

    if (isFollowing) {
      await supabase
        .from('user_connections')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profileData.id);
      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
    } else {
      await supabase
        .from('user_connections')
        .insert({ follower_id: user.id, following_id: profileData.id });
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  const stats = [
    { label: "Posts", value: postsCount.toString(), icon: Folder },
    { label: "Followers", value: followersCount.toString(), icon: Users },
    { label: "Following", value: followingCount.toString(), icon: Users },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex gap-6">
        {/* Left Column - Profile Info */}
        <aside className="w-80 space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6 text-center"
          >
            <div className="relative inline-block mb-4">
              <UserAvatar name={profileData.full_name || "User"} src={profileData.avatar_url || undefined} size="xl" />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{profileData.full_name || "User"}</h2>
            <p className="text-muted-foreground">{profileData.university || profileData.role}</p>
            <div className="flex justify-center mt-2">
              <RoleBadge role={profileData.role} size="md" />
            </div>

            {!isOwnProfile && (
              <div className="flex gap-2 mt-4">
                <Button 
                  className="flex-1 gap-2" 
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollow}
                >
                  {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button variant="outline" className="flex-1">
                  Message
                </Button>
              </div>
            )}

            {isOwnProfile && (
              <Button className="w-full mt-4" variant="outline" onClick={() => navigate('/settings')}>
                Edit Profile
              </Button>
            )}

            <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-border">
              {profileData.github_url && (
                <a href={profileData.github_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2">
                    <Code2 className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">GitHub</span>
                  </Button>
                </a>
              )}
              {profileData.linkedin_url && (
                <a href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2">
                    <Linkedin className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">LinkedIn</span>
                  </Button>
                </a>
              )}
              {profileData.portfolio_url && (
                <a href={profileData.portfolio_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2">
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Website</span>
                  </Button>
                </a>
              )}
            </div>
          </motion.div>

          {/* About Me */}
          {profileData.bio && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <h3 className="font-semibold text-foreground mb-3">About Me</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profileData.bio}
              </p>
            </motion.div>
          )}

          {/* Top Skills */}
          {profileData.skills && profileData.skills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <h3 className="font-semibold text-foreground mb-3">Top Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill) => (
                  <Tag key={skill} variant="default">
                    {skill}
                  </Tag>
                ))}
              </div>
            </motion.div>
          )}
        </aside>

        {/* Right Column - Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <stat.icon className="h-4 w-4" />
                  <span className="text-sm">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Recent Posts
              </h3>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No posts yet</p>
                {isOwnProfile && (
                  <Button onClick={() => navigate('/create')}>Create Your First Post</Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    author={{
                      name: profileData.full_name || "User",
                      avatar: profileData.avatar_url || undefined,
                      field: profileData.university || profileData.role,
                    }}
                    timeAgo={getTimeAgo(post.created_at)}
                    title={post.title || ""}
                    content={post.content}
                    tags={post.tags || []}
                    likes={post.likes_count || 0}
                    comments={post.comments_count || 0}
                    isCodePost={post.post_type === 'code'}
                    code={post.code_content ? {
                      content: post.code_content,
                      language: post.code_language || 'javascript',
                      filename: `snippet.${post.code_language || 'js'}`
                    } : undefined}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
