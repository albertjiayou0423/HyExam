import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { api } from '../services/api'
import { Exam } from '../types'
import toast from 'react-hot-toast'

export default function ExamList() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await api.get('/exams')
      setExams(response.data.data || [])
    } catch (error) {
      toast.error('获取试卷列表失败')
    } finally {
      setLoading(false)
    }
  }

  const deleteExam = async (examId: string) => {
    if (!confirm('确定要删除这个试卷吗？')) return
    
    try {
      await api.delete(`/exams/${examId}`)
      toast.success('试卷删除成功')
      fetchExams()
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的试卷</h1>
          <p className="text-gray-600">管理和查看您创建的所有试卷</p>
        </div>
        <Link to="/exams/create" className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          创建试卷
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索试卷..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-auto"
            >
              <option value="all">所有状态</option>
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="archived">已归档</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exam List */}
      {filteredExams.length > 0 ? (
        <div className="grid gap-4">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      exam.status === 'published' ? 'bg-success-100 text-success-800' :
                      exam.status === 'draft' ? 'bg-warning-100 text-warning-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {exam.status === 'published' ? '已发布' :
                       exam.status === 'draft' ? '草稿' : '已归档'}
                    </span>
                    {exam.is_public && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        公开
                      </span>
                    )}
                  </div>
                  
                  {exam.description && (
                    <p className="text-gray-600 mb-2">{exam.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{exam.questions.length} 道题</span>
                    {exam.time_limit && <span>限时 {exam.time_limit} 分钟</span>}
                    <span>创建于 {new Date(exam.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/exams/${exam.id}`}
                    className="btn-secondary flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    查看
                  </Link>
                  
                  <Menu as="div" className="relative">
                    <Menu.Button className="p-2 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </Menu.Button>
                    
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                            >
                              <Edit className="h-4 w-4 mr-3" />
                              编辑试卷
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => deleteExam(exam.id)}
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } flex items-center w-full px-4 py-2 text-sm text-red-700`}
                            >
                              <Trash2 className="h-4 w-4 mr-3" />
                              删除试卷
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有试卷</h3>
          <p className="text-gray-600 mb-6">创建您的第一个试卷，开始使用 HyExam</p>
          <Link to="/exams/create" className="btn-primary">
            创建试卷
          </Link>
        </div>
      )}
    </div>
  )
}