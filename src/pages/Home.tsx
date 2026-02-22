import { useEffect, useMemo, useState } from "react";
import { Globe, Cpu, Brain, Server, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import PostCard from "@/components/PostCard";
import { useFeed } from "@/hooks/useFeed";

const categories = [
  { id: "all", label: "All Posts", icon: Globe },
  { id: "code", label: "Code", icon: Cpu },
  { id: "project", label: "Projects", icon: Brain },
  { id: "text", label: "Discussions", icon: Server },
];

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
  const { posts, loading, refreshPosts } = useFeed();

  useEffect(() => {
    refreshPosts(activeCategory);
  }, [activeCategory, refreshPosts]);

  const filteredPosts = useMemo(
    () => (activeCategory === "all" ? posts : posts.filter((post) => post.post_type === activeCategory)),
    [activeCategory, posts],
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 flex-wrap">
        {categories.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`px-4 py-2 rounded-lg border text-sm flex items-center gap-2 ${
              activeCategory === id ? "bg-primary text-primary-foreground" : "bg-card"
            }`}
            onClick={() => setActiveCategory(id)}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">No posts found.</div>
      ) : (
        <div className="space-y-5">
          {filteredPosts.map((post, index) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
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
    </div>
  );
};

export default Home;
