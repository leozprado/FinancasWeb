import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass]  = useState(false)
  const [error, setError]        = useState('')
  const [loading, setLoading]    = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const result = await login(email, password)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || 'Usuário ou senha inválidos. Tente novamente.')
    }
    setLoading(false)
  }

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1d23 0%, #0d1117 100%)' }}
    >
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 16px' }}>
        <div className="text-center mb-4">
          <div
            style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'rgba(13, 110, 253, 0.15)',
              border: '2px solid rgba(13, 110, 253, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <i className="bi bi-wallet2" style={{ fontSize: '2rem', color: '#0d6efd' }}></i>
          </div>
          <h3 style={{ color: '#fff', fontWeight: 700 }}>Controle Financeiro</h3>
          <p style={{ color: '#8b909a' }}>Faça login para acessar o sistema</p>
        </div>

        <Card
          style={{
            background: '#1e2028',
            border: '1px solid #2d3139',
            borderRadius: '12px',
          }}
        >
          <Card.Body className="p-4">
            {error && (
              <Alert variant="danger" className="py-2 px-3" style={{ fontSize: '0.9rem' }}>
                <i className="bi bi-exclamation-triangle me-2"></i>{error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#c8ccd4', fontSize: '0.9rem' }}>E-mail</Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ background: '#2d3139', border: '1px solid #3d4149', color: '#8b909a' }}>
                    <i className="bi bi-envelope"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Digite seu e-mail"
                    required
                    style={{ background: '#252830', border: '1px solid #3d4149', color: '#fff' }}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={{ color: '#c8ccd4', fontSize: '0.9rem' }}>Senha</Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ background: '#2d3139', border: '1px solid #3d4149', color: '#8b909a' }}>
                    <i className="bi bi-lock"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                    style={{ background: '#252830', border: '1px solid #3d4149', color: '#fff' }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPass(s => !s)}
                    style={{ background: '#2d3139', border: '1px solid #3d4149', color: '#8b909a' }}
                  >
                    <i className={`bi bi-eye${showPass ? '-slash' : ''}`}></i>
                  </Button>
                </InputGroup>
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={loading}
                style={{ borderRadius: '8px', padding: '10px' }}
              >
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Entrando...</>
                  : <><i className="bi bi-box-arrow-in-right me-2"></i>Entrar</>
                }
              </Button>
            </Form>
          </Card.Body>
        </Card>

        <p className="text-center mt-3" style={{ color: '#5a606b', fontSize: '0.8rem' }}>
          Controle Financeiro v1.0 &nbsp;·&nbsp; Dados simulados
        </p>
      </div>
    </Container>
  )
}
