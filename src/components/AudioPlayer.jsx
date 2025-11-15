import { useState, useRef, useEffect } from 'react'

export default function AudioPlayer({ audioUrl, label = 'Play Audio' }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [audioUrl])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00'
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    if (!audio) return

    const seekTime = (e.target.value / 100) * duration
    audio.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors flex-shrink-0"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-white ml-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Progress Bar */}
      <div className="flex-1 space-y-1">
        <div className="text-xs text-gray-600 font-medium">{label}</div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 font-mono w-10">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
            style={{
              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progress}%, #D1D5DB ${progress}%, #D1D5DB 100%)`,
            }}
          />
          <span className="text-xs text-gray-500 font-mono w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}
