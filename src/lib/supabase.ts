import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Временно отключаем проверку для разработки
// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables')
// }

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Force reload - временный комментарий для обновления кэша

// Типы для таблицы syrok_content_items
export interface ContentItem {
  id: string
  type: 'cv' | 'project' | 'research' | 'training' | 'volunteer' | 'hobby' | 'contact' | 'about'
  title?: string
  subtitle?: string
  description?: string
  media_url?: string
  order_index: number
  contact_icon?: string
  created_at: string
  updated_at: string
}

// Типы для таблицы syrok_articles
export interface Article {
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

// Типы для таблицы syrok_article_blocks
export interface ArticleBlock {
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

// Типы для таблицы syrok_cv_sections
export interface CVSection {
  id: string
  section_type: 'header' | 'experience' | 'education' | 'skills' | 'projects' | 'languages' | 'certifications' | 'achievements'
  title?: string
  subtitle?: string
  content?: string
  start_date?: string
  end_date?: string
  current: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      syrok_content_items: {
        Row: ContentItem
        Insert: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>>
      }
      syrok_articles: {
        Row: Article
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Article, 'id' | 'created_at' | 'updated_at'>>
      }
      syrok_article_blocks: {
        Row: ArticleBlock
        Insert: Omit<ArticleBlock, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ArticleBlock, 'id' | 'created_at' | 'updated_at'>>
      }
      syrok_cv_sections: {
        Row: CVSection
        Insert: Omit<CVSection, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CVSection, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}