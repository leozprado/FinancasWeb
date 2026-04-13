import axios from 'axios'
import { API_BASE_URL } from './constants'

// Criar instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 segundos
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('financas_auth')
    
    if (authData) {
      try {
        const auth = JSON.parse(authData)
        if (auth.token) {
          config.headers.Authorization = `Bearer ${auth.token}`
        }
      } catch (error) {
        console.error('Erro ao recuperar token:', error)
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    // Retorna apenas os dados da resposta
    return response.data
  },
  (error) => {
    // Tratamento de erro 401 (não autorizado)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('financas_auth')
      window.location.href = '/login'
      return Promise.reject(new Error('Sessão expirada. Faça login novamente.'))
    }

    // Tratamento de erro de rede
    if (!error.response) {
      console.error('Erro de rede:', error)
      return Promise.reject(new Error('Erro de conexão. Verifique sua internet.'))
    }

    // Outros erros
    const errorMessage = error.response.data?.message || 
                         error.response.data?.error || 
                         `Erro na requisição: ${error.response.status}`
    
    console.error('Erro na API:', errorMessage)
    return Promise.reject(new Error(errorMessage))
  }
)

// Exportar a instância configurada
export default api

/**
 * Exemplos de uso:
 * 
 * // GET
 * const pessoas = await api.get('/Pessoa')
 * 
 * // GET com parâmetros
 * const pessoa = await api.get(`/Pessoa/${id}`)
 * 
 * // POST
 * const novaPessoa = await api.post('/Pessoa', {
 *   nome: 'João Silva',
 *   cpf: '123.456.789-00'
 * })
 * 
 * // PUT
 * const atualizada = await api.put(`/Pessoa/${id}`, {
 *   nome: 'João Silva Atualizado'
 * })
 * 
 * // DELETE
 * await api.delete(`/Pessoa/${id}`)
 * 
 * // Tratamento de erros
 * try {
 *   const data = await api.get('/endpoint')
 * } catch (error) {
 *   console.error(error.message)
 * }
 */
