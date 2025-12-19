import type { DashboardData } from '../App'

const API_BASE_URL = 'http://localhost:3001/api'

export const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    // Retornar dados mockados em caso de erro
    return getMockData()
  }
}

const getMockData = (): DashboardData => {
  return {
    balance: {
      total: 125430.50,
      income: 150000.00,
      expenses: 24569.50,
      savings: 100861.00,
    },
    transactions: [
      {
        id: 1,
        date: '2024-01-15',
        description: 'Salário',
        amount: 5000.00,
        type: 'income',
        category: 'Trabalho',
      },
      {
        id: 2,
        date: '2024-01-14',
        description: 'Supermercado',
        amount: -450.50,
        type: 'expense',
        category: 'Alimentação',
      },
      {
        id: 3,
        date: '2024-01-13',
        description: 'Freelance',
        amount: 1200.00,
        type: 'income',
        category: 'Trabalho',
      },
      {
        id: 4,
        date: '2024-01-12',
        description: 'Conta de Luz',
        amount: -280.00,
        type: 'expense',
        category: 'Utilidades',
      },
      {
        id: 5,
        date: '2024-01-11',
        description: 'Restaurante',
        amount: -120.00,
        type: 'expense',
        category: 'Alimentação',
      },
    ],
    charts: {
      monthly: [
        { month: 'Jul', income: 45000, expenses: 32000 },
        { month: 'Ago', income: 52000, expenses: 35000 },
        { month: 'Set', income: 48000, expenses: 33000 },
        { month: 'Out', income: 55000, expenses: 38000 },
        { month: 'Nov', income: 60000, expenses: 40000 },
        { month: 'Dez', income: 65000, expenses: 42000 },
      ],
      categories: [
        { category: 'Alimentação', amount: 8500 },
        { category: 'Transporte', amount: 3200 },
        { category: 'Utilidades', amount: 2800 },
        { category: 'Lazer', amount: 1500 },
        { category: 'Saúde', amount: 2200 },
        { category: 'Outros', amount: 6369.50 },
      ],
    },
  }
}

