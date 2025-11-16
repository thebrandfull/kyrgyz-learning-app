import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import AuthModal from './AuthModal'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-20">
        <div className="card text-center space-y-6">
          <div>
            <svg
              className="w-20 h-20 mx-auto text-blue-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access the learning courses and track your progress.
            </p>
          </div>

          <button
            onClick={() => setShowAuthModal(true)}
            className="btn-primary px-8 py-3"
          >
            Sign In / Create Account
          </button>

          <p className="text-sm text-gray-500">
            You can still use the translation tool without an account
          </p>
        </div>

        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => setShowAuthModal(false)}
          />
        )}
      </div>
    )
  }

  return children
}
