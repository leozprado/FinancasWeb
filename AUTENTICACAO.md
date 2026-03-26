# Sistema de Autenticação - Controle Financeiro

## Configuração Implementada

### 1. Endpoint de Autenticação
- **URL**: `http://localhost:5107/api/Usuario/autenticar`
- **Método**: POST
- **Payload**:
```json
{
  "email": "leozprado@hotmail.com",
  "senha": "Ln190807!@#"
}
```

### 2. Resposta da API
```json
{
  "id": "a51f5e4d-67cb-4260-989e-7b54a9259f42",
  "nome": "Leonardo Prado",
  "email": "leozprado@hotmail.com",
  "dataHoraAcesso": "2026-03-25T14:39:07.3571678-03:00",
  "dataHoraExpiracao": "2026-03-25T16:39:07.3571728-03:00",
  "token": "eyJhbGciOiJIUzI1..."
}
```

## Arquivos Modificados

### 1. `/src/utils/constants.js`
- Adicionada constante `API_BASE_URL` com o endereço base da API

### 2. `/src/context/AuthContext.jsx`
**Funcionalidades implementadas:**
- ✅ Autenticação via API REST
- ✅ Armazenamento seguro do token no localStorage
- ✅ Verificação automática de expiração do token
- ✅ Auto-login ao recarregar a página (se token válido)
- ✅ Logout com limpeza de dados
- ✅ Funções auxiliares: `isAuthenticated()`, `getToken()`

**Métodos disponíveis:**
- `login(email, senha)` - Autentica o usuário
- `logout()` - Desloga e limpa os dados
- `isAuthenticated()` - Verifica se há sessão válida
- `getToken()` - Retorna o token para requisições
- `loading` - Estado de carregamento inicial
- `user` - Dados do usuário autenticado

### 3. `/src/pages/Login.jsx`
**Alterações:**
- Campo "Usuário" alterado para "E-mail" com validação
- Ícone alterado de `bi-person` para `bi-envelope`
- Integração com a API real de autenticação
- Tratamento de erros da API
- Remoção do timeout simulado

### 4. `/src/router/index.jsx`
**Melhorias no PrivateRoute:**
- Verificação com `isAuthenticated()` ao invés de apenas `user`
- Tela de loading enquanto verifica a sessão
- Proteção contra tokens expirados
- Redirecionamento automático para login se não autenticado

### 5. `/src/components/Layout/Sidebar.jsx`
**Ajustes:**
- Exibição do nome do usuário (campo `nome` da API)
- Fallback para email se nome não disponível
- Navegação para login após logout
- Tooltip com email completo ao passar o mouse

### 6. `/src/utils/api.js` (novo arquivo)
**Helper para requisições autenticadas:**
```javascript
import { apiRequest } from '../utils/api'

// GET
const dados = await apiRequest('/Pessoa/listar')

// POST
const novo = await apiRequest('/Pessoa/criar', {
  method: 'POST',
  body: { nome: 'João', cpf: '123.456.789-00' }
})

// PUT
await apiRequest('/Pessoa/atualizar', {
  method: 'PUT',
  body: { id: 1, nome: 'João Silva' }
})

// DELETE
await apiRequest('/Pessoa/deletar/1', { method: 'DELETE' })
```

**Funcionalidades:**
- Adiciona automaticamente o token JWT no header `Authorization`
- Trata erros HTTP (401, 404, 500, etc)
- Redireciona para login se token expirado (401)
- Converte automaticamente JSON

## Fluxo de Segurança

### Login
1. Usuário preenche email e senha
2. Sistema envia POST para `/api/Usuario/autenticar`
3. API retorna dados do usuário + token JWT
4. Token e dados são salvos no localStorage
5. Usuário é redirecionado para `/dashboard`

### Navegação Protegida
1. Ao acessar uma rota protegida, `PrivateRoute` verifica:
   - Se existe usuário logado
   - Se o token não expirou (compara `dataHoraExpiracao` com data atual)
2. Se válido: permite acesso
3. Se inválido: redireciona para `/login`

### Auto-login
1. Ao recarregar a página, `AuthContext` carrega automaticamente
2. Verifica se há dados no localStorage
3. Valida se o token ainda é válido
4. Se válido: restaura a sessão
5. Se expirado: limpa dados e exige novo login

### Requisições Autenticadas
1. Usar helper `apiRequest()` do arquivo `/src/utils/api.js`
2. Token é inserido automaticamente no header
3. Se retornar 401, redireciona para login

### Logout
1. Usuário clica em "Sair" no sidebar
2. `logout()` limpa dados do localStorage
3. Remove estado do usuário
4. Redireciona para `/login`

## Segurança Implementada

✅ Token JWT armazenado de forma segura
✅ Verificação de expiração em todas as rotas
✅ Auto-logout em caso de token expirado
✅ Headers de autenticação em todas as requisições
✅ Proteção contra acesso sem login
✅ Limpeza de dados sensíveis no logout
✅ Validação de sessão ao recarregar a página

## Como Testar

1. Inicie o servidor da API na porta 5107
2. Execute o projeto React: `npm run dev` ou `npm start`
3. Acesse `/login`
4. Use as credenciais:
   - Email: `leozprado@hotmail.com`
   - Senha: `Ln190807!@#`
5. Após login, todas as rotas estarão acessíveis
6. Teste o logout clicando em "Sair"
7. Tente acessar rotas protegidas sem login (deve redirecionar)

## Próximas Melhorias Sugeridas

- [ ] Implementar refresh token
- [ ] Adicionar "Lembrar-me" no login
- [ ] Criar página de recuperação de senha
- [ ] Adicionar interceptor global para renovar token antes de expirar
- [ ] Implementar logout em múltiplas abas
- [ ] Adicionar logs de auditoria de acesso
