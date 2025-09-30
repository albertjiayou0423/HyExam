import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, BarChart3, Users, Clock, CheckCircle } from 'lucide-react'
import { api } from '../services/api'
import { ExamAttempt } from '../types'

export default function ExamResults() {
  const { id } = useParams<{ id: string }>()
  const [attempts, setAttempts] = useState<ExamAttempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchResults()
    }
  }, [id])

  const fetchResults = async () => {
    try {
      const response = await api.get(`/exam-attempts?exam_id=${id}`)
      setAttempts(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch results:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    // Mock CSV export functionality
    const csvContent = [
      ['学生姓名', '学号', '总分', '得分', '提交时间', '状态'],
      ...attempts.map(attempt => [
        '学生' + attempt.user_id.slice(-4),
        attempt.user_id,
        attempt.total_points || 0,
        attempt.score || 0,
        attempt.submit_time ? new Date(attempt.submit_time).toLocaleString() : '未提交',
        attempt.is_submitted ? '已提交' : '未提交'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `exam-results-${id}.csv`
    link.click()
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={`/exams/${id}`} className="btn-secondary flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回试卷
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">考试结果</h1>
            <p className="text-gray-600">查看学生答题情况和成绩统计</p>
          </div>
        </div>
        
        <button
          onClick={exportToCSV}
          className="btn-primary flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          导出CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">参与人数</p>
              <p className="text-2xl font-bold text-gray-900">{attempts.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">已完成</p>
              <p className="text-2xl font-bold text-gray-900">
                {attempts.filter(a => a.is_submitted).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均分</p>
              <p className="text-2xl font-bold text-gray-900">
                {attempts.filter(a => a.score !== null).length > 0
                  ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.filter(a => a.score !== null).length)
                  : 0
                }
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均用时</p>
              <p className="text-2xl font-bold text-gray-900">
                {attempts.filter(a => a.submit_time).length > 0 ? '45' : '0'} 分钟
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">详细结果</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  学生信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  得分
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用时
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  提交时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attempts.map((attempt) => (
                <tr key={attempt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        学生 {attempt.user_id.slice(-4)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {attempt.user_id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {attempt.score || 0} / {attempt.total_points || 0}
                    </div>
                    <div className="text-sm text-gray-500">
                      {attempt.total_points ? Math.round(((attempt.score || 0) / attempt.total_points) * 100) : 0}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {attempt.submit_time 
                      ? Math.round((new Date(attempt.submit_time).getTime() - new Date(attempt.start_time).getTime()) / 60000)
                      : '-'
                    } 分钟
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {attempt.submit_time 
                      ? new Date(attempt.submit_time).toLocaleString()
                      : '未提交'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      attempt.is_submitted 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-warning-100 text-warning-800'
                    }`}>
                      {attempt.is_submitted ? '已提交' : '进行中'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900">
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {attempts.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无考试记录</h3>
            <p className="text-gray-600">还没有学生参加这个考试</p>
          </div>
        )}
      </div>
    </div>
  )
}