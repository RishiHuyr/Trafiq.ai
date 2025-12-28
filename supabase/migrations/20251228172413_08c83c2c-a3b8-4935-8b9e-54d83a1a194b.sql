-- Drop existing insecure RLS policies on video_analyses
DROP POLICY IF EXISTS "Users can view their own video analyses" ON public.video_analyses;
DROP POLICY IF EXISTS "Users can create video analyses" ON public.video_analyses;
DROP POLICY IF EXISTS "Users can update their own video analyses" ON public.video_analyses;
DROP POLICY IF EXISTS "Users can delete their own video analyses" ON public.video_analyses;

-- Create strict RLS policies without NULL bypass
CREATE POLICY "Users can view their own video analyses" 
ON public.video_analyses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create video analyses" 
ON public.video_analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video analyses" 
ON public.video_analyses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video analyses" 
ON public.video_analyses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Drop existing insecure storage policies
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;

-- Create user-isolated storage policies using folder structure
CREATE POLICY "Users can upload to their own folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'accident-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own videos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'accident-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own videos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'accident-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own videos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'accident-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);