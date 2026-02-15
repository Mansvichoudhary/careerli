import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Problem {
  id: string;
  author_id: string;
  title: string;
  description: string;
  tech_tags: string[];
  skill_level: string;
  code_snippet: string | null;
  ai_summary: string | null;
  ai_concepts: string[] | null;
  ai_difficulty: string | null;
  ai_suggested_actions: string[] | null;
  ai_mentor_tags: string[] | null;
  ai_learning_topics: string[] | null;
  related_post_ids: string[] | null;
  status: string;
  ai_analyzed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  problem: Problem;
  mentors: Array<{
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    skills: string[] | null;
    bio: string | null;
    role: string;
    matchScore: number;
  }>;
  relatedPosts: Array<{
    id: string;
    title: string | null;
    content: string;
    tags: string[] | null;
    likes_count: number;
    comments_count: number;
    user_id: string;
    created_at: string;
  }>;
}

export function useProblems() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const createProblem = async (data: {
    title: string;
    description: string;
    tech_tags: string[];
    skill_level: string;
    code_snippet?: string;
  }) => {
    if (!user) {
      toast.error("You must be logged in");
      return null;
    }
    setLoading(true);
    try {
      const { data: problem, error } = await supabase
        .from("problems")
        .insert({
          author_id: user.id,
          title: data.title,
          description: data.description,
          tech_tags: data.tech_tags,
          skill_level: data.skill_level,
          code_snippet: data.code_snippet || null,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return problem;
    } catch (e: any) {
      toast.error(e.message || "Failed to create problem");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const analyzeProblem = async (problemId: string): Promise<AnalysisResult | null> => {
    setAnalyzing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-problem`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ problemId }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json();
        if (resp.status === 429) {
          toast.error(err.error || "Rate limit reached. Try again later.");
        } else if (resp.status === 402) {
          toast.error(err.error || "AI credits exhausted.");
        } else {
          toast.error(err.error || "Analysis failed");
        }
        return null;
      }

      return await resp.json();
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchProblems = async (): Promise<Problem[]> => {
    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .order("created_at", { ascending: false }) as any;
    if (error) {
      toast.error("Failed to load problems");
      return [];
    }
    return data || [];
  };

  const fetchProblem = async (id: string): Promise<Problem | null> => {
    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .eq("id", id)
      .single() as any;
    if (error) return null;
    return data;
  };

  return { createProblem, analyzeProblem, fetchProblems, fetchProblem, loading, analyzing };
}
