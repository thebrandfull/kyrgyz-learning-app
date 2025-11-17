import { useState, useEffect } from 'react'
import SpeechButton from '../SpeechButton'

export default function SentenceBuilder({ question, onAnswer }) {
  const [availableWords, setAvailableWords] = useState([])
  const [sentence, setSentence] = useState([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  useEffect(() => {
    // Shuffle the word options
    const shuffled = [...question.options].sort(() => Math.random() - 0.5)
    setAvailableWords(shuffled)
  }, [question])

  const handleWordClick = (word, fromSentence = false) => {
    if (showFeedback) return

    if (fromSentence) {
      // Remove from sentence, add back to available
      setSentence(sentence.filter((w) => w !== word))
      setAvailableWords([...availableWords, word])
    } else {
      // Add to sentence, remove from available
      setSentence([...sentence, word])
      setAvailableWords(availableWords.filter((w) => w !== word))
    }
  }

  const handleCheck = () => {
    const builtSentence = sentence.join(' ')
    const correct = builtSentence === question.correct_answer

    setIsCorrect(correct)
    setShowFeedback(true)

    setTimeout(() => {
      onAnswer(correct, question.points_value)
    }, 1500)
  }

  const handleReset = () => {
    setSentence([])
    setAvailableWords([...question.options].sort(() => Math.random() - 0.5))
    setShowFeedback(false)
  }

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {question.question_text}
        </h3>
        <p className="text-sm text-gray-600">
          Tap words in the correct order
        </p>
      </div>

      {/* Sentence Building Area */}
      <div className="card bg-gradient-to-br from-blue-50 to-purple-50 min-h-[120px] p-6">
        {sentence.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            Tap words below to build your sentence
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center">
            {sentence.map((word, index) => (
              <button
                key={index}
                onClick={() => handleWordClick(word, true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all transform hover:scale-105"
              >
                {word}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <SpeechButton
          text={question.correct_answer}
          label="Play target sentence"
          className="w-10 h-10"
        />
      </div>

      {/* Available Words */}
      <div className="card bg-gray-50">
        <h4 className="text-sm font-semibold text-gray-600 mb-3 text-center">
          Available Words
        </h4>
        <div className="flex flex-wrap gap-2 justify-center">
          {availableWords.map((word, index) => (
            <button
              key={index}
              onClick={() => handleWordClick(word)}
              disabled={showFeedback}
              className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-800 rounded-lg font-semibold hover:border-blue-500 hover:bg-blue-50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {!showFeedback && (
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleReset}
            className="btn-secondary px-6 py-2"
          >
            Reset
          </button>
          <button
            onClick={handleCheck}
            disabled={sentence.length === 0}
            className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Answer
          </button>
        </div>
      )}

      {/* Feedback */}
      {showFeedback && (
        <div
          className={`card text-center p-4 ${
            isCorrect
              ? 'bg-green-50 border-2 border-green-200'
              : 'bg-orange-50 border-2 border-orange-200'
          }`}
        >
          <p
            className={`text-lg font-semibold mb-2 ${
              isCorrect ? 'text-green-700' : 'text-orange-700'
            }`}
          >
            {isCorrect ? '🎉 Мыкты! (Excellent!)' : '📝 Not quite right'}
          </p>
          {!isCorrect && (
            <p className="text-sm text-gray-700 mb-2">
              Correct answer: <strong>{question.correct_answer}</strong>
            </p>
          )}
          {question.explanation && (
            <p className="text-sm text-gray-700">{question.explanation}</p>
          )}
        </div>
      )}
    </div>
  )
}
