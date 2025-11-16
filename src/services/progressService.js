import { supabase } from './supabase'

// Save lesson completion
export const completeLes

son = async (userId, lessonId, score, totalQuestions) => {
  try {
    const percentage = Math.round((score / totalQuestions) * 100)
    const stars = calculateStars(percentage)

    // Check if progress exists
    const { data: existing, error: fetchError } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle()

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

    const now = new Date().toISOString()

    if (existing) {
      // Update existing progress
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .update({
          completed: true,
          score: Math.max(existing.score, percentage),
          stars: Math.max(existing.stars, stars),
          attempts: existing.attempts + 1,
          completed_at: now,
          updated_at: now,
        })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } else {
      // Insert new progress
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .insert([
          {
            user_id: userId,
            lesson_id: lessonId,
            completed: true,
            score: percentage,
            stars,
            attempts: 1,
            completed_at: now,
          },
        ])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    }
  } catch (error) {
    console.error('Error completing lesson:', error)
    return { data: null, error }
  }
}

// Update course progress
export const updateCourseProgress = async (userId, courseId) => {
  try {
    // Get all lessons in course
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)

    if (lessonsError) throw lessonsError

    // Get completed lessons
    const { data: progress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .in('lesson_id', lessons.map((l) => l.id))
      .eq('completed', true)

    if (progressError) throw progressError

    const completedCount = progress?.length || 0
    const totalCount = lessons.length
    const completionPercentage = Math.round((completedCount / totalCount) * 100)

    // Find next incomplete lesson
    const completedLessonIds = progress?.map((p) => p.lesson_id) || []
    const nextLesson = lessons.find((l) => !completedLessonIds.includes(l.id))

    // Upsert course progress
    const { data: courseProgress, error: upsertError } = await supabase
      .from('user_course_progress')
      .upsert(
        {
          user_id: userId,
          course_id: courseId,
          current_lesson_id: nextLesson?.id || null,
          completion_percentage: completionPercentage,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,course_id',
        }
      )
      .select()
      .single()

    if (upsertError) throw upsertError

    return { data: courseProgress, error: null }
  } catch (error) {
    console.error('Error updating course progress:', error)
    return { data: null, error }
  }
}

// Increment lessons completed in user stats
export const incrementLessonsCompleted = async (userId) => {
  try {
    const { data, error } = await supabase.rpc('increment_lessons_completed', {
      user_id: userId,
    })

    if (error) {
      // Fallback if RPC doesn't exist
      const { data: stats, error: fetchError } = await supabase
        .from('user_stats')
        .select('lessons_completed')
        .eq('user_id', userId)
        .single()

      if (fetchError) throw fetchError

      const { data: updated, error: updateError } = await supabase
        .from('user_stats')
        .update({
          lessons_completed: stats.lessons_completed + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (updateError) throw updateError
      return { data: updated, error: null }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error incrementing lessons completed:', error)
    return { data: null, error }
  }
}

// Calculate stars based on score percentage
const calculateStars = (percentage) => {
  if (percentage >= 90) return 3
  if (percentage >= 70) return 2
  if (percentage >= 50) return 1
  return 0
}

// Get user's overall progress stats
export const getUserProgressStats = async (userId) => {
  try {
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (statsError) throw statsError

    const { data: completedLessons, error: lessonsError } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)

    if (lessonsError) throw lessonsError

    const { data: courses, error: coursesError } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)

    if (coursesError) throw coursesError

    // Calculate accuracy
    const totalScore = completedLessons.reduce((sum, lesson) => sum + lesson.score, 0)
    const averageAccuracy = completedLessons.length > 0
      ? Math.round(totalScore / completedLessons.length)
      : 0

    return {
      data: {
        ...stats,
        completedLessonsCount: completedLessons.length,
        coursesInProgress: courses.length,
        averageAccuracy,
      },
      error: null,
    }
  } catch (error) {
    console.error('Error fetching progress stats:', error)
    return { data: null, error }
  }
}
