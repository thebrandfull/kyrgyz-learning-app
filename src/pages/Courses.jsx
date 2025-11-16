import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getCourses } from '../services/courseService'
import ProtectedRoute from '../components/ProtectedRoute'
import ProgressBar from '../components/ProgressBar'

function CoursesContent() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCourses()
  }, [user])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const { data, error: coursesError } = await getCourses(user?.id)

      if (coursesError) throw coursesError

      setCourses(data || [])
    } catch (err) {
      console.error('Error loading courses:', err)
      setError('Failed to load courses')
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

  if (error) {
    return (
      <div className="card bg-red-50 border-2 border-red-200 text-center">
        <p className="text-red-700">{error}</p>
        <button onClick={loadCourses} className="btn-primary mt-4">
          Try Again
        </button>
      </div>
    )
  }

  // Find course in progress (if any)
  const courseInProgress = courses.find(
    (c) => c.progress && c.progress.completion_percentage > 0 && c.progress.completion_percentage < 100
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Learning Courses</h1>
        <p className="text-white/80 text-lg">
          Master Kyrgyz step by step with interactive lessons
        </p>
      </div>

      {/* Continue Learning */}
      {courseInProgress && (
        <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📚 Continue Learning
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-lg font-semibold text-gray-800 mb-2">
                {courseInProgress.icon_emoji} {courseInProgress.title}
              </p>
              <div className="max-w-md">
                <ProgressBar
                  current={courseInProgress.progress.completion_percentage}
                  total={100}
                />
              </div>
            </div>
            <Link
              to={`/courses/${courseInProgress.id}`}
              className="btn-primary ml-4"
            >
              Continue →
            </Link>
          </div>
        </div>
      )}

      {/* All Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const progress = course.progress
          const completionPercentage = progress?.completion_percentage || 0
          const isCompleted = completionPercentage === 100
          const isInProgress = completionPercentage > 0 && completionPercentage < 100

          return (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="card hover:shadow-2xl transition-all transform hover:scale-105 group"
            >
              {/* Icon & Title */}
              <div className="text-center mb-4">
                <div className="text-6xl mb-3">{course.icon_emoji}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600">{course.description}</p>
              </div>

              {/* Difficulty */}
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < course.difficulty ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Progress */}
              {progress && (
                <div className="mb-4">
                  <ProgressBar
                    current={completionPercentage}
                    total={100}
                    showPercentage={false}
                  />
                </div>
              )}

              {/* Status Badge */}
              <div className="text-center">
                {isCompleted && (
                  <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    ✓ Completed
                  </span>
                )}
                {isInProgress && (
                  <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                    In Progress
                  </span>
                )}
                {!progress && (
                  <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                    Start Course →
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {courses.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600 text-lg mb-4">No courses available yet</p>
          <p className="text-sm text-gray-500">
            Courses will appear here once they are published
          </p>
        </div>
      )}
    </div>
  )
}

export default function Courses() {
  return (
    <ProtectedRoute>
      <CoursesContent />
    </ProtectedRoute>
  )
}
