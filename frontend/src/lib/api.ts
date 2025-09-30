const API_BASE = '/api'

export function setToken(token: string | null) {
  if (token) localStorage.setItem('hyexam_token', token)
  else localStorage.removeItem('hyexam_token')
}

export function getToken(): string | null {
  return localStorage.getItem('hyexam_token')
}

async function request(path: string, opts: RequestInit = {}) {
  const headers = new Headers(opts.headers)
  headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers })
  if (!res.ok) throw new Error(await res.text())
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

export const api = {
  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: email, password })
    }),
  me: () => request('/auth/me'),
  createExam: (payload: any) => request('/exams/', { method: 'POST', body: JSON.stringify(payload) }),
  publishExam: (examId: number) => request(`/exams/${examId}/publish`, { method: 'POST' }),
  generateCodes: (examId: number, count = 30, length = 8) =>
    request(`/exams/${examId}/codes/generate`, { method: 'POST', body: JSON.stringify({ count, length }) }),
  exportCodesCsvUrl: (examId: number) => `${API_BASE}/exams/${examId}/codes/export.csv`,
  getPublishedExam: (examId: number) => request(`/exams/${examId}/public`),
  joinExam: (examId: number, code: string) => request(`/exams/${examId}/join/${code}`, { method: 'POST' }),
  submit: (examId: number, submissionId: number, answers: any) =>
    request(`/exams/${examId}/submissions/${submissionId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) })
}
