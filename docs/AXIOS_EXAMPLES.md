# Exemplos Práticos de Uso do Axios

Este arquivo contém exemplos práticos de como usar a instância configurada do Axios no projeto.

## 📚 Índice

1. [Requisições Básicas](#requisições-básicas)
2. [Tratamento de Erros](#tratamento-de-erros)
3. [Loading States](#loading-states)
4. [Formulários](#formulários)
5. [Listas e Tabelas](#listas-e-tabelas)
6. [Upload de Arquivos](#upload-de-arquivos)
7. [Requisições Paralelas](#requisições-paralelas)
8. [Cancelamento de Requisições](#cancelamento-de-requisições)

---

## Requisições Básicas

### GET - Buscar lista

```javascript
import { useState, useEffect } from 'react'
import api from '../utils/api'

function PessoasPage() {
  const [pessoas, setPessoas] = useState([])
  
  useEffect(() => {
    api.get('/Pessoa')
      .then(data => setPessoas(data))
      .catch(error => console.error(error))
  }, [])
  
  return (
    <div>
      {pessoas.map(p => (
        <div key={p.id}>{p.nome}</div>
      ))}
    </div>
  )
}
```

### GET - Buscar item específico

```javascript
async function buscarPessoa(id) {
  const pessoa = await api.get(`/Pessoa/${id}`)
  return pessoa
}
```

### POST - Criar novo registro

```javascript
async function criarPessoa(dados) {
  const novaPessoa = await api.post('/Pessoa', {
    nome: dados.nome,
    cpf: dados.cpf,
    email: dados.email
  })
  return novaPessoa
}
```

### PUT - Atualizar registro

```javascript
async function atualizarPessoa(id, dados) {
  const atualizada = await api.put(`/Pessoa/${id}`, dados)
  return atualizada
}
```

### DELETE - Excluir registro

```javascript
async function excluirPessoa(id) {
  await api.delete(`/Pessoa/${id}`)
}
```

---

## Tratamento de Erros

### Básico com try/catch

```javascript
async function buscarDados() {
  try {
    const data = await api.get('/Pessoa')
    setPessoas(data)
  } catch (error) {
    console.error('Erro:', error.message)
    alert('Erro ao buscar dados')
  }
}
```

### Com mensagens customizadas

```javascript
async function salvar() {
  try {
    const resultado = await api.post('/Pessoa', dados)
    setAlerta({
      tipo: 'success',
      mensagem: 'Cadastro realizado com sucesso!'
    })
    return resultado
  } catch (error) {
    let mensagem = 'Erro ao salvar'
    
    if (error.message.includes('CPF')) {
      mensagem = 'CPF já cadastrado'
    } else if (error.message.includes('conexão')) {
      mensagem = 'Sem conexão com a internet'
    } else if (error.message.includes('sessão')) {
      mensagem = 'Sua sessão expirou'
    }
    
    setAlerta({ tipo: 'error', mensagem })
  }
}
```

### Com estado de erro no componente

```javascript
function MeuComponente() {
  const [dados, setDados] = useState([])
  const [erro, setErro] = useState(null)
  
  useEffect(() => {
    api.get('/Pessoa')
      .then(data => {
        setDados(data)
        setErro(null)
      })
      .catch(error => {
        setErro(error.message)
        setDados([])
      })
  }, [])
  
  if (erro) {
    return <div className="alert alert-danger">{erro}</div>
  }
  
  return <div>{/* renderizar dados */}</div>
}
```

---

## Loading States

### Padrão recomendado

```javascript
function MinhaLista() {
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  
  const buscarDados = async () => {
    setLoading(true)
    setErro(null)
    
    try {
      const resultado = await api.get('/Pessoa')
      setDados(resultado)
    } catch (error) {
      setErro(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    buscarDados()
  }, [])
  
  if (loading) return <div>Carregando...</div>
  if (erro) return <div>Erro: {erro}</div>
  
  return (
    <div>
      {dados.map(item => (
        <div key={item.id}>{item.nome}</div>
      ))}
    </div>
  )
}
```

### Com spinner customizado

```javascript
{loading ? (
  <div className="text-center py-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Carregando...</span>
    </div>
    <p className="mt-3">Carregando dados...</p>
  </div>
) : (
  <Table data={dados} />
)}
```

---

## Formulários

### Salvar formulário completo

```javascript
function FormularioPessoa() {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: ''
  })
  const [salvando, setSalvando] = useState(false)
  
  const handleChange = (campo) => (e) => {
    setFormData(prev => ({
      ...prev,
      [campo]: e.target.value
    }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSalvando(true)
    
    try {
      const resultado = await api.post('/Pessoa', formData)
      alert('Salvo com sucesso!')
      // Limpar formulário
      setFormData({ nome: '', cpf: '', email: '' })
    } catch (error) {
      alert(`Erro: ${error.message}`)
    } finally {
      setSalvando(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={formData.nome}
        onChange={handleChange('nome')}
        disabled={salvando}
      />
      <button type="submit" disabled={salvando}>
        {salvando ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  )
}
```

### Edição de registro

```javascript
function EditarPessoa({ id }) {
  const [dados, setDados] = useState(null)
  const [salvando, setSalvando] = useState(false)
  
  // Buscar dados ao montar
  useEffect(() => {
    api.get(`/Pessoa/${id}`)
      .then(data => setDados(data))
      .catch(error => alert(error.message))
  }, [id])
  
  const handleSave = async () => {
    setSalvando(true)
    try {
      const atualizado = await api.put(`/Pessoa/${id}`, dados)
      alert('Atualizado com sucesso!')
      setDados(atualizado)
    } catch (error) {
      alert(`Erro: ${error.message}`)
    } finally {
      setSalvando(false)
    }
  }
  
  if (!dados) return <div>Carregando...</div>
  
  return (
    <div>
      <input 
        value={dados.nome}
        onChange={e => setDados({...dados, nome: e.target.value})}
      />
      <button onClick={handleSave} disabled={salvando}>
        Salvar
      </button>
    </div>
  )
}
```

---

## Listas e Tabelas

### CRUD completo

```javascript
function ListaPessoas() {
  const [pessoas, setPessoas] = useState([])
  const [loading, setLoading] = useState(false)
  
  // CREATE
  const criar = async (dados) => {
    const nova = await api.post('/Pessoa', dados)
    setPessoas(prev => [...prev, nova])
  }
  
  // READ
  const buscar = async () => {
    setLoading(true)
    try {
      const data = await api.get('/Pessoa')
      setPessoas(data)
    } finally {
      setLoading(false)
    }
  }
  
  // UPDATE
  const atualizar = async (id, dados) => {
    const atualizada = await api.put(`/Pessoa/${id}`, dados)
    setPessoas(prev =>
      prev.map(p => p.id === id ? atualizada : p)
    )
  }
  
  // DELETE
  const excluir = async (id) => {
    await api.delete(`/Pessoa/${id}`)
    setPessoas(prev => prev.filter(p => p.id !== id))
  }
  
  useEffect(() => {
    buscar()
  }, [])
  
  return (
    <div>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        pessoas.map(pessoa => (
          <div key={pessoa.id}>
            {pessoa.nome}
            <button onClick={() => excluir(pessoa.id)}>
              Excluir
            </button>
          </div>
        ))
      )}
    </div>
  )
}
```

### Com filtros

```javascript
function ListaFiltrada() {
  const [pessoas, setPessoas] = useState([])
  const [filtro, setFiltro] = useState('')
  
  useEffect(() => {
    api.get('/Pessoa', {
      params: { 
        nome: filtro,
        ativo: true
      }
    })
    .then(data => setPessoas(data))
  }, [filtro])
  
  return (
    <div>
      <input 
        placeholder="Buscar..."
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
      />
      {/* Lista */}
    </div>
  )
}
```

---

## Upload de Arquivos

### Upload simples

```javascript
async function uploadArquivo(arquivo) {
  const formData = new FormData()
  formData.append('arquivo', arquivo)
  
  const resultado = await api.post('/Upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  
  return resultado
}
```

### Com progresso

```javascript
async function uploadComProgresso(arquivo, onProgress) {
  const formData = new FormData()
  formData.append('arquivo', arquivo)
  
  const resultado = await api.post('/Upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      )
      onProgress(percentCompleted)
    }
  })
  
  return resultado
}

// Uso
function ComponenteUpload() {
  const [progresso, setProgresso] = useState(0)
  
  const handleUpload = async (arquivo) => {
    await uploadComProgresso(arquivo, setProgresso)
  }
  
  return (
    <div>
      <input type="file" onChange={e => handleUpload(e.target.files[0])} />
      {progresso > 0 && <div>Progresso: {progresso}%</div>}
    </div>
  )
}
```

---

## Requisições Paralelas

### Buscar múltiplos endpoints simultaneamente

```javascript
async function buscarDadosDashboard() {
  try {
    const [pessoas, despesas, receitas] = await Promise.all([
      api.get('/Pessoa'),
      api.get('/Despesas'),
      api.get('/Receita')
    ])
    
    setDados({ pessoas, despesas, receitas })
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
  }
}
```

### Com tratamento individual de erros

```javascript
async function buscarTodos() {
  const resultados = await Promise.allSettled([
    api.get('/Pessoa'),
    api.get('/Despesas'),
    api.get('/Receita')
  ])
  
  const [pessoas, despesas, receitas] = resultados.map(r => 
    r.status === 'fulfilled' ? r.value : []
  )
  
  setPessoas(pessoas)
  setDespesas(despesas)
  setReceitas(receitas)
}
```

---

## Cancelamento de Requisições

### Cancelar quando componente desmonta

```javascript
import { useEffect } from 'react'

function MeuComponente() {
  useEffect(() => {
    const controller = new AbortController()
    
    api.get('/Pessoa', {
      signal: controller.signal
    })
    .then(data => setDados(data))
    .catch(error => {
      if (error.name !== 'CanceledError') {
        console.error(error)
      }
    })
    
    // Cleanup: cancela a requisição
    return () => controller.abort()
  }, [])
  
  return <div>{/* ... */}</div>
}
```

### Cancelar requisição anterior ao buscar novamente

```javascript
function BuscaComDebounce() {
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState([])
  const controllerRef = useRef()
  
  useEffect(() => {
    // Cancela busca anterior
    if (controllerRef.current) {
      controllerRef.current.abort()
    }
    
    // Nova busca
    controllerRef.current = new AbortController()
    
    const timer = setTimeout(() => {
      if (busca) {
        api.get('/Pessoa', {
          params: { nome: busca },
          signal: controllerRef.current.signal
        })
        .then(data => setResultados(data))
        .catch(error => {
          if (error.name !== 'CanceledError') {
            console.error(error)
          }
        })
      }
    }, 300) // Debounce 300ms
    
    return () => clearTimeout(timer)
  }, [busca])
  
  return (
    <input 
      value={busca}
      onChange={e => setBusca(e.target.value)}
      placeholder="Buscar pessoa..."
    />
  )
}
```

---

## 💡 Dicas e Boas Práticas

### 1. Sempre use try/catch ou .catch()
```javascript
// ✅ Bom
try {
  const data = await api.get('/endpoint')
} catch (error) {
  // tratar erro
}

// ✅ Bom
api.get('/endpoint')
  .then(data => { })
  .catch(error => { })

// ❌ Ruim (erro não tratado)
const data = await api.get('/endpoint')
```

### 2. Use loading states
```javascript
// ✅ Bom
setLoading(true)
try {
  await api.post('/endpoint', data)
} finally {
  setLoading(false)
}
```

### 3. Feedback ao usuário
```javascript
// ✅ Bom
try {
  await api.post('/Pessoa', dados)
  toast.success('Salvo com sucesso!')
} catch (error) {
  toast.error(error.message)
}
```

### 4. Validação antes de enviar
```javascript
// ✅ Bom
if (!dados.nome || !dados.cpf) {
  alert('Preencha todos os campos')
  return
}

await api.post('/Pessoa', dados)
```

### 5. Reutilize funções
```javascript
// ✅ Bom - Crie um serviço
// services/pessoaService.js
export const pessoaService = {
  listar: () => api.get('/Pessoa'),
  buscar: (id) => api.get(`/Pessoa/${id}`),
  criar: (dados) => api.post('/Pessoa', dados),
  atualizar: (id, dados) => api.put(`/Pessoa/${id}`, dados),
  excluir: (id) => api.delete(`/Pessoa/${id}`)
}

// Uso
import { pessoaService } from '../services/pessoaService'
const pessoas = await pessoaService.listar()
```

---

**Documentação completa:** [AXIOS_GUIDE.md](./AXIOS_GUIDE.md)
