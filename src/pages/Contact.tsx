import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'
import styles from './Contact.module.css'

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

const Contact: React.FC = () => {
  const [contacts, setContacts] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data, error } = await supabase
          .from('syrok_content_items')
          .select('*')
          .eq('type', 'contact')
          .order('order_index', { ascending: true })

        if (error) {
          console.error('Error fetching contacts:', error)
        } else {
          setContacts(data || [])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading contact information...</p>
      </div>
    )
  }

  return (
    <>
      <SEO 
        title="Contact"
        description="Get in touch with me through various channels. Find my contact information and preferred communication methods."
        keywords="contact, get in touch, email, phone, social media, communication"
      />
      <div className={styles.contact}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Contact Me</h1>
          <p>Get in touch with me through any of these channels</p>
        </div>

        <div className={styles.contactList}>
          {contacts.map((contact) => (
            <div key={contact.id} className={styles.contactItem}>
              <div className={styles.icon}>
                {contact.contact_icon && (
                  <span className={styles.iconText}>{contact.contact_icon}</span>
                )}
              </div>
              <div className={styles.contactInfo}>
                <h3>{contact.title}</h3>
                {contact.subtitle && <p className={styles.subtitle}>{contact.subtitle}</p>}
                {contact.description && <p className={styles.description}>{contact.description}</p>}
              </div>
            </div>
          ))}
        </div>

        {contacts.length === 0 && (
          <div className={styles.empty}>
            <p>Contact information will be available soon.</p>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default Contact
