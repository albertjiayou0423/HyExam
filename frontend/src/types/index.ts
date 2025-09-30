export interface User {
  id: string
  email: string
  username: string
  role: 'admin' | 'teacher' | 'student' | 'community'
  fullName?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface Question {
  id: string
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_blank'
  content: string
  options?: string[]
  correctAnswer: string | string[]
  points: number
  explanation?: string
  order: number
}

export interface Exam {
  id: string
  title: string
  description?: string
  instructions?: string
  timeLimit?: number // in minutes
  questions: Question[]
  isPublic: boolean
  allowReview: boolean
  shuffleQuestions: boolean
  shuffleOptions: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  status: 'draft' | 'published' | 'archived'
}

export interface ExamSession {
  id: string
  examId: string
  examCode: string
  startTime: string
  endTime?: string
  isActive: boolean
  maxAttempts?: number
  createdAt: string
  createdBy: string
}

export interface ExamAttempt {
  id: string
  examId: string
  examSessionId: string
  userId: string
  answers: Record<string, string | string[]>
  score?: number
  totalPoints?: number
  startTime: string
  submitTime?: string
  isSubmitted: boolean
}

export interface Class {
  id: string
  name: string
  description?: string
  teacherId: string
  students: string[]
  createdAt: string
  updatedAt: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
}

export interface RegisterData {
  email: string
  username: string
  password: string
  fullName?: string
  role?: 'teacher' | 'community'
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}