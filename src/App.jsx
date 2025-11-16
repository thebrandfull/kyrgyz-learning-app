import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { UserProgressProvider } from './contexts/UserProgressContext'
import { useState } from 'react'
import Home from './pages/Home'
import History from './pages/History'
import Vocabulary from './pages/Vocabulary'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Lesson from './pages/Lesson'
import Profile from './pages/Profile'
import UserMenu from './components/UserMenu'
import AuthModal from './components/AuthModal'
import { useAuth } from './contexts/AuthContext'

// Navigation component (needs to be inside AuthProvider)
function Navigation() {
  const { signedIn } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <>
      <nav className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Kyrgyz Learn</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Translate
              </Link>
              <Link
                to="/courses"
                className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                📚 Courses
              </Link>
              <Link
                to="/history"
                className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                History
              </Link>
              <Link
                to="/vocabulary"
                className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Vocabulary
              </Link>

              {signedIn ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}
    </>
  )
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <UserProgressProvider>
          <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
            <Navigation />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/history" element={<History />} />
                <Route path="/vocabulary" element={<Vocabulary />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:courseId" element={<CourseDetail />} />
                <Route path="/lessons/:lessonId" element={<Lesson />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
          </div>
        </UserProgressProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
