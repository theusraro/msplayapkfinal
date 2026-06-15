import { useEffect } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[role="button"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const isTextInput = (element) => {
  if (!element) return false
  const tag = element.tagName?.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || element.isContentEditable
}

const isVisible = (element) => {
  const rect = element.getBoundingClientRect()
  const style = window.getComputedStyle(element)
  return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
}

const getFocusableElements = () => (
  Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter(element => !element.hasAttribute('disabled') && isVisible(element))
)

const centerOf = (rect) => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
})

const directionScore = (from, to, direction) => {
  const dx = to.x - from.x
  const dy = to.y - from.y

  if (direction === 'ArrowRight' && dx <= 6) return null
  if (direction === 'ArrowLeft' && dx >= -6) return null
  if (direction === 'ArrowDown' && dy <= 6) return null
  if (direction === 'ArrowUp' && dy >= -6) return null

  const primary = direction === 'ArrowRight' || direction === 'ArrowLeft' ? Math.abs(dx) : Math.abs(dy)
  const secondary = direction === 'ArrowRight' || direction === 'ArrowLeft' ? Math.abs(dy) : Math.abs(dx)

  return primary + secondary * 2.5
}

const focusFirstVisible = () => {
  const first = getFocusableElements()[0]
  first?.focus()
}

export default function useRemoteNavigation() {
  useEffect(() => {
    const onKeyDown = (event) => {
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      if (!keys.includes(event.key)) return
      if (isTextInput(document.activeElement)) return

      const focusable = getFocusableElements()
      if (focusable.length === 0) return

      const current = document.activeElement && focusable.includes(document.activeElement)
        ? document.activeElement
        : null

      if (!current) {
        event.preventDefault()
        focusFirstVisible()
        return
      }

      const currentCenter = centerOf(current.getBoundingClientRect())
      let best = null
      let bestScore = Infinity

      for (const candidate of focusable) {
        if (candidate === current) continue
        const score = directionScore(currentCenter, centerOf(candidate.getBoundingClientRect()), event.key)
        if (score !== null && score < bestScore) {
          best = candidate
          bestScore = score
        }
      }

      if (best) {
        event.preventDefault()
        best.focus()
        best.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
