import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Badge } from 'react-bootstrap'
import { MESES, ANOS, getMesLabel, formatCurrency } from '../utils/constants'
import api from '../utils/api'
import TableComponent from '../components/Table/Table'

export default function Dashboard() {
  const [pessoas, setPessoas] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(false)

  const [filtroPessoa, setFiltroPessoa] = useState('')
  const [filtroMes,    setFiltroMes]    = useState(new Date().getMonth() + 1)
  const [filtroAno,    setFiltroAno]    = useState(new Date().getFullYear())

  // Buscar pessoas disponíveis
  useEffect(() => {
    api.get('/Pessoa')
      .then(data => setPessoas(data))
      .catch(() => setPessoas([]))
  }, [])

  // Buscar dados do dashboard quando filtros mudarem
  useEffect(() => {
    if (!filtroPessoa || !filtroMes || !filtroAno) return

    setLoading(true)
    api.get(`/Dashboard/${filtroPessoa}/${filtroMes}/${filtroAno}`)
      .then(data => setDashboardData(data))
      .catch(() => setDashboardData(null))
      .finally(() => setLoading(false))
  }, [filtroPessoa, filtroMes, filtroAno])

  const totalReceita = dashboardData?.totalReceitas || 0
  const totalDespesa = dashboardData?.totalDespesas || 0
  const saldo = dashboardData?.saldo || 0
  const status = dashboardData?.status || '-'

  const SaldoBadge = ({ value }) => (
    <Badge bg={value >= 0 ? 'success' : 'danger'}>
      {value >= 0 ? 'Positivo' : 'Negativo'}
    </Badge>
  )

  return (
    <Container fluid>
      <h4 className="mb-4 fw-bold">
        <i className="bi bi-speedometer2 me-2 text-primary"></i>Dashboard
      </h4>

      {/* Filtros */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col xs={12} md={4}>
              <Form.Label className="fw-semibold">Pessoa</Form.Label>
              <Form.Select value={filtroPessoa} onChange={e => setFiltroPessoa(e.target.value)}>
                <option value="">Selecione uma pessoa</option>
                {pessoas.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </Form.Select>
            </Col>
            <Col xs={12} md={4}>
              <Form.Label className="fw-semibold">Mês</Form.Label>
              <Form.Select value={filtroMes} onChange={e => setFiltroMes(Number(e.target.value))}>
                {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </Form.Select>
            </Col>
            <Col xs={12} md={4}>
              <Form.Label className="fw-semibold">Ano</Form.Label>
              <Form.Select value={filtroAno} onChange={e => setFiltroAno(Number(e.target.value))}>
                {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5 text-muted">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-3 mb-0">Carregando dados...</p>
          </Card.Body>
        </Card>
      ) : !dashboardData ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5 text-muted">
            <i className="bi bi-inbox" style={{ fontSize: '3rem', opacity: 0.4 }}></i>
            <p className="mt-3 mb-0">Selecione os filtros para visualizar o dashboard.</p>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Cartões de resumo */}
          <Row className="mb-4 g-3">
            <Col xs={12} md={3}>
              <Card className="shadow-sm h-100" style={{ borderLeft: '4px solid #6c757d' }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small fw-semibold text-uppercase">Pessoa</p>
                      <h5 className="mb-0 fw-bold">{dashboardData.nomePessoa}</h5>
                      <small className="text-muted">{getMesLabel(dashboardData.mes)} / {dashboardData.ano}</small>
                    </div>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(108,117,125,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="bi bi-person-fill text-secondary" style={{ fontSize: '1.8rem' }}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} md={3}>
              <Card className="shadow-sm h-100" style={{ borderLeft: '4px solid #198754' }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small fw-semibold text-uppercase">Total de Receitas</p>
                      <h3 className="text-success mb-0 fw-bold">{formatCurrency(totalReceita)}</h3>
                    </div>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(25,135,84,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="bi bi-arrow-up-circle-fill text-success" style={{ fontSize: '1.8rem' }}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} md={3}>
              <Card className="shadow-sm h-100" style={{ borderLeft: '4px solid #dc3545' }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small fw-semibold text-uppercase">Total de Despesas</p>
                      <h3 className="text-danger mb-0 fw-bold">{formatCurrency(totalDespesa)}</h3>
                    </div>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(220,53,69,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="bi bi-arrow-down-circle-fill text-danger" style={{ fontSize: '1.8rem' }}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} md={3}>
              <Card className="shadow-sm h-100" style={{ borderLeft: `4px solid ${saldo >= 0 ? '#0d6efd' : '#ffc107'}` }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small fw-semibold text-uppercase">Saldo</p>
                      <h3 className={`mb-0 fw-bold ${saldo >= 0 ? 'text-primary' : 'text-warning'}`}>{formatCurrency(saldo)}</h3>
                      <small className="text-muted">{status}</small>
                    </div>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: saldo >= 0 ? 'rgba(13,110,253,.15)' : 'rgba(255,193,7,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`bi bi-wallet2 ${saldo >= 0 ? 'text-primary' : 'text-warning'}`} style={{ fontSize: '1.8rem' }}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Resumo detalhado */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white fw-semibold">
              <i className="bi bi-bar-chart me-2 text-primary"></i>Resumo Financeiro
            </Card.Header>
            <Card.Body>
              <TableComponent
                columns={[
                  { key: 'nomePessoa', label: 'Pessoa', render: (r) => <span className="fw-semibold">{r.nomePessoa}</span> },
                  { key: 'periodo', label: 'Período', render: (r) => `${getMesLabel(r.mes)} / ${r.ano}` },
                  { key: 'totalReceitas', label: 'Receitas', align: 'right', render: (r) => <span className="text-success">{formatCurrency(r.totalReceitas)}</span> },
                  { key: 'totalDespesas', label: 'Despesas', align: 'right', render: (r) => <span className="text-danger">{formatCurrency(r.totalDespesas)}</span> },
                  { key: 'saldo', label: 'Saldo', align: 'right', render: (r) => <span className={`fw-bold ${r.saldo >= 0 ? 'text-primary' : 'text-warning'}`}>{formatCurrency(r.saldo)}</span> },
                  { key: 'status', label: 'Status', align: 'center', render: (r) => <SaldoBadge value={r.saldo} /> },
                ]}
                data={[dashboardData]}
                itemsPerPage={15}
              />
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  )
}
