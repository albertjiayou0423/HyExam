import { useEffect, useState } from 'react'
import { api } from '../lib/api'

type QuestionInput = {
  type: 'single_choice'|'multiple_choice'|'true_false'|'fill_in_blank'
  content: string
  score: number
  options?: { text: string; is_correct: boolean }[]
}

export default function Teacher(){
  const [title, setTitle] = useState('示例试卷')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<QuestionInput[]>([{
    type:'single_choice', content:'2+2=?', score:2, options:[{text:'3',is_correct:false},{text:'4',is_correct:true}]
  }])
  const [examId, setExamId] = useState<number| null>(null)
  const [codesCount, setCodesCount] = useState(20)

  async function createExam(){
    const payload = { title, description, questions }
    const exam = await api.createExam(payload)
    setExamId(exam.id)
  }

  async function publish(){
    if(!examId) return
    await api.publishExam(examId)
  }

  async function genCodes(){
    if(!examId) return
    await api.generateCodes(examId, codesCount, 8)
  }

  return (
    <div style={{padding:24,fontFamily:'Inter,ui-sans-serif',display:'grid',gap:16}}>
      <h2 style={{fontSize:20}}>教师端 · 创建与发布考试</h2>
      <div style={{display:'grid', gap:8}}>
        <input placeholder='试卷标题' value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea placeholder='描述' value={description} onChange={e=>setDescription(e.target.value)} />
      </div>
      <div>
        <button onClick={createExam}>创建试卷</button>
        <button onClick={publish} disabled={!examId} style={{marginLeft:8}}>发布</button>
      </div>
      <div>
        <input type='number' value={codesCount} onChange={e=>setCodesCount(parseInt(e.target.value||'0'))} />
        <button onClick={genCodes} disabled={!examId} style={{marginLeft:8}}>生成考试码</button>
        {examId && (
          <a href={api.exportCodesCsvUrl(examId)} style={{marginLeft:8}}>导出考试码CSV</a>
        )}
      </div>
    </div>
  )
}
