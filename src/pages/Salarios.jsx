import { useState, useMemo, useEffect } from 'react'
import { Container, Card, Button, Modal, Form, Row, Col } from 'react-bootstrap'
import { MESES, ANOS, getMesLabel, formatCurrency } from '../utils/constants'
import Table from '../components/Table/Table'
import api from '../utils/api'

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
    api.get('/Receita/consultar')
      .then(data => setSalarios(data))
      .catch(() => setSalarios([]))
  }

  useEffect(() => {
    fetchSalarios()

    api.get('/Pessoa')
      .then(data => setPessoas(data))
      .catch(() => setPessoas([]))
  }, [])

  const [filtroPessoa, setFiltroPessoa] = useState('')
  const [filtroMes,    setFiltroMes]    = useState(String(new Date().getMonth() + 1))
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
        const result = await api.put(`/Receita/alterar/${editItem.id}`, data)
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
      const result = await api.post('/Receita/criar', data)
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
      await api.delete(`/Receita/excluir/${deleteId}`)
      setSalarios(prev => prev.filter(s => s.id !== deleteId))
    } catch (err) {
      console.error('Erro ao excluir receita:', err)
    } finally {
      setShowDelete(false)
      setDeleteId(null)
    }
  }

  const set = (field) => (e) => setFormData(f => ({ ...f, [field]: e.target.value }))

  const columns = [
    {
      key: 'pessoa',
      label: 'Pessoa',
      render: (row) => <span className="fw-semibold">{getPessoaNome(row)}</span>
    },
    {
      key: 'mes',
      label: 'Mês',
      render: (row) => getMesLabel(row.mes)
    },
    {
      key: 'ano',
      label: 'Ano'
    },
    {
      key: 'valor',
      label: 'Valor',
      align: 'end',
      render: (row) => <span className="text-success fw-bold">{formatCurrency(row.valor)}</span>
    },
    {
      key: 'acoes',
      label: 'Ações',
      width: 100,
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
          <Table
            columns={columns}
            data={filteredSalarios}
            emptyMessage="Nenhum lançamento encontrado para os filtros selecionados."
            itemsPerPage={15}
          />
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
