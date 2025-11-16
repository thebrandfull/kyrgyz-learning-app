# Courses Module Setup Guide

## Overview

The Kyrgyz Learning App now includes a complete gamified course system with:
- 8 comprehensive courses (Alphabets, Numbers, Colors, Family, Dining, Outdoor, Social, Daily Routines)
- 4 question types (Multiple Choice, Listening, Matching Pairs, Sentence Builder)
- User authentication and progress tracking
- Points, levels, and streak system
- 32 lessons total with multiple questions each

## Setup Steps

### 1. Update Supabase Schema

Run the updated schema to create all necessary tables:

```bash
# Copy the SQL from supabase-schema.sql and run in Supabase SQL Editor
```

This creates:
- `user_profiles` - Extended user information
- `user_stats` - Gamification (points, level, streak)
- `courses` - Course metadata
- `lessons` - Lessons within courses
- `questions` - Individual questions with audio URLs
- `user_lesson_progress` - User's lesson completion data
- `user_course_progress` - User's overall course progress

### 2. Generate Audio Files (Optional but Recommended)

The course content includes Kyrgyz words and phrases that need audio pronunciation. You have two options:

#### Option A: Generate All Audio at Once

```bash
# This will generate ~50 audio files and upload to Supabase
npm run generate-audio

# The script will:
# 1. Generate TTS for each unique Kyrgyz phrase
# 2. Upload to Supabase storage (audio-files bucket)
# 3. Save URLs to src/data/audioUrls.json
```

**Note**: This will use ElevenLabs API credits. Estimated: ~50 requests at 500ms intervals = ~25 seconds total runtime.

#### Option B: Skip Audio for Now

You can seed the database without audio and add it later. Questions will still work, but listening questions won't have audio playback.

### 3. Seed the Database

```bash
# Populate courses, lessons, and questions
npm run seed-database

# This inserts:
# - 8 courses
# - 32 lessons
# - Sample questions for each lesson
```

If you generated audio in step 2, the seeder will automatically link audio URLs to questions.

### 4. Enable Supabase Authentication

In your Supabase dashboard:

1. Go to Authentication → Settings
2. Enable Email provider
3. Disable email confirmations for faster testing (optional):
   - Uncheck "Enable email confirmations"
4. Set Site URL to your localhost: `http://localhost:3000`

### 5. Test the Application

```bash
npm run dev
```

**Test Flow:**
1. Click "Sign In" → Create an account
2. Navigate to "Courses"
3. Select a course (e.g., "Numbers & Counting")
4. Start a lesson
5. Answer questions
6. Complete the lesson to earn points and see your progress!

## File Structure

```
src/
├── contexts/
│   ├── AuthContext.jsx           # User authentication state
│   └── UserProgressContext.jsx   # Points, level, streak state
├── services/
│   ├── auth.js                   # Auth operations
│   ├── courseService.js          # Course/lesson queries
│   └── progressService.js        # Progress tracking
├── components/
│   ├── questions/                # Question type components
│   │   ├── MultipleChoice.jsx
│   │   ├── ListeningQuestion.jsx
│   │   ├── MatchingPairs.jsx
│   │   └── SentenceBuilder.jsx
│   ├── ProgressBar.jsx
│   ├── LevelBadge.jsx
│   ├── StreakCounter.jsx
│   ├── PointsAnimation.jsx
│   ├── AuthModal.jsx
│   ├── ProtectedRoute.jsx
│   └── UserMenu.jsx
├── pages/
│   ├── Courses.jsx               # Course grid
│   ├── CourseDetail.jsx          # Lesson list
│   ├── Lesson.jsx                # Interactive lesson
│   └── Profile.jsx               # User stats dashboard
├── data/
│   ├── courseContent.js          # All course data
│   └── audioUrls.json            # Generated audio URLs
└── scripts/
    ├── generateAudio.js          # Audio generation script
    └── seedDatabase.js           # Database seeding script
```

## Adding More Content

### To add a new course:

1. Edit `src/data/courseContent.js`
2. Add to `courses` array:
```javascript
{
  title: 'Your Course',
  description: 'Description',
  category: 'unique-key',
  difficulty: 2,
  icon_emoji: '📝',
  order_index: 8,
}
```

3. Add lessons to `lessons` object:
```javascript
'unique-key': [
  {
    title: 'Lesson 1',
    description: 'Description',
    order_index: 0,
    points_value: 15,
    required_score: 70,
  },
  // ... more lessons
]
```

4. Add questions to `questions` object:
```javascript
'unique-key-0': [  // Course key + lesson index
  {
    type: 'multiple_choice',
    question_text: 'Your question?',
    correct_answer: 'Answer',
    options: ['Option 1', 'Option 2', 'Option 3', 'Answer'],
    explanation: 'Why this is correct',
    points_value: 5,
    order_index: 0,
  },
  // ... more questions
]
```

5. If you need audio, add Kyrgyz text to `audioToGenerate` array
6. Run `npm run generate-audio` and `npm run seed-database`

## Gamification Details

### Points System
- Each question has a point value (typically 5-10 pts)
- Correct answers earn points
- Wrong answers earn 0 points

### Level System
- Formula: `Level = floor(sqrt(totalPoints / 100)) + 1`
- Level 1: 0-99 points
- Level 2: 100-399 points
- Level 3: 400-899 points
- etc.

### Streak System
- Practice daily to maintain streak
- Breaks if you skip a day
- Longest streak is tracked

### Stars
- 3 stars: 90%+ score
- 2 stars: 70-89% score
- 1 star: 50-69% score
- 0 stars: <50% score

## Troubleshooting

### "No courses available"
- Make sure you ran the seed script
- Check Supabase tables: `courses`, `lessons`, `questions` should have data
- Verify `is_published = true` on courses

### Questions not showing
- Check `questions` table has data with correct `lesson_id`
- Verify `order_index` is set correctly

### Audio not playing
- Make sure `question_audio_url` is populated
- Check Supabase storage bucket `audio-files` is public
- Verify audio files were uploaded successfully

### Progress not saving
- Ensure user is authenticated
- Check browser console for errors
- Verify RLS policies are set correctly in Supabase

### Level/points not updating
- Check `user_stats` table exists
- Verify `UserProgressContext` is wrapping the app
- Check browser console for errors in `updatePoints()`

## Production Deployment

Before deploying:

1. **Security**: Move API calls to backend
   - ElevenLabs, DeepSeek, and OpenAI keys should be server-side
   - Use Supabase Row Level Security properly

2. **Enable email confirmations** in Supabase Auth

3. **Set production URLs** in Supabase:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/**`

4. **Pre-generate all audio** before deploy to avoid runtime TTS costs

5. **Set environment variables** in Vercel:
   - All VITE_* variables from .env
   - Consider backend API URL if you add server-side endpoints

## Next Steps

- Add more lessons and questions to existing courses
- Create additional courses for different topics
- Add achievements and badges
- Implement leaderboards
- Add social features (friends, challenges)
- Create a spaced repetition review system
- Add pronunciation practice with speech recognition

Enjoy your Kyrgyz learning journey! 🎉
