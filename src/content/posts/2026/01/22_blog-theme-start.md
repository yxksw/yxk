---
title: Astro Doge 快速开始
description: 从安装依赖到写第一篇文章，按这几步来就行。
date: 2026-01-22T12:30:02+08:00
slug: blog-theme-start
cover: /covers/start.webp
draft: false
---

Astro Doge 是一个静态优先的 Astro 博客模板。你可以只把它当普通静态博客用，也可以按需开启评论、点赞和在线发布。

这篇先让项目跑起来。

## 安装依赖

推荐使用 Bun。

```bash
bun install
```

如果你习惯 npm、pnpm 或 yarn，也可以换成对应命令。

## 启动开发服务

```bash
bun dev
```

打开 `http://localhost:4321`。如果能看到首页，就说明本地环境已经准备好了。

## 修改站点信息

先改这几个地方：

- `astro.config.mjs`：把 `site` 改成你的域名
- `src/consts.ts`：站点名、描述、邮箱、社交链接
- `public/avatar.png`：头像
- `public/manifest.json`：PWA 名称和描述
- `src/pages/about/index.astro`：关于页文案

改完之后刷新页面，就能看到大部分内容变成你的站点。

## 写第一篇文章

使用脚本创建文章：

```bash
bun new:blog my-first-post
```

也可以直接在 `src/content/posts/` 里新建 Markdown 文件。

文章开头需要 frontmatter：

```md
---
title: 我的第一篇文章
description: 一段简单摘要
date: 2026-01-22T12:30:02+08:00
slug: my-first-post
cover: /covers/start.webp
draft: false
---

正文从这里开始。
```

## 写碎碎念

碎碎念适合放短想法、更新记录和日常片段。

```bash
bun t
```

内容会写入 `src/content/thoughts/`。

## 写相册

相册内容放在 `src/content/albums/`。一条相册内容就是一个 Markdown 文件，主要字段是图片地址和日期。

```md
---
title: 一张照片
date: 2026-01-22T12:30:02+08:00
src: /hero.webp
thumb: /hero.webp
alt: 图片说明
draft: false
---
```

## 构建检查

发布前跑一次：

```bash
bun run build
```

如果没有报错，就可以部署。

## 需要动态能力时

评论、留言板、点赞、在线发布都需要后端。模板已经带了 Vercel API，配置 `.env.example` 里的环境变量后即可启用。

如果你只想写静态博客，可以完全不管这些接口。
