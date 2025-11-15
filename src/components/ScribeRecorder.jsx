import { useState } from 'react'
import { useScribe } from '@elevenlabs/react'
import { generateScribeToken } from '../services/scribeToken'

export default function ScribeRecorder({ onTranscriptComplete, language = 'ky' }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState(null)
  const [timerInterval, setTimerInterval] = useState(null)

  const scribe = useScribe({
    modelId: 'scribe_v2_realtime',
    languageCode: language, // 'ky' for Kyrgyz, 'en' for English
    onPartialTranscript: (data) => {
      console.log('Partial transcript:', data.text)
    },
    onCommittedTranscript: (data) => {
      console.log('Committed transcript:', data.text)
    },
    onError: (err) => {
      console.error('Scribe error:', err)
      setError(err.message || 'Recording error occurred')
      handleStop()
    },
  })

  const handleStart = async () => {
    try {
      setError(null)

      // Generate a single-use token
      const { token, error: tokenError } = await generateScribeToken()

      if (tokenError) {
        setError('Failed to start recording. Please check your API key has Scribe access.')
        return
      }

      // Connect to Scribe with the token
      await scribe.connect({
        token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
      setTimerInterval(interval)
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Failed to access microphone. Please allow microphone access.')
    }
  }

  const handleStop = async () => {
    if (scribe.isConnected) {
      // Get all committed transcripts + partial transcript
      const committedText = scribe.committedTranscripts
        .map(t => t.text)
        .join(' ')

      const partialText = scribe.partialTranscript || ''

      // Combine committed and partial (in case user stops before VAD commits)
      const fullTranscript = [committedText, partialText]
        .filter(t => t.trim())
        .join(' ')
        .trim()

      console.log('Full transcript:', fullTranscript)

      await scribe.disconnect()

      // Pass transcript to parent component
      if (fullTranscript && onTranscriptComplete) {
        onTranscriptComplete(fullTranscript)
      } else {
        setError('No speech detected. Please try again.')
      }
    }

    setIsRecording(false)
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
    setRecordingTime(0)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Recording Button */}
      <button
        onClick={isRecording ? handleStop : handleStart}
        disabled={scribe.isConnecting}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-blue-500 hover:bg-blue-600'
        } ${scribe.isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isRecording ? (
          <svg
            className="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <rect x="6" y="6" width="8" height="8" />
          </svg>
        ) : (
          <svg
            className="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Recording Status */}
      <div className="text-center min-h-[100px]">
        {error ? (
          <div className="text-red-300 text-sm max-w-md">
            {error}
          </div>
        ) : isRecording ? (
          <div className="space-y-2">
            <p className="text-white font-semibold text-lg">Recording...</p>
            <p className="text-white text-2xl font-mono">{formatTime(recordingTime)}</p>

            {/* Live transcript */}
            {scribe.partialTranscript && (
              <div className="mt-4 p-4 bg-blue-600 rounded-lg shadow-md">
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-2">
                  🎤 Live:
                </p>
                <p className="text-white text-base font-medium">
                  {scribe.partialTranscript}
                </p>
              </div>
            )}

            {/* Committed transcripts */}
            {scribe.committedTranscripts.length > 0 && (
              <div className="mt-3 p-4 bg-green-600 rounded-lg shadow-md max-h-40 overflow-y-auto">
                <p className="text-green-200 text-xs font-semibold uppercase tracking-wide mb-2">
                  ✓ Captured:
                </p>
                {scribe.committedTranscripts.map((t) => (
                  <p key={t.id} className="text-white text-base font-medium mb-2">
                    {t.text}
                  </p>
                ))}
              </div>
            )}

            <p className="text-white text-sm opacity-80">
              Tap the button to stop
            </p>
          </div>
        ) : scribe.isConnecting ? (
          <div className="space-y-2">
            <p className="text-white font-semibold">Connecting...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-white font-semibold">
              Record in {language === 'ky' ? 'Kyrgyz' : 'English'}
            </p>
            <p className="text-white text-sm opacity-80">
              Tap the microphone to start
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
