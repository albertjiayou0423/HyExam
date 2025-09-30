import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateExam from './pages/CreateExam'
import ExamList from './pages/ExamList'
import ExamDetail from './pages/ExamDetail'
import TakeExam from './pages/TakeExam'
import ExamResults from './pages/ExamResults'
import AdminPanel from './pages/AdminPanel'
import NotFound from './pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/exam/:examCode" element={<TakeExam />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="exams" element={<ExamList />} />
          <Route path="exams/create" element={<CreateExam />} />
          <Route path="exams/:id" element={<ExamDetail />} />
          <Route path="exams/:id/results" element={<ExamResults />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

export default App