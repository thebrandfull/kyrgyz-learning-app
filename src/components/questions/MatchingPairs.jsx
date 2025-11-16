import { useState, useEffect } from 'react'

export default function MatchingPairs({ question, onAnswer }) {
  const [selected, setSelected] = useState({ left: null, right: null })
  const [matched, setMatched] = useState([])
  const [showFeedback, setShowFeedback] = useState(false)

  // Shuffle the right side options
  const [rightOptions, setRightOptions] = useState([])

  useEffect(() => {
    const shuffled = [...question.options]
      .map((opt) => opt.english || opt.sound)
      .sort(() => Math.random() - 0.5)
    setRightOptions(shuffled)
  }, [question])

  const handleLeftClick = (item) => {
    if (showFeedback) return
    if (matched.includes(item.kyrgyz)) return

    setSelected({ ...selected, left: item })

    // If right is already selected, check match
    if (selected.right) {
      checkMatch(item, selected.right)
    }
  }

  const handleRightClick = (item) => {
    if (showFeedback) return
    if (matched.find((m) => m.includes(item))) return

    setSelected({ ...selected, right: item })

    // If left is already selected, check match
    if (selected.left) {
      checkMatch(selected.left, item)
    }
  }

  const checkMatch = (leftItem, rightItem) => {
    const expectedRight = leftItem.english || leftItem.sound

    if (rightItem === expectedRight) {
      // Correct match
      setMatched([...matched, leftItem.kyrgyz])
      setSelected({ left: null, right: null })

      // Check if all matched
      if (matched.length + 1 === question.options.length) {
        setShowFeedback(true)
        setTimeout(() => {
          onAnswer(true, question.points_value)
        }, 1500)
      }
    } else {
      // Wrong match - reset after brief visual feedback
      setTimeout(() => {
        setSelected({ left: null, right: null })
      }, 500)
    }
  }

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {question.question_text}
        </h3>
        <p className="text-sm text-gray-600">
          Tap pairs to match them
        </p>
      </div>

      {/* Matching Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Kyrgyz */}
        <div className="space-y-3">
          {question.options.map((item, index) => {
            const isMatched = matched.includes(item.kyrgyz)
            const isSelected = selected.left?.kyrgyz === item.kyrgyz

            return (
              <button
                key={index}
                onClick={() => handleLeftClick(item)}
                disabled={isMatched || showFeedback}
                className={`card p-4 w-full transition-all ${
                  isMatched
                    ? 'bg-green-50 border-2 border-green-500 opacity-75'
                    : isSelected
                    ? 'bg-blue-100 border-2 border-blue-500 shadow-lg scale-105'
                    : 'hover:shadow-lg hover:scale-105 border-2 border-transparent'
                }`}
              >
                <span className="text-lg font-bold text-gray-800">
                  {item.kyrgyz}
                </span>
                {isMatched && <span className="ml-2">✅</span>}
              </button>
            )
          })}
        </div>

        {/* Right Column - English/Sound */}
        <div className="space-y-3">
          {rightOptions.map((item, index) => {
            const isMatched = matched.find((m) => {
              const matchedItem = question.options.find((opt) => opt.kyrgyz === m)
              return (matchedItem?.english || matchedItem?.sound) === item
            })
            const isSelected = selected.right === item

            return (
              <button
                key={index}
                onClick={() => handleRightClick(item)}
                disabled={isMatched || showFeedback}
                className={`card p-4 w-full transition-all ${
                  isMatched
                    ? 'bg-green-50 border-2 border-green-500 opacity-75'
                    : isSelected
                    ? 'bg-blue-100 border-2 border-blue-500 shadow-lg scale-105'
                    : 'hover:shadow-lg hover:scale-105 border-2 border-transparent'
                }`}
              >
                <span className="text-lg font-semibold text-gray-800">
                  {item}
                </span>
                {isMatched && <span className="ml-2">✅</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Progress */}
      <div className="text-center text-sm text-gray-600">
        Matched: {matched.length} / {question.options.length}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className="card text-center p-4 bg-green-50 border-2 border-green-200">
          <p className="text-lg font-semibold text-green-700 mb-2">
            🎉 Мыкты! (Excellent!)
          </p>
          {question.explanation && (
            <p className="text-sm text-gray-700">{question.explanation}</p>
          )}
        </div>
      )}
    </div>
  )
}
