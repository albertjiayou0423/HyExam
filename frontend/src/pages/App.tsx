import { Link } from 'react-router-dom'

export default function App() {
  return (
    <div style={{fontFamily:'Inter,ui-sans-serif',padding:24}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h1 style={{fontSize:24,letterSpacing:0.5}}>HyExam</h1>
        <nav style={{display:'flex',gap:16}}>
          <Link to="/teacher">教师端</Link>
          <Link to="/student">学生端</Link>
          <Link to="/login">登录</Link>
        </nav>
      </header>
      <section style={{maxWidth:860,lineHeight:1.6}}>
        <h2 style={{fontSize:18,marginBottom:12}}>现代、专业、可扩展的考试系统</h2>
        <p>支持班级与考试码两种组织方式；老师可发布考试，学生凭码作答；支持导出考试码，便于线下组织。</p>
      </section>
    </div>
  )
}
