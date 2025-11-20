-- 1. Create the Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name TEXT,
  email TEXT,
  target_role TEXT,
  resume_text TEXT,
  resume_base64 TEXT,
  last_ats_score INTEGER DEFAULT 0,
  last_interview_date BIGINT
);

-- 2. Create the Saved Jobs table
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  company TEXT,
  url TEXT,
  description TEXT,
  date_saved BIGINT
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- 4. Clean up old policies (to avoid errors if you run this twice)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own saved jobs" ON public.saved_jobs;
DROP POLICY IF EXISTS "Users can add saved jobs" ON public.saved_jobs;
DROP POLICY IF EXISTS "Users can delete their own saved jobs" ON public.saved_jobs;

-- 5. Create Policies for Profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id );

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 6. Create Policies for Saved Jobs
CREATE POLICY "Users can view their own saved jobs"
  ON public.saved_jobs FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can add saved jobs"
  ON public.saved_jobs FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own saved jobs"
  ON public.saved_jobs FOR DELETE
  USING ( auth.uid() = user_id );
