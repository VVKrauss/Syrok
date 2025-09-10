import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'
import styles from './CV.module.css'

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

interface CVSection {
  id: string
  section_type: 'header' | 'experience' | 'education' | 'skills' | 'projects' | 'languages' | 'certifications' | 'achievements'
  title?: string
  subtitle?: string
  content?: string
  start_date?: string
  end_date?: string
  current: boolean
  order_index: number
  created_at: string
  updated_at: string
}

const CV: React.FC = () => {
  const [cvData, setCvData] = useState<ContentItem | null>(null)
  const [cvSections, setCvSections] = useState<CVSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCVData()
  }, [])

  const fetchCVData = async () => {
    try {
      // Получаем основную информацию о CV
      const { data: cvData, error: cvError } = await supabase
        .from('syrok_content_items')
        .select('*')
        .eq('type', 'cv')
        .single()

      if (cvError) {
        console.error('Error fetching CV:', cvError)
      }

      // Получаем секции CV
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('syrok_cv_sections')
        .select('*')
        .order('order_index', { ascending: true })

      if (sectionsError) {
        console.error('Error fetching CV sections:', sectionsError)
      }

      setCvData(cvData)
      setCvSections(sectionsData || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (cvData?.media_url) {
      try {
        const { data } = await supabase.storage
          .from('syrok-cv-files')
          .download(cvData.media_url)
        
        if (data) {
          const url = URL.createObjectURL(data)
          const link = document.createElement('a')
          link.href = url
          link.download = 'CV.pdf'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      } catch (error) {
        console.error('Error downloading CV:', error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long'
    })
  }

  const renderSection = (section: CVSection) => {
    switch (section.section_type) {
      case 'header':
        return (
          <div key={section.id} className={styles.headerSection}>
            <h1>{section.title || 'Curriculum Vitae'}</h1>
            {section.subtitle && <h2>{section.subtitle}</h2>}
            {section.content && <p className={styles.headerDescription}>{section.content}</p>}
          </div>
        )

      case 'experience':
      case 'education':
        return (
          <div key={section.id} className={styles.timelineSection}>
            <div className={styles.sectionHeader}>
              <h3>{section.title}</h3>
              <div className={styles.dateRange}>
                {section.start_date && formatDate(section.start_date)}
                {section.end_date && ` - ${formatDate(section.end_date)}`}
                {section.current && ' - Present'}
              </div>
            </div>
            {section.subtitle && <h4 className={styles.subtitle}>{section.subtitle}</h4>}
            {section.content && <p className={styles.content}>{section.content}</p>}
          </div>
        )

      case 'skills':
        return (
          <div key={section.id} className={styles.skillsSection}>
            <h3>{section.title || 'Skills'}</h3>
            {section.content && (
              <div className={styles.skillsList}>
                {section.content.split(',').map((skill, index) => (
                  <span key={index} className={styles.skillTag}>
                    {skill.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        )

      case 'projects':
      case 'certifications':
      case 'achievements':
        return (
          <div key={section.id} className={styles.itemSection}>
            <h3>{section.title}</h3>
            {section.subtitle && <h4 className={styles.subtitle}>{section.subtitle}</h4>}
            {section.content && <p className={styles.content}>{section.content}</p>}
          </div>
        )

      case 'languages':
        return (
          <div key={section.id} className={styles.languagesSection}>
            <h3>{section.title || 'Languages'}</h3>
            {section.content && (
              <div className={styles.languagesList}>
                {section.content.split('\n').map((language, index) => (
                  <div key={index} className={styles.languageItem}>
                    {language}
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      default:
        return (
          <div key={section.id} className={styles.genericSection}>
            <h3>{section.title}</h3>
            {section.subtitle && <h4 className={styles.subtitle}>{section.subtitle}</h4>}
            {section.content && <p className={styles.content}>{section.content}</p>}
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading CV...</p>
      </div>
    )
  }

  return (
    <>
      <SEO 
        title="CV"
        description="Download and view my professional resume. Comprehensive overview of my experience, skills, and achievements."
        keywords="CV, resume, professional experience, skills, achievements"
      />
      <div className={styles.cv}>
        <div className={styles.container}>
          {/* PDF Preview Section */}
          {cvData?.media_url && (
            <div className={styles.pdfSection}>
              <div className={styles.pdfHeader}>
                <h1>PDF Resume</h1>
                <button onClick={handleDownload} className={styles.downloadButton}>
                  📄 Download CV (PDF)
                </button>
              </div>
              <div className={styles.pdfContainer}>
                <iframe
                  src={`${supabase.storage.from('syrok-cv-files').getPublicUrl(cvData.media_url).data.publicUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className={styles.pdfViewer}
                  title="CV Preview"
                />
              </div>
            </div>
          )}

          {/* CV Sections */}
          {cvSections.length > 0 && (
            <div className={styles.sectionsContainer}>
              <div className={styles.sectionsHeader}>
                <h1>Detailed CV</h1>
                <p>Comprehensive overview of my professional background</p>
              </div>
              <div className={styles.sections}>
                {cvSections.map(renderSection)}
              </div>
            </div>
          )}

          {/* Fallback if no CV data */}
          {!cvData && cvSections.length === 0 && (
            <div className={styles.error}>
              <h2>CV not found</h2>
              <p>Please contact the administrator to upload the CV.</p>
            </div>
          )}

          {/* CV Description */}
          {cvData?.description && (
            <div className={styles.description}>
              <h2>About This CV</h2>
              <p>{cvData.description}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CV