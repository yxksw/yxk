import type { CollectionEntry } from 'astro:content'

export const showDraftPosts = import.meta.env.DEV

export function isVisiblePost(post: CollectionEntry<'posts'>): boolean {
  return showDraftPosts || !post.data.draft
}
