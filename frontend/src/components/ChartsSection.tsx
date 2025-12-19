import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './ChartsSection.css'

interface ChartsSectionProps {
  charts: {
    monthly: Array<{ month: string; income: number; expenses: number }>
    categories: Array<{ category: string; amount: number }>
  }
}

const ChartsSection = ({ charts }: ChartsSectionProps) => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'categories'>('monthly')

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444']

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="charts-section">
      <div className="charts-header">
        <h2>Análise Financeira</h2>
        <div className="chart-tabs">
          <button
            className={`tab-button ${activeTab === 'monthly' ? 'active' : ''}`}
            onClick={() => setActiveTab('monthly')}
          >
            Mensal
          </button>
          <button
            className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categorias
          </button>
        </div>
      </div>

      <div className="chart-container">
        {activeTab === 'monthly' ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={charts.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                stroke="var(--text-muted)"
                style={{ fontSize: '0.875rem' }}
              />
              <YAxis
                stroke="var(--text-muted)"
                style={{ fontSize: '0.875rem' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={3}
                name="Receitas"
                dot={{ fill: '#10b981', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={3}
                name="Despesas"
                dot={{ fill: '#ef4444', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="categories-charts">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={charts.categories}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="category"
                  stroke="var(--text-muted)"
                  style={{ fontSize: '0.875rem' }}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  style={{ fontSize: '0.875rem' }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChartsSection

