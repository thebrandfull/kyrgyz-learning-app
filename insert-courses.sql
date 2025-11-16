-- Temporarily disable RLS to insert seed data
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;

-- Insert Courses
INSERT INTO courses (title, description, category, difficulty, icon_emoji, order_index, is_published) VALUES
  ('Alphabets & Sounds', 'Master the Kyrgyz alphabet and pronunciation basics', 'alphabets', 1, '🔤', 0, true),
  ('Numbers & Counting', 'Learn numbers, counting, and telling time in Kyrgyz', 'numbers', 1, '🔢', 1, true),
  ('Colors & Objects', 'Everyday colors and common objects around you', 'colors', 1, '🎨', 2, true),
  ('Family & Relationships', 'Family members, relationships, and greetings', 'family', 2, '👨‍👩‍👧‍👦', 3, true),
  ('Dining & Food', 'Food vocabulary, ordering, and dining etiquette', 'dining', 2, '🍽️', 4, true),
  ('Outdoor & Nature', 'Weather, seasons, and nature vocabulary', 'outdoor', 2, '🌳', 5, true),
  ('Social Situations', 'Greetings, introductions, and conversations', 'social', 3, '💬', 6, true),
  ('Daily Routines', 'Morning, evening, and everyday activities', 'daily', 3, '⏰', 7, true);

-- Re-enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

SELECT 'Courses inserted! Now run: npm run setup' as status;
