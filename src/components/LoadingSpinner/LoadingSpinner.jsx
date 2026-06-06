import React from 'react'

const LoadingSpinner = ({ size = 'md', text = '', fullScreen = false }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-10 h-10', lg: 'w-16 h-16' }

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} relative`}>
        <div className={`${sizes[size]} rounded-full border-4 border-surface`} />
        <div className={`${sizes[size]} rounded-full border-4 border-transparent border-t-primary absolute top-0 left-0 animate-spin`} />
      </div>
      {text && <p className="text-muted text-sm font-dm">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark/90 flex items-center justify-center z-50 backdrop-blur-sm">
        {spinner}
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner
