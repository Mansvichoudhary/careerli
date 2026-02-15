
-- Create problems table for AI-powered problem analysis
CREATE TABLE public.problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tech_tags TEXT[] NOT NULL DEFAULT '{}',
  skill_level TEXT NOT NULL DEFAULT 'beginner',
  code_snippet TEXT,
  ai_summary TEXT,
  ai_concepts TEXT[] DEFAULT '{}',
  ai_difficulty TEXT,
  ai_suggested_actions TEXT[] DEFAULT '{}',
  ai_mentor_tags TEXT[] DEFAULT '{}',
  ai_learning_topics TEXT[] DEFAULT '{}',
  related_post_ids UUID[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  ai_analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Problems are viewable by everyone"
  ON public.problems FOR SELECT USING (true);

CREATE POLICY "Users can create own problems"
  ON public.problems FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own problems"
  ON public.problems FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own problems"
  ON public.problems FOR DELETE USING (auth.uid() = author_id);

-- Trigger for updated_at
CREATE TRIGGER update_problems_updated_at
  BEFORE UPDATE ON public.problems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.problems;
