import { useState, useMemo, useEffect } from 'react'
import { Container, Card, Table, Button, Modal, Form, Row, Col } from 'react-bootstrap'
import { MESES, ANOS, getMesLabel, formatCurrency } from '../utils/constants'

const API_BASE = 'http://localhost:5107/api'

const defaultForm = () => ({
  pessoaId: '',
  valor: '',
  mes: new Date().getMonth() + 1,
  ano: new Date().getFullYear(),
})

export default function Salarios() {
  const [pessoas,  setPessoas]  = useState([])
  const [salarios, setSalarios] = useState([])

  const fetchSalarios = () => {
    fetch(`${API_BASE}/Receita/consultar`)
      .then(res => res.json())
      .then(data => setSalarios(data))
      .catch(() => setSalarios([]))
  }

  useEffect(() => {
    fetchSalarios()

    fetch(`${API_BASE}/Pessoa`)
      .then(res => res.json())
      .then(data => setPessoas(data))
      .catch(() => setPessoas([]))
  }, [])

  const [filtroPessoa, setFiltroPessoa] = useState('')
  const [filtroMes,    setFiltroMes]    = useState('')
  const [filtroAno,    setFiltroAno]    = useState(String(new Date().getFullYear()))

  const [showModal,   setShowModal]   = useState(false)
  const [showDelete,  setShowDelete]  = useState(false)
  const [editItem,    setEditItem]    = useState(null)
  const [deleteId,    setDeleteId]    = useState(null)
  const [formData,    setFormData]    = useState(defaultForm())
  const [saving,      setSaving]      = useState(false)
  const [saveError,   setSaveError]   = useState('')

  const filteredSalarios = useMemo(() =>
    salarios
      .filter(s => {
        if (filtroPessoa && s.pessoaId !== filtroPessoa) return false
        if (filtroMes    && s.mes      !== Number(filtroMes))    return false
        if (filtroAno    && s.ano      !== Number(filtroAno))    return false
        return true
      })
      .sort((a, b) => a.ano !== b.ano ? a.ano - b.ano : a.mes - b.mes),
    [salarios, filtroPessoa, filtroMes, filtroAno]
  )

  const totalFiltrado = filteredSalarios.reduce((s, r) => s + r.valor, 0)
  const getPessoaNome = (s) => s.nomePessoa || pessoas.find(p => p.id === s.pessoaId)?.nome || '-'

  const handleOpenAdd = () => {
    setEditItem(null)
    setFormData(defaultForm())
    setSaveError('')
    setShowModal(true)
  }

  const handleOpenEdit = (item) => {
    setEditItem(item)
    setFormData({ pessoaId: item.pessoaId, valor: item.valor, mes: item.mes, ano: item.ano })
    setSaveError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.pessoaId || !formData.valor) return
    const data = {
      pessoaId: formData.pessoaId,
      valor:    Number(formData.valor),
      mes:      Number(formData.mes),
      ano:      Number(formData.ano),
    }

    if (editItem) {
      setSaving(true)
      setSaveError('')
      try {
        const res = await fetch(`${API_BASE}/Receita/alterar/${editItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error(`Erro ${res.status}`)
        const result = await res.json()
        setSalarios(prev => prev.map(s => s.id === editItem.id ? result : s))
        setShowModal(false)
        fetchSalarios()
      } catch (err) {
        setSaveError('Falha ao salvar. Verifique a conexão e tente novamente.')
      } finally {
        setSaving(false)
      }
      return
    }

    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch(`${API_BASE}/Receita/criar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const result = await res.json()
      setSalarios(prev => [...prev, result])
      setShowModal(false)
      fetchSalarios()
    } catch (err) {
      setSaveError('Falha ao salvar. Verifique a conexão e tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setShowDelete(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`${API_BASE}/Receita/excluir/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      setSalarios(prev => prev.filter(s => s.id !== deleteId))
    } catch (err) {
      // silently keep the item in list if deletion fails
    } finally {
      setShowDelete(false)
      setDeleteId(null)
    }
  }

  const set = (field) => (e) => setFormData(f => ({ ...f, [field]: e.target.value }))

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-cash-coin me-2 text-success"></i>Receitas / Salários
        </h4>
        <Button variant="success" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-2"></i>Novo Lançamento
        </Button>
      </div>

      {/* Filtros */}
      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Row className="g-3">
            <Col xs={12} md={4}>
              <Form.Label className="fw-semibold">Pessoa</Form.Label>
              <Form.Select value={filtroPessoa} onChange={e => setFiltroPessoa(e.target.value)}>
                <option value="">Todas as pessoas</option>
                {pessoas.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </Form.Select>
            </Col>
            <Col xs={12} md={4}>
              <Form.Label className="fw-semibold">Mês</Form.Label>
              <Form.Select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
                <option value="">Todos os meses</option>
                {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </Form.Select>
            </Col>
            <Col xs={12} md={4}>
              <Form.Label className="fw-semibold">Ano</Form.Label>
              <Form.Select value={filtroAno} onChange={e => setFiltroAno(e.target.value)}>
                <option value="">Todos os anos</option>
                {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Totalizador */}
      <Card className="shadow-sm mb-3" style={{ borderLeft: '4px solid #198754' }}>
        <Card.Body className="d-flex justify-content-between align-items-center py-2">
          <span className="text-muted small">Total filtrado ({filteredSalarios.length} lançamento(s)):</span>
          <span className="fs-5 fw-bold text-success">{formatCurrency(totalFiltrado)}</span>
        </Card.Body>
      </Card>

      {/* Tabela */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-dark">
              <tr>
                <th>Pessoa</th>
                <th>Mês</th>
                <th>Ano</th>
                <th className="text-end">Valor</th>
                <th style={{ width: 100 }} className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    Nenhum lançamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredSalarios.map(s => (
                  <tr key={s.id}>
                    <td className="fw-semibold">{getPessoaNome(s)}</td>
                    <td>{getMesLabel(s.mes)}</td>
                    <td>{s.ano}</td>
                    <td className="text-success fw-bold text-end">{formatCurrency(s.valor)}</td>
                    <td className="text-center">
                      <Button variant="outline-warning" size="sm" className="me-1" onClick={() => handleOpenEdit(s)}>
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(s.id)}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal Add/Edit */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-cash-coin me-2 text-success"></i>
            {editItem ? 'Editar Receita' : 'Novo Lançamento de Receita'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {saveError && <div className="alert alert-danger py-2 mb-3">{saveError}</div>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Pessoa <span className="text-danger">*</span></Form.Label>
              <Form.Select value={formData.pessoaId} onChange={set('pessoaId')}>
                <option value="">Selecione uma pessoa...</option>
                {pessoas.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col xs={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mês <span className="text-danger">*</span></Form.Label>
                  <Form.Select value={formData.mes} onChange={set('mes')}>
                    {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ano <span className="text-danger">*</span></Form.Label>
                  <Form.Select value={formData.ano} onChange={set('ano')}>
                    {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Valor (R$) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={set('valor')}
                placeholder="0,00"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancelar</Button>
          <Button
            variant="success"
            onClick={handleSave}
            disabled={saving || !formData.pessoaId || !formData.valor || Number(formData.valor) <= 0}
          >
            {saving
              ? <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Salvando...</>
              : <><i className="bi bi-check-lg me-1"></i>Salvar</>}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Confirmar Exclusão */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir este lançamento de receita?
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
