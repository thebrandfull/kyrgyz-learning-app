import { useState, useEffect } from 'react'
import VocabularyCard from '../components/VocabularyCard'
import { generateVocabularyCard } from '../services/deepseek'
import { generateSpeech } from '../services/elevenlabs'
import { saveVocabularyCard, getVocabularyCards, deleteVocabularyCard, uploadAudio } from '../services/supabase'

export default function Vocabulary() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)
  const [wordInput, setWordInput] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getVocabularyCards(100)

      if (fetchError) {
        throw new Error('Failed to fetch vocabulary cards')
      }

      setCards(data || [])
    } catch (err) {
      console.error('Error fetching cards:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCard = async (e) => {
    e.preventDefault()
    if (!wordInput.trim()) return

    setCreating(true)
    setError(null)

    try {
      // Step 1: Generate card data using DeepSeek
      const { cardData, error: generateError } = await generateVocabularyCard(
        wordInput
      )

      if (generateError) {
        throw new Error('Failed to generate vocabulary card')
      }

      // Step 2: Generate audio for the Kyrgyz word
      const { audioBlob: wordAudioBlob, error: wordTtsError } =
        await generateSpeech(cardData.kyrgyz_word, 'ky')

      if (wordTtsError) {
        throw new Error('Failed to generate word pronunciation')
      }

      // Step 3: Generate audio for the Kyrgyz example sentence
      const { audioBlob: exampleAudioBlob, error: exampleTtsError } =
        await generateSpeech(cardData.example_ky, 'ky')

      if (exampleTtsError) {
        throw new Error('Failed to generate example pronunciation')
      }

      // Step 4: Upload both audio files
      const { url: wordAudioUrl, error: wordUploadError } = await uploadAudio(
        wordAudioBlob,
        `word-${wordInput}.mp3`
      )

      if (wordUploadError) {
        throw new Error('Failed to upload word audio')
      }

      const { url: exampleAudioUrl, error: exampleUploadError } =
        await uploadAudio(exampleAudioBlob, `example-${wordInput}.mp3`)

      if (exampleUploadError) {
        throw new Error('Failed to upload example audio')
      }

      // Step 5: Save to database
      const newCard = {
        english_word: wordInput,
        kyrgyz_word: cardData.kyrgyz_word,
        meaning: cardData.meaning,
        example_sentence_en: cardData.example_en,
        example_sentence_ky: cardData.example_ky,
        word_audio_url: wordAudioUrl,
        example_audio_url: exampleAudioUrl,
      }

      const { data, error: saveError } = await saveVocabularyCard(newCard)

      if (saveError) {
        throw new Error('Failed to save vocabulary card')
      }

      // Add to state
      setCards((prev) => [data[0], ...prev])
      setWordInput('')
      setShowForm(false)
    } catch (err) {
      console.error('Error creating card:', err)
      setError(err.message || 'Failed to create vocabulary card')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vocabulary card?')) {
      return
    }

    try {
      const { error: deleteError } = await deleteVocabularyCard(id)

      if (deleteError) {
        throw new Error('Failed to delete vocabulary card')
      }

      setCards((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error('Error deleting card:', err)
      alert('Failed to delete vocabulary card: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Loading vocabulary cards...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          Vocabulary Library
        </h1>
        <p className="text-white text-lg opacity-90">
          {cards.length} saved word{cards.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Add New Card Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>{showForm ? 'Cancel' : 'Add New Word'}</span>
        </button>
      </div>

      {/* Create Card Form */}
      {showForm && (
        <div className="card bg-gradient-to-br from-blue-50 to-purple-50">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Create Vocabulary Card
          </h2>
          <form onSubmit={handleCreateCard} className="space-y-4">
            <div>
              <label
                htmlFor="word"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                English Word
              </label>
              <input
                id="word"
                type="text"
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                placeholder="Enter an English word..."
                className="input-field"
                disabled={creating}
                required
              />
            </div>
            <button
              type="submit"
              disabled={creating || !wordInput.trim()}
              className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating card...</span>
                </span>
              ) : (
                'Generate Card'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Error Display */}
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

      {/* Vocabulary Cards List */}
      {cards.length === 0 ? (
        <div className="card text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No vocabulary cards yet
          </h3>
          <p className="text-gray-500">
            Click "Add New Word" to create your first vocabulary card!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <VocabularyCard
              key={card.id}
              englishWord={card.english_word}
              kyrgyzWord={card.kyrgyz_word}
              meaning={card.meaning}
              exampleEn={card.example_sentence_en}
              exampleKy={card.example_sentence_ky}
              wordAudioUrl={card.word_audio_url}
              exampleAudioUrl={card.example_audio_url}
              onDelete={() => handleDelete(card.id)}
              showDelete={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
