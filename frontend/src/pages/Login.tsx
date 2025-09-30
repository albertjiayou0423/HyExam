import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setToken } from '../lib/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const res = await api.login(email, password)
      setToken(res.access_token)
      navigate('/teacher')
    } catch (err: any) {
      setError(err.message || '登录失败')
    }
  }

  return (
    <div style={{maxWidth:360, margin:'48px auto', fontFamily:'Inter,ui-sans-serif'}}>
      <h2 style={{fontSize:20, marginBottom:16}}>登录 HyExam</h2>
      <form onSubmit={onSubmit} style={{display:'grid', gap:12}}>
        <input placeholder="邮箱" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="密码" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div style={{color:'#b91c1c'}}>{error}</div>}
        <button type="submit">登录</button>
      </form>
    </div>
  )
}
