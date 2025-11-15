import { useState, useRef } from 'react'
import { transcribeWithWhisper } from '../services/whisper'

export default function WhisperRecorder({ onTranscriptComplete, language = 'ky' }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(null)

  const startRecording = async () => {
    try {
      setError(null)

      // Request audio with higher quality settings for better accuracy
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 48000, // Higher sample rate for better quality
          echoCancellation: true,
          noiseSuppression: false, // Disable to avoid cutting off word endings
          autoGainControl: true,
        }
      })

      console.log('Audio stream obtained:', stream.getAudioTracks()[0].getSettings())

      // Set up audio level visualization
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      analyser.fftSize = 256
      microphone.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      // Monitor audio levels
      const monitorAudioLevel = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(Math.min(100, average * 2)) // Scale to 0-100
        animationFrameRef.current = requestAnimationFrame(monitorAudioLevel)
      }
      monitorAudioLevel()

      // Use WAV format for better compatibility with Whisper
      // Opus was compressing too aggressively
      let mimeType = 'audio/wav'
      const options = {}

      // Try WAV first, then fall back to other formats
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav'
        options.mimeType = mimeType
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=pcm')) {
        mimeType = 'audio/webm;codecs=pcm'
        options.mimeType = mimeType
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm'
        options.mimeType = mimeType
        options.audioBitsPerSecond = 256000 // Higher bitrate
      } else {
        // Default - let browser choose
        console.warn('Using browser default audio format')
      }

      console.log('Using MIME type:', mimeType, options)

      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
          console.log('📼 Audio chunk received:', e.data.size, 'bytes, type:', e.data.type)
        }
      }

      mediaRecorder.onstop = async () => {
        console.log('🛑 Recording stopped. Total chunks:', chunksRef.current.length)

        const audioBlob = new Blob(chunksRef.current, { type: mimeType })
        console.log('🎵 Final audio blob:', audioBlob.size, 'bytes, type:', audioBlob.type)

        stream.getTracks().forEach((track) => track.stop())

        // Check if we have enough audio data
        if (audioBlob.size < 10000) {
          setError(`Recording too short: ${audioBlob.size} bytes. Please speak for at least 3 seconds and ensure your microphone is working.`)
          setRecordingTime(0)
          return
        }

        // Process with Whisper
        await processAudio(audioBlob)
      }

      mediaRecorder.onerror = (e) => {
        console.error('MediaRecorder error:', e)
        setError('Recording error occurred. Please try again.')
      }

      // Start recording with timeslice to get data periodically
      console.log('▶️ Starting recording...')
      mediaRecorder.start(1000) // Request data every second
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setError('Please allow microphone access and ensure your microphone is working.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      setIsRecording(false)
      clearInterval(timerRef.current)

      // Add a small delay before stopping to capture word endings
      setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop()
        }

        // Stop audio monitoring
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        if (audioContextRef.current) {
          audioContextRef.current.close()
        }
        setAudioLevel(0)
      }, 300) // 300ms buffer to capture trailing sounds
    }
  }

  const processAudio = async (audioBlob) => {
    setIsProcessing(true)
    setRecordingTime(0)

    try {
      const { text, error: whisperError } = await transcribeWithWhisper(audioBlob, language)

      if (whisperError) {
        throw new Error('Failed to transcribe audio')
      }

      if (text && text.trim()) {
        onTranscriptComplete(text.trim())
      } else {
        setError('No speech detected. Please try again.')
      }
    } catch (err) {
      console.error('Error processing audio:', err)
      setError('Failed to process audio. Please try again.')
    } finally {
      setIsProcessing(false)
    }
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
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
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

      {/* Status Display */}
      <div className="text-center min-h-[100px]">
        {error ? (
          <div className="text-red-300 text-sm max-w-md">
            {error}
          </div>
        ) : isProcessing ? (
          <div className="space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white font-semibold text-lg">
              Transcribing with Whisper...
            </p>
            <p className="text-white/70 text-sm">
              Auto-detecting language
            </p>
          </div>
        ) : isRecording ? (
          <div className="space-y-3">
            <p className="text-white font-semibold text-lg">Recording...</p>
            <p className="text-white text-2xl font-mono">{formatTime(recordingTime)}</p>

            {/* Audio level indicator */}
            <div className="w-full max-w-xs mx-auto">
              <div className="bg-white/20 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-green-400 h-full transition-all duration-100"
                  style={{ width: `${audioLevel}%` }}
                ></div>
              </div>
              <p className="text-white/70 text-xs mt-1 text-center">
                {audioLevel > 5 ? '🎤 Detecting audio' : '⚠️ No audio detected - speak louder!'}
              </p>
            </div>

            <p className="text-white text-sm opacity-80">
              Tap the button to stop
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-white font-semibold">
              Record in {language === 'ky' ? 'Kyrgyz' : 'English'}
            </p>
            <p className="text-white text-sm opacity-80">
              Using OpenAI Whisper
            </p>
            <p className="text-white/60 text-xs">
              99 languages - Auto-detection
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
