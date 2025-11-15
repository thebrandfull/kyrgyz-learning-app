import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Translation Logs Operations
export const saveTranslation = async (englishText, kyrgyzText, kyrgyzAudioUrl) => {
  try {
    const { data, error } = await supabase
      .from('translation_logs')
      .insert([
        {
          english_text: englishText,
          kyrgyz_text: kyrgyzText,
          kyrgyz_audio_url: kyrgyzAudioUrl,
        },
      ])
      .select()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error saving translation:', error)
    return { data: null, error }
  }
}

export const getTranslationHistory = async (limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('translation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching translation history:', error)
    return { data: null, error }
  }
}

export const deleteTranslation = async (id) => {
  try {
    const { error } = await supabase
      .from('translation_logs')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting translation:', error)
    return { error }
  }
}

// Vocabulary Cards Operations
export const saveVocabularyCard = async (cardData) => {
  try {
    const { data, error } = await supabase
      .from('vocabulary_cards')
      .insert([cardData])
      .select()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error saving vocabulary card:', error)
    return { data: null, error }
  }
}

export const getVocabularyCards = async (limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('vocabulary_cards')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching vocabulary cards:', error)
    return { data: null, error }
  }
}

export const deleteVocabularyCard = async (id) => {
  try {
    const { error } = await supabase
      .from('vocabulary_cards')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting vocabulary card:', error)
    return { error }
  }
}

// Storage Operations for Audio Files
export const uploadAudio = async (audioBlob, filename) => {
  try {
    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(`${Date.now()}_${filename}`, audioBlob, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
      })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('audio-files')
      .getPublicUrl(data.path)

    return { url: urlData.publicUrl, error: null }
  } catch (error) {
    console.error('Error uploading audio:', error)
    return { url: null, error }
  }
}
