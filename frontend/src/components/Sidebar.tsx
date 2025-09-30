import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Users, 
  BarChart3,
  BookOpen,
  Settings
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navigation = [
  { name: '仪表板', href: '/', icon: LayoutDashboard },
  { name: '我的试卷', href: '/exams', icon: FileText },
  { name: '创建试卷', href: '/exams/create', icon: PlusCircle },
]

const adminNavigation = [
  { name: '用户管理', href: '/admin/users', icon: Users },
  { name: '系统设置', href: '/admin/settings', icon: Settings },
]

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-8 px-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `${
                  isActive
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-3 py-2 text-sm font-medium border-l-4 transition-colors duration-200`
              }
            >
              <item.icon
                className={`${
                  location.pathname === item.href
                    ? 'text-primary-500'
                    : 'text-gray-400 group-hover:text-gray-500'
                } mr-3 h-5 w-5`}
              />
              {item.name}
            </NavLink>
          ))}
        </div>

        {user?.role === 'admin' && (
          <>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                管理员功能
              </h3>
              <div className="mt-2 space-y-1">
                {adminNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `${
                        isActive
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-3 py-2 text-sm font-medium border-l-4 transition-colors duration-200`
                    }
                  >
                    <item.icon
                      className={`${
                        location.pathname === item.href
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5`}
                    />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="px-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <BookOpen className="h-6 w-6 text-primary-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">社区试卷</p>
                <p className="text-xs text-gray-500">发现共享的试卷</p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}