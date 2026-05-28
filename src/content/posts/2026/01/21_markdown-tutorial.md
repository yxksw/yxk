---
title: Markdown 写作入门
description: 掌握几种常用语法，就能开始写第一篇文章。
date: 2026-01-21T13:30:02+08:00
slug: markdown-tutorial
cover: /covers/markdown.webp
draft: false
---

Markdown 的好处是简单。你写的是纯文本，博客会把它渲染成排版好的页面。

这篇只保留最常用的写法，够你开始写文章。

## 标题

用 `#` 表示标题层级，`#` 后面要加一个空格。

```md
# 一级标题

## 二级标题

### 三级标题
```

通常文章里从 `##` 开始写小标题就够了，因为页面标题已经是一级标题。

## 段落

段落之间空一行。

```md
这是第一段。

这是第二段。
```

如果只是按一次回车，Markdown 通常仍会把它当成同一个段落。

## 强调

```md
**粗体**
_斜体_
`行内代码`
```

效果分别是：**粗体**、_斜体_、`行内代码`。

## 列表

无序列表用 `-`：

```md
- 写文章
- 调样式
- 部署网站
```

有序列表用数字：

```md
1. 安装依赖
2. 启动开发服务
3. 开始写作
```

## 链接和图片

```md
[Astro](https://astro.build)

![图片说明](/covers/markdown.webp)
```

图片路径可以放在 `public/` 目录下。比如 `public/covers/markdown.webp` 在文章里写成 `/covers/markdown.webp`。

## 代码块

用三个反引号包住多行代码，并标上语言名称。

````md
```ts
const siteName = 'Astro Doge'
console.log(siteName)
```
````

渲染后会自动高亮。

```ts
const siteName = 'Astro Doge'
console.log(siteName)
```

## Frontmatter

文章最上方的 `---` 区域叫 frontmatter，用来写标题、日期、摘要等信息。

```md
---
title: 我的第一篇文章
description: 文章摘要
date: 2026-01-21T13:30:02+08:00
slug: my-first-post
cover: /covers/markdown.webp
draft: false
---
```

`draft: true` 会把文章标成草稿，不参与生产构建。

## 下一步

先不用把 Markdown 全部记住。打开一篇示例文章，照着改一遍，很快就会顺手。
