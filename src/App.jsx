import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DailyCheckIn from './pages/DailyCheckIn'
import WeeklyReview from './pages/WeeklyReview'
import Supplements from './pages/Supplements'
import TrainingLog from './pages/TrainingLog'
import Progress from './pages/Progress'
import LabWork from './pages/LabWork'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
      <div className="text-[#6b7280]">Loading…</div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/checkin" element={<ProtectedRoute><DailyCheckIn /></ProtectedRoute>} />
      <Route path="/weekly" element={<ProtectedRoute><WeeklyReview /></ProtectedRoute>} />
      <Route path="/supplements" element={<ProtectedRoute><Supplements /></ProtectedRoute>} />
      <Route path="/training" element={<ProtectedRoute><TrainingLog /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
      <Route path="/labs" element={<ProtectedRoute><LabWork /></ProtectedRoute>} />
    </Routes>
  )
}
