import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUserProgress } from '../contexts/UserProgressContext'
import { getLesson } from '../services/courseService'
import { completeLesson, updateCourseProgress, incrementLessonsCompleted } from '../services/progressService'
import ProtectedRoute from '../components/ProtectedRoute'
import MultipleChoice from '../components/questions/MultipleChoice'
import ListeningQuestion from '../components/questions/ListeningQuestion'
import MatchingPairs from '../components/questions/MatchingPairs'
import SentenceBuilder from '../components/questions/SentenceBuilder'
import ConversationPractice from '../components/questions/ConversationPractice'
import PointsAnimation from '../components/PointsAnimation'

function LessonContent() {
  const { lessonId } = useParams()
  const { user } = useAuth()
  const { updatePoints, updateStreak } = useUserProgress()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showPointsAnimation, setShowPointsAnimation] = useState(false)
  const [lastPointsEarned, setLastPointsEarned] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [finalStats, setFinalStats] = useState(null)

  useEffect(() => {
    loadLesson()
  }, [lessonId, user])

  const loadLesson = async () => {
    try {
      setLoading(true)
      const { data, error: lessonError } = await getLesson(lessonId, user?.id)

      if (lessonError) throw lessonError

      setLesson(data)
    } catch (err) {
      console.error('Error loading lesson:', err)
      setError('Failed to load lesson')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (isCorrect, pointsValue) => {
    if (isCorrect) {
      setScore(score + pointsValue)
      setLastPointsEarned(pointsValue)
      setShowPointsAnimation(true)
    }

    // Move to next question after a delay
    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1
      if (nextIndex < lesson.questions.length) {
        setCurrentQuestionIndex(nextIndex)
      } else {
        // All questions complete
        finishLesson()
      }
    }, 2000)
  }

  const finishLesson = async () => {
    setIsCompleting(true)

    try {
      const totalPoints = lesson.questions.reduce((sum, q) => sum + q.points_value, 0)
      const percentage = Math.round((score / totalPoints) * 100)
      const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0

      // Save lesson progress
      await completeLesson(user.id, lessonId, score, lesson.questions.length)

      // Update course progress
      await updateCourseProgress(user.id, lesson.courses.id)

      // Increment lessons completed
      await incrementLessonsCompleted(user.id)

      // Update user points
      const { newLevel, leveledUp } = await updatePoints(score)

      // Update streak
      await updateStreak()

      setFinalStats({
        score,
        totalPoints,
        percentage,
        stars,
        newLevel,
        leveledUp,
      })

      setShowCompletion(true)
    } catch (error) {
      console.error('Error completing lesson:', error)
      setError('Failed to save progress')
    } finally {
      setIsCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="card bg-red-50 border-2 border-red-200 text-center">
        <p className="text-red-700">{error || 'Lesson not found'}</p>
        <button onClick={() => navigate(-1)} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    )
  }

  const questions = lesson.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  const questionTypeLabels = {
    multiple_choice: 'Multiple Choice',
    listening: 'Listening',
    matching: 'Matching',
    sentence_builder: 'Sentence Builder',
    conversation: 'Conversation',
  }
  const questionTypeCounts = questions.reduce((acc, q) => {
    if (!q?.type) return acc
    acc[q.type] = (acc[q.type] || 0) + 1
    return acc
  }, {})

  // Completion Screen
  if (showCompletion && finalStats) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center space-y-6">
          <div className="text-6xl">
            {finalStats.stars === 3 ? '🎉' : finalStats.stars === 2 ? '🌟' : finalStats.stars === 1 ? '⭐' : '📝'}
          </div>

          <h2 className="text-3xl font-bold text-gray-800">
            Lesson Complete!
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="card bg-blue-50">
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-3xl font-bold text-blue-600">{finalStats.percentage}%</p>
            </div>
            <div className="card bg-purple-50">
              <p className="text-sm text-gray-600">Points Earned</p>
              <p className="text-3xl font-bold text-purple-600">{finalStats.score}</p>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <span key={i} className="text-4xl">
                {i < finalStats.stars ? '⭐' : '☆'}
              </span>
            ))}
          </div>

          {finalStats.leveledUp && (
            <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
              <p className="text-xl font-bold text-orange-600">
                🎊 Level Up! You're now Level {finalStats.newLevel}!
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(`/courses/${lesson.courses.id}`)}
              className="btn-primary"
            >
              Continue Course
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="btn-secondary"
            >
              All Courses
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading completion
  if (isCompleting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="text-white text-lg font-semibold">Saving your progress...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Points Animation */}
      {showPointsAnimation && (
        <PointsAnimation
          points={lastPointsEarned}
          onComplete={() => setShowPointsAnimation(false)}
        />
      )}

      {/* Lesson Header */}
      <div className="card bg-gradient-to-r from-purple-50 to-blue-50 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{lesson.title}</h1>
            <p className="text-sm text-gray-600">{lesson.courses.title}</p>
          </div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
                navigate(`/courses/${lesson.courses.id}`)
              }
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-700">
            {currentQuestionIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Lesson overview */}
        <div className="mt-4">
          <div className="card bg-white/70">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Lesson Overview
            </h2>
            {lesson.description && (
              <p className="text-sm text-gray-600 mb-3">
                {lesson.description}
              </p>
            )}
            {Object.keys(questionTypeCounts).length > 0 && (
              <div className="flex flex-wrap gap-3">
                {Object.entries(questionTypeCounts).map(([type, count]) => (
                  <div key={type} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {count}× {questionTypeLabels[type] || type}
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-3">
              Tip: tap the speaker icons to hear every Kyrgyz phrase before answering.
            </p>
          </div>
        </div>

        {/* Score */}
        <div className="mt-4 text-center">
          <span className="text-sm font-semibold text-gray-700">
            Score: {score} pts
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="card">
        {currentQuestion && (
          <>
            {currentQuestion.type === 'multiple_choice' && (
              <MultipleChoice
                question={currentQuestion}
                onAnswer={handleAnswer}
              />
            )}
            {currentQuestion.type === 'listening' && (
              <ListeningQuestion
                question={currentQuestion}
                onAnswer={handleAnswer}
              />
            )}
            {currentQuestion.type === 'matching' && (
              <MatchingPairs
                question={currentQuestion}
                onAnswer={handleAnswer}
              />
            )}
            {currentQuestion.type === 'sentence_builder' && (
              <SentenceBuilder
                question={currentQuestion}
                onAnswer={handleAnswer}
              />
            )}
            {currentQuestion.type === 'conversation' && (
              <ConversationPractice
                question={currentQuestion}
                onAnswer={handleAnswer}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function Lesson() {
  return (
    <ProtectedRoute>
      <LessonContent />
    </ProtectedRoute>
  )
}
