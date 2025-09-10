import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import ArticleBlock from './ArticleBlock'
import styles from './BlockArticleEditor.module.css'

// Получаем URL Supabase для проверки
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'

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

interface BlockArticleEditorProps {
  article?: Article
  onSave: (article: Article) => void
  onCancel: () => void
}

const BlockArticleEditor: React.FC<BlockArticleEditorProps> = ({
  article,
  onSave,
  onCancel
}) => {
  const [loading, setLoading] = useState(false)
  const [blocks, setBlocks] = useState<ArticleBlock[]>([])
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null)
  const [isNewArticle, setIsNewArticle] = useState(false)
  
  // Используем refs для всех полей формы - НЕТ ререндеров
  const titleRef = useRef<HTMLInputElement>(null)
  const subtitleRef = useRef<HTMLInputElement>(null)
  const slugRef = useRef<HTMLInputElement>(null)
  const excerptRef = useRef<HTMLTextAreaElement>(null)
  const featuredImageRef = useRef<HTMLInputElement>(null)
  const typeRef = useRef<HTMLSelectElement>(null)
  const statusRef = useRef<HTMLSelectElement>(null)
  const metaTitleRef = useRef<HTMLInputElement>(null)
  const metaDescriptionRef = useRef<HTMLTextAreaElement>(null)

  const [showAddBlock, setShowAddBlock] = useState(false)

  useEffect(() => {
    if (article?.id) {
      setCurrentArticle(article)
      setIsNewArticle(false)
      fetchBlocks()
    } else {
      // Статья должна быть передана из Admin.tsx
      console.error('No article provided to BlockArticleEditor')
    }
  }, [article?.id])

  // Инициализируем refs значениями из currentArticle
  useEffect(() => {
    if (currentArticle) {
      if (titleRef.current) titleRef.current.value = currentArticle.title || ''
      if (subtitleRef.current) subtitleRef.current.value = currentArticle.subtitle || ''
      if (slugRef.current) slugRef.current.value = currentArticle.slug || ''
      if (excerptRef.current) excerptRef.current.value = currentArticle.excerpt || ''
      if (featuredImageRef.current) featuredImageRef.current.value = currentArticle.featured_image || ''
      if (typeRef.current) typeRef.current.value = currentArticle.type || 'project'
      if (statusRef.current) statusRef.current.value = currentArticle.status || 'draft'
      if (metaTitleRef.current) metaTitleRef.current.value = currentArticle.meta_title || ''
      if (metaDescriptionRef.current) metaDescriptionRef.current.value = currentArticle.meta_description || ''
    }
  }, [currentArticle])

  const fetchBlocks = async () => {
    if (!currentArticle?.id) return

    try {
      const { data, error } = await supabase
        .from('syrok_article_blocks')
        .select('*')
        .eq('article_id', currentArticle.id)
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Error fetching blocks:', error)
      } else {
        setBlocks(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleInputChange = useCallback((field: string, value: string) => {
    // НЕ обновляем состояние - используем refs
  }, [])

  const handleFeaturedImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `featured-images/${fileName}`

      // Временная заглушка для тестирования без Supabase
      if (supabaseUrl === 'https://placeholder.supabase.co') {
        console.log('Using placeholder Supabase - creating mock image URL')
        const mockUrl = `https://via.placeholder.com/800x400/6c757d/ffffff?text=${encodeURIComponent(file.name)}`
        if (featuredImageRef.current) {
          featuredImageRef.current.value = mockUrl
        }
        return
      }

      const { error: uploadError } = await supabase.storage
        .from('syrok-media')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('Ошибка загрузки изображения: ' + uploadError.message)
        return
      }

      const { data } = supabase.storage
        .from('syrok-media')
        .getPublicUrl(filePath)

      if (featuredImageRef.current) {
        featuredImageRef.current.value = data.publicUrl
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Ошибка загрузки изображения: ' + error)
    }
  }

  const addBlock = async (blockType: 'text' | 'image' | 'map' | 'code' | 'quote') => {
    console.log('Adding block:', blockType, 'for article:', currentArticle?.id)
    
    if (!currentArticle?.id) {
      console.error('No article ID available')
      return
    }

    // Временная заглушка для тестирования без Supabase
    if (supabaseUrl === 'https://placeholder.supabase.co') {
      console.log('Using placeholder Supabase - creating mock block')
      const mockBlock = {
        id: `mock-${Date.now()}`,
        article_id: currentArticle.id,
        block_type: blockType,
        content: '',
        order_index: blocks.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setBlocks(prev => [...prev, mockBlock])
      setShowAddBlock(false)
      return
    }

    try {
      const newBlock = {
        article_id: currentArticle.id,
        block_type: blockType,
        content: '',
        order_index: blocks.length
      }

      console.log('Creating block:', newBlock)

      const { data, error } = await supabase
        .from('syrok_article_blocks')
        .insert([newBlock])
        .select()

      if (error) {
        console.error('Error adding block:', error)
        alert('Ошибка при создании блока: ' + error.message)
      } else if (data) {
        console.log('Block created successfully:', data[0])
        setBlocks(prev => [...prev, data[0]])
        setShowAddBlock(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Ошибка при создании блока: ' + error)
    }
  }

  const updateBlock = useCallback(async (blockId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('syrok_article_blocks')
        .update(updates)
        .eq('id', blockId)

      if (error) {
        console.error('Error updating block:', error)
      } else {
        // Обновляем только локально, без ререндера
        setBlocks(prev => prev.map(block =>
          block.id === blockId ? { ...block, ...updates } : block
        ))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }, [])

  const deleteBlock = useCallback(async (blockId: string) => {
    try {
      const { error } = await supabase
        .from('syrok_article_blocks')
        .delete()
        .eq('id', blockId)

      if (error) {
        console.error('Error deleting block:', error)
      } else {
        setBlocks(prev => prev.filter(block => block.id !== blockId))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }, [])

  const moveBlock = useCallback(async (blockId: string, direction: 'up' | 'down') => {
    const blockIndex = blocks.findIndex(block => block.id === blockId)
    if (blockIndex === -1) return

    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1
    if (newIndex < 0 || newIndex >= blocks.length) return

    const newBlocks = [...blocks]
    const [movedBlock] = newBlocks.splice(blockIndex, 1)
    newBlocks.splice(newIndex, 0, movedBlock)

    // Update order_index for all blocks
    const updatedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order_index: index
    }))

    setBlocks(updatedBlocks)

    // Update in database
    try {
      for (const block of updatedBlocks) {
        await supabase
          .from('syrok_article_blocks')
          .update({ order_index: block.order_index })
          .eq('id', block.id)
      }
    } catch (error) {
      console.error('Error updating block order:', error)
    }
  }, [blocks])

  const handleCancel = async () => {
    // Если это новая статья, удаляем её при отмене
    if (isNewArticle && currentArticle?.id) {
      try {
        if (supabaseUrl !== 'https://placeholder.supabase.co') {
          // Удаляем все блоки статьи
          await supabase
            .from('syrok_article_blocks')
            .delete()
            .eq('article_id', currentArticle.id)
          
          // Удаляем саму статью
          await supabase
            .from('syrok_articles')
            .delete()
            .eq('id', currentArticle.id)
        }
        console.log('Article deleted on cancel')
      } catch (error) {
        console.error('Error deleting article:', error)
      }
    }
    onCancel()
  }

  const handleSave = async () => {
    if (!currentArticle?.id) return
    
    setLoading(true)
    try {
      // Читаем значения из refs - НЕТ ререндеров
      const articleData = {
        title: titleRef.current?.value || '',
        subtitle: subtitleRef.current?.value || '',
        slug: slugRef.current?.value || '',
        excerpt: excerptRef.current?.value || '',
        featured_image: featuredImageRef.current?.value || '',
        type: (typeRef.current?.value as 'project' | 'research') || 'project',
        status: (statusRef.current?.value as 'draft' | 'published' | 'archived') || 'draft',
        meta_title: metaTitleRef.current?.value || '',
        meta_description: metaDescriptionRef.current?.value || '',
        order_index: currentArticle.order_index
      }

      let savedArticle: Article

      // Временная заглушка для тестирования без Supabase
      if (supabaseUrl === 'https://placeholder.supabase.co') {
        console.log('Using placeholder Supabase - updating mock article')
        savedArticle = {
          ...currentArticle,
          ...articleData,
          updated_at: new Date().toISOString()
        }
        onSave(savedArticle)
        setLoading(false)
        return
      }

      // Update existing article
      const { data, error } = await supabase
        .from('syrok_articles')
        .update(articleData)
        .eq('id', currentArticle.id)
        .select()

      if (error) {
        console.error('Error updating article:', error)
        alert('Ошибка при сохранении статьи: ' + error.message)
        return
      }
      
      if (data && data.length > 0) {
        savedArticle = data[0]
        onSave(savedArticle)
      } else {
        alert('Статья не найдена для обновления')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <h2>{article ? 'Редактировать статью' : 'Создать статью'}</h2>
        <div className={styles.actions}>
          <button onClick={handleCancel} className={styles.cancelButton}>
            Отмена
          </button>
          <button 
            onClick={handleSave} 
            className={styles.saveButton}
            disabled={loading}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>

      <div className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>Заголовок *</label>
            <input
              ref={titleRef}
              type="text"
              defaultValue={currentArticle?.title || ''}
              placeholder="Заголовок статьи"
            />
          </div>
          <div className={styles.field}>
            <label>URL (slug) *</label>
            <input
              ref={slugRef}
              type="text"
              defaultValue={currentArticle?.slug || ''}
              placeholder="url-stati"
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Подзаголовок</label>
            <input
              ref={subtitleRef}
              type="text"
              defaultValue={currentArticle?.subtitle || ''}
              placeholder="Подзаголовок статьи"
            />
          </div>
          <div className={styles.field}>
            <label>Тип</label>
            <select
              ref={typeRef}
              defaultValue={currentArticle?.type || 'project'}
            >
              <option value="project">Проект</option>
              <option value="research">Исследование</option>
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label>Краткое описание</label>
          <textarea
            ref={excerptRef}
            defaultValue={currentArticle?.excerpt || ''}
            placeholder="Краткое описание статьи для превью..."
            rows={3}
          />
        </div>

        <div className={styles.field}>
          <label>Главное изображение</label>
          <div className={styles.imageUploadContainer}>
            <input
              ref={featuredImageRef}
              type="text"
              defaultValue={currentArticle?.featured_image || ''}
              placeholder="URL изображения или загрузите файл"
              className={styles.imageUrlInput}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFeaturedImageUpload}
              className={styles.fileInput}
              id="featured-image-upload"
            />
            <label htmlFor="featured-image-upload" className={styles.uploadButton}>
              Загрузить файл
            </label>
          </div>
          {featuredImageRef.current?.value && (
            <div className={styles.imagePreview}>
              <img src={featuredImageRef.current.value} alt="Preview" className={styles.previewImage} />
            </div>
          )}
        </div>

        <div className={styles.blocksSection}>
          <div className={styles.blocksHeader}>
            <h3>Блоки статьи</h3>
          </div>

          <div className={styles.blocks}>
            {blocks.length === 0 ? (
              <div className={styles.emptyBlocks}>
                <p>Нет блоков. Добавьте первый блок для начала создания статьи.</p>
              </div>
            ) : (
              blocks.map((block) => (
                <ArticleBlock
                  key={block.id}
                  block={block}
                  onUpdate={updateBlock}
                  onDelete={deleteBlock}
                  onMoveUp={(id) => moveBlock(id, 'up')}
                  onMoveDown={(id) => moveBlock(id, 'down')}
                />
              ))
            )}
          </div>

          {/* Кнопка "Добавить блок" теперь ниже всех блоков */}
          <div className={styles.addBlockContainer}>
            <button
              onClick={() => {
                console.log('Add block button clicked, current state:', showAddBlock)
                setShowAddBlock(!showAddBlock)
              }}
              className={styles.addBlockButton}
            >
              + Добавить блок
            </button>

            {showAddBlock && (
              <div className={styles.addBlockMenu}>
                <button 
                  onClick={() => {
                    console.log('Text block button clicked')
                    addBlock('text')
                  }} 
                  className={styles.blockTypeButton}
                >
                  📝 Текст
                </button>
                <button 
                  onClick={() => {
                    console.log('Image block button clicked')
                    addBlock('image')
                  }} 
                  className={styles.blockTypeButton}
                >
                  🖼️ Изображение
                </button>
                <button 
                  onClick={() => {
                    console.log('Map block button clicked')
                    addBlock('map')
                  }} 
                  className={styles.blockTypeButton}
                >
                  🗺️ Карта
                </button>
                <button 
                  onClick={() => {
                    console.log('Code block button clicked')
                    addBlock('code')
                  }} 
                  className={styles.blockTypeButton}
                >
                  💻 Код
                </button>
                <button 
                  onClick={() => {
                    console.log('Quote block button clicked')
                    addBlock('quote')
                  }} 
                  className={styles.blockTypeButton}
                >
                  💬 Цитата
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlockArticleEditor
