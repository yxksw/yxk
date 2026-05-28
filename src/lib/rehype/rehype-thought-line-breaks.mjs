const THOUGHTS_PATH_MARKER = 'src/content/thoughts/'
const BLOCK_LIKE_TAGS = new Set([
  'address',
  'article',
  'aside',
  'audio',
  'blockquote',
  'canvas',
  'div',
  'dl',
  'embed',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'iframe',
  'img',
  'object',
  'ol',
  'picture',
  'pre',
  'section',
  'table',
  'ul',
  'video',
])

function isThoughtFile(file) {
  const paths = [file?.path, ...(file?.history ?? [])]

  return paths
    .filter(Boolean)
    .map((path) => String(path).replaceAll('\\', '/'))
    .some((path) => path.includes(THOUGHTS_PATH_MARKER))
}

function isWhitespaceText(node) {
  return node?.type === 'text' && node.value.trim() === ''
}

function hasBlockLikeDescendant(node) {
  if (node?.type !== 'element') return false
  if (BLOCK_LIKE_TAGS.has(node.tagName)) return true

  return node.children?.some(hasBlockLikeDescendant) ?? false
}

function hasVisibleContent(node) {
  return (
    node?.children?.some((child) => {
      if (child.type === 'text') return child.value.trim() !== ''
      return true
    }) ?? false
  )
}

function isMergeableParagraph(node) {
  return (
    node?.type === 'element' &&
    node.tagName === 'p' &&
    hasVisibleContent(node) &&
    !hasBlockLikeDescendant(node)
  )
}

function mergeParagraphRun(paragraphs) {
  const [first] = paragraphs
  const children = []

  paragraphs.forEach((paragraph, index) => {
    if (index > 0) {
      children.push({
        type: 'element',
        tagName: 'br',
        properties: {},
        children: [],
      })
    }

    children.push(...(paragraph.children ?? []))
  })

  return {
    ...first,
    children,
  }
}

function mergeAdjacentParagraphs(parent) {
  if (!Array.isArray(parent.children)) return

  const mergedChildren = []
  let index = 0

  while (index < parent.children.length) {
    const child = parent.children[index]

    if (!isMergeableParagraph(child)) {
      mergedChildren.push(child)
      index += 1
      continue
    }

    const paragraphs = [child]
    let nextIndex = index + 1

    while (nextIndex < parent.children.length) {
      const nextChild = parent.children[nextIndex]

      if (isWhitespaceText(nextChild)) {
        nextIndex += 1
        continue
      }

      if (!isMergeableParagraph(nextChild)) break

      paragraphs.push(nextChild)
      nextIndex += 1
    }

    mergedChildren.push(
      paragraphs.length > 1 ? mergeParagraphRun(paragraphs) : child,
    )
    index = nextIndex
  }

  parent.children = mergedChildren
}

function transformNode(node) {
  if (!Array.isArray(node.children)) return

  node.children.forEach(transformNode)
  mergeAdjacentParagraphs(node)
}

export default function rehypeThoughtLineBreaks() {
  return (tree, file) => {
    if (!isThoughtFile(file)) return

    transformNode(tree)
  }
}
