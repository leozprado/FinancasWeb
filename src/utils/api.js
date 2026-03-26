import { API_BASE_URL } from './constants'

/**
 * Helper para fazer requisições autenticadas à API
 * @param {string} endpoint - O endpoint da API (ex: '/Pessoa/listar')
 * @param {object} options - Opções da requisição (method, body, etc)
 * @returns {Promise} - Resposta da API
 */
export async function apiRequest(endpoint, options = {}) {
  const authData = localStorage.getItem('financas_auth')
  let token = null
  
  if (authData) {
    try {
      const auth = JSON.parse(authData)
      token = auth.token
    } catch (error) {
      console.error('Erro ao recuperar token:', error)
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers,
  }

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    // Se a resposta for 401 (não autorizado), o token pode ter expirado
    if (response.status === 401) {
      localStorage.removeItem('financas_auth')
      window.location.href = '/login'
      throw new Error('Sessão expirada. Faça login novamente.')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Erro na requisição: ${response.status}`)
    }

    // Verifica se há conteúdo na resposta
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }

    return null
  } catch (error) {
    console.error('Erro na requisição:', error)
    throw error
  }
}

/**
 * Exemplos de uso:
 * 
 * // GET
 * const pessoas = await apiRequest('/Pessoa/listar')
 * 
 * // POST
 * const novaPessoa = await apiRequest('/Pessoa/criar', {
 *   method: 'POST',
 *   body: { nome: 'João Silva', cpf: '123.456.789-00' }
 * })
 * 
 * // PUT
 * const atualizada = await apiRequest('/Pessoa/atualizar', {
 *   method: 'PUT',
 *   body: { id: 1, nome: 'João Silva' }
 * })
 * 
 * // DELETE
 * await apiRequest('/Pessoa/deletar/1', { method: 'DELETE' })
 */
