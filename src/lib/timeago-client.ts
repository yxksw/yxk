declare global {
  interface Window {
    __timeAgoTimer?: number
    __timeAgoSelector?: string
    __timeAgoVisibilityHandler?: () => void
  }
}

function clearTimeAgoTimer() {
  if (window.__timeAgoTimer) {
    clearInterval(window.__timeAgoTimer)
    window.__timeAgoTimer = undefined
  }

  if (window.__timeAgoVisibilityHandler) {
    document.removeEventListener(
      'visibilitychange',
      window.__timeAgoVisibilityHandler,
    )
    window.__timeAgoVisibilityHandler = undefined
  }

  window.__timeAgoSelector = undefined
}

export function setupTimeAgo(selector = '.time-ago', interval = 60000) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  if (!document.querySelector(selector)) {
    if (window.__timeAgoSelector === selector) {
      clearTimeAgoTimer()
    }
    return
  }

  clearTimeAgoTimer()
  window.__timeAgoSelector = selector

  const update = async () => {
    const { timeAgo } = await import('@lib/utils')
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      const ts = el.getAttribute('data-timestamp')
      if (!ts) return
      const date = new Date(Number(ts))
      el.textContent = timeAgo(date)
    })
  }

  update()
  window.__timeAgoTimer = window.setInterval(update, interval)

  const onVisibility = () => {
    if (document.visibilityState === 'visible') update()
  }

  window.__timeAgoVisibilityHandler = onVisibility

  document.addEventListener('visibilitychange', onVisibility, {
    passive: true,
  })
}
