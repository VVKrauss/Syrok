import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import ContentManager from '../components/ContentManager'
import BlockArticleEditor from '../components/BlockArticleEditor'
import CVSectionManager from '../components/CVSectionManager'
import styles from './Admin.module.css'

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

const Admin: React.FC = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [items, setItems] = useState<ContentItem[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [showArticleEditor, setShowArticleEditor] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      // Получаем обычные элементы контента
      const { data: itemsData, error: itemsError } = await supabase
        .from('syrok_content_items')
        .select('*')
        .order('type', { ascending: true })
        .order('order_index', { ascending: true })

      if (itemsError) {
        console.error('Error fetching items:', itemsError)
      }

      // Получаем статьи
      const { data: articlesData, error: articlesError } = await supabase
        .from('syrok_articles')
        .select('*')
        .order('type', { ascending: true })
        .order('order_index', { ascending: true })

      if (articlesError) {
        console.error('Error fetching articles:', articlesError)
      }

      setItems(itemsData || [])
      setArticles(articlesData || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getItemCountByType = (type: ContentItem['type']) => {
    return items.filter(item => item.type === type).length
  }

  const getArticleCountByType = (type: 'project' | 'research') => {
    return articles.filter(article => article.type === type).length
  }

  const handleCreateNewArticle = async () => {
    try {
      const articleData = {
        title: '',
        subtitle: '',
        slug: `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        excerpt: '',
        featured_image: '',
        type: 'project' as 'project' | 'research',
        status: 'draft' as 'draft' | 'published' | 'archived',
        order_index: 0,
        meta_title: '',
        meta_description: ''
      }

      const { data, error } = await supabase
        .from('syrok_articles')
        .insert([articleData])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setEditingArticle(data[0])
        setShowArticleEditor(true)
        console.log('Article created:', data[0])
      }
    } catch (error) {
      console.error('Error creating article:', error)
      alert('Error creating article')
    }
  }

  const handleArticleSave = async (articleData: Article) => {
    try {
      // Update existing article (article always exists now)
      const { error } = await supabase
        .from('syrok_articles')
        .update(articleData)
        .eq('id', editingArticle!.id)

      if (error) throw error

      fetchAllData()
      setEditingArticle(null)
      setShowArticleEditor(false)
    } catch (error) {
      console.error('Error saving article:', error)
      alert('Error saving article')
    }
  }

  const handleArticleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      const { error } = await supabase
        .from('syrok_articles')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchAllData()
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Error deleting article')
    }
  }

  const startEditArticle = (article: Article) => {
    setEditingArticle(article)
    setShowArticleEditor(true)
  }

  const cancelArticleEdit = () => {
    setEditingArticle(null)
    setShowArticleEditor(false)
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'cv', label: 'CV' },
    { id: 'cv-sections', label: 'CV Sections' },
    { id: 'articles', label: 'Articles' },
    { id: 'project', label: 'Projects' },
    { id: 'research', label: 'Research' },
    { id: 'training', label: 'Training' },
    { id: 'volunteer', label: 'Volunteer' },
    { id: 'hobby', label: 'Hobbies' },
    { id: 'contact', label: 'Contact' },
    { id: 'about', label: 'About' },
  ]

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading admin panel...</p>
      </div>
    )
  }

  return (
    <div className={styles.admin}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Admin Panel</h1>
          <div className={styles.userInfo}>
            <span>Welcome, {user?.email}</span>
            <button onClick={handleSignOut} className={styles.signOutButton}>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <nav className={styles.nav}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.navButton} ${
                  activeTab === tab.id ? styles.active : ''
                }`}
              >
                {tab.label}
                {tab.id === 'articles' && (
                  <span className={styles.count}>
                    {articles.length}
                  </span>
                )}
                {tab.id === 'cv-sections' && (
                  <span className={styles.count}>
                    CV
                  </span>
                )}
                {tab.id !== 'overview' && tab.id !== 'articles' && tab.id !== 'cv-sections' && (
                  <span className={styles.count}>
                    {getItemCountByType(tab.id as ContentItem['type'])}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className={styles.main}>
          {activeTab === 'overview' && (
            <div className={styles.overview}>
              <h2>Content Overview</h2>
              <div className={styles.stats}>
                <div className={styles.statCard}>
                  <h3>Articles</h3>
                  <p className={styles.count}>
                    {articles.length} articles
                  </p>
                  <p className={styles.subCount}>
                    Projects: {getArticleCountByType('project')}, Research: {getArticleCountByType('research')}
                  </p>
                </div>
                {tabs.slice(4).map((tab) => (
                  <div key={tab.id} className={styles.statCard}>
                    <h3>{tab.label}</h3>
                    <p className={styles.count}>
                      {getItemCountByType(tab.id as ContentItem['type'])} items
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'cv-sections' && (
            <CVSectionManager />
          )}

          {activeTab === 'articles' && (
            <div className={styles.articlesManager}>
              <div className={styles.articlesHeader}>
                <h2>Articles Management</h2>
                <button
                  onClick={handleCreateNewArticle}
                  className={styles.addButton}
                >
                  Add Article
                </button>
              </div>

              {showArticleEditor && (
                <BlockArticleEditor
                  article={editingArticle || undefined}
                  onSave={handleArticleSave}
                  onCancel={cancelArticleEdit}
                />
              )}

              <div className={styles.articlesList}>
                {articles.length === 0 ? (
                  <p className={styles.empty}>No articles found. Create your first article!</p>
                ) : (
                  articles.map((article) => (
                    <div key={article.id} className={styles.articleCard}>
                      <div className={styles.articleInfo}>
                        <h4>{article.title}</h4>
                        <p className={styles.articleMeta}>
                          {article.type} • {article.status} • Order: {article.order_index}
                        </p>
                        {article.excerpt && (
                          <p className={styles.articleExcerpt}>{article.excerpt}</p>
                        )}
                      </div>
                      <div className={styles.articleActions}>
                        <button
                          onClick={() => startEditArticle(article)}
                          className={styles.editButton}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleArticleDelete(article.id)}
                          className={styles.deleteButton}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'cv-sections' && activeTab !== 'articles' && (
            <ContentManager type={activeTab as ContentItem['type']} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Admin
