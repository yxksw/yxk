---
title: Astro Doge 功能一览
description: 这个模板默认带了哪些页面和能力。
date: 2026-01-23T10:00:00+08:00
slug: theme-features
cover: /covers/features.webp
draft: false
---

这篇是一个简短索引，方便你知道模板里有什么、应该去哪里改。

## 页面

默认页面都在 `src/pages/`。

| 路由        | 说明             |
| ----------- | ---------------- |
| `/`         | 首页             |
| `/posts`    | 文章列表         |
| `/thoughts` | 碎碎念           |
| `/moments`  | 相册             |
| `/messages` | 留言板           |
| `/friends`  | 友链             |
| `/about`    | 关于             |
| `/rss.xml`  | RSS              |
| `/offline`  | PWA 离线提示页面 |

不需要的页面可以直接删掉，导航在 `src/components/Header.astro` 里改。

## 内容

三类内容都由 Astro Content Collections 管理。

- 文章：`src/content/posts/`
- 碎碎念：`src/content/thoughts/`
- 相册：`src/content/albums/`

字段定义在 `src/content.config.ts`。如果你想给文章加 `tags`、给相册加更多信息，可以从这里扩展。

## 搜索

按 `Ctrl K` 或 `Cmd K` 打开搜索。搜索数据由 `src/pages/api/search.json.ts` 在构建时生成，不需要额外服务。

## 阅读体验

文章页默认有这些细节：

- 自动阅读时间
- 目录导航
- 标题锚点
- 图片灯箱
- GitHub Alert 语法
- 代码高亮
- 文章底部评论区

这些功能都可以按组件拆掉或替换。

## PWA

模板自带 `public/manifest.json` 和 `public/sw.js`。构建后可以安装到桌面或手机主屏幕。

检查配置：

```bash
bun run pwa:check
```

如果你换了头像或图标，也可以重新生成图标：

```bash
bun run pwa:icons
```

## 可选 API

仓库根目录的 `api/` 目录用于 Vercel Functions。

目前包含：

- 评论和留言板
- 碎碎念点赞
- 在线发布碎碎念
- 在线发布相册
- 图片上传代理

如果你部署在纯静态平台，这些 API 不会生效，但页面仍然可以正常作为静态博客使用。

## 配置入口

最常改的是这几个文件：

- `src/consts.ts`：站点信息、项目、技术栈、社交链接
- `src/pages/about/index.astro`：关于页
- `src/pages/friends/index.astro`：友链
- `src/styles/global.css`：全局样式
- `.env.example`：动态能力需要的环境变量说明

保持这些入口清晰，后面维护会轻松很多。
