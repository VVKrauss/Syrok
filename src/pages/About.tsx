import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'
import styles from './About.module.css'

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

const About: React.FC = () => {
  const [aboutData, setAboutData] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const { data, error } = await supabase
          .from('syrok_content_items')
          .select('*')
          .eq('type', 'about')
          .single()

        if (error) {
          console.error('Error fetching about:', error)
        } else {
          setAboutData(data)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAbout()
  }, [])

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading about information...</p>
      </div>
    )
  }

  return (
    <>
      <SEO 
        title="About Me"
        description="Learn more about me, my background, and personal story. Discover what drives me and my professional journey."
        keywords="about, personal story, background, biography, professional journey"
      />
      <div className={styles.about}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>About Me</h1>
        </div>

        <div className={styles.content}>
          {aboutData?.media_url && (
            <div className={styles.imageContainer}>
              <img
                src={supabase.storage.from('syrok-media').getPublicUrl(aboutData.media_url).data.publicUrl}
                alt="Profile"
                className={styles.profileImage}
              />
            </div>
          )}
          
          <div className={styles.textContent}>
            {aboutData?.title && <h2>{aboutData.title}</h2>}
            {aboutData?.subtitle && <h3>{aboutData.subtitle}</h3>}
            {aboutData?.description && (
              <div className={styles.description}>
                {aboutData.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {!aboutData && (
          <div className={styles.empty}>
            <p>About information will be available soon.</p>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default About
