import { useState, useEffect } from 'react'

export default function PointsAnimation({ points, onComplete }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onComplete?.()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!visible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="animate-bounce-up">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full shadow-2xl text-3xl font-bold">
          +{points} ⭐
        </div>
      </div>
    </div>
  )
}
