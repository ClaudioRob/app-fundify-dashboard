import { useState, useRef } from 'react'
import { X, Upload } from './icons'
import { importTransactions } from '../services/api'
import './ImportModal.css'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const ImportModal = ({ isOpen, onClose, onSuccess }: ImportModalProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter((line) => line.trim())
      
      if (lines.length < 2) {
        throw new Error('Arquivo vazio ou formato inválido')
      }

      // Parse CSV - espera formato: date,description,amount,type,category
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
      const transactions = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim())
        
        if (values.length < 5) continue

        const dateIndex = headers.indexOf('date')
        const descIndex = headers.indexOf('description')
        const amountIndex = headers.indexOf('amount')
        const typeIndex = headers.indexOf('type')
        const categoryIndex = headers.indexOf('category')

        if (dateIndex === -1 || descIndex === -1 || amountIndex === -1 || typeIndex === -1 || categoryIndex === -1) {
          throw new Error('Formato inválido. Colunas esperadas: date,description,amount,type,category')
        }

        transactions.push({
          date: values[dateIndex] || new Date().toISOString().split('T')[0],
          description: values[descIndex] || '',
          amount: parseFloat(values[amountIndex]) || 0,
          type: (values[typeIndex] || 'expense').toLowerCase() === 'income' ? 'income' : 'expense',
          category: values[categoryIndex] || 'Outros',
        })
      }

      if (transactions.length === 0) {
        throw new Error('Nenhuma transação válida encontrada no arquivo')
      }

      const result = await importTransactions(transactions)
      setSuccess(`${result.transactions.length} transações importadas com sucesso!`)
      
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Erro ao importar arquivo. Verifique o formato.')
      console.error(err)
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDownloadTemplate = () => {
    const template = `date,description,amount,type,category
2024-01-15,Salário,5000,income,Trabalho
2024-01-14,Supermercado,450.50,expense,Alimentação
2024-01-13,Conta de Luz,280,expense,Utilidades`

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'template_transacoes.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Importar Planilha</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="import-content">
          <div className="import-instructions">
            <h3>Formato esperado (CSV)</h3>
            <p>O arquivo deve conter as seguintes colunas:</p>
            <ul>
              <li><strong>date</strong> - Data (YYYY-MM-DD)</li>
              <li><strong>description</strong> - Descrição da transação</li>
              <li><strong>amount</strong> - Valor (número)</li>
              <li><strong>type</strong> - Tipo: "income" ou "expense"</li>
              <li><strong>category</strong> - Categoria</li>
            </ul>
            
            <button 
              type="button" 
              className="btn-template" 
              onClick={handleDownloadTemplate}
            >
              📥 Baixar Template
            </button>
          </div>

          <div className="import-area">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input" className="file-label">
              <Upload size={48} />
              <span>{loading ? 'Processando...' : 'Clique para selecionar arquivo CSV'}</span>
              <small>ou arraste o arquivo aqui</small>
            </label>
          </div>

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
        </div>
      </div>
    </div>
  )
}

export default ImportModal
