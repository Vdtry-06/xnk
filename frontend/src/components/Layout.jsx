import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NAV_BY_ROLE = {
  ADMIN: [
    { to: '/admin/orders', label: 'Đơn hàng' },
    { to: '/admin/agents', label: 'Quản lý đại lý' },
  ],
  AGENT: [
    { to: '/orders', label: 'Đơn hàng' },
  ],
  WAREHOUSE_STAFF: [
    { to: '/delivery', label: 'Phiếu xuất hàng' },
  ],
}

const ROLE_LABEL = {
  ADMIN:          'Quản trị viên',
  AGENT:          'Đại lý',
  WAREHOUSE_STAFF:'Nhân viên kho',
}

export function Layout({ children, title }) {
  const { user, logout } = useAuth()
  const nav = NAV_BY_ROLE[user?.role] || []

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          XNK Manager
          <span>Hệ thống quản lý</span>
        </div>
        <nav className="sidebar-nav">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        {user && (
          <div style={{ marginTop:'auto', padding:'14px 12px', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginBottom:4 }}>
              {ROLE_LABEL[user.role] || user.role}
            </div>
            <div style={{ color:'#fff', fontWeight:600, fontSize:13, marginBottom:10 }}>
              {user.name || user.username}
            </div>
            <button onClick={logout} style={{
              width:'100%', padding:'7px', borderRadius:6,
              border:'1px solid rgba(255,255,255,0.2)', background:'transparent',
              color:'rgba(255,255,255,0.65)', fontSize:12, cursor:'pointer',
            }}
              onMouseEnter={e => { e.target.style.background='rgba(220,38,38,0.2)'; e.target.style.color='#fca5a5' }}
              onMouseLeave={e => { e.target.style.background='transparent'; e.target.style.color='rgba(255,255,255,0.65)' }}>
              Đăng xuất
            </button>
          </div>
        )}
      </aside>
      <main className="main">
        <div className="topbar">
          <span className="topbar-title">{title}</span>
        </div>
        <div className="page">{children}</div>
      </main>
    </div>
  )
}
