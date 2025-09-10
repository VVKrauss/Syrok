import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './ArticleEditor.module.css'

// Определяем тип локально для решения проблемы с кэшем
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

interface ArticleEditorProps {
  article?: Article
  onSave: (article: Article) => void
  onCancel: () => void
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ article, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    subtitle: article?.subtitle || '',
    slug: article?.slug || '',
    content: article?.content || '',
    excerpt: article?.excerpt || '',
    featured_image: article?.featured_image || '',
    type: article?.type || 'project',
    status: article?.status || 'draft',
    order_index: article?.order_index || 0,
    meta_title: article?.meta_title || '',
    meta_description: article?.meta_description || ''
  })

  const [uploading, setUploading] = useState(false)

  // Автоматически генерируем slug из заголовка
  useEffect(() => {
    if (!article && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.title, article])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('syrok-media')
        .upload(fileName, file)

      if (error) throw error

      setFormData(prev => ({ ...prev, featured_image: data.path }))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const insertContent = (type: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)

    let insertText = ''
    switch (type) {
      case 'heading':
        insertText = `## ${selectedText || 'Заголовок'}`
        break
      case 'bold':
        insertText = `**${selectedText || 'жирный текст'}**`
        break
      case 'italic':
        insertText = `*${selectedText || 'курсив'}*`
        break
      case 'link':
        insertText = `[${selectedText || 'текст ссылки'}](https://example.com)`
        break
      case 'image':
        insertText = `![alt text](https://example.com/image.jpg)`
        break
      case 'code':
        insertText = `\`${selectedText || 'код'}\``
        break
      case 'quote':
        insertText = `> ${selectedText || 'цитата'}`
        break
      case 'list':
        insertText = `- ${selectedText || 'элемент списка'}`
        break
      case 'map':
        insertText = `[Карта](https://maps.google.com/?q=latitude,longitude)`
        break
    }

    const newContent = textarea.value.substring(0, start) + insertText + textarea.value.substring(end)
    setFormData(prev => ({ ...prev, content: newContent }))
    
    // Устанавливаем курсор после вставленного текста
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + insertText.length, start + insertText.length)
    }, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const articleData: Omit<Article, 'id' | 'created_at' | 'updated_at'> = {
      ...formData,
      slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-')
    }

    onSave(articleData as Article)
  }

  return (
    <div className={styles.editor}>
      <form onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h2>{article ? 'Редактировать статью' : 'Создать статью'}</h2>
          <div className={styles.actions}>
            <button type="button" onClick={onCancel} className={styles.cancelButton}>
              Отмена
            </button>
            <button type="submit" className={styles.saveButton}>
              Сохранить
            </button>
          </div>
        </div>

        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="title">Заголовок *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="slug">URL (slug) *</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="subtitle">Подзаголовок</label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="type">Тип</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="project">Проект</option>
                <option value="research">Исследование</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="excerpt">Краткое описание</label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows={3}
              placeholder="Краткое описание статьи для превью..."
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="featured_image">Главное изображение</label>
            <input
              type="file"
              id="featured_image"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {uploading && <p>Загрузка...</p>}
            {formData.featured_image && (
              <p>Текущее изображение: {formData.featured_image}</p>
            )}
          </div>

          <div className={styles.field}>
            <label>Содержание статьи</label>
            <div className={styles.toolbar}>
              <button type="button" onClick={() => insertContent('heading')}>H2</button>
              <button type="button" onClick={() => insertContent('bold')}>B</button>
              <button type="button" onClick={() => insertContent('italic')}>I</button>
              <button type="button" onClick={() => insertContent('link')}>Link</button>
              <button type="button" onClick={() => insertContent('image')}>Image</button>
              <button type="button" onClick={() => insertContent('code')}>Code</button>
              <button type="button" onClick={() => insertContent('quote')}>Quote</button>
              <button type="button" onClick={() => insertContent('list')}>List</button>
              <button type="button" onClick={() => insertContent('map')}>Map</button>
            </div>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={20}
              placeholder="Напишите статью используя Markdown разметку..."
              className={styles.contentEditor}
            />
            <div className={styles.markdownHelp}>
              <h4>Markdown разметка:</h4>
              <ul>
                <li><code>## Заголовок</code> - заголовок второго уровня</li>
                <li><code>**жирный**</code> - жирный текст</li>
                <li><code>*курсив*</code> - курсив</li>
                <li><code>[текст](url)</code> - ссылка</li>
                <li><code>![alt](url)</code> - изображение</li>
                <li><code>`код`</code> - код</li>
                <li><code>&gt; цитата</code> - цитата</li>
                <li><code>- элемент</code> - список</li>
              </ul>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="status">Статус</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="draft">Черновик</option>
                <option value="published">Опубликовано</option>
                <option value="archived">Архив</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="order_index">Порядок</label>
              <input
                type="number"
                id="order_index"
                name="order_index"
                value={formData.order_index}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="meta_title">SEO заголовок</label>
            <input
              type="text"
              id="meta_title"
              name="meta_title"
              value={formData.meta_title}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="meta_description">SEO описание</label>
            <textarea
              id="meta_description"
              name="meta_description"
              value={formData.meta_description}
              onChange={handleInputChange}
              rows={2}
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export default ArticleEditor
