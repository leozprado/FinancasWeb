import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="flex-grow-1 overflow-auto" style={{ backgroundColor: '#f0f2f5' }}>
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
