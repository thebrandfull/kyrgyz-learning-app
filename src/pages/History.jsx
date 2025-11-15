import { useState, useEffect } from 'react'
import TranslationCard from '../components/TranslationCard'
import { getTranslationHistory, deleteTranslation } from '../services/supabase'

export default function History() {
  const [translations, setTranslations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getTranslationHistory(100)

      if (fetchError) {
        throw new Error('Failed to fetch translation history')
      }

      setTranslations(data || [])
    } catch (err) {
      console.error('Error fetching history:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this translation?')) {
      return
    }

    try {
      const { error: deleteError } = await deleteTranslation(id)

      if (deleteError) {
        throw new Error('Failed to delete translation')
      }

      // Remove from state
      setTranslations((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error('Error deleting translation:', err)
      alert('Failed to delete translation: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Loading translation history...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
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
              <button
                onClick={fetchHistory}
                className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
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
          Translation History
        </h1>
        <p className="text-white text-lg opacity-90">
          {translations.length} saved translation{translations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchHistory}
          className="bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors shadow-md flex items-center space-x-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Translation List */}
      {translations.length === 0 ? (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No translations yet
          </h3>
          <p className="text-gray-500">
            Start translating on the home page to build your history!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {translations.map((translation) => (
            <TranslationCard
              key={translation.id}
              englishText={translation.english_text}
              kyrgyzText={translation.kyrgyz_text}
              audioUrl={translation.kyrgyz_audio_url}
              onDelete={() => handleDelete(translation.id)}
              showDelete={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
