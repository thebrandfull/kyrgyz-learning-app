// Cleanup duplicate courses and fix data
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oruswxugpdjukyrcxpbo.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydXN3eHVncGRqdWt5cmN4cGJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzEyMTU2OSwiZXhwIjoyMDc4Njk3NTY5fQ.pfiIAQ-oB8cf3JUOrNjC7DxD9hkUg7ra2WOsZV1ePaE'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanup() {
  console.log('\n🧹 Cleaning up database...\n')

  // Delete dependent progress tables first to avoid FK violations
  console.log('Deleting user course progress...')
  const { error: courseProgressError } = await supabase
    .from('user_course_progress')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (courseProgressError) console.error('Error deleting course progress:', courseProgressError.message)
  else console.log('✓ Course progress deleted')

  console.log('Deleting user lesson progress...')
  const { error: lessonProgressError } = await supabase
    .from('user_lesson_progress')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (lessonProgressError) console.error('Error deleting lesson progress:', lessonProgressError.message)
  else console.log('✓ Lesson progress deleted')

  // Delete all questions first (due to foreign keys)
  console.log('Deleting all questions...')
  const { error: questionsError } = await supabase
    .from('questions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (questionsError) console.error('Error deleting questions:', questionsError.message)
  else console.log('✓ Questions deleted')

  // Delete all lessons
  console.log('Deleting all lessons...')
  const { error: lessonsError } = await supabase
    .from('lessons')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (lessonsError) console.error('Error deleting lessons:', lessonsError.message)
  else console.log('✓ Lessons deleted')

  // Delete all courses
  console.log('Deleting all courses...')
  const { error: coursesError } = await supabase
    .from('courses')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (coursesError) console.error('Error deleting courses:', coursesError.message)
  else console.log('✓ Courses deleted')

  console.log('\n✅ Cleanup complete! Now run: npm run setup\n')
}

cleanup().catch(console.error)
