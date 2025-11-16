import { supabase } from './supabase'

// Get all courses with user progress
export const getCourses = async (userId = null) => {
  try {
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('order_index')

    if (coursesError) throw coursesError

    if (userId) {
      // Fetch user progress for each course
      const { data: progress, error: progressError } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userId)

      if (progressError) throw progressError

      // Merge progress into courses
      const coursesWithProgress = courses.map((course) => {
        const courseProgress = progress?.find((p) => p.course_id === course.id)
        return {
          ...course,
          progress: courseProgress || null,
        }
      })

      return { data: coursesWithProgress, error: null }
    }

    return { data: courses, error: null }
  } catch (error) {
    console.error('Error fetching courses:', error)
    return { data: null, error }
  }
}

// Get single course by ID with lessons
export const getCourseById = async (courseId, userId = null) => {
  try {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (courseError) throw courseError

    // Get lessons for this course
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index')

    if (lessonsError) throw lessonsError

    if (userId) {
      // Get user progress for lessons
      const { data: progress, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .in('lesson_id', lessons.map((l) => l.id))

      if (progressError) throw progressError

      // Merge progress into lessons
      const lessonsWithProgress = lessons.map((lesson) => {
        const lessonProgress = progress?.find((p) => p.lesson_id === lesson.id)
        return {
          ...lesson,
          progress: lessonProgress || null,
        }
      })

      return { data: { ...course, lessons: lessonsWithProgress }, error: null }
    }

    return { data: { ...course, lessons }, error: null }
  } catch (error) {
    console.error('Error fetching course:', error)
    return { data: null, error }
  }
}

// Get lesson with questions
export const getLesson = async (lessonId, userId = null) => {
  try {
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*, courses(*)')
      .eq('id', lessonId)
      .single()

    if (lessonError) throw lessonError

    // Get questions for this lesson
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order_index')

    if (questionsError) throw questionsError

    if (userId) {
      // Get user progress for this lesson
      const { data: progress, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle()

      if (progressError && progressError.code !== 'PGRST116') throw progressError

      return {
        data: { ...lesson, questions, progress: progress || null },
        error: null,
      }
    }

    return { data: { ...lesson, questions }, error: null }
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return { data: null, error }
  }
}

// Check if user can access a lesson (previous lesson must be completed)
export const canAccessLesson = async (userId, courseId, lessonOrderIndex) => {
  if (lessonOrderIndex === 0) return true // First lesson is always accessible

  try {
    // Get previous lesson in course
    const { data: prevLesson, error: prevLessonError } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)
      .eq('order_index', lessonOrderIndex - 1)
      .single()

    if (prevLessonError) throw prevLessonError

    // Check if previous lesson is completed
    const { data: progress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', prevLesson.id)
      .eq('completed', true)
      .maybeSingle()

    if (progressError && progressError.code !== 'PGRST116') throw progressError

    return !!progress
  } catch (error) {
    console.error('Error checking lesson access:', error)
    return false
  }
}

// Get next unlocked lesson in a course
export const getNextLesson = async (userId, courseId) => {
  try {
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index')

    if (lessonsError) throw lessonsError

    // Get user progress for all lessons
    const { data: progress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .in('lesson_id', lessons.map((l) => l.id))

    if (progressError) throw progressError

    // Find first incomplete lesson
    for (const lesson of lessons) {
      const lessonProgress = progress?.find((p) => p.lesson_id === lesson.id)
      if (!lessonProgress || !lessonProgress.completed) {
        return { data: lesson, error: null }
      }
    }

    // All lessons completed
    return { data: null, error: null }
  } catch (error) {
    console.error('Error getting next lesson:', error)
    return { data: null, error }
  }
}
