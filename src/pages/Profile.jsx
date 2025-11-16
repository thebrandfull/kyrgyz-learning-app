import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUserProgress } from '../contexts/UserProgressContext'
import { getUserProgressStats } from '../services/progressService'
import ProtectedRoute from '../components/ProtectedRoute'
import LevelBadge from '../components/LevelBadge'
import StreakCounter from '../components/StreakCounter'

function ProfileContent() {
  const { user, profile } = useAuth()
  const { stats, refreshStats } = useUserProgress()
  const [detailedStats, setDetailedStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDetailedStats()
  }, [user])

  const loadDetailedStats = async () => {
    try {
      setLoading(true)
      const { data } = await getUserProgressStats(user.id)
      setDetailedStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
            {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              {profile?.display_name || 'User'}
            </h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>

          {/* Level Badge */}
          {stats && <LevelBadge level={stats.current_level} size="lg" />}
        </div>
      </div>

      {/* Stats Grid */}
      {stats && detailedStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Points */}
          <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 text-center">
            <div className="text-4xl mb-2">⭐</div>
            <p className="text-3xl font-bold text-gray-800">{stats.total_points}</p>
            <p className="text-sm text-gray-600">Total Points</p>
          </div>

          {/* Lessons Completed */}
          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 text-center">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-3xl font-bold text-gray-800">{stats.lessons_completed}</p>
            <p className="text-sm text-gray-600">Lessons Completed</p>
          </div>

          {/* Current Streak */}
          <div className="card bg-gradient-to-br from-red-50 to-orange-50 text-center">
            <div className="text-4xl mb-2">🔥</div>
            <p className="text-3xl font-bold text-gray-800">{stats.current_streak}</p>
            <p className="text-sm text-gray-600">Day Streak</p>
          </div>

          {/* Average Accuracy */}
          <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 text-center">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-3xl font-bold text-gray-800">{detailedStats.averageAccuracy}%</p>
            <p className="text-sm text-gray-600">Avg. Accuracy</p>
          </div>
        </div>
      )}

      {/* Streak Section */}
      {stats && (
        <div className="card bg-gradient-to-br from-orange-50 to-red-50 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Keep Your Streak Alive!</h2>
          <StreakCounter streak={stats.current_streak} size="lg" />
          {stats.longest_streak > stats.current_streak && (
            <p className="text-sm text-gray-600 mt-4">
              Your longest streak: {stats.longest_streak} days
            </p>
          )}
        </div>
      )}

      {/* Achievements */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* First Lesson */}
          <div
            className={`card text-center ${
              stats?.lessons_completed > 0
                ? 'bg-gradient-to-br from-blue-50 to-purple-50'
                : 'bg-gray-100 opacity-50'
            }`}
          >
            <div className="text-4xl mb-2">🎓</div>
            <p className="text-sm font-semibold text-gray-800">First Lesson</p>
            <p className="text-xs text-gray-600">Complete your first lesson</p>
          </div>

          {/* Week Warrior */}
          <div
            className={`card text-center ${
              stats?.current_streak >= 7
                ? 'bg-gradient-to-br from-orange-50 to-red-50'
                : 'bg-gray-100 opacity-50'
            }`}
          >
            <div className="text-4xl mb-2">🔥</div>
            <p className="text-sm font-semibold text-gray-800">Week Warrior</p>
            <p className="text-xs text-gray-600">7-day streak</p>
          </div>

          {/* Point Master */}
          <div
            className={`card text-center ${
              stats?.total_points >= 1000
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50'
                : 'bg-gray-100 opacity-50'
            }`}
          >
            <div className="text-4xl mb-2">💎</div>
            <p className="text-sm font-semibold text-gray-800">Point Master</p>
            <p className="text-xs text-gray-600">Earn 1000 points</p>
          </div>

          {/* Course Completer */}
          <div
            className={`card text-center ${
              detailedStats?.coursesInProgress > 0
                ? 'bg-gradient-to-br from-green-50 to-emerald-50'
                : 'bg-gray-100 opacity-50'
            }`}
          >
            <div className="text-4xl mb-2">📖</div>
            <p className="text-sm font-semibold text-gray-800">Course Starter</p>
            <p className="text-xs text-gray-600">Start a course</p>
          </div>

          {/* Perfect Score */}
          <div
            className={`card text-center ${
              detailedStats?.averageAccuracy === 100
                ? 'bg-gradient-to-br from-purple-50 to-pink-50'
                : 'bg-gray-100 opacity-50'
            }`}
          >
            <div className="text-4xl mb-2">💯</div>
            <p className="text-sm font-semibold text-gray-800">Perfectionist</p>
            <p className="text-xs text-gray-600">100% accuracy</p>
          </div>

          {/* Level 5 */}
          <div
            className={`card text-center ${
              stats?.current_level >= 5
                ? 'bg-gradient-to-br from-indigo-50 to-blue-50'
                : 'bg-gray-100 opacity-50'
            }`}
          >
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-sm font-semibold text-gray-800">Level 5</p>
            <p className="text-xs text-gray-600">Reach level 5</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}
