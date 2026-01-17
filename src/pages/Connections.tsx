import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, UserMinus, Search, Filter, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/Avatar";
import RoleBadge from "@/components/RoleBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'student' | 'mentor';
  university: string | null;
  skills: string[];
}

interface Connection {
  profile: Profile;
  isFollowing: boolean;
  isFollower: boolean;
}

const Connections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"discover" | "following" | "followers">("discover");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user, tab]);

  const fetchConnections = async () => {
    if (!user) return;
    setLoading(true);

    // Get all profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', user.id);

    if (error || !profiles) {
      setLoading(false);
      return;
    }

    // Get user's following list
    const { data: following } = await supabase
      .from('user_connections')
      .select('following_id')
      .eq('follower_id', user.id);

    // Get user's followers list
    const { data: followers } = await supabase
      .from('user_connections')
      .select('follower_id')
      .eq('following_id', user.id);

    const followingIds = new Set(following?.map(f => f.following_id) || []);
    const followerIds = new Set(followers?.map(f => f.follower_id) || []);

    const connectionsData: Connection[] = profiles.map((profile: Profile) => ({
      profile,
      isFollowing: followingIds.has(profile.user_id),
      isFollower: followerIds.has(profile.user_id)
    }));

    // Filter based on tab
    let filtered = connectionsData;
    if (tab === "following") {
      filtered = connectionsData.filter(c => c.isFollowing);
    } else if (tab === "followers") {
      filtered = connectionsData.filter(c => c.isFollower);
    }

    setConnections(filtered);
    setLoading(false);
  };

  const handleFollow = async (profileUserId: string) => {
    if (!user) return;

    const connection = connections.find(c => c.profile.user_id === profileUserId);
    if (!connection) return;

    if (connection.isFollowing) {
      // Unfollow
      await supabase
        .from('user_connections')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profileUserId);
    } else {
      // Follow
      await supabase
        .from('user_connections')
        .insert({ follower_id: user.id, following_id: profileUserId });
    }

    fetchConnections();
  };

  const filteredConnections = connections.filter(c => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.profile.full_name?.toLowerCase().includes(query) ||
      c.profile.username?.toLowerCase().includes(query) ||
      c.profile.university?.toLowerCase().includes(query) ||
      c.profile.skills?.some(s => s.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Connections
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect with students and mentors in your field.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, skills, or university..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={tab === "discover" ? "default" : "outline"}
          onClick={() => setTab("discover")}
        >
          Discover
        </Button>
        <Button
          variant={tab === "following" ? "default" : "outline"}
          onClick={() => setTab("following")}
        >
          Following
        </Button>
        <Button
          variant={tab === "followers" ? "default" : "outline"}
          onClick={() => setTab("followers")}
        >
          Followers
        </Button>
      </div>

      {/* Connections List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredConnections.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {tab === "following" ? "You're not following anyone yet." : 
             tab === "followers" ? "No followers yet." : 
             "No users found matching your search."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredConnections.map((connection, index) => (
            <motion.div
              key={connection.profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl border border-border p-5 card-hover"
            >
              <div className="flex items-start gap-4">
                <UserAvatar
                  name={connection.profile.full_name || "User"}
                  src={connection.profile.avatar_url || undefined}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {connection.profile.full_name || "Unknown User"}
                    </h3>
                    <RoleBadge role={connection.profile.role} size="sm" />
                  </div>
                  {connection.profile.university && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {connection.profile.university}
                    </p>
                  )}
                  {connection.profile.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {connection.profile.bio}
                    </p>
                  )}
                  {connection.profile.skills && connection.profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {connection.profile.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                      {connection.profile.skills.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{connection.profile.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={connection.isFollowing ? "outline" : "default"}
                      className="gap-1"
                      onClick={() => handleFollow(connection.profile.user_id)}
                    >
                      {connection.isFollowing ? (
                        <>
                          <UserMinus className="h-3 w-3" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-1" asChild>
                      <Link to="/chat">
                        <MessageSquare className="h-3 w-3" />
                        Message
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Connections;
