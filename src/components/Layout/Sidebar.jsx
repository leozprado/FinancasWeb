import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const menuItems = [
  { path: '/dashboard',     label: 'Dashboard',           icon: 'bi-speedometer2' },
  { path: '/pessoas',       label: 'Pessoas',             icon: 'bi-people-fill' },
  { path: '/tipos-despesa', label: 'Tipos de Despesa',    icon: 'bi-tags-fill' },
  { path: '/salarios',      label: 'Receitas / Salários', icon: 'bi-cash-coin' },
  { path: '/despesas',      label: 'Despesas',            icon: 'bi-credit-card-fill' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const width = collapsed ? '60px' : '250px'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div
      style={{
        width,
        minHeight: '100vh',
        backgroundColor: '#1a1d23',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: collapsed ? '16px 0' : '16px 20px',
          borderBottom: '1px solid #2d3139',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: '64px',
        }}
      >
        {!collapsed && (
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', whiteSpace: 'nowrap' }}>
            <i className="bi bi-wallet2 me-2 text-primary"></i>
            Finanças
          </span>
        )}
        <button
          onClick={onToggle}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          style={{
            background: 'none',
            border: 'none',
            color: '#8b909a',
            cursor: 'pointer',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
            borderRadius: '4px',
          }}
        >
          <i className={`bi bi-${collapsed ? 'chevron-double-right' : 'chevron-double-left'}`}></i>
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : ''}
            className="sidebar-nav-link"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '12px 0' : '11px 20px',
              margin: '2px 8px',
              borderRadius: '8px',
              color:           isActive ? '#fff'     : '#9199a5',
              backgroundColor: isActive ? '#0d6efd' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 500 : 400,
              transition: 'all 0.2s',
            })}
          >
            <i
              className={`bi ${item.icon}`}
              style={{ fontSize: '1rem', minWidth: collapsed ? 'unset' : '20px' }}
            />
            {!collapsed && (
              <span className="ms-2" style={{ whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: collapsed ? '12px 8px' : '12px 16px',
          borderTop: '1px solid #2d3139',
        }}
      >
        {!collapsed && user && (
          <div style={{ 
            marginBottom: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px' 
          }}>
            {/* Avatar Feminino */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                flexShrink: 0,
                border: '3px solid rgba(240, 147, 251, 0.4)',
                boxShadow: '0 3px 12px rgba(240, 147, 251, 0.3)',
                overflow: 'hidden',
              }}
            >
              <img 
                src="/Mulher sorrindo em meio à natureza.png" 
                alt="Avatar"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }}
              />
            </div>
            
            {/* Nome do usuário */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div 
                style={{ 
                  color: '#fff', 
                  fontSize: '0.88rem', 
                  fontWeight: 600,
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  marginBottom: '2px'
                }}
              >
                {user.nome || 'Usuário'}
              </div>
              <div 
                title={user.email}
                style={{ 
                  color: '#8b909a', 
                  fontSize: '0.75rem',
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }}
              >
                {user.email}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sair' : ''}
          style={{
            background: 'transparent',
            border: '1px solid #dc3545',
            color: '#dc3545',
            borderRadius: '8px',
            padding: collapsed ? '8px' : '6px 14px',
            cursor: 'pointer',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            fontSize: '0.88rem',
            transition: 'all 0.2s',
          }}
        >
          <i className="bi bi-box-arrow-right" style={{ fontSize: '1rem' }}></i>
          {!collapsed && <span className="ms-2">Sair</span>}
        </button>
      </div>
    </div>
  )
}
