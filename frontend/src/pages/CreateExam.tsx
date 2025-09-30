import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Save, Eye } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import { api } from '../services/api'
import toast from 'react-hot-toast'

interface QuestionForm {
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_blank'
  content: string
  options: string[]
  correct_answer: string
  points: number
  explanation: string
}

interface ExamForm {
  title: string
  description: string
  instructions: string
  time_limit: number
  is_public: boolean
  allow_review: boolean
  shuffle_questions: boolean
  shuffle_options: boolean
  questions: QuestionForm[]
}

export default function CreateExam() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ExamForm>({
    defaultValues: {
      title: '',
      description: '',
      instructions: '',
      time_limit: 60,
      is_public: false,
      allow_review: true,
      shuffle_questions: false,
      shuffle_options: false,
      questions: [{
        type: 'single_choice',
        content: '',
        options: ['', ''],
        correct_answer: '',
        points: 1,
        explanation: ''
      }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  })

  const onSubmit = async (data: ExamForm) => {
    setLoading(true)
    try {
      await api.post('/exams', data)
      toast.success('试卷创建成功！')
      navigate('/exams')
    } catch (error: any) {
      toast.error(error.response?.data?.message || '创建失败')
    } finally {
      setLoading(false)
    }
  }

  const addQuestion = () => {
    append({
      type: 'single_choice',
      content: '',
      options: ['', ''],
      correct_answer: '',
      points: 1,
      explanation: ''
    })
  }

  const removeQuestion = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  if (previewMode) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">预览试卷</h1>
          <button
            onClick={() => setPreviewMode(false)}
            className="btn-secondary"
          >
            返回编辑
          </button>
        </div>
        
        <div className="card">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">试卷标题</h2>
              <p className="text-gray-600">试卷描述</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">考试说明</h3>
              <p className="text-gray-700">请仔细阅读以下说明...</p>
            </div>
            
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-500">
                      第 {index + 1} 题
                    </span>
                    <span className="text-sm text-gray-500">
                      {watch(`questions.${index}.points`)} 分
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="font-medium">题目内容</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">选项：</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>选项 A</li>
                      <li>选项 B</li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">创建试卷</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setPreviewMode(true)}
            className="btn-secondary flex items-center"
          >
            <Eye className="h-4 w-4 mr-2" />
            预览
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>
          </div>
          
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">试卷标题 *</label>
              <input
                {...register("title", { required: "请输入试卷标题" })}
                className="input-field"
                placeholder="请输入试卷标题"
              />
              {errors.title && (
                <p className="form-error">{errors.title.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">试卷描述</label>
              <textarea
                {...register("description")}
                className="input-field"
                rows={3}
                placeholder="请输入试卷描述"
              />
            </div>

            <div className="form-group">
              <label className="form-label">考试说明</label>
              <textarea
                {...register("instructions")}
                className="input-field"
                rows={4}
                placeholder="请输入考试说明和注意事项"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">考试时长（分钟）</label>
                <input
                  {...register("time_limit", { valueAsNumber: true })}
                  type="number"
                  className="input-field"
                  min="1"
                  placeholder="60"
                />
              </div>

              <div className="form-group">
                <label className="form-label">每题分值</label>
                <input
                  type="number"
                  className="input-field"
                  min="1"
                  placeholder="1"
                  defaultValue="1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">试卷设置</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                {...register("is_public")}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                公开试卷（分享到社区）
              </label>
            </div>

            <div className="flex items-center">
              <input
                {...register("allow_review")}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                允许查看答案和解析
              </label>
            </div>

            <div className="flex items-center">
              <input
                {...register("shuffle_questions")}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                随机排列题目顺序
              </label>
            </div>

            <div className="flex items-center">
              <input
                {...register("shuffle_options")}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                随机排列选项顺序
              </label>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">题目设置</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              添加题目
            </button>
          </div>

          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    第 {index + 1} 题
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-error-600 hover:text-error-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="form-group">
                    <label className="form-label">题型</label>
                    <select
                      {...register(`questions.${index}.type`)}
                      className="input-field"
                    >
                      <option value="single_choice">单选题</option>
                      <option value="multiple_choice">多选题</option>
                      <option value="true_false">判断题</option>
                      <option value="fill_blank">填空题</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">分值</label>
                    <input
                      {...register(`questions.${index}.points`, { valueAsNumber: true })}
                      type="number"
                      className="input-field"
                      min="1"
                      defaultValue="1"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">正确答案</label>
                    <input
                      {...register(`questions.${index}.correct_answer`)}
                      className="input-field"
                      placeholder="A"
                    />
                  </div>
                </div>

                <div className="form-group mb-4">
                  <label className="form-label">题目内容</label>
                  <textarea
                    {...register(`questions.${index}.content`)}
                    className="input-field"
                    rows={3}
                    placeholder="请输入题目内容"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">选项（每行一个）</label>
                  <textarea
                    className="input-field"
                    rows={4}
                    placeholder="A. 选项一&#10;B. 选项二&#10;C. 选项三&#10;D. 选项四"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">解析</label>
                  <textarea
                    {...register(`questions.${index}.explanation`)}
                    className="input-field"
                    rows={2}
                    placeholder="请输入题目解析（可选）"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/exams')}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center"
          >
            {loading ? (
              <>
                <div className="loading-spinner mr-2"></div>
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                保存试卷
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}