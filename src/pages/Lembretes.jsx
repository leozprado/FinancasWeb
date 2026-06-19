import { useState, useEffect } from 'react'
import { Container, Card, Button, Modal, Form } from 'react-bootstrap'
import api from '../utils/api'
import Table from '../components/Table/Table'

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Lembretes() {
  const [lembretes, setLembretes] = useState([])

  const [showModal,  setShowModal]  = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const [deleteId,   setDeleteId]   = useState(null)
  const [descricao,  setDescricao]  = useState('')
  const [saving,     setSaving]     = useState(false)

  const fetchLembretes = async () => {
    try {
      const data = await api.get('/Lembrete')
      setLembretes(data || [])
    } catch (error) {
      console.error('Erro ao carregar lembretes:', error)
      setLembretes([])
    }
  }

  useEffect(() => {
    fetchLembretes()
  }, [])

  const handleOpenAdd = () => {
    setEditItem(null)
    setDescricao('')
    setShowModal(true)
  }

  const handleOpenEdit = (l) => {
    setEditItem(l)
    setDescricao(l.descricao)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!descricao.trim()) return
    setSaving(true)
    try {
      if (editItem) {
        // Edição (a data é reatribuída pelo backend)
        await api.put(`/Lembrete/${editItem.id}`, { descricao: descricao.trim() })
      } else {
        // Cadastro (a data é atribuída pelo backend)
        await api.post('/Lembrete', { descricao: descricao.trim() })
      }
      await fetchLembretes()
      setShowModal(false)
      setDescricao('')
      setEditItem(null)
    } catch (error) {
      console.error('Erro ao salvar lembrete:', error)
      alert('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setShowDelete(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/Lembrete/${deleteId}`)
      setLembretes(prev => prev.filter(l => l.id !== deleteId))
      setShowDelete(false)
      setDeleteId(null)
    } catch (error) {
      console.error('Erro ao excluir lembrete:', error)
      alert('Erro ao excluir. Tente novamente.')
      setShowDelete(false)
      setDeleteId(null)
    }
  }

  const columns = [
    {
      key: '#',
      label: '#',
      width: 50,
      render: (row, idx) => <span className="text-muted">{idx + 1}</span>
    },
    {
      key: 'descricao',
      label: 'Descrição',
      sortable: true,
      render: (row) => (
        <>
          <i className="bi bi-bell me-2 text-secondary"></i>
          <span className="fw-semibold">{row.descricao}</span>
        </>
      )
    },
    {
      key: 'data',
      label: 'Data',
      width: 200,
      sortable: true,
      sortType: 'date',
      render: (row) => (
        <span className="text-muted">
          <i className="bi bi-calendar-event me-2"></i>
          {formatDateTime(row.data)}
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
          <Button variant="outline-warning" size="sm" className="me-1" onClick={() => handleOpenEdit(row)}>
            <i className="bi bi-pencil"></i>
          </Button>
          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(row.id)}>
            <i className="bi bi-trash"></i>
          </Button>
        </>
      )
    }
  ]

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-bell-fill me-2 text-primary"></i>Lembretes
        </h4>
        <Button variant="primary" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-2"></i>Novo Lembrete
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table
            columns={columns}
            data={lembretes}
            showSearch={true}
            searchFilter={(item, term) => item.descricao.toLowerCase().includes(term)}
            emptyMessage="Nenhum lembrete cadastrado."
            noResultsMessage="Nenhum lembrete encontrado."
            itemsPerPage={15}
          />
        </Card.Body>
        <Card.Footer className="text-muted small">
          {lembretes.length} lembrete(s) cadastrado(s)
        </Card.Footer>
      </Card>

      {/* Modal Add/Edit */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editItem ? 'Editar Lembrete' : 'Novo Lembrete'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Descrição <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                placeholder="Ex.: Pagar fatura do cartão..."
                autoFocus
              />
              <Form.Text className="text-muted">
                A data é registrada automaticamente ao salvar.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={!descricao.trim() || saving}>
            <i className="bi bi-check-lg me-1"></i>{saving ? 'Salvando...' : 'Salvar'}
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
            Tem certeza que deseja excluir o lembrete <strong>{lembretes.find(l => l.id === deleteId)?.descricao}</strong>?
          </p>
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
