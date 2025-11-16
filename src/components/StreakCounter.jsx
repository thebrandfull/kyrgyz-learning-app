export default function StreakCounter({ streak, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }

  return (
    <div className="inline-flex flex-col items-center">
      <div className="relative">
        <span className={sizeClasses[size]} role="img" aria-label="fire">
          🔥
        </span>
        {streak > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
            {streak}
          </div>
        )}
      </div>
      <span className={`${textSizeClasses[size]} font-semibold text-gray-700 mt-1`}>
        {streak === 0 ? 'Start your streak!' : `${streak} day${streak !== 1 ? 's' : ''}`}
      </span>
    </div>
  )
}
