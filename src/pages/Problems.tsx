import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lightbulb, Send, Tag, Code2, ChevronRight, Loader2, Brain,
  Users, BookOpen, ArrowRight, Sparkles, Clock, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import UserAvatar from "@/components/Avatar";
import { useProblems, Problem, AnalysisResult } from "@/hooks/useProblems";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Problems = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createProblem, analyzeProblem, fetchProblems, loading, analyzing } = useProblems();

  const [tab, setTab] = useState("submit");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState("beginner");
  const [codeSnippet, setCodeSnippet] = useState("");

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    const data = await fetchProblems();
    setProblems(data);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    if (description.trim().length < 20) {
      toast.error("Please provide more detail (at least 20 characters)");
      return;
    }

    const problem = await createProblem({
      title: title.trim(),
      description: description.trim(),
      tech_tags: tags,
      skill_level: skillLevel,
      code_snippet: codeSnippet.trim() || undefined,
    });

    if (!problem) return;

    toast.success("Problem submitted! Analyzing...");
    const analysis = await analyzeProblem(problem.id);
    if (analysis) {
      setResult(analysis);
      setTab("result");
      loadProblems();
    }

    // Reset form
    setTitle("");
    setDescription("");
    setTags([]);
    setCodeSnippet("");
    setSkillLevel("beginner");
  };

  const viewProblem = async (p: Problem) => {
    if (p.status === "analyzed" && p.ai_summary) {
      setResult({
        problem: p,
        mentors: [],
        relatedPosts: [],
      });
      setTab("result");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Lightbulb className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ask the Workshop</h1>
          <p className="text-sm text-muted-foreground">
            Submit a problem, get structured guidance from AI and mentors
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="submit">Submit Problem</TabsTrigger>
          <TabsTrigger value="history">My Problems</TabsTrigger>
          <TabsTrigger value="result" disabled={!result}>
            Analysis
          </TabsTrigger>
        </TabsList>

        {/* SUBMIT TAB */}
        <TabsContent value="submit" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Problem Title
                </label>
                <Input
                  placeholder="e.g. React useEffect cleanup causing memory leak"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={150}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Detailed Description
                </label>
                <Textarea
                  placeholder="Describe what you're trying to do, what's happening, and what you've tried so far..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[140px]"
                  maxLength={3000}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Tech Stack Tags
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. react, python, sql"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button variant="outline" size="sm" onClick={addTag} type="button">
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setTags(tags.filter((x) => x !== t))}
                      >
                        {t} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Skill Level
                </label>
                <Select value={skillLevel} onValueChange={setSkillLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Code Snippet (optional)
                </label>
                <Textarea
                  placeholder="Paste relevant code here..."
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                  maxLength={5000}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading || analyzing || !title.trim() || !description.trim()}
                className="w-full gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit & Analyze
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history" className="space-y-3 mt-4">
          {problems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No problems submitted yet</p>
              </CardContent>
            </Card>
          ) : (
            problems.map((p) => (
              <Card
                key={p.id}
                className="cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => viewProblem(p)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {p.status === "analyzed" ? (
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <h3 className="font-medium text-foreground truncate">{p.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {p.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(p.tech_tags || []).slice(0, 4).map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                        {p.ai_difficulty && (
                          <Badge variant="secondary" className="text-xs capitalize">
                            {p.ai_difficulty}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* RESULT TAB */}
        <TabsContent value="result" className="space-y-4 mt-4">
          {result && (
            <>
              {/* Workshop Assistant Badge */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Workshop Assistant Insight</span>
              </div>

              {/* Problem Title */}
              <h2 className="text-xl font-bold text-foreground">{result.problem.title}</h2>

              {/* Section 1: AI Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    AI Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground leading-relaxed">
                    {result.problem.ai_summary}
                  </p>
                  {result.problem.ai_difficulty && (
                    <Badge className="mt-3 capitalize">{result.problem.ai_difficulty}</Badge>
                  )}
                </CardContent>
              </Card>

              {/* Section 2: Key Concepts */}
              {result.problem.ai_concepts && result.problem.ai_concepts.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      Key Concepts Identified
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.problem.ai_concepts.map((c) => (
                        <Badge key={c} variant="secondary">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 3: Suggested Next Steps */}
              {result.problem.ai_suggested_actions && result.problem.ai_suggested_actions.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      Suggested Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {result.problem.ai_suggested_actions.map((a, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-foreground pt-0.5">{a}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {/* Section 4: Learning Topics */}
              {result.problem.ai_learning_topics && result.problem.ai_learning_topics.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Learning Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.problem.ai_learning_topics.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          {t}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 5: Suggested Mentors */}
              {result.mentors && result.mentors.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Suggested Mentors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.mentors.map((m) => (
                      <div
                        key={m.user_id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/profile/${m.user_id}`)}
                      >
                        <UserAvatar
                          name={m.full_name || "Mentor"}
                          src={m.avatar_url || undefined}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground">
                            {m.full_name || "Mentor"}
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(m.skills || []).slice(0, 4).map((s) => (
                              <Badge key={s} variant="outline" className="text-xs">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {m.matchScore} match{m.matchScore !== 1 ? "es" : ""}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Section 6: Related Posts */}
              {result.relatedPosts && result.relatedPosts.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-primary" />
                      Related Workshop Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.relatedPosts.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {post.title || post.content.slice(0, 60)}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>👍 {post.likes_count || 0}</span>
                            <span>💬 {post.comments_count || 0}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setTab("submit")}>
                  <Lightbulb className="h-4 w-4" />
                  Ask Another
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={() => navigate("/create")}
                >
                  <Send className="h-4 w-4" />
                  Post to Workshop Feed
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Problems;
