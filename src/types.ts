export type Site = {
  NAME: string
  EMAIL: string
  DESCRIPTION: string
  NUM_POSTS_ON_HOMEPAGE: number
  NUM_THOUGHTS_ON_HOMEPAGE: number
  NUM_RELATED_POSTS_ON_POST: number
}

export type Metadata = {
  TITLE: string
  DESCRIPTION: string
}

export type Socials = {
  NAME: string
  HREF: string
}[]

export type ProjectItem = {
  name: string
  href: string
  homepage?: string
  description: string
  badge?: string
  stars?: string
}

export type ProjectCategory = {
  category: string
  items: ProjectItem[]
}

export type Projects = ProjectCategory[]

export type TechItem = {
  name: string
  href: string
  description: string
}

export type TechCategory = {
  category: string
  items: TechItem[]
}

export type TechStack = TechCategory[]
