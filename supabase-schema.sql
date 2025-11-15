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
