import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './ContentManager.module.css'

// Определяем тип локально для решения проблемы с кэшем
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

interface ContentManagerProps {
  type: ContentItem['type']
}

const ContentManager: React.FC<ContentManagerProps> = ({ type }) => {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [type])

  const fetchItems = async () => {
    try {
        const { data, error } = await supabase
          .from('syrok_content_items')
          .select('*')
          .eq('type', type)
          .order('order_index', { ascending: true })

      if (error) {
        console.error(`Error fetching ${type}:`, error)
      } else {
        setItems(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from('syrok_content_items')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting item:', error)
        alert('Error deleting item')
      } else {
        fetchItems()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting item')
    }
  }

  const handleUpload = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file)

      if (error) {
        console.error('Error uploading file:', error)
        throw error
      }

      return data.path
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const title = formData.get('title') as string
      const subtitle = formData.get('subtitle') as string
      const description = formData.get('description') as string
      const orderIndex = parseInt(formData.get('order_index') as string)
      const contactIcon = formData.get('contact_icon') as string
      const mediaFile = formData.get('media') as File

      let mediaUrl = editingItem?.media_url

      if (mediaFile && mediaFile.size > 0) {
        const bucket = type === 'cv' ? 'syrok-cv-files' : 'syrok-media'
        mediaUrl = await handleUpload(mediaFile, bucket)
      }

      const itemData = {
        type,
        title: title || null,
        subtitle: subtitle || null,
        description: description || null,
        media_url: mediaUrl || null,
        order_index: orderIndex,
        contact_icon: contactIcon || null,
      }

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('syrok_content_items')
          .update(itemData)
          .eq('id', editingItem.id)

        if (error) {
          console.error('Error updating item:', error)
          alert('Error updating item')
        } else {
          fetchItems()
          setEditingItem(null)
          setShowForm(false)
        }
      } else {
        // Create new item
        const { error } = await supabase
          .from('syrok_content_items')
          .insert(itemData)

        if (error) {
          console.error('Error creating item:', error)
          alert('Error creating item')
        } else {
          fetchItems()
          setShowForm(false)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving item')
    } finally {
      setUploading(false)
    }
  }

  const startEdit = (item: ContentItem) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading content...</p>
      </div>
    )
  }

  return (
    <div className={styles.contentManager}>
      <div className={styles.header}>
        <h2>Manage {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
        <button
          onClick={() => setShowForm(true)}
          className={styles.addButton}
        >
          Add New Item
        </button>
      </div>

      {showForm && (
        <div className={styles.formOverlay}>
          <div className={styles.form}>
            <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  defaultValue={editingItem?.title || ''}
                  required={type !== 'about'}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="subtitle">Subtitle</label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  defaultValue={editingItem?.subtitle || ''}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={editingItem?.description || ''}
                  required={type === 'about'}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="order_index">Order Index</label>
                <input
                  type="number"
                  id="order_index"
                  name="order_index"
                  defaultValue={editingItem?.order_index || 0}
                  min="0"
                />
              </div>

              {type === 'contact' && (
                <div className={styles.field}>
                  <label htmlFor="contact_icon">Contact Icon (emoji)</label>
                  <input
                    type="text"
                    id="contact_icon"
                    name="contact_icon"
                    defaultValue={editingItem?.contact_icon || ''}
                    placeholder="📧"
                  />
                </div>
              )}

              <div className={styles.field}>
                <label htmlFor="media">
                  {type === 'cv' ? 'CV File (PDF)' : 'Media File (Image)'}
                </label>
                <input
                  type="file"
                  id="media"
                  name="media"
                  accept={type === 'cv' ? '.pdf' : 'image/*'}
                />
                {editingItem?.media_url && (
                  <p className={styles.currentFile}>
                    Current file: {editingItem.media_url}
                  </p>
                )}
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className={styles.cancelButton}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={uploading}
                >
                  {uploading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.itemsList}>
        {items.length === 0 ? (
          <p className={styles.empty}>No items found. Add your first item!</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemContent}>
                <h4>{item.title || 'Untitled'}</h4>
                {item.subtitle && <p className={styles.subtitle}>{item.subtitle}</p>}
                {item.description && (
                  <p className={styles.description}>
                    {item.description.substring(0, 100)}
                    {item.description.length > 100 ? '...' : ''}
                  </p>
                )}
                <div className={styles.meta}>
                  <span>Order: {item.order_index}</span>
                  {item.media_url && <span>Has media</span>}
                  {item.contact_icon && <span>Icon: {item.contact_icon}</span>}
                </div>
              </div>
              <div className={styles.itemActions}>
                <button
                  onClick={() => startEdit(item)}
                  className={styles.editButton}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
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
  )
}

export default ContentManager
