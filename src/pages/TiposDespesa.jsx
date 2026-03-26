import { useState, useEffect } from 'react'
import { Container, Card, Table, Button, Modal, Form, Badge } from 'react-bootstrap'
import { apiRequest } from '../utils/api'

export default function TiposDespesa() {
  const [tiposDespesa, setTiposDespesa] = useState([])

  const [showModal,  setShowModal]  = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const [deleteId,   setDeleteId]   = useState(null)
  const [nome,       setNome]       = useState('')
  const [busca,      setBusca]      = useState('')

  const fetchTipos = async () => {
    try {
      const data = await apiRequest('/TipoDespesa/com-quantidade')
      setTiposDespesa(data || [])
    } catch (error) {
      console.error('Erro ao carregar tipos de despesa:', error)
      setTiposDespesa([])
    }
  }

  useEffect(() => {
    fetchTipos()
  }, [])

  const handleOpenAdd = () => {
    setEditItem(null)
    setNome('')
    setShowModal(true)
  }

  const handleOpenEdit = (t) => {
    setEditItem(t)
    setNome(t.nome)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!nome.trim()) return
    try {
      if (editItem) {
        // Edição
        await apiRequest(`/TipoDespesa/${editItem.id}`, {
          method: 'PUT',
          body: { nome: nome.trim() }
        })
      } else {
        // Cadastro
        await apiRequest('/TipoDespesa', {
          method: 'POST',
          body: { nome: nome.trim() }
        })
      }
      // Recarrega a lista com as quantidades atualizadas
      await fetchTipos()
      setShowModal(false)
      setNome('')
      setEditItem(null)
    } catch (error) {
      console.error('Erro ao salvar tipo de despesa:', error)
      alert('Erro ao salvar. Tente novamente.')
    }
  }

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setShowDelete(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    try {
      await apiRequest(`/TipoDespesa/${deleteId}`, {
        method: 'DELETE'
      })
      setTiposDespesa(prev => prev.filter(t => t.id !== deleteId))
      setShowDelete(false)
      setDeleteId(null)
    } catch (error) {
      console.error('Erro ao excluir tipo de despesa:', error)
      alert('Erro ao excluir. Verifique se não há despesas vinculadas.')
      setShowDelete(false)
      setDeleteId(null)
    }
  }

  const getUsoCount = (id) => {
    const tipo = tiposDespesa.find(t => t.id === id)
    return tipo?.quantidadeDespesas ?? 0
  }

  const tiposFiltrados = tiposDespesa.filter(t =>
    t.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-tags-fill me-2 text-primary"></i>Tipos de Despesa
        </h4>
        <Button variant="primary" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-2"></i>Novo Tipo
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <Form.Control
            placeholder="Buscar por nome..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ maxWidth: 320 }}
          />
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-dark">
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th>Nome do Tipo</th>
                <th className="text-center">Qtd. de Lançamentos</th>
                <th style={{ width: 120 }} className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tiposFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    {busca ? 'Nenhum tipo encontrado.' : 'Nenhum tipo cadastrado.'}
                  </td>
                </tr>
              ) : (
                tiposFiltrados.map((t, idx) => {
                  const count = getUsoCount(t.id)
                  return (
                    <tr key={t.id}>
                      <td className="text-muted">{idx + 1}</td>
                      <td className="fw-semibold">
                        <i className="bi bi-tag-fill me-2 text-secondary"></i>{t.nome}
                      </td>
                      <td className="text-center">
                        <Badge bg={count > 0 ? 'warning' : 'secondary'} text={count > 0 ? 'dark' : 'white'}>
                          {count} compra(s)
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Button variant="outline-warning" size="sm" className="me-1" onClick={() => handleOpenEdit(t)}>
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(t.id)}>
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer className="text-muted small">
          {tiposDespesa.length} tipo(s) cadastrado(s)
        </Card.Footer>
      </Card>

      {/* Modal Add/Edit */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editItem ? 'Editar Tipo' : 'Novo Tipo de Despesa'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nome <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Ex.: Alimentação, Transporte..."
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={!nome.trim()}>
            <i className="bi bi-check-lg me-1"></i>Salvar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Confirmar Exclusão */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            Tem certeza que deseja excluir o tipo <strong>{tiposDespesa.find(t => t.id === deleteId)?.nome}</strong>?
          </p>
          {deleteId && getUsoCount(deleteId) > 0 && (
            <div className="alert alert-warning mt-3 mb-0 py-2 small">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Este tipo possui {getUsoCount(deleteId)} lançamento(s) vinculado(s).
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            <i className="bi bi-trash me-1"></i>Excluir
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
