import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

interface CheckResult {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
}

interface ManifestIcon {
  sizes?: string
  purpose?: string
}

interface WebManifest {
  name?: string
  short_name?: string
  start_url?: string
  display?: string
  description?: string
  theme_color?: string
  background_color?: string
  icons?: ManifestIcon[]
}

const results: CheckResult[] = []

function check(
  name: string,
  condition: boolean,
  message: string,
  isWarning = false,
) {
  results.push({
    name,
    status: condition ? 'pass' : isWarning ? 'warn' : 'fail',
    message,
  })
}

console.log('🔍 检查 PWA 配置...\n')

// 1. 检查 manifest.json
const manifestPath = join(process.cwd(), 'public/manifest.json')
if (existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(
      readFileSync(manifestPath, 'utf-8'),
    ) as WebManifest
    check('Manifest 文件', true, 'manifest.json 存在且格式正确')

    // 检查必需字段
    check(
      'Manifest - name',
      !!manifest.name,
      `name: ${manifest.name || '❌ 缺失'}`,
    )
    check(
      'Manifest - short_name',
      !!manifest.short_name,
      `short_name: ${manifest.short_name || '❌ 缺失'}`,
    )
    check(
      'Manifest - start_url',
      !!manifest.start_url,
      `start_url: ${manifest.start_url || '❌ 缺失'}`,
    )
    check(
      'Manifest - display',
      !!manifest.display,
      `display: ${manifest.display || '❌ 缺失'}`,
    )
    check(
      'Manifest - icons',
      manifest.icons && manifest.icons.length > 0,
      `图标数量: ${manifest.icons?.length || 0}`,
    )

    // 检查推荐字段
    check(
      'Manifest - description',
      !!manifest.description,
      `description: ${manifest.description ? '✓' : '❌ 缺失'}`,
      true,
    )
    check(
      'Manifest - theme_color',
      !!manifest.theme_color,
      `theme_color: ${manifest.theme_color || '❌ 缺失'}`,
      true,
    )
    check(
      'Manifest - background_color',
      !!manifest.background_color,
      `background_color: ${manifest.background_color || '❌ 缺失'}`,
      true,
    )

    // 检查图标尺寸
    const iconSizes = manifest.icons?.map((icon) => icon.sizes) || []
    check(
      'Manifest - 192x192 图标',
      iconSizes.includes('192x192'),
      '需要 192x192 尺寸的图标',
    )
    check(
      'Manifest - 512x512 图标',
      iconSizes.includes('512x512'),
      '需要 512x512 尺寸的图标',
    )
    check(
      'Manifest - maskable 图标',
      manifest.icons?.some((icon) => icon.purpose === 'maskable'),
      '建议提供 maskable 图标',
      true,
    )
  } catch (error) {
    check('Manifest 文件', false, 'manifest.json 格式错误: ' + error)
  }
} else {
  check('Manifest 文件', false, 'manifest.json 不存在')
}

// 2. 检查 Service Worker
const swPath = join(process.cwd(), 'public/sw.js')
check(
  'Service Worker',
  existsSync(swPath),
  existsSync(swPath) ? 'sw.js 存在' : 'sw.js 不存在',
)

// 3. 检查图标文件
const requiredIcons = [
  'icon-72x72.png',
  'icon-96x96.png',
  'icon-128x128.png',
  'icon-144x144.png',
  'icon-152x152.png',
  'icon-192x192.png',
  'icon-512x512.png',
  'icon-192x192-maskable.png',
  'icon-512x512-maskable.png',
  'ios-180.png',
]

const iconsDir = join(process.cwd(), 'public/icons')
let iconCount = 0
requiredIcons.forEach((icon) => {
  const iconPath = join(iconsDir, icon)
  if (existsSync(iconPath)) {
    iconCount++
  }
})

check(
  '图标文件',
  iconCount === requiredIcons.length,
  `${iconCount}/${requiredIcons.length} 个图标文件存在`,
)

// 4. 检查 Head 组件中的 PWA 配置
const headPath = join(process.cwd(), 'src/components/Head.astro')
if (existsSync(headPath)) {
  const headContent = readFileSync(headPath, 'utf-8')
  check(
    'Manifest 链接',
    headContent.includes('rel="manifest"'),
    'Head 组件包含 manifest 链接',
  )
  check(
    'Apple Touch Icon',
    headContent.includes('rel="apple-touch-icon"'),
    'Head 组件包含 Apple Touch Icon',
  )
  check(
    'Theme Color',
    headContent.includes('name="theme-color"'),
    'Head 组件包含 theme-color 元数据',
  )
  check(
    'Service Worker 注册',
    headContent.includes('serviceWorker') && headContent.includes('register'),
    'Head 组件包含 Service Worker 注册脚本',
  )
} else {
  check('Head 组件', false, '找不到 Head.astro 组件')
}

// 5. 检查离线页面
const offlinePath = join(process.cwd(), 'src/pages/offline.astro')
check(
  '离线页面',
  existsSync(offlinePath),
  existsSync(offlinePath) ? 'offline.astro 存在' : 'offline.astro 不存在',
  true,
)

// 6. 检查 HTTPS (生产环境必需)
console.log('\n📋 检查结果:\n')

const passed = results.filter((r) => r.status === 'pass').length
const failed = results.filter((r) => r.status === 'fail').length
const warned = results.filter((r) => r.status === 'warn').length

results.forEach((result) => {
  const icon =
    result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌'
  const color =
    result.status === 'pass'
      ? '\x1b[32m'
      : result.status === 'warn'
        ? '\x1b[33m'
        : '\x1b[31m'
  const reset = '\x1b[0m'
  console.log(`${icon} ${color}${result.name}${reset}: ${result.message}`)
})

console.log(`\n📊 统计: ${passed} 通过, ${failed} 失败, ${warned} 警告`)

if (failed === 0 && warned === 0) {
  console.log('\n🎉 恭喜！你的 PWA 配置完美！')
} else if (failed === 0) {
  console.log('\n✨ 很好！PWA 配置基本完成，有一些可选的改进项。')
} else {
  console.log('\n⚠️  请修复失败的项目以确保 PWA 正常工作。')
}

console.log('\n💡 其他建议:')
console.log('   1. 确保网站部署在 HTTPS 上（PWA 必需）')
console.log('   2. 测试 PWA 安装功能（Chrome: 地址栏右侧的安装图标）')
console.log('   3. 使用 Chrome DevTools 的 Lighthouse 进行完整审计')
console.log('   4. 测试离线功能（DevTools > Network > Offline）')
console.log('   5. 添加截图以改善 PWA 安装体验（public/screenshots/）')
console.log('   6. 考虑添加 PWA 安装提示组件')

process.exit(failed > 0 ? 1 : 0)
