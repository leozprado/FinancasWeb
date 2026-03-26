import { createContext, useContext, useState, useEffect } from 'react'
import { API_BASE_URL } from '../utils/constants'

const AuthContext = createContext()

const AUTH_STORAGE_KEY = 'financas_auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verifica se há uma sessão válida ao carregar
  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth)
        // Verifica se o token ainda é válido
        if (isTokenValid(authData.dataHoraExpiracao)) {
          setUser(authData)
        } else {
          // Token expirado, remove do storage
          localStorage.removeItem(AUTH_STORAGE_KEY)
        }
      } catch (error) {
        console.error('Erro ao recuperar autenticação:', error)
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
    setLoading(false)
  }, [])

  // Verifica se o token ainda é válido
  const isTokenValid = (dataHoraExpiracao) => {
    if (!dataHoraExpiracao) return false
    const expirationDate = new Date(dataHoraExpiracao)
    const now = new Date()
    return expirationDate > now
  }

  // Faz login via API
  const login = async (email, senha) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Usuario/autenticar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erro ao fazer login')
      }

      const authData = await response.json()
      
      // Armazena os dados do usuário e token
      setUser(authData)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData))
      
      return { success: true }
    } catch (error) {
      console.error('Erro no login:', error)
      return { 
        success: false, 
        error: error.message || 'Erro ao fazer login. Verifique suas credenciais.' 
      }
    }
  }

  // Faz logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  // Verifica se o usuário está autenticado e o token é válido
  const isAuthenticated = () => {
    if (!user) return false
    return isTokenValid(user.dataHoraExpiracao)
  }

  // Retorna o token para uso em requisições
  const getToken = () => {
    if (isAuthenticated()) {
      return user.token
    }
    return null
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      isAuthenticated,
      getToken
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
