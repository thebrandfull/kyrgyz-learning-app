import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../services/supabase'

const UserProgressContext = createContext({
  stats: null,
  loading: true,
  refreshStats: () => {},
  updatePoints: () => {},
  updateStreak: () => {},
})

export const useUserProgress = () => {
  const context = useContext(UserProgressContext)
  if (!context) {
    throw new Error('useUserProgress must be used within UserProgressProvider')
  }
  return context
}

export const UserProgressProvider = ({ children }) => {
  const { user, signedIn } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (signedIn && user) {
      loadStats()
    } else {
      setStats(null)
      setLoading(false)
    }
  }, [signedIn, user])

  const loadStats = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        throw error
      } else if (!data) {
        // Create stats if they don't exist
        await createStats()
      } else {
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const createStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .insert([{ user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setStats(data)
    } catch (error) {
      console.error('Error creating stats:', error)
    }
  }

  const refreshStats = async () => {
    if (user) {
      await loadStats()
    }
  }

  const updatePoints = async (pointsToAdd) => {
    if (!user || !stats) return

    try {
      const newPoints = stats.total_points + pointsToAdd
      const newLevel = calculateLevel(newPoints)

      const { data, error } = await supabase
        .from('user_stats')
        .update({
          total_points: newPoints,
          current_level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      setStats(data)

      return { newLevel: data.current_level, leveledUp: newLevel > stats.current_level }
    } catch (error) {
      console.error('Error updating points:', error)
      return { newLevel: stats.current_level, leveledUp: false }
    }
  }

  const updateStreak = async () => {
    if (!user || !stats) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const lastPractice = stats.last_practice_date

      let newStreak = stats.current_streak
      let newLongestStreak = stats.longest_streak

      if (lastPractice === today) {
        // Already practiced today, no change
        return
      }

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (lastPractice === yesterdayStr) {
        // Consecutive day
        newStreak = stats.current_streak + 1
      } else if (lastPractice !== today) {
        // Streak broken
        newStreak = 1
      }

      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak
      }

      const { data, error } = await supabase
        .from('user_stats')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_practice_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      setStats(data)
    } catch (error) {
      console.error('Error updating streak:', error)
    }
  }

  const calculateLevel = (points) => {
    // Level formula: floor(sqrt(points / 100))
    // Level 1: 0-99 points
    // Level 2: 100-399 points
    // Level 3: 400-899 points
    // etc.
    return Math.max(1, Math.floor(Math.sqrt(points / 100)) + 1)
  }

  const value = {
    stats,
    loading,
    refreshStats,
    updatePoints,
    updateStreak,
  }

  return (
    <UserProgressContext.Provider value={value}>
      {children}
    </UserProgressContext.Provider>
  )
}
