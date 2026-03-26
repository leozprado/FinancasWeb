import { useState, useEffect } from 'react'
import { Container, Card, Table, Button, Modal, Form, Badge } from 'react-bootstrap'

export default function Pessoas() {
  const [pessoas, setPessoas] = useState([])
  const [showModal,   setShowModal]   = useState(false)
  const [showDelete,  setShowDelete]  = useState(false)
  const [editItem,    setEditItem]    = useState(null)
  const [deleteId,    setDeleteId]    = useState(null)
  const [nome,        setNome]        = useState('')
  const [busca,       setBusca]       = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('http://localhost:5107/api/Pessoa')
      .then(res => res.json())
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
      fetch(`http://localhost:5107/api/Pessoa/${editItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim() })
      })
        .then(res => res.json())
        .then(pessoaAtualizada => {
          setPessoas(prev =>
            prev.map(p => p.id === pessoaAtualizada.id ? pessoaAtualizada : p)
          )
          setShowModal(false)
          setNome('')
          setEditItem(null)
        })
        .finally(() => setLoading(false))
    } else {
      // Cadastro
      fetch('http://localhost:5107/api/Pessoa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim() })
      })
        .then(res => res.json())
        .then(novaPessoa => {
          setPessoas(prev => [...prev, novaPessoa])
          setShowModal(false)
          setNome('')
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
    fetch(`http://localhost:5107/api/Pessoa/${deleteId}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (res.ok) {
          setPessoas(prev => prev.filter(p => p.id !== deleteId))
        }
        setShowDelete(false)
        setDeleteId(null)
      })
      .finally(() => setLoading(false))
  }

  // const getUsage = (id) => ({
  //   receitas:  salarios.filter(s => s.pessoaId === id).length,
  //   despesas:  despesas.filter(d => d.pessoaId === id).length,
  // })

  const pessoasFiltradas = pessoas.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )

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
                <th>Nome</th>
                <th style={{ width: 120 }} className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center text-muted py-4">
                    Carregando...
                  </td>
                </tr>
              ) : pessoasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-muted py-4">
                    {busca ? 'Nenhuma pessoa encontrada.' : 'Nenhuma pessoa cadastrada.'}
                  </td>
                </tr>
              ) : (
                pessoasFiltradas.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="text-muted">{idx + 1}</td>
                    <td className="fw-semibold">{p.nome}</td>
                    <td className="text-center">
                      <Button variant="outline-warning" size="sm" className="me-1" onClick={() => handleOpenEdit(p)}>
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(p.id)}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
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
