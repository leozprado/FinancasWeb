import { useState, useMemo } from 'react'
import { Table as BTable, Pagination, Form } from 'react-bootstrap'
import './Table.css'

/**
 * Componente de tabela reutilizável com paginação e ordenação
 * 
 * @param {Array} columns - Array de objetos com { key, label, render?, className?, width?, align?, sortable?, sortType? }
 *   - sortable: boolean - se a coluna pode ser ordenada
 *   - sortType: 'string'|'number'|'date' - tipo de dado para ordenação correta
 * @param {Array} data - Array de objetos com os dados
 * @param {Number} itemsPerPage - Número de itens por página (default: 15)
 * @param {Boolean} showSearch - Mostrar campo de busca (default: false)
 * @param {Function} searchFilter - Função customizada de filtro (data, searchTerm) => boolean
 * @param {String} emptyMessage - Mensagem quando não há dados
 * @param {String} noResultsMessage - Mensagem quando a busca não retorna resultados
 * @param {Boolean} hover - Efeito hover nas linhas (default: true)
 * @param {Boolean} striped - Linhas zebradas (default: false)
 * @param {Boolean} responsive - Tabela responsiva (default: true)
 * @param {String} headerVariant - Variante do header (default: 'dark')
 */
export default function Table({
  columns = [],
  data = [],
  itemsPerPage = 15,
  showSearch = false,
  searchFilter = null,
  emptyMessage = 'Nenhum registro encontrado.',
  noResultsMessage = 'Nenhum resultado para a busca.',
  hover = true,
  striped = false,
  responsive = true,
  headerVariant = 'dark',
  className = ''
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })

  // Função de ordenação
  const handleSort = (columnKey, sortType = 'string') => {
    let direction = 'asc'
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    console.log('Ordenando:', columnKey, 'direção:', direction)
    setSortConfig({ key: columnKey, direction })
    setCurrentPage(1) // Voltar para primeira página ao ordenar
  }

  // Filtrar e ordenar dados
  const filteredAndSortedData = useMemo(() => {
    // Primeiro filtrar
    let filtered = data
    
    if (showSearch && searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      
      if (searchFilter) {
        filtered = data.filter(item => searchFilter(item, term))
      } else {
        // Busca padrão: procura em todos os valores do objeto
        filtered = data.filter(item => {
          return Object.values(item).some(value => {
            if (value == null) return false
            return String(value).toLowerCase().includes(term)
          })
        })
      }
    }

    // Depois ordenar
    if (sortConfig.key) {
      const column = columns.find(col => col.key === sortConfig.key)
      const sortType = column?.sortType || 'string'
      
      console.log('Ordenando dados:', {
        key: sortConfig.key,
        direction: sortConfig.direction,
        sortType,
        total: filtered.length
      })
      
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]
        
        // Lidar com valores nulos/undefined
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return 1
        if (bVal == null) return -1
        
        let comparison = 0
        
        if (sortType === 'number') {
          comparison = Number(aVal) - Number(bVal)
        } else if (sortType === 'date') {
          comparison = new Date(aVal) - new Date(bVal)
        } else {
          // string (default)
          comparison = String(aVal).localeCompare(String(bVal), 'pt-BR', { 
            sensitivity: 'base',
            numeric: true 
          })
        }
        
        return sortConfig.direction === 'asc' ? comparison : -comparison
      })
    }
    
    return filtered
  }, [data, searchTerm, showSearch, searchFilter, sortConfig, columns])

  // Calcular paginação
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredAndSortedData.slice(startIndex, endIndex)

  // Resetar para página 1 quando filtrar
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Gerar itens de paginação
  const getPaginationItems = () => {
    const items = []
    const maxVisible = 7 // Número máximo de páginas visíveis

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i)
      }
    } else {
      // Sempre mostrar primeira página
      items.push(1)

      if (currentPage > 3) {
        items.push('ellipsis-start')
      }

      // Páginas ao redor da página atual
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        items.push(i)
      }

      if (currentPage < totalPages - 2) {
        items.push('ellipsis-end')
      }

      // Sempre mostrar última página
      items.push(totalPages)
    }

    return items
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="table-component">
      {showSearch && (
        <div className="table-search mb-3">
          <Form.Control
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ maxWidth: 320 }}
          />
        </div>
      )}

      <BTable
        responsive={responsive}
        hover={hover}
        striped={striped}
        className={`mb-3 ${className}`}
      >
        <thead className={`table-${headerVariant}`}>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{
                  width: col.width,
                  cursor: col.sortable ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
                className={`${col.className || ''} ${col.sortable ? 'sortable-header' : ''}`}
                onClick={() => col.sortable && handleSort(col.key, col.sortType)}
              >
                <div className="d-flex align-items-center gap-2" style={{ 
                  justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start'
                }}>
                  <span>{col.label}</span>
                  {col.sortable && (
                    <span className="sort-indicator">
                      {sortConfig.key === col.key ? (
                        sortConfig.direction === 'asc' ? '▲' : '▼'
                      ) : (
                        <span style={{ opacity: 0.3 }}>⇅</span>
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-muted py-4">
                {searchTerm ? noResultsMessage : emptyMessage}
              </td>
            </tr>
          ) : (
            currentData.map((row, rowIdx) => (
              <tr key={row.id || rowIdx}>
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    style={{ textAlign: col.align }}
                    className={col.className}
                  >
                    {col.render ? col.render(row, rowIdx + startIndex) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </BTable>

      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted small">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredAndSortedData.length)} de {filteredAndSortedData.length} registros
          </div>
          <Pagination className="mb-0">
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />

            {getPaginationItems().map((item, idx) => {
              if (item === 'ellipsis-start' || item === 'ellipsis-end') {
                return <Pagination.Ellipsis key={item} disabled />
              }
              return (
                <Pagination.Item
                  key={item}
                  active={item === currentPage}
                  onClick={() => handlePageChange(item)}
                >
                  {item}
                </Pagination.Item>
              )
            })}

            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
    </div>
  )
}
