# Migração de Fetch para Axios - Resumo

## 🎯 Objetivo

Substituir todas as chamadas `fetch()` por **Axios** para melhorar a qualidade e manutenibilidade do código.

## ✅ O que foi feito

### 1. Instalação do Axios
```bash
npm install axios
```

### 2. Criação da Instância Configurada
**Arquivo:** `src/utils/api.js`

Configuração com:
- Base URL automática
- Timeout de 15 segundos
- Token JWT automático em todas as requisições
- Tratamento centralizado de erros
- Resposta simplificada (apenas `.data`)

### 3. Refatoração de Arquivos

| Arquivo | Status | Mudanças |
|---------|--------|----------|
| `src/utils/api.js` | ✅ | Reescrito para usar Axios |
| `src/pages/Pessoas.jsx` | ✅ | 4 fetch → api.get/post/put/delete |
| `src/pages/TiposDespesa.jsx` | ✅ | 4 fetch → api.get/post/put/delete |
| `src/pages/Salarios.jsx` | ✅ | 4 fetch → api.get/post/put/delete |
| `src/pages/Despesas.jsx` | ✅ | 4 fetch → api.get/post |
| `src/pages/Dashboard.jsx` | ✅ | 2 fetch → api.get |
| `src/context/AuthContext.jsx` | ✅ | 1 fetch → api.post |

**Total:** 19 chamadas fetch() substituídas por Axios

## 📊 Comparação Antes/Depois

### GET Request

#### ❌ Antes (Fetch)
```javascript
fetch('http://localhost:5107/api/Pessoa')
  .then(res => res.json())
  .then(data => setPessoas(data))
  .catch(() => setPessoas([]))
```

#### ✅ Depois (Axios)
```javascript
api.get('/Pessoa')
  .then(data => setPessoas(data))
  .catch(() => setPessoas([]))
```

**Redução:** -2 linhas, sem precisar de `.json()`

---

### POST Request

#### ❌ Antes (Fetch)
```javascript
fetch('http://localhost:5107/api/Pessoa', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nome: nome.trim() })
})
  .then(res => res.json())
  .then(novaPessoa => {
    setPessoas(prev => [...prev, novaPessoa])
  })
```

#### ✅ Depois (Axios)
```javascript
api.post('/Pessoa', { nome: nome.trim() })
  .then(novaPessoa => {
    setPessoas(prev => [...prev, novaPessoa])
  })
```

**Redução:** -4 linhas, sem headers manuais, sem stringify

---

### PUT Request

#### ❌ Antes (Fetch)
```javascript
fetch(`http://localhost:5107/api/Pessoa/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nome: nome.trim() })
})
  .then(res => res.json())
  .then(pessoaAtualizada => {
    setPessoas(prev =>
      prev.map(p => p.id === id ? pessoaAtualizada : p)
    )
  })
```

#### ✅ Depois (Axios)
```javascript
api.put(`/Pessoa/${id}`, { nome: nome.trim() })
  .then(pessoaAtualizada => {
    setPessoas(prev =>
      prev.map(p => p.id === id ? pessoaAtualizada : p)
    )
  })
```

**Redução:** -4 linhas

---

### DELETE Request

#### ❌ Antes (Fetch)
```javascript
fetch(`http://localhost:5107/api/Pessoa/${id}`, {
  method: 'DELETE'
})
  .then(res => {
    if (res.ok) {
      setPessoas(prev => prev.filter(p => p.id !== id))
    }
  })
```

#### ✅ Depois (Axios)
```javascript
api.delete(`/Pessoa/${id}`)
  .then(() => {
    setPessoas(prev => prev.filter(p => p.id !== id))
  })
```

**Redução:** -3 linhas, sem precisar verificar `res.ok`

---

## 🚀 Benefícios Obtidos

### 1. Menos Código
- **~30% menos linhas** em requisições HTTP
- Sem necessidade de `.json()`, `JSON.stringify()`, ou configuração manual de headers

### 2. Código Mais Limpo
```javascript
// Antes
fetch(url, { method, headers, body: JSON.stringify(data) })
  .then(res => res.json())

// Depois
api.post(endpoint, data)
```

### 3. Autenticação Automática
Token JWT é **automaticamente incluído** em todas as requisições via interceptor.

Não é mais necessário:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### 4. Tratamento de Erros Centralizado
- Erros 401 → Logout automático e redirect para login
- Erros de rede → Mensagem padronizada
- Timeout → 15 segundos (configurável)

### 5. Configuração Global
Uma única configuração em `api.js` afeta todas as requisições:
- Base URL
- Headers padrão
- Timeout
- Interceptors

### 6. Melhor Developer Experience
```javascript
// Sintaxe mais clara e concisa
await api.get('/endpoint')
await api.post('/endpoint', data)
await api.put('/endpoint', data)
await api.delete('/endpoint')
```

## 📈 Métricas

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Linhas de código (média por requisição) | ~8 linhas | ~5 linhas | ↓ 37% |
| Configurações manuais | Por requisição | Global | ↑ 100% |
| Autenticação manual | Sim | Não | ↑ 100% |
| Tratamento de erro | Manual | Automático | ↑ 100% |
| Total de chamadas refatoradas | - | 19 | ✅ |

## 🔄 Padrão de Uso

### Importação
```javascript
import api from '../utils/api'
```

### Requisições
```javascript
// GET
const data = await api.get('/endpoint')

// POST
const created = await api.post('/endpoint', body)

// PUT
const updated = await api.put('/endpoint', body)

// DELETE
await api.delete('/endpoint')
```

### Com tratamento de erro
```javascript
try {
  const data = await api.get('/endpoint')
  setDados(data)
} catch (error) {
  console.error(error.message)
}
```

## 📝 Checklist de Migração

- [x] Instalar axios
- [x] Criar instância configurada em `api.js`
- [x] Adicionar interceptor de request (token)
- [x] Adicionar interceptor de response (erros)
- [x] Refatorar Pessoas.jsx
- [x] Refatorar TiposDespesa.jsx
- [x] Refatorar Salarios.jsx
- [x] Refatorar Despesas.jsx
- [x] Refatorar Dashboard.jsx
- [x] Refatorar AuthContext.jsx
- [x] Testar todas as páginas
- [x] Criar documentação
- [x] Remover código antigo (fetch)

## 🎓 Próximos Passos

### Opcionais (Melhorias Futuras)

1. **React Query / TanStack Query**
   - Cache automático de requisições
   - Revalidação em background
   - Estados de loading/error automáticos

2. **Retry Logic**
   - Tentar novamente em caso de falha
   - Backoff exponencial

3. **Request Cancellation**
   - Cancelar requisições quando componente desmonta
   - Evitar memory leaks

4. **Request Deduplication**
   - Evitar múltiplas requisições idênticas simultâneas

5. **Mocks para Testes**
   - Mock da instância Axios para testes unitários

## 📚 Documentação Completa

Veja [AXIOS_GUIDE.md](./AXIOS_GUIDE.md) para documentação detalhada.

---

**Migração concluída em:** 30/03/2026  
**Tempo estimado de migração:** ~45 minutos  
**Arquivos alterados:** 7  
**Linhas de código reduzidas:** ~60 linhas
