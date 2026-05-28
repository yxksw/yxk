/**
 * 客户端指纹生成工具
 * 用于点赞去重，结合服务端 IP 生成唯一标识
 * 不依赖第三方库，使用浏览器原生 API
 */

const FINGERPRINT_KEY = 'blog_fp'

/**
 * 收集浏览器特征并生成指纹
 */
async function generateFingerprint(): Promise<string> {
  const components: string[] = []

  // 1. User Agent
  components.push(navigator.userAgent || '')

  // 2. 语言
  components.push(navigator.language || '')
  components.push((navigator.languages || []).join(','))

  // 3. 屏幕信息
  components.push(`${screen.width}x${screen.height}`)
  components.push(`${screen.colorDepth}`)
  components.push(`${window.devicePixelRatio || 1}`)

  // 4. 时区
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || '')
  components.push(`${new Date().getTimezoneOffset()}`)

  // 5. 平台信息
  const platform =
    (navigator as unknown as { userAgentData?: { platform?: string } })
      .userAgentData?.platform ||
    navigator.platform ||
    ''
  components.push(platform)

  // 6. 硬件并发数
  components.push(`${navigator.hardwareConcurrency || 0}`)

  // 7. 触摸支持
  components.push(`${navigator.maxTouchPoints || 0}`)

  // 8. Canvas 指纹
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      canvas.width = 200
      canvas.height = 50
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#f60'
      ctx.fillRect(0, 0, 100, 30)
      ctx.fillStyle = '#069'
      ctx.fillText('fingerprint', 2, 15)
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
      ctx.fillText('canvas', 4, 17)
      components.push(canvas.toDataURL().slice(-50))
    }
  } catch {
    components.push('canvas-error')
  }

  // 9. WebGL 信息
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '')
        components.push(
          gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '',
        )
      }
    }
  } catch {
    components.push('webgl-error')
  }

  // 合并所有组件并哈希
  const raw = components.join('|||')
  return await sha256Hex(raw)
}

/**
 * 使用 Web Crypto API 计算 SHA-256
 */
async function sha256Hex(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 获取或生成指纹（带缓存）
 * 指纹会缓存在 localStorage 中，避免每次重新生成
 * 但有 30 天的过期时间，到期后重新生成
 */
export async function getFingerprint(): Promise<string> {
  try {
    // 尝试从缓存读取
    const cached = localStorage.getItem(FINGERPRINT_KEY)
    if (cached) {
      try {
        const { fp, ts } = JSON.parse(cached)
        const age = Date.now() - ts
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
        if (
          fp &&
          typeof fp === 'string' &&
          fp.length >= 8 &&
          age < THIRTY_DAYS
        ) {
          return fp
        }
      } catch {
        // 缓存数据损坏，重新生成
      }
    }

    // 生成新指纹
    const fp = await generateFingerprint()
    // 取前 32 位作为指纹
    const shortFp = fp.slice(0, 32)

    // 缓存
    localStorage.setItem(
      FINGERPRINT_KEY,
      JSON.stringify({ fp: shortFp, ts: Date.now() }),
    )

    return shortFp
  } catch {
    // 降级：使用随机生成的持久 ID
    const fallbackKey = 'blog_fp_fallback'
    let fallback = localStorage.getItem(fallbackKey)
    if (!fallback) {
      fallback = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      localStorage.setItem(fallbackKey, fallback)
    }
    return fallback
  }
}
