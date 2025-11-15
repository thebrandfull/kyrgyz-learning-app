import AudioPlayer from './AudioPlayer'

export default function VocabularyCard({
  englishWord,
  kyrgyzWord,
  meaning,
  exampleEn,
  exampleKy,
  wordAudioUrl,
  exampleAudioUrl,
  onDelete,
  showDelete = false,
}) {
  return (
    <div className="card hover:shadow-xl transition-shadow">
      {/* Header with Delete Button */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* English Word */}
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{englishWord}</h2>
          {/* Kyrgyz Word */}
          <p className="text-xl text-blue-600 font-semibold">{kyrgyzWord}</p>
        </div>
        {showDelete && (
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 transition-colors"
            aria-label="Delete vocabulary card"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Word Audio */}
      {wordAudioUrl && (
        <div className="mb-4">
          <AudioPlayer audioUrl={wordAudioUrl} label="Word Pronunciation" />
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Meaning */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Meaning
        </h3>
        <p className="text-gray-700">{meaning}</p>
      </div>

      {/* Example Sentences */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Example
          </h4>
          <p className="text-gray-700 italic">"{exampleEn}"</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
            Кыргызча
          </h4>
          <p className="text-gray-800 font-medium">"{exampleKy}"</p>
        </div>

        {/* Example Audio */}
        {exampleAudioUrl && (
          <div className="pt-2">
            <AudioPlayer
              audioUrl={exampleAudioUrl}
              label="Example Pronunciation"
            />
          </div>
        )}
      </div>
    </div>
  )
}
