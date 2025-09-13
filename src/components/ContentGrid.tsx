import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './ContentGrid.module.css'

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

interface ContentGridProps {
  type?: string
  title?: string
  subtitle?: string
  columns?: number
  items?: ContentItem[]
}

const ContentGrid: React.FC<ContentGridProps> = ({ type, title, subtitle, columns = 3, items: propItems }) => {
  const [items, setItems] = useState<ContentItem[]>(propItems || [])
  const [loading, setLoading] = useState(!propItems)

  useEffect(() => {
    if (propItems) {
      setItems(propItems)
      setLoading(false)
      return
    }

    if (type) {
      fetchItems()
    }
  }, [type, propItems])

  const fetchItems = async () => {
    if (!type) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('syrok_content_items')
        .select('*')
        .eq('type', type)
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Error fetching items:', error)
      } else {
        setItems(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.empty}>
        <p>Loading...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No items found.</p>
      </div>
    )
  }

  return (
    <div className={styles.contentGrid}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <div 
        className={styles.grid}
        style={{ 
          gridTemplateColumns: `repeat(${columns}, 1fr)` 
        }}
      >
        {items.map((item) => (
          <div key={item.id} className={styles.card}>
            {item.media_url && (
              <div className={styles.imageContainer}>
                <img
                  src={supabase.storage.from('syrok-media').getPublicUrl(item.media_url).data.publicUrl}
                  alt={item.title || 'Content image'}
                  className={styles.image}
                />
              </div>
            )}
            
            <div className={styles.cardContent}>
              {item.title && <h3>{item.title}</h3>}
              {item.subtitle && <h4>{item.subtitle}</h4>}
              {item.description && (
                <p className={styles.description}>{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ContentGrid