import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import sharp from 'sharp'

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const MASKABLE_SIZES = [192, 512]

const sourceIcon = join(process.cwd(), 'public/icons/ios-180.png')
const outputDir = join(process.cwd(), 'public/icons')

async function generateIcons() {
  if (!existsSync(sourceIcon)) {
    console.error('❌ 源图标文件不存在:', sourceIcon)
    console.log('请确保 public/icons/ios-180.png 文件存在')
    process.exit(1)
  }

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  console.log('🎨 开始生成 PWA 图标...\n')

  // 生成标准图标
  for (const size of ICON_SIZES) {
    const outputPath = join(outputDir, `icon-${size}x${size}.png`)

    try {
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toFile(outputPath)

      console.log(`✅ 已生成: icon-${size}x${size}.png`)
    } catch (error) {
      console.error(`❌ 生成 ${size}x${size} 图标失败:`, error)
    }
  }

  console.log('\n🎭 生成 Maskable 图标...\n')

  // 生成 maskable 图标（带安全区域的图标）
  for (const size of MASKABLE_SIZES) {
    const outputPath = join(outputDir, `icon-${size}x${size}-maskable.png`)
    const padding = Math.floor(size * 0.1) // 10% 的安全边距

    try {
      // 创建一个带背景色的 maskable 图标
      const iconBuffer = await sharp(sourceIcon)
        .resize(size - padding * 2, size - padding * 2, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toBuffer()

      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 250, g: 250, b: 249, alpha: 1 }, // 使用你的 theme color
        },
      })
        .composite([
          {
            input: iconBuffer,
            gravity: 'center',
          },
        ])
        .png()
        .toFile(outputPath)

      console.log(`✅ 已生成: icon-${size}x${size}-maskable.png`)
    } catch (error) {
      console.error(`❌ 生成 ${size}x${size} maskable 图标失败:`, error)
    }
  }

  console.log('\n✨ PWA 图标生成完成！')
  console.log('\n📝 生成的文件列表:')
  console.log('   标准图标:', ICON_SIZES.map((s) => `${s}x${s}`).join(', '))
  console.log(
    '   Maskable 图标:',
    MASKABLE_SIZES.map((s) => `${s}x${s}`).join(', '),
  )
  console.log('\n💡 提示:')
  console.log('   - 标准图标用于大多数设备')
  console.log('   - Maskable 图标用于 Android 自适应图标')
  console.log('   - 你可能还需要手动创建截图文件用于 PWA 安装提示')
  console.log('   - 截图路径: public/screenshots/desktop.png 和 mobile.png')
}

generateIcons().catch((error) => {
  console.error('❌ 生成图标时发生错误:', error)
  process.exit(1)
})
