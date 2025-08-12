import { getPageContent } from '@/lib/content/server'
import { BlogPage } from '@/components/pages/BlogPage'
import type { Metadata } from 'next'

// Generate metadata from content
export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent('blog')
  
  return {
    title: content.meta.title,
    description: content.meta.description,
    keywords: content.meta.keywords.join(', '),
    openGraph: {
      title: content.meta.title,
      description: content.meta.description,
      locale: content.meta.language,
    },
    alternates: {
      languages: {
        [content.meta.language]: '/blog',
      },
    },
  }
}

export default async function BlogPageRoute() {
  // Load content from YAML file
  const content = await getPageContent('blog')
  
  return <BlogPage content={content} />
}