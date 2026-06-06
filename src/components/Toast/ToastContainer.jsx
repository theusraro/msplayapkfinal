import React, { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import useAppStore from '../../store/appStore.js'

const ICONS = {
  success: <CheckCircle size={18} className="text-green-400" />,
  error: <AlertCircle size={18} className="text-red-400" />,
  info: <Info size={18} className="text-blue-400" />,
  warning: <AlertTriangle size={18} className="text-yellow-400" />,
}

const COLORS = {
  success: 'border-green-500/30 bg-green-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
  warning: 'border-yellow-500/30 bg-yellow-500/10',
}

const ToastItem = ({ toast }) => {
  const removeToast = useAppStore(s => s.removeToast)
  const [exiting, setExiting] = useState(false)

  const handleClose = () => {
    setExiting(true)
    setTimeout(() => removeToast(toast.id), 300)
  }

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border backdrop-blur-md
        ${COLORS[toast.type] || COLORS.info}
        ${exiting ? 'toast-exit' : 'toast-enter'}
        max-w-xs w-full shadow-xl`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {ICONS[toast.type] || ICONS.info}
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-white font-semibold text-sm leading-tight mb-0.5">{toast.title}</p>
        )}
        <p className="text-muted text-xs leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-muted hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}

const ToastContainer = () => {
  const toasts = useAppStore(s => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
