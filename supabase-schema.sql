-- Create translation_logs table
CREATE TABLE IF NOT EXISTS translation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  english_text TEXT NOT NULL,
  kyrgyz_text TEXT NOT NULL,
  kyrgyz_audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create vocabulary_cards table
CREATE TABLE IF NOT EXISTS vocabulary_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  english_word TEXT NOT NULL,
  kyrgyz_word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example_sentence_en TEXT NOT NULL,
  example_sentence_ky TEXT NOT NULL,
  word_audio_url TEXT,
  example_audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_translation_logs_created_at ON translation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vocabulary_cards_created_at ON vocabulary_cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vocabulary_cards_english_word ON vocabulary_cards(english_word);

-- Enable Row Level Security (RLS)
ALTER TABLE translation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth requirements)
-- For development, we'll allow all operations. In production, you should add user authentication.
CREATE POLICY "Allow all operations on translation_logs" ON translation_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on vocabulary_cards" ON vocabulary_cards
  FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-files', 'audio-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for audio files
CREATE POLICY "Allow public access to audio files" ON storage.objects
  FOR ALL USING (bucket_id = 'audio-files');

-- ============================================================
-- GAMIFICATION & COURSE SYSTEM TABLES
-- ============================================================

-- User Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User Statistics for Gamification
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  total_points INTEGER DEFAULT 0 NOT NULL,
  current_level INTEGER DEFAULT 1 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  lessons_completed INTEGER DEFAULT 0 NOT NULL,
  last_practice_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Courses (Learning Paths)
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'alphabets', 'numbers', 'colors', 'family', 'dining', 'outdoor', 'social', 'daily'
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  icon_emoji TEXT DEFAULT '📚',
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Lessons (Chapters within Courses)
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  points_value INTEGER DEFAULT 10 NOT NULL,
  required_score INTEGER DEFAULT 70 CHECK (required_score BETWEEN 0 AND 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Questions (Individual Exercises)
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'listening', 'matching', 'sentence_builder')),
  question_text TEXT,
  question_audio_url TEXT,
  correct_answer TEXT NOT NULL,
  options JSONB, -- Array of options for multiple choice, pairs for matching, words for sentence builder
  explanation TEXT,
  points_value INTEGER DEFAULT 5 NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User Progress (Lesson Completion)
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false NOT NULL,
  score INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  stars INTEGER DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),
  attempts INTEGER DEFAULT 0 NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, lesson_id)
);

-- User Course Progress (Overall Course Tracking)
CREATE TABLE IF NOT EXISTS user_course_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  current_lesson_id UUID REFERENCES lessons(id),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, course_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_questions_lesson_id ON questions(lesson_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id ON user_course_progress(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for User-Specific Data
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public access to courses, lessons, questions (content is public)
CREATE POLICY "Anyone can view published courses" ON courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Anyone can view lessons" ON lessons
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view questions" ON questions
  FOR SELECT USING (true);

-- User progress is private
CREATE POLICY "Users can view their own lesson progress" ON user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson progress" ON user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" ON user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own course progress" ON user_course_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own course progress" ON user_course_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own course progress" ON user_course_progress
  FOR UPDATE USING (auth.uid() = user_id);
