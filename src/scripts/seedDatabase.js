import { supabase } from '../services/supabase.js'
import { courses, lessons, questions } from '../data/courseContent.js'
import fs from 'fs'
import path from 'path'

// This script seeds the database with course content
// Run AFTER generating audio: node --experimental-modules src/scripts/seedDatabase.js

async function seedDatabase() {
  console.log('\n🌱 Starting database seeding...\n')

  // Load audio URLs (if available)
  let audioUrls = {}
  try {
    const audioPath = path.join(process.cwd(), 'src/data/audioUrls.json')
    audioUrls = JSON.parse(fs.readFileSync(audioPath, 'utf8'))
    console.log(`✓ Loaded ${Object.keys(audioUrls).length} audio URLs\n`)
  } catch (error) {
    console.log('⚠️  No audio URLs found, continuing without audio...\n')
  }

  // 1. Insert Courses
  console.log('📚 Inserting courses...')
  const { data: insertedCourses, error: coursesError } = await supabase
    .from('courses')
    .insert(courses)
    .select()

  if (coursesError) {
    console.error('Error inserting courses:', coursesError)
    return
  }

  console.log(`✓ Inserted ${insertedCourses.length} courses\n`)

  // 2. Insert Lessons
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
    console.error('Error inserting lessons:', lessonsError)
    return
  }

  console.log(`✓ Inserted ${insertedLessons.length} lessons\n`)

  // 3. Insert Questions
  console.log('❓ Inserting questions...')
  const questionInserts = []

  for (const course of insertedCourses) {
    const courseLessons = insertedLessons.filter(l => l.course_id === course.id)

    for (let i = 0; i < courseLessons.length; i++) {
      const lessonKey = `${course.category}-${i}`
      const lessonQuestions = questions[lessonKey]

      if (lessonQuestions) {
        for (const question of lessonQuestions) {
          // Add audio URL if available
          let questionAudioUrl = null
          if (question.question_audio_key && audioUrls[question.question_audio_key]) {
            questionAudioUrl = audioUrls[question.question_audio_key]
          }

          questionInserts.push({
            ...question,
            lesson_id: courseLessons[i].id,
            question_audio_url: questionAudioUrl,
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
    console.error('Error inserting questions:', questionsError)
    return
  }

  console.log(`✓ Inserted ${insertedQuestions.length} questions\n`)

  // Summary
  console.log('📊 Seeding Summary:')
  console.log(`   Courses: ${insertedCourses.length}`)
  console.log(`   Lessons: ${insertedLessons.length}`)
  console.log(`   Questions: ${insertedQuestions.length}`)
  console.log(`\n✅ Database seeding complete!\n`)
}

// Run the seeding
seedDatabase().catch(console.error)
