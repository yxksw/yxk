import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 获取命令行参数
const args = process.argv.slice(2)
const slug = args[0]

if (!slug) {
  console.log('❌ 请提供 slug')
  console.log('用法: bun new:blog "my-post"')
  process.exit(1)
}

// 验证 slug 格式（只允许小写字母、数字、连字符）
const slugPattern = /^[a-z0-9-]+$/
if (!slugPattern.test(slug)) {
  console.log('❌ Slug 格式无效')
  console.log('💡 只允许小写字母、数字和连字符，例如: my-post')
  process.exit(1)
}

// 查找使用指定 slug 的文件
function findFileWithSlug(dir: string, targetSlug: string): string | null {
  if (!fs.existsSync(dir)) {
    return null
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      const result = findFileWithSlug(fullPath, targetSlug)
      if (result) return result
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf-8')
      const slugMatch = content.match(/^slug:\s*(.+)$/m)

      if (slugMatch && slugMatch[1].trim() === targetSlug) {
        return fullPath
      }
    }
  }

  return null
}

// 获取当前日期时间（ISO 8601 格式，带本地时区）
const now = new Date()
const year = now.getFullYear()
const month = String(now.getMonth() + 1).padStart(2, '0')
const day = String(now.getDate()).padStart(2, '0')

// 使用 toISOString 然后替换时区
// 方法1：手动构建（更精确控制）
function toLocalISOString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  const offset = -date.getTimezoneOffset()
  const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')
  const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0')
  const offsetSign = offset >= 0 ? '+' : '-'

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`
}

const dateStr = toLocalISOString(now)

const filename = `${day}_${slug}.md`
const dirPath = path.join(
  __dirname,
  '../src/content/posts',
  String(year),
  month,
)
const filePath = path.join(dirPath, filename)
const blogDir = path.join(__dirname, '../src/content/posts')

// 检查 slug 是否已存在
const existingFile = findFileWithSlug(blogDir, slug)
if (existingFile) {
  console.log('❌ Slug 已存在:', slug)
  console.log('📄 已被使用于:', existingFile)
  process.exit(1)
}

// 检查文件是否已存在
if (fs.existsSync(filePath)) {
  console.log('❌ 文件已存在:', filePath)
  process.exit(1)
}

// 创建目录（如果不存在）
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true })
  console.log('📁 创建目录:', dirPath)
}

// 生成 frontmatter
const frontmatter = `---
title: ${slug}
description: ${slug}
date: ${dateStr}
slug: ${slug}
draft: true
---

开始编写内容～
`

// 写入文件
fs.writeFileSync(filePath, frontmatter, 'utf-8')

console.log('\n✨ 成功创建博客文章！\n')
console.log('🔗 Slug:', slug)
console.log('📅 日期:', dateStr)
console.log('📄 文件:', filePath)
console.log('\n💡 记得修改 title 和 description！')
