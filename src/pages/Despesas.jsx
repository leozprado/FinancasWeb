import { useState, useMemo, useEffect } from 'react'
import { Container, Card, Button, Modal, Form, Row, Col, Badge, Alert } from 'react-bootstrap'
import TableComponent from '../components/Table/Table'
import { useData } from '../context/DataContext'
import { MESES, ANOS, getMesLabel, formatCurrency } from '../utils/constants'
import api from '../utils/api'

const defaultForm = () => ({
  pessoaId:     '',
  tipoDespesaId: '',
  loja:          '',
  valor:         '',
  parcelas:      1,
  mes:           new Date().getMonth() + 1,
  ano:           new Date().getFullYear(),
  observacao:    '',
})

const NOW_MES_ANO = new Date().getFullYear() * 12 + (new Date().getMonth() + 1)

const contarParcelasPagas = (despesa, refMesAno = NOW_MES_ANO) => {
  if (!despesa.parcelas?.length) return 0
  const mesIdx = MESES.findIndex(m => m.label === despesa.mesPrimeiraParcela)
  if (mesIdx === -1) return 0
  const firstMesAno = despesa.anoPrimeiraParcela * 12 + (mesIdx + 1)
  return despesa.parcelas.filter((_, i) => firstMesAno + i <= refMesAno).length
}

const getParcelasRestantes = (despesa) => {
  if (!despesa.parcelas?.length) return []
  const mesIdx = MESES.findIndex(m => m.label === despesa.mesPrimeiraParcela)
  if (mesIdx === -1) return []
  const pagas = contarParcelasPagas(despesa)
  return Array.from({ length: despesa.parcelas.length - pagas }, (_, i) => {
    const j = pagas + i
    return {
      mesLabel: MESES[(mesIdx + j) % 12].label,
      ano: despesa.anoPrimeiraParcela + Math.floor((mesIdx + j) / 12)
    }
  })
}

const getTodasParcelas = (despesa) => {
  if (!despesa.parcelas?.length) return []
  const mesIdx = MESES.findIndex(m => m.label === despesa.mesPrimeiraParcela)
  if (mesIdx === -1) return []
  return Array.from({ length: despesa.parcelas.length }, (_, i) => ({
    mesLabel: MESES[(mesIdx + i) % 12].label,
    ano: despesa.anoPrimeiraParcela + Math.floor((mesIdx + i) / 12)
  }))
}

export default function Despesas() {
  const { pessoas, tiposDespesa, addDespesa, deleteDespesa } = useData()

  const [despesas, setDespesas] = useState([])
  const [pessoasApi,      setPessoasApi]      = useState([])
  const [tiposDespesaApi, setTiposDespesaApi] = useState([])

  const fetchDespesas = () => {
    api.get('/Despesas')
      .then(data => setDespesas(data))
      .catch(() => setDespesas([]))
  }

  useEffect(() => {
    fetchDespesas()

    api.get('/Pessoa')
      .then(data => setPessoasApi(data))
      .catch(() => setPessoasApi([]))

    api.get('/TipoDespesa')
      .then(data => setTiposDespesaApi(data))
      .catch(() => setTiposDespesaApi([]))
  }, [])

  const [filtroPessoa, setFiltroPessoa] = useState('')
  const [filtroTipo,   setFiltroTipo]   = useState('')
  const [filtroMes,    setFiltroMes]    = useState(MESES[new Date().getMonth()].label)
  const [filtroAno,    setFiltroAno]    = useState(String(new Date().getFullYear()))

  const [showModal,     setShowModal]     = useState(false)
  const [showDelete,    setShowDelete]    = useState(false)
  const [editItem,      setEditItem]      = useState(null)
  const [deleteId,      setDeleteId]      = useState(null)
  const [deletarTodas,  setDeletarTodas]  = useState(false)
  const [formData,      setFormData]      = useState(defaultForm())
  const [alertMsg,      setAlertMsg]      = useState({ show: false, type: '', message: '' })

  // ── Valores únicos para filtros ────────────────────────────────
  const pessoasUnicas = useMemo(() => [...new Set(despesas.map(d => d.nomePessoa))].sort(), [despesas])
  const tiposUnicos   = useMemo(() => [...new Set(despesas.map(d => d.nomeTipoDespesa))].sort(), [despesas])
  const anosUnicos    = useMemo(() => { const s = new Set(); despesas.forEach(d => getTodasParcelas(d).forEach(p => s.add(p.ano)));    return [...s].sort() }, [despesas])

  // ── Filtrar ────────────────────────────────────────────────────
  const filteredDespesas = useMemo(() =>
    despesas
      .filter(d => {
        if (filtroPessoa && d.nomePessoa          !== filtroPessoa)     return false
        if (filtroTipo   && d.nomeTipoDespesa     !== filtroTipo)       return false
        if (filtroMes || filtroAno) {
          const temParcela = getTodasParcelas(d).some(p =>
            (!filtroMes || p.mesLabel === filtroMes) &&
            (!filtroAno || p.ano === Number(filtroAno))
          )
          if (!temParcela) return false
        }
        return true
      })
      .sort((a, b) => {
        if (a.anoPrimeiraParcela !== b.anoPrimeiraParcela) return a.anoPrimeiraParcela - b.anoPrimeiraParcela
        return a.mesPrimeiraParcela.localeCompare(b.mesPrimeiraParcela)
      }),
    [despesas, filtroPessoa, filtroTipo, filtroMes, filtroAno]
  )

  const totalFiltrado = filteredDespesas.reduce((s, d) => s + (d.parcelas?.[0]?.valor ?? 0), 0)

  // Referência de data para cálculo de parcelas pagas: usa o filtro quando disponível
  const refMesAnoFiltro = useMemo(() => {
    if (filtroMes || filtroAno) {
      const mesIdx = filtroMes ? MESES.findIndex(m => m.label === filtroMes) : 11
      const mes = filtroMes ? mesIdx + 1 : 12
      const ano = filtroAno ? Number(filtroAno) : new Date().getFullYear()
      return ano * 12 + mes
    }
    return NOW_MES_ANO
  }, [filtroMes, filtroAno])

  // ── Limpar filtros ─────────────────────────────────────────────
  const limparFiltros = () => {
    setFiltroPessoa('')
    setFiltroTipo('')
    setFiltroMes('')
    setFiltroAno('')
  }

  // ── Form helpers ───────────────────────────────────────────────
  const set = (field) => (e) => setFormData(f => ({ ...f, [field]: e.target.value }))

  const handleValorChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '')
    const numeric = (parseInt(digits || '0', 10) / 100).toFixed(2)
    setFormData(f => ({ ...f, valor: numeric === '0.00' ? '' : numeric }))
  }

  const formatValorDisplay = (val) => {
    if (!val) return ''
    const num = parseFloat(val)
    if (isNaN(num)) return ''
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleOpenAdd = () => {
    setEditItem(null)
    setFormData(defaultForm())
    setShowModal(true)
  }

  const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const handleOpenEdit = (d) => {
    const mesNum = mesesNomes.indexOf(d.mesPrimeiraParcela) + 1
    setEditItem(d)
    setFormData({
      pessoaId:      d.pessoaId      ?? '',
      tipoDespesaId: d.tipoDespesaId ?? '',
      loja:          d.loja,
      valor:         String(d.valorTotal),
      parcelas:      d.parcelas?.length ?? 1,
      mes:           mesNum || new Date().getMonth() + 1,
      ano:           d.anoPrimeiraParcela,
      observacao:    d.observacao || '',
    })
    setShowModal(true)
  }

  const handleSave = () => {
    const {
      pessoaId,
      tipoDespesaId,
      loja,
      valor,
      parcelas,
      mes,
      ano,
      observacao
    } = formData;

    if (!pessoaId || !tipoDespesaId || !loja.trim() || !valor || Number(valor) <= 0) return;

    const mesPrimeiraParcela = mesesNomes[Number(mes) - 1];

    const payload = {
      loja: loja.trim(),
      valorTotal: Number(valor),
      quantidadeParcelas: Number(parcelas),
      mesPrimeiraParcela,
      anoPrimeiraParcela: Number(ano),
      observacao: observacao || '',
      pessoaId,
      tipoDespesaId
    };

    const request = editItem
      ? api.put(`/Despesas/atualizar/${editItem.id}`, payload)
      : api.post('/Despesas/cadastrar', payload);

    request
      .then(() => {
        setShowModal(false);
        setEditItem(null);
        fetchDespesas();
        setAlertMsg({
          show: true,
          type: 'success',
          message: editItem
            ? 'Despesa atualizada com sucesso!'
            : `Despesa cadastrada com sucesso! ${Number(parcelas) > 1 ? `${parcelas} parcelas lançadas.` : ''}`
        });
        setTimeout(() => setAlertMsg({ show: false, type: '', message: '' }), 5000);
      })
      .catch(error => {
        console.error('Erro ao salvar despesa:', error);
        setAlertMsg({
          show: true,
          type: 'danger',
          message: 'Erro ao salvar despesa. Tente novamente.'
        });
        setTimeout(() => setAlertMsg({ show: false, type: '', message: '' }), 5000);
      });
  }

  // ── Exclusão ───────────────────────────────────────────────────
  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setDeletarTodas(false)
    setShowDelete(true)
  }

  const handleDeleteConfirm = () => {
    api.delete(`/Despesas/excluir/${deleteId}`)
      .then(() => {
        setShowDelete(false)
        setDeleteId(null)
        fetchDespesas()
        setAlertMsg({
          show: true,
          type: 'success',
          message: 'Despesa excluída com sucesso!'
        })
        setTimeout(() => setAlertMsg({ show: false, type: '', message: '' }), 5000)
      })
      .catch(() => {
        setAlertMsg({
          show: true,
          type: 'danger',
          message: 'Erro ao excluir despesa. Tente novamente.'
        })
        setTimeout(() => setAlertMsg({ show: false, type: '', message: '' }), 5000)
      })
  }

  const despesaParaDeletar = deleteId ? despesas.find(d => d.id === deleteId) : null

  // ── Informações sobre a compra parcelada (preview no form) ─────
  const totalCompra   = Number(formData.valor)
  const valorParcela  = Number(formData.valor) / Number(formData.parcelas)
  const isParcelado   = Number(formData.parcelas) > 1

  // Gera preview das parcelas
  const previewParcelas = useMemo(() => {
    if (!formData.mes || !formData.ano || !formData.parcelas) return []
    return Array.from({ length: Math.min(Number(formData.parcelas), 12) }, (_, i) => {
      const totalMonths = (Number(formData.mes) - 1) + i
      const m = (totalMonths % 12) + 1
      const y = Number(formData.ano) + Math.floor(totalMonths / 12)
      return `${getMesLabel(m)}/${y}`
    })
  }, [formData.mes, formData.ano, formData.parcelas])

  const isFormValid = formData.pessoaId && formData.tipoDespesaId && formData.loja.trim() && Number(formData.valor) > 0

  const columns = useMemo(() => [
    {
      key: 'nomePessoa',
      label: 'Pessoa',
      sortable: true,
      sortType: 'string',
      render: (d) => <span className="fw-semibold">{d.nomePessoa}</span>
    },
    {
      key: 'nomeTipoDespesa',
      label: 'Tipo',
      render: (d) => <Badge bg="secondary" style={{ fontWeight: 400 }}>{d.nomeTipoDespesa}</Badge>
    },
    { key: 'loja', label: 'Loja', sortable: true, sortType: 'string' },
    {
      key: 'valorParcela',
      label: 'Valor Parcela',
      align: 'right',
      sortable: true,
      sortType: 'number',
      render: (d) => formatCurrency(d.parcelas?.[0]?.valor ?? 0)
    },
    {
      key: 'parcelas',
      label: 'Parcelas',
      align: 'center',
      render: (d) => {
        const total = d.parcelas?.length ?? 0
        if (total <= 1) return <Badge bg="success" text="white">À vista</Badge>
        const pagas = contarParcelasPagas(d, refMesAnoFiltro)
        return (
          <Badge bg={pagas >= total ? 'success' : 'warning'} text={pagas >= total ? 'white' : 'dark'}>
            {pagas}/{total}
          </Badge>
        )
      }
    },
    { key: 'mesPrimeiraParcela', label: 'Mês' },
    { key: 'anoPrimeiraParcela', label: 'Ano', sortable: true, sortType: 'number' },
    {
      key: 'observacao',
      label: 'Observação',
      render: (d) => (
        <span className="text-muted" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
          {d.observacao || '—'}
        </span>
      )
    },
    {
      key: 'acoes',
      label: 'Ações',
      align: 'center',
      width: 110,
      render: (d) => (
        <>
          <Button variant="outline-warning" size="sm" className="me-1" onClick={() => handleOpenEdit(d)} title="Editar">
            <i className="bi bi-pencil"></i>
          </Button>
          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(d.id)} title="Excluir">
            <i className="bi bi-trash"></i>
          </Button>
        </>
      )
    },
  ], [refMesAnoFiltro])

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-credit-card-fill me-2 text-danger"></i>Controle de Despesas
        </h4>
        <Button variant="danger" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-2"></i>Nova Despesa
        </Button>
      </div>

      {/* Mensagem de Feedback */}
      {alertMsg.show && (
        <Alert 
          variant={alertMsg.type} 
          dismissible 
          onClose={() => setAlertMsg({ show: false, type: '', message: '' })}
          className="mb-3"
        >
          <div className="d-flex align-items-center">
            <i className={`bi bi-${alertMsg.type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2`}></i>
            {alertMsg.message}
          </div>
        </Alert>
      )}

      {/* Filtros */}
      <Card className="shadow-sm mb-3">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center py-2">
          <span className="fw-semibold small">
            <i className="bi bi-funnel me-2 text-muted"></i>Filtros
          </span>
          <Button variant="link" size="sm" className="text-muted p-0" onClick={limparFiltros}>
            Limpar filtros
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col xs={12} md={3}>
              <Form.Label className="fw-semibold">Pessoa</Form.Label>
              <Form.Select value={filtroPessoa} onChange={e => setFiltroPessoa(e.target.value)}>
                <option value="">Todas as pessoas</option>
                {pessoasUnicas.map(nome => <option key={nome} value={nome}>{nome}</option>)}
              </Form.Select>
            </Col>
            <Col xs={12} md={3}>
              <Form.Label className="fw-semibold">Tipo</Form.Label>
              <Form.Select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                <option value="">Todos os tipos</option>
                {tiposDespesaApi.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
              </Form.Select>
            </Col>
            <Col xs={12} md={3}>
              <Form.Label className="fw-semibold">Mês</Form.Label>
              <Form.Select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
                <option value="">Todos os meses</option>
                {MESES.map(m => <option key={m.value} value={m.label}>{m.label}</option>)}
              </Form.Select>
            </Col>
            <Col xs={12} md={3}>
              <Form.Label className="fw-semibold">Ano</Form.Label>
              <Form.Select value={filtroAno} onChange={e => setFiltroAno(e.target.value)}>
                <option value="">Todos os anos</option>
                {anosUnicos.map(a => <option key={a} value={a}>{a}</option>)}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Totalizador */}
      <Card className="shadow-sm mb-3" style={{ borderLeft: '4px solid #dc3545' }}>
        <Card.Body className="d-flex justify-content-between align-items-center py-2">
          <span className="text-muted small">Total filtrado ({filteredDespesas.length} lançamento(s)):</span>
          <span className="fs-5 fw-bold text-danger">{formatCurrency(totalFiltrado)}</span>
        </Card.Body>
      </Card>

      {/* Tabela */}
      <Card className="shadow-sm">
        <Card.Body>
          <TableComponent
            columns={columns}
            data={filteredDespesas}
            itemsPerPage={15}
            emptyMessage="Nenhuma despesa encontrada para os filtros selecionados."
          />
        </Card.Body>
      </Card>

      {/* ── Modal Nova Despesa ──────────────────────────────────── */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setEditItem(null) }} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className={`bi bi-${editItem ? 'pencil-square' : 'credit-card'} me-2 text-danger`}></i>
            {editItem ? 'Editar Despesa' : 'Nova Despesa'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Label>Pessoa <span className="text-danger">*</span></Form.Label>
                <Form.Select value={formData.pessoaId} onChange={set('pessoaId')}>
                  <option value="">Selecione...</option>
                  {pessoasApi.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </Form.Select>
              </Col>

              <Col xs={12} md={6}>
                <Form.Label>Tipo de Despesa <span className="text-danger">*</span></Form.Label>
                <Form.Select value={formData.tipoDespesaId} onChange={set('tipoDespesaId')}>
                  <option value="">Selecione...</option>
                  {tiposDespesaApi.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </Form.Select>
              </Col>

              <Col xs={12} md={6}>
                <Form.Label>Loja / Estabelecimento <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={formData.loja}
                  onChange={set('loja')}
                  placeholder="Ex.: Supermercado Extra"
                />
              </Col>

              <Col xs={12} md={6}>
                <Form.Label>Valor Total (R$) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={formatValorDisplay(formData.valor)}
                  onChange={handleValorChange}
                  placeholder="R$ 0,00"
                  inputMode="numeric"
                />
              </Col>

              <Col xs={12} md={4}>
                <Form.Label>Nº de Parcelas</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="60"
                  value={formData.parcelas}
                  onChange={set('parcelas')}
                />
              </Col>

              <Col xs={12} md={4}>
                <Form.Label>Mês da 1ª Parcela <span className="text-danger">*</span></Form.Label>
                <Form.Select value={formData.mes} onChange={set('mes')}>
                  {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </Form.Select>
              </Col>

              <Col xs={12} md={4}>
                <Form.Label>Ano <span className="text-danger">*</span></Form.Label>
                <Form.Select value={formData.ano} onChange={set('ano')}>
                  {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
                </Form.Select>
              </Col>

              <Col xs={12}>
                <Form.Label>Observação</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.observacao}
                  onChange={set('observacao')}
                  placeholder="Observações adicionais..."
                />
              </Col>
            </Row>

            {/* Preview das parcelas */}
            {Number(formData.valor) > 0 && (
              <Alert
                variant={isParcelado ? 'warning' : 'info'}
                className="mt-3 mb-0 py-2 small"
              >
                <i className={`bi bi-${isParcelado ? 'calendar3' : 'check-circle'} me-2`}></i>
                {isParcelado ? (
                  <>
                    Compra parcelada em <strong>{formData.parcelas}x</strong> de{' '}
                    <strong>{formatCurrency(valorParcela)}</strong> = total{' '}
                    <strong>{formatCurrency(totalCompra)}</strong>
                    <br />
                    Meses de lançamento: {previewParcelas.join(' · ')}
                    {Number(formData.parcelas) > 12 && ' · ...'}
                  </>
                ) : (
                  <>Compra à vista de <strong>{formatCurrency(totalCompra)}</strong> em{' '}
                    {getMesLabel(formData.mes)}/{formData.ano}</>
                )}
              </Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowModal(false); setEditItem(null) }}>Cancelar</Button>
          <Button variant="danger" onClick={handleSave} disabled={!isFormValid}>
            <i className="bi bi-check-lg me-1"></i>
            {editItem ? 'Salvar alterações' : (isParcelado ? `Lançar ${formData.parcelas} parcelas` : 'Salvar')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Modal Confirmar Exclusão ────────────────────────────── */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza que deseja excluir esta despesa?</p>
          {despesaParaDeletar && despesaParaDeletar.parcelas?.length > 1 && (
            <>
              <Alert variant="warning" className="py-2 small">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Esta despesa possui <strong>{despesaParaDeletar.parcelas.length} parcela(s)</strong>{' '}
                de <strong>{despesaParaDeletar.loja}</strong>.
              </Alert>
              <Form.Check
                type="checkbox"
                id="deletarTodas"
                label={`Excluir todas as ${despesaParaDeletar.parcelas.length} parcelas desta compra`}
                checked
                disabled
              />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            <i className="bi bi-trash me-1"></i>
            {deletarTodas ? `Excluir todas as ${despesaParaDeletar?.parcelas?.length ?? ''} parcelas` : 'Excluir esta despesa'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}


