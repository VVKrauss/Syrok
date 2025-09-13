import React, { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import styles from './ArticleBlock.module.css'

interface ArticleBlockProps {
  block: {
    id: string
    block_type: 'text' | 'image' | 'map' | 'code' | 'quote'
    content?: string
    image_url?: string
    image_alt?: string
    map_embed?: string
    order_index: number
  }
  onUpdate: (blockId: string, updates: any) => void
  onDelete: (blockId: string) => void
  onMoveUp: (blockId: string) => void
  onMoveDown: (blockId: string) => void
}

const ArticleBlock: React.FC<ArticleBlockProps> = ({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false) // eslint-disable-line @typescript-eslint/no-unused-vars
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Автоматически переходим в режим редактирования для текстовых блоков
  useEffect(() => {
    if (block.block_type === 'text' && !block.content) {
      setIsEditing(true)
    }
  }, [block.block_type, block.content])

  // Функция сохранения - вызывается только при нажатии "Сохранить"
  const handleSave = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const content = textarea.value
    onUpdate(block.id, { content })
    setIsEditing(false)
  }, [block.id, onUpdate])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `article-images/${fileName}`

      // Временная заглушка для тестирования без Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
      if (supabaseUrl === 'https://placeholder.supabase.co') {
        console.log('Using placeholder Supabase - creating mock image URL')
        const mockUrl = `https://via.placeholder.com/600x400/6c757d/ffffff?text=${encodeURIComponent(file.name)}`
        onUpdate(block.id, { image_url: mockUrl })
        setUploading(false)
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

      onUpdate(block.id, { image_url: data.publicUrl })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Ошибка загрузки изображения: ' + error)
    } finally {
      setUploading(false)
    }
  }

  const handleTextSelection = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = textarea.value.substring(start, end)
    
    if (selected.trim()) {
      setSelectedText(selected)
      setShowLinkDialog(true)
    }
  }, [])

  const handleAddLink = useCallback(() => {
    if (!selectedText || !linkUrl) return

    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = textarea.value.substring(0, start)
    const after = textarea.value.substring(end)
    
    const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${selectedText}</a>`
    const newContent = before + linkHtml + after
    
    // Обновляем значение textarea напрямую - БЕЗ сохранения
    textarea.value = newContent
    
    setShowLinkDialog(false)
    setLinkUrl('')
    setSelectedText('')
  }, [selectedText, linkUrl])

  const renderBlockContent = () => {
    switch (block.block_type) {
      case 'text':
        return isEditing ? (
          <div className={styles.textEditor}>
            <textarea
              ref={textareaRef}
              defaultValue={block.content || ''}
              className={styles.textEditor}
              placeholder="Введите текст... Выделите текст и нажмите правую кнопку мыши для добавления ссылки"
              onContextMenu={(e) => {
                e.preventDefault()
                handleTextSelection()
              }}
            />
            <div className={styles.textEditorActions}>
              <button
                onClick={handleSave}
                className={styles.saveButton}
              >
                Сохранить
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.textContent}>
            {block.content ? (
              <div 
                className={styles.textDisplay}
                dangerouslySetInnerHTML={{ __html: block.content.replace(/\n/g, '<br>') }}
                onClick={() => setIsEditing(true)}
              />
            ) : (
              <div 
                className={styles.textPlaceholder}
                onClick={() => setIsEditing(true)}
              >
                Нажмите чтобы добавить текст
              </div>
            )}
          </div>
        )

      case 'image':
        return (
          <div className={styles.imageBlock}>
            {block.image_url ? (
              <div className={styles.imageContainer}>
                <img src={block.image_url} alt={block.image_alt || ''} className={styles.image} />
                {isEditing && (
                  <div className={styles.imageOverlay}>
                    <div className={styles.imageControls}>
                      <input
                        type="text"
                        value={block.image_url || ''}
                        onChange={(e) => onUpdate(block.id, { image_url: e.target.value })}
                        placeholder="URL изображения"
                        className={styles.urlInput}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className={styles.fileInput}
                        id={`image-${block.id}`}
                      />
                      <label htmlFor={`image-${block.id}`} className={styles.uploadButton}>
                        Загрузить файл
                      </label>
                      <input
                        type="text"
                        value={block.image_alt || ''}
                        onChange={(e) => onUpdate(block.id, { image_alt: e.target.value })}
                        placeholder="Alt текст для изображения"
                        className={styles.altInput}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.imagePlaceholder}>
                <div className={styles.imageControls}>
                  <input
                    type="text"
                    value={block.image_url || ''}
                    onChange={(e) => onUpdate(block.id, { image_url: e.target.value })}
                    placeholder="URL изображения"
                    className={styles.urlInput}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                    id={`image-${block.id}`}
                  />
                  <label htmlFor={`image-${block.id}`} className={styles.uploadButton}>
                    {uploading ? 'Загрузка...' : 'Загрузить файл'}
                  </label>
                </div>
              </div>
            )}
          </div>
        )

      case 'map':
        return isEditing ? (
          <div className={styles.mapEditor}>
            <textarea
              value={block.map_embed || ''}
              onChange={(e) => onUpdate(block.id, { map_embed: e.target.value })}
              placeholder="Вставьте HTML код карты (iframe)..."
              className={styles.mapCode}
            />
          </div>
        ) : (
          <div className={styles.mapContainer}>
            {block.map_embed ? (
              <div dangerouslySetInnerHTML={{ __html: block.map_embed }} />
            ) : (
              <div 
                className={styles.mapPlaceholder}
                onClick={() => setIsEditing(true)}
              >
                Нажмите чтобы добавить карту
              </div>
            )}
          </div>
        )

      case 'code':
        return isEditing ? (
          <textarea
            value={block.content || ''}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            className={styles.codeEditor}
            placeholder="Введите код..."
          />
        ) : (
          <div className={styles.codeContent}>
            <pre><code>{block.content || 'Нажмите чтобы добавить код'}</code></pre>
          </div>
        )

      case 'quote':
        return isEditing ? (
          <textarea
            value={block.content || ''}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            className={styles.quoteEditor}
            placeholder="Введите цитату..."
          />
        ) : (
          <div className={styles.quoteContent}>
            <blockquote>
              {block.content || 'Нажмите чтобы добавить цитату'}
            </blockquote>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={styles.block}>
      <div className={styles.blockHeader}>
        <div className={styles.blockType}>
          {block.block_type === 'text' && '📝 Текст'}
          {block.block_type === 'image' && '🖼️ Изображение'}
          {block.block_type === 'map' && '🗺️ Карта'}
          {block.block_type === 'code' && '💻 Код'}
          {block.block_type === 'quote' && '💬 Цитата'}
        </div>
        <div className={styles.blockActions}>
          {block.block_type !== 'text' && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={styles.editButton}
            >
              {isEditing ? 'Сохранить' : 'Редактировать'}
            </button>
          )}
          <button
            onClick={() => onMoveUp(block.id)}
            className={styles.moveButton}
            title="Переместить вверх"
          >
            ↑
          </button>
          <button
            onClick={() => onMoveDown(block.id)}
            className={styles.moveButton}
            title="Переместить вниз"
          >
            ↓
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className={styles.deleteButton}
            title="Удалить блок"
          >
            ✕
          </button>
        </div>
      </div>
      <div className={styles.blockContent}>
        {renderBlockContent()}
      </div>

      {/* Диалог добавления ссылки */}
      {showLinkDialog && (
        <div className={styles.linkDialog}>
          <div className={styles.linkDialogContent}>
            <h3>Добавить ссылку</h3>
            <p>Выделенный текст: <strong>"{selectedText}"</strong></p>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Введите URL ссылки"
              className={styles.linkInput}
            />
            <div className={styles.linkDialogActions}>
              <button onClick={handleAddLink} className={styles.addLinkButton}>
                Добавить ссылку
              </button>
              <button 
                onClick={() => {
                  setShowLinkDialog(false)
                  setLinkUrl('')
                  setSelectedText('')
                }} 
                className={styles.cancelButton}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(ArticleBlock)