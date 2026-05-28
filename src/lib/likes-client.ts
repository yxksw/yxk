/**
 * 点赞客户端库
 * - getLikes: 批量查询（50ms 合并窗口 + sessionStorage 缓存）
 * - sendLike: 防抖批量写入（800ms 窗口，合并同一时间段内所有点赞操作为单次请求）
 */

import { getFingerprint } from './fingerprint'

const API_BASE = '/api/likes'
const LIKES_CACHE_KEY = 'blog_likes_cache'
const CACHE_TTL = 2 * 60 * 1000 // 2 分钟

// ============================================================================
// 类型
// ============================================================================

export interface LikeInfo {
  total: number
  userToday: number
}

export interface LikeResult {
  success: boolean
  limited: boolean
  limitReason?: 'item' | 'daily_cap' | 'rate'
  message?: string
  total: number
  userToday: number
  dailyLimit: number
}

interface CacheEntry {
  data: Record<string, LikeInfo>
  ts: number
}

// ============================================================================
// sessionStorage 缓存
// ============================================================================

function getCachedLikes(): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(LIKES_CACHE_KEY)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() - entry.ts > CACHE_TTL) {
      sessionStorage.removeItem(LIKES_CACHE_KEY)
      return null
    }
    return entry
  } catch {
    return null
  }
}

function setCachedLikes(newData: Record<string, LikeInfo>): void {
  try {
    const existing = getCachedLikes()
    const merged = existing ? { ...existing.data, ...newData } : newData
    sessionStorage.setItem(
      LIKES_CACHE_KEY,
      JSON.stringify({ data: merged, ts: Date.now() }),
    )
  } catch {
    // sessionStorage 不可用，忽略
  }
}

function updateCacheEntry(key: string, info: Partial<LikeInfo>): void {
  try {
    const existing = getCachedLikes()
    if (existing?.data[key]) {
      existing.data[key] = { ...existing.data[key], ...info }
      sessionStorage.setItem(LIKES_CACHE_KEY, JSON.stringify(existing))
    }
  } catch {
    // 忽略
  }
}

// ============================================================================
// getLikes：批量查询，50ms 合并窗口
// ============================================================================

let pendingGetIds: string[] = []
let pendingGetType: string = ''
let pendingGetResolvers: Array<{
  resolve: (v: Record<string, LikeInfo>) => void
  reject: (e: unknown) => void
}> = []
let getTimer: ReturnType<typeof setTimeout> | null = null

async function fetchLikesFromAPI(
  ids: string[],
  type: string,
): Promise<Record<string, LikeInfo>> {
  const fingerprint = await getFingerprint()
  const params = new URLSearchParams({ ids: ids.join(','), type, fingerprint })
  const response = await fetch(`${API_BASE}?${params}`)
  if (!response.ok) throw new Error(`fetch likes failed: ${response.status}`)
  const data = await response.json()
  return data.likes || {}
}

function flushGetBatch(): void {
  if (pendingGetIds.length === 0) return

  const ids = [...new Set(pendingGetIds)]
  const type = pendingGetType
  const resolvers = [...pendingGetResolvers]

  pendingGetIds = []
  pendingGetType = ''
  pendingGetResolvers = []
  getTimer = null

  fetchLikesFromAPI(ids, type)
    .then((result) => {
      setCachedLikes(result)
      for (const r of resolvers) r.resolve(result)
    })
    .catch((err) => {
      for (const r of resolvers) r.reject(err)
    })
}

export function getLikes(
  ids: string[],
  type: 'thought',
): Promise<Record<string, LikeInfo>> {
  // 先尝试全量命中缓存
  const cached = getCachedLikes()
  const prefixedIds = ids.map((id) => `${type}:${id}`)
  if (cached && prefixedIds.every((id) => id in cached.data)) {
    const result: Record<string, LikeInfo> = {}
    for (const id of prefixedIds) result[id] = cached.data[id]
    return Promise.resolve(result)
  }

  // 加入 50ms 合并窗口
  return new Promise((resolve, reject) => {
    pendingGetIds.push(...ids)
    pendingGetType = type
    pendingGetResolvers.push({ resolve, reject })
    if (getTimer) clearTimeout(getTimer)
    getTimer = setTimeout(flushGetBatch, 50)
  }) as Promise<Record<string, LikeInfo>>
}

// ============================================================================
// sendLike：防抖批量写入，800ms 合并窗口
//
// 用户在 800ms 内点赞的所有条目会被打包成一个 batch POST 发送，
// 服务端的写缓冲再次合并，最终一次 GitHub PATCH 搞定所有操作。
// ============================================================================

interface PendingLikeOp {
  targetId: string
  type: 'thought'
  resolve: (result: LikeResult) => void
  reject: (err: unknown) => void
}

let pendingLikeOps: PendingLikeOp[] = []
let likeDebounceTimer: ReturnType<typeof setTimeout> | null = null

/** 将所有积压操作打包发送 */
async function flushLikeBatch(): Promise<void> {
  if (pendingLikeOps.length === 0) return

  const ops = [...pendingLikeOps]
  pendingLikeOps = []
  likeDebounceTimer = null

  const fingerprint = await getFingerprint()

  // 单个操作走简单路径
  if (ops.length === 1) {
    const op = ops[0]
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: op.targetId,
          type: op.type,
          fingerprint,
        }),
      })
      if (!response.ok) {
        op.reject(
          response.status === 429
            ? new Error('请求太频繁，请稍后再试')
            : new Error('点赞失败'),
        )
        return
      }
      const data: LikeResult = await response.json()
      updateCacheEntry(`${op.type}:${op.targetId}`, {
        total: data.total,
        userToday: data.userToday,
      })
      op.resolve(data)
    } catch (err) {
      op.reject(err)
    }
    return
  }

  // 多个操作 → 批量请求
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operations: ops.map((op) => ({
          targetId: op.targetId,
          type: op.type,
        })),
        fingerprint,
      }),
    })

    if (!response.ok) {
      const err =
        response.status === 429
          ? new Error('请求太频繁，请稍后再试')
          : new Error('点赞失败')
      for (const op of ops) op.reject(err)
      return
    }

    const data = await response.json()

    if (!data.batch || !data.results) {
      const err = new Error('Unexpected response format')
      for (const op of ops) op.reject(err)
      return
    }

    const results: Record<string, LikeResult> = data.results

    // 更新缓存
    for (const [key, result] of Object.entries(results)) {
      updateCacheEntry(key, {
        total: result.total,
        userToday: result.userToday,
      })
    }

    // 将结果分发给每个 op
    for (const op of ops) {
      const key = `${op.type}:${op.targetId}`
      const result = results[key]
      if (result) {
        op.resolve(result)
      } else {
        // 该条目未出现在结果中（被过滤或超出日上限），当作 daily_cap 处理
        op.resolve({
          success: false,
          limited: true,
          limitReason: 'daily_cap',
          message: '今天已经点赞了 10 条，明天再来吧',
          total: 0,
          userToday: 0,
          dailyLimit: 1,
        })
      }
    }
  } catch (err) {
    for (const op of ops) op.reject(err)
  }
}

/**
 * 发送点赞请求（防抖批量版）
 *
 * 调用后不会立即发请求，而是将操作放入队列，
 * 在 800ms 内无新操作时才统一发送批量请求。
 */
export function sendLike(
  targetId: string,
  type: 'thought',
): Promise<LikeResult> {
  return new Promise((resolve, reject) => {
    pendingLikeOps.push({ targetId, type, resolve, reject })

    if (likeDebounceTimer) clearTimeout(likeDebounceTimer)
    likeDebounceTimer = setTimeout(() => {
      flushLikeBatch().catch(() => {
        // 内部已 reject 所有 op，此处仅防止 unhandled rejection
      })
    }, 800)
  })
}

/**
 * 格式化点赞数显示
 */
export function formatLikeCount(count: number): string {
  if (count === 0) return ''
  if (count < 1000) return `${count}`
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`
  return `${(count / 10000).toFixed(1)}w`
}
