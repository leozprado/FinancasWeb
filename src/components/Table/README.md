# Componente Table

Componente de tabela reutilizável com paginação automática para o projeto Financas.

## Características

- ✅ Paginação automática (15 itens por padrão)
- ✅ Busca/filtro opcional
- ✅ Colunas configuráveis com renderização customizada
- ✅ Responsivo (usa React Bootstrap)
- ✅ Alinhamento de texto configurável
- ✅ Suporte a mensagens customizadas

## Instalação

O componente já está criado em `src/components/Table/Table.jsx` e pronto para uso.

## Uso Básico

```jsx
import Table from '../components/Table/Table'

const columns = [
  {
    key: 'id',
    label: '#',
    width: 50
  },
  {
    key: 'nome',
    label: 'Nome'
  },
  {
    key: 'acoes',
    label: 'Ações',
    align: 'center',
    render: (row) => (
      <button onClick={() => handleEdit(row)}>Editar</button>
    )
  }
]

<Table
  columns={columns}
  data={pessoas}
  itemsPerPage={15}
/>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `columns` | Array | `[]` | Array de objetos de configuração de colunas |
| `data` | Array | `[]` | Array de dados a serem exibidos |
| `itemsPerPage` | Number | `15` | Número de itens por página |
| `showSearch` | Boolean | `false` | Mostrar campo de busca |
| `searchFilter` | Function | `null` | Função customizada de filtro: `(item, searchTerm) => boolean` |
| `emptyMessage` | String/JSX | `'Nenhum registro encontrado.'` | Mensagem quando não há dados |
| `noResultsMessage` | String/JSX | `'Nenhum resultado para a busca.'` | Mensagem quando busca não retorna resultados |
| `hover` | Boolean | `true` | Efeito hover nas linhas |
| `striped` | Boolean | `false` | Linhas zebradas |
| `responsive` | Boolean | `true` | Tabela responsiva |
| `headerVariant` | String | `'dark'` | Variante do header (dark, light, primary, etc.) |
| `className` | String | `''` | Classes CSS adicionais |

## Configuração de Colunas

Cada objeto no array `columns` pode ter:

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `key` | String | Chave do dado no objeto (obrigatório se não houver render) |
| `label` | String | Texto do cabeçalho da coluna |
| `width` | Number/String | Largura fixa da coluna |
| `align` | String | Alinhamento: 'left', 'center', 'end' |
| `className` | String | Classes CSS adicionais |
| `render` | Function | Função para renderização customizada: `(row, rowIndex) => JSX` |

## Exemplos de Uso

### Exemplo 1: Tabela Simples com Busca

```jsx
const columns = [
  { key: 'id', label: '#', width: 50 },
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'E-mail' }
]

<Table
  columns={columns}
  data={usuarios}
  showSearch={true}
  searchFilter={(item, term) => 
    item.nome.toLowerCase().includes(term) ||
    item.email.toLowerCase().includes(term)
  }
/>
```

### Exemplo 2: Colunas com Renderização Customizada

```jsx
const columns = [
  {
    key: '#',
    label: '#',
    width: 50,
    render: (row, idx) => <span className="text-muted">{idx + 1}</span>
  },
  {
    key: 'nome',
    label: 'Nome',
    render: (row) => <strong>{row.nome}</strong>
  },
  {
    key: 'valor',
    label: 'Valor',
    align: 'end',
    render: (row) => (
      <span className="text-success">
        {formatCurrency(row.valor)}
      </span>
    )
  },
  {
    key: 'acoes',
    label: 'Ações',
    width: 120,
    align: 'center',
    render: (row) => (
      <>
        <Button size="sm" onClick={() => handleEdit(row)}>
          <i className="bi bi-pencil"></i>
        </Button>
        <Button size="sm" onClick={() => handleDelete(row.id)}>
          <i className="bi bi-trash"></i>
        </Button>
      </>
    )
  }
]
```

### Exemplo 3: Tabela com Badges

```jsx
const columns = [
  { key: 'nome', label: 'Nome' },
  {
    key: 'status',
    label: 'Status',
    align: 'center',
    render: (row) => (
      <Badge bg={row.ativo ? 'success' : 'danger'}>
        {row.ativo ? 'Ativo' : 'Inativo'}
      </Badge>
    )
  }
]
```

### Exemplo 4: Tabela com Loading

```jsx
{loading ? (
  <div className="text-center py-4">Carregando...</div>
) : (
  <Table
    columns={columns}
    data={dados}
    emptyMessage="Nenhum registro encontrado."
  />
)}
```

### Exemplo 5: Mensagem Customizada

```jsx
<Table
  columns={columns}
  data={despesas}
  emptyMessage={
    <div className="text-center">
      <i className="bi bi-inbox" style={{ fontSize: '2rem' }}></i>
      <p>Nenhuma despesa cadastrada.</p>
    </div>
  }
/>
```

## Páginas que Usam o Componente

- ✅ [Pessoas.jsx](../pages/Pessoas.jsx)
- ✅ [TiposDespesa.jsx](../pages/TiposDespesa.jsx)
- ✅ [Salarios.jsx](../pages/Salarios.jsx)
- ✅ [Despesas.jsx](../pages/Despesas.jsx)

## Paginação

A paginação é automática e exibe:
- Botões Primeiro/Anterior/Próximo/Último
- Números de páginas (com reticências quando há muitas páginas)
- Contador de registros ("Mostrando X a Y de Z registros")
- Navegação inteligente que mostra até 7 botões de página

## Busca

Quando `showSearch={true}`:
- Campo de busca é exibido acima da tabela
- Busca é case-insensitive
- Paginação é resetada para página 1 ao buscar
- Use `searchFilter` para controle customizado da busca

**Busca padrão:** Procura em todos os valores do objeto  
**Busca customizada:** Use a prop `searchFilter` para definir campos específicos

```jsx
searchFilter={(item, term) => 
  item.nome.toLowerCase().includes(term) ||
  item.cpf.includes(term)
}
```

## Estilização

O componente usa classes do Bootstrap e mantém consistência visual com o projeto.

Classes CSS customizadas em `Table.css`:
- `.table-component`: Container principal
- `.table-search`: Container do campo de busca
- Responsividade para paginação em telas pequenas

## Dicas

1. **Performance**: Para grandes volumes de dados, considere paginação server-side
2. **Loading**: Mostre um indicador de loading enquanto os dados são carregados
3. **Filtros externos**: Aplique filtros nos dados antes de passar para o componente
4. **Renderização customizada**: Use a prop `render` para controle total sobre a célula
5. **Alinhamento**: Use `align: 'end'` para valores monetários
6. **Width**: Defina larguras fixas para colunas de ações

## Limitações

- Não suporta ordenação (implementar se necessário)
- Não suporta seleção múltipla de linhas
- Não suporta edição inline
- Paginação é apenas client-side

## Melhorias Futuras

- [ ] Suporte a ordenação por coluna
- [ ] Seleção de linhas (checkbox)
- [ ] Exportação para CSV/Excel
- [ ] Configuração de items per page pelo usuário
- [ ] Scroll infinito como alternativa à paginação
