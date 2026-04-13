// API Configuration
export const API_BASE_URL = 'https://leozprado-001-site1.anytempurl.com/api/'

export const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
]

export const getMesLabel = (value) => {
  const mes = MESES.find(m => m.value === Number(value))
  return mes ? mes.label : '-'
}

export const formatCurrency = (value) => {
  const num = Number(value)
  if (isNaN(num)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
}

const currentYear = new Date().getFullYear()
export const ANOS = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i)
