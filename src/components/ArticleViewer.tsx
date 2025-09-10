import React from 'react'
import { supabase } from '../lib/supabase'
import styles from './ArticleViewer.module.css'

// Определяем типы локально для решения проблемы с кэшем
interface Article {
  id: string
  title: string
  subtitle?: string
  slug: string
  excerpt?: string
  featured_image?: string
  type: 'project' | 'research'
  status: 'draft' | 'published' | 'archived'
  order_index: number
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
}

interface ArticleBlock {
  id: string
  article_id: string
  block_type: 'text' | 'image' | 'map' | 'code' | 'quote'
  content?: string
  image_url?: string
  image_alt?: string
  map_embed?: string
  order_index: number
  created_at: string
  updated_at: string
}

interface ArticleViewerProps {
  article: Article
}

const ArticleViewer: React.FC<ArticleViewerProps> = ({ article }) => {
  const [blocks, setBlocks] = React.useState<ArticleBlock[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchBlocks()
  }, [article.id])

  const fetchBlocks = async () => {
    try {
      const { data, error } = await supabase
        .from('syrok_article_blocks')
        .select('*')
        .eq('article_id', article.id)
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Error fetching blocks:', error)
      } else {
        setBlocks(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderBlock = (block: ArticleBlock) => {
    switch (block.block_type) {
      case 'text':
        return (
          <div key={block.id} className={styles.textBlock}>
            <div 
              className={styles.textContent}
              dangerouslySetInnerHTML={{ 
                __html: block.content?.replace(/\n/g, '<br>') || '' 
              }}
            />
          </div>
        )

      case 'image':
        return (
          <div key={block.id} className={styles.imageBlock}>
            {block.image_url && (
              <img 
                src={block.image_url} 
                alt={block.image_alt || ''} 
                className={styles.image}
              />
            )}
            {block.image_alt && (
              <p className={styles.imageCaption}>{block.image_alt}</p>
            )}
          </div>
        )

      case 'map':
        return (
          <div key={block.id} className={styles.mapBlock}>
            {block.map_embed && (
              <div 
                className={styles.mapContainer}
                dangerouslySetInnerHTML={{ __html: block.map_embed }}
              />
            )}
          </div>
        )

      case 'code':
        return (
          <div key={block.id} className={styles.codeBlock}>
            <pre className={styles.codeContent}>
              <code>{block.content}</code>
            </pre>
          </div>
        )

      case 'quote':
        return (
          <div key={block.id} className={styles.quoteBlock}>
            <blockquote className={styles.quoteContent}>
              {block.content}
            </blockquote>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading article...</p>
      </div>
    )
  }

  return (
    <div className={styles.articleViewer}>
      <div className={styles.articleHeader}>
        <h1 className={styles.articleTitle}>{article.title}</h1>
        {article.subtitle && (
          <h2 className={styles.articleSubtitle}>{article.subtitle}</h2>
        )}
        {article.excerpt && (
          <p className={styles.articleExcerpt}>{article.excerpt}</p>
        )}
      </div>

      <div className={styles.articleContent}>
        {blocks.length === 0 ? (
          <p className={styles.emptyContent}>No content available.</p>
        ) : (
          blocks.map(renderBlock)
        )}
      </div>
    </div>
  )
}

export default ArticleViewer