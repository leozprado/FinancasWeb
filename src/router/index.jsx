import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout/Layout'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Pessoas from '../pages/Pessoas'
import TiposDespesa from '../pages/TiposDespesa'
import Salarios from '../pages/Salarios'
import Despesas from '../pages/Despesas'

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  // Aguarda o carregamento da verificação de autenticação
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    )
  }
  
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"     element={<Dashboard />} />
        <Route path="pessoas"       element={<Pessoas />} />
        <Route path="tipos-despesa" element={<TiposDespesa />} />
        <Route path="salarios"      element={<Salarios />} />
        <Route path="despesas"      element={<Despesas />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
