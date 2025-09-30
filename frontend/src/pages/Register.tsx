import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, BookOpen } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'community' as 'teacher' | 'community'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('密码确认不匹配')
      return
    }
    
    setLoading(true)
    
    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role
      })
      navigate('/')
    } catch (error) {
      // Error is handled in the context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Register form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <h2 className="text-3xl font-bold text-gray-900">
                Hy<span className="text-primary-600">Exam</span>
              </h2>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              创建您的账户
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="role" className="form-label">
                  账户类型
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="community">社区用户（免费体验公开内容）</option>
                  <option value="teacher">教师（需要管理员审核）</option>
                </select>
              </div>

              <div>
                <label htmlFor="fullName" className="form-label">
                  姓名
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="请输入真实姓名"
                />
              </div>

              <div>
                <label htmlFor="username" className="form-label">
                  用户名
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="请输入用户名"
                />
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  邮箱地址
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="请输入邮箱地址"
                />
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  密码
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pr-10"
                    placeholder="请输入密码"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  确认密码
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pr-10"
                    placeholder="请再次输入密码"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex justify-center items-center"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner mr-2"></div>
                      注册中...
                    </>
                  ) : (
                    '注册账户'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">已有账户？</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  立即登录
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Benefits */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white px-12">
              <h1 className="text-4xl font-bold mb-6">
                加入 HyExam 社区
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                体验专业的在线考试系统
              </p>
              
              <div className="text-left space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">社区用户</h3>
                  <ul className="space-y-2 text-primary-100">
                    <li>• 访问公开试卷库</li>
                    <li>• 分享您的试卷到社区</li>
                    <li>• 参与社区讨论</li>
                    <li>• 完全免费</li>
                  </ul>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">教师用户</h3>
                  <ul className="space-y-2 text-primary-100">
                    <li>• 创建私有试卷和班级</li>
                    <li>• 管理学生和考试</li>
                    <li>• 详细的成绩分析</li>
                    <li>• 需要管理员审核</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}