// Complete setup: Run SQL schema + Seed data
import { createClient } from '@supabase/supabase-js'
import { courses, lessons, questions } from '../data/courseContent.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = 'https://oruswxugpdjukyrcxpbo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydXN3eHVncGRqdWt5cmN4cGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjE1NjksImV4cCI6MjA3ODY5NzU2OX0.ooI73rqlOaXSEcU56O4ZWIEptZ8mW1BYVoKn14FjaXs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function runSQL(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { query: sql })
  if (error) throw error
  return data
}

async function completeSetup() {
  console.log('\n🚀 Complete Database Setup Starting...\n')

  // Read SQL schema
  const schemaPath = path.join(__dirname, '../../supabase-schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')

  console.log('📋 Step 1: Creating database tables...')

  // Split schema into individual statements and run them
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';'
    try {
      await supabase.rpc('exec_sql', { query: statement })
      if (i % 10 === 0) {
        process.stdout.write('.')
      }
    } catch (error) {
      // Ignore errors for IF NOT EXISTS and policies that might already exist
      if (!error.message.includes('already exists')) {
        console.log(`\nWarning on statement ${i}: ${error.message.substring(0, 100)}`)
      }
    }
  }

  console.log('\n✓ Database schema created')

  // Wait a bit for schema to propagate
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Step 2: Insert Courses
  console.log('\n📚 Step 2: Inserting courses...')
  const { data: insertedCourses, error: coursesError } = await supabase
    .from('courses')
    .insert(courses)
    .select()

  if (coursesError) {
    console.error('❌ Error inserting courses:', coursesError.message)
    process.exit(1)
  }

  console.log(`✓ Inserted ${insertedCourses.length} courses`)

  // Step 3: Insert Lessons
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

  // Step 4: Insert Questions
  console.log('❓ Inserting questions...')
  const questionInserts = []

  for (const course of insertedCourses) {
    const courseLessons = insertedLessons.filter(l => l.course_id === course.id)

    for (let i = 0; i < courseLessons.length; i++) {
      const lessonKey = `${course.category}-${i}`
      const lessonQuestions = questions[lessonKey]

      if (lessonQuestions) {
        for (const question of lessonQuestions) {
          questionInserts.push({
            ...question,
            lesson_id: courseLessons[i].id,
            question_audio_url: null,
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
  console.log('\n✅ Complete Setup Finished!')
  console.log(`   📚 Courses: ${insertedCourses.length}`)
  console.log(`   📖 Lessons: ${insertedLessons.length}`)
  console.log(`   ❓ Questions: ${insertedQuestions.length}`)
  console.log('\n🎉 Your Kyrgyz Learning App is ready!')
  console.log('   Refresh your browser to see all courses.\n')
}

completeSetup().catch(error => {
  console.error('\n❌ Setup failed:', error.message)
  process.exit(1)
})
