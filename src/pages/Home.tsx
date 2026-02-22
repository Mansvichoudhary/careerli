import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Globe, Cpu, Brain, Server, Loader2, Sparkles, Flame, Users, Bot, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFeed } from "@/hooks/useFeed";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { demoUsers } from "@/lib/seedData";
import { TrendingTechItem } from "@/components/widgets/TrendingTech";

const FeaturedMentors = lazy(() => import("@/components/widgets/FeaturedMentors"));
const TrendingTech = lazy(() => import("@/components/widgets/TrendingTech"));
const PopularTags = lazy(() => import("@/components/widgets/PopularTags"));
const SuggestedConnections = lazy(() => import("@/components/widgets/SuggestedConnections"));

const categories = [
  { id: "all", label: "All Posts", icon: Globe },
  { id: "code", label: "Code", icon: Cpu },
  { id: "project", label: "Projects", icon: Brain },
  { id: "text", label: "Discussions", icon: Server },
];

const smartModes = [
  { id: "all", label: "All Posts", icon: Globe },
  { id: "following", label: "Following", icon: Users },
  { id: "trending", label: "Trending", icon: Flame },
  { id: "ai", label: "AI Recommended", icon: Bot },
] as const;

type SmartMode = (typeof smartModes)[number]["id"];

type DiscoverProfile = {
  id: string;
  user_id?: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "student" | "mentor";
  university: string | null;
  skills: string[];
};

const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [smartMode, setSmartMode] = useState<SmartMode>("all");
  const [skillLevel, setSkillLevel] = useState("all");
  const [activeTag, setActiveTag] = useState("");
  const [users, setUsers] = useState<DiscoverProfile[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const { posts, loading, refreshPosts } = useFeed();
  const { user, profile } = useAuth();

  useEffect(() => {
    refreshPosts(activeCategory);
  }, [activeCategory, refreshPosts]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("profiles").select("id, user_id, full_name, avatar_url, role, university, skills").limit(20);
      if (data && data.length > 0) {
        setUsers(data.map((u) => ({ ...u, skills: u.skills ?? [] })) as DiscoverProfile[]);
      } else {
        setUsers(
          demoUsers.map((u) => ({
            id: u.id,
            user_id: u.id,
            full_name: u.full_name,
            avatar_url: u.avatar_url,
            role: u.role,
            university: u.university,
            skills: u.skills,
          })),
        );
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchFollowing = async () => {
      if (!user) return;
      const { data } = await supabase.from("user_connections").select("following_id").eq("follower_id", user.id);
      if (data) setFollowingIds(new Set(data.map((f) => f.following_id)));
    };

    fetchFollowing();
  }, [user]);

  const mentors = useMemo(() => users.filter((u) => u.role === "mentor"), [users]);

  const popularTags = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((post) => {
      (post.tags || []).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);
  }, [posts]);

  const trendingTech: TrendingTechItem[] = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const counts = new Map<string, number>();

    posts
      .filter((post) => new Date(post.created_at).getTime() >= weekAgo)
      .forEach((post) => {
        (post.tags || []).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
      });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, postCount]) => ({
        name,
        abbr: name.slice(0, 2).toUpperCase(),
        postCount,
        change: `+${Math.min(postCount * 3, 48)}%`,
        color: "bg-primary",
      }));
  }, [posts]);

  const suggestedConnections = useMemo(() => {
    const mySkills = new Set((profile?.skills || []).map((s) => s.toLowerCase()));
    return users
      .filter((u) => u.role === "student" && u.user_id !== user?.id)
      .map((u) => ({
        ...u,
        overlap: u.skills.reduce((acc, skill) => (mySkills.has(skill.toLowerCase()) ? acc + 1 : acc), 0),
      }))
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 5);
  }, [users, user?.id, profile?.skills]);

  const filteredPosts = useMemo(() => {
    const basePosts = activeCategory === "all" ? posts : posts.filter((post) => post.post_type === activeCategory);

    const skillFiltered =
      skillLevel === "all"
        ? basePosts
        : basePosts.filter((post) =>
            (post.tags || []).some((tag) => tag.toLowerCase().includes(skillLevel.toLowerCase())),
          );

    const tagFiltered =
      !activeTag
        ? skillFiltered
        : skillFiltered.filter((post) => (post.tags || []).some((tag) => tag.toLowerCase() === activeTag.toLowerCase()));

    const modeFiltered =
      smartMode === "following"
        ? tagFiltered.filter((post) => followingIds.has(post.user_id))
        : smartMode === "trending"
          ? [...tagFiltered].sort((a, b) => (b.likes_count || 0) + (b.comments_count || 0) - ((a.likes_count || 0) + (a.comments_count || 0)))
          : smartMode === "ai"
            ? [...tagFiltered].sort((a, b) => {
                const mySkills = new Set((profile?.skills || []).map((s) => s.toLowerCase()));
                const score = (post: (typeof tagFiltered)[number]) => {
                  const tagMatch = (post.tags || []).reduce((acc, tag) => (mySkills.has(tag.toLowerCase()) ? acc + 3 : acc), 0);
                  const engagement = (post.likes_count || 0) + (post.comments_count || 0) * 2;
                  const recencyWeight = Math.max(0, 7 - (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24));
                  return tagMatch + engagement + recencyWeight;
                };
                return score(b) - score(a);
              })
            : tagFiltered;

    return modeFiltered;
  }, [activeCategory, activeTag, followingIds, posts, profile?.skills, skillLevel, smartMode]);

  const unansweredPosts = useMemo(() => posts.filter((post) => (post.comments_count || 0) === 0).slice(0, 8), [posts]);

  const handleFollow = async (userId: string) => {
    if (!user) return;
    const isFollowing = followingIds.has(userId);
    if (isFollowing) {
      await supabase.from("user_connections").delete().eq("follower_id", user.id).eq("following_id", userId);
      setFollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      return;
    }

    await supabase.from("user_connections").insert({ follower_id: user.id, following_id: userId });
    setFollowingIds((prev) => new Set(prev).add(userId));
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 space-y-5">
          <div className="border-b border-border pb-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {categories.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  size="sm"
                  variant={activeCategory === id ? "default" : "outline"}
                  className="shrink-0 gap-2 transition-all hover:-translate-y-0.5"
                  onClick={() => setActiveCategory(id)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {smartModes.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  size="sm"
                  variant={smartMode === id ? "default" : "outline"}
                  className="gap-2 transition-all hover:-translate-y-0.5"
                  onClick={() => setSmartMode(id)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
              <div className="ml-auto min-w-[170px]">
                <Select value={skillLevel} onValueChange={setSkillLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                Unanswered Problems
              </h3>
              <span className="text-xs text-muted-foreground">Help solve fast</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {unansweredPosts.map((post) => (
                <div key={post.id} className="min-w-[240px] rounded-lg border border-border/70 p-3 transition hover:border-primary/30 hover:bg-primary/5">
                  <p className="line-clamp-1 text-sm font-medium">{post.title || "Untitled"}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{post.content}</p>
                  <Button size="sm" variant="outline" className="mt-3 gap-1">
                    Help Solve
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">No posts found.</div>
          ) : (
            <div className="space-y-5">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  className="transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <PostCard
                    id={post.id}
                    author={{
                      name: post.is_anonymous ? "Anonymous" : post.profiles?.full_name || post.profiles?.username || "User",
                      avatar: post.is_anonymous ? undefined : post.profiles?.avatar_url || undefined,
                      field: post.profiles?.university || post.profiles?.role || "Member",
                    }}
                    timeAgo={getTimeAgo(post.created_at)}
                    title={post.title || "Untitled"}
                    content={post.content}
                    tags={post.tags || []}
                    code={post.code_content ? { content: post.code_content, language: post.code_language || "text" } : undefined}
                    likes={post.likes_count || 0}
                    comments={post.comments_count || 0}
                    isCodePost={post.post_type === "code"}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <Suspense
          fallback={
            <aside className="hidden space-y-4 xl:block">
              <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">Loading insights…</div>
            </aside>
          }
        >
          <aside className="hidden space-y-4 xl:block">
            <FeaturedMentors mentors={mentors} followingIds={followingIds} onFollow={handleFollow} />
            <TrendingTech items={trendingTech} onSelect={setActiveTag} />
            <PopularTags tags={popularTags} onSelectTag={setActiveTag} />
            <SuggestedConnections users={suggestedConnections} connectedIds={followingIds} onConnect={handleFollow} />
            {activeTag && (
              <Link to="/explore" className="block rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-primary hover:bg-primary/10">
                Filtering by #{activeTag}. Open advanced search in Explore →
              </Link>
            )}
          </aside>
        </Suspense>
      </div>
    </div>
  );
};

export default Home;
