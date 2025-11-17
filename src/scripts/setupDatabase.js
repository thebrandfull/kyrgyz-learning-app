// Quick setup script to create tables and seed data
import { createClient } from '@supabase/supabase-js'
import { courses, lessons, questions } from '../data/courseContent.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load audio URLs
const audioUrlsPath = path.join(__dirname, '../data/audioUrls.json')
const audioUrls = JSON.parse(fs.readFileSync(audioUrlsPath, 'utf-8'))

const supabaseUrl = 'https://oruswxugpdjukyrcxpbo.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydXN3eHVncGRqdWt5cmN4cGJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzEyMTU2OSwiZXhwIjoyMDc4Njk3NTY5fQ.pfiIAQ-oB8cf3JUOrNjC7DxD9hkUg7ra2WOsZV1ePaE'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setup() {
  console.log('\n🚀 Setting up Kyrgyz Learning App Database...\n')

  // Step 1: Insert Courses
  console.log('📚 Inserting courses...')
  const { data: insertedCourses, error: coursesError } = await supabase
    .from('courses')
    .insert(courses)
    .select()

  if (coursesError) {
    console.error('❌ Error inserting courses:', coursesError.message)
    console.log('\n⚠️  This likely means the tables don\'t exist yet.')
    console.log('📋 Please run the SQL schema first:')
    console.log('   1. Go to https://oruswxugpdjukyrcxpbo.supabase.co/project/oruswxugpdjukyrcxpbo/sql/new')
    console.log('   2. Copy the entire contents of supabase-schema.sql')
    console.log('   3. Paste and run it in the SQL editor')
    console.log('   4. Then run this script again\n')
    process.exit(1)
  }

  console.log(`✓ Inserted ${insertedCourses.length} courses`)

  // Step 2: Insert Lessons
  console.log('📖 Inserting lessons...')
  const lessonInserts = []

  for (const course of insertedCourses) {
    const courseLessons = lessons[course.category]
    if (courseLessons) {
      for (const lesson of courseLessons) {
        lessonInserts.push({
          ...lesson,
          course_id: course.id,
        })
      }
    }
  }

  const { data: insertedLessons, error: lessonsError } = await supabase
    .from('lessons')
    .insert(lessonInserts)
    .select()

  if (lessonsError) {
    console.error('❌ Error inserting lessons:', lessonsError.message)
    process.exit(1)
  }

  console.log(`✓ Inserted ${insertedLessons.length} lessons`)

  // Step 3: Insert Questions
  console.log('❓ Inserting questions...')
  const questionInserts = []

  for (const course of insertedCourses) {
    const courseLessons = insertedLessons.filter(l => l.course_id === course.id)

    for (let i = 0; i < courseLessons.length; i++) {
      const lessonKey = `${course.category}-${i}`
      const lessonQuestions = questions[lessonKey]

      if (lessonQuestions) {
        for (const question of lessonQuestions) {
          const { question_audio_key, dialogue, question_prompt, ...questionData } = question

          // Map audio key to actual URL from generated audio
          const audioUrl = question_audio_key ? audioUrls[question_audio_key] : null

          // For conversation questions, store dialogue in question_text and prompt in explanation
          if (question.type === 'conversation' && dialogue) {
            questionData.question_text = question_prompt || 'Listen to the conversation'
            questionData.explanation = JSON.stringify(dialogue)
          }

          questionInserts.push({
            ...questionData,
            lesson_id: courseLessons[i].id,
            question_audio_url: audioUrl || null,
            options: JSON.stringify(question.options),
          })
        }
      }
    }
  }

  const { data: insertedQuestions, error: questionsError } = await supabase
    .from('questions')
    .insert(questionInserts)
    .select()

  if (questionsError) {
    console.error('❌ Error inserting questions:', questionsError.message)
    process.exit(1)
  }

  console.log(`✓ Inserted ${insertedQuestions.length} questions`)

  // Summary
  console.log('\n✅ Database setup complete!')
  console.log(`   📚 Courses: ${insertedCourses.length}`)
  console.log(`   📖 Lessons: ${insertedLessons.length}`)
  console.log(`   ❓ Questions: ${insertedQuestions.length}`)
  console.log('\n🎉 Your courses are ready! Refresh the app to see them.\n')
}

setup().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
