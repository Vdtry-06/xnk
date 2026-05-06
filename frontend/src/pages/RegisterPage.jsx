import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api'
import toast from 'react-hot-toast'

const ERR = { color: '#ef4444', fontSize: 12, marginTop: 3 }

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form,   setForm]   = useState({ username: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const setField = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => { const e = { ...p }; delete e[k]; return e })
  }

  const validate = () => {
    const e = {}
    if (!form.username.trim())                          e.username        = 'Tên đăng nhập không được để trống'
    if (!form.password.trim())                          e.password        = 'Mật khẩu không được để trống'
    if (!form.confirmPassword.trim())                   e.confirmPassword = 'Vui lòng nhập lại mật khẩu'
    else if (form.password !== form.confirmPassword)    e.confirmPassword = 'Mật khẩu không khớp'
    return e
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      await authApi.register({ username: form.username, password: form.password })
      toast.success('Tạo tài khoản admin thành công!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi đăng ký')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 10, width: 360, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: 6, fontSize: 20, fontWeight: 700 }}>Đăng ký Admin</h2>
        <p style={{ marginBottom: 24, fontSize: 13, color: '#64748b' }}>Tạo tài khoản quản trị viên mới</p>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
              Tên đăng nhập <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input className="form-control" value={form.username} placeholder="admin2"
              onChange={e => setField('username', e.target.value)} autoFocus />
            {errors.username && <p style={ERR}>{errors.username}</p>}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
              Mật khẩu <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input type="password" className="form-control" value={form.password} placeholder="••••••"
              onChange={e => setField('password', e.target.value)} />
            {errors.password && <p style={ERR}>{errors.password}</p>}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
              Nhập lại mật khẩu <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input type="password" className="form-control" value={form.confirmPassword} placeholder="••••••"
              onChange={e => setField('confirmPassword', e.target.value)} />
            {errors.confirmPassword && <p style={ERR}>{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
            {saving ? 'Đang tạo...' : 'Đăng ký'}
          </button>
        </form>

        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: 'var(--primary)' }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}