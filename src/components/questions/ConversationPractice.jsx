import { useState } from 'react'
import AudioButton from '../AudioButton'

export default function ConversationPractice({ question, onAnswer }) {
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
      <div className="card bg-blue-50">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Conversation</h3>
        <div className="space-y-3">
          {question.dialogue?.map((line, index) => (
            <div key={index} className="flex gap-3">
              <span className="font-semibold text-blue-600 min-w-[80px]">
                {line.speaker}:
              </span>
              <p className="text-gray-800 flex-1">{line.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-center text-lg font-semibold text-gray-800 mb-4">
          {question.question_prompt}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option
            const isCorrectOption = option === question.correct_answer

            let className = 'card p-6 cursor-pointer transition-all '

            if (!showFeedback) {
              className += 'hover:shadow-xl border-2 border-transparent hover:border-blue-400'
            } else if (isSelected) {
              className += isCorrect
                ? 'bg-green-50 border-2 border-green-500 shadow-lg'
                : 'bg-red-50 border-2 border-red-500 shadow-lg'
            } else if (isCorrectOption) {
              className += 'bg-green-50 border-2 border-green-500'
            } else {
              className += 'opacity-60 cursor-not-allowed'
            }

            return (
              <button
                key={index}
                onClick={() => handleSelect(option)}
                disabled={showFeedback}
                className={className}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800">
                    {option}
                  </span>
                  {showFeedback && isSelected && (
                    <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
                  )}
                  {showFeedback && !isSelected && isCorrectOption && (
                    <span className="text-2xl">✅</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {showFeedback && (
        <div
          className={`card text-center p-4 ${
            isCorrect
              ? 'bg-green-50 border-2 border-green-200'
              : 'bg-orange-50 border-2 border-orange-200'
          }`}
        >
          <p
            className={`text-lg font-semibold ${
              isCorrect ? 'text-green-700' : 'text-orange-700'
            }`}
          >
            {isCorrect ? '🎉 Туура жооп!' : '📝 Кайра аракет кылып көрүңүз!'}
          </p>
          {question.explanation && (
            <p className="text-sm text-gray-700 mt-2">{question.explanation}</p>
          )}
        </div>
      )}
    </div>
  )
}
