import { useState, useEffect } from 'react'
import { Users, UserPlus, Settings, BarChart3, Shield } from 'lucide-react'
import { api } from '../services/api'
import { User } from '../types'
import toast from 'react-hot-toast'

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateUser, setShowCreateUser] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data.data || [])
    } catch (error) {
      toast.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (userData: any) => {
    try {
      await api.post('/admin/users', userData)
      toast.success('用户创建成功')
      setShowCreateUser(false)
      fetchUsers()
    } catch (error) {
      toast.error('创建用户失败')
    }
  }

  const updateUser = async (userId: string, userData: any) => {
    try {
      await api.put(`/admin/users/${userId}`, userData)
      toast.success('用户更新成功')
      fetchUsers()
    } catch (error) {
      toast.error('更新用户失败')
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('确定要删除这个用户吗？')) return
    
    try {
      await api.delete(`/admin/users/${userId}`)
      toast.success('用户删除成功')
      fetchUsers()
    } catch (error) {
      toast.error('删除用户失败')
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">管理员面板</h1>
          <p className="text-gray-600">管理系统用户和平台设置</p>
        </div>
        <button
          onClick={() => setShowCreateUser(true)}
          className="btn-primary flex items-center"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          创建用户
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
              <p className="text-sm font-medium text-gray-600">总用户数</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">教师用户</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'teacher').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">学生用户</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'student').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">社区用户</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'community').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">用户管理</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  角色
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注册时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.fullName || user.username}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'student' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? '管理员' :
                       user.role === 'teacher' ? '教师' :
                       user.role === 'student' ? '学生' : '社区用户'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'
                    }`}>
                      {user.is_active ? '活跃' : '禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => updateUser(user.id, { is_active: !user.is_active })}
                      className="text-warning-600 hover:text-warning-900"
                    >
                      {user.is_active ? '禁用' : '启用'}
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-error-600 hover:text-error-900"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <CreateUserModal
          onClose={() => setShowCreateUser(false)}
          onSubmit={createUser}
        />
      )}
    </div>
  )
}

interface CreateUserModalProps {
  onClose: () => void
  onSubmit: (data: any) => void
}

function CreateUserModal({ onClose, onSubmit }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
    password: '',
    role: 'student'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">创建用户</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">邮箱 *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="form-label">用户名 *</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="form-label">姓名</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="form-label">密码 *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="form-label">角色 *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-field"
            >
              <option value="student">学生</option>
              <option value="teacher">教师</option>
              <option value="community">社区用户</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              取消
            </button>
            <button type="submit" className="btn-primary">
              创建用户
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}