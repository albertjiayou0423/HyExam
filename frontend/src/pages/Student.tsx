import { useEffect, useState } from 'react'
import { api } from '../lib/api'

type Question = {
  id: number
  type: 'single_choice'|'multiple_choice'|'true_false'|'fill_in_blank'
  content: string
  order_index: number
  score: number
  options?: { id:number; text:string }[]
}

export default function Student(){
  const [examId, setExamId] = useState<number | ''>('')
  const [code, setCode] = useState('')
  const [exam, setExam] = useState<{title:string; questions: Question[]} | null>(null)
  const [submissionId, setSubmissionId] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<number, any>>({})

  async function fetchExam(){
    if(!examId) return
    const data = await api.getPublishedExam(Number(examId))
    setExam(data)
  }

  async function join(){
    if(!examId || !code) return
    const res = await api.joinExam(Number(examId), code)
    setSubmissionId(res.submission_id)
  }

  async function submit(){
    if(!examId || !submissionId || !exam) return
    const payload = exam.questions.map(q => {
      const a = answers[q.id]
      if(q.type === 'fill_in_blank'){
        return { question_id: q.id, text_answer: a || '' }
      }
      if(Array.isArray(a)){
        return { question_id: q.id, selected_option_ids: a }
      }
      return { question_id: q.id, selected_option_ids: a ? [a] : [] }
    })
    const res = await api.submit(Number(examId), submissionId, payload)
    alert(`得分：${res.total_score}`)
  }

  function onAnswer(q: Question, value: any){
    setAnswers(prev => ({...prev, [q.id]: value}))
  }

  return (
    <div style={{padding:24,fontFamily:'Inter,ui-sans-serif',display:'grid',gap:16}}>
      <h2 style={{fontSize:20}}>学生端 · 凭考试码参加考试</h2>
      <div style={{display:'flex',gap:8}}>
        <input placeholder='考试ID' value={examId} onChange={e=>setExamId(e.target.value as any)} />
        <button onClick={fetchExam}>获取试卷</button>
      </div>
      <div style={{display:'flex',gap:8}}>
        <input placeholder='考试码' value={code} onChange={e=>setCode(e.target.value)} />
        <button onClick={join}>使用考试码加入</button>
      </div>
      {exam && (
        <div style={{display:'grid',gap:16}}>
          <h3>{exam.title}</h3>
          {exam.questions.map(q => (
            <div key={q.id} style={{padding:12,border:'1px solid #e5e7eb',borderRadius:8}}>
              <div style={{marginBottom:8}}>{q.order_index+1}. {q.content}（{q.score}分）</div>
              {q.type === 'fill_in_blank' ? (
                <input style={{width:'100%'}} value={answers[q.id]||''} onChange={e=>onAnswer(q, e.target.value)} />
              ) : (
                <div style={{display:'grid',gap:6}}>
                  {q.options?.map(o => {
                    const isMulti = q.type === 'multiple_choice'
                    const checked = isMulti ? (answers[q.id]||[]).includes(o.id) : (answers[q.id]||null)===o.id
                    return (
                      <label key={o.id} style={{display:'flex',alignItems:'center',gap:8}}>
                        <input
                          type={q.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                          name={`q_${q.id}`}
                          checked={!!checked}
                          onChange={(e)=>{
                            if(isMulti){
                              const arr = new Set(answers[q.id]||[])
                              if(e.target.checked) arr.add(o.id); else arr.delete(o.id)
                              onAnswer(q, Array.from(arr))
                            }else{
                              onAnswer(q, o.id)
                            }
                          }}
                        />
                        {o.text}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
          <button onClick={submit} disabled={!submissionId}>提交答案</button>
        </div>
      )}
    </div>
  )
}
