import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser, onAuthStateChange, getUserProfile } from '../services/auth'

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signedIn: false,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session on mount
    checkUser()

    // Listen for auth changes
    const { data: authListener } = onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await loadProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const { user: currentUser } = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        await loadProfile(currentUser.id)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProfile = async (userId) => {
    try {
      const { profile: userProfile } = await getUserProfile(userId)
      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signedIn: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
