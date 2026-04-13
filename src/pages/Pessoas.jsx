import { useState, useEffect } from 'react'
import { Container, Card, Button, Modal, Form } from 'react-bootstrap'
import Table from '../components/Table/Table'
import api from '../utils/api'

export default function Pessoas() {
  const [pessoas, setPessoas] = useState([])
  const [showModal,   setShowModal]   = useState(false)
  const [showDelete,  setShowDelete]  = useState(false)
  const [editItem,    setEditItem]    = useState(null)
  const [deleteId,    setDeleteId]    = useState(null)
  const [nome,        setNome]        = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get('/Pessoa')
      .then(data => setPessoas(data))
      .catch(() => setPessoas([]))
      .finally(() => setLoading(false))
  }, [])

  const handleOpenAdd = () => {
    setEditItem(null)
    setNome('')
    setShowModal(true)
  }

  const handleOpenEdit = (p) => {
    setEditItem(p)
    setNome(p.nome)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!nome.trim()) return
    setLoading(true)
    if (editItem) {
      // Edição
      api.put(`/Pessoa/${editItem.id}`, { nome: nome.trim() })
        .then(pessoaAtualizada => {
          setPessoas(prev =>
            prev.map(p => p.id === pessoaAtualizada.id ? pessoaAtualizada : p)
          )
          setShowModal(false)
          setNome('')
          setEditItem(null)
        })
        .catch(error => {
          console.error('Erro ao editar pessoa:', error)
          alert('Erro ao salvar. Tente novamente.')
        })
        .finally(() => setLoading(false))
    } else {
      // Cadastro
      api.post('/Pessoa', { nome: nome.trim() })
        .then(novaPessoa => {
          setPessoas(prev => [...prev, novaPessoa])
          setShowModal(false)
          setNome('')
        })
        .catch(error => {
          console.error('Erro ao cadastrar pessoa:', error)
          alert('Erro ao salvar. Tente novamente.')
        })
        .finally(() => setLoading(false))
    }
  }

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setShowDelete(true)
  }

  const handleDeleteConfirm = () => {
    if (!deleteId) return
    setLoading(true)
    api.delete(`/Pessoa/${deleteId}`)
      .then(() => {
        setPessoas(prev => prev.filter(p => p.id !== deleteId))
        setShowDelete(false)
        setDeleteId(null)
      })
      .catch(error => {
        console.error('Erro ao excluir pessoa:', error)
        alert('Erro ao excluir. Verifique se não há registros vinculados.')
        setShowDelete(false)
        setDeleteId(null)
      })
      .finally(() => setLoading(false))
  }

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
      sortable: true,
      sortType: 'string',
      render: (row) => <span className="fw-semibold">{row.nome}</span>
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
          <i className="bi bi-people-fill me-2 text-primary"></i>Pessoas
        </h4>
        <Button variant="primary" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-2"></i>Nova Pessoa
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center text-muted py-4">Carregando...</div>
          ) : (
            <Table
              columns={columns}
              data={pessoas}
              showSearch={true}
              searchFilter={(item, term) => item.nome.toLowerCase().includes(term)}
              emptyMessage="Nenhuma pessoa cadastrada."
              noResultsMessage="Nenhuma pessoa encontrada."
              itemsPerPage={15}
            />
          )}
        </Card.Body>
        <Card.Footer className="text-muted small">
          {pessoas.length} pessoa(s) cadastrada(s)
        </Card.Footer>
      </Card>

      {/* Modal Add/Edit */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editItem ? 'Editar Pessoa' : 'Nova Pessoa'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nome <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Nome completo"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={!nome.trim() || loading}>
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
            Tem certeza que deseja excluir a pessoa <strong>{pessoas.find(p => p.id === deleteId)?.nome}</strong>?
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
