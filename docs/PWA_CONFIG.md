# PWA 配置文档

本文档说明了博客的 PWA (Progressive Web App) 配置。

## 📋 概述

PWA 使网站能够像原生应用一样安装到用户的设备上，提供离线访问、推送通知等功能。

## ✅ 已配置项

### 1. Web App Manifest (`public/manifest.json`)

包含应用的元数据：

- **name**: "Astro Doge" - 完整应用名称
- **short_name**: "Astro Doge" - 短名称（桌面图标下显示）
- **description**: 应用描述
- **start_url**: "/" - 启动 URL
- **display**: "standalone" - 独立窗口显示
- **theme_color**: "#fafaf9" - 主题色（浏览器地址栏）
- **background_color**: "#fafaf9" - 启动画面背景色
- **icons**: 多尺寸图标（72px 到 512px）
- **shortcuts**: 快捷方式（文章、碎碎念、项目）
- **screenshots**: 应用截图（可选）

### 2. Service Worker (`public/sw.js`)

实现离线功能和缓存策略：

- **安装阶段**: 预缓存核心资源（首页、离线页面、manifest）
- **激活阶段**: 清理旧缓存
- **Fetch 策略**: 网络优先（Network First）
  - 优先尝试网络请求
  - 失败时回退到缓存
  - 导航请求失败时显示离线页面

### 3. 应用图标 (`public/icons/`)

生成了完整的图标集：

| 尺寸    | 用途           | 文件名                    |
| ------- | -------------- | ------------------------- |
| 72x72   | 小图标         | icon-72x72.png            |
| 96x96   | 小图标         | icon-96x96.png            |
| 128x128 | 中图标         | icon-128x128.png          |
| 144x144 | 中图标         | icon-144x144.png          |
| 152x152 | 中图标         | icon-152x152.png          |
| 192x192 | 标准图标       | icon-192x192.png          |
| 384x384 | 大图标         | icon-384x384.png          |
| 512x512 | 最大图标       | icon-512x512.png          |
| 192x192 | Android 自适应 | icon-192x192-maskable.png |
| 512x512 | Android 自适应 | icon-512x512-maskable.png |
| 180x180 | iOS 图标       | ios-180.png               |

### 4. HTML Meta 标签 (`src/components/Head.astro`)

添加了以下配置：

```html
<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json" />

<!-- Theme Color -->
<meta
  name="theme-color"
  content="#fafaf9"
  media="(prefers-color-scheme: light)"
/>
<meta
  name="theme-color"
  content="#0c0a09"
  media="(prefers-color-scheme: dark)"
/>

<!-- iOS PWA -->
<link rel="apple-touch-icon" href="/icons/ios-180.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta
  name="apple-mobile-web-app-status-bar-style"
  content="black-translucent"
/>
```

### 5. 离线页面 (`src/pages/offline.astro`)

当用户离线时显示的友好页面：

- 显示离线状态提示
- 提供重新连接按钮
- 返回首页链接
- 自动检测网络恢复

## 🛠️ 使用脚本

### 生成 PWA 图标

```bash
bun run scripts/generate-pwa-icons.ts
```

从 `public/icons/ios-180.png` 生成所有需要的图标尺寸。

### 检查 PWA 配置

```bash
bun run scripts/check-pwa.ts
```

验证所有 PWA 配置是否正确。

## 📱 测试 PWA

### 1. 本地测试

```bash
bun run build
bun run preview
```

然后在浏览器中打开 `http://localhost:4321`

### 2. Chrome DevTools 测试

1. 打开 Chrome DevTools (F12)
2. 切换到 **Application** 标签
3. 检查：
   - **Manifest**: 查看 manifest 配置
   - **Service Workers**: 查看 SW 状态
   - **Storage** > Cache Storage: 查看缓存内容
4. 切换到 **Network** 标签
5. 选择 **Offline** 模拟离线状态
6. 刷新页面测试离线功能

### 3. Lighthouse 审计

1. 打开 Chrome DevTools
2. 切换到 **Lighthouse** 标签
3. 选择 **Progressive Web App** 类别
4. 点击 **Generate report**
5. 查看 PWA 评分和改进建议

### 4. 安装测试

**桌面端 (Chrome/Edge)**:

- 地址栏右侧会出现安装图标 ⊕
- 点击安装到桌面

**移动端 (Chrome/Safari)**:

- Chrome: 菜单 > "添加到主屏幕"
- Safari: 分享 > "添加到主屏幕"

## 🚀 部署要求

### 必须条件

1. **HTTPS**: PWA 必须在 HTTPS 下运行（localhost 除外）
2. **Service Worker**: 必须成功注册
3. **Manifest**: 必须包含必需字段

### Vercel 部署

当前配置已针对 Vercel 优化：

- `astro.config.mjs` 使用 `@astrojs/vercel` 适配器
- 静态文件自动部署到 CDN
- HTTPS 自动配置

## 📊 缓存策略

### 网络优先 (Network First)

```
请求 → 网络请求
  ↓ 成功
  返回响应 + 更新缓存
  ↓ 失败
  尝试缓存
  ↓ 缓存命中
  返回缓存
  ↓ 缓存未命中
  返回离线页面/错误
```

**优点**:

- 始终获取最新内容
- 网络故障时仍可访问
- 适合博客内容

**缺点**:

- 首次加载需要网络
- 网络慢时体验欠佳

## 🔧 自定义配置

### 修改应用名称

编辑 `public/manifest.json`:

```json
{
  "name": "你的应用名称",
  "short_name": "短名称"
}
```

### 修改主题色

1. 编辑 `public/manifest.json`:

```json
{
  "theme_color": "#你的颜色",
  "background_color": "#你的颜色"
}
```

2. 编辑 `src/components/Head.astro`:

```html
<meta name="theme-color" content="#你的颜色" />
```

### 修改缓存策略

编辑 `public/sw.js` 中的 fetch 事件监听器。

常见策略：

- **Cache First**: 优先使用缓存（快速，但内容可能过期）
- **Network First**: 优先使用网络（当前使用）
- **Stale While Revalidate**: 使用缓存同时更新

### 添加应用截图

1. 创建截图文件：
   - `public/screenshots/desktop.png` (1280x720)
   - `public/screenshots/mobile.png` (750x1334)

2. 截图会在 PWA 安装提示中显示

## 🐛 故障排除

### Service Worker 未注册

1. 检查浏览器控制台错误
2. 确保在 HTTPS 下运行（或 localhost）
3. 清除浏览器缓存和 Service Workers
4. 检查 `public/sw.js` 是否存在

### 图标不显示

1. 检查图标文件是否存在于 `public/icons/`
2. 验证 `manifest.json` 中的图标路径
3. 清除浏览器缓存
4. 使用 DevTools 检查网络请求

### 离线功能不工作

1. 确保 Service Worker 已激活
2. 检查缓存策略配置
3. 使用 DevTools > Application > Cache Storage 查看缓存内容
4. 确保 `offline.astro` 页面已构建

### PWA 无法安装

1. 运行 Lighthouse PWA 审计查看具体问题
2. 检查 manifest.json 必需字段
3. 确保有 192x192 和 512x512 图标
4. 确保网站在 HTTPS 下运行

## 📚 更多资源

- [PWA 官方文档](https://web.dev/progressive-web-apps/)
- [MDN Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker 教程](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox (高级 SW 工具)](https://developers.google.com/web/tools/workbox)
- [PWA Builder](https://www.pwabuilder.com/)

## ✨ 未来改进

- [ ] 添加推送通知支持
- [ ] 实现后台同步
- [ ] 添加 PWA 安装提示组件
- [ ] 优化缓存策略（分层缓存）
- [ ] 添加应用更新提示
- [ ] 支持离线表单提交
- [ ] 添加更多快捷方式
- [ ] 优化应用截图

## 📝 维护清单

定期检查：

- [ ] Service Worker 是否正常工作
- [ ] 缓存大小是否合理
- [ ] 图标是否清晰
- [ ] 离线功能是否正常
- [ ] Lighthouse PWA 评分
- [ ] 不同设备上的安装体验

---

最后更新: 2024-12-20
