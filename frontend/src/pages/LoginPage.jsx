import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../api'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!username || !password) { toast.error('Nhập đầy đủ thông tin'); return }
    setLoading(true)
    try {
      const res = await authApi.login({ username, password })
      login(res.data.data)
      const role = res.data.data.role
      if (role === 'ADMIN')           navigate('/admin/orders')
      else if (role === 'AGENT')      navigate('/orders')
      else if (role === 'WAREHOUSE_STAFF') navigate('/delivery')
      else navigate('/')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Đăng nhập thất bại')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f1f5f9' }}>
      <div style={{ background:'#fff', padding:32, borderRadius:10, width:360, boxShadow:'0 2px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom:24, fontSize:20, fontWeight:700 }}>Đăng nhập</h2>
        <form onSubmit={submit}>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:500, marginBottom:4 }}>Tên đăng nhập</label>
            <input
              className="form-control"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin / agent1 / warehouse1"
              autoFocus
            />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:500, marginBottom:4 }}>Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="123456"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width:'100%' }} disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}
