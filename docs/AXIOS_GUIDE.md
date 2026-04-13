# Configuração do Axios

Este projeto utiliza **Axios** como cliente HTTP para todas as chamadas à API, substituindo o uso de `fetch()`.

## 📦 Instalação

O Axios já está instalado no projeto:

```bash
npm install axios
```

## ⚙️ Configuração

A instância do Axios está configurada em [src/utils/api.js](../src/utils/api.js) com:

### Configurações Base

- **Base URL**: `http://localhost:5107/api` (definida em `constants.js`)
- **Timeout**: 15 segundos
- **Headers padrão**: `Content-Type: application/json`

### Interceptors

#### Request Interceptor
Adiciona automaticamente o token de autenticação em todas as requisições:

```javascript
config.headers.Authorization = `Bearer ${token}`
```

#### Response Interceptor
- Retorna apenas `response.data` (sem precisar chamar `.json()`)
- Trata erros 401 (sessão expirada) redirecionando para login
- Trata erros de rede
- Formata mensagens de erro de forma consistente

## 🚀 Como Usar

### Importar a instância

```javascript
import api from '../utils/api'
```

### Exemplos de Uso

#### GET - Buscar dados

```javascript
// Buscar todas as pessoas
const pessoas = await api.get('/Pessoa')

// Buscar pessoa por ID
const pessoa = await api.get(`/Pessoa/${id}`)

// GET com query params
const resultado = await api.get('/Pessoa', {
  params: { nome: 'João', ativo: true }
})
```

#### POST - Criar registro

```javascript
try {
  const novaPessoa = await api.post('/Pessoa', {
    nome: 'João Silva',
    cpf: '123.456.789-00'
  })
  console.log('Pessoa criada:', novaPessoa)
} catch (error) {
  console.error('Erro ao criar:', error.message)
}
```

#### PUT - Atualizar registro

```javascript
const atualizada = await api.put(`/Pessoa/${id}`, {
  nome: 'João Silva Atualizado',
  cpf: '123.456.789-00'
})
```

#### DELETE - Excluir registro

```javascript
await api.delete(`/Pessoa/${id}`)
```

#### Tratamento de Erros Avançado

```javascript
try {
  const data = await api.get('/endpoint')
  setDados(data)
} catch (error) {
  if (error.message.includes('sessão expirada')) {
    // Usuário será automaticamente redirecionado
  } else if (error.message.includes('conexão')) {
    setErro('Verifique sua internet')
  } else {
    setErro(error.message)
  }
}
```

## 📄 Páginas Refatoradas

Todas as seguintes páginas foram refatoradas para usar Axios:

### ✅ [Pessoas.jsx](../src/pages/Pessoas.jsx)
**Antes:**
```javascript
fetch('http://localhost:5107/api/Pessoa')
  .then(res => res.json())
  .then(data => setPessoas(data))
```

**Depois:**
```javascript
api.get('/Pessoa')
  .then(data => setPessoas(data))
```

### ✅ [TiposDespesa.jsx](../src/pages/TiposDespesa.jsx)
```javascript
// GET
const data = await api.get('/TipoDespesa/com-quantidade')

// POST
await api.post('/TipoDespesa', { nome: nome.trim() })

// PUT
await api.put(`/TipoDespesa/${id}`, { nome: nome.trim() })

// DELETE
await api.delete(`/TipoDespesa/${id}`)
```

### ✅ [Salarios.jsx](../src/pages/Salarios.jsx)
```javascript
// GET
api.get('/Receita/consultar')
  .then(data => setSalarios(data))

// POST
const result = await api.post('/Receita/criar', data)

// PUT
const result = await api.put(`/Receita/alterar/${id}`, data)

// DELETE
await api.delete(`/Receita/excluir/${id}`)
```

### ✅ [Despesas.jsx](../src/pages/Despesas.jsx)
```javascript
// GET múltiplos endpoints
api.get('/Despesas')
  .then(data => setDespesas(data))

api.get('/Pessoa')
  .then(data => setPessoasApi(data))

// POST
api.post('/Despesas/cadastrar', payload)
  .then(() => {
    // sucesso
  })
```

### ✅ [Dashboard.jsx](../src/pages/Dashboard.jsx)
```javascript
api.get('/Pessoa')
  .then(data => setPessoas(data))

api.get(`/Dashboard/${pessoaId}/${mes}/${ano}`)
  .then(data => setDashboardData(data))
```

### ✅ [AuthContext.jsx](../src/context/AuthContext.jsx)
```javascript
const authData = await api.post('/Usuario/autenticar', { 
  email, 
  senha 
})
```

## 🎯 Vantagens do Axios sobre Fetch

1. **Menos código**: Não precisa de `.json()`, retorna dados diretamente
2. **Interceptors**: Lógica centralizada para autenticação e tratamento de erros
3. **Timeout automático**: Evita requisições que ficam travadas
4. **Cancelamento de requisições**: Possível com cancel tokens
5. **Transformação automática**: JSON é automaticamente parseado
6. **Melhor tratamento de erros**: Rejeita promessas para códigos de erro HTTP
7. **Request/Response transformation**: Possível transformar dados antes/depois
8. **Configuração global**: Base URL, headers, timeout definidos uma vez

## 🔒 Autenticação Automática

O token JWT é **automaticamente incluído** em todas as requisições através do interceptor:

```javascript
api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('financas_auth')
  if (authData) {
    const auth = JSON.parse(authData)
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})
```

**Você não precisa se preocupar em adicionar o token manualmente!**

## 🛡️ Tratamento de Erros Centralizado

Erros 401 (não autorizado) são tratados automaticamente:

```javascript
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('financas_auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

## 📝 Padrões Recomendados

### ✅ Boas Práticas

```javascript
// 1. Sempre use try/catch
try {
  const data = await api.get('/endpoint')
  setDados(data)
} catch (error) {
  setErro(error.message)
}

// 2. Use loading states
setLoading(true)
try {
  const data = await api.get('/endpoint')
  setDados(data)
} catch (error) {
  setErro(error.message)
} finally {
  setLoading(false)
}

// 3. Feedback ao usuário
try {
  await api.post('/Pessoa', dados)
  setAlerta({ tipo: 'success', msg: 'Salvo com sucesso!' })
} catch (error) {
  setAlerta({ tipo: 'error', msg: error.message })
}
```

### ❌ Evite

```javascript
// NÃO use fetch diretamente
fetch('http://localhost:5107/api/Pessoa')  // ❌

// Use a instância configurada
api.get('/Pessoa')  // ✅

// NÃO adicione base URL manualmente
api.get('http://localhost:5107/api/Pessoa')  // ❌

// Use apenas o endpoint
api.get('/Pessoa')  // ✅
```

## 🔧 Configurações Avançadas

### Timeout customizado para requisição específica

```javascript
const data = await api.get('/endpoint-lento', {
  timeout: 30000 // 30 segundos
})
```

### Headers customizados

```javascript
const data = await api.post('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
```

### Cancelar requisição

```javascript
const controller = new AbortController()

api.get('/endpoint', {
  signal: controller.signal
})

// Cancelar
controller.abort()
```

## 📚 Recursos

- [Documentação Oficial do Axios](https://axios-http.com/)
- [Axios GitHub](https://github.com/axios/axios)

## 🐛 Troubleshooting

### Erro: "Network Error"
- Verifique se a API está rodando
- Verifique a URL base em `constants.js`
- Verifique configurações de CORS na API

### Erro: "Request failed with status code 401"
- Token expirado ou inválido
- Usuário será redirecionado para login automaticamente

### Erro: "timeout of 15000ms exceeded"
- Requisição demorou muito
- Aumente o timeout ou verifique performance da API

---

**Última atualização:** 30/03/2026
