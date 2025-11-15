import AudioPlayer from './AudioPlayer'

export default function TranslationCard({
  englishText,
  kyrgyzText,
  audioUrl,
  onDelete,
  showDelete = false,
}) {
  return (
    <div className="card hover:shadow-xl transition-shadow">
      {/* English Text */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            English
          </h3>
          {showDelete && (
            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-700 transition-colors"
              aria-label="Delete translation"
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
        <p className="text-gray-800 text-lg">{englishText}</p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Kyrgyz Text */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
          Кыргызча (Kyrgyz)
        </h3>
        <p className="text-gray-800 text-lg font-medium">{kyrgyzText}</p>
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="mt-4">
          <AudioPlayer audioUrl={audioUrl} label="Kyrgyz Pronunciation" />
        </div>
      )}
    </div>
  )
}
