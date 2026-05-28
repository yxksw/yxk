import { copyFileSync, existsSync } from 'fs'
import { join } from 'path'

const distDir = join(process.cwd(), 'dist', 'client')
const src = join(distDir, 'sitemap-0.xml')
const dest = join(distDir, 'sitemap.xml')

if (!existsSync(src)) {
  console.error('❌ sitemap-0.xml not found, skipping sitemap.xml generation.')
  process.exit(1)
}

copyFileSync(src, dest)
console.log('✅ sitemap.xml generated from sitemap-0.xml')
