import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Play, 
  Users, 
  Clock, 
  Eye, 
  Share2,
  BarChart3,
  Settings
} from 'lucide-react'
import { api } from '../services/api'
import { Exam, ExamSession } from '../types'
import toast from 'react-hot-toast'

export default function ExamDetail() {
  const { id } = useParams<{ id: string }>()
  const [exam, setExam] = useState<Exam | null>(null)
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchExamData()
    }
  }, [id])

  const fetchExamData = async () => {
    try {
      const [examRes, sessionsRes] = await Promise.all([
        api.get(`/exams/${id}`),
        api.get(`/exam-sessions?exam_id=${id}`)
      ])
      
      setExam(examRes.data.data)
      setSessions(sessionsRes.data.data || [])
    } catch (error) {
      toast.error('获取试卷信息失败')
    } finally {
      setLoading(false)
    }
  }

  const createExamSession = async () => {
    try {
      const response = await api.post('/exam-sessions', {
        exam_id: id
      })
      toast.success('考试会话创建成功！')
      fetchExamData()
    } catch (error) {
      toast.error('创建考试会话失败')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">试卷不存在</h2>
        <Link to="/exams" className="btn-primary">
          返回试卷列表
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/exams" className="btn-secondary flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
            <p className="text-gray-600">试卷详情和考试会话管理</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            设置
          </button>
          <button
            onClick={createExamSession}
            className="btn-primary flex items-center"
          >
            <Play className="h-4 w-4 mr-2" />
            开始考试
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exam Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">试卷信息</h2>
            </div>
            
            <div className="space-y-4">
              {exam.description && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">描述</h3>
                  <p className="text-gray-600">{exam.description}</p>
                </div>
              )}
              
              {exam.instructions && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">考试说明</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{exam.instructions}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{exam.questions.length}</div>
                  <div className="text-sm text-gray-600">题目数量</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-warning-600">
                    {exam.time_limit || '∞'}
                  </div>
                  <div className="text-sm text-gray-600">考试时长（分钟）</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-success-600">
                    {exam.questions.reduce((sum, q) => sum + q.points, 0)}
                  </div>
                  <div className="text-sm text-gray-600">总分</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-secondary-600">
                    {sessions.length}
                  </div>
                  <div className="text-sm text-gray-600">考试会话</div>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Preview */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">题目预览</h2>
            </div>
            
            <div className="space-y-4">
              {exam.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      第 {index + 1} 题
                    </span>
                    <span className="text-sm text-gray-500">
                      {question.type === 'single_choice' ? '单选题' :
                       question.type === 'multiple_choice' ? '多选题' :
                       question.type === 'true_false' ? '判断题' : '填空题'} • {question.points} 分
                    </span>
                  </div>
                  
                  <p className="text-gray-900 mb-3">{question.content}</p>
                  
                  {question.options && (
                    <div className="space-y-1">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="text-sm text-gray-600">
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">状态信息</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">状态</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  exam.status === 'published' ? 'bg-success-100 text-success-800' :
                  exam.status === 'draft' ? 'bg-warning-100 text-warning-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {exam.status === 'published' ? '已发布' :
                   exam.status === 'draft' ? '草稿' : '已归档'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">公开状态</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  exam.is_public ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {exam.is_public ? '公开' : '私有'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">创建时间</span>
                <span className="text-sm text-gray-900">
                  {new Date(exam.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">活跃考试会话</h2>
            </div>
            
            <div className="space-y-3">
              {sessions.filter(s => s.is_active).length > 0 ? (
                sessions.filter(s => s.is_active).map((session) => (
                  <div key={session.id} className="p-3 bg-warning-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{session.exam_code}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                        进行中
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      开始时间: {new Date(session.start_time).toLocaleString()}
                    </div>
                    <div className="mt-2">
                      <Link
                        to={`/exam/${session.exam_code}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        参加考试 →
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">当前没有活跃的考试会话</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">快速操作</h2>
            </div>
            
            <div className="space-y-3">
              <Link
                to={`/exams/${exam.id}/results`}
                className="w-full btn-secondary flex items-center justify-center"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                查看结果
              </Link>
              
              <button className="w-full btn-secondary flex items-center justify-center">
                <Share2 className="h-4 w-4 mr-2" />
                分享试卷
              </button>
              
              <button className="w-full btn-secondary flex items-center justify-center">
                <Eye className="h-4 w-4 mr-2" />
                预览试卷
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}