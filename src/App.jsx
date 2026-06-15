import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ToastContainer from './components/Toast/ToastContainer.jsx'
import SplashPage from './pages/SplashPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import HomePage from './pages/HomePage.jsx'
import MoviesPage from './pages/MoviesPage.jsx'
import SeriesPage from './pages/SeriesPage.jsx'
import LiveTVPage from './pages/LiveTVPage.jsx'
import PlayerPage from './pages/PlayerPage.jsx'
import useAppStore from './store/appStore.js'
import useRemoteNavigation from './hooks/useRemoteNavigation.js'

// Rota protegida
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAppStore(s => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const App = () => {
  useRemoteNavigation()

  return (
    <BrowserRouter>
      <Routes>
        {/* Splash */}
        <Route path="/" element={<SplashPage />} />

        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas protegidas */}
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/filmes" element={<ProtectedRoute><MoviesPage /></ProtectedRoute>} />
        <Route path="/series" element={<ProtectedRoute><SeriesPage /></ProtectedRoute>} />
        <Route path="/ao-vivo" element={<ProtectedRoute><LiveTVPage /></ProtectedRoute>} />
        <Route path="/player" element={<ProtectedRoute><PlayerPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast global */}
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
