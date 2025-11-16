# Developer Guide: Adding Courses, Lessons & Questions

This guide explains how to add new educational content to the Kyrgyz Learning App while maintaining the gamification system and user progress.

---

## 📋 Table of Contents

1. [Understanding the Data Structure](#understanding-the-data-structure)
2. [Adding a New Course](#adding-a-new-course)
3. [Adding Lessons to a Course](#adding-lessons-to-a-course)
4. [Creating Questions](#creating-questions)
5. [Question Types Reference](#question-types-reference)
6. [Deploying Changes](#deploying-changes)
7. [Best Practices](#best-practices)

---

## Understanding the Data Structure

### The Content Flow
```
Course (e.g., "Family & Relationships")
  └── Lesson 1 (e.g., "Immediate Family")
      ├── Question 1 (Multiple Choice)
      ├── Question 2 (Listening)
      ├── Question 3 (Matching)
      └── Question 4 (Sentence Builder)
  └── Lesson 2 (e.g., "Extended Family")
      └── Questions...
```

### File Location
All content is defined in: **`src/data/courseContent.js`**

---

## Adding a New Course

### Step 1: Add Course to the `courses` Array

Open `src/data/courseContent.js` and add your course to the `courses` array:

```javascript
export const courses = [
  // ... existing courses ...

  {
    title: 'Business Kyrgyz',           // Course name shown to users
    description: 'Professional vocabulary and business conversations',
    category: 'business',                // Unique identifier (lowercase, no spaces)
    difficulty: 3,                       // 1-5 scale
    icon_emoji: '💼',                   // Emoji shown on course card
    order_index: 8,                     // Display order (increment from last)
  },
]
```

**Important Fields:**
- `category`: Must be unique and lowercase (no spaces). Used as a key throughout the system.
- `order_index`: Determines display order. Start from 0 and increment.
- `difficulty`: 1 = Beginner, 5 = Advanced

---

## Adding Lessons to a Course

### Step 2: Add Lessons to the `lessons` Object

In the same file, add a new key matching your course's `category`:

```javascript
export const lessons = {
  // ... existing lessons ...

  business: [  // Must match the course category exactly
    {
      title: 'Office Vocabulary',
      description: 'Common workplace terms',
      order_index: 0,                   // First lesson in this course
      points_value: 15,                 // Points awarded for completion
      required_score: 70,               // Minimum % to pass (usually 70)
    },
    {
      title: 'Meeting Phrases',
      description: 'Professional meeting language',
      order_index: 1,                   // Second lesson
      points_value: 20,
      required_score: 70,
    },
    // Add more lessons...
  ],
}
```

**Important:**
- `order_index`: Start from 0 for each course. Lessons unlock sequentially.
- `points_value`: Higher difficulty = more points (10-20 typical)
- `required_score`: Users must achieve this % to unlock next lesson

---

## Creating Questions

### Step 3: Add Questions to the `questions` Object

Questions are grouped by **lesson key** in format: `{category}-{lesson_order_index}`

```javascript
export const questions = {
  // ... existing questions ...

  'business-0': [  // Course category + lesson order_index
    {
      type: 'multiple_choice',
      question_text: 'How do you say "meeting" in Kyrgyz?',
      correct_answer: 'жолугушуу',
      options: ['жолугушуу', 'иш', 'офис', 'документ'],
      explanation: 'жолугушуу (joluguşuu) means meeting',
      points_value: 5,
      order_index: 0,
    },
    {
      type: 'listening',
      question_text: 'Listen and identify the word:',
      question_audio_key: 'business_офис',  // Reference to audio
      correct_answer: 'office',
      options: ['office', 'meeting', 'document', 'computer'],
      explanation: 'офис (ofis) means office',
      points_value: 5,
      order_index: 1,
    },
    // Add more questions...
  ],

  'business-1': [  // Second lesson's questions
    // Questions for "Meeting Phrases" lesson...
  ],
}
```

---

## Question Types Reference

### 1. Multiple Choice

Users select one correct answer from 4 options.

```javascript
{
  type: 'multiple_choice',
  question_text: 'What is "hello" in Kyrgyz?',
  correct_answer: 'Салам',
  options: ['Салам', 'Рахмат', 'Кош', 'Жок'],  // Must include correct answer
  explanation: 'Салам is the standard greeting',
  points_value: 5,
  order_index: 0,
}
```

### 2. Listening Question

Users listen to audio and select the correct translation.

```javascript
{
  type: 'listening',
  question_text: 'Listen to the audio:',
  question_audio_key: 'greeting_салам',  // Key for audio file (explained below)
  correct_answer: 'Hello',
  options: ['Hello', 'Thank you', 'Goodbye', 'No'],
  explanation: 'Салам means hello',
  points_value: 5,
  order_index: 1,
}
```

**Audio Setup:**
1. Add the Kyrgyz text to `audioToGenerate` array
2. Run audio generation script (see Deploying Changes)
3. Use a descriptive `question_audio_key` (will be mapped to actual URL)

### 3. Matching Pairs

Users match Kyrgyz words with English translations.

```javascript
{
  type: 'matching',
  question_text: 'Match the family members:',
  correct_answer: 'matched',  // Always use 'matched'
  options: [
    { kyrgyz: 'апа', english: 'mother' },
    { kyrgyz: 'ата', english: 'father' },
    { kyrgyz: 'эже', english: 'older sister' },
    { kyrgyz: 'ага', english: 'older brother' },
  ],
  explanation: 'Basic family terms',
  points_value: 10,
  order_index: 2,
}
```

**Note:** Matching questions are worth more points (10-15) as they're harder.

### 4. Sentence Builder

Users arrange words in correct order to form a sentence.

```javascript
{
  type: 'sentence_builder',
  question_text: 'Form: "I am a student"',
  correct_answer: 'Мен студентмин',  // Exact sentence to match
  options: ['Мен', 'студентмин'],     // Words to arrange (order will be shuffled)
  explanation: 'Мен = I, студентмин = am a student',
  points_value: 10,
  order_index: 3,
}
```

**Tips:**
- Keep words as logical units (don't split too much)
- Include particles/suffixes with their root words

---

## Deploying Changes

### Development Workflow

#### 1. Edit Content
Edit `src/data/courseContent.js` with your new courses/lessons/questions.

#### 2. Clear Old Data
```bash
npm run cleanup
```
This removes all existing courses/lessons/questions from the database.

#### 3. Insert New Data
```bash
npm run setup
```
This inserts your updated content.

#### 4. Test Locally
```bash
npm run dev
```
Navigate to http://localhost:3000/courses and verify:
- Courses appear correctly
- Lessons unlock in order
- Questions display properly
- Points are awarded
- Progress saves

#### 5. Commit & Deploy
```bash
git add src/data/courseContent.js
git commit -m "Add Business Kyrgyz course with 2 lessons"
git push
```

The app auto-deploys via Vercel on push to main.

### Production Database Update

After deploying code changes, you need to update the production database:

**Option A: Via Supabase Dashboard**
1. Go to https://oruswxugpdjukyrcxpbo.supabase.co/project/oruswxugpdjukyrcxpbo/editor
2. Delete from `questions`, `lessons`, `courses` tables
3. Run the setup script against production (requires service key)

**Option B: Via Script** (Recommended)
Update the setup script to use production Supabase URL, then:
```bash
npm run setup
```

---

## Best Practices

### Content Guidelines

1. **Progressive Difficulty**
   - Start lessons with easier concepts
   - Increase complexity gradually
   - Use `difficulty` rating appropriately

2. **Question Balance**
   - Mix question types in each lesson
   - 8-12 questions per lesson is ideal
   - Don't make lessons too long (causes fatigue)

3. **Points Distribution**
   - Simple questions: 5 points
   - Medium questions: 10 points
   - Complex questions: 15 points
   - Lesson completion: 10-20 points

4. **Natural Kyrgyz**
   - Use authentic, conversational Kyrgyz
   - Avoid literal word-for-word translations
   - Include cultural context in explanations

### Audio Recommendations

**When to add audio:**
- Essential words (greetings, numbers, family)
- Pronunciation-critical vocabulary
- Listening comprehension questions

**When to skip audio:**
- Simple grammar concepts
- Matching exercises (already have text)
- Review questions

**Audio Generation:**
1. Add text to `audioToGenerate` array in `courseContent.js`:
```javascript
export const audioToGenerate = [
  // ... existing ...
  'офис',
  'жолугушуу',
  'документ',
]
```

2. Run generation script (see COURSES_SETUP.md for details)

### Gamification Preservation

**Important: Don't Break User Progress!**

❌ **Never do this:**
- Change existing course `category` values
- Reorder existing lessons (changes unlock sequence)
- Delete courses/lessons users are working on

✅ **Safe operations:**
- Add new courses
- Add new lessons to end of existing courses
- Add new questions to lessons
- Update question text/explanations (won't affect completed progress)

**If you must restructure:**
1. Create a migration script to update user progress
2. Test thoroughly in development
3. Backup production database first

---

## Troubleshooting

### "No courses available"
- Run `npm run setup` to insert content
- Check Supabase tables have data
- Verify `is_published = true` on courses

### "Questions not loading"
- Ensure lesson key format is correct: `{category}-{order_index}`
- Check `question_audio_key` doesn't have typos
- Verify `options` field is an array (not string)

### "Progress not saving"
- User must be authenticated
- Check browser console for RLS policy errors
- Verify user_stats table was created

### "Duplicate courses"
- Run `npm run cleanup` before `npm run setup`
- Don't run setup multiple times without cleanup

---

## Example: Adding a Complete Course

Here's a full example of adding a "Transportation" course:

```javascript
// 1. Add to courses array
export const courses = [
  // ... existing ...
  {
    title: 'Transportation',
    description: 'Getting around in Kyrgyzstan',
    category: 'transportation',
    difficulty: 2,
    icon_emoji: '🚌',
    order_index: 8,
  },
]

// 2. Add lessons
export const lessons = {
  // ... existing ...
  transportation: [
    {
      title: 'Vehicles',
      description: 'Types of transportation',
      order_index: 0,
      points_value: 10,
      required_score: 70,
    },
    {
      title: 'Directions',
      description: 'Asking for and giving directions',
      order_index: 1,
      points_value: 15,
      required_score: 70,
    },
  ],
}

// 3. Add questions
export const questions = {
  // ... existing ...
  'transportation-0': [
    {
      type: 'multiple_choice',
      question_text: 'How do you say "bus" in Kyrgyz?',
      correct_answer: 'автобус',
      options: ['автобус', 'машина', 'велосипед', 'самолёт'],
      explanation: 'автобус (avtobus) means bus',
      points_value: 5,
      order_index: 0,
    },
    {
      type: 'matching',
      question_text: 'Match the vehicles:',
      correct_answer: 'matched',
      options: [
        { kyrgyz: 'машина', english: 'car' },
        { kyrgyz: 'автобус', english: 'bus' },
        { kyrgyz: 'велосипед', english: 'bicycle' },
      ],
      explanation: 'Common vehicles in Kyrgyz',
      points_value: 10,
      order_index: 1,
    },
  ],
  'transportation-1': [
    // Questions for Directions lesson...
  ],
}

// 4. (Optional) Add audio
export const audioToGenerate = [
  // ... existing ...
  'автобус',
  'машина',
  'велосипед',
]
```

Then run:
```bash
npm run cleanup
npm run setup
npm run dev
```

---

## Questions?

- Check `COURSES_SETUP.md` for initial setup
- Review existing courses in `src/data/courseContent.js` for examples
- Test changes locally before deploying
- Keep backups of database before major changes

**Happy course creating! 🎉**
