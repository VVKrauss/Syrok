import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'
import ContentGrid from '../components/ContentGrid'
import ArticleViewer from '../components/ArticleViewer'

// Определяем типы локально для решения проблемы с кэшем
interface ContentItem {
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

interface Article {
  id: string
  title: string
  subtitle?: string
  slug: string
  content: string
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

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ContentItem[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'articles'>('grid')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Получаем обычные проекты
      const { data: projectsData, error: projectsError } = await supabase
        .from('syrok_content_items')
        .select('*')
        .eq('type', 'project')
        .order('order_index', { ascending: true })

      if (projectsError) {
        console.error('Error fetching projects:', projectsError)
      }

      // Получаем статьи проектов
      const { data: articlesData, error: articlesError } = await supabase
        .from('syrok_articles')
        .select('*')
        .eq('type', 'project')
        .order('order_index', { ascending: true })

      if (articlesError) {
        console.error('Error fetching project articles:', articlesError)
      }

      setProjects(projectsData || [])
      setArticles(articlesData || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'white' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255, 255, 255, 0.3)', borderTop: '4px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
        <p>Loading projects...</p>
      </div>
    )
  }

  return (
    <>
      <SEO 
        title="Projects"
        description="Explore my portfolio of projects and technical achievements. From web applications to innovative solutions."
        keywords="projects, portfolio, web development, applications, technical achievements"
      />
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', padding: '2rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem', color: '#495057' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 300, marginBottom: '1rem', fontFamily: "'Playfair Display', serif", color: '#343a40' }}>Projects</h1>
            <p style={{ fontSize: '1.25rem', fontWeight: 300, marginBottom: '2rem', color: '#6c757d' }}>My portfolio of technical projects and achievements</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.8)', padding: '0.5rem', borderRadius: '0.75rem', backdropFilter: 'blur(10px)', maxWidth: '300px', margin: '0 auto', border: '1px solid #e9ecef' }}>
              <button 
                style={{ 
                  background: viewMode === 'grid' ? '#6c757d' : 'transparent', 
                  color: viewMode === 'grid' ? 'white' : '#6c757d', 
                  border: 'none', 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '0.5rem', 
                  fontWeight: 400, 
                  cursor: 'pointer', 
                  transition: 'all 0.2s', 
                  flex: 1,
                  boxShadow: viewMode === 'grid' ? '0 2px 4px rgba(108, 117, 125, 0.3)' : 'none'
                }}
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </button>
              <button 
                style={{ 
                  background: viewMode === 'articles' ? '#6c757d' : 'transparent', 
                  color: viewMode === 'articles' ? 'white' : '#6c757d', 
                  border: 'none', 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '0.5rem', 
                  fontWeight: 400, 
                  cursor: 'pointer', 
                  transition: 'all 0.2s', 
                  flex: 1,
                  boxShadow: viewMode === 'articles' ? '0 2px 4px rgba(108, 117, 125, 0.3)' : 'none'
                }}
                onClick={() => setViewMode('articles')}
              >
                Articles View
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <ContentGrid items={projects} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {articles.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'white', padding: '3rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '1rem', backdropFilter: 'blur(10px)' }}>
                  <p style={{ margin: '0.5rem 0', opacity: 0.8 }}>No project articles found.</p>
                  <p style={{ margin: '0.5rem 0', opacity: 0.8 }}>Articles will appear here when published.</p>
                </div>
              ) : (
                articles.map((article) => (
                  <ArticleViewer key={article.id} article={article} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Projects
