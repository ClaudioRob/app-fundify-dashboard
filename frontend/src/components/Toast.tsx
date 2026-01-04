import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from './icons'
import './Toast.css'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

interface ToastProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

const Toast = ({ toasts, onRemove }: ToastProps) => {
  const [closingToasts, setClosingToasts] = useState<Set<string>>(new Set())

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />
      case 'error':
        return <XCircle size={20} />
      case 'warning':
        return <AlertCircle size={20} />
      case 'info':
        return <Info size={20} />
    }
  }

  const handleClose = (id: string) => {
    setClosingToasts(prev => new Set(prev).add(id))
    setTimeout(() => {
      onRemove(id)
      setClosingToasts(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }, 300)
  }

  useEffect(() => {
    const timers = toasts.map(toast => {
      return setTimeout(() => {
        handleClose(toast.id)
      }, 5000)
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [toasts])

  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`toast ${toast.type} ${closingToasts.has(toast.id) ? 'closing' : ''}`}
        >
          <div className="toast-icon">
            {getIcon(toast.type)}
          </div>
          <div className="toast-content">
            <p className="toast-message">{toast.message}</p>
          </div>
          <button 
            className="toast-close" 
            onClick={() => handleClose(toast.id)}
            aria-label="Fechar notificação"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}

export default Toast
