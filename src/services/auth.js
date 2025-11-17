import { supabase } from './supabase'

// Sign up new user
export const signUp = async (email, password, displayName) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: authData.user.id,
            display_name: displayName || email.split('@')[0],
          },
        ])

      if (profileError) console.error('Error creating profile:', profileError)

      // Create user stats
      const { error: statsError } = await supabase
        .from('user_stats')
        .insert([
          {
            user_id: authData.user.id,
          },
        ])

      if (statsError) console.error('Error creating stats:', statsError)
    }

    return { user: authData.user, error: null }
  } catch (error) {
    console.error('Error in signUp:', error)
    return { user: null, error }
  }
}

// Sign in existing user
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return { user: data.user, error: null }
  } catch (error) {
    console.error('Error in signIn:', error)
    return { user: null, error }
  }
}

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error in signOut:', error)
    return { error }
  }
}

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) throw error

    return { user, error: null }
  } catch (error) {
    console.error('Error getting current user:', error)
    return { user: null, error }
  }
}

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error

    return { profile: data, error: null }
  } catch (error) {
    console.error('Error getting user profile:', error)
    return { profile: null, error }
  }
}

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    return { profile: data, error: null }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { profile: null, error }
  }
}

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}
