import { useState } from 'react'
import ScribeRecorder from '../components/ScribeRecorder'
import WhisperRecorder from '../components/WhisperRecorder'
import TranslationCard from '../components/TranslationCard'
import { generateSpeech } from '../services/elevenlabs'
import { translateText } from '../services/deepseek'
import { saveTranslation, uploadAudio } from '../services/supabase'

export default function Home() {
  const [mode, setMode] = useState('kyrgyz-to-english') // or 'english-to-kyrgyz'
  const [inputType, setInputType] = useState('voice') // or 'text'
  const [sttEngine, setSttEngine] = useState('whisper') // 'whisper' or 'scribe'
  const [textInput, setTextInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [transcript, setTranscript] = useState('') // Store transcript for editing
  const [showTranscriptEditor, setShowTranscriptEditor] = useState(false)

  // Handle transcript from ScribeRecorder (show for editing first)
  const handleTranscriptComplete = async (transcribedText) => {
    if (!transcribedText || !transcribedText.trim()) {
      setError('No speech detected. Please try again.')
      return
    }

    // Show transcript for user to review/edit
    setTranscript(transcribedText)
    setShowTranscriptEditor(true)
    setError(null)
    setResult(null)
  }

  // Process the transcript after user confirms/edits
  const handleTranscriptSubmit = async (e) => {
    e.preventDefault()
    if (!transcript.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)
    setShowTranscriptEditor(false)

    try {
      // Translate based on mode
      let englishText, kyrgyzText

      if (mode === 'kyrgyz-to-english') {
        kyrgyzText = transcript
        const { translation, error: translateError } = await translateText(
          transcript,
          'english'
        )
        if (translateError) throw new Error('Failed to translate text')
        englishText = translation
      } else {
        englishText = transcript
        const { translation, error: translateError } = await translateText(
          transcript,
          'kyrgyz'
        )
        if (translateError) throw new Error('Failed to translate text')
        kyrgyzText = translation
      }

      // Step 3: Generate Kyrgyz audio
      const { audioBlob: kyrgyzAudioBlob, error: ttsError } =
        await generateSpeech(kyrgyzText, 'ky')

      if (ttsError) throw new Error('Failed to generate speech')

      // Step 4: Upload audio to Supabase
      const { url: audioUrl, error: uploadError } = await uploadAudio(
        kyrgyzAudioBlob,
        'kyrgyz-audio.mp3'
      )

      if (uploadError) throw new Error('Failed to upload audio')

      // Step 5: Save to database
      await saveTranslation(englishText, kyrgyzText, audioUrl)

      // Set result
      setResult({
        englishText,
        kyrgyzText,
        audioUrl,
      })
    } catch (err) {
      console.error('Error processing audio:', err)
      setError(err.message || 'An error occurred while processing your request')
    } finally {
      setLoading(false)
    }
  }

  const handleTextSubmit = async (e) => {
    e.preventDefault()
    if (!textInput.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      let englishText, kyrgyzText

      if (mode === 'kyrgyz-to-english') {
        kyrgyzText = textInput
        const { translation, error: translateError } = await translateText(
          textInput,
          'english'
        )
        if (translateError) throw new Error('Failed to translate text')
        englishText = translation
      } else {
        englishText = textInput
        const { translation, error: translateError } = await translateText(
          textInput,
          'kyrgyz'
        )
        if (translateError) throw new Error('Failed to translate text')
        kyrgyzText = translation
      }

      // Generate Kyrgyz audio
      const { audioBlob: kyrgyzAudioBlob, error: ttsError } =
        await generateSpeech(kyrgyzText, 'ky')

      if (ttsError) throw new Error('Failed to generate speech')

      // Upload audio
      const { url: audioUrl, error: uploadError } = await uploadAudio(
        kyrgyzAudioBlob,
        'kyrgyz-audio.mp3'
      )

      if (uploadError) throw new Error('Failed to upload audio')

      // Save to database
      await saveTranslation(englishText, kyrgyzText, audioUrl)

      setResult({
        englishText,
        kyrgyzText,
        audioUrl,
      })

      setTextInput('')
    } catch (err) {
      console.error('Error processing text:', err)
      setError(err.message || 'An error occurred while processing your request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          Kyrgyz Learning Assistant
        </h1>
        <p className="text-white text-lg opacity-90">
          Translate between English and Kyrgyz with perfect pronunciation
        </p>
      </div>

      {/* Mode Selection */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Translation Mode
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setMode('kyrgyz-to-english')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              mode === 'kyrgyz-to-english'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Kyrgyz → English
          </button>
          <button
            onClick={() => setMode('english-to-kyrgyz')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              mode === 'english-to-kyrgyz'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            English → Kyrgyz
          </button>
        </div>
      </div>

      {/* Input Type Selection */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Input Type</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setInputType('voice')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              inputType === 'voice'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Voice Recording
          </button>
          <button
            onClick={() => setInputType('text')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              inputType === 'text'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Text Input
          </button>
        </div>
      </div>

      {/* Speech Engine Selection (for voice input) */}
      {inputType === 'voice' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Speech Recognition Engine
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setSttEngine('whisper')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                sttEngine === 'whisper'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex flex-col items-center">
                <span>OpenAI Whisper</span>
                <span className="text-xs opacity-80 mt-1">
                  ✓ Best for Kyrgyz
                </span>
              </div>
            </button>
            <button
              onClick={() => setSttEngine('scribe')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                sttEngine === 'scribe'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex flex-col items-center">
                <span>ElevenLabs Scribe</span>
                <span className="text-xs opacity-80 mt-1">
                  Real-time transcription
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="card bg-gradient-to-br from-blue-50 to-purple-50">
        {inputType === 'voice' ? (
          <div className="py-8">
            {sttEngine === 'whisper' ? (
              <WhisperRecorder
                onTranscriptComplete={handleTranscriptComplete}
                language={mode === 'kyrgyz-to-english' ? 'ky' : 'en'}
              />
            ) : (
              <ScribeRecorder
                onTranscriptComplete={handleTranscriptComplete}
                language={mode === 'kyrgyz-to-english' ? 'ky' : 'en'}
              />
            )}
          </div>
        ) : (
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={`Enter text in ${
                mode === 'kyrgyz-to-english' ? 'Kyrgyz' : 'English'
              }...`}
              className="input-field min-h-[120px] resize-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !textInput.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Translate'}
            </button>
          </form>
        )}
      </div>

      {/* Transcript Editor - Allow user to correct speech recognition errors */}
      {showTranscriptEditor && (
        <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
          <div className="flex items-start space-x-3 mb-4">
            <svg
              className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">
                Review & Edit Transcript
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Speech recognition may have errors. Please review and correct the text before translating.
              </p>
            </div>
          </div>

          <form onSubmit={handleTranscriptSubmit} className="space-y-4">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="input-field min-h-[120px] resize-none font-medium text-lg"
              placeholder="Edit the transcript if needed..."
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!transcript.trim()}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ Confirm & Translate
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTranscriptEditor(false)
                  setTranscript('')
                }}
                className="btn-secondary bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="card text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Processing your request...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card bg-red-50 border-2 border-red-200">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Translation Result</h2>
          <TranslationCard
            englishText={result.englishText}
            kyrgyzText={result.kyrgyzText}
            audioUrl={result.audioUrl}
          />
        </div>
      )}
    </div>
  )
}
