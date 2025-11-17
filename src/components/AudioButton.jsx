import { useState } from 'react'
import { generateSpeech } from '../services/elevenlabs'
import audioUrlMapping from '../data/audioUrlsFull.json'
import { audioToGenerateFull } from '../data/audioToGenerateFull.js'

// In-memory cache for runtime-generated audio only
const audioCache = new Map()

// Create reverse lookup: text -> audio URL
const textToUrlMap = new Map()
audioToGenerateFull.forEach(({ key, text }) => {
  if (audioUrlMapping[key]) {
    textToUrlMap.set(text, audioUrlMapping[key])
  }
})

export default function AudioButton({ text, language = 'ky', className = '', size = 'md' }) {
  const [loading, setLoading] = useState(false)

  if (!text || !/[\u0400-\u04FF]/.test(text)) return null // Only show for Cyrillic text

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const handlePlay = async (event) => {
    event?.stopPropagation()
    if (loading) return

    try {
      setLoading(true)

      // PRIORITY 1: Check if we have a pre-generated audio file for this text
      const preGeneratedUrl = textToUrlMap.get(text)
      if (preGeneratedUrl) {
        console.log('✅ Using pre-generated audio for:', text.substring(0, 30))
        const audio = new Audio(preGeneratedUrl)
        await audio.play()
        setLoading(false)
        return
      }

      // PRIORITY 2: Check runtime cache for previously generated audio
      let audioUrl = audioCache.get(text)

      // PRIORITY 3: Generate new audio (fallback for user-generated content)
      if (!audioUrl) {
        console.log('⚠️ Generating runtime audio for:', text.substring(0, 30))
        const { audioBlob, error } = await generateSpeech(text, language)
        if (error || !audioBlob) {
          console.error('Failed to generate speech:', error)
          return
        }
        audioUrl = URL.createObjectURL(audioBlob)
        audioCache.set(text, audioUrl)
      }

      const audio = new Audio(audioUrl)
      await audio.play()
    } catch (error) {
      console.error('Failed to play audio:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`Play audio: ${text}`}
      onClick={handlePlay}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handlePlay(e)
        }
      }}
      className={`inline-flex items-center justify-center rounded-full border border-blue-300 bg-white text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer ${sizeClasses[size]} ${className}`}
      title="Play audio"
    >
      {loading ? (
        <span className="animate-pulse text-xs">...</span>
      ) : (
        <svg
          className={iconSizes[size]}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 4.804A.75.75 0 0 0 7.85 4.2L4.184 7H2.75A1.75 1.75 0 0 0 1 8.75v2.5A1.75 1.75 0 0 0 2.75 13h1.434l3.666 2.8A.75.75 0 0 0 9 15.196V4.804ZM12.32 6.25a.75.75 0 0 1 1.06.1 5 5 0 0 1 0 6.8.75.75 0 0 1-1.16-.96 3.5 3.5 0 0 0 0-4.88.75.75 0 0 1 .1-1.06Zm2.9-2.44a.75.75 0 0 1 1.06.1 8 8 0 0 1 0 11.18.75.75 0 0 1-1.16-.96 6.5 6.5 0 0 0 0-9.26.75.75 0 0 1 .1-1.06Z" />
        </svg>
      )}
    </span>
  )
}
