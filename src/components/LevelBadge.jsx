export default function LevelBadge({ level, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  }

  return (
    <div className="inline-flex flex-col items-center">
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg border-4 border-yellow-300`}
      >
        <span className="font-bold text-white">{level}</span>
      </div>
      <span className="text-xs font-semibold text-gray-600 mt-1">Level</span>
    </div>
  )
}
