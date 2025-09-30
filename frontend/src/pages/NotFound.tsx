import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">页面未找到</h2>
          <p className="text-gray-600 mb-8">
            抱歉，您访问的页面不存在或已被移除。
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center btn-primary"
          >
            <Home className="h-4 w-4 mr-2" />
            返回首页
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center btn-secondary ml-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回上一页
          </button>
        </div>
      </div>
    </div>
  )
}