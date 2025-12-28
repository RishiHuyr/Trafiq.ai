-- Create table for video uploads and analysis
CREATE TABLE public.video_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_name TEXT NOT NULL,
  video_size BIGINT,
  video_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  primary_cause TEXT,
  primary_cause_confidence NUMERIC(5,2),
  secondary_factors JSONB DEFAULT '[]'::jsonb,
  timeline_events JSONB DEFAULT '[]'::jsonb,
  ai_insights TEXT,
  prevention_recommendations JSONB DEFAULT '[]'::jsonb,
  detected_vehicles JSONB DEFAULT '[]'::jsonb,
  speed_patterns JSONB DEFAULT '[]'::jsonb,
  behaviors_detected JSONB DEFAULT '[]'::jsonb,
  raw_ai_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.video_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for user access (users can only see their own analyses)
CREATE POLICY "Users can view their own video analyses" 
ON public.video_analyses 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create video analyses" 
ON public.video_analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own video analyses" 
ON public.video_analyses 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own video analyses" 
ON public.video_analyses 
FOR DELETE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_video_analyses_updated_at
BEFORE UPDATE ON public.video_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public) VALUES ('accident-videos', 'accident-videos', false);

-- Create storage policies for video uploads
CREATE POLICY "Users can upload their own videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'accident-videos');

CREATE POLICY "Users can view their own videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'accident-videos');

CREATE POLICY "Users can delete their own videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'accident-videos');