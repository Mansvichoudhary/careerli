import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Tag } from "@/components/ui/tag";
import Logo from "@/components/Logo";
import UserAvatar from "@/components/Avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const languages = ["Python", "JavaScript", "TypeScript", "Rust", "Go", "Java", "C++"];

const CreatePost = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Python");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [postType, setPostType] = useState("text");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() && tags.length < 5) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handlePublish = async () => {
    if (!user) {
      toast({ title: 'Please log in', description: 'You must be logged in to create a post', variant: 'destructive' });
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill in the title and description', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: title.trim(),
          content: description.trim(),
          post_type: postType,
          code_content: code.trim() || null,
          code_language: code.trim() ? language.toLowerCase() : null,
          tags: tags,
          is_anonymous: anonymous,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Post published!', description: 'Your post has been created successfully.' });
      navigate('/home');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // Save to localStorage as draft
    const draft = {
      title,
      description,
      code,
      language,
      tags,
      anonymous,
      postType,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('post_draft', JSON.stringify(draft));
    toast({ title: 'Draft saved!', description: 'Your draft has been saved locally.' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-40">
        <Logo />
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <UserAvatar 
            name={profile?.full_name || "User"} 
            src={profile?.avatar_url || undefined}
            size="md" 
          />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Create a new post
          </h1>
          <p className="text-muted-foreground mb-6">
            Share your projects, ask complex questions, or start a discussion
            with the community.
          </p>

          {/* Post Type Tabs */}
          <Tabs value={postType} onValueChange={setPostType} className="mb-6">
            <TabsList>
              <TabsTrigger value="text">Question</TabsTrigger>
              <TabsTrigger value="project">Project Showcase</TabsTrigger>
              <TabsTrigger value="code">Code Snippet</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Form */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., How do I optimize this recursive function in Python?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap items-center gap-2 p-3 bg-muted rounded-lg border border-input">
                {tags.map((tag) => (
                  <Tag key={tag} variant="default" removable onRemove={() => handleRemoveTag(tag)}>
                    {tag}
                  </Tag>
                ))}
                {tags.length < 5 && (
                  <Input
                    placeholder="Add up to 5 tags..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="flex-1 min-w-[120px] border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description</Label>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                id="description"
                placeholder="Describe your question or project in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>

            {/* Code Snippet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <span className="text-muted-foreground">&lt;/&gt;</span>
                  Code Snippet (optional)
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg overflow-hidden border border-border">
                {/* Code Editor Header */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-sm text-gray-400 ml-2">code.{language.toLowerCase()}</span>
                </div>
                {/* Code Editor */}
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="w-full min-h-[200px] p-4 bg-code text-code-foreground font-mono text-sm resize-none focus:outline-none"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-3">
              <Switch
                id="anonymous"
                checked={anonymous}
                onCheckedChange={setAnonymous}
              />
              <div>
                <Label htmlFor="anonymous" className="font-medium">
                  Post anonymously
                </Label>
                <p className="text-xs text-muted-foreground">
                  Your name will be hidden from peers
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
              <Button className="gap-2" onClick={handlePublish} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    Publish Post
                    <Send className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatePost;
