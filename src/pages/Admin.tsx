import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminPost {
  id: string;
  title: string | null;
  content: string;
  user_id: string;
  created_at: string;
  is_pinned: boolean | null;
}

interface AdminProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  role: "student" | "mentor" | "admin";
}

const Admin = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);

    const [{ data: postsData, error: postsError }, { data: usersData, error: usersError }] = await Promise.all([
      supabase.from("posts").select("id, title, content, user_id, created_at, is_pinned").order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).limit(200),
      supabase.from("profiles").select("id, user_id, full_name, username, role").order("created_at", { ascending: false }).limit(200),
    ]);

    if (postsError) {
      toast({ title: "Unable to load posts", description: postsError.message, variant: "destructive" });
    } else {
      setPosts((postsData ?? []) as AdminPost[]);
    }

    if (usersError) {
      toast({ title: "Unable to load users", description: usersError.message, variant: "destructive" });
    } else {
      setUsers((usersData ?? []) as AdminProfile[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const handleRoleChange = async (userId: string, role: AdminProfile["role"]) => {
    const { error } = await supabase.from("profiles").update({ role }).eq("user_id", userId);
    if (error) {
      toast({ title: "Unable to update role", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Role updated" });
    await loadData();
  };

  const handleDeletePost = async (postId: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      toast({ title: "Unable to delete post", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Post deleted" });
    await loadData();
  };

  const analytics = useMemo(() => {
    const pinned = posts.filter((post) => post.is_pinned).length;
    const mentors = users.filter((user) => user.role === "mentor").length;
    const admins = users.filter((user) => user.role === "admin").length;
    return {
      posts: posts.length,
      users: users.length,
      pinned,
      mentors,
      admins,
    };
  }, [posts, users]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle>Total Posts</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{analytics.posts}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Users</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{analytics.users}</CardContent></Card>
        <Card><CardHeader><CardTitle>Pinned Posts</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{analytics.pinned}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Reported Content</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Report queue integration is pending. Use this dashboard to moderate posts and users directly.
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Moderate Users</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {users.map((profile) => (
            <div key={profile.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{profile.full_name || profile.username || "User"}</p>
                <p className="text-xs text-muted-foreground">{profile.user_id}</p>
              </div>
              <Select value={profile.role} onValueChange={(value) => handleRoleChange(profile.user_id, value as AdminProfile["role"])}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">student</SelectItem>
                  <SelectItem value="mentor">mentor</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Moderate Posts</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{post.title || "Untitled"} {post.is_pinned ? "📌" : ""}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => handleDeletePost(post.id)}>Delete</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
    </div>
  );
};

export default Admin;
