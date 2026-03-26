import { createContext, useContext, useState } from 'react'

const DataContext = createContext()

// ── Mock data ────────────────────────────────────────────────────────────────

const initialPessoas = [
  { id: 1, nome: 'João Silva' },
  { id: 2, nome: 'Maria Santos' },
  { id: 3, nome: 'Pedro Oliveira' },
]

const initialTiposDespesa = [
  { id: 1, nome: 'Alimentação' },
  { id: 2, nome: 'Transporte' },
  { id: 3, nome: 'Saúde' },
  { id: 4, nome: 'Lazer' },
  { id: 5, nome: 'Educação' },
  { id: 6, nome: 'Vestuário' },
  { id: 7, nome: 'Moradia' },
  { id: 8, nome: 'Serviços' },
]

const initialSalarios = [
  { id: 1, pessoaId: 1, valor: 5000, mes: 1, ano: 2026 },
  { id: 2, pessoaId: 2, valor: 4500, mes: 1, ano: 2026 },
  { id: 3, pessoaId: 3, valor: 6000, mes: 1, ano: 2026 },
  { id: 4, pessoaId: 1, valor: 5000, mes: 2, ano: 2026 },
  { id: 5, pessoaId: 2, valor: 4500, mes: 2, ano: 2026 },
  { id: 6, pessoaId: 3, valor: 6000, mes: 2, ano: 2026 },
  { id: 7, pessoaId: 1, valor: 5200, mes: 3, ano: 2026 },
  { id: 8, pessoaId: 2, valor: 4800, mes: 3, ano: 2026 },
  { id: 9, pessoaId: 3, valor: 6000, mes: 3, ano: 2026 },
]

const initialDespesas = [
  // João – Janeiro 2026
  { id: 1,  grupoId: 101, pessoaId: 1, tipoDespesaId: 1, loja: 'Supermercado Extra',  valor: 850,  parcelas: 1, parcelaAtual: 1, observacao: 'Compras mensais',       mes: 1, ano: 2026 },
  { id: 2,  grupoId: 102, pessoaId: 1, tipoDespesaId: 2, loja: 'Posto Shell',         valor: 320,  parcelas: 1, parcelaAtual: 1, observacao: 'Combustível',            mes: 1, ano: 2026 },
  // João – Renner 3x (Jan, Fev, Mar)
  { id: 3,  grupoId: 103, pessoaId: 1, tipoDespesaId: 6, loja: 'Renner',              valor: 600,  parcelas: 3, parcelaAtual: 1, observacao: 'Roupas de verão',        mes: 1, ano: 2026 },
  { id: 4,  grupoId: 103, pessoaId: 1, tipoDespesaId: 6, loja: 'Renner',              valor: 600,  parcelas: 3, parcelaAtual: 2, observacao: 'Roupas de verão',        mes: 2, ano: 2026 },
  { id: 5,  grupoId: 103, pessoaId: 1, tipoDespesaId: 6, loja: 'Renner',              valor: 600,  parcelas: 3, parcelaAtual: 3, observacao: 'Roupas de verão',        mes: 3, ano: 2026 },
  // João – Fevereiro
  { id: 6,  grupoId: 104, pessoaId: 1, tipoDespesaId: 1, loja: 'Supermercado Extra',  valor: 780,  parcelas: 1, parcelaAtual: 1, observacao: 'Compras mensais',       mes: 2, ano: 2026 },
  { id: 7,  grupoId: 105, pessoaId: 1, tipoDespesaId: 7, loja: 'Aluguel',             valor: 1200, parcelas: 1, parcelaAtual: 1, observacao: 'Aluguel fevereiro',      mes: 2, ano: 2026 },
  // João – Março
  { id: 8,  grupoId: 106, pessoaId: 1, tipoDespesaId: 1, loja: 'Carrefour',           valor: 900,  parcelas: 1, parcelaAtual: 1, observacao: 'Compras do mês',        mes: 3, ano: 2026 },
  // Maria – Janeiro 2026
  { id: 9,  grupoId: 201, pessoaId: 2, tipoDespesaId: 1, loja: 'Carrefour',           valor: 650,  parcelas: 1, parcelaAtual: 1, observacao: 'Compras do mês',        mes: 1, ano: 2026 },
  { id: 10, grupoId: 202, pessoaId: 2, tipoDespesaId: 5, loja: 'Udemy',               valor: 250,  parcelas: 1, parcelaAtual: 1, observacao: 'Curso de inglês',       mes: 1, ano: 2026 },
  // Maria – Curso 2x (Jan, Fev)
  { id: 11, grupoId: 203, pessoaId: 2, tipoDespesaId: 3, loja: 'Drogasil',            valor: 180,  parcelas: 2, parcelaAtual: 1, observacao: 'Medicamentos',          mes: 1, ano: 2026 },
  { id: 12, grupoId: 203, pessoaId: 2, tipoDespesaId: 3, loja: 'Drogasil',            valor: 180,  parcelas: 2, parcelaAtual: 2, observacao: 'Medicamentos',          mes: 2, ano: 2026 },
  // Maria – Fevereiro
  { id: 13, grupoId: 204, pessoaId: 2, tipoDespesaId: 1, loja: 'Carrefour',           valor: 700,  parcelas: 1, parcelaAtual: 1, observacao: 'Compras do mês',        mes: 2, ano: 2026 },
  // Maria – Março
  { id: 14, grupoId: 205, pessoaId: 2, tipoDespesaId: 2, loja: 'Posto BR',            valor: 290,  parcelas: 1, parcelaAtual: 1, observacao: 'Combustível',            mes: 3, ano: 2026 },
  // Pedro – 2x Magazine Luiza (Jan, Fev)
  { id: 15, grupoId: 301, pessoaId: 3, tipoDespesaId: 4, loja: 'Magazine Luiza',      valor: 1200, parcelas: 2, parcelaAtual: 1, observacao: 'Smart TV 55"',          mes: 1, ano: 2026 },
  { id: 16, grupoId: 301, pessoaId: 3, tipoDespesaId: 4, loja: 'Magazine Luiza',      valor: 1200, parcelas: 2, parcelaAtual: 2, observacao: 'Smart TV 55"',          mes: 2, ano: 2026 },
  // Pedro – Janeiro
  { id: 17, grupoId: 302, pessoaId: 3, tipoDespesaId: 8, loja: 'Net Claro',           valor: 199,  parcelas: 1, parcelaAtual: 1, observacao: 'Internet + TV',         mes: 1, ano: 2026 },
  // Pedro – Março
  { id: 18, grupoId: 303, pessoaId: 3, tipoDespesaId: 3, loja: 'Hospital Albert',     valor: 450,  parcelas: 1, parcelaAtual: 1, observacao: 'Consulta cardiologista', mes: 3, ano: 2026 },
  // Pedro – 3x Americanas (Fev, Mar, Abr)
  { id: 19, grupoId: 304, pessoaId: 3, tipoDespesaId: 4, loja: 'Americanas',          valor: 400,  parcelas: 3, parcelaAtual: 1, observacao: 'Notebook acessórios',   mes: 2, ano: 2026 },
  { id: 20, grupoId: 304, pessoaId: 3, tipoDespesaId: 4, loja: 'Americanas',          valor: 400,  parcelas: 3, parcelaAtual: 2, observacao: 'Notebook acessórios',   mes: 3, ano: 2026 },
  { id: 21, grupoId: 304, pessoaId: 3, tipoDespesaId: 4, loja: 'Americanas',          valor: 400,  parcelas: 3, parcelaAtual: 3, observacao: 'Notebook acessórios',   mes: 4, ano: 2026 },
]

// ── Provider ─────────────────────────────────────────────────────────────────

export function DataProvider({ children }) {
  const [pessoas, setPessoas]           = useState(initialPessoas)
  const [tiposDespesa, setTiposDespesa] = useState(initialTiposDespesa)
  const [salarios, setSalarios]         = useState(initialSalarios)
  const [despesas, setDespesas]         = useState(initialDespesas)

  // ── Pessoas ────────────────────────────────────────────────────
  const addPessoa = (nome) => {
    const newId = pessoas.length > 0 ? Math.max(...pessoas.map(p => p.id)) + 1 : 1
    setPessoas(prev => [...prev, { id: newId, nome }])
  }

  const updatePessoa = (id, nome) => {
    setPessoas(prev => prev.map(p => p.id === id ? { ...p, nome } : p))
  }

  const deletePessoa = (id) => {
    setPessoas(prev => prev.filter(p => p.id !== id))
  }

  // ── Tipos de Despesa ───────────────────────────────────────────
  const addTipoDespesa = (nome) => {
    const newId = tiposDespesa.length > 0 ? Math.max(...tiposDespesa.map(t => t.id)) + 1 : 1
    setTiposDespesa(prev => [...prev, { id: newId, nome }])
  }

  const updateTipoDespesa = (id, nome) => {
    setTiposDespesa(prev => prev.map(t => t.id === id ? { ...t, nome } : t))
  }

  const deleteTipoDespesa = (id) => {
    setTiposDespesa(prev => prev.filter(t => t.id !== id))
  }

  // ── Salários ───────────────────────────────────────────────────
  const addSalario = (data) => {
    const newId = salarios.length > 0 ? Math.max(...salarios.map(s => s.id)) + 1 : 1
    setSalarios(prev => [...prev, { ...data, id: newId }])
  }

  const updateSalario = (id, data) => {
    setSalarios(prev => prev.map(s => s.id === id ? { ...s, ...data } : s))
  }

  const deleteSalario = (id) => {
    setSalarios(prev => prev.filter(s => s.id !== id))
  }

  // ── Despesas ───────────────────────────────────────────────────
  const addDespesa = (data) => {
    const { pessoaId, tipoDespesaId, loja, valor, parcelas, observacao, mes, ano } = data
    const maxId    = despesas.length > 0 ? Math.max(...despesas.map(d => d.id)) : 0
    const grupoId  = Date.now()

    const newEntries = Array.from({ length: Number(parcelas) }, (_, i) => {
      const totalMonths = (Number(mes) - 1) + i
      const targetMes   = (totalMonths % 12) + 1
      const targetAno   = Number(ano) + Math.floor(totalMonths / 12)
      return {
        id:          maxId + i + 1,
        grupoId,
        pessoaId:    Number(pessoaId),
        tipoDespesaId: Number(tipoDespesaId),
        loja,
        valor:       Number(valor),
        parcelas:    Number(parcelas),
        parcelaAtual: i + 1,
        observacao,
        mes:         targetMes,
        ano:         targetAno,
      }
    })

    setDespesas(prev => [...prev, ...newEntries])
  }

  const deleteDespesa = (id, deletarTodas = false) => {
    const despesa = despesas.find(d => d.id === id)
    if (!despesa) return
    if (deletarTodas && despesa.parcelas > 1) {
      setDespesas(prev => prev.filter(d => d.grupoId !== despesa.grupoId))
    } else {
      setDespesas(prev => prev.filter(d => d.id !== id))
    }
  }

  return (
    <DataContext.Provider value={{
      pessoas,      addPessoa,      updatePessoa,      deletePessoa,
      tiposDespesa, addTipoDespesa, updateTipoDespesa, deleteTipoDespesa,
      salarios,     addSalario,     updateSalario,     deleteSalario,
      despesas,     addDespesa,     deleteDespesa,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
