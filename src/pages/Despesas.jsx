import { useState, useMemo, useEffect } from 'react'
import { Container, Card, Table, Button, Modal, Form, Row, Col, Badge, Alert } from 'react-bootstrap'
import { useData } from '../context/DataContext'
import { MESES, ANOS, getMesLabel, formatCurrency } from '../utils/constants'

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
    fetch('http://localhost:5107/api/Despesas')
      .then(res => res.json())
      .then(data => setDespesas(data))
      .catch(() => setDespesas([]))
  }

  useEffect(() => {
    fetchDespesas()

    fetch('http://localhost:5107/api/Pessoa')
      .then(res => res.json())
      .then(data => setPessoasApi(data))
      .catch(() => setPessoasApi([]))

    fetch('http://localhost:5107/api/TipoDespesa')
      .then(res => res.json())
      .then(data => setTiposDespesaApi(data))
      .catch(() => setTiposDespesaApi([]))
  }, [])

  const [filtroPessoa, setFiltroPessoa] = useState('')
  const [filtroTipo,   setFiltroTipo]   = useState('')
  const [filtroMes,    setFiltroMes]    = useState('')
  const [filtroAno,    setFiltroAno]    = useState(String(new Date().getFullYear()))

  const [showModal,     setShowModal]     = useState(false)
  const [showDelete,    setShowDelete]    = useState(false)
  const [deleteId,      setDeleteId]      = useState(null)
  const [deletarTodas,  setDeletarTodas]  = useState(false)
  const [formData,      setFormData]      = useState(defaultForm())
  const [alertMsg,      setAlertMsg]      = useState({ show: false, type: '', message: '' })

  // ── Valores únicos para filtros ────────────────────────────────
  const pessoasUnicas = useMemo(() => [...new Set(despesas.map(d => d.nomePessoa))].sort(), [despesas])
  const tiposUnicos   = useMemo(() => [...new Set(despesas.map(d => d.nomeTipoDespesa))].sort(), [despesas])
  const mesesUnicos   = useMemo(() => { 
    const s = new Set(); 
    despesas.forEach(d => getTodasParcelas(d).forEach(p => s.add(p.mesLabel))); 
    return [...s].sort((a, b) => {
      const indexA = MESES.findIndex(m => m.label === a)
      const indexB = MESES.findIndex(m => m.label === b)
      return indexA - indexB
    })
  }, [despesas])
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

  const totalFiltrado = filteredDespesas.reduce((s, d) => s + d.valorTotal, 0)

  // Referência de data para cálculo de parcelas pagas: usa o filtro quando ambos estão ativos
  const refMesAnoFiltro = useMemo(() => {
    if (filtroMes && filtroAno) {
      const mesIdx = MESES.findIndex(m => m.label === filtroMes)
      return Number(filtroAno) * 12 + (mesIdx + 1)
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

  const handleOpenAdd = () => {
    setFormData(defaultForm())
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

    // Converte número do mês para nome do mês
    const mesesNomes = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const mesPrimeiraParcela = mesesNomes[Number(mes) - 1];

    const payload = {
      loja: loja.trim(),
      valorTotal: Number(valor),
      quantidadeParcelas: Number(parcelas),
      mesPrimeiraParcela,
      anoPrimeiraParcela: Number(ano),
      observacao: observacao || "",
      pessoaId,
      tipoDespesaId
    };

    fetch('http://localhost:5107/api/Despesas/cadastrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Erro ao cadastrar despesa')
        }
        return res.json()
      })
      .then(() => {
        setShowModal(false);
        limparFiltros();
        fetchDespesas();
        setAlertMsg({
          show: true,
          type: 'success',
          message: `Despesa cadastrada com sucesso! ${Number(parcelas) > 1 ? `${parcelas} parcelas lançadas.` : ''}`
        });
        setTimeout(() => setAlertMsg({ show: false, type: '', message: '' }), 5000);
      })
      .catch(error => {
        console.error('Erro ao salvar despesa:', error);
        setAlertMsg({
          show: true,
          type: 'danger',
          message: 'Erro ao cadastrar despesa. Tente novamente.'
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
    deleteDespesa(deleteId, deletarTodas)
    setShowDelete(false)
    setDeleteId(null)
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
                {tiposUnicos.map(nome => <option key={nome} value={nome}>{nome}</option>)}
              </Form.Select>
            </Col>
            <Col xs={12} md={3}>
              <Form.Label className="fw-semibold">Mês</Form.Label>
              <Form.Select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
                <option value="">Todos os meses</option>
                {mesesUnicos.map(m => <option key={m} value={m}>{m}</option>)}
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
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0" style={{ fontSize: '0.9rem' }}>
            <thead className="table-dark">
              <tr>
                <th>Pessoa</th>
                <th>Tipo</th>
                <th>Loja</th>
                <th className="text-end">Valor Total</th>
                <th className="text-end">Valor Parcela</th>
                <th className="text-center">Parcelas</th>
                <th>Mês</th>
                <th>Ano</th>
                <th>Observação</th>
                <th style={{ width: 70 }} className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDespesas.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-muted py-5">
                    <i className="bi bi-inbox d-block mb-2" style={{ fontSize: '2rem', opacity: 0.4 }}></i>
                    Nenhuma despesa encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredDespesas.map(d => (
                  <tr key={d.id}>
                    <td className="fw-semibold">{d.nomePessoa}</td>
                    <td>
                      <Badge bg="secondary" style={{ fontWeight: 400 }}>{d.nomeTipoDespesa}</Badge>
                    </td>
                    <td>{d.loja}</td>
                    <td className="text-danger fw-bold text-end">{formatCurrency(d.valorTotal)}</td>
                    <td className="text-end">{formatCurrency(d.parcelas?.[0]?.valor ?? 0)}</td>
                    <td className="text-center">
                      {(() => {
                        const total = d.parcelas?.length ?? 0
                        if (total <= 1) return <Badge bg="success" text="white">À vista</Badge>
                        const pagas = contarParcelasPagas(d, refMesAnoFiltro)
                        return (
                          <Badge bg={pagas >= total ? 'success' : 'warning'} text={pagas >= total ? 'white' : 'dark'}>
                            {pagas}/{total}
                          </Badge>
                        )
                      })()}
                    </td>
                    <td>{d.mesPrimeiraParcela}</td>
                    <td>{d.anoPrimeiraParcela}</td>
                    <td className="text-muted" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.observacao || '—'}
                    </td>
                    <td className="text-center">
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(d.id)} title="Excluir">
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

      {/* ── Modal Nova Despesa ──────────────────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-credit-card me-2 text-danger"></i>Nova Despesa
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
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.valor}
                  onChange={set('valor')}
                  placeholder="0,00"
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleSave} disabled={!isFormValid}>
            <i className="bi bi-check-lg me-1"></i>
            {isParcelado ? `Lançar ${formData.parcelas} parcelas` : 'Salvar'}
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
                checked={deletarTodas}
                onChange={e => setDeletarTodas(e.target.checked)}
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


