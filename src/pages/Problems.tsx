import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb, Send, Tag, Code2, ChevronRight, Loader2, Brain,
  Users, BookOpen, ArrowRight, Sparkles, Clock, CheckCircle2,
  Zap, MessageCircle, HelpCircle, Layers
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

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } }),
};

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

  const difficultyColor = (d: string | null) => {
    if (!d) return "bg-muted text-muted-foreground";
    if (d === "easy") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (d === "medium") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-primary/15 shadow-sm">
            <Lightbulb className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Ask the Workshop
            </h1>
            <p className="text-muted-foreground mt-1 max-w-lg">
              Submit your coding problem and get AI-powered analysis, mentor matches, and structured guidance — all in seconds.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span>AI Analysis</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>Mentor Match</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span>Resources</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3 h-11 rounded-xl bg-muted/60 p-1">
          <TabsTrigger value="submit" className="rounded-lg gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <HelpCircle className="h-4 w-4" />
            Submit
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Layers className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="result" disabled={!result} className="rounded-lg gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Brain className="h-4 w-4" />
            Analysis
          </TabsTrigger>
        </TabsList>

        {/* SUBMIT TAB */}
        <TabsContent value="submit" className="mt-6">
          <motion.div initial="hidden" animate="visible" className="space-y-5">
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardContent className="pt-6 space-y-5">
                <motion.div custom={0} variants={fadeUp}>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Problem Title
                  </label>
                  <Input
                    placeholder="e.g. React useEffect cleanup causing memory leak"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={150}
                    className="h-11 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                  />
                </motion.div>

                <motion.div custom={1} variants={fadeUp}>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Detailed Description
                  </label>
                  <Textarea
                    placeholder="Describe what you're trying to do, what's happening, and what you've tried so far..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[140px] bg-muted/30 border-border/50 focus:bg-background transition-colors"
                    maxLength={3000}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">{description.length}/3000 characters</p>
                </motion.div>

                <motion.div custom={2} variants={fadeUp}>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Tech Stack Tags
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. react, python, sql"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      className="h-10 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                    />
                    <Button variant="outline" size="sm" onClick={addTag} type="button" className="h-10 px-3">
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {tags.map((t) => (
                        <Badge
                          key={t}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors px-2.5 py-1"
                          onClick={() => setTags(tags.filter((x) => x !== t))}
                        >
                          {t} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </motion.div>

                <motion.div custom={3} variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">
                      Skill Level
                    </label>
                    <Select value={skillLevel} onValueChange={setSkillLevel}>
                      <SelectTrigger className="h-10 bg-muted/30 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">🌱 Beginner</SelectItem>
                        <SelectItem value="intermediate">⚡ Intermediate</SelectItem>
                        <SelectItem value="advanced">🔥 Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>

                <motion.div custom={4} variants={fadeUp}>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Code Snippet <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <Textarea
                    placeholder="Paste relevant code here..."
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    className="min-h-[100px] font-mono text-sm bg-muted/30 border-border/50 focus:bg-background transition-colors"
                    maxLength={5000}
                  />
                </motion.div>

                <motion.div custom={5} variants={fadeUp}>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || analyzing || !title.trim() || !description.trim()}
                    className="w-full h-12 gap-2.5 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    size="lg"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Submit & Analyze
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history" className="mt-6">
          <AnimatePresence mode="wait">
            {problems.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-dashed border-2 border-border/40">
                  <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Lightbulb className="h-8 w-8 text-primary/60" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">No problems yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Submit your first coding challenge and get instant AI-powered guidance.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-5 gap-2"
                      onClick={() => setTab("submit")}
                    >
                      <Lightbulb className="h-4 w-4" />
                      Submit a Problem
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="list" initial="hidden" animate="visible" className="space-y-3">
                {problems.map((p, i) => (
                  <motion.div key={p.id} custom={i} variants={fadeUp}>
                    <Card
                      className="group cursor-pointer border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                      onClick={() => viewProblem(p)}
                    >
                      <CardContent className="py-4 px-5">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                            p.status === "analyzed"
                              ? "bg-primary/10"
                              : "bg-muted"
                          }`}>
                            {p.status === "analyzed" ? (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                {p.title}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {p.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                              {(p.tech_tags || []).slice(0, 4).map((t) => (
                                <Badge key={t} variant="outline" className="text-xs font-medium px-2 py-0.5 rounded-md">
                                  {t}
                                </Badge>
                              ))}
                              {p.ai_difficulty && (
                                <Badge className={`text-xs font-medium capitalize px-2 py-0.5 rounded-md border-0 ${difficultyColor(p.ai_difficulty)}`}>
                                  {p.ai_difficulty}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground ml-auto">
                                {new Date(p.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* RESULT TAB */}
        <TabsContent value="result" className="mt-6">
          {result && (
            <motion.div initial="hidden" animate="visible" className="space-y-5">
              {/* Workshop Assistant Badge */}
              <motion.div custom={0} variants={fadeUp} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">Workshop Assistant</span>
                </div>
              </motion.div>

              {/* Problem Title */}
              <motion.h2 custom={1} variants={fadeUp} className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                {result.problem.title}
              </motion.h2>

              {/* AI Summary */}
              <motion.div custom={2} variants={fadeUp}>
                <Card className="border-primary/15 bg-gradient-to-br from-primary/[0.03] to-transparent shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                      AI Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground leading-relaxed">
                      {result.problem.ai_summary}
                    </p>
                    {result.problem.ai_difficulty && (
                      <Badge className={`mt-3 capitalize font-medium border-0 ${difficultyColor(result.problem.ai_difficulty)}`}>
                        {result.problem.ai_difficulty} difficulty
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Key Concepts */}
              {result.problem.ai_concepts && result.problem.ai_concepts.length > 0 && (
                <motion.div custom={3} variants={fadeUp}>
                  <Card className="shadow-sm border-border/60">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                          <Tag className="h-4 w-4 text-primary" />
                        </div>
                        Key Concepts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {result.problem.ai_concepts.map((c) => (
                          <Badge key={c} variant="secondary" className="px-3 py-1 text-sm font-medium rounded-lg">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Suggested Next Steps */}
              {result.problem.ai_suggested_actions && result.problem.ai_suggested_actions.length > 0 && (
                <motion.div custom={4} variants={fadeUp}>
                  <Card className="shadow-sm border-border/60">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                          <ArrowRight className="h-4 w-4 text-primary" />
                        </div>
                        Suggested Next Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-3">
                        {result.problem.ai_suggested_actions.map((a, i) => (
                          <li key={i} className="flex gap-3.5 text-sm group">
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              {i + 1}
                            </span>
                            <span className="text-foreground pt-1 leading-relaxed">{a}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Learning Resources */}
              {result.problem.ai_learning_topics && result.problem.ai_learning_topics.length > 0 && (
                <motion.div custom={5} variants={fadeUp}>
                  <Card className="shadow-sm border-border/60">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        Learning Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2.5">
                        {result.problem.ai_learning_topics.map((t, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-sm text-foreground p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0" />
                            {t}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Suggested Mentors */}
              {result.mentors && result.mentors.length > 0 && (
                <motion.div custom={6} variants={fadeUp}>
                  <Card className="shadow-sm border-border/60">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        Suggested Mentors
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      {result.mentors.map((m) => (
                        <div
                          key={m.user_id}
                          className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm transition-all cursor-pointer group"
                          onClick={() => navigate(`/profile/${m.user_id}`)}
                        >
                          <UserAvatar
                            name={m.full_name || "Mentor"}
                            src={m.avatar_url || undefined}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                              {m.full_name || "Mentor"}
                            </h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(m.skills || []).slice(0, 4).map((s) => (
                                <Badge key={s} variant="outline" className="text-xs rounded-md">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge className="text-xs bg-primary/10 text-primary border-0 font-semibold">
                              {m.matchScore} match{m.matchScore !== 1 ? "es" : ""}
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Related Posts */}
              {result.relatedPosts && result.relatedPosts.length > 0 && (
                <motion.div custom={7} variants={fadeUp}>
                  <Card className="shadow-sm border-border/60">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                          <Code2 className="h-4 w-4 text-primary" />
                        </div>
                        Related Posts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {result.relatedPosts.map((post) => (
                        <div
                          key={post.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm transition-all cursor-pointer group"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {post.title || post.content.slice(0, 60)}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {post.comments_count || 0}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div custom={8} variants={fadeUp} className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 gap-2 h-11 rounded-xl" onClick={() => setTab("submit")}>
                  <Lightbulb className="h-4 w-4" />
                  Ask Another
                </Button>
                <Button
                  className="flex-1 gap-2 h-11 rounded-xl shadow-md"
                  onClick={() => navigate("/create")}
                >
                  <Send className="h-4 w-4" />
                  Post to Feed
                </Button>
              </motion.div>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Problems;
