import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '../services/api'
import { Exam, Question } from '../types'
import toast from 'react-hot-toast'

export default function TakeExam() {
  const { examCode } = useParams<{ examCode: string }>()
  const navigate = useNavigate()
  const [exam, setExam] = useState<Exam | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (examCode) {
      fetchExamByCode()
    }
  }, [examCode])

  useEffect(() => {
    if (exam && exam.time_limit) {
      setTimeLeft(exam.time_limit * 60) // Convert to seconds
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [exam])

  const fetchExamByCode = async () => {
    try {
      // This would need to be implemented in the backend
      // For now, we'll mock the data
      const mockExam: Exam = {
        id: '1',
        title: '示例考试',
        description: '这是一个示例考试',
        questions: [
          {
            id: '1',
            type: 'single_choice',
            content: '以下哪个是 JavaScript 的数据类型？',
            options: ['String', 'Array', 'Object', '以上都是'],
            correct_answer: '以上都是',
            points: 5,
            order: 0
          },
          {
            id: '2',
            type: 'multiple_choice',
            content: '以下哪些是前端框架？',
            options: ['React', 'Vue', 'Angular', 'jQuery'],
            correct_answer: ['React', 'Vue', 'Angular'],
            points: 10,
            order: 1
          },
          {
            id: '3',
            type: 'true_false',
            content: 'CSS 是用于样式设计的语言。',
            options: ['正确', '错误'],
            correct_answer: '正确',
            points: 5,
            order: 2
          },
          {
            id: '4',
            type: 'fill_blank',
            content: 'HTML 的全称是 _____。',
            options: [],
            correct_answer: 'HyperText Markup Language',
            points: 5,
            order: 3
          }
        ],
        time_limit: 30,
        is_public: false,
        allow_review: true,
        shuffle_questions: false,
        shuffle_options: false,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'teacher-1'
      }
      
      setExam(mockExam)
    } catch (error) {
      toast.error('获取考试信息失败')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestion < (exam?.questions.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // Submit answers
      await api.post('/exam-attempts', {
        exam_session_id: examCode,
        answers: answers
      })
      
      toast.success('考试提交成功！')
      navigate(`/exam-result/${examCode}`)
    } catch (error) {
      toast.error('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">考试不存在</h2>
          <p className="text-gray-600 mb-6">请检查考试码是否正确</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            返回首页
          </button>
        </div>
      </div>
    )
  }

  const question = exam.questions[currentQuestion]
  const isLastQuestion = currentQuestion === exam.questions.length - 1
  const isFirstQuestion = currentQuestion === 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
              <p className="text-sm text-gray-600">考试码: {examCode}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-warning-600" />
                <span className={`text-lg font-mono ${
                  timeLeft < 300 ? 'text-error-600' : 'text-gray-900'
                }`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                第 {currentQuestion + 1} 题 / 共 {exam.questions.length} 题
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">题目导航</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {exam.questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium ${
                      index === currentQuestion
                        ? 'bg-primary-600 text-white'
                        : answers[q.id]
                        ? 'bg-success-100 text-success-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <CheckCircle className="h-4 w-4 mr-2 text-success-600" />
                  已答题: {Object.keys(answers).length}
                </div>
                <div className="text-sm text-gray-600">
                  剩余: {exam.questions.length - Object.keys(answers).length}
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="card">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    第 {currentQuestion + 1} 题
                  </h2>
                  <span className="text-sm text-gray-600">{question.points} 分</span>
                </div>
                
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    question.type === 'single_choice' ? 'bg-blue-100 text-blue-800' :
                    question.type === 'multiple_choice' ? 'bg-green-100 text-green-800' :
                    question.type === 'true_false' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {question.type === 'single_choice' ? '单选题' :
                     question.type === 'multiple_choice' ? '多选题' :
                     question.type === 'true_false' ? '判断题' : '填空题'}
                  </span>
                </div>
                
                <p className="text-gray-900 text-lg leading-relaxed">{question.content}</p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {question.type === 'single_choice' && (
                  <div className="space-y-3">
                    {question.options?.map((option, index) => (
                      <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="ml-3 text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'multiple_choice' && (
                  <div className="space-y-3">
                    {question.options?.map((option, index) => (
                      <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          value={option}
                          checked={Array.isArray(answers[question.id]) && answers[question.id].includes(option)}
                          onChange={(e) => {
                            const currentAnswers = Array.isArray(answers[question.id]) ? answers[question.id] : []
                            if (e.target.checked) {
                              handleAnswerChange(question.id, [...currentAnswers, option])
                            } else {
                              handleAnswerChange(question.id, currentAnswers.filter((a: string) => a !== option))
                            }
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'true_false' && (
                  <div className="space-y-3">
                    {question.options?.map((option, index) => (
                      <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="ml-3 text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'fill_blank' && (
                  <div>
                    <input
                      type="text"
                      value={answers[question.id] as string || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="input-field"
                      placeholder="请输入答案"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrevious}
                disabled={isFirstQuestion}
                className={`btn-secondary ${isFirstQuestion ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                上一题
              </button>

              <div className="flex items-center space-x-3">
                {isLastQuestion ? (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary flex items-center"
                  >
                    {submitting ? (
                      <>
                        <div className="loading-spinner mr-2"></div>
                        提交中...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        提交试卷
                      </>
                    )}
                  </button>
                ) : (
                  <button onClick={handleNext} className="btn-primary">
                    下一题
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}