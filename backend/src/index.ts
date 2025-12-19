import express, { Request, Response } from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Tipos
interface Transaction {
  id: number
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
}

interface DashboardData {
  balance: {
    total: number
    income: number
    expenses: number
    savings: number
  }
  transactions: Transaction[]
  charts: {
    monthly: Array<{ month: string; income: number; expenses: number }>
    categories: Array<{ category: string; amount: number }>
  }
}

// Armazenamento de dados em memória
let transactions: Transaction[] = [
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
  {
    id: 6,
    date: '2024-01-10',
    description: 'Investimento',
    amount: 2000.00,
    type: 'income',
    category: 'Investimentos',
  },
  {
    id: 7,
    date: '2024-01-09',
    description: 'Uber',
    amount: -35.00,
    type: 'expense',
    category: 'Transporte',
  },
]

let nextId = 8

// Funções auxiliares
const calculateBalance = (transactions: Transaction[]) => {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  
  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  
  const total = income - expenses
  const savings = total
  
  return { total, income, expenses, savings }
}

const calculateCharts = (transactions: Transaction[]) => {
  // Agrupar por mês
  const monthlyMap = new Map<string, { income: number; expenses: number }>()
  
  transactions.forEach((t) => {
    const date = new Date(t.date)
    const monthKey = date.toLocaleDateString('pt-BR', { month: 'short' })
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { income: 0, expenses: 0 })
    }
    
    const monthData = monthlyMap.get(monthKey)!
    if (t.type === 'income') {
      monthData.income += Math.abs(t.amount)
    } else {
      monthData.expenses += Math.abs(t.amount)
    }
  })
  
  const monthly = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      return months.indexOf(a.month) - months.indexOf(b.month)
    })
  
  // Agrupar por categoria
  const categoryMap = new Map<string, number>()
  
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + Math.abs(t.amount))
    })
  
  const categories = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
  
  return { monthly, categories }
}

const getDashboardData = (): DashboardData => {
  const balance = calculateBalance(transactions)
  const charts = calculateCharts(transactions)
  
  return {
    balance,
    transactions: [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
    charts,
  }
}

// Rotas
app.get('/api/dashboard', (req: Request, res: Response) => {
  res.json(getDashboardData())
})

app.get('/api/transactions', (req: Request, res: Response) => {
  res.json(transactions)
})

app.post('/api/transactions', (req: Request, res: Response) => {
  const { date, description, amount, type, category } = req.body
  
  if (!date || !description || amount === undefined || !type || !category) {
    return res.status(400).json({ error: 'Campos obrigatórios: date, description, amount, type, category' })
  }
  
  const transaction: Transaction = {
    id: nextId++,
    date,
    description,
    amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
    type,
    category,
  }
  
  transactions.push(transaction)
  res.status(201).json(transaction)
})

app.delete('/api/transactions/all', (req: Request, res: Response) => {
  transactions = []
  nextId = 1
  res.json({ message: 'Todos os dados foram limpos' })
})

app.post('/api/transactions/import', (req: Request, res: Response) => {
  const { transactions: importedTransactions } = req.body
  
  if (!Array.isArray(importedTransactions)) {
    return res.status(400).json({ error: 'Formato inválido. Esperado: { transactions: [] }' })
  }
  
  const newTransactions: Transaction[] = importedTransactions.map((t: any) => ({
    id: nextId++,
    date: t.date || new Date().toISOString().split('T')[0],
    description: t.description || '',
    amount: t.type === 'expense' ? -Math.abs(t.amount || 0) : Math.abs(t.amount || 0),
    type: t.type || 'expense',
    category: t.category || 'Outros',
  }))
  
  transactions.push(...newTransactions)
  res.status(201).json({ 
    message: `${newTransactions.length} transações importadas`,
    transactions: newTransactions 
  })
})

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Fundify API is running' })
})

app.listen(PORT, () => {
  console.log(`🚀 Fundify Backend running on http://localhost:${PORT}`)
})

