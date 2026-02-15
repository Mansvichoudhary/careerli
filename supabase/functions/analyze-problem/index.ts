import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { problemId } = await req.json();

    if (!problemId) {
      return new Response(JSON.stringify({ error: "problemId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the problem
    const { data: problem, error: fetchErr } = await supabase
      .from("problems")
      .select("*")
      .eq("id", problemId)
      .eq("author_id", userId)
      .single();

    if (fetchErr || !problem) {
      return new Response(JSON.stringify({ error: "Problem not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit: max 10 analyses per user per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("problems")
      .select("id", { count: "exact", head: true })
      .eq("author_id", userId)
      .not("ai_analyzed_at", "is", null)
      .gte("ai_analyzed_at", today.toISOString());

    if ((count ?? 0) >= 10) {
      return new Response(
        JSON.stringify({ error: "Daily AI analysis limit reached (10/day). Try again tomorrow." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a structured problem analysis assistant for a developer learning platform called "Career — The Workshop".
Your job is to analyze technical problems submitted by students and return ONLY a valid JSON object with the following fields:
{
  "summary": "A concise 2-3 sentence summary of the problem",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "concept_tags": ["array of core CS/programming concepts involved"],
  "mentor_skill_tags": ["array of skills a mentor should have to help"],
  "recommended_actions": ["array of 3-5 concrete next steps the student should take"],
  "learning_topics": ["array of topics/resources the student should study"]
}

Guidelines:
- Focus on guiding thinking, not giving direct answers
- Suggest collaborative approaches over solo solutions
- Be specific about concepts and technologies
- Never suggest copy-paste solutions
- Keep recommendations actionable and learning-oriented
- Return ONLY the JSON object, no markdown, no explanation`;

    const userPrompt = `Problem Title: ${problem.title}
Description: ${problem.description}
Tech Stack: ${(problem.tech_tags || []).join(", ")}
Skill Level: ${problem.skill_level}
${problem.code_snippet ? `Code Snippet:\n\`\`\`\n${problem.code_snippet}\n\`\`\`` : ""}`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "analyze_problem",
                description: "Return structured analysis of a technical problem",
                parameters: {
                  type: "object",
                  properties: {
                    summary: { type: "string" },
                    difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                    concept_tags: { type: "array", items: { type: "string" } },
                    mentor_skill_tags: { type: "array", items: { type: "string" } },
                    recommended_actions: { type: "array", items: { type: "string" } },
                    learning_topics: { type: "array", items: { type: "string" } },
                  },
                  required: ["summary", "difficulty", "concept_tags", "mentor_skill_tags", "recommended_actions", "learning_topics"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "analyze_problem" } },
        }),
      }
    );

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", status, errText);
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    let analysis;
    if (toolCall?.function?.arguments) {
      analysis = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } else {
      // Fallback: try parsing content as JSON
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("AI returned non-structured response");
      analysis = JSON.parse(jsonMatch[0]);
    }

    // Find related posts by matching tags
    const allTags = [...(problem.tech_tags || []), ...(analysis.concept_tags || [])];
    let relatedPostIds: string[] = [];
    if (allTags.length > 0) {
      const { data: relatedPosts } = await supabase
        .from("posts")
        .select("id, tags, likes_count")
        .overlaps("tags", allTags)
        .order("likes_count", { ascending: false })
        .limit(5);
      relatedPostIds = (relatedPosts || []).map((p: any) => p.id);
    }

    // Update problem with AI results
    const { data: updated, error: updateErr } = await supabase
      .from("problems")
      .update({
        ai_summary: analysis.summary,
        ai_concepts: analysis.concept_tags,
        ai_difficulty: analysis.difficulty,
        ai_suggested_actions: analysis.recommended_actions,
        ai_mentor_tags: analysis.mentor_skill_tags,
        ai_learning_topics: analysis.learning_topics,
        related_post_ids: relatedPostIds,
        status: "analyzed",
        ai_analyzed_at: new Date().toISOString(),
      })
      .eq("id", problemId)
      .select()
      .single();

    if (updateErr) {
      console.error("Update error:", updateErr);
      throw new Error("Failed to save analysis");
    }

    // Find matching mentors
    const { data: mentors } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url, skills, bio, role")
      .eq("role", "mentor")
      .overlaps("skills", analysis.mentor_skill_tags)
      .limit(10);

    // Rank mentors by skill overlap
    const rankedMentors = (mentors || [])
      .map((m: any) => ({
        ...m,
        matchScore: (m.skills || []).filter((s: string) =>
          analysis.mentor_skill_tags.some((t: string) =>
            s.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(s.toLowerCase())
          )
        ).length,
      }))
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, 3);

    // Fetch related posts details
    let relatedPosts: any[] = [];
    if (relatedPostIds.length > 0) {
      const { data } = await supabase
        .from("posts")
        .select("id, title, content, tags, likes_count, comments_count, user_id, created_at")
        .in("id", relatedPostIds);
      relatedPosts = data || [];
    }

    return new Response(
      JSON.stringify({
        problem: updated,
        mentors: rankedMentors,
        relatedPosts,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-problem error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
