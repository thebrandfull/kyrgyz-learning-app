import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getCourseById, canAccessLesson } from '../services/courseService'
import ProtectedRoute from '../components/ProtectedRoute'
import ProgressBar from '../components/ProgressBar'

function CourseDetailContent() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCourse()
  }, [courseId, user])

  const loadCourse = async () => {
    try {
      setLoading(true)
      const { data, error: courseError } = await getCourseById(courseId, user?.id)

      if (courseError) throw courseError

      setCourse(data)
    } catch (err) {
      console.error('Error loading course:', err)
      setError('Failed to load course')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="card bg-red-50 border-2 border-red-200 text-center">
        <p className="text-red-700">{error || 'Course not found'}</p>
        <Link to="/courses" className="btn-primary mt-4">
          Back to Courses
        </Link>
      </div>
    )
  }

  const lessons = course.lessons || []
  const completedLessons = lessons.filter((l) => l.progress?.completed).length
  const totalLessons = lessons.length
  const courseProgress = Math.round((completedLessons / totalLessons) * 100)

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/courses')}
        className="text-white hover:text-white/80 flex items-center gap-2 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Courses
      </button>

      {/* Course Header */}
      <div className="card bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="flex items-start gap-6">
          <div className="text-8xl">{course.icon_emoji}</div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {course.title}
            </h1>
            <p className="text-gray-600 mb-4">{course.description}</p>

            {/* Difficulty */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-gray-700">Difficulty:</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < course.difficulty ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Overall Progress */}
            <div className="max-w-md">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Overall Progress
              </p>
              <ProgressBar current={completedLessons} total={totalLessons} />
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Lessons</h2>

        {lessons.map((lesson, index) => {
          const progress = lesson.progress
          const isCompleted = progress?.completed
          const score = progress?.score || 0
          const stars = progress?.stars || 0
          const isLocked = index > 0 && !lessons[index - 1]?.progress?.completed

          return (
            <div
              key={lesson.id}
              className={`card ${
                isLocked
                  ? 'opacity-60 bg-gray-100'
                  : 'hover:shadow-xl transition-all'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Lesson Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {lesson.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Info */}
                  {isCompleted && (
                    <div className="ml-13 flex items-center gap-4">
                      <span className="text-sm text-green-600 font-semibold">
                        ✓ Completed
                      </span>
                      <span className="text-sm text-gray-600">
                        Score: {score}%
                      </span>
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <span key={i} className="text-lg">
                            {i < stars ? '⭐' : '☆'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex items-center gap-4">
                  <div className="text-sm font-semibold text-gray-600">
                    {lesson.points_value} pts
                  </div>

                  {isLocked ? (
                    <div className="px-6 py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold flex items-center gap-2">
                      🔒 Locked
                    </div>
                  ) : (
                    <Link
                      to={`/lessons/${lesson.id}`}
                      className="btn-primary"
                    >
                      {isCompleted ? 'Review' : 'Start'} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {lessons.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600">No lessons available in this course yet</p>
        </div>
      )}
    </div>
  )
}

export default function CourseDetail() {
  return (
    <ProtectedRoute>
      <CourseDetailContent />
    </ProtectedRoute>
  )
}
