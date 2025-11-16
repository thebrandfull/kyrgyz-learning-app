export default function ProgressBar({ current, total, showPercentage = true }) {
  const percentage = Math.round((current / total) * 100)

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {current} / {total}
        </span>
        {showPercentage && (
          <span className="text-sm font-bold text-blue-600">{percentage}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
