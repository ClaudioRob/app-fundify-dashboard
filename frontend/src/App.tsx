import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import StatsCards from './components/StatsCards'
import ChartsSection from './components/ChartsSection'
import RecentTransactions from './components/RecentTransactions'
import { fetchDashboardData } from './services/api'

export interface DashboardData {
  balance: {
    total: number
    income: number
    expenses: number
    savings: number
  }
  transactions: Array<{
    id: number
    date: string
    description: string
    amount: number
    type: 'income' | 'expense'
    category: string
  }>
  charts: {
    monthly: Array<{ month: string; income: number; expenses: number }>
    categories: Array<{ category: string; amount: number }>
  }
}

function App() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const dashboardData = await fetchDashboardData()
      setData(dashboardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
      console.error('Erro ao carregar dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Erro ao carregar dados</h2>
        <p>{error}</p>
        <button onClick={loadData} className="retry-button">
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <StatsCards balance={data.balance} />
        <div className="dashboard-grid">
          <ChartsSection charts={data.charts} />
          <RecentTransactions transactions={data.transactions} />
        </div>
      </main>
    </div>
  )
}

export default App

