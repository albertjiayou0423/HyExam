import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  FileText, 
  PlusCircle, 
  Users, 
  BarChart3,
  Clock,
  CheckCircle,
  BookOpen,
  TrendingUp
} from 'lucide-react'
import { api } from '../services/api'
import { Exam, ExamSession } from '../types'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalExams: 0,
    activeSessions: 0,
    totalStudents: 0,
    completedAttempts: 0
  })
  const [recentExams, setRecentExams] = useState<Exam[]>([])
  const [activeSessions, setActiveSessions] = useState<ExamSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [examsRes, sessionsRes] = await Promise.all([
        api.get('/exams?limit=5'),
        api.get('/exam-sessions?active=true')
      ])
      
      setRecentExams(examsRes.data.data || [])
      setActiveSessions(sessionsRes.data.data || [])
      
      // Mock stats for now
      setStats({
        totalExams: 12,
        activeSessions: 3,
        totalStudents: 156,
        completedAttempts: 89
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          欢迎回来，{user?.fullName || user?.username}！
        </h1>
        <p className="text-primary-100">
          {user?.role === 'teacher' && '管理您的试卷和学生，创建高效的在线考试'}
          {user?.role === 'student' && '查看您的考试安排和成绩'}
          {user?.role === 'admin' && '管理系统用户和平台设置'}
          {user?.role === 'community' && '探索社区试卷，分享您的创作'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">总试卷数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">进行中的考试</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">学生总数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">已完成考试</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedAttempts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Exams */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">最近的试卷</h3>
            <p className="text-sm text-gray-600">您最近创建或参加的试卷</p>
          </div>
          
          <div className="space-y-4">
            {recentExams.length > 0 ? (
              recentExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{exam.title}</p>
                      <p className="text-sm text-gray-600">
                        {exam.questions.length} 道题 • {exam.status === 'published' ? '已发布' : '草稿'}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/exams/${exam.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    查看
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">还没有试卷</p>
                <Link to="/exams/create" className="btn-primary">
                  创建第一个试卷
                </Link>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link to="/exams" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              查看所有试卷 →
            </Link>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">进行中的考试</h3>
            <p className="text-sm text-gray-600">当前活跃的考试会话</p>
          </div>
          
          <div className="space-y-4">
            {activeSessions.length > 0 ? (
              activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-warning-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-warning-500 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">考试码: {session.examCode}</p>
                      <p className="text-sm text-gray-600">
                        开始时间: {new Date(session.startTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                    进行中
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">当前没有进行中的考试</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/exams/create"
          className="card hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <PlusCircle className="h-8 w-8 text-primary-600 group-hover:text-primary-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">创建试卷</h3>
              <p className="text-sm text-gray-600">创建新的考试试卷</p>
            </div>
          </div>
        </Link>

        <Link
          to="/exams"
          className="card hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-success-600 group-hover:text-success-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">我的试卷</h3>
              <p className="text-sm text-gray-600">管理您的试卷库</p>
            </div>
          </div>
        </Link>

        <Link
          to="/community"
          className="card hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-warning-600 group-hover:text-warning-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">社区试卷</h3>
              <p className="text-sm text-gray-600">发现共享的试卷</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}