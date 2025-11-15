import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import History from './pages/History'
import Vocabulary from './pages/Vocabulary'

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="min-h-screen">
        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">Kyrgyz Learn</h1>
              </div>
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/history"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  History
                </Link>
                <Link
                  to="/vocabulary"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Vocabulary
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
