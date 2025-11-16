import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUserProgress } from '../contexts/UserProgressContext'
import { signOut } from '../services/auth'

export default function UserMenu() {
  const { user, profile } = useAuth()
  const { stats } = useUserProgress()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
    window.location.href = '/'
  }

  if (!user) return null

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
          {profile?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
        </div>

        {/* Stats (desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {stats && (
            <>
              <div className="flex items-center space-x-1 text-white text-sm">
                <span className="text-yellow-300">⭐</span>
                <span className="font-semibold">{stats.total_points}</span>
              </div>
              <div className="flex items-center space-x-1 text-white text-sm">
                <span>🔥</span>
                <span className="font-semibold">{stats.current_streak}</span>
              </div>
            </>
          )}
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-white transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-800">
              {profile?.display_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          {/* Stats (mobile) */}
          {stats && (
            <div className="md:hidden px-4 py-3 border-b border-gray-200 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Points</span>
                <span className="font-semibold text-gray-800">
                  ⭐ {stats.total_points}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Level</span>
                <span className="font-semibold text-gray-800">
                  {stats.current_level}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Streak</span>
                <span className="font-semibold text-gray-800">
                  🔥 {stats.current_streak} days
                </span>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              📊 View Profile
            </Link>
            <Link
              to="/courses"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              📚 My Courses
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-200 pt-2">
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
