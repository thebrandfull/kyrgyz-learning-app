import { useState } from 'react'
import AudioPlayer from '../AudioPlayer'

export default function ListeningQuestion({ question, onAnswer }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const handleSelect = (option) => {
    if (showFeedback) return

    setSelectedAnswer(option)
    setShowFeedback(true)

    const isCorrect = option === question.correct_answer
    setTimeout(() => {
      onAnswer(isCorrect, question.points_value)
    }, 1500)
  }

  const isCorrect = selectedAnswer === question.correct_answer

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          {question.question_text}
        </h3>

        {/* Audio Player */}
        {question.question_audio_url && (
          <div className="inline-block">
            <AudioPlayer
              audioUrl={question.question_audio_url}
              label="🔊 Play Audio"
            />
          </div>
        )}

        {!question.question_audio_url && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            ⚠️ Audio not available for this question
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option
          const isCorrectOption = option === question.correct_answer

          let className = 'card p-6 cursor-pointer transition-all transform hover:scale-105 '

          if (!showFeedback) {
            className += 'hover:shadow-xl border-2 border-transparent hover:border-purple-400'
          } else if (isSelected) {
            className += isCorrect
              ? 'bg-green-50 border-2 border-green-500 shadow-lg'
              : 'bg-red-50 border-2 border-red-500 shadow-lg'
          } else if (showFeedback && isCorrectOption) {
            className += 'bg-green-50 border-2 border-green-500'
          } else {
            className += 'opacity-50 cursor-not-allowed'
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              disabled={showFeedback}
              className={className}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold text-gray-800">
                  {option}
                </span>
                {showFeedback && isSelected && (
                  <span className="text-2xl">
                    {isCorrect ? '✅' : '❌'}
                  </span>
                )}
                {showFeedback && !isSelected && isCorrectOption && (
                  <span className="text-2xl">✅</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div
          className={`card text-center p-4 ${
            isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'
          }`}
        >
          <p className={`text-lg font-semibold mb-2 ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
            {isCorrect ? '🎉 Жакшы! (Good!)' : '📝 Try listening again!'}
          </p>
          {question.explanation && (
            <p className="text-sm text-gray-700">{question.explanation}</p>
          )}
        </div>
      )}
    </div>
  )
}
