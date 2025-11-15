import { useState, useRef } from 'react'

export default function AudioRecorder({ onRecordingComplete, language = 'kyrgyz' }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        onRecordingComplete(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Please allow microphone access to record audio.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
      setRecordingTime(0)
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
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
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

      {/* Recording Status */}
      <div className="text-center">
        {isRecording ? (
          <div className="space-y-2">
            <p className="text-white font-semibold text-lg">Recording...</p>
            <p className="text-white text-2xl font-mono">{formatTime(recordingTime)}</p>
            <p className="text-white text-sm opacity-80">
              Tap the button to stop
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-white font-semibold">
              Record in {language === 'kyrgyz' ? 'Kyrgyz' : 'English'}
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
