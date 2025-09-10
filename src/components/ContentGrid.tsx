import React from 'react'
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
  items: ContentItem[]
}

const ContentGrid: React.FC<ContentGridProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No items found.</p>
      </div>
    )
  }

  return (
    <div className={styles.contentGrid}>
      <div 
        className={styles.grid}
        style={{ 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' 
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